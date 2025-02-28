// Chessboard.js
import { useState } from 'react';
import './Chessboard.css';
import { initialPieces, getPieceSymbol, getSquareColor } from '../utils/chessUtils';
import { getValidMoves, isCheckmate, findKing } from '../logic/gameLogic';

const Chessboard = () => {
  const [board, setBoard] = useState(initialPieces);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState('white');
  const [gameOver, setGameOver] = useState(false);

  const handlePieceClick = (row, col) => {
    const piece = board[row][col];
    if (piece && piece.startsWith(turn[0])) {
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(board, row, col));
    }
  };

  const handleSquareClick = (row, col) => {
    if (selectedPiece) {
      const isValidMove = validMoves.some(move => move.row === row && move.col === col);
      if (isValidMove) {
        const newBoard = [...board];
        newBoard[row][col] = newBoard[selectedPiece.row][selectedPiece.col];
        newBoard[selectedPiece.row][selectedPiece.col] = '';
        setBoard(newBoard);
        setSelectedPiece(null);
        setValidMoves([]);
        setTurn(turn === 'white' ? 'black' : 'white');

        const king = turn === 'white' ? 'wk' : 'bk';
        const kingPosition = findKing(newBoard, king);
        if (isCheckmate(newBoard, kingPosition, turn === 'white' ? 'b' : 'w')) {
          setGameOver(true);
        }
      }
    }
  };

  return (
    <div className="chessboard">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`square ${getSquareColor(rowIndex, colIndex)}`}
            onClick={() => handleSquareClick(rowIndex, colIndex)}
          >
            {piece && (
              <div
                className="piece"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePieceClick(rowIndex, colIndex);
                }}
              >
                {getPieceSymbol(piece)}
              </div>
            )}
            {validMoves.some(move => move.row === rowIndex && move.col === colIndex) && (
              <div className="valid-move"></div>
            )}
          </div>
        ))
      )}
      {gameOver && <div className="game-over">Game Over! {turn === 'white' ? 'Black' : 'White'} wins!</div>}
    </div>
  );
};

export default Chessboard;