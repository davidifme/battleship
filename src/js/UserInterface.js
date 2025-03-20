export const UserInterface = (function () {
  function renderBoard(boardData, isPlayerBoard = true) {
    // Get the main container
    const gameboardContainer = document.getElementById("gameboard");
    if (!gameboardContainer) {
      console.error("Gameboard container not found");
      return;
    }
    
    // Get or create grid container
    const gridContainer = gameboardContainer.querySelector(".grid-container");
    if (!gridContainer) {
      console.error("Grid container not found");
      return;
    }
    
    // Clear previous cells
    gridContainer.innerHTML = "";
    
    const size = boardData ? boardData.length : 10;

    // Create row indicators (1-10)
    const numbersContainer = gameboardContainer.querySelector(".numbers-container");
    if (!numbersContainer) {
      console.error("Numbers container not found");
      return;
    }
    
    numbersContainer.innerHTML = "";
    for (let i = 0; i < size; i++) {
      const numberEl = document.createElement("div");
      numberEl.className = "number";
      numberEl.textContent = i + 1;
      numbersContainer.appendChild(numberEl);
    }

    // Create column indicators (A-J)
    const lettersContainer = gameboardContainer.querySelector(".letters-container");
    if (!lettersContainer) {
      console.error("Letters container not found");
      return;
    }
    
    lettersContainer.innerHTML = "";
    for (let i = 0; i < size; i++) {
      const letterEl = document.createElement("div");
      letterEl.className = "letter";
      letterEl.textContent = String.fromCharCode(65 + i); // A-J
      lettersContainer.appendChild(letterEl);
    }

    // Create the grid cells
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cell = document.createElement("button");
        cell.className = "grid-cell";
        cell.dataset.row = i;
        cell.dataset.col = j;

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

    // Set grid template to match size
    gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  }

  return {
    renderBoard,
  };
})();