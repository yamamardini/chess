import { useState, useEffect } from 'react';
import './Board.css';
import { isCheck, isCheckmate, isMoveValid } from './Checkmate';
import Pieces from './Pieces';

const initialBoard = [
  [Pieces.black.rook, Pieces.black.knight, Pieces.black.bishop, Pieces.black.queen, Pieces.black.king, Pieces.black.bishop, Pieces.black.knight, Pieces.black.rook],
  [Pieces.black.pawn, Pieces.black.pawn, Pieces.black.pawn, Pieces.black.pawn, Pieces.black.pawn, Pieces.black.pawn, Pieces.black.pawn, Pieces.black.pawn],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  [Pieces.white.pawn, Pieces.white.pawn, Pieces.white.pawn, Pieces.white.pawn, Pieces.white.pawn, Pieces.white.pawn, Pieces.white.pawn, Pieces.white.pawn],
  [Pieces.white.rook, Pieces.white.knight, Pieces.white.bishop, Pieces.white.queen, Pieces.white.king, Pieces.white.bishop, Pieces.white.knight, Pieces.white.rook],
];

const Promotion = ({ currentPlayer, onSelectPiece }) => {
  const pieces = currentPlayer === 'white' ? ['♕', '♖', '♗', '♘'] : ['♛', '♜', '♝', '♞'];

  return (
    <div className="promotion-modal">
      <h3>Choose the upgrade piece:</h3>
      <div className="promotion-options">
        {pieces.map((piece, index) => (
          <div key={index} className="promotion-option" onClick={() => onSelectPiece(piece)}>
            {piece}
          </div>
        ))}
      </div>
    </div>
  );
};

const Board = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [kingInCheck, setKingInCheck] = useState(null);
  const [promotion, setPromotion] = useState(null); // { from: [row, col], to: [row, col] }
  const [moveHistory, setMoveHistory] = useState([]); // تخزين تاريخ الحركات
  const [redoHistory, setRedoHistory] = useState([]); // تخزين الحركات التي تم التراجع عنها


  useEffect(() => {
    if (isCheckmate(board, currentPlayer)) {
      setIsGameOver(true);
      setWinner(currentPlayer === 'white' ? 'black' : 'white');
    } else if (isCheck(board, currentPlayer)) {
      const king = currentPlayer === 'white' ? '♔' : '♚';
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (board[row][col] === king) {
            setKingInCheck([row, col]);
            break;
          }
        }
      }
    } else {
      setKingInCheck(null);
    }
  }, [board, currentPlayer]);

  const handleSquareClick = (row, col) => {
    if (isGameOver) return;

    const piece = board[row][col];

    if (selectedPiece) {
      const [fromRow, fromCol] = selectedPiece;
      const movingPiece = board[fromRow][fromCol];

      // التحقق من أن القطعة المحددة تخص اللاعب الحالي
      if (
        (currentPlayer === 'white' && !isWhitePiece(movingPiece)) ||
        (currentPlayer === 'black' && !isBlackPiece(movingPiece))
      ) {
        setSelectedPiece(null);
        setAvailableMoves([]);
        return;
      }

      // التحقق من أن الحركة تزيل الكش
      if (isMoveValid(movingPiece, fromRow, fromCol, row, col, board)) {
        const newBoard = makeMove(board, fromRow, fromCol, row, col);

        // التحقق من وصول البيدق إلى الصف الأخير
        if ((movingPiece === '♙' && row === 0) || (movingPiece === '♟' && row === 7)) {
          setPromotion({ from: [fromRow, fromCol], to: [row, col] }); // بدء عملية الترقية
          return;
        }

        if (!isCheck(newBoard, currentPlayer)) {
          setBoard(newBoard);
          setMoveHistory([...moveHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]); // حفظ الحركة في التاريخ
          setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
          setRedoHistory([]); // مسح تاريخ التقدم بعد حركة جديدة
        }
      }
      setSelectedPiece(null);
      setAvailableMoves([]);
    } else if (piece) {
      // التحقق من أن القطعة المحددة تخص اللاعب الحالي
      if (
        (currentPlayer === 'white' && isWhitePiece(piece)) ||
        (currentPlayer === 'black' && isBlackPiece(piece))
      ) {
        setSelectedPiece([row, col]);
        calculateAvailableMoves(row, col, piece);
      }
    }
  };

  const handlePromotion = (piece) => {
    if (!promotion) return;

    const [fromRow, fromCol] = promotion.from;
    const [toRow, toCol] = promotion.to;
    const newBoard = [...board];

    // ترقية البيدق إلى القطعة المحددة
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = '';

    setBoard(newBoard);
    setMoveHistory([...moveHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]); // حفظ الحركة في التاريخ
    setPromotion(null); // إنهاء عملية الترقية
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white'); // تبديل الأدوار
    setRedoHistory([]); // مسح تاريخ التقدم بعد حركة جديدة
  };

  const undoMove = () => {
    if (moveHistory.length === 0) return; // لا توجد حركات للتراجع

    const lastMove = moveHistory[moveHistory.length - 1];
    setBoard(lastMove.board); // استعادة اللوحة إلى الحالة السابقة
    setCurrentPlayer(lastMove.player); // استعادة اللاعب السابق
    setRedoHistory([...redoHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]); // حفظ الحركة في تاريخ التقدم
    setMoveHistory(moveHistory.slice(0, -1)); // إزالة الحركة الأخيرة من التاريخ
  };

  const redoMove = () => {
    if (redoHistory.length === 0) return; // لا توجد حركات للتقدم

    const nextMove = redoHistory[redoHistory.length - 1];
    setBoard(nextMove.board); // استعادة اللوحة إلى الحالة التالية
    setCurrentPlayer(nextMove.player); // استعادة اللاعب التالي
    setMoveHistory([...moveHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]); // حفظ الحركة في التاريخ
    setRedoHistory(redoHistory.slice(0, -1)); // إزالة الحركة الأخيرة من تاريخ التقدم
  };

  const calculateAvailableMoves = (row, col, piece) => {
    const moves = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (isMoveValid(piece, row, col, i, j, board)) {
          const newBoard = makeMove(board, row, col, i, j);
          if (!isCheck(newBoard, currentPlayer)) {
            moves.push([i, j]);
          }
        }
      }
    }
    setAvailableMoves(moves);
  };

  const makeMove = (board, fromRow, fromCol, toRow, toCol) => {
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    return newBoard;
  };

  const isWhitePiece = (piece) => ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece);
  const isBlackPiece = (piece) => ['♚', '♛', '♜', '♝', '♞', '♟'].includes(piece);

  const renderSquare = (row, col) => {
    const isDark = (row + col) % 2 === 1;
    const squareColor = isDark ? 'dark' : 'light';
    const piece = board[row][col];
    const isSelected = selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col;
    const isAvailable = availableMoves.some(([r, c]) => r === row && c === col);
    const isKingInCheck = kingInCheck && kingInCheck[0] === row && kingInCheck[1] === col;
    return (
      <div
        key={`${row}-${col}`}
        className={`square ${squareColor} ${isSelected ? 'selected' : ''} ${isKingInCheck ? 'king-in-check' : ''}`}
        onClick={() => handleSquareClick(row, col)}
      >
        {piece && <span className="piece">{piece}</span>}
        {isAvailable && <div className="available-move"></div>}
      </div>
    );
  };

  const renderRow = (row) => {
    return (
      <div key={row} className="board-row">
        {Array.from({ length: 8 }, (_, col) => renderSquare(row, col))}
      </div>
    );
  };

  return (
    <div className="board">
      <button className="undo-button" onClick={undoMove} disabled={moveHistory.length === 0}>
      Undo
      </button>
      <button className="redo-button" onClick={redoMove} disabled={redoHistory.length === 0}>
      redo
      </button>
      {Array.from({ length: 8 }, (_, row) => renderRow(row))}
      {isGameOver && (
        <div className="game-over-message">
          <h1>Game Over! The Winner is: {winner}</h1>
        </div>
      )}
      {promotion && (
        <Promotion currentPlayer={currentPlayer} onSelectPiece={handlePromotion} />
      )}
    </div>
  );
};

export default Board;