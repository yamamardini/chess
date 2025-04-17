import { useState } from 'react';
import Home from './Home';
import Board from './Board';
import OnlineLobby from './OnlineLobby';
import OnlineGame from './OnlineGame';

const App = () => {
  const [gameMode, setGameMode] = useState('home'); // 'home', 'local', 'ai', 'online-lobby', 'online-game'
  const [aiLevel, setAiLevel] = useState(1);
  const [onlineGameCode, setOnlineGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleStartGame = () => {
    setGameMode('local');
  };

  const handleStartAIGame = (level) => {
    setAiLevel(level);
    setGameMode('ai');
  };

  const handleStartOnlineGame = () => {
    setGameMode('online-lobby');
  };

  const handleJoinOnlineGame = (code, name) => {
    setOnlineGameCode(code);
    setPlayerName(name);
    setGameMode('online-game');
  };

  const handleExitOnlineGame = () => {
    setGameMode('home');
  };

  return (
    <div className="app">
      {gameMode === 'home' && (
        <Home 
          onStartGame={handleStartGame}
          onStartAIGame={handleStartAIGame}
          onStartOnlineGame={handleStartOnlineGame}
        />
      )}
      
      {gameMode === 'local' && (
        <Board 
          isAIMode={false}
          onExit={() => setGameMode('home')}
        />
      )}
      
      {gameMode === 'ai' && (
        <Board 
          isAIMode={true}
          aiLevel={aiLevel}
          onExit={() => setGameMode('home')}
        />
      )}
      
      {gameMode === 'online-lobby' && (
        <OnlineLobby 
          onJoinGame={handleJoinOnlineGame}
          onBack={() => setGameMode('home')}
        />
      )}
      
      {gameMode === 'online-game' && (
        <OnlineGame 
          gameCode={onlineGameCode}
          playerName={playerName}
          onExit={handleExitOnlineGame}
        />
      )}
    </div>
  );
};

export default App;