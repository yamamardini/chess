import { useState, useEffect } from 'react';
import './home.css';

const Home = ({ onStartGame, onStartAIGame, onStartOnlineGame }) => {
  const [showLevels, setShowLevels] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initAudio = () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        setAudioContext(ctx);
        
        document.addEventListener('click', () => {
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }, { once: true });
      }
    };
    
    initAudio();
    
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const playSound = (type) => {
    if (!audioContext) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const panner = audioContext.createStereoPanner();
      
      oscillator.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(audioContext.destination);
      
      panner.pan.value = Math.random() * 0.4 - 0.2;
      
      switch(type) {
        case 'hover':
          oscillator.type = 'sine';
          oscillator.frequency.value = 220;
          gainNode.gain.value = 0.15;
          break;
        case 'click':
          oscillator.type = 'square';
          oscillator.frequency.value = 440;
          gainNode.gain.value = 0.25;
          break;
        case 'select':
          oscillator.type = 'triangle';
          oscillator.frequency.value = 880;
          gainNode.gain.value = 0.2;
          break;
        default:
          oscillator.type = 'sine';
          oscillator.frequency.value = 660;
          gainNode.gain.value = 0.15;
      }
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001, 
        audioContext.currentTime + 0.3
      );
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  };

  const handleCardHover = () => playSound('hover');
  const handleButtonClick = () => playSound('click');

  const handleLevelSelect = async (level) => {
    playSound('select');
    setIsLoading(true);
    try {
      await onStartAIGame(level);
    } finally {
      setIsLoading(false);
      setShowLevels(false);
    }
  };

  const handleGameStart = async (gameType) => {
    playSound('click');
    setIsLoading(true);
    try {
      if (gameType === 'local') await onStartGame();
      if (gameType === 'online') await onStartOnlineGame();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="game-header">
        <h1 className="chess-mastery">Chess Mastery</h1>
        <p className="subtitle">
          Experience chess like never before with stunning visuals and adaptive AI
        </p>
      </div>

      <div className="game-options">
        {/* Local Play Card */}
        <div 
          className={`game-card ${isLoading ? 'loading' : ''}`}
          onMouseEnter={handleCardHover}
        >
          <h3>Local Play</h3>
          <p>
            Classic chess experience on one device. 
            Perfect for training or friendly matches.
          </p>
          <button 
            className="play-button"
            onClick={() => handleGameStart('local')}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Play Local'}
          </button>
        </div>

        {/* AI Challenge Card */}
        <div 
          className={`game-card ${isLoading ? 'loading' : ''}`}
          onMouseEnter={handleCardHover}
        >
          <h3>AI Challenge</h3>
          <p>
            Adaptive AI that learns your style. 
            12 unique difficulty levels for all players.
          </p>
          <button 
            className="play-button"
            onClick={() => {
              handleButtonClick();
              setShowLevels(true);
            }}
            disabled={isLoading}
          >
            Play vs AI
          </button>
        </div>

        {/* Online Play Card */}
        <div 
          className={`game-card ${isLoading ? 'loading' : ''}`}
          onMouseEnter={handleCardHover}
        >
          <h3>Online Play</h3>
          <p>
            Real-time matches with players worldwide. 
            Rankings, tournaments and more (Coming Soon).
          </p>
          <button 
          className="coming-soon-button" 
          onClick={handleButtonClick}
          disabled
          >
            Coming Soon
          </button>
        </div>
      </div>

      {showLevels && (
        <div className="levels-modal">
          <div className="levels-container">
            <button 
              className="close-levels"
              onClick={() => {
                handleButtonClick();
                setShowLevels(false);
              }}
              disabled={isLoading}
            >
              &times;
            </button>
            
            <div className="levels-header">
              <h3>Select AI Difficulty</h3>
              <p>Beginner to Grandmaster - Choose your challenge</p>
            </div>
            
            <div className="levels-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((level) => (
                <div
                  key={level}
                  className={`level-option ${level > 9 ? 'featured-level' : ''}`}
                  onClick={() => !isLoading && handleLevelSelect(level)}
                  onMouseEnter={handleCardHover}
                >
                  <div>Level {level}</div>
                  <span>
                    {level <= 3 && "Beginner"}
                    {level > 3 && level <= 6 && "Intermediate"}
                    {level > 6 && level <= 9 && "Advanced"}
                    {level > 9 && "Expert"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

<div className="page-footer">
  <div className="footer-message">
    Select a game mode to begin your chess journey
  </div>
  <div className="copyright">
    &copy; Yaman Mardini 2025. All rights reserved.
  </div>
</div>
    </div>
  );
};

export default Home;