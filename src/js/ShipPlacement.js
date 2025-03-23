export const ShipPlacement = (function() {
  let draggedShip = null;
  let isHorizontal = true;
  let pendingPlacements = [];
  let placementHistory = [];
  let historyIndex = -1;
  let shipSizes = [];
  let setupCallback = null;
  
  function init(sizes, callback) {
    shipSizes = [...sizes];
    setupCallback = callback;
    pendingPlacements = [];
    placementHistory = [[]]; // Initialize with empty state
    historyIndex = 0;
    
    // Make sure isHorizontal is reset to true
    isHorizontal = true;
    
    // Clean up any existing drag-drop events
    cleanupEvents();
    
    // Create the ship placement container
    createPlacementUI();
    
    // Set up event listeners for rotation and drag-drop
    setupEventListeners();
    
    // Add undo/redo buttons
    addUndoRedoButtons();
    
    // Add auto arrange button
    addAutoArrangeButton();
  }
  
  function cleanupEvents() {
    // Remove existing event handlers to prevent duplicates
    document.removeEventListener("keydown", handleRotation);
    
    const existingShips = document.querySelectorAll(".ship");
    existingShips.forEach(ship => {
      ship.removeEventListener("dragstart", handleDragStart);
      ship.removeEventListener("dragend", handleDragEnd);
    });
    
    const cells = document.querySelectorAll("#player-board .grid-cell");
    cells.forEach(cell => {
      cell.removeEventListener("dragover", handleDragOver);
      cell.removeEventListener("dragenter", handleDragEnter);
      cell.removeEventListener("dragleave", handleDragLeave);
      cell.removeEventListener("drop", handleDrop);
    });
  }
  
  // Handle rotation as a named function so we can remove the event listener
  function handleRotation(e) {
    if (e.key.toLowerCase() === 'r') {
      isHorizontal = !isHorizontal;
      document.querySelectorAll(".ship").forEach(ship => {
        ship.classList.toggle("horizontal");
        ship.classList.toggle("vertical");
      });
    }
  }
  
  function createPlacementUI() {
    // Get the player board container
    const playerBoardContainer = document.querySelector(".board-container:first-child");
    
    // Check if the placement container already exists
    let placementContainer = document.querySelector(".ship-placement-container");
    if (placementContainer) {
      placementContainer.remove();
    }
    
    // Create the ship placement container
    placementContainer = document.createElement("div");
    placementContainer.className = "ship-placement-container";
    playerBoardContainer.insertBefore(placementContainer, playerBoardContainer.querySelector(".buttons"));
    
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
    document.addEventListener("keydown", handleRotation);
    
    // Drag and drop events
    const ships = document.querySelectorAll(".ship");
    const cells = document.querySelectorAll("#player-board .grid-cell");
    
    // Add drag events to ships
    ships.forEach(ship => {
      ship.addEventListener("dragstart", handleDragStart);
      ship.addEventListener("dragend", handleDragEnd);
      
      // Add keyboard focus and interaction
      ship.setAttribute("tabindex", "0");
      ship.addEventListener("keydown", handleShipKeydown);
      ship.addEventListener("focus", () => {
        ship.classList.add("focused");
      });
      ship.addEventListener("blur", () => {
        ship.classList.remove("focused");
      });
    });
    
    // Add drop events to grid cells
    cells.forEach(cell => {
      cell.addEventListener("dragover", handleDragOver);
      cell.addEventListener("dragenter", handleDragEnter);
      cell.addEventListener("dragleave", handleDragLeave);
      cell.addEventListener("drop", handleDrop);
    });
  }

  function handleShipKeydown(e) {
    // Enter or Space to select ship for placement
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      draggedShip = {
        element: this,
        size: parseInt(this.dataset.size),
        index: parseInt(this.dataset.index)
      };
      
      // Visually indicate selection
      document.querySelectorAll(".ship").forEach(ship => {
        ship.classList.remove("keyboard-selected");
      });
      this.classList.add("keyboard-selected");
      
      // Auto-focus the first cell on the board to allow arrow navigation
      const firstCell = document.querySelector("#player-board .grid-cell");
      if (firstCell) {
        firstCell.focus();
      }
    }
  }
  
  function handleDragStart(e) {
    draggedShip = {
      element: this,
      size: parseInt(this.dataset.size),
      index: parseInt(this.dataset.index)
    };
    this.classList.add("dragging");
    
    // Store the initial orientation
    draggedShip.initialOrientation = isHorizontal;
    
    // Add right-click to rotate capability
    document.addEventListener("contextmenu", handleContextMenuDuringDrag);
    
    // For Firefox compatibility
    e.dataTransfer.setData("text/plain", "");
    e.dataTransfer.effectAllowed = "move";
  }
  
  function handleDragEnd() {
    this.classList.remove("dragging");
    
    // Remove the context menu handler
    document.removeEventListener("contextmenu", handleContextMenuDuringDrag);
    
    // Clear any highlighted cells
    document.querySelectorAll(".grid-cell.highlight, .grid-cell.row-highlight, .grid-cell.col-highlight").forEach(cell => {
      cell.classList.remove("highlight");
      cell.classList.remove("valid");
      cell.classList.remove("invalid");
      cell.classList.remove("preview");
      cell.classList.remove("row-highlight");
      cell.classList.remove("col-highlight");
    });
  }
  
  function handleContextMenuDuringDrag(e) {
    e.preventDefault();
    
    if (!draggedShip) return;
    
    // Toggle orientation during drag
    isHorizontal = !isHorizontal;
    
    // Update visual feedback
    document.querySelectorAll(".ship").forEach(ship => {
      ship.classList.toggle("horizontal");
      ship.classList.toggle("vertical");
    });
    
    // Re-highlight with new orientation if over a cell
    const cell = document.elementFromPoint(e.clientX, e.clientY);
    if (cell && cell.classList.contains("grid-cell")) {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      highlightShipPlacement(row, col, draggedShip.size, isHorizontal);
    }
    
    return false;
  }
  
  function handleDragOver(e) {
    e.preventDefault();
    
    if (!draggedShip) return;
    
    // Get board boundaries
    const boardRect = document.querySelector("#player-board .grid-container").getBoundingClientRect();
    
    // Check if cursor is within board boundaries (with some margin)
    const margin = 10; // pixels
    const inBoardArea = (
      e.clientX >= boardRect.left - margin &&
      e.clientX <= boardRect.right + margin &&
      e.clientY >= boardRect.top - margin &&
      e.clientY <= boardRect.bottom + margin
    );
    
    if (!inBoardArea) {
      // If outside board area, clear highlights
      document.querySelectorAll(".grid-cell.highlight, .grid-cell.row-highlight, .grid-cell.col-highlight").forEach(cell => {
        cell.classList.remove("highlight");
        cell.classList.remove("valid");
        cell.classList.remove("invalid");
        cell.classList.remove("preview");
        cell.classList.remove("row-highlight");
        cell.classList.remove("col-highlight");
      });
      return false;
    }
    
    // Calculate the cell under the cursor
    const cellSize = 50; // Based on your CSS
    const col = Math.floor((e.clientX - boardRect.left) / cellSize);
    const row = Math.floor((e.clientY - boardRect.top) / cellSize);
    
    // Make sure we're over a valid cell
    if (row >= 0 && row < 10 && col >= 0 && col < 10) {
      highlightShipPlacement(row, col, draggedShip.size, isHorizontal);
    }
    
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
      
      // Add to history (discard any redo states)
      historyIndex++;
      placementHistory = placementHistory.slice(0, historyIndex);
      placementHistory.push([...pendingPlacements]);
      
      // Visual feedback
      draggedShip.element.classList.add("placed");
      
      // Update buttons
      updateStartButton();
      updateUndoRedoButtons();
      
      // Update the board preview
      updateBoardPreview();
    }
    
    return false;
  }
  
  function highlightShipPlacement(row, col, size, horizontal) {
    // Clear previous highlights
    document.querySelectorAll(".grid-cell.highlight, .grid-cell.row-highlight, .grid-cell.col-highlight").forEach(cell => {
      cell.classList.remove("highlight");
      cell.classList.remove("valid");
      cell.classList.remove("invalid");
      cell.classList.remove("preview");
      cell.classList.remove("row-highlight");
      cell.classList.remove("col-highlight");
    });
    
    const isValid = isValidPlacement(row, col, size, horizontal);
    const cells = getCellsForPlacement(row, col, size, horizontal);
    
    // Highlight the specific ship placement cells
    cells.forEach(cell => {
      if (cell) {
        cell.classList.add("highlight");
        cell.classList.add(isValid ? "valid" : "invalid");
        
        if (isValid) {
          cell.classList.add("preview");
        }
      }
    });
    
    // Highlight the entire row or column
    if (horizontal) {
      // Highlight the row
      for (let c = 0; c < 10; c++) {
        const rowCell = document.querySelector(`#player-board .grid-cell[data-row="${row}"][data-col="${c}"]`);
        if (rowCell && !rowCell.classList.contains("highlight")) {
          rowCell.classList.add("row-highlight");
        }
      }
    } else {
      // Highlight the column
      for (let r = 0; r < 10; r++) {
        const colCell = document.querySelector(`#player-board .grid-cell[data-row="${r}"][data-col="${col}"]`);
        if (colCell && !colCell.classList.contains("highlight")) {
          colCell.classList.add("col-highlight");
        }
      }
    }
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

  function addUndoRedoButtons() {
    const placementContainer = document.querySelector(".ship-placement-container");
    if (!placementContainer) return;
    
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "undo-redo-container";
    
    const undoButton = document.createElement("button");
    undoButton.className = "undo-button";
    undoButton.textContent = "Undo";
    undoButton.disabled = true;
    undoButton.addEventListener("click", undo);
    
    const redoButton = document.createElement("button");
    redoButton.className = "redo-button";
    redoButton.textContent = "Redo";
    redoButton.disabled = true;
    redoButton.addEventListener("click", redo);
    
    buttonContainer.appendChild(undoButton);
    buttonContainer.appendChild(redoButton);
    
    // Insert before the start button
    const startButton = placementContainer.querySelector(".start-game");
    placementContainer.insertBefore(buttonContainer, startButton);
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      pendingPlacements = [...placementHistory[historyIndex]];
      updateShipElements();
      updateBoardPreview();
      updateStartButton();
      updateUndoRedoButtons();
    }
  }

  function redo() {
    if (historyIndex < placementHistory.length - 1) {
      historyIndex++;
      pendingPlacements = [...placementHistory[historyIndex]];
      updateShipElements();
      updateBoardPreview();
      updateStartButton();
      updateUndoRedoButtons();
    }
  }

  function updateUndoRedoButtons() {
    const undoButton = document.querySelector(".undo-button");
    const redoButton = document.querySelector(".redo-button");
    
    if (undoButton) {
      undoButton.disabled = historyIndex <= 0;
    }
    
    if (redoButton) {
      redoButton.disabled = historyIndex >= placementHistory.length - 1;
    }
  }

  function updateShipElements() {
    // Reset all ships to unplaced state
    document.querySelectorAll(".ship").forEach(ship => {
      ship.classList.remove("placed");
    });
    
    // Mark ships as placed based on current pendingPlacements
    pendingPlacements.forEach(placement => {
      const shipElement = document.querySelector(`.ship[data-index="${placement.index}"]`);
      if (shipElement) {
        shipElement.classList.add("placed");
      }
    });
  }

  function addAutoArrangeButton() {
    const placementContainer = document.querySelector(".ship-placement-container");
    if (!placementContainer) return;
    
    const autoArrangeButton = document.createElement("button");
    autoArrangeButton.className = "auto-arrange-button";
    autoArrangeButton.textContent = "Auto Arrange";
    autoArrangeButton.addEventListener("click", autoArrangeShips);
    
    // Insert before the undo/redo buttons
    const undoRedoContainer = placementContainer.querySelector(".undo-redo-container");
    if (undoRedoContainer) {
      placementContainer.insertBefore(autoArrangeButton, undoRedoContainer);
    } else {
      const startButton = placementContainer.querySelector(".start-game");
      placementContainer.insertBefore(autoArrangeButton, startButton);
    }
  }

  function autoArrangeShips() {
    // Reset placements
    pendingPlacements = [];
    
    // Create a temporary board for placement
    const tempBoard = [];
    for (let i = 0; i < 10; i++) {
      tempBoard[i] = [];
      for (let j = 0; j < 10; j++) {
        tempBoard[i][j] = 0;
      }
    }
    
    // Algorithm to place ships
    const strategies = [
      // Edge-focused strategy
      () => {
        return shipSizes.map((size, index) => {
          const isHorizontal = Math.random() > 0.5;
          let maxAttempts = 100;
          let placed = false;
          let placement = null;
          
          // Try to place along edges first
          while (!placed && maxAttempts > 0) {
            maxAttempts--;
            
            let row, col;
            
            if (isHorizontal) {
              // Place horizontally along top or bottom edge
              row = Math.random() > 0.5 ? 0 : 9;
              col = Math.floor(Math.random() * (10 - size));
            } else {
              // Place vertically along left or right edge
              col = Math.random() > 0.5 ? 0 : 9;
              row = Math.floor(Math.random() * (10 - size));
            }
            
            if (canPlaceShipOnTempBoard(tempBoard, size, row, col, isHorizontal)) {
              placeShipOnTempBoard(tempBoard, size, row, col, isHorizontal);
              placement = { size, row, col, isHorizontal, index };
              placed = true;
            }
          }
          
          // If edge placement failed, try random placement
          if (!placed) {
            while (!placed) {
              const row = Math.floor(Math.random() * (10 - (isHorizontal ? 0 : size)));
              const col = Math.floor(Math.random() * (10 - (isHorizontal ? size : 0)));
              
              if (canPlaceShipOnTempBoard(tempBoard, size, row, col, isHorizontal)) {
                placeShipOnTempBoard(tempBoard, size, row, col, isHorizontal);
                placement = { size, row, col, isHorizontal, index };
                placed = true;
              }
            }
          }
          
          return placement;
        });
      },
      
      // Distribute evenly strategy
      () => {
        // Divide the board into quadrants for better distribution
        const quadrants = [
          { rowStart: 0, rowEnd: 4, colStart: 0, colEnd: 4 },
          { rowStart: 0, rowEnd: 4, colStart: 5, colEnd: 9 },
          { rowStart: 5, rowEnd: 9, colStart: 0, colEnd: 4 },
          { rowStart: 5, rowEnd: 9, colStart: 5, colEnd: 9 }
        ];
        
        return shipSizes.map((size, index) => {
          const quadrant = quadrants[index % quadrants.length];
          const isHorizontal = Math.random() > 0.5;
          let placed = false;
          let placement = null;
          
          // Try to place within assigned quadrant
          let attempts = 50;
          while (!placed && attempts > 0) {
            attempts--;
            
            const row = Math.floor(Math.random() * (quadrant.rowEnd - quadrant.rowStart + 1 - (isHorizontal ? 0 : Math.min(size, quadrant.rowEnd - quadrant.rowStart + 1)))) + quadrant.rowStart;
            const col = Math.floor(Math.random() * (quadrant.colEnd - quadrant.colStart + 1 - (isHorizontal ? Math.min(size, quadrant.colEnd - quadrant.colStart + 1) : 0))) + quadrant.colStart;
            
            if (canPlaceShipOnTempBoard(tempBoard, size, row, col, isHorizontal)) {
              placeShipOnTempBoard(tempBoard, size, row, col, isHorizontal);
              placement = { size, row, col, isHorizontal, index };
              placed = true;
            }
          }
          
          // If quadrant placement failed, try anywhere
          if (!placed) {
            while (!placed) {
              const isHorizontal = Math.random() > 0.5;
              const row = Math.floor(Math.random() * (10 - (isHorizontal ? 0 : size)));
              const col = Math.floor(Math.random() * (10 - (isHorizontal ? size : 0)));
              
              if (canPlaceShipOnTempBoard(tempBoard, size, row, col, isHorizontal)) {
                placeShipOnTempBoard(tempBoard, size, row, col, isHorizontal);
                placement = { size, row, col, isHorizontal, index };
                placed = true;
              }
            }
          }
          
          return placement;
        });
      }
    ];
    
    // Use a random strategy
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    pendingPlacements = strategy();
    
    // Add to history
    historyIndex++;
    placementHistory = placementHistory.slice(0, historyIndex);
    placementHistory.push([...pendingPlacements]);
    
    // Update the UI
    updateShipElements();
    updateBoardPreview();
    updateStartButton();
    updateUndoRedoButtons();
  }

  function canPlaceShipOnTempBoard(tempBoard, size, row, col, isHorizontal) {
    // Check if ship fits on the board
    if (isHorizontal && col + size > 10) return false;
    if (!isHorizontal && row + size > 10) return false;
    
    // Check if the area (ship + 1-cell buffer) is clear
    for (let r = Math.max(0, row - 1); r <= Math.min(9, row + (isHorizontal ? 1 : size)); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(9, col + (isHorizontal ? size : 1)); c++) {
        if (tempBoard[r][c] !== 0) return false;
      }
    }
    
    return true;
  }

  function placeShipOnTempBoard(tempBoard, size, row, col, isHorizontal) {
    // Mark ship cells
    if (isHorizontal) {
      for (let i = 0; i < size; i++) {
        tempBoard[row][col + i] = 1;
      }
    } else {
      for (let i = 0; i < size; i++) {
        tempBoard[row + i][col] = 1;
      }
    }
  }
  
  return {
    init,
    resetPlacements
  };
})();