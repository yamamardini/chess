import { useState } from 'react';
import GameService from './GameService';
import './OnlineLobby.css';

const OnlineLobby = ({ onJoinGame, onBack }) => {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setIsCreating(true);
    setError('');
    
    try {
      const newGameCode = await GameService.createGame(playerName);
      onJoinGame(newGameCode, playerName);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameCode.trim()) {
      setError('Please enter both your name and game code');
      return;
    }
    
    setIsJoining(true);
    setError('');
    
    try {
      const gameExists = await GameService.checkGameExists(gameCode);
      if (!gameExists) {
        setError('Game not found. Please check the code.');
        return;
      }
      
      onJoinGame(gameCode, playerName);
    } catch (err) {
      setError('Failed to join game. Please try again.');
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="online-lobby">
      <h2>Online Chess</h2>
      <p>Play chess with friends in real-time</p>
      
      <div className="lobby-options">
        <div className="player-info">
          <label>Your Name:</label>
          <input 
            type="text" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        
        <div className="join-game">
          <label>Game Code:</label>
          <input 
            type="text" 
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            placeholder="Enter game code"
          />
          <button 
            onClick={handleJoinGame}
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </div>
        
        <div className="separator">OR</div>
        
        <button 
          className="create-game"
          onClick={handleCreateGame}
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create New Game'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <button className="back-button" onClick={onBack}>
        Back to Main Menu
      </button>
    </div>
  );
};

export default OnlineLobby;