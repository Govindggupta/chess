import { Square, PieceSymbol, Color } from 'chess.js'; // Importing types for the chessboard and pieces
import { useState, useEffect } from 'react'; // Importing hooks to manage state and side effects
import { useDrag, useDrop } from 'react-dnd'; // Importing drag-and-drop hooks to handle piece movement
import { motion } from 'framer-motion'; // Importing animation library to add animations to pieces
import { MOVE } from '../screens/Game'; // Importing the MOVE action type to communicate moves

// ChessBoard component: The main board where everything happens
const ChessBoard: React.FC<{
    board: ( { square: Square; type: PieceSymbol; color: Color; } | null)[][]; // The board with pieces
    socket: WebSocket | null; // WebSocket for real-time updates
    setBoard: any; // Function to update the board state
    chess: any; // Chess instance to handle moves
    myColor: Color; // The color of the player's pieces (white or black)
}> = ({ board, socket, setBoard, chess, myColor }) => {
    const [from, setFrom] = useState<null | Square>(null); // State to track the selected piece (starting point)
    const [isFlipped, setIsFlipped] = useState(false); // State to track if the board should be flipped for black pieces

    // Flip the board if the player's color is black
    useEffect(() => {
        if (myColor === "b") {
            setIsFlipped(true); // Flip the board for black pieces
        }
    }, [myColor]);

    return (
        <div className="relative">
            <div className="grid grid-cols-8">
                {/* Loop through each row and square to render the board */}
                {board.map((row, i) =>
                    row.map((square, j) => {
                        // Determine the square name (like a1, h8, etc.)
                        const squareRepresentation = String.fromCharCode(97 + (j % 8)) + '' + (8 - i) as Square;

                        // Handle the drop functionality for moving pieces
                        const [{ isOver }, dropRef] = useDrop(() => ({
                            accept: 'CHESS_PIECE', // Accept only chess pieces
                            drop: (item: { from: Square }) => {
                                handleMove(item.from, squareRepresentation); // When a piece is dropped, move it
                            },
                            collect: (monitor) => ({
                                isOver: !!monitor.isOver(), // Check if the drop area is being hovered
                            }),
                        }));

                        // Function to handle moving the piece from one square to another
                        const handleMove = (fromSquare: Square, toSquare: Square) => {
                            if (fromSquare && toSquare) {
                                // Send move data to the server via WebSocket
                                socket?.send(
                                    JSON.stringify({
                                        type: MOVE,
                                        payload: {
                                            move: { from: fromSquare, to: toSquare },
                                        },
                                    })
                                );
                                // Update the chess instance to reflect the move
                                chess.move({ from: fromSquare, to: toSquare });
                                // Update the board display after the move
                                setBoard(chess.board());
                                setFrom(null); // Reset the selected starting square
                            }
                        };

                        // Determine if the current square is dark or light
                        const isDarkSquare = (i + j) % 2 === 0;
                        const blockColor = isDarkSquare ? '#739552' : '#ebecd0'; // Set colors for dark/light squares
                        const textColor = isDarkSquare ? '#ebecd0' : '#739552'; // Set text color for rank and file labels

                        return (
                            <div
                                key={`${i}-${j}`}
                                ref={dropRef} // Link drop functionality to the square
                                onClick={() => {
                                    if (!from) {
                                        setFrom(squareRepresentation); // Set the selected square if no piece is selected
                                    } else {
                                        handleMove(from, squareRepresentation); // Move the piece to the new square
                                    }
                                }}
                                className={`relative w-12 h-12 flex items-center justify-center`} 
                                style={{ backgroundColor: blockColor }} // Apply background color
                            >
                                {/* Display the piece (if there is one) on the square */}
                                {square ? (
                                    <ChessPiece
                                        square={square} // Pass the piece data (type, color) to ChessPiece component
                                        from={squareRepresentation}
                                        setFrom={setFrom}
                                    />
                                ) : null}

                                {/* Display rank (numbers) for white pieces */}
                                {!isFlipped && j === 0 && (
                                    <span
                                        className="absolute top-1 left-1 text-xs font-bold"
                                        style={{ color: textColor }}
                                    >
                                        {8 - i} {/* Ranks: 1 to 8 */}
                                    </span>
                                )}
                                {/* Display file (letters) for white pieces */}
                                {!isFlipped && i === 7 && (
                                    <span
                                        className="absolute bottom-1 right-1 text-xs font-bold"
                                        style={{ color: textColor }}
                                    >
                                        {String.fromCharCode(97 + j)} {/* Files: a to h */}
                                    </span>
                                )}

                                {/* Display rank (numbers) for black pieces */}
                                {isFlipped && j === 0 && (
                                    <span
                                        className="absolute top-1 left-1 text-xs font-bold"
                                        style={{ color: textColor }}
                                    >
                                        {i + 1} {/* Ranks: 1 to 8 */}
                                    </span>
                                )}
                                {/* Display file (letters) for black pieces */}
                                {isFlipped && i === 7 && (
                                    <span
                                        className="absolute bottom-1 right-1 text-xs font-bold"
                                        style={{ color: textColor }}
                                    >
                                        {String.fromCharCode(104 - j)} {/* Files: h to a */}
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// ChessPiece component: Displays each individual piece on the board
const ChessPiece: React.FC<{
    square: {
        type: PieceSymbol; // The type of the piece (pawn, rook, etc.)
        color: Color; // The color of the piece (white or black)
    };
    from: Square; // The starting square of the piece
    setFrom: (square: Square) => void; // Function to set the starting square
}> = ({ square, from, setFrom }) => {
    const [, dragRef] = useDrag(() => ({
        type: 'CHESS_PIECE', // Specify this as a draggable chess piece
        item: { from }, // Send the starting position of the piece
    }));

    return (
        <motion.img
            ref={dragRef} // Add drag functionality to the piece
            className="w-[4.25rem] cursor-pointer" // Set piece size and cursor style
            src={`/${square.color === 'b' ? `b${square.type}` : `w${square.type}`}.png`} // Choose the right image based on piece color and type
            initial={{ scale: 0.9 }} // Initial size of the piece
            animate={{ scale: 1 }} // Animate to normal size
            whileHover={{ scale: 1.1 }} // Increase size when hovered
            whileTap={{ scale: 0.95 }} // Slightly shrink when clicked
            transition={{ duration: 0.3 }} // Smooth transition for animations
        />
    );
};

export default ChessBoard; // Export the ChessBoard component to be used elsewhere
