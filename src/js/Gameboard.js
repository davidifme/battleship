export const Gameboard = (function () {
  function createBoard(size) {
    const gameboard = [];
    for (let i = 0; i < size; i++) {
      gameboard[i] = [];
      for (let j = 0; j < size; j++) {
        gameboard[i][j] = 0;
      }
    }

    return gameboard;
  }

  function allShipsSunk(board) {
    // Create a Set to track unique ship objects
    const ships = new Set();

    // Scan the board for ship objects
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        const cell = board[i][j];
        // If cell contains a ship object (not 0, 'hit', or 'miss')
        if (cell !== 0 && cell !== "hit" && cell !== "miss") {
          ships.add(cell);
        }
      }
    }

    // If there are no ships on the board, check if any ships were placed and sunk
    if (ships.size === 0) {
      // Look for 'hit' cells which indicate ships were hit
      let hasHits = false;
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
          if (board[i][j] === "hit") {
            hasHits = true;
            break;
          }
        }
        if (hasHits) break;
      }

      // If we have hits but no ships, all ships must be sunk
      return hasHits;
    }

    // Check if all collected ships are sunk
    for (const ship of ships) {
      if (!ship.isSunk()) {
        return false;
      }
    }

    // Return true if all ships are sunk
    return true;
  }

  function receiveAttack(board, row, col) {
    // Check if coordinates are valid
    if (row < 0 || row >= board.length || col < 0 || col >= board.length) {
      return false;
    }

    const target = board[row][col];

    // If it's a ship
    if (target !== 0 && target !== "miss" && target !== "hit") {
      const ship = target;
      ship.hit(); // Send the 'hit' function to the correct ship
      board[row][col] = "hit"; // Record the hit
      return true;
    }
    // If it's an empty cell
    else if (target === 0) {
      board[row][col] = "miss"; // Record the coordinates of the missed shot
      return true;
    }

    // If the position was already attacked (is 'hit' or 'miss')
    return false;
  }

  function placeShip(board, ship, row, col, isHorizontal = true) {
    // Check if the ship can be placed at the given position
    const shipLength = ship.length;
    const boardSize = board.length;

    // Ensure ship fits on the board
    if (isHorizontal && col + shipLength > boardSize) {
      return false;
    }
    if (!isHorizontal && row + shipLength > boardSize) {
      return false;
    }

    // Check if the ship overlaps with another ship
    if (isHorizontal) {
      for (let i = 0; i < shipLength; i++) {
        if (board[row][col + i] !== 0) {
          return false;
        }
      }
    } else {
      for (let i = 0; i < shipLength; i++) {
        if (board[row + i][col] !== 0) {
          return false;
        }
      }
    }

    // Place the ship
    if (isHorizontal) {
      for (let i = 0; i < shipLength; i++) {
        board[row][col + i] = ship;
      }
    } else {
      for (let i = 0; i < shipLength; i++) {
        board[row + i][col] = ship;
      }
    }

    return true;
  }

  return {
    createBoard,
    placeShip,
    receiveAttack,
    allShipsSunk,
  };
})();
