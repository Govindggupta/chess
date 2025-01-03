import { Square, PieceSymbol, Color, Chess } from "chess.js";
import { useState } from "react";
import { motion } from "framer-motion";
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
}> = ({ board, socket, setBoard, chess, myColor, setPromotion}) => {
  const [from, setFrom] = useState<null | Square>(null);

  const translateSquareForBlack = (square: Square): Square => {
    const file = square.charCodeAt(0);
    const rank = parseInt(square[1]);
    const newFile = String.fromCharCode(104 - (file - 97)); // Reverse file
    const newRank = 9 - rank; // Reverse rank
    return `${newFile}${newRank}` as Square;
  };

  const handleSquareClick = (square: Square) => {
    if (from === square) {
      setFrom(null); // Deselect if the same square is clicked
    } else {
      setFrom(square); // Select the square
    }
  };

  const handleMove = (fromSquare: Square, toSquare: Square) => {
    if (!fromSquare || !toSquare || fromSquare === toSquare) {
      setFrom(null); // Reset selection if same square is selected
      return;
    }
  
    const actualFrom =
      myColor === "b" ? translateSquareForBlack(fromSquare) : fromSquare;
    const actualTo =
      myColor === "b" ? translateSquareForBlack(toSquare) : toSquare;
  
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
    <div className="relative">
      <div className="grid grid-cols-8">
        {(myColor === "b" ? [...board].reverse() : board).map((row, i) =>
          (myColor === "b" ? [...row].reverse() : row).map((square, j) => {
            const squareRepresentation = (String.fromCharCode(97 + (j % 8)) +
              (8 - i)) as Square;

            const isDarkSquare = (i + j) % 2 === 0;
            const blockColor = isDarkSquare ? "#739552" : "#ebecd0";
            const textColor = isDarkSquare ? "#ebecd0" : "#739552";

            return (
              <div
                key={`${i}-${j}`}
                onClick={() =>
                  from
                    ? handleMove(from, squareRepresentation)
                    : handleSquareClick(squareRepresentation)
                }
                className={`relative w-12 h-12 flex items-center justify-center ${
                  from === squareRepresentation ? "border-2 border-yellow-500" : ""
                }`}
                style={{ backgroundColor: blockColor }}
              >
                {square && <ChessPiece square={square} />}

                {/* Display rank and file */}
                {myColor === "w" && j === 0 && (
                  <span
                    className="absolute top-1 left-1 text-xs font-bold"
                    style={{ color: textColor }}
                  >
                    {8 - i}
                  </span>
                )}
                {myColor === "w" && i === 7 && (
                  <span
                    className="absolute bottom-1 right-1 text-xs font-bold"
                    style={{ color: textColor }}
                  >
                    {String.fromCharCode(97 + j)}
                  </span>
                )}
                {myColor === "b" && j === 0 && (
                  <span
                    className="absolute top-1 left-1 text-xs font-bold"
                    style={{ color: textColor }}
                  >
                    {i + 1}
                  </span>
                )}
                {myColor === "b" && i === 7 && (
                  <span
                    className="absolute bottom-1 right-1 text-xs font-bold"
                    style={{ color: textColor }}
                  >
                    {String.fromCharCode(104 - j)}
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

const ChessPiece: React.FC<{ square: { type: PieceSymbol; color: Color } }> = ({
  square,
}) => (
  <motion.img
    className="w-[4.25rem] cursor-pointer"
    src={`/${square.color === "b" ? `b${square.type}` : `w${square.type}`}.png`}
    initial={{ scale: 0.9 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.3 }}
  />
);

export default ChessBoard;
