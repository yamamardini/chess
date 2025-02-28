// utils/chessUtils.js
export const whitePawn = '♙';
export const blackPawn = '♟';
export const whiteKnight = '♘';
export const blackKnight = '♞';
export const whiteBishop = '♗';
export const blackBishop = '♝';
export const whiteRook = '♖';
export const blackRook = '♜';
export const whiteQueen = '♕';
export const blackQueen = '♛';
export const whiteKing = '♔';
export const blackKing = '♚';

export const initialPieces = [
  ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
];

export const getPieceSymbol = (piece) => {
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

export const getSquareColor = (row, col) => {
  return (row + col) % 2 === 0 ? 'white' : 'black';
};