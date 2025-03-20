export const UserInterface = (function () {
  function renderBoard(boardData, boardId, isPlayerBoard = true) {
    // Get the board container
    const gameboardContainer = document.getElementById(boardId);
    if (!gameboardContainer) {
      console.error(`Gameboard container ${boardId} not found`);
      return;
    }
    
    // Get or create grid container
    const gridContainer = gameboardContainer.querySelector(".grid-container");
    if (!gridContainer) {
      console.error("Grid container not found");
      return;
    }
    
    // We need to preserve any event listeners on cells, so we'll update rather than replace
    const size = boardData ? boardData.length : 10;
    const existingCells = gridContainer.querySelectorAll(".grid-cell");
    
    // If we already have the right number of cells, just update them
    if (existingCells.length === size * size) {
      existingCells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Reset classes
        cell.className = "grid-cell";
        
        // Update state based on boardData
        if (boardData) {
          const cellValue = boardData[row][col];
          if (cellValue === "hit") {
            cell.classList.add("hit");
          } else if (cellValue === "miss") {
            cell.classList.add("miss");
          } else if (cellValue !== 0 && isPlayerBoard) {
            // Only show ships on player's board
            cell.classList.add("ship");
          }
        }
      });
    } else {
      // If cell count doesn't match, recreate the grid
      gridContainer.innerHTML = "";
      
      // Create the grid cells
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const cell = document.createElement("button");
          cell.className = "grid-cell";
          cell.dataset.row = i;
          cell.dataset.col = j;
          cell.dataset.board = boardId;

          // If boardData provided, add visual state
          if (boardData) {
            const cellValue = boardData[i][j];
            if (cellValue === "hit") {
              cell.classList.add("hit");
            } else if (cellValue === "miss") {
              cell.classList.add("miss");
            } else if (cellValue !== 0 && isPlayerBoard) {
              // Only show ships on player's board
              cell.classList.add("ship");
            }
          }

          gridContainer.appendChild(cell);
        }
      }
    }
    
    // Create row indicators (1-10) if needed
    const numbersContainer = gameboardContainer.querySelector(".numbers-container");
    if (numbersContainer && numbersContainer.children.length !== size) {
      numbersContainer.innerHTML = "";
      for (let i = 0; i < size; i++) {
        const numberEl = document.createElement("div");
        numberEl.className = "number";
        numberEl.textContent = i + 1;
        numbersContainer.appendChild(numberEl);
      }
    }

    // Create column indicators (A-J) if needed
    const lettersContainer = gameboardContainer.querySelector(".letters-container");
    if (lettersContainer && lettersContainer.children.length !== size) {
      lettersContainer.innerHTML = "";
      for (let i = 0; i < size; i++) {
        const letterEl = document.createElement("div");
        letterEl.className = "letter";
        letterEl.textContent = String.fromCharCode(65 + i); // A-J
        lettersContainer.appendChild(letterEl);
      }
    }

    // Set grid template to match size
    gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  }

  return {
    renderBoard,
  };
})();