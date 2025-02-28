// logic/gameLogic.js

// دالة للحصول على الحركات الممكنة للقطعة
export const getValidMoves = (board, row, col) => {
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
      if (addMove(row + direction, col)) {
        if ((isWhite && row === 6) || (!isWhite && row === 1)) {
          addMove(row + 2 * direction, col);
        }
      }
      if (col > 0 && board[row + direction][col - 1].startsWith(enemyColor)) {
        addMove(row + direction, col - 1);
      }
      if (col < 7 && board[row + direction][col + 1].startsWith(enemyColor)) {
        addMove(row + direction, col + 1);
      }
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
      break;

    default:
      break;
  }

  return moves;
};

// دالة للتحقق من كش مات
export const isCheckmate = (board, kingPosition, enemyColor) => {
  if (!kingPosition) return false;

  // تحقق من أن الملك تحت الكش
  const isKingInCheck = isCheck(board, kingPosition, enemyColor);
  if (!isKingInCheck) return false;

  // تحقق من أن الملك لا يمكنه الهروب
  const kingMoves = getValidMoves(board, kingPosition.row, kingPosition.col);
  if (kingMoves.length > 0) return false;

  // تحقق من أن لا يمكن لأي قطعة حماية الملك
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece.startsWith(enemyColor === 'b' ? 'w' : 'b')) { // القطع الصديقة
        const moves = getValidMoves(board, row, col);
        for (const move of moves) {
          const newBoard = JSON.parse(JSON.stringify(board)); // نسخة من اللوحة
          newBoard[move.row][move.col] = piece;
          newBoard[row][col] = '';
          const newKingPosition = findKing(newBoard, enemyColor === 'b' ? 'wk' : 'bk');
          if (!isCheck(newBoard, newKingPosition, enemyColor)) {
            return false; // الملك يمكن إنقاذه
          }
        }
      }
    }
  }

  return true; // كش مات
};

// دالة للتحقق من أن الملك تحت الكش
export const isCheck = (board, kingPosition, enemyColor) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece.startsWith(enemyColor)) {
        const moves = getValidMoves(board, row, col);
        if (moves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
          return true; // الملك تحت الكش
        }
      }
    }
  }
  return false; // الملك ليس تحت الكش
};

// دالة للعثور على موقع الملك
export const findKing = (board, king) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === king) {
        return { row, col };
      }
    }
  }
  return null;
};