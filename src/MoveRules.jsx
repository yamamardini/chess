// src/components/MoveRules.js
export const isMoveValid = (piece, fromRow, fromCol, toRow, toCol, board) => {
    const pieceType = piece.toLowerCase();
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
  
    // التحقق من أن الهدف ليس قطعة من نفس اللون
    const targetPiece = board[toRow][toCol];
    if (targetPiece && isSameColor(piece, targetPiece)) {
      return false;
    }
  
    switch (pieceType) {
      case '♔': // الملك (King)
      case '♚':
        return rowDiff <= 1 && colDiff <= 1;
  
      case '♕': // الوزير (Queen)
      case '♛':
        return (
          (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) &&
          isPathClear(fromRow, fromCol, toRow, toCol, board)
        );
  
      case '♖': // الرخ (Rook)
      case '♜':
        return (
          (rowDiff === 0 || colDiff === 0) &&
          isPathClear(fromRow, fromCol, toRow, toCol, board)
        );
  
      case '♗': // الفيل (Bishop)
      case '♝':
        return (
          rowDiff === colDiff &&
          isPathClear(fromRow, fromCol, toRow, toCol, board)
        );
  
      case '♘': // الحصان (Knight)
      case '♞':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  
      case '♙': // البيدق (Pawn)
        if (colDiff === 0) {
          // حركة أمامية
          return (
            (toRow === fromRow - 1 && !board[toRow][toCol]) || // حركة واحدة
            (fromRow === 6 && toRow === 4 && !board[5][toCol] && !board[4][toCol]) // حركتان
          );
        } else if (colDiff === 1 && toRow === fromRow - 1) {
          // أكل قطري
          return !!board[toRow][toCol];
        }
        return false;
  
      case '♟': // البيدق الأسود (Pawn)
        if (colDiff === 0) {
          // حركة أمامية
          return (
            (toRow === fromRow + 1 && !board[toRow][toCol]) || // حركة واحدة
            (fromRow === 1 && toRow === 3 && !board[2][toCol] && !board[3][toCol]) // حركتان
          );
        } else if (colDiff === 1 && toRow === fromRow + 1) {
          // أكل قطري
          return !!board[toRow][toCol];
        }
        return false;
  
      default:
        return false;
    }
  };
  
  const isPathClear = (fromRow, fromCol, toRow, toCol, board) => {
    const rowStep = toRow === fromRow ? 0 : toRow > fromRow ? 1 : -1;
    const colStep = toCol === fromCol ? 0 : toCol > fromCol ? 1 : -1;
    let row = fromRow + rowStep;
    let col = fromCol + colStep;
  
    while (row !== toRow || col !== toCol) {
      if (board[row][col]) return false; // هناك قطعة في الطريق
      row += rowStep;
      col += colStep;
    }
    return true;
  };
  
  const isSameColor = (piece1, piece2) => {
    const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
    const blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];
    return (
      (whitePieces.includes(piece1) && whitePieces.includes(piece2)) ||
      (blackPieces.includes(piece1) && blackPieces.includes(piece2))
    );
  };