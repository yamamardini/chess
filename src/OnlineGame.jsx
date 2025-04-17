import { useState, useEffect } from 'react';
import Board from './Board';
import GameService from './GameService';
import './OnlineGame.css';

const OnlineGame = ({ gameCode, playerName, onExit }) => {
  const [board, setBoard] = useState(GameService.getInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [opponentName, setOpponentName] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [isConnected, setIsConnected] = useState(false);
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);

  useEffect(() => {
    const initGame = async () => {
      try {
        const gameState = await GameService.joinGame(gameCode, playerName);
        
        if (gameState) {
          setBoard(gameState.board || GameService.getInitialBoard());
          setCurrentPlayer(gameState.currentPlayer || 'white');
          setOpponentName(gameState.players.find(p => p.name !== playerName)?.name || '');
          setGameStatus(gameState.status || 'waiting');
          setIsConnected(true);
          
          if (gameState.moveHistory) {
            setMoveHistory(gameState.moveHistory);
          }
        }
        
        // Set up real-time updates
        GameService.subscribeToGameUpdates(gameCode, (updatedGame) => {
          if (updatedGame.board) setBoard(updatedGame.board);
          if (updatedGame.currentPlayer) setCurrentPlayer(updatedGame.currentPlayer);
          if (updatedGame.status) setGameStatus(updatedGame.status);
          if (updatedGame.winner) setWinner(updatedGame.winner);
          if (updatedGame.moveHistory) setMoveHistory(updatedGame.moveHistory);
        });
      } catch (error) {
        console.error("Failed to join game:", error);
        alert("Failed to join game. Please try again.");
        onExit();
      }
    };

    initGame();

    return () => {
      GameService.unsubscribeFromGameUpdates(gameCode);
    };
  }, [gameCode, playerName, onExit]);

  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    if (gameStatus !== 'playing' || currentPlayer !== 'white') return;
    
    const newBoard = GameService.makeMove(board, fromRow, fromCol, toRow, toCol);
    const updatedGame = {
      board: newBoard,
      currentPlayer: 'black',
      moveHistory: [...moveHistory, { from: [fromRow, fromCol], to: [toRow, toCol] }]
    };
    
    GameService.updateGameState(gameCode, updatedGame);
  };

  const handlePromotion = (piece) => {
    // Handle promotion logic
    const lastMove = moveHistory[moveHistory.length - 1];
    if (!lastMove) return;
    
    const [toRow, toCol] = lastMove.to;
    const newBoard = [...board];
    newBoard[toRow][toCol] = piece;
    
    const updatedGame = {
      board: newBoard,
      currentPlayer: 'black'
    };
    
    GameService.updateGameState(gameCode, updatedGame);
  };

  return (
    <div className="online-game-container">
      <div className="game-header">
        <h2>Online Game: {gameCode}</h2>
        <div className="player-info">
          <span>You: {playerName} ({currentPlayer === 'white' ? 'White' : 'Black'})</span>
          <span>Opponent: {opponentName || 'Waiting...'}</span>
        </div>
      </div>
      
      {gameStatus === 'waiting' && (
        <div className="waiting-room">
          <h3>Waiting for opponent to join...</h3>
          <p>Share this code with your opponent: <strong>{gameCode}</strong></p>
          <button onClick={onExit}>Cancel</button>
        </div>
      )}
      
      {gameStatus === 'playing' && (
        <Board 
          board={board} 
          onMove={handleMove}
          onPromotion={handlePromotion}
          currentPlayer={currentPlayer}
          isOnlineMode={true}
        />
      )}
      
      {winner && (
        <div className="game-result">
          <h2>{winner === playerName ? 'You won!' : `${opponentName} won!`}</h2>
          <button onClick={onExit}>Return to Menu</button>
        </div>
      )}
    </div>
  );
};

export default OnlineGame;