import { useState } from 'react';
import Chessboard from './Chessboard'; // استيراد مكون لوحة الشطرنج
import './Chessboard.css'; // استيراد ملف التنسيقات

const Intro = () => {
  const [showChessboard, setShowChessboard] = useState(false);

  const handleStartGame = () => {
    setShowChessboard(true); // إظهار لوحة الشطرنج
  };

  return (
    <div>
      {!showChessboard ? (
        <div id="intro">
          <img src="src/image/chess.png" />
          <button id="start-button" onClick={handleStartGame}>
          start
          </button>
        </div>
      ) : (
        <Chessboard /> // إظهار لوحة الشطرنج
      )}
    </div>
  );
};

export default Intro;