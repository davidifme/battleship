export const UserInterface = (function () {
  function renderBoard(boardData, isPlayerBoard = true) {

    const gameboardContainer = document.querySelector("#gameboard");
    if (!gameboardContainer) return; // Exit if element doesn't exist
    
    gameboardContainer.innerHTML = ""; // Clear previous board

    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) return; // Exit if element doesn't exist

    const size = boardData ? boardData.length : 10;

    // Create row indicators (1-10)
    const numbersContainer = document.querySelector(".numbers-container");
    if (!numbersContainer) return;
    
    numbersContainer.innerHTML = "";
    for (let i = 0; i < size; i++) {
      const numberEl = document.createElement("div");
      numberEl.className = "number";
      numberEl.textContent = i + 1;
      numbersContainer.appendChild(numberEl);
    }

    // Create column indicators (A-J)
    const lettersContainer = document.querySelector(".letters-container");
    if (!lettersContainer) return;
    
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

    gridContainer.style.maxWidth = `${size * 50}px`;
  }

  return {
    renderBoard,
  };
})();