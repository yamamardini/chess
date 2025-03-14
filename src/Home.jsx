import { useState } from 'react';
import './Board.css'; // تأكد من وجود ملف CSS

const Home = ({ onStartGame, onStartAIGame }) => {
  const [showLevels, setShowLevels] = useState(false); // حالة إظهار/إخفاء القائمة

  const handleAIClick = () => {
    setShowLevels(!showLevels); // تبديل إظهار/إخفاء القائمة
  };

  const handleLevelClick = (level) => {
    onStartAIGame(level); // بدء اللعبة مع المستوى المحدد
    setShowLevels(false); // إخفاء القائمة بعد الاختيار
  };

  return (
    <div className="home">
      <div className="logo">
        <span className="knight">♘</span>
      </div>
      <div className="buttons-container"> {/* المستطيل الجديد */}
        <button className="start-button" onClick={onStartGame}>
        one vs one
        </button>
        <button className="Ai-button" onClick={handleAIClick}>
          You vs AI
        </button>
        {showLevels && (
          <div className="levels-menu">
            {[1, 2, 3 ,4, 5, 6, 7, 8].map((level) => (
              <div
                key={level}
                className="level-option"
                onClick={() => handleLevelClick(level)}
              >
               level  {level}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;