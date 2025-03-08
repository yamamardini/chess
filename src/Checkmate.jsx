export const isCheck = (board, currentPlayer) => {
    const king = currentPlayer === 'white' ? '♔' : '♚';
    let kingRow, kingCol;
  
    // البحث عن موقع الملك
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === king) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== undefined) break;
    }
  
    // التحقق من تعرض الملك للهجوم
    return isSquareAttacked(kingRow, kingCol, board, currentPlayer);
  };
  
  export const isCheckmate = (board, currentPlayer) => {
    if (!isCheck(board, currentPlayer)) return false;
  
    // التحقق من وجود حركات متاحة للاعب الحالي
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && isSameColor(piece, currentPlayer === 'white' ? '♔' : '♚')) {
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (isMoveValid(piece, row, col, i, j, board)) {
                const newBoard = makeMove(board, row, col, i, j);
                if (!isCheck(newBoard, currentPlayer)) {
                  return false; // هناك حركة تمنع الكش مات
                }
              }
            }
          }
        }
      }
    }
  
    return true; // لا توجد حركات متاحة، كش مات
  };
  
  const isSquareAttacked = (row, col, board, currentPlayer) => {
    const opponentPieces = currentPlayer === 'white' ? ['♚', '♛', '♜', '♝', '♞', '♟'] : ['♔', '♕', '♖', '♗', '♘', '♙'];
  
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (opponentPieces.includes(piece)) {
          if (isMoveValid(piece, i, j, row, col, board)) {
            return true;
          }
        }
      }
    }
    return false;
  };
  
  const makeMove = (board, fromRow, fromCol, toRow, toCol) => {
    const newBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    return newBoard;
  };
  
  const isSameColor = (piece1, piece2) => {
    const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
    const blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];
    return (
      (whitePieces.includes(piece1) && whitePieces.includes(piece2)) ||
      (blackPieces.includes(piece1) && blackPieces.includes(piece2))
    );
  };
  
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