
const Promotion = ({ currentPlayer, onSelectPiece }) => {
  const pieces = currentPlayer === 'white' ? ['♕', '♖', '♗', '♘'] : ['♛', '♜', '♝', '♞'];

  return (
    <div className="promotion-modal">
      <h3>اختر قطعة للترقية:</h3>
      <div className="promotion-options">
        {pieces.map((piece, index) => (
          <div key={index} className="promotion-option" onClick={() => onSelectPiece(piece)}>
            {piece}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Promotion;