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
          <img src="src/360_F_571998686_7q0qDN2lvCn5wv90SHEepoffd0Pq8NRY.jpg" />
          <button id="start-button" onClick={handleStartGame}>
          starts
          </button>
        </div>
      ) : (
        <Chessboard /> // إظهار لوحة الشطرنج
      )}
    </div>
  );
};

export default Intro;