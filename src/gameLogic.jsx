// logic/gameLogic.js
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
      case 'p':
        const direction = isWhite ? -1 : 1;
        if (addMove(row + direction, col)) {
          if ((isWhite && row === 6) || (!isWhite && row === 1)) {
            addMove(row + 2 * direction, col);
          }
        }
        addMove(row + direction, col - 1);
        addMove(row + direction, col + 1);
        break;
  
      case 'n':
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
  
      // ... (بقية القطع)
    }
  
    return moves;
  };
  
  export const isCheckmate = (board, kingPosition, enemyColor) => {
    if (!kingPosition) return false;
    const kingMoves = getValidMoves(board, kingPosition.row, kingPosition.col);
    return kingMoves.length === 0;
  };
  
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