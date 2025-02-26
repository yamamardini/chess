import { useState } from 'react';
import './Chessboard.css';

// استخدام رموز نصية لقطع الشطرنج
const whitePawn = '♙';
const blackPawn = '♟';
const whiteKnight = '♘';
const blackKnight = '♞';
const whiteBishop = '♗';
const blackBishop = '♝';
const whiteRook = '♖';
const blackRook = '♜';
const whiteQueen = '♕';
const blackQueen = '♛';
const whiteKing = '♔';
const blackKing = '♚';

const Chessboard = () => {
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
  const [turn, setTurn] = useState('white'); // الدور: 'white' أو 'black'
  const [gameOver, setGameOver] = useState(false); // حالة انتهاء اللعبة
  const [hasKingMoved, setHasKingMoved] = useState(false); // تتبع تحركات الملك
  const [hasRookMoved, setHasRookMoved] = useState([false, false]); // تتبع تحركات القلعتين

  // دالة لتحديد لون الخلية
  const getSquareColor = (row, col) => {
    return (row + col) % 2 === 0 ? 'white' : 'black';
  };

  // دالة لإرجاع رمز القطعة
  const getPieceSymbol = (piece) => {
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
      default: return '';
    }
  };

  // دالة للتحقق مما إذا كان الملك في حالة كش
  const isInCheck = (board, kingPosition, enemyColor) => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.startsWith(enemyColor)) {
          const moves = getValidMoves(row, col);
          if (moves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
            return true; // الملك في حالة كش
          }
        }
      }
    }
    return false;
  };

  // دالة للتحقق من كش مات
  const isCheckmate = (board, kingPosition, enemyColor) => {
    if (!kingPosition) return false;

    // تحقق من أن الملك في حالة كش
    if (!isInCheck(board, kingPosition, enemyColor)) {
      return false;
    }

    // تحقق من أن الملك لا يمكنه الهروب
    const kingMoves = getValidMoves(kingPosition.row, kingPosition.col);
    return kingMoves.length === 0;
  };

  // دالة لتحديد الحركات الممكنة للقطعة
  const getValidMoves = (row, col) => {
    const piece = board[row][col];
    const moves = [];

    if (!piece) return moves;

    const isWhite = piece.startsWith('w');
    const enemyColor = isWhite ? 'b' : 'w';

    const addMove = (r, c) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetPiece = board[r][c];
        if (targetPiece === '' || targetPiece.startsWith(enemyColor)) {
          moves.push({ row: r, col: c });
          return targetPiece === '';
        }
      }
      return false;
    };

    switch (piece[1]) {
      case 'p': // بيادق
        const direction = isWhite ? -1 : 1;
        // حركة واحدة للأمام
        if (addMove(row + direction, col)) {
          // حركة مزدوجة للأمام (الحركة الأولى)
          if ((isWhite && row === 6) || (!isWhite && row === 1)) {
            addMove(row + 2 * direction, col);
          }
        }
        // الأكل بشكل قطري
        addMove(row + direction, col - 1);
        addMove(row + direction, col + 1);
        break;

      case 'n': // أحصنة
        const knightMoves = [
          { row: row - 2, col: col - 1 },
          { row: row - 2, col: col + 1 },
          { row: row - 1, col: col - 2 },
          { row: row - 1, col: col + 2 },
          { row: row + 1, col: col - 2 },
          { row: row + 1, col: col + 2 },
          { row: row + 2, col: col - 1 },
          { row: row + 2, col: col + 1 },
        ];
        knightMoves.forEach(move => addMove(move.row, move.col));
        break;

      case 'b': // فيلة
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + i, col + i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + i, col - i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row - i, col + i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row - i, col - i)) break;
        }
        break;

      case 'r': // قلعة
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + i, col)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row - i, col)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row, col + i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row, col - i)) break;
        }
        break;

      case 'q': // ملكة
        // حركة الفيل + حركة القلعة
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + i, col + i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + i, col - i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row - i, col + i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row - i, col - i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + i, col)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row - i, col)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row, col + i)) break;
        }
        for (let i = 1; i < 8; i++) {
          if (!addMove(row, col - i)) break;
        }
        break;

      case 'k': // ملك
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i !== 0 || j !== 0) {
              addMove(row + i, col + j);
            }
          }
        }

        // التبييت
        if (!hasKingMoved) {
          // تبييت الجانب الملكي (اليمين)
          if (!hasRookMoved[1] && board[row][5] === '' && board[row][6] === '') {
            moves.push({ row, col: 6 });
          }
          // تبييت الجانب الوزيري (اليسار)
          if (!hasRookMoved[0] && board[row][1] === '' && board[row][2] === '' && board[row][3] === '') {
            moves.push({ row, col: 2 });
          }
        }
        break;

      default:
        break;
    }

    return moves;
  };

  // دالة للعثور على موقع الملك
  const findKing = (board, king) => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === king) {
          return { row, col };
        }
      }
    }
    return null;
  };

  // دالة للنقر على القطعة
  const handlePieceClick = (row, col) => {
    const piece = board[row][col];
    if (piece && piece.startsWith(turn[0])) {
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(row, col));
    }
  };

  // دالة للنقر على المربع
  const handleSquareClick = (row, col) => {
    if (selectedPiece) {
      const isValidMove = validMoves.some(move => move.row === row && move.col === col);
      if (isValidMove) {
        const newBoard = [...board];
        const piece = newBoard[selectedPiece.row][selectedPiece.col];

        // تحقق من تحرك الملك
        if (piece[1] === 'k') {
          setHasKingMoved(true);
        }

        // تحقق من تحرك القلعة
        if (piece[1] === 'r') {
          if (selectedPiece.col === 0) {
            setHasRookMoved([true, hasRookMoved[1]]);
          } else if (selectedPiece.col === 7) {
            setHasRookMoved([hasRookMoved[0], true]);
          }
        }

        // تحقق من وصول البيدق إلى الصف الأخير
        if (piece[1] === 'p' && (row === 0 || row === 7)) {
          newBoard[row][col] = piece[0] + 'q'; // تحويل البيدق إلى وزير
        } else {
          newBoard[row][col] = piece;
        }

        newBoard[selectedPiece.row][selectedPiece.col] = '';
        setBoard(newBoard);
        setSelectedPiece(null);
        setValidMoves([]);
        setTurn(turn === 'white' ? 'black' : 'white');

        // تحقق من كش ملك
        const king = turn === 'white' ? 'wk' : 'bk';
        const kingPosition = findKing(newBoard, king);
        if (isCheckmate(newBoard, kingPosition, turn === 'white' ? 'b' : 'w')) {
          setGameOver(true); // انتهاء اللعبة
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