export const ShipPlacement = (function() {
    let draggedShip = null;
    let isHorizontal = true;
    let pendingPlacements = [];
    let shipSizes = [];
    let setupCallback = null;
    
    function init(sizes, callback) {
      shipSizes = [...sizes];
      setupCallback = callback;
      pendingPlacements = [];
      
      // Create the ship placement container
      createPlacementUI();
      
      // Set up event listeners for rotation and drag-drop
      setupEventListeners();
    }
    
    function createPlacementUI() {
      // Get the player board container
      const playerBoardContainer = document.querySelector(".board-container:first-child");
      
      // Check if the placement container already exists
      let placementContainer = document.querySelector(".ship-placement-container");
      if (placementContainer) {
        placementContainer.innerHTML = '';
      } else {
        // Create the ship placement container
        placementContainer = document.createElement("div");
        placementContainer.className = "ship-placement-container";
        playerBoardContainer.insertBefore(placementContainer, playerBoardContainer.querySelector(".buttons"));
      }
      
      // Create instructions
      const instructions = document.createElement("div");
      instructions.className = "placement-instructions";
      instructions.innerHTML = `
        <p>Drag ships to place them on the board</p>
        <p>Press <strong>R</strong> to rotate ships</p>
      `;
      placementContainer.appendChild(instructions);
      
      // Create ships to drag
      const shipsContainer = document.createElement("div");
      shipsContainer.className = "ships-container";
      
      shipSizes.forEach((size, index) => {
        const shipElement = document.createElement("div");
        shipElement.className = `ship size-${size} ${isHorizontal ? 'horizontal' : 'vertical'}`;
        shipElement.dataset.index = index;
        shipElement.dataset.size = size;
        shipElement.draggable = true;
        
        // Create ship segments
        for (let i = 0; i < size; i++) {
          const segment = document.createElement("div");
          segment.className = "ship-segment";
          shipElement.appendChild(segment);
        }
        
        shipsContainer.appendChild(shipElement);
      });
      
      placementContainer.appendChild(shipsContainer);
      
      // Create start button
      const startButton = document.createElement("button");
      startButton.className = "start-game";
      startButton.textContent = "Start Game";
      startButton.disabled = true;
      placementContainer.appendChild(startButton);
      
      startButton.addEventListener("click", function() {
        if (pendingPlacements.length === shipSizes.length) {
          // Call the callback with placements
          setupCallback(pendingPlacements);
          
          // Hide the placement container
          placementContainer.style.display = "none";
        }
      });
    }
    
    function setupEventListeners() {
      // Rotation with 'R' key
      document.addEventListener("keydown", function(e) {
        if (e.key.toLowerCase() === 'r') {
          isHorizontal = !isHorizontal;
          document.querySelectorAll(".ship").forEach(ship => {
            ship.classList.toggle("horizontal");
            ship.classList.toggle("vertical");
          });
        }
      });
      
      // Drag and drop events
      const ships = document.querySelectorAll(".ship");
      const cells = document.querySelectorAll("#player-board .grid-cell");
      
      // Add drag events to ships
      ships.forEach(ship => {
        ship.addEventListener("dragstart", handleDragStart);
        ship.addEventListener("dragend", handleDragEnd);
      });
      
      // Add drop events to grid cells
      cells.forEach(cell => {
        cell.addEventListener("dragover", handleDragOver);
        cell.addEventListener("dragenter", handleDragEnter);
        cell.addEventListener("dragleave", handleDragLeave);
        cell.addEventListener("drop", handleDrop);
      });
    }
    
    function handleDragStart(e) {
      draggedShip = {
        element: this,
        size: parseInt(this.dataset.size),
        index: parseInt(this.dataset.index)
      };
      this.classList.add("dragging");
      
      // For Firefox compatibility
      e.dataTransfer.setData("text/plain", "");
      e.dataTransfer.effectAllowed = "move";
    }
    
    function handleDragEnd() {
      this.classList.remove("dragging");
      
      // Clear any highlighted cells
      document.querySelectorAll(".grid-cell.highlight").forEach(cell => {
        cell.classList.remove("highlight");
        cell.classList.remove("valid");
        cell.classList.remove("invalid");
      });
    }
    
    function handleDragOver(e) {
      e.preventDefault();
      return false;
    }
    
    function handleDragEnter(e) {
      e.preventDefault();
      if (!draggedShip) return;
      
      const row = parseInt(this.dataset.row);
      const col = parseInt(this.dataset.col);
      
      // Highlight cells where ship would be placed
      highlightShipPlacement(row, col, draggedShip.size, isHorizontal);
    }
    
    function handleDragLeave() {
      // This function intentionally left minimal to avoid flickering
      // during drag operations between cells
    }
    
    function handleDrop(e) {
      e.preventDefault();
      if (!draggedShip) return;
      
      const row = parseInt(this.dataset.row);
      const col = parseInt(this.dataset.col);
      
      // Try to place the ship
      const placement = {
        size: draggedShip.size,
        row: row,
        col: col,
        isHorizontal: isHorizontal,
        index: draggedShip.index
      };
      
      if (isValidPlacement(row, col, draggedShip.size, isHorizontal)) {
        // Update or add this placement
        const existingIndex = pendingPlacements.findIndex(p => p.index === draggedShip.index);
        if (existingIndex >= 0) {
          pendingPlacements[existingIndex] = placement;
        } else {
          pendingPlacements.push(placement);
        }
        
        // Visual feedback
        draggedShip.element.classList.add("placed");
        
        // Update start button
        updateStartButton();
        
        // Update the board preview
        updateBoardPreview();
      }
      
      return false;
    }
    
    function highlightShipPlacement(row, col, size, horizontal) {
      // Clear previous highlights
      document.querySelectorAll(".grid-cell.highlight").forEach(cell => {
        cell.classList.remove("highlight");
        cell.classList.remove("valid");
        cell.classList.remove("invalid");
      });
      
      const isValid = isValidPlacement(row, col, size, horizontal);
      const cells = getCellsForPlacement(row, col, size, horizontal);
      
      cells.forEach(cell => {
        if (cell) {
          cell.classList.add("highlight");
          cell.classList.add(isValid ? "valid" : "invalid");
        }
      });
    }
    
    function getCellsForPlacement(row, col, size, horizontal) {
      const cells = [];
      const grid = document.querySelector("#player-board .grid-container");
      const boardSize = 10; // Standard size
      
      if (horizontal) {
        if (col + size > boardSize) return []; // Out of bounds
        
        for (let i = 0; i < size; i++) {
          const cellSelector = `.grid-cell[data-row="${row}"][data-col="${col + i}"]`;
          const cell = grid.querySelector(cellSelector);
          if (cell) cells.push(cell);
        }
      } else {
        if (row + size > boardSize) return []; // Out of bounds
        
        for (let i = 0; i < size; i++) {
          const cellSelector = `.grid-cell[data-row="${row + i}"][data-col="${col}"]`;
          const cell = grid.querySelector(cellSelector);
          if (cell) cells.push(cell);
        }
      }
      
      return cells;
    }
    
    function isValidPlacement(row, col, size, horizontal) {
      const cells = getCellsForPlacement(row, col, size, horizontal);
      
      // Check if we have the right number of cells
      if (cells.length !== size) return false;
      
      // Check if any cells are already occupied by another pending placement
      const occupiedPositions = new Set();
      
      // Add all current placements (except the one being dragged) to the occupied set
      pendingPlacements.forEach(placement => {
        if (placement.index === draggedShip?.index) return;
        
        const { row, col, size, isHorizontal } = placement;
        
        if (isHorizontal) {
          // Check ship cells
          for (let i = 0; i < size; i++) {
            occupiedPositions.add(`${row},${col + i}`);
            
            // Check adjacent cells (one cell buffer around ships)
            for (let r = Math.max(0, row - 1); r <= Math.min(9, row + 1); r++) {
              for (let c = Math.max(0, col + i - 1); c <= Math.min(9, col + i + 1); c++) {
                occupiedPositions.add(`${r},${c}`);
              }
            }
          }
        } else {
          // Check ship cells
          for (let i = 0; i < size; i++) {
            occupiedPositions.add(`${row + i},${col}`);
            
            // Check adjacent cells (one cell buffer around ships)
            for (let r = Math.max(0, row + i - 1); r <= Math.min(9, row + i + 1); r++) {
              for (let c = Math.max(0, col - 1); c <= Math.min(9, col + 1); c++) {
                occupiedPositions.add(`${r},${c}`);
              }
            }
          }
        }
      });
      
      // Check if any cell in the new placement is already occupied
      const newPositions = [];
      
      if (horizontal) {
        for (let i = 0; i < size; i++) {
          newPositions.push(`${row},${col + i}`);
        }
      } else {
        for (let i = 0; i < size; i++) {
          newPositions.push(`${row + i},${col}`);
        }
      }
      
      return !newPositions.some(pos => occupiedPositions.has(pos));
    }
    
    function updateStartButton() {
      const startButton = document.querySelector(".start-game");
      if (startButton) {
        startButton.disabled = pendingPlacements.length !== shipSizes.length;
      }
    }
    
    function updateBoardPreview() {
      // Clear the board first
      document.querySelectorAll("#player-board .grid-cell").forEach(cell => {
        cell.classList.remove("ship");
      });
      
      // Add ship class to cells where ships are placed
      pendingPlacements.forEach(placement => {
        const { row, col, size, isHorizontal } = placement;
        
        if (isHorizontal) {
          for (let i = 0; i < size; i++) {
            const cell = document.querySelector(`#player-board .grid-cell[data-row="${row}"][data-col="${col + i}"]`);
            if (cell) cell.classList.add("ship");
          }
        } else {
          for (let i = 0; i < size; i++) {
            const cell = document.querySelector(`#player-board .grid-cell[data-row="${row + i}"][data-col="${col}"]`);
            if (cell) cell.classList.add("ship");
          }
        }
      });
    }
    
    function resetPlacements() {
      pendingPlacements = [];
      
      // Reset the UI
      document.querySelectorAll(".ship").forEach(ship => {
        ship.classList.remove("placed");
      });
      
      document.querySelectorAll("#player-board .grid-cell").forEach(cell => {
        cell.classList.remove("ship");
      });
      
      updateStartButton();
    }
    
    return {
      init,
      resetPlacements
    };
  })();