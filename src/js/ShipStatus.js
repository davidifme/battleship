export const ShipStatus = (function() {
    function createShipStatusDisplay(containerId, shipSizes) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      // Clear any existing status display
      const existingStatus = container.querySelector('.ship-status-display');
      if (existingStatus) existingStatus.remove();
      
      // Create status display container
      const statusDisplay = document.createElement('div');
      statusDisplay.className = 'ship-status-display';
      
      // Add a label
      const label = document.createElement('h3');
      label.textContent = 'Fleet Status';
      statusDisplay.appendChild(label);
      
      // Create ship indicators
      shipSizes.forEach((size, index) => {
        const shipIndicator = document.createElement('div');
        shipIndicator.className = 'ship-indicator';
        shipIndicator.dataset.size = size;
        shipIndicator.dataset.index = index;
        
        // Create ship segments
        const shipDisplay = document.createElement('div');
        shipDisplay.className = 'ship-status-icon';
        
        for (let i = 0; i < size; i++) {
          const segment = document.createElement('div');
          segment.className = 'ship-segment';
          shipDisplay.appendChild(segment);
        }
        
        shipIndicator.appendChild(shipDisplay);
        statusDisplay.appendChild(shipIndicator);
      });
      
      container.appendChild(statusDisplay);
    }
    
    function updateShipStatus(containerId, board) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const statusDisplay = container.querySelector('.ship-status-display');
      if (!statusDisplay) return;
      
      // Create a map of ships and their hit status
      const ships = new Map();
      
      // Scan the board for ships
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          const cell = board[row][col];
          if (cell !== 0 && cell !== 'hit' && cell !== 'miss') {
            // Found a ship
            if (!ships.has(cell)) {
              ships.set(cell, { length: cell.length, hits: cell.hitCounter });
            }
          }
        }
      }
      
      // Update display based on ship status
      const indicators = statusDisplay.querySelectorAll('.ship-indicator');
      indicators.forEach((indicator) => {
        const size = parseInt(indicator.dataset.size);
        
        // Find the ship of this size
        let shipSunk = true;
        for (const [ship, status] of ships.entries()) {
          if (status.length === size) {
            shipSunk = ship.isSunk();
            break;
          }
        }
        
        // If no ship of this size found on board, assume it's sunk
        if (ships.size === 0 || shipSunk) {
          indicator.classList.add('sunk');
        } else {
          indicator.classList.remove('sunk');
        }
      });
    }
    
    return {
      createShipStatusDisplay,
      updateShipStatus
    };
  })();