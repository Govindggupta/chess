import { Square, PieceSymbol, Color, Chess } from "chess.js";
import { useState } from "react";
import { motion } from "framer-motion";
import { useDrag, useDrop } from "react-dnd";
import { MOVE } from "../screens/Game";

const ChessBoard: React.FC<{
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  socket: WebSocket | null;
  setBoard: React.Dispatch<
    React.SetStateAction<
      ({
        square: Square;
        type: PieceSymbol;
        color: Color;
      } | null)[][]
    >
  >;
  chess: Chess;
  myColor: "w" | "b";
  setPromotion: (from: string, to: string) => void;
  checkSquare: String | null;
}> = ({ board, socket, setBoard, chess, myColor, setPromotion, checkSquare }) => {
  const [from, setFrom] = useState<null | Square>(null);

  // Function to translate squares for the black player
  const translateSquareForBlack = (square: Square): Square => {
    const file = square.charCodeAt(0);
    const rank = parseInt(square[1]);
    const newFile = String.fromCharCode(104 - (file - 97)); // Reverse file (a-h => h-a)
    const newRank = 9 - rank; // Reverse rank (1-8 => 8-1)
    return `${newFile}${newRank}` as Square;
  };

  // Handle moves (shared logic for both drag and click)
  const handleMove = (fromSquare: Square, toSquare: Square) => {
    if (!fromSquare || !toSquare || fromSquare === toSquare) {
      setFrom(null); // Reset selection if same square is selected
      return;
    }

    // Translate squares for the black player
    const actualFrom = myColor === "b" ? translateSquareForBlack(fromSquare) : fromSquare;
    const actualTo = myColor === "b" ? translateSquareForBlack(toSquare) : toSquare;

    const move = { from: actualFrom, to: actualTo };

    // Check if the move is a promotion move
    const moves = chess.moves({ square: actualFrom, verbose: true });
    const isPromotion = moves.some(
      (move: any) => move.flags.includes('p') && move.to === actualTo
    );

    if (isPromotion) {
      setPromotion(actualFrom, actualTo); // Trigger promotion selection
    } else {
      // Update the local chess instance before sending the move
      if (chess.move(move)) {
        setBoard(chess.board()); // Update the board state
        socket?.send(
          JSON.stringify({
            type: MOVE,
            payload: { move },
          })
        );
      } else {
        console.error("Invalid move:", move);
      }
    }

    setFrom(null); // Reset selection after move attempt
  };

  return (
    <div className={`relative ${myColor === "b" ? "flipped" : ""}`}>
      <div className="grid grid-cols-8">
        {board.map((row, i) =>
          row.map((square, j) => {
            const squareRepresentation = (String.fromCharCode(97 + (j % 8)) +
              (8 - i)) as Square;

            // Check if the current square is the king in check
            const isKingInCheck = myColor === "b"
              ? translateSquareForBlack(squareRepresentation) === checkSquare
              : squareRepresentation === checkSquare;

            const isDarkSquare = (i + j) % 2 === 0;

            // Drop functionality for drag-and-drop
            const [{ isOver }, dropRef] = useDrop(() => ({
              accept: 'CHESS_PIECE',
              drop: (item: { from: Square }) => {
                handleMove(item.from, squareRepresentation);
              },
              collect: (monitor) => ({
                isOver: !!monitor.isOver(),
              }),
            }));

            return (
              <div
                key={`${i}-${j}`}
                ref={dropRef}
                onClick={() => {
                  if (!from) {
                    setFrom(squareRepresentation); // Set the piece to move
                  } else {
                    handleMove(from, squareRepresentation); // Handle the move
                  }
                }}
                className={`relative w-12 h-12 flex items-center justify-center ${
                  from === squareRepresentation ? "border-2 border-yellow-500" : ""
                } ${
                  isDarkSquare ? 'bg-[#ebecd0]' : 'bg-[#779556]' // Background color based on square position
                } ${
                  isKingInCheck ? 'bg-red-500' : '' // Highlight the king's square in red if it's in check
                } ${isOver ? 'bg-yellow-300' : ''}`}
              ><div className={`${myColor === "b" ? "flipped" : ""}`}>
                {square && (
                  <ChessPiece
                    square={square}
                    from={squareRepresentation}
                    setFrom={setFrom}
                  />
                )}
                </div>

                {/* Display rank and file */}
                {myColor === "w" && j === 0 && (
                  <span
                    className="absolute top-1 left-1 text-xs font-bold"
                    style={{ color: isDarkSquare ? "#739552" : "#ebecd0" }}
                  >
                    {8 - i}
                  </span>
                )}
                {myColor === "w" && i === 7 && (
                  <span
                    className="absolute bottom-1 right-1 text-xs font-bold"
                    style={{ color: isDarkSquare ? "#739552" : "#ebecd0" }}
                  >
                    {String.fromCharCode(97 + j)}
                  </span>
                )}
                {myColor === "b" && j === 7 && (
                  <span
                    className="absolute bottom-1 right-1 text-xs font-bold flipped"
                    style={{ color: isDarkSquare ? "#739552" : "#ebecd0" }}
                  >
                    {8-i}
                  </span>
                )}
                {myColor === "b" && i === 0 && (
                  <span
                    className="absolute top-1 left-1 text-xs font-bold flipped"
                    style={{ color: isDarkSquare ? "#739552" : "#ebecd0" }}
                  >
                    {String.fromCharCode(97 + j)}
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

const ChessPiece: React.FC<{
  square: { type: PieceSymbol; color: Color };
  from: Square;
  setFrom: (square: Square) => void;
}> = ({ square, from, setFrom }) => {
  const [, dragRef] = useDrag(() => ({
    type: 'CHESS_PIECE',
    item: { from },
  }));

  return (
    <motion.img
      ref={dragRef}
      className="w-[4.25rem] cursor-pointer"
      src={`/${square.color === "b" ? `b${square.type}` : `w${square.type}`}.png`}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
    />
  );
};

export default ChessBoard;