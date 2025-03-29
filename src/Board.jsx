// Board.js
import { useState, useEffect } from 'react';
import './Board.css';
import { isCheck, isCheckmate, isStalemate, isMoveValid } from './Checkmate';
import Pieces from './Pieces';
import AI from './AI'; // ملف الذكاء الاصطناعي

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
      <h3>Choose your upgrade piece:</h3>
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

const Board = ({ isAIMode, aiLevel }) => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [kingInCheck, setKingInCheck] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);

  useEffect(() => {
    if (isCheckmate(board, currentPlayer)) {
      setIsGameOver(true);
      setWinner(currentPlayer === 'white' ? 'black' : 'white');
    } else if (isStalemate(board, currentPlayer)) {
      setIsGameOver(true);
      setWinner(currentPlayer === 'white' ? 'black' : 'white'); // الخصم يفوز
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
  
    // إذا كان الوضع ضد الذكاء الاصطناعي وكان دور الذكاء الاصطناعي
    if (isAIMode && currentPlayer === 'black' && !isGameOver) {
      const aiMove = AI.getMove(board, aiLevel); // تمرير مستوى الصعوبة
      if (aiMove) {
        const newBoard = makeMove(board, aiMove.fromRow, aiMove.fromCol, aiMove.toRow, aiMove.toCol);
  
        // التحقق من الترقية للذكاء الاصطناعي
        const movingPiece = board[aiMove.fromRow][aiMove.fromCol];
        if ((movingPiece === '♙' && aiMove.toRow === 0) || (movingPiece === '♟' && aiMove.toRow === 7)) {
          const promotionPiece = currentPlayer === 'white' ? '♕' : '♛'; // الترقية إلى وزير
          newBoard[aiMove.toRow][aiMove.toCol] = promotionPiece;
        }
  
        setBoard(newBoard);
        setCurrentPlayer('white');
      }
    }
  }, [board, currentPlayer, isAIMode, aiLevel, isGameOver]);

  const handleSquareClick = (row, col) => {
    if (isGameOver || (isAIMode && currentPlayer === 'black')) return;

    const piece = board[row][col];

    if (selectedPiece) {
      const [fromRow, fromCol] = selectedPiece;
      const movingPiece = board[fromRow][fromCol];

      if (
        (currentPlayer === 'white' && !isWhitePiece(movingPiece)) ||
        (currentPlayer === 'black' && !isBlackPiece(movingPiece))
      ) {
        setSelectedPiece(null);
        setAvailableMoves([]);
        return;
      }

      if (isMoveValid(movingPiece, fromRow, fromCol, row, col, board)) {
        const newBoard = makeMove(board, fromRow, fromCol, row, col);

        if ((movingPiece === '♙' && row === 0) || (movingPiece === '♟' && row === 7)) {
          setPromotion({ from: [fromRow, fromCol], to: [row, col] });
          return;
        }

        if (!isCheck(newBoard, currentPlayer)) {
          setBoard(newBoard);
          setMoveHistory([...moveHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]);
          setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
          setRedoHistory([]);
        }
      }
      setSelectedPiece(null);
      setAvailableMoves([]);
    } else if (piece) {
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

    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = '';

    setBoard(newBoard);
    setMoveHistory([...moveHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]);
    setPromotion(null);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
    setRedoHistory([]);
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
    const newBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    return newBoard;
  };

  const isWhitePiece = (piece) => ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece);
  const isBlackPiece = (piece) => ['♚', '♛', '♜', '♝', '♞', '♟'].includes(piece);

  const undoMove = () => {
    if (moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1];
      setRedoHistory([...redoHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]);
      setBoard(lastMove.board);
      setCurrentPlayer(lastMove.player);
      setMoveHistory(moveHistory.slice(0, -1));
    }
  };

  const redoMove = () => {
    if (redoHistory.length > 0) {
      const nextMove = redoHistory[redoHistory.length - 1];
      setMoveHistory([...moveHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]);
      setBoard(nextMove.board);
      setCurrentPlayer(nextMove.player);
      setRedoHistory(redoHistory.slice(0, -1));
    }
  };

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
    <div className="board-container">
      {/* إضافة قسم رأس اللعبة هنا */}
      <div className="game-header">
        <h1 className="chess-mastery">Chess Mastery</h1>
        <p className="subtitle">
          Experience chess like never before with stunning visuals and adaptive AI
        </p>
      </div>

      {/* بقية الكود كما هو */}
      {isGameOver && (
        <div className="game-over-message">
          <h1>
            {isAIMode
              ? winner === 'white'
                ? 'Game Over! The Winner is: You'
                : winner === 'black'
                ? 'Game Over! The Winner is: AI'
                : 'Draw!'
              : winner === 'white'
              ? 'Game Over! The Winner is: white'
              : winner === 'black'
              ? 'Game Over! The Winner is: black'
              : 'Draw!'}
          </h1>
        </div>
      )}
      {promotion && (
        <Promotion currentPlayer={currentPlayer} onSelectPiece={handlePromotion} />
      )}
      {Array.from({ length: 8 }, (_, row) => renderRow(row))}
      <div className="controls">
        <button onClick={undoMove} disabled={moveHistory.length === 0} className='undo-button'>Undo</button>
        <button onClick={redoMove} disabled={redoHistory.length === 0} className='redo-button'>Redo</button>
      </div>
    </div>
  );
};

export default Board;