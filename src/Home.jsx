import React from 'react';
import './Board.jsx';

const Home = ({ onStartGame }) => {
  return (
    <div className="home">
      <div className="logo">
        <span className="knight">♘</span>
      </div>
      <button className="start-button" onClick={onStartGame}>
     one vs one
      </button>
    </div>
  );
};

export default Home;