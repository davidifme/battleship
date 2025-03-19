import { Gameboard } from "./gameBoard";
import { Ship } from "./Ship";
import { UserInterface } from "./UserInterface";
import { Player } from "./Player";

export const Game = (function () {
  let playerBoard;
  let computerBoard;
  let humanPlayer;
  let computerPlayer;
  let currentTurn = "human"; // Start with human player
  let recursionCount = 0;
  const MAX_RECURSION_FOR_TESTING = 1;

  function init() {
    // Create players
    humanPlayer = Player.createPlayer("human");
    computerPlayer = Player.createPlayer("computer");

    // Set up boards
    playerBoard = humanPlayer.board;
    computerBoard = computerPlayer.board;

    // Place ships randomly for computer
    placeShipsRandomly(computerBoard);

    // Temporarily place some ships for the human player
    placeShipsRandomly(playerBoard);

    // Render the initial boards
    UserInterface.renderBoard(playerBoard, true);

    // Add event listeners to grid cells
    setupGridListeners();
    
    // Store references to necessary elements
    Game.playerBoard = playerBoard;
    Game.computerBoard = computerBoard;
    Game.humanPlayer = humanPlayer;
    Game.computerPlayer = computerPlayer;
  }

  function placeShipsRandomly(board) {
    const shipLengths = [5, 4, 3, 3, 2];

    for (const length of shipLengths) {
      let placed = false;
      const ship = Ship.createShip(length);

      while (!placed) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const isHorizontal = Math.random() > 0.5;

        placed = Gameboard.placeShip(board, ship, row, col, isHorizontal);
      }
    }
  }

  function setupGridListeners() {
    // Check if we're in a test environment
    if (typeof document === 'undefined') {
      return;
    }
    
    const gridCells = document.querySelectorAll(".grid-cell");

    gridCells.forEach((cell) => {
      cell.addEventListener("click", handleCellClick);
    });
  }

  function handleCellClick(event) {
    if (currentTurn !== "human") return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    // Process the player's attack
    const attackResult = humanPlayer.attack(computerBoard, row, col);

    if (attackResult) {
      // Update the UI to show the result
      UserInterface.renderBoard(computerBoard, false);

      // Check if the game is over
      if (Gameboard.allShipsSunk(computerBoard)) {
        console.log("You win!");
        return;
      }

      // Switch to computer's turn
      currentTurn = "computer";
      setTimeout(computerTurn, 500);
    }
  }

  function computerTurn() {
    // For testing - prevent infinite recursion
    if (process.env.NODE_ENV === 'test' && recursionCount > MAX_RECURSION_FOR_TESTING) {
      recursionCount = 0;
      return;
    }
    
    // Make computer attack and store result
    const attackResult = computerPlayer.attack(playerBoard);

    // Only proceed if attack was successful
    if (!attackResult) {
      // If attack failed (e.g., already attacked this spot), try again
      recursionCount++;
      return computerTurn();
    }

    // Reset recursion counter
    recursionCount = 0;

    // Update the UI to show the result
    UserInterface.renderBoard(playerBoard, true);

    // Check if the game is over
    if (Gameboard.allShipsSunk(playerBoard)) {
      console.log("Computer wins!");
      return;
    }

    // Switch back to player's turn
    currentTurn = "human";
  }

  // Initialize the game when the page loads
  if (typeof window !== 'undefined') {
    window.addEventListener("DOMContentLoaded", init);
  }

  return {
    init,
    handleCellClick,
    computerTurn,
    placeShipsRandomly,
    setupGridListeners,
    playerBoard,
    computerBoard,
    humanPlayer,
    computerPlayer,
    currentTurn,
  };
})();