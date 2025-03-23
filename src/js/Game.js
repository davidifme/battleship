import { Gameboard } from "./gameBoard";
import { Player } from "./Player";
import { Ship } from "./Ship";
import { UserInterface } from "./UserInterface";
import { ShipPlacement } from "./ShipPlacement";
import { ShipStatus } from "./ShipStatus";

export const Game = (function () {
  let player, computer, player2, gameState, currentTurn, gameMode;
  const SHIP_SIZES = [5, 4, 3, 3, 2, 1, 1];

  function init(mode = "singleplayer") {
    gameMode = mode;
    player = Player.createPlayer("human");
    gameState = "setup";
    currentTurn = "player1";

    if (gameMode === "singleplayer") {
      computer = Player.createPlayer("computer");
      computer.board = Gameboard.createBoard(10);
      placeComputerShips();
    } else {
      // For 2-player mode
      player2 = Player.createPlayer("human");
      player2.board = Gameboard.createBoard(10);
    }

    player.board = Gameboard.createBoard(10);
    setupEventListeners();
    
    // Create ship status displays
    ShipStatus.createShipStatusDisplay("player-status", SHIP_SIZES);
    ShipStatus.createShipStatusDisplay("computer-status", SHIP_SIZES);
    
    updateUI();
    
    // Show game mode selection if we're just starting
    if (mode === "select") {
      showGameModeSelection();
    } else {
      // Otherwise start ship placement for player 1
      ShipPlacement.init(SHIP_SIZES, startGame, "Player 1");
    }
  }

  function showGameModeSelection() {
    // Clear any existing selection UI
    const existingSelection = document.querySelector(".mode-selection-container");
    if (existingSelection) {
      existingSelection.remove();
    }

    const selectionContainer = document.createElement("div");
    selectionContainer.className = "mode-selection-container";
    
    const heading = document.createElement("h2");
    heading.textContent = "Select Game Mode";
    selectionContainer.appendChild(heading);
    
    const singlePlayerBtn = document.createElement("button");
    singlePlayerBtn.className = "mode-button single-player";
    singlePlayerBtn.textContent = "Play vs Computer";
    singlePlayerBtn.addEventListener("click", () => {
      selectionContainer.remove();
      init("singleplayer");
    });
    
    const twoPlayerBtn = document.createElement("button");
    twoPlayerBtn.className = "mode-button two-player";
    twoPlayerBtn.textContent = "Play vs Friend";
    twoPlayerBtn.addEventListener("click", () => {
      selectionContainer.remove();
      init("multiplayer");
    });
    
    selectionContainer.appendChild(singlePlayerBtn);
    selectionContainer.appendChild(twoPlayerBtn);
    
    document.querySelector(".game-container").appendChild(selectionContainer);
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

  // Add this function to show attack results
  function displayAttackResult(row, col, isHit) {
    const result = document.createElement("div");
    result.className = `attack-result ${isHit ? 'hit' : 'miss'}`;
    
    const message = isHit ? "HIT! GO AGAIN!" : "MISS!";
    result.textContent = message;
    
    // Position near the attack location
    const boardId = currentTurn === "player1" || currentTurn === "player2" ? "computer-board" : "player-board";
    const cell = document.querySelector(`#${boardId} .grid-cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      const cellRect = cell.getBoundingClientRect();
      result.style.position = "absolute";
      result.style.left = `${cellRect.left + cellRect.width/2}px`;
      result.style.top = `${cellRect.top + cellRect.height/2}px`;
      result.style.transform = "translate(-50%, -50%)";
    }
    
    document.body.appendChild(result);
    
    // Fade out and remove after the delay
    setTimeout(() => {
      result.classList.add("fadeout");
      setTimeout(() => {
        if (result.parentNode) {
          result.parentNode.removeChild(result);
        }
      }, 500);
    }, 1000);
  }

  // Modify the handleCellClick function to use the new display
  function handleCellClick(event) {
    const cell = event.target;
    if (!cell.classList.contains("grid-cell")) return;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (gameState !== "playing") return;
    
    // In single player mode
    if (gameMode === "singleplayer" && currentTurn === "player1") {
      const attackResult = player.attack(computer.board, row, col);
      if (attackResult) {
        const isHit = computer.board[row][col] === "hit";
        updateUI();
        displayAttackResult(row, col, isHit);
        
        if (checkGameOver()) return;
        
        // Only switch turn to computer if it's a miss
        if (!isHit) {
          currentTurn = "computer";
          setTimeout(computerTurn, 1500);
        }
      }
    } 
    // In multiplayer mode - player 1's turn
    else if (gameMode === "multiplayer" && currentTurn === "player1") {
      const attackResult = player.attack(player2.board, row, col);
      if (attackResult) {
        const isHit = player2.board[row][col] === "hit";
        // Only show hits/misses, not ships
        UserInterface.renderBoard(player2.board, "computer-board", false);
        displayAttackResult(row, col, isHit);
        
        if (checkGameOver()) return;
        
        // Only switch turn if it's a miss
        if (!isHit) {
          currentTurn = "player2";
          // Add delay before showing pass device screen
          setTimeout(() => {
            showPassDeviceScreen();
          }, 1500); // 1.5 second delay to see attack results
        }
      }
    } 
    // In multiplayer mode - player 2's turn
    else if (gameMode === "multiplayer" && currentTurn === "player2") {
      const attackResult = player2.attack(player.board, row, col);
      if (attackResult) {
        const isHit = player.board[row][col] === "hit";
        // Only show hits/misses, not ships
        UserInterface.renderBoard(player.board, "computer-board", false);
        displayAttackResult(row, col, isHit);
        
        if (checkGameOver()) return;
        
        // Only switch turn if it's a miss
        if (!isHit) {
          currentTurn = "player1";
          // Add delay before showing pass device screen
          setTimeout(() => {
            showPassDeviceScreen();
          }, 1500); // 1.5 second delay to see attack results
        }
      }
    }
  }

  function showPassDeviceScreen() {
    // Immediately hide ships on both boards to prevent seeing opponent's ships
    UserInterface.renderBoard(player.board, "player-board", false);
    UserInterface.renderBoard(player2.board, "computer-board", false);
    
    const passScreen = document.createElement("div");
    passScreen.className = "pass-device-screen";
    
    const playerName = currentTurn === "player1" ? "Player 1" : "Player 2";
    
    passScreen.innerHTML = `
      <div class="pass-screen-content">
        <h2>Pass the device to ${playerName}</h2>
        <p>Make sure the other player isn't peeking at your board!</p>
        <button class="ready-button">I'm Ready</button>
      </div>
    `;
    
    document.body.appendChild(passScreen);
    
    const readyButton = passScreen.querySelector(".ready-button");
    readyButton.addEventListener("click", () => {
      document.body.removeChild(passScreen);
      // Flip which board is shown to the player
      updateUIForCurrentPlayer();
    });
  }

  function updateUIForCurrentPlayer() {
    if (gameMode === "multiplayer") {
      // In multiplayer, we show the opponent's board and hide ship positions on player's own board
      if (currentTurn === "player1") {
        // Player 1's turn - show player 2's board for attacking
        UserInterface.renderBoard(player.board, "player-board", true);  // Show own ships
        UserInterface.renderBoard(player2.board, "computer-board", false);  // Hide opponent ships
        
        // Update board labels
        document.querySelector(".board-container:first-child h2").textContent = "Your Fleet";
        document.querySelector(".board-container:last-child h2").textContent = "Opponent's Fleet";
      } else {
        // Player 2's turn - show player 1's board for attacking
        UserInterface.renderBoard(player2.board, "player-board", true);  // Show own ships
        UserInterface.renderBoard(player.board, "computer-board", false);  // Hide opponent ships
        
        // Update board labels
        document.querySelector(".board-container:first-child h2").textContent = "Your Fleet";
        document.querySelector(".board-container:last-child h2").textContent = "Opponent's Fleet";
      }
    } else {
      // Normal single player UI update
      updateUI();
    }
  }

  function computerTurn() {
    if (gameState !== "playing" || currentTurn !== "computer") return;
    
    const attackResult = computer.attack(player.board);
    if (!attackResult) return; // Attack failed for some reason
    
    updateUI();
    
    // Use the coordinates that were actually used in the attack
    // computer.lastAttack is set in computerAttack function in Player.js
    const row = computer.lastAttack.row;
    const col = computer.lastAttack.col;
    
    // Add visual feedback for computer's attack
    const isHit = player.board[row][col] === "hit";
    displayAttackResult(row, col, isHit);
    
    if (checkGameOver()) return;
    
    // If it's a hit, computer gets another turn after a delay
    if (isHit) {
        setTimeout(computerTurn, 1500);
    } else {
        // If it's a miss, switch back to player's turn
        currentTurn = "player1";
    }
}

  function checkGameOver() {
    if (gameMode === "singleplayer") {
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
    } else {
      // Multiplayer
      if (Gameboard.allShipsSunk(player.board)) {
        gameState = "gameOver";
        announceWinner("Player 2");
        return true;
      }
      if (Gameboard.allShipsSunk(player2.board)) {
        gameState = "gameOver";
        announceWinner("Player 1");
        return true;
      }
    }
    return false;
  }

  function announceWinner(winner) {
    const announcement = document.createElement("div");
    announcement.className = "winner-announcement";
    
    const winnerContent = document.createElement("div");
    winnerContent.className = "winner-content";
    
    // Add confetti elements
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 3}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      winnerContent.appendChild(confetti);
    }
    
    const heading = document.createElement("h2");
    heading.textContent = `${winner} wins!`;
    
    const subtext = document.createElement("p");
    subtext.textContent = "Congratulations on your victory at sea!";
    
    const resetButton = document.createElement("button");
    resetButton.textContent = "Play Again";
    resetButton.addEventListener("click", () => {
      document.body.removeChild(announcement);
      cleanReset();
    });

    winnerContent.appendChild(heading);
    winnerContent.appendChild(subtext);
    winnerContent.appendChild(resetButton);
    announcement.appendChild(winnerContent);
    
    document.body.appendChild(announcement);
  }

  function updateUI() {
    UserInterface.renderBoard(player.board, "player-board", true);
    
    // Update ship status for player
    ShipStatus.updateShipStatus("player-status", player.board);
    
    if (gameMode === "singleplayer") {
      UserInterface.renderBoard(computer.board, "computer-board", false);
      ShipStatus.updateShipStatus("computer-status", computer.board);
    } else {
      UserInterface.renderBoard(player2.board, "computer-board", false);
      ShipStatus.updateShipStatus("computer-status", player2.board);
    }
  }

  function cleanReset() {
    const placementContainer = document.querySelector(".ship-placement-container");
    if (placementContainer) {
      placementContainer.remove();
    }
    init("select"); // Go back to game mode selection
  }

  function startGame(shipPlacements) {
    if (gameState !== "setup") return false;

    // Handle player 1 ship placement
    if (currentTurn === "player1") {
      player.board = Gameboard.createBoard(10);
      shipPlacements.forEach(placement => {
        const { size, row, col, isHorizontal } = placement;
        const ship = Ship.createShip(size);
        Gameboard.placeShip(player.board, ship, row, col, isHorizontal);
      });

      if (gameMode === "multiplayer") {
        // In multiplayer, now we need player 2 to place ships
        currentTurn = "player2";
        showPassDeviceScreen();
        ShipPlacement.init(SHIP_SIZES, startGame, "Player 2");
        return true;
      }
    } 
    // Handle player 2 ship placement
    else if (currentTurn === "player2" && gameMode === "multiplayer") {
      player2.board = Gameboard.createBoard(10);
      shipPlacements.forEach(placement => {
        const { size, row, col, isHorizontal } = placement;
        const ship = Ship.createShip(size);
        Gameboard.placeShip(player2.board, ship, row, col, isHorizontal);
      });
      
      // Both players have placed ships, start the game
      currentTurn = "player1";
      showPassDeviceScreen();
    }

    gameState = "playing";
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
      gameMode,
      playerBoard: player?.board,
      computerBoard: gameMode === "singleplayer" ? computer?.board : player2?.board
    }),
    getShipSizes: () => SHIP_SIZES
  };
})();