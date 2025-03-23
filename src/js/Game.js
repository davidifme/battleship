import { Gameboard } from "./gameBoard";
import { Player } from "./Player";
import { Ship } from "./Ship";
import { UserInterface } from "./UserInterface";
import { ShipPlacement } from "./ShipPlacement";

export const Game = (function () {
  let player, computer, gameState, currentTurn;
  const SHIP_SIZES = [5, 4, 3, 3, 2];

  function init() {
    player = Player.createPlayer("human");
    computer = Player.createPlayer("computer");
    gameState = "setup";
    currentTurn = "player";

    player.board = Gameboard.createBoard(10);
    placeComputerShips();
    setupEventListeners();
    updateUI();
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
    const computerGridContainer = document.querySelector("#computer-board .grid-container");
    if (!computerGridContainer) return;

    const oldElement = computerGridContainer;
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
    newElement.addEventListener("click", handleCellClick);
  }

  function handleCellClick(event) {
    const cell = event.target;
    if (!cell.classList.contains("grid-cell")) return;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (gameState !== "playing" || currentTurn !== "player") return;

    const attackResult = player.attack(computer.board, row, col);
    if (attackResult) {
      updateUI();
      if (checkGameOver()) return;
      currentTurn = "computer";
      setTimeout(computerTurn, 500);
    }
  }

  function computerTurn() {
    if (gameState !== "playing" || currentTurn !== "computer") return;
    computer.attack(player.board);
    updateUI();
    if (checkGameOver()) return;
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
      cleanReset();
    });

    announcement.appendChild(resetButton);
    document.body.appendChild(announcement);
  }

  function updateUI() {
    UserInterface.renderBoard(player.board, "player-board", true);
    UserInterface.renderBoard(computer.board, "computer-board", false);
  }

  function cleanReset() {
    const placementContainer = document.querySelector(".ship-placement-container");
    if (placementContainer) {
      placementContainer.remove();
    }
    init();
  }

  function startGame(shipPlacements) {
    if (gameState !== "setup") return false;

    player.board = Gameboard.createBoard(10);
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