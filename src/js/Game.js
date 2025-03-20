import { Gameboard } from "./gameBoard";
import { Player } from "./Player";
import { Ship } from "./Ship";
import { UserInterface } from "./UserInterface";
import { ShipPlacement } from "./ShipPlacement";

export const Game = (function () {

  let player, computer, gameState, currentTurn;
  const SHIP_SIZES = [5, 4, 3, 3, 2, 1, 1];

  function init() {
    player = Player.createPlayer("human");
    computer = Player.createPlayer("computer");
    gameState = "setup"; // start in setup mode
    currentTurn = "player";
    
    // Clear the player's board
    player.board = Gameboard.createBoard(10);
    
    // Place computer ships randomly
    placeComputerShips();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set buttons
    setupButtons();
    
    // Initialize UI
    updateUI();
    
    // Initialize ship placement UI
    ShipPlacement.init(SHIP_SIZES, startGame);
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
    // Listen for clicks on the computer board only
    const computerGridContainer = document.querySelector("#computer-board .grid-container");
    if (!computerGridContainer) return;
    
    // Remove existing event listeners to prevent duplicates
    const oldElement = computerGridContainer;
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
    
    // Add event listener to the new element
    newElement.addEventListener("click", handleCellClick);
  }

  function handleCellClick(event) {
    const cell = event.target;
    if (!cell.classList.contains("grid-cell")) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    if (gameState !== "playing" || currentTurn !== "player") return;
    
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
    // Render both boards
    UserInterface.renderBoard(player.board, "player-board", true);
    UserInterface.renderBoard(computer.board, "computer-board", false);
  }

  function startGame(shipPlacements) {
    if (gameState !== "setup") return false;
    
    // Clear any ships from randomization
    player.board = Gameboard.createBoard(10);
    
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

  function setupRandomButton() {
    const randomButton = document.querySelector('button.random');
    if (!randomButton) return;
    
    randomButton.addEventListener('click', () => {
      // Only allow randomization during setup or when game is over
      if (gameState !== 'setup' && gameState !== 'gameOver') return;
      
      // If game was over, reset game state to setup
      if (gameState === 'gameOver') {
        gameState = 'setup';
      }
      
      // Clear the player's board
      player.board = Gameboard.createBoard(10);
      
      // Clear any pending placements in the UI
      ShipPlacement.resetPlacements();
      
      // Place ships randomly
      SHIP_SIZES.forEach(size => {
        const ship = Ship.createShip(size);
        let placed = false;
        
        while (!placed) {
          const row = Math.floor(Math.random() * 10);
          const col = Math.floor(Math.random() * 10);
          const isHorizontal = Math.random() > 0.5;
          
          placed = Gameboard.placeShip(player.board, ship, row, col, isHorizontal);
        }
      });
      
      // Start the game with random placements
      gameState = "playing";
      currentTurn = "player";
      
      // Update the UI to show the new ship placements
      updateUI();
      
      // Hide the ship placement container
      const placementContainer = document.querySelector(".ship-placement-container");
      if (placementContainer) {
        placementContainer.style.display = "none";
      }
    });
  }

  function setupStopButton() {
    const stopButton = document.querySelector('button.stop');
    if (!stopButton) return;
    
    stopButton.addEventListener('click', () => {
      // Reset the game entirely
      init();
    });
  }

  function setupButtons() {
    setupRandomButton();
    setupStopButton();
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
    getShipSizes: () => SHIP_SIZES,
    setupRandomButton,
    setupStopButton,
    setupButtons
  };
})();