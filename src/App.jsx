import React, { useState } from 'react';
import Home from './Home';
import Board from './Board';

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <Home onStartGame={handleStartGame} />
      ) : (
        <Board />
      )}
    </div>
  );
}

export default App;