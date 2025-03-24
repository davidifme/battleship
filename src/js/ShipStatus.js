export const ShipStatus = (function() {
    // Direct mapping between ships and their UI indicators
    const shipToIndicatorMap = new Map();
    
    function createShipStatusDisplay(containerId, shipSizes) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      // Clear any existing status display
      const existingStatus = container.querySelector('.ship-status-display');
      if (existingStatus) existingStatus.remove();
      
      // Reset ship mapping
      shipToIndicatorMap.clear();
      
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
        shipIndicator.dataset.containerId = containerId; // Store container ID for reference
        
        // Create ship segments
        const shipDisplay = document.createElement('div');
        shipDisplay.className = 'ship-status-icon';
        
        for (let i = 0; i < size; i++) {
          const segment = document.createElement('div');
          segment.className = 'ship-segment';
          segment.dataset.segment = i;
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
      
      // First pass: Find all ships on the board and their states
      const shipsOnBoard = [];
      const shipObjects = new Set(); // Use Set to track unique ship objects
      
      // Collect all ships from the board
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          const cell = board[row][col];
          if (cell !== 0 && cell !== 'hit' && cell !== 'miss') {
            // This is a ship cell
            if (!shipObjects.has(cell)) {
              shipObjects.add(cell);
              shipsOnBoard.push({
                ship: cell,
                size: cell.length,
                hits: cell.hitCounter,
                isSunk: cell.isSunk()
              });
            }
          }
        }
      }
      
      // Get all indicators for this container
      const indicators = statusDisplay.querySelectorAll('.ship-indicator');
      
      // Update mapping between ships and indicators if needed
      if (shipToIndicatorMap.size === 0 || shipToIndicatorMap.get(containerId) === undefined) {
        // Initialize the mapping for this container
        shipToIndicatorMap.set(containerId, new Map());
        
        // Map ships to indicators by size and index
        const sizeGroups = new Map();
        shipsOnBoard.forEach(shipData => {
          if (!sizeGroups.has(shipData.size)) {
            sizeGroups.set(shipData.size, []);
          }
          sizeGroups.get(shipData.size).push(shipData);
        });
        
        // Assign indicators to ships
        indicators.forEach(indicator => {
          const size = parseInt(indicator.dataset.size);
          const index = parseInt(indicator.dataset.index);
          
          const shipsOfSize = sizeGroups.get(size) || [];
          if (index < shipsOfSize.length) {
            const shipData = shipsOfSize[index];
            shipToIndicatorMap.get(containerId).set(shipData.ship, indicator);
          }
        });
      }
      
      // Find which ships are no longer on the board (likely sunk)
      const containerMapping = shipToIndicatorMap.get(containerId) || new Map();
      const sunkShips = new Map(); // Ships that were previously mapped but now gone
      
      // Check for ships that are no longer on board
      containerMapping.forEach((indicator, ship) => {
        let stillExists = false;
        for (const shipData of shipsOnBoard) {
          if (shipData.ship === ship) {
            stillExists = true;
            break;
          }
        }
        if (!stillExists) {
          sunkShips.set(ship, indicator);
        }
      });
      
      // First update the ships still on board
      for (const shipData of shipsOnBoard) {
        const indicator = containerMapping.get(shipData.ship);
        if (indicator) {
          updateIndicator(indicator, shipData.hits, shipData.isSunk);
        } else {
          // Try to find an unused indicator of matching size
          const unusedIndicator = findUnusedIndicator(indicators, containerMapping, shipData.size);
          if (unusedIndicator) {
            containerMapping.set(shipData.ship, unusedIndicator);
            updateIndicator(unusedIndicator, shipData.hits, shipData.isSunk);
          }
        }
      }
      
      // Update indicators for sunken ships
      sunkShips.forEach((indicator, ship) => {
        updateIndicator(indicator, ship.length, true);
      });
      
      // Finally, handle any indicators that don't have ships assigned
      let hasHits = false;
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          if (board[row][col] === 'hit') {
            hasHits = true;
            break;
          }
        }
        if (hasHits) break;
      }
      
      indicators.forEach(indicator => {
        let isAssigned = false;
        containerMapping.forEach((assignedIndicator) => {
          if (assignedIndicator === indicator) {
            isAssigned = true;
          }
        });
        
        // If not assigned to any ship and we have hits, mark as sunk
        if (!isAssigned && hasHits) {
          const size = parseInt(indicator.dataset.size);
          let matchingSizeOnBoard = false;
          
          // Check if any ships of this size are still on board
          for (const shipData of shipsOnBoard) {
            if (shipData.size === size) {
              matchingSizeOnBoard = true;
              break;
            }
          }
          
          // If no ships of this size remain, mark as sunk
          if (!matchingSizeOnBoard) {
            updateIndicator(indicator, size, true);
          }
        }
      });
    }
    
    // Helper function to update an indicator's visual state
    function updateIndicator(indicator, hits, isSunk) {
      const segments = indicator.querySelectorAll('.ship-segment');
      
      // Update hit segments
      segments.forEach((segment, i) => {
        if (i < hits) {
          segment.classList.add('hit');
        } else {
          segment.classList.remove('hit');
        }
      });
      
      // Update sunk status
      if (isSunk) {
        indicator.classList.add('sunk');
      } else {
        indicator.classList.remove('sunk');
      }
    }
    
    // Helper function to find an unused indicator of the right size
    function findUnusedIndicator(indicators, mapping, size) {
      // Create a set of already assigned indicators
      const assignedIndicators = new Set();
      mapping.forEach(indicator => {
        assignedIndicators.add(indicator);
      });
      
      // Find an unassigned indicator of the right size
      for (const indicator of indicators) {
        if (!assignedIndicators.has(indicator) && 
            parseInt(indicator.dataset.size) === size) {
          return indicator;
        }
      }
      
      return null;
    }
    
    return {
      createShipStatusDisplay,
      updateShipStatus
    };
})();