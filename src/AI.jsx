const AI = {
  getMove(board, level) {
    const moves = this.getAllMoves(board, 'black'); // الحصول على جميع الحركات الممكنة للأسود
    if (moves.length === 0) return null;

    // دالة مساعدة لتقييم الحركة بناءً على قيمة القطعة
    const evaluateMove = (move) => {
      const pieceValue = {
        pawn: 10,
        knight: 40,
        bishop: 30,
        rook: 55,
        queen: 80,
        king: 100,
      };
      const targetPiece = board[move.toRow][move.toCol];
      return targetPiece ? pieceValue[targetPiece.type] || 0 : 0;
    };

    // دالة مساعدة للبحث عن أفضل حركة بناءً على التقييم
    const findBestMove = (moves) => {
      let bestMove = null;
      let bestValue = -Infinity;
      for (const move of moves) {
        const value = evaluateMove(move);
        if (value > bestValue) {
          bestValue = value;
          bestMove = move;
        }
      }
      return bestMove;
    };

    // دالة مساعدة لتقييم الوضع الحالي للوحة
    const evaluateBoard = (board) => {
      let total = 0;
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          const piece = board[row][col];
          if (piece && piece.color === 'black') {
            total += evaluateMove({ toRow: row, toCol: col });
          } else if (piece && piece.color === 'white') {
            total -= evaluateMove({ toRow: row, toCol: col });
          }
        }
      }
      return total;
    };

    // دالة مساعدة للبحث عن أفضل حركة باستخدام خوارزمية Minimax
    const minimax = (board, depth, isMaximizing) => {
      if (depth === 0) {
        return evaluateBoard(board);
      }

      const player = isMaximizing ? 'black' : 'white';
      const moves = this.getAllMoves(board, player);

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
          const tempBoard = JSON.parse(JSON.stringify(board));
          tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
          tempBoard[move.fromRow][move.fromCol] = '';
          const evaluation = minimax(tempBoard, depth - 1, false);
          maxEval = Math.max(maxEval, evaluation);
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const move of moves) {
          const tempBoard = JSON.parse(JSON.stringify(board));
          tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
          tempBoard[move.fromRow][move.fromCol] = '';
          const evaluation = minimax(tempBoard, depth - 1, true);
          minEval = Math.min(minEval, evaluation);
        }
        return minEval;
      }
    };

    // المستوى 1: حركة عشوائية تمامًا
    if (level === 1) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // المستوى 2: يفضل الحركات التي تأخذ قطعة
    else if (level === 2) {
      const captureMove = moves.find((move) => board[move.toRow][move.toCol] !== '');
      return captureMove || moves[Math.floor(Math.random() * moves.length)];
    }

    // المستوى 3: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى
    else if (level === 3) {
      const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
      if (captureMoves.length > 0) {
        return findBestMove(captureMoves);
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // المستوى 4: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى، ويتجنب فقدان القطع
    else if (level === 4) {
      const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
      if (captureMoves.length > 0) {
        return findBestMove(captureMoves);
      }
      // يتجنب الحركات التي تؤدي إلى فقدان قطعة
      const safeMoves = moves.filter((move) => {
        const tempBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
        tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = '';
        const opponentMoves = this.getAllMoves(tempBoard, 'white');
        return !opponentMoves.some(
          (oppMove) => oppMove.toRow === move.toRow && oppMove.toCol === move.toCol
        );
      });
      return safeMoves.length > 0
        ? safeMoves[Math.floor(Math.random() * safeMoves.length)]
        : moves[Math.floor(Math.random() * moves.length)];
    }

    // المستوى 5: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى، ويتجنب فقدان القطع، ويحسن وضعية القطع
    else if (level === 5) {
      const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
      if (captureMoves.length > 0) {
        return findBestMove(captureMoves);
      }
      // يتجنب الحركات التي تؤدي إلى فقدان قطعة
      const safeMoves = moves.filter((move) => {
        const tempBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
        tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = '';
        const opponentMoves = this.getAllMoves(tempBoard, 'white');
        return !opponentMoves.some(
          (oppMove) => oppMove.toRow === move.toRow && oppMove.toCol === move.toCol
        );
      });
      if (safeMoves.length > 0) {
        return safeMoves[Math.floor(Math.random() * safeMoves.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // المستوى 6: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى، ويتجنب فقدان القطع، ويحسن وضعية القطع بشكل أكبر
    else if (level === 6) {
      const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
      if (captureMoves.length > 0) {
        return findBestMove(captureMoves);
      }
      // يتجنب الحركات التي تؤدي إلى فقدان قطعة
      const safeMoves = moves.filter((move) => {
        const tempBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
        tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = '';
        const opponentMoves = this.getAllMoves(tempBoard, 'white');
        return !opponentMoves.some(
          (oppMove) => oppMove.toRow === move.toRow && oppMove.toCol === move.toCol
        );
      });
      if (safeMoves.length > 0) {
        // يفضل الحركات التي تحسن وضعية القطع (مثل تحريك القطع إلى مربعات أكثر أمانًا)
        const improvedMoves = safeMoves.filter((move) => {
          const tempBoard = JSON.parse(JSON.stringify(board));
          tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
          tempBoard[move.fromRow][move.fromCol] = '';
          const opponentMoves = this.getAllMoves(tempBoard, 'white');
          return opponentMoves.length < moves.length; // إذا قل عدد حركات الخصم، فهذه حركة جيدة
        });
        return improvedMoves.length > 0
          ? improvedMoves[Math.floor(Math.random() * improvedMoves.length)]
          : safeMoves[Math.floor(Math.random() * safeMoves.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // المستوى 7: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى، ويتجنب فقدان القطع، ويحسن وضعية القطع بشكل أكبر، ويفكر خطوة إلى الأمام
    else if (level === 7) {
      const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
      if (captureMoves.length > 0) {
        return findBestMove(captureMoves);
      }
      // يتجنب الحركات التي تؤدي إلى فقدان قطعة
      const safeMoves = moves.filter((move) => {
        const tempBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
        tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = '';
        const opponentMoves = this.getAllMoves(tempBoard, 'white');
        return !opponentMoves.some(
          (oppMove) => oppMove.toRow === move.toRow && oppMove.toCol === move.toCol
        );
      });
      if (safeMoves.length > 0) {
        // يفضل الحركات التي تحسن وضعية القطع (مثل تحريك القطع إلى مربعات أكثر أمانًا)
        const improvedMoves = safeMoves.filter((move) => {
          const tempBoard = JSON.parse(JSON.stringify(board));
          tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
          tempBoard[move.fromRow][move.fromCol] = '';
          const opponentMoves = this.getAllMoves(tempBoard, 'white');
          return opponentMoves.length < moves.length; // إذا قل عدد حركات الخصم، فهذه حركة جيدة
        });
        return improvedMoves.length > 0
          ? improvedMoves[Math.floor(Math.random() * improvedMoves.length)]
          : safeMoves[Math.floor(Math.random() * safeMoves.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // المستوى 8: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى، ويتجنب فقدان القطع، ويحسن وضعية القطع بشكل أكبر، ويفكر خطوتين إلى الأمام
    else if (level === 8) {
      const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
      if (captureMoves.length > 0) {
        return findBestMove(captureMoves);
      }
      // يتجنب الحركات التي تؤدي إلى فقدان قطعة
      const safeMoves = moves.filter((move) => {
        const tempBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
        tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = '';
        const opponentMoves = this.getAllMoves(tempBoard, 'white');
        return !opponentMoves.some(
          (oppMove) => oppMove.toRow === move.toRow && oppMove.toCol === move.toCol
        );
      });
      if (safeMoves.length > 0) {
        // يفضل الحركات التي تحسن وضعية القطع (مثل تحريك القطع إلى مربعات أكثر أمانًا)
        const improvedMoves = safeMoves.filter((move) => {
          const tempBoard = JSON.parse(JSON.stringify(board));
          tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
          tempBoard[move.fromRow][move.fromCol] = '';
          const opponentMoves = this.getAllMoves(tempBoard, 'white');
          return opponentMoves.length < moves.length; // إذا قل عدد حركات الخصم، فهذه حركة جيدة
        });
        return improvedMoves.length > 0
          ? improvedMoves[Math.floor(Math.random() * improvedMoves.length)]
          : safeMoves[Math.floor(Math.random() * safeMoves.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // المستوى 9: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى، ويتجنب فقدان القطع، ويحسن وضعية القطع بشكل أكبر، ويفكر ثلاث خطوات إلى الأمام
    else if (level === 9) {
      const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
      if (captureMoves.length > 0) {
        return findBestMove(captureMoves);
      }
      // يتجنب الحركات التي تؤدي إلى فقدان قطعة
      const safeMoves = moves.filter((move) => {
        const tempBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
        tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = '';
        const opponentMoves = this.getAllMoves(tempBoard, 'white');
        return !opponentMoves.some(
          (oppMove) => oppMove.toRow === move.toRow && oppMove.toCol === move.toCol
        );
      });
      if (safeMoves.length > 0) {
        // يفضل الحركات التي تحسن وضعية القطع (مثل تحريك القطع إلى مربعات أكثر أمانًا)
        const improvedMoves = safeMoves.filter((move) => {
          const tempBoard = JSON.parse(JSON.stringify(board));
          tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
          tempBoard[move.fromRow][move.fromCol] = '';
          const opponentMoves = this.getAllMoves(tempBoard, 'white');
          return opponentMoves.length < moves.length; // إذا قل عدد حركات الخصم، فهذه حركة جيدة
        });
        return improvedMoves.length > 0
          ? improvedMoves[Math.floor(Math.random() * improvedMoves.length)]
          : safeMoves[Math.floor(Math.random() * safeMoves.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

        // المستوى 10: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى، ويتجنب فقدان القطع، ويحسن وضعية القطع بشكل أكبر، ويفكر أربع خطوات إلى الأمام
        else if (level === 10) {
          const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
          if (captureMoves.length > 0) {
            return findBestMove(captureMoves);
          }
          // يتجنب الحركات التي تؤدي إلى فقدان قطعة
          const safeMoves = moves.filter((move) => {
            const tempBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
            tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
            tempBoard[move.fromRow][move.fromCol] = '';
            const opponentMoves = this.getAllMoves(tempBoard, 'white');
            return !opponentMoves.some(
              (oppMove) => oppMove.toRow === move.toRow && oppMove.toCol === move.toCol
            );
          });
          if (safeMoves.length > 0) {
            // يفضل الحركات التي تحسن وضعية القطع (مثل تحريك القطع إلى مربعات أكثر أمانًا)
            const improvedMoves = safeMoves.filter((move) => {
              const tempBoard = JSON.parse(JSON.stringify(board));
              tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
              tempBoard[move.fromRow][move.fromCol] = '';
              const opponentMoves = this.getAllMoves(tempBoard, 'white');
              return opponentMoves.length < moves.length; // إذا قل عدد حركات الخصم، فهذه حركة جيدة
            });
            if (improvedMoves.length > 0) {
              // يفكر في أربع خطوات إلى الأمام
              const bestMove = improvedMoves.reduce((best, move) => {
                let moveValue = 0;
                for (let i = 0; i < 4; i++) { // أربع خطوات إلى الأمام
                  const tempBoard = JSON.parse(JSON.stringify(board));
                  tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
                  tempBoard[move.fromRow][move.fromCol] = '';
                  const opponentResponse = this.getAllMoves(tempBoard, 'white');
                  if (opponentResponse.length === 0) {
                    moveValue += 100; // إذا كان الخصم لا يملك حركات، فهذه حركة ممتازة
                  } else {
                    moveValue -= opponentResponse.length; // كلما قل عدد حركات الخصم، كانت الحركة أفضل
                  }
                }
                if (moveValue > best.value) {
                  return { move, value: moveValue };
                }
                return best;
              }, { move: null, value: -Infinity });
    
              return bestMove.move || improvedMoves[Math.floor(Math.random() * improvedMoves.length)];
            }
            return safeMoves[Math.floor(Math.random() * safeMoves.length)];
          }
          return moves[Math.floor(Math.random() * moves.length)];
        }
    
        // المستوى 11: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى، ويتجنب فقدان القطع، ويحسن وضعية القطع بشكل أكبر، ويفكر خمس خطوات إلى الأمام
        else if (level === 11) {
          const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
          if (captureMoves.length > 0) {
            return findBestMove(captureMoves);
          }
          // يتجنب الحركات التي تؤدي إلى فقدان قطعة
          const safeMoves = moves.filter((move) => {
            const tempBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
            tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
            tempBoard[move.fromRow][move.fromCol] = '';
            const opponentMoves = this.getAllMoves(tempBoard, 'white');
            return !opponentMoves.some(
              (oppMove) => oppMove.toRow === move.toRow && oppMove.toCol === move.toCol
            );
          });
          if (safeMoves.length > 0) {
            // يفضل الحركات التي تحسن وضعية القطع (مثل تحريك القطع إلى مربعات أكثر أمانًا)
            const improvedMoves = safeMoves.filter((move) => {
              const tempBoard = JSON.parse(JSON.stringify(board));
              tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
              tempBoard[move.fromRow][move.fromCol] = '';
              const opponentMoves = this.getAllMoves(tempBoard, 'white');
              return opponentMoves.length < moves.length; // إذا قل عدد حركات الخصم، فهذه حركة جيدة
            });
            if (improvedMoves.length > 0) {
              // يفكر في خمس خطوات إلى الأمام
              const bestMove = improvedMoves.reduce((best, move) => {
                let moveValue = 0;
                for (let i = 0; i < 5; i++) { // خمس خطوات إلى الأمام
                  const tempBoard = JSON.parse(JSON.stringify(board));
                  tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
                  tempBoard[move.fromRow][move.fromCol] = '';
                  const opponentResponse = this.getAllMoves(tempBoard, 'white');
                  if (opponentResponse.length === 0) {
                    moveValue += 100; // إذا كان الخصم لا يملك حركات، فهذه حركة ممتازة
                  } else {
                    moveValue -= opponentResponse.length; // كلما قل عدد حركات الخصم، كانت الحركة أفضل
                  }
                }
                if (moveValue > best.value) {
                  return { move, value: moveValue };
                }
                return best;
              }, { move: null, value: -Infinity });
    
              return bestMove.move || improvedMoves[Math.floor(Math.random() * improvedMoves.length)];
            }
            return safeMoves[Math.floor(Math.random() * safeMoves.length)];
          }
          return moves[Math.floor(Math.random() * moves.length)];
        }
    
        // المستوى 12: يفضل الحركات التي تأخذ قطعة ذات قيمة أعلى، ويتجنب فقدان القطع، ويحسن وضعية القطع بشكل أكبر، ويفكر ست خطوات إلى الأمام
        else if (level === 12) {
          const captureMoves = moves.filter((move) => board[move.toRow][move.toCol] !== '');
          if (captureMoves.length > 0) {
            return findBestMove(captureMoves);
          }
          // يتجنب الحركات التي تؤدي إلى فقدان قطعة
          const safeMoves = moves.filter((move) => {
            const tempBoard = JSON.parse(JSON.stringify(board)); // نسخ اللوحة
            tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
            tempBoard[move.fromRow][move.fromCol] = '';
            const opponentMoves = this.getAllMoves(tempBoard, 'white');
            return !opponentMoves.some(
              (oppMove) => oppMove.toRow === move.toRow && oppMove.toCol === move.toCol
            );
          });
          if (safeMoves.length > 0) {
            // يفضل الحركات التي تحسن وضعية القطع (مثل تحريك القطع إلى مربعات أكثر أمانًا)
            const improvedMoves = safeMoves.filter((move) => {
              const tempBoard = JSON.parse(JSON.stringify(board));
              tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
              tempBoard[move.fromRow][move.fromCol] = '';
              const opponentMoves = this.getAllMoves(tempBoard, 'white');
              return opponentMoves.length < moves.length; // إذا قل عدد حركات الخصم، فهذه حركة جيدة
            });
            if (improvedMoves.length > 0) {
              // يفكر في ست خطوات إلى الأمام
              const bestMove = improvedMoves.reduce((best, move) => {
                let moveValue = 0;
                for (let i = 0; i < 6; i++) { // ست خطوات إلى الأمام
                  const tempBoard = JSON.parse(JSON.stringify(board));
                  tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
                  tempBoard[move.fromRow][move.fromCol] = '';
                  const opponentResponse = this.getAllMoves(tempBoard, 'white');
                  if (opponentResponse.length === 0) {
                    moveValue += 100; // إذا كان الخصم لا يملك حركات، فهذه حركة ممتازة
                  } else {
                    moveValue -= opponentResponse.length; // كلما قل عدد حركات الخصم، كانت الحركة أفضل
                  }
                }
                if (moveValue > best.value) {
                  return { move, value: moveValue };
                }
                return best;
              }, { move: null, value: -Infinity });
    
              return bestMove.move || improvedMoves[Math.floor(Math.random() * improvedMoves.length)];
            }
            return safeMoves[Math.floor(Math.random() * safeMoves.length)];
          }
          return moves[Math.floor(Math.random() * moves.length)];
        }
    
        // المستوى الافتراضي: حركة عشوائية
        else {
          console.log('error');
        }
      },
  
  // تقييم اللوحة
  evaluateBoard(board) {
    if (this.isCheckmate(board, 'white')) {
      return -Infinity;
    }
    if (this.isCheckmate(board, 'black')) {
      return Infinity;
    }
    if (this.isStalemate(board, 'white') || this.isStalemate(board, 'black')) {
      return 0;
    }

    let score = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          score += this.getPieceValue(piece);
          score += this.getPiecePositionScore(piece, row, col);
        }
      }
    }
    return score;
  },

  // الحصول على قيمة القطعة
  getPieceValue(piece) {
    switch (piece) {
      case '♔':
      case '♚':
        return 900;
      case '♕':
      case '♛':
        return 90;
      case '♖':
      case '♜':
        return 50;
      case '♗':
      case '♝':
        return 30;
      case '♘':
      case '♞':
        return 30;
      case '♙':
      case '♟':
        return 10;
      default:
        return 0;
    }
  },
  // الحصول على قيمة الموقع للقطعة
  getPiecePositionScore(piece, row, col) {
    const pieceType = piece.toLowerCase();
    const positionTables = {
      '♙': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 5, 5, 5, 5, 5, 5, 5],
        [1, 1, 2, 3, 3, 2, 1, 1],
        [0, 0, 0, 2, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      '♘': [
        [-5, -4, -3, -3, -3, -3, -4, -5],
        [-4, -2, 0, 0, 0, 0, -2, -4],
        [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
        [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
        [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
        [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
        [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
        [-5, -4, -3, -3, -3, -3, -4, -5],
      ],
      '♗': [
        [-2, -1, -1, -1, -1, -1, -1, -2],
        [-1, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
        [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
        [-1, 0, 1, 1, 1, 1, 0, -1],
        [-1, 1, 1, 1, 1, 1, 1, -1],
        [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
        [-2, -1, -1, -1, -1, -1, -1, -2],
      ],
      '♖': [
        [0, 0, 0, 0.5, 0.5, 0, 0, 0],
        [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
        [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
        [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
        [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
        [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
        [0.5, 1, 1, 1, 1, 1, 1, 0.5],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      '♕': [
        [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
        [-1, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
        [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
        [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
        [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
        [-1, 0, 0.5, 0, 0, 0, 0, -1],
        [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
      ],
      '♔': [
        [-3, -4, -4, -5, -5, -4, -4, -3],
        [-3, -4, -4, -5, -5, -4, -4, -3],
        [-3, -4, -4, -5, -5, -4, -4, -3],
        [-3, -4, -4, -5, -5, -4, -4, -3],
        [-2, -3, -3, -4, -4, -3, -3, -2],
        [-1, -2, -2, -2, -2, -2, -2, -1],
        [2, 2, 0, 0, 0, 0, 2, 2],
        [2, 3, 1, 0, 0, 1, 3, 2],
      ]
    };

    if (positionTables[pieceType]) {
      return positionTables[pieceType][row][col];
    }
    return 0;
  },

  // الحصول على جميع الحركات الممكنة للاعب
  getAllMoves(board, player) {
    const moves = [];
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = board[fromRow][fromCol];
        if (piece && this.isPlayerPiece(piece, player)) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (this.isMoveValid(piece, fromRow, fromCol, toRow, toCol, board)) {
                const newBoard = this.makeMove(board, fromRow, fromCol, toRow, toCol);
                if (!this.isKingInCheck(newBoard, player)) {
                  moves.push({ fromRow, fromCol, toRow, toCol });
                }
              }
            }
          }
        }
      }
    }
    return moves;
  },

  // التحقق من أن القطعة تخص اللاعب
  isPlayerPiece(piece, player) {
    if (player === 'white') {
      return ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece);
    } else {
      return ['♚', '♛', '♜', '♝', '♞', '♟'].includes(piece);
    }
  },

  // التحقق من صحة الحركة
  isMoveValid(piece, fromRow, fromCol, toRow, toCol, board) {
    const pieceType = piece.toLowerCase();
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // التحقق من أن الهدف ليس قطعة من نفس اللون
    const targetPiece = board[toRow][toCol];
    if (targetPiece && this.isSameColor(piece, targetPiece)) {
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
          this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        );

      case '♖': // الرخ (Rook)
      case '♜':
        return (
          (rowDiff === 0 || colDiff === 0) &&
          this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        );

      case '♗': // الفيل (Bishop)
      case '♝':
        return (
          rowDiff === colDiff &&
          this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        );

      case '♘': // الحصان (Knight)
      case '♞':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case '♙': // البيدق الأبيض (Pawn)
        if (colDiff === 0) {
          return (
            (toRow === fromRow - 1 && !board[toRow][toCol]) || // حركة واحدة
            (fromRow === 6 && toRow === 4 && !board[5][toCol] && !board[4][toCol]) // حركتان
          );
        } else if (colDiff === 1 && toRow === fromRow - 1) {
          return !!board[toRow][toCol];
        }
        return false;

      case '♟': // البيدق الأسود (Pawn)
        if (colDiff === 0) {
          return (
            (toRow === fromRow + 1 && !board[toRow][toCol]) || // حركة واحدة
            (fromRow === 1 && toRow === 3 && !board[2][toCol] && !board[3][toCol]) // حركتان
          );
        } else if (colDiff === 1 && toRow === fromRow + 1) {
          return !!board[toRow][toCol];
        }
        return false;

      default:
        return false;
    }
  },

  // التحقق من أن القطعتين من نفس اللون
  isSameColor(piece1, piece2) {
    const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
    const blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];
    return (
      (whitePieces.includes(piece1) && whitePieces.includes(piece2)) ||
      (blackPieces.includes(piece1) && blackPieces.includes(piece2))
    );
  },

  // التحقق من أن المسار بين القطعتين فارغ
  isPathClear(fromRow, fromCol, toRow, toCol, board) {
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
  },

  // تنفيذ الحركة على اللوحة
  makeMove(board, fromRow, fromCol, toRow, toCol) {
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    return newBoard;
  },

  // التحقق من أن الملك في حالة كش
  isKingInCheck(board, player) {
    const king = player === 'white' ? '♔' : '♚';
    let kingRow, kingCol;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === king) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
    }
    // تحقق من وجود أي قطعة معادية يمكنها مهاجمة الملك
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && this.isOpponentPiece(piece, player)) {
          if (this.isMoveValid(piece, row, col, kingRow, kingCol, board)) {
            return true;
          }
        }
      }
    }
    return false;
  },

  // التحقق من أن القطعة معادية
  isOpponentPiece(piece, player) {
    if (player === 'white') {
      return ['♚', '♛', '♜', '♝', '♞', '♟'].includes(piece);
    } else {
      return ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece);
    }
  },

  // الحصول على أفضل حركة باستخدام Minimax
  getBestMove(board, moves, depth) {
    if (this.isGameOver(board)) {
      return null;
    }
    let bestMove = null;
    let bestValue = -Infinity;

    for (const move of moves) {
      const newBoard = this.makeMove(board, move.fromRow, move.fromCol, move.toRow, move.toCol);
      const value = this.minimax(newBoard, depth - 1, -Infinity, Infinity, false);
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    return bestMove;
  },

  // خوارزمية Minimax مع Alpha-Beta Pruning
  minimax(board, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || this.isGameOver(board)) {
      return this.evaluateBoard(board);
    }

    const moves = this.getAllMoves(board, isMaximizing ? 'black' : 'white');
    if (isMaximizing) {
      let value = -Infinity;
      for (const move of moves) {
        const newBoard = this.makeMove(board, move.fromRow, move.fromCol, move.toRow, move.toCol);
        value = Math.max(value, this.minimax(newBoard, depth - 1, alpha, beta, false));
        alpha = Math.max(alpha, value);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return value;
    } else {
      let value = Infinity;
      for (const move of moves) {
        const newBoard = this.makeMove(board, move.fromRow, move.fromCol, move.toRow, move.toCol);
        value = Math.min(value, this.minimax(newBoard, depth - 1, alpha, beta, true));
        beta = Math.min(beta, value);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return value;
    }
  },

  
  // التحقق من انتهاء اللعبة
  isGameOver(board) {
    return this.isCheckmate(board, 'white') || this.isCheckmate(board, 'black') || this.isStalemate(board, 'white') || this.isStalemate(board, 'black');
  },

  // التحقق من كش ملك
  isCheckmate(board, player) {
    const moves = this.getAllMoves(board, player);
    return moves.length === 0 && this.isKingInCheck(board, player);
  }
};

export default AI;