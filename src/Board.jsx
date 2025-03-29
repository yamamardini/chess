// Board.js
import { useState, useEffect, useRef } from 'react';
import './Board.css';
import { isCheck, isCheckmate, isStalemate, isMoveValid } from './Checkmate';
import Pieces from './Pieces';
import AI from './AI'; // ملف الذكاء الاصطناعي

// أصوات الشطرنج باستخدام Web Audio API
const ChessSounds = {
  audioContext: null,
  
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  
  playMoveSound() {
    this.init();
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // A4
    gainNode.gain.value = 0.1;
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  },
  
  playCaptureSound() {
    this.init();
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.value = 220; // A3
    gainNode.gain.value = 0.2;
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  },
  
  playCheckSound() {
    this.init();
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.3);
    gainNode.gain.value = 0.15;
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
    oscillator.stop(this.audioContext.currentTime + 0.4);
  },
  
  playGameEndSound(isWin) {
    this.init();
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = isWin ? 'triangle' : 'sine';
    const baseFreq = isWin ? 440 : 220;
    
    // نغمة انتصار أو خسارة
    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      isWin ? baseFreq * 2 : baseFreq / 2, 
      this.audioContext.currentTime + 1
    );
    
    gainNode.gain.value = 0.2;
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 1.2);
  }
};

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
          <div key={index} className="promotion-option" onClick={() => {
            ChessSounds.playMoveSound();
            onSelectPiece(piece);
          }}>
            {piece}
          </div>
        ))}
      </div>
    </div>
  );
};

const Board = ({ isAIMode, aiLevel, aiDelay = 1000 }) => {
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
  const [isAITurn, setIsAITurn] = useState(false);
  const aiTimerRef = useRef(null);

  // تنظيف المؤقت عند unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

  const executeAIMove = () => {
    const aiMove = AI.getMove(board, aiLevel);
    if (aiMove) {
      const newBoard = makeMove(board, aiMove.fromRow, aiMove.fromCol, aiMove.toRow, aiMove.toCol);

      // تشغيل الصوت المناسب للحركة
      if (board[aiMove.toRow][aiMove.toCol]) {
        ChessSounds.playCaptureSound();
      } else {
        ChessSounds.playMoveSound();
      }

      // التحقق من الترقية للذكاء الاصطناعي
      const movingPiece = board[aiMove.fromRow][aiMove.fromCol];
      if ((movingPiece === '♙' && aiMove.toRow === 0) || (movingPiece === '♟' && aiMove.toRow === 7)) {
        const promotionPiece = currentPlayer === 'white' ? '♕' : '♛';
        newBoard[aiMove.toRow][aiMove.toCol] = promotionPiece;
      }

      setBoard(newBoard);
      setCurrentPlayer('white');
      setMoveHistory([...moveHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]);
      setRedoHistory([]);
    }
    setIsAITurn(false);
  };

  useEffect(() => {
    if (isCheckmate(board, currentPlayer)) {
      setIsGameOver(true);
      setWinner(currentPlayer === 'white' ? 'black' : 'white');
      ChessSounds.playGameEndSound(currentPlayer !== 'white');
    } else if (isStalemate(board, currentPlayer)) {
      setIsGameOver(true);
      setWinner(null);
      ChessSounds.playGameEndSound(false);
    } else if (isCheck(board, currentPlayer)) {
      const king = currentPlayer === 'white' ? '♔' : '♚';
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (board[row][col] === king) {
            setKingInCheck([row, col]);
            ChessSounds.playCheckSound();
            break;
          }
        }
      }
    } else {
      setKingInCheck(null);
    }
  
    if (isAIMode && currentPlayer === 'black' && !isGameOver && !isAITurn) {
      setIsAITurn(true);
      
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
      
      aiTimerRef.current = setTimeout(() => {
        executeAIMove();
      }, aiDelay);
    }
  }, [board, currentPlayer, isAIMode, aiLevel, isGameOver, aiDelay]);

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
          // تشغيل الصوت المناسب للحركة
          if (board[row][col]) {
            ChessSounds.playCaptureSound();
          } else {
            ChessSounds.playMoveSound();
          }

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
        ChessSounds.playMoveSound(); // صوت عند اختيار قطعة
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
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    return newBoard;
  };

  const isWhitePiece = (piece) => ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece);
  const isBlackPiece = (piece) => ['♚', '♛', '♜', '♝', '♞', '♟'].includes(piece);

  const undoMove = () => {
    if (moveHistory.length === 0) return;

    // عند اللعب ضد الذكاء الاصطناعي، نرجع حركتين (حركة اللاعب وحركة الذكاء الاصطناعي)
    const stepsToUndo = isAIMode && currentPlayer === 'white' ? 2 : 1;
    
    if (moveHistory.length >= stepsToUndo) {
      const newMoveHistory = [...moveHistory];
      const newRedoHistory = [...redoHistory];
      const currentState = { board: JSON.parse(JSON.stringify(board)), player: currentPlayer };

      // إضافة الحالة الحالية إلى redoHistory
      newRedoHistory.push(currentState);

      // إضافة حركة الذكاء الاصطناعي السابقة إذا لزم الأمر
      if (stepsToUndo > 1) {
        newRedoHistory.push(newMoveHistory.pop());
      }

      // الحصول على الحالة التي نريد العودة إليها
      const targetState = newMoveHistory.pop();

      setBoard(targetState.board);
      setCurrentPlayer(targetState.player);
      setMoveHistory(newMoveHistory);
      setRedoHistory(newRedoHistory);
      ChessSounds.playMoveSound();
    }
  };

  const redoMove = () => {
    if (redoHistory.length > 0) {
      const nextMove = redoHistory[redoHistory.length - 1];
      setMoveHistory([...moveHistory, { board: JSON.parse(JSON.stringify(board)), player: currentPlayer }]);
      setBoard(nextMove.board);
      setCurrentPlayer(nextMove.player);
      setRedoHistory(redoHistory.slice(0, -1));
      ChessSounds.playMoveSound();
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
      <div className="game-header">
        <h1 className="chess-mastery">Chess Mastery</h1>
        <p className="subtitle">
          Experience chess like never before with stunning visuals and adaptive AI
        </p>
      </div>

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