import { Gameboard } from "./gameBoard";

export const Player = (function () {
  function createPlayer(playerType) {
    const gameBoard = Gameboard.createBoard(10);
    
    // For computer player, add tracking variables for strategic attacks
    const computerState = {
      lastHit: null,          // Store coordinates of the last successful hit
      firstHit: null,         // Store first hit of a ship to return to it
      successfulDirection: null, // Track direction of successful consecutive hits
      hitsInSequence: [],     // Store all hits in the current sequence
      triedDirections: new Set(), // Track which directions we've tried
      huntMode: false         // Toggle between random (false) and hunting (true) modes
    };

    return {
      type: playerType,
      board: gameBoard,
      attack: playerType === "computer" ? computerAttack : attack,
      isComputer: playerType === "computer",
      computerState: playerType === "computer" ? computerState : null
    };
  }

  function makeRandomAttack(enemyBoard) {
    const boardSize = enemyBoard.length;
    const availableSpots = [];

    // Find all non-attacked spots
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (enemyBoard[i][j] !== "hit" && enemyBoard[i][j] !== "miss") {
          availableSpots.push({ row: i, col: j });
        }
      }
    }

    if (availableSpots.length === 0) {
      return false;
    }

    // Pick a random spot from available ones
    const randomIndex = Math.floor(Math.random() * availableSpots.length);
    const { row, col } = availableSpots[randomIndex];

    return { row, col };
  }

  function attack(enemyBoard, row, col) {
    return Gameboard.receiveAttack(enemyBoard, row, col);
  }

  function computerAttack(enemyBoard) {
    let attackCoords;
    const state = this.computerState;
    
    // If we have a hit and are in hunt mode, use a smart targeting strategy
    if (state.huntMode) {
      attackCoords = getNextSmartTarget(enemyBoard, state);
      
      // If hunt mode can't find a valid target, fall back to random
      if (!attackCoords) {
        state.huntMode = false;
        state.lastHit = null;
        state.firstHit = null;
        state.successfulDirection = null;
        state.hitsInSequence = [];
        state.triedDirections.clear();
        attackCoords = makeRandomAttack(enemyBoard);
      }
    } else {
      // Use random attack when not hunting
      attackCoords = makeRandomAttack(enemyBoard);
    }
    
    if (!attackCoords) return false;

    // Make the attack
    const attackResult = Gameboard.receiveAttack(
      enemyBoard,
      attackCoords.row,
      attackCoords.col
    );
    
    // Update hunting state based on attack result
    if (attackResult) {
      this.lastAttack = attackCoords;
      
      // If hit, update state for smart targeting
      if (enemyBoard[attackCoords.row][attackCoords.col] === "hit") {
        // If we weren't in hunt mode, this is our first hit on a ship
        if (!state.huntMode) {
          state.huntMode = true;
          state.firstHit = {...attackCoords};
          state.lastHit = {...attackCoords};
          state.hitsInSequence = [{ ...attackCoords }];
          state.triedDirections.clear();
        } else {
          // We're in hunt mode and got another hit
          state.lastHit = {...attackCoords};
          state.hitsInSequence.push({ ...attackCoords });
          
          // If we have 2+ hits, we can determine the direction
          if (state.hitsInSequence.length >= 2) {
            const lastHit = state.hitsInSequence[state.hitsInSequence.length - 1];
            const secondLastHit = state.hitsInSequence[state.hitsInSequence.length - 2];
            
            // Determine direction of successful hits
            if (lastHit.row === secondLastHit.row) {
              state.successfulDirection = lastHit.col > secondLastHit.col ? 'right' : 'left';
            } else {
              state.successfulDirection = lastHit.row > secondLastHit.row ? 'down' : 'up';
            }
          }
        }
      } else if (state.huntMode) {
        // It was a miss but we're in hunt mode
        // Mark this direction as tried
        const direction = getDirectionFromCoords(state.lastHit, attackCoords);
        if (direction) {
          state.triedDirections.add(direction);
        }
        
        // If we had a successful direction but now missed, we've reached the end of the ship in this direction
        // Try the opposite direction from the first hit
        if (state.successfulDirection) {
          state.triedDirections.add(state.successfulDirection);
          
          // Reset to the first hit to try the opposite direction
          state.lastHit = {...state.firstHit};
          state.successfulDirection = getOppositeDirection(state.successfulDirection);
        }
      }
    }
    
    return attackResult;
  }
  
  // Helper function to get direction based on two coordinates
  function getDirectionFromCoords(from, to) {
    if (!from || !to) return null;
    
    if (from.row === to.row) {
      if (from.col < to.col) return 'right';
      if (from.col > to.col) return 'left';
    } else if (from.col === to.col) {
      if (from.row < to.row) return 'down';
      if (from.row > to.row) return 'up';
    }
    return null;
  }
  
  // Helper function to get the opposite direction
  function getOppositeDirection(direction) {
    const opposites = {
      'up': 'down',
      'down': 'up',
      'left': 'right', 
      'right': 'left'
    };
    return opposites[direction] || null;
  }
  
  // Function to get the next target based on previous hits
  function getNextSmartTarget(board, state) {
    // Initialize directions to try
    const directions = ['up', 'right', 'down', 'left'];
    
    // If we have a successful direction, prioritize it
    if (state.successfulDirection && !state.triedDirections.has(state.successfulDirection)) {
      return getTargetInDirection(board, state.lastHit, state.successfulDirection);
    }
    
    // Otherwise try each direction that hasn't been tried yet
    for (const direction of directions) {
      if (!state.triedDirections.has(direction)) {
        const target = getTargetInDirection(board, state.lastHit || state.firstHit, direction);
        if (target) {
          return target;
        } else {
          // If no valid target in this direction, mark it as tried
          state.triedDirections.add(direction);
        }
      }
    }
    
    // If we've tried all directions from the last hit, 
    // reset to the first hit and try again in case we missed the opposite end
    if (state.firstHit && state.lastHit && 
       (state.firstHit.row !== state.lastHit.row || state.firstHit.col !== state.lastHit.col)) {
      
      // Reset to first hit
      state.lastHit = {...state.firstHit};
      state.triedDirections.clear();
      
      // Recursively call to try from the first hit
      return getNextSmartTarget(board, state);
    }
    
    // If all directions have been tried and no valid targets, 
    // return to random attacks
    return null;
  }
  
  // Helper function to get target coordinates in a specific direction
  function getTargetInDirection(board, fromCoords, direction) {
    if (!fromCoords) return null;
    
    const { row, col } = fromCoords;
    const boardSize = board.length;
    let targetRow = row;
    let targetCol = col;
    
    // Calculate target coordinates based on direction
    switch (direction) {
      case 'up':
        targetRow = row - 1;
        break;
      case 'right':
        targetCol = col + 1;
        break;
      case 'down':
        targetRow = row + 1;
        break;
      case 'left':
        targetCol = col - 1;
        break;
    }
    
    // Check if target is within board boundaries and not already attacked
    if (targetRow >= 0 && targetRow < boardSize && 
        targetCol >= 0 && targetCol < boardSize && 
        board[targetRow][targetCol] !== "hit" && 
        board[targetRow][targetCol] !== "miss") {
      return { row: targetRow, col: targetCol };
    }
    
    return null;
  }

  return {
    createPlayer,
    makeRandomAttack,
    attack,
    computerAttack,
  };
})();
