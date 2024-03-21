export function initSnake() {
  const input = document.querySelector('[data-terminal="input"]');
  let gameRunning = false;
  let animationFrameId;

  input.blur();

  const canvas = document.querySelector('[data-terminal="game-canvas"]');
  const context = canvas.getContext("2d");
  canvas.style.opacity = 1;
  canvas.style.pointerEvents = "auto";

  let grid;
  grid = calculateGridSize(canvas.width, canvas.height);

  let count = 0;

  const snake = {
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4,
  };
  let apple = {
    // x: 320,
    // y: 320,
    x: getRandomInt(0, canvas.width / grid) * grid,
    y: getRandomInt(0, canvas.height / grid) * grid,
  };

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function loop() {
    if (!gameRunning) {
      return;
    }

    animationFrameId = requestAnimationFrame(loop);

    if (++count < 4) {
      return;
    }

    count = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);

    snake.x += snake.dx;
    snake.y += snake.dy;

    if (snake.x < 0) {
      snake.x = canvas.width - grid;
    } else if (snake.x >= canvas.width) {
      snake.x = 0;
    }

    if (snake.y < 0) {
      snake.y = canvas.height - grid;
    } else if (snake.y >= canvas.height) {
      snake.y = 0;
    }

    snake.cells.unshift({ x: snake.x, y: snake.y });
    if (snake.cells.length > snake.maxCells) {
      snake.cells.pop();
    }

    context.fillStyle = "red";
    context.fillRect(apple.x, apple.y, grid - 1, grid - 1);

    context.fillStyle = "green";
    snake.cells.forEach(function (cell, index) {
      context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

      if (cell.x === apple.x && cell.y === apple.y) {
        snake.maxCells++;
        apple.x = getRandomInt(0, canvas.width / grid) * grid;
        apple.y = getRandomInt(0, canvas.height / grid) * grid;
      }

      for (let i = index + 1; i < snake.cells.length; i++) {
        if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
          endGame(); // Call endGame instead of directly manipulating game state
          return; // Exit the loop function early to avoid processing further game logic
        }
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!gameRunning) return;

    if (e.key === "Escape") {
      // Quit game
      gameRunning = false;
      cancelAnimationFrame(animationFrameId);
      // Optional: Display a game over screen or cleanup
      canvas.style.opacity = 0;
      canvas.style.pointerEvents = "none";
      input.focus();
      return;
    }

    const keyMap = {
      ArrowLeft: [-grid, 0],
      ArrowUp: [0, -grid],
      ArrowRight: [grid, 0],
      ArrowDown: [0, grid],
    };

    const [dx, dy] = keyMap[e.key] || [0, 0];
    if ((dx || dy) && !(snake.dx === -dx || snake.dy === -dy)) {
      snake.dx = dx;
      snake.dy = dy;
    }
  });

  // ===========================================================================

  // Mobile Controls ->

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  canvas.addEventListener(
    "touchstart",
    function (e) {
      // Prevent the browser from processing default touch events
      e.preventDefault();

      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    false,
  );

  canvas.addEventListener(
    "touchend",
    function (e) {
      // Prevent the browser from processing default touch events
      e.preventDefault();

      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;

      handleTouchMove();
    },
    false,
  );

  function handleTouchMove() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      // Movement was more horizontal than vertical
      if (dx > 0) {
        snake.dx = grid; // Swipe right
        snake.dy = 0;
      } else {
        snake.dx = -grid; // Swipe left
        snake.dy = 0;
      }
    } else {
      // Movement was more vertical than horizontal
      if (dy > 0) {
        snake.dy = grid; // Swipe down
        snake.dx = 0;
      } else {
        snake.dy = -grid; // Swipe up
        snake.dx = 0;
      }
    }

    // Avoid the snake immediately reversing on itself
    if (snake.cells.length > 1) {
      const nextX = snake.cells[0].x + snake.dx;
      const nextY = snake.cells[0].y + snake.dy;
      if (nextX === snake.cells[1].x && nextY === snake.cells[1].y) {
        // If the next move would reverse the snake, ignore the swipe
        snake.dx = snake.cells[0].x - snake.cells[1].x;
        snake.dy = snake.cells[0].y - snake.cells[1].y;
      }
    }
  }

  // ===========================================================================

  // Grid Size ->
  function calculateGridSize(canvasWidth, canvasHeight) {
    const maxGridSize = 20; // Maximum grid size you'd like to use
    const minGridSize = 10; // Minimum grid size you find acceptable
    let idealGridSize = Math.min(canvasWidth, canvasHeight) / 25; // Example calculation

    // Clamp the grid size between minGridSize and maxGridSize
    idealGridSize = Math.max(minGridSize, Math.min(maxGridSize, idealGridSize));

    // Ensure the grid size is a whole number
    idealGridSize = Math.floor(idealGridSize);

    // Adjust canvas size to fit an exact number of grids
    canvas.width = Math.floor(canvas.width / idealGridSize) * idealGridSize;
    canvas.height = Math.floor(canvas.height / idealGridSize) * idealGridSize;

    return idealGridSize;
  }

  // ===========================================================================

  // Game States ->

  function startSnake() {
    if (gameRunning) return; // Prevent multiple starts
    gameRunning = true;
    loop();
  }
  startSnake();

  function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId); // Stop the animation loop

    // Optionally, display a game over message directly on the canvas
    context.fillStyle = "white";
    context.font = "14px Arial";
    context.textAlign = "center";
    context.fillText(
      "Game Over! Press 'R' to restart.",
      canvas.width / 2,
      canvas.height / 2,
    );

    // Listen for the 'R' key to restart the game
    document.addEventListener("keydown", function restartGame(e) {
      if (e.key === "r" || e.key === "R") {
        document.removeEventListener("keydown", restartGame); // Remove this listener to avoid duplicates

        initSnake(); // Restart the game by reinitializing it
      }
      if (e.key === "Escape") {
        // Optional: Display a game over screen or cleanup
        canvas.style.opacity = 0;
        canvas.style.pointerEvents = "none";
        input.focus();
        return;
      }
    });
  }
}
