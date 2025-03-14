import  { useState } from 'react';
import Home from './Home';
import Board from './Board';

const App = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiLevel, setAiLevel] = useState(1);

  const onStartGame = () => {
    setIsGameStarted(true);
    setIsAIMode(false); // وضع اللعب ضد لاعب آخر
  };

  const onStartAIGame = (level) => {
    setIsGameStarted(true);
    setIsAIMode(true);
    setAiLevel(level); // تحديد مستوى الذكاء الاصطناعي
  };

  return (
    <div className="app">
      {!isGameStarted ? (
        <Home onStartGame={onStartGame} onStartAIGame={onStartAIGame} />
      ) : (
        <Board isAIMode={isAIMode} aiLevel={aiLevel} />
      )}
    </div>
  );
};

export default App;