import { Gameboard } from "./gameBoard";
import { Player } from "./Player";
import { Ship } from "./Ship";
import { UserInterface } from "./UserInterface";

export const Game = (function () {

  let player, computer, gameState, currentTurn;
  const SHIP_SIZES = [5, 4, 3, 3, 2];

  function init() {
    player = Player.createPlayer("human");
    computer = Player.createPlayer("computer");
    gameState = "setup"; // setup, playing, gameOver
    currentTurn = "player";
    
    // Place computer ships randomly
    placeComputerShips();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI
    updateUI();
  }

  function placeComputerShips() {
    SHIP_SIZES.forEach(size => {
      const ship = Ship.createShip(size);
      let placed = false;
      
      while (!placed) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const isHorizontal = Math.random() > 0.5;
        
        placed = Gameboard.placeShip(computer.board, ship, row, col, isHorizontal);
      }
    });
  }

  function setupEventListeners() {
    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) return;
    
    gridContainer.addEventListener("click", handleCellClick);
  }

  function handleCellClick(event) {
    if (gameState !== "playing" || currentTurn !== "player") return;
    
    const cell = event.target;
    if (!cell.classList.contains("grid-cell")) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Player attacks computer's board
    const attackResult = player.attack(computer.board, row, col);
    
    if (attackResult) {
      updateUI();
      
      // Check if game over
      if (checkGameOver()) return;
      
      // Switch turn
      currentTurn = "computer";
      setTimeout(computerTurn, 500);
    }
  }

  function computerTurn() {
    if (gameState !== "playing" || currentTurn !== "computer") return;
    
    // Computer attacks player's board
    computer.attack(player.board);
    
    updateUI();
    
    // Check if game over
    if (checkGameOver()) return;
    
    // Switch turn back to player
    currentTurn = "player";
  }

  function checkGameOver() {
    if (Gameboard.allShipsSunk(player.board)) {
      gameState = "gameOver";
      announceWinner("Computer");
      return true;
    }
    
    if (Gameboard.allShipsSunk(computer.board)) {
      gameState = "gameOver";
      announceWinner("Player");
      return true;
    }
    
    return false;
  }

  function announceWinner(winner) {
    const announcement = document.createElement("div");
    announcement.className = "winner-announcement";
    announcement.textContent = `${winner} wins!`;
    
    const resetButton = document.createElement("button");
    resetButton.textContent = "Play Again";
    resetButton.addEventListener("click", () => {
      document.body.removeChild(announcement);
      init();
    });
    
    announcement.appendChild(resetButton);
    document.body.appendChild(announcement);
  }

  function updateUI() {    
    // In a real implementation, you'd have two separate boards
    // This just shows the current state
    if (gameState === "setup" || gameState === "playing") {
      UserInterface.renderBoard(player.board, true);
    }
  }

  function startGame(shipPlacements) {
    if (gameState !== "setup") return false;
    
    // Place player ships based on input
    shipPlacements.forEach(placement => {
      const { size, row, col, isHorizontal } = placement;
      const ship = Ship.createShip(size);
      Gameboard.placeShip(player.board, ship, row, col, isHorizontal);
    });
    
    gameState = "playing";
    currentTurn = "player";
    updateUI();
    
    return true;
  }

  return {
    init,
    startGame,
    handleCellClick,
    getCurrentState: () => ({
      gameState,
      currentTurn,
      playerBoard: player?.board,
      computerBoard: computer?.board
    }),
    getShipSizes: () => SHIP_SIZES
  };
})();