// Simulated game service using localStorage as a temporary backend
// In a real app, this would connect to a proper backend service

const GAME_EXPIRATION_MINUTES = 3; // Games expire after 3 minutes

const GameService = {
  games: {},
  
  getInitialBoard() {
    return [
      ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
      ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
      ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
  },
  
  generateGameCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  },
  
  async createGame(playerName) {
    const gameCode = this.generateGameCode();
    const newGame = {
      code: gameCode,
      board: this.getInitialBoard(),
      players: [{ name: playerName, color: 'white' }],
      currentPlayer: 'white',
      status: 'waiting',
      createdAt: new Date().getTime(),
      moveHistory: []
    };
    
    // Store in memory and localStorage
    this.games[gameCode] = newGame;
    localStorage.setItem(`chess_game_${gameCode}`, JSON.stringify(newGame));
    
    // Set expiration timer
    setTimeout(() => {
      this.cleanupGame(gameCode);
    }, GAME_EXPIRATION_MINUTES * 60 * 1000);
    
    return gameCode;
  },
  
  async joinGame(gameCode, playerName) {
    const game = this.getGame(gameCode);
    if (!game) throw new Error('Game not found');
    
    if (game.players.length >= 2) {
      throw new Error('Game is full');
    }
    
    // Add second player
    game.players.push({ name: playerName, color: 'black' });
    game.status = 'playing';
    
    // Update storage
    this.games[gameCode] = game;
    localStorage.setItem(`chess_game_${gameCode}`, JSON.stringify(game));
    
    return game;
  },
  
  async checkGameExists(gameCode) {
    return !!this.getGame(gameCode);
  },
  
  getGame(gameCode) {
    // Check memory first
    if (this.games[gameCode]) {
      return this.games[gameCode];
    }
    
    // Check localStorage
    const storedGame = localStorage.getItem(`chess_game_${gameCode}`);
    if (storedGame) {
      const game = JSON.parse(storedGame);
      this.games[gameCode] = game;
      return game;
    }
    
    return null;
  },
  
  updateGameState(gameCode, updates) {
    const game = this.getGame(gameCode);
    if (!game) return;
    
    Object.assign(game, updates);
    
    // Update storage
    this.games[gameCode] = game;
    localStorage.setItem(`chess_game_${gameCode}`, JSON.stringify(game));
    
    // Notify subscribers
    if (this.subscribers && this.subscribers[gameCode]) {
      this.subscribers[gameCode].forEach(callback => callback(game));
    }
  },
  
  makeMove(board, fromRow, fromCol, toRow, toCol) {
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    return newBoard;
  },
  
  // Subscription system for real-time updates
  subscribers: {},
  
  subscribeToGameUpdates(gameCode, callback) {
    if (!this.subscribers[gameCode]) {
      this.subscribers[gameCode] = [];
    }
    this.subscribers[gameCode].push(callback);
    
    // Simulate real-time updates with polling
    const intervalId = setInterval(() => {
      const game = this.getGame(gameCode);
      if (game) callback(game);
    }, 2000);
    
    return () => clearInterval(intervalId);
  },
  
  unsubscribeFromGameUpdates(gameCode) {
    if (this.subscribers[gameCode]) {
      delete this.subscribers[gameCode];
    }
  },
  
  cleanupGame(gameCode) {
    delete this.games[gameCode];
    localStorage.removeItem(`chess_game_${gameCode}`);
    
    if (this.subscribers[gameCode]) {
      delete this.subscribers[gameCode];
    }
  }
};

export default GameService;