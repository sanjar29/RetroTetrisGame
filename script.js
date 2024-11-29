document.addEventListener('DOMContentLoaded', () => {
  const mainMenu = document.getElementById('main-menu');
  const gameContainer = document.getElementById('game-container');
  const pauseMenu = document.getElementById('pause-menu');
  const playButton = document.getElementById('play-button');
  const instructionsButton = document.getElementById('instructions-button');
  const instructionsPopup = document.getElementById('instructions-popup');
  const closePopupButton = document.getElementById('close-popup');
  const pauseButton = document.getElementById('pause-button');
  const continueButton = document.getElementById('continue-button');
  const exitButton = document.getElementById('exit-button');
  const canvas = document.getElementById('tetris-canvas');
  const ctx = canvas.getContext('2d');
  const blockSize = 30;
  const rows = 20;
  const cols = 10;
  const colors = [null, 'red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange'];

  let gamePaused = false;
  let grid = [];
  let currentPiece;
  let gameInterval;

  // Tetromino shapes
  const tetrominoes = [
    [[1, 1, 1], [0, 1, 0]], // T-shape
    [[0, 2, 2], [2, 2, 0]], // Z-shape
    [[3, 3, 0], [0, 3, 3]], // S-shape
    [[4, 4, 4, 4]], // I-shape
    [[5, 5], [5, 5]], // O-shape
    [[6, 6, 6], [6, 0, 0]], // L-shape
    [[7, 7, 7], [0, 0, 7]] // J-shape
  ];

  // Helper function to create the grid
  const initializeGrid = () => {
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  };

  // Helper function to draw the grid and pieces
  const drawGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c]) {
          ctx.fillStyle = colors[grid[r][c]];
          ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
          ctx.strokeStyle = 'black';
          ctx.strokeRect(c * blockSize, r * blockSize, blockSize, blockSize);
        }
      }
    }
  };

  // Draw current piece on the grid
  const drawPiece = (piece, offset) => {
    piece.shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value) {
          ctx.fillStyle = colors[value];
          ctx.fillRect((c + offset.x) * blockSize, (r + offset.y) * blockSize, blockSize, blockSize);
          ctx.strokeStyle = 'black';
          ctx.strokeRect((c + offset.x) * blockSize, (r + offset.y) * blockSize, blockSize, blockSize);
        }
      });
    });
  };

  // Create a new random piece
  const createPiece = () => {
    const index = Math.floor(Math.random() * tetrominoes.length);
    return {
      shape: tetrominoes[index],
      x: Math.floor(cols / 2) - 1,
      y: 0
    };
  };

  // Collision detection
  const isCollision = (piece, offset) => {
    return piece.shape.some((row, r) => {
      return row.some((value, c) => {
        if (value) {
          const x = piece.x + c + offset.x;
          const y = piece.y + r + offset.y;
          return x < 0 || x >= cols || y >= rows || grid[y] && grid[y][x];
        }
        return false;
      });
    });
  };

  // Merge piece into the grid
  const mergePiece = (piece) => {
    piece.shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value) {
          grid[piece.y + r][piece.x + c] = value;
        }
      });
    });
  };

  // Clear full rows
  const clearRows = () => {
    for (let r = rows - 1; r >= 0; r--) {
      if (grid[r].every(cell => cell !== 0)) {
        grid.splice(r, 1);
        grid.unshift(Array(cols).fill(0));
      }
    }
  };

  // Drop the piece
  const dropPiece = () => {
    if (!isCollision(currentPiece, { x: 0, y: 1 })) {
      currentPiece.y++;
    } else {
      mergePiece(currentPiece);
      clearRows();
      currentPiece = createPiece();
      if (isCollision(currentPiece, { x: 0, y: 0 })) {
        clearInterval(gameInterval);
        alert('Game Over');
        startMainMenu();
      }
    }
  };

   // Close instructions popup
   closePopupButton.addEventListener('click', () => {
    instructionsPopup.classList.add('hidden');
  });

  // Move the piece
  const movePiece = (direction) => {
    const offset = { x: direction, y: 0 };
    if (!isCollision(currentPiece, offset)) {
      currentPiece.x += direction;
    }
  };

  instructionsButton.addEventListener('click', () => {
    instructionsPopup.classList.remove('hidden');
  });

  // Rotate the piece
  const rotatePiece = () => {
    const rotatedShape = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotatedShape;
    if (isCollision(currentPiece, { x: 0, y: 0 })) {
      currentPiece.shape = originalShape; // Revert rotation if collision
    }
  };

  // Key controls
  document.addEventListener('keydown', (event) => {
    if (!gamePaused) {
      if (event.key === 'ArrowLeft') movePiece(-1);
      if (event.key === 'ArrowRight') movePiece(1);
      if (event.key === 'ArrowDown') dropPiece();
      if (event.key === 'ArrowUp') rotatePiece();
    }
  });

  // Game loop
  const gameLoop = () => {
    if (!gamePaused) {
      dropPiece();
      drawGrid();
      drawPiece(currentPiece, { x: currentPiece.x, y: currentPiece.y });
    }
  };

  // Initialize game
  const startGame = () => {
    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    initializeGrid();
    currentPiece = createPiece();
    gamePaused = false;
    gameInterval = setInterval(gameLoop, 500);
  };

  // Pause and resume game
  pauseButton.addEventListener('click', () => {
    gamePaused = true;
    clearInterval(gameInterval);
    pauseMenu.classList.remove('hidden');
  });

  continueButton.addEventListener('click', () => {
    gamePaused = false;
    pauseMenu.classList.add('hidden');
    gameInterval = setInterval(gameLoop, 500);
  });

  exitButton.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
    gameContainer.classList.add('hidden');
    startMainMenu();
  });

  const startMainMenu = () => {
    clearInterval(gameInterval);
    mainMenu.classList.remove('hidden');
    gameContainer.classList.add('hidden');
  };

  playButton.addEventListener('click', startGame);
});
