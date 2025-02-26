
import { useState } from 'react';
import './Chessboard.css';

// استيراد صور قطع الشطرنج
import whitePawn from './Chess_pieces_pictures/pawn_16.png';
import blackPawn from './Chess_pieces_pictures/pawn_1.png';

import whiteKnight from './Chess_pieces_pictures/knight_1.png'; // تم التصحيح هنا
import blackKnight from './Chess_pieces_pictures/knight_4.png';

import whiteBishop from './Chess_pieces_pictures/bishop_1.png';
import blackBishop from './Chess_pieces_pictures/bishop_4.png';

import whiteRook from './Chess_pieces_pictures/rook_1.png';
import blackRook from './Chess_pieces_pictures/rook_4.png';

import whiteQueen from './Chess_pieces_pictures/queen_1.png';
import blackQueen from './Chess_pieces_pictures/queen_4.png';

import whiteKing from './Chess_pieces_pictures/king_1.png';
import blackKing from './Chess_pieces_pictures/king_4.png'; // تم التصحيح هنا

const Chessboard = () => {
  // const rows = 8;
  // const cols = 8;

  // الحالة الابتدائية للرقعة
  const initialPieces = [
    ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'], // الصف 0 (القطع السوداء)
    ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'], // الصف 1 (البيادق السوداء)
    ['', '', '', '', '', '', '', ''], // الصف 2
    ['', '', '', '', '', '', '', ''], // الصف 3
    ['', '', '', '', '', '', '', ''], // الصف 4
    ['', '', '', '', '', '', '', ''], // الصف 5
    ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'], // الصف 6 (البيادق البيضاء)
    ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'], // الصف 7 (القطع البيضاء)
  ];

  const [board, setBoard] = useState(initialPieces);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  // دالة لتحديد لون الخلية
  const getSquareColor = (row, col) => {
    return (row + col) % 2 === 0 ? 'white' : 'black';
  };

  // دالة لإرجاع صورة القطعة
  const getPieceImage = (piece) => {
    switch (piece) {
      case 'wp': return whitePawn;
      case 'bp': return blackPawn;
      case 'wn': return whiteKnight;
      case 'bn': return blackKnight;
      case 'wb': return whiteBishop;
      case 'bb': return blackBishop;
      case 'wr': return whiteRook;
      case 'br': return blackRook;
      case 'wq': return whiteQueen;
      case 'bq': return blackQueen;
      case 'wk': return whiteKing;
      case 'bk': return blackKing;
      default: return null;
    }
  };

  // دالة لتحديد الحركات الممكنة للقطعة
  const getValidMoves = (row, col) => {
    const piece = board[row][col];
    const moves = [];

    if (piece === 'wp') { // حركة البيادق البيضاء
      if (row > 0 && board[row - 1][col] === '') {
        moves.push({ row: row - 1, col });
        if (row === 6 && board[row - 2][col] === '') {
          moves.push({ row: row - 2, col });
        }
      }
      // الأكل بشكل قطري
      if (row > 0 && col > 0 && board[row - 1][col - 1].startsWith('b')) {
        moves.push({ row: row - 1, col: col - 1 });
      }
      if (row > 0 && col < 7 && board[row - 1][col + 1].startsWith('b')) {
        moves.push({ row: row - 1, col: col + 1 });
      }
    } else if (piece === 'bp') { // حركة البيادق السوداء
      if (row < 7 && board[row + 1][col] === '') {
        moves.push({ row: row + 1, col });
        if (row === 1 && board[row + 2][col] === '') {
          moves.push({ row: row + 2, col });
        }
      }
      // الأكل بشكل قطري
      if (row < 7 && col > 0 && board[row + 1][col - 1].startsWith('w')) {
        moves.push({ row: row + 1, col: col - 1 });
      }
      if (row < 7 && col < 7 && board[row + 1][col + 1].startsWith('w')) {
        moves.push({ row: row + 1, col: col + 1 });
      }
    }

    return moves;
  };

  // دالة للنقر على القطعة
  const handlePieceClick = (row, col) => {
    const piece = board[row][col];
    if (piece) {
      if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
        // إلغاء تحديد القطعة إذا تم النقر عليها مرة أخرى
        setSelectedPiece(null);
        setValidMoves([]);
      } else {
        setSelectedPiece({ row, col });
        setValidMoves(getValidMoves(row, col));
      }
    }
  };

  // دالة للنقر على المربع
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
              <img
                src={getPieceImage(piece)}
                alt={piece}
                className="piece"
                onClick={(e) => {
                  e.stopPropagation(); // منع تنفيذ handleSquareClick عند النقر على القطعة
                  handlePieceClick(rowIndex, colIndex);
                }}
              />
            )}
            {validMoves.some(move => move.row === rowIndex && move.col === colIndex) && (
              <div className="valid-move"></div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Chessboard;