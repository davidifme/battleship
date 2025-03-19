import { Game } from '../js/Game';
import { Gameboard } from '../js/gameBoard';
import { Player } from '../js/Player';
import { Ship } from '../js/Ship';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Game Module', () => {
  beforeEach(() => {
    // Reset the game state before each test
    Game.playerBoard = Gameboard.createBoard(10);
    Game.computerBoard = Gameboard.createBoard(10);
    Game.humanPlayer = Player.createPlayer('human');
    Game.computerPlayer = Player.createPlayer('computer');
    Game.currentTurn = 'human';
  });

  it('should initialize the game correctly', () => {
    Game.init();
    expect(Game.playerBoard).toBeDefined();
    expect(Game.computerBoard).toBeDefined();
    expect(Game.humanPlayer).toBeDefined();
    expect(Game.computerPlayer).toBeDefined();
  });

  it('should place ships randomly on the board', () => {
    const board = Gameboard.createBoard(10);
    Game.placeShipsRandomly(board);
    
    // Count cells with ships
    let shipCount = 0;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] !== 0 && board[i][j] !== 'hit' && board[i][j] !== 'miss') {
          shipCount++;
        }
      }
    }
    expect(shipCount).toBeGreaterThan(0);
  });

  it('should switch turns correctly after a human player attack', () => {
    // Setup
    Game.init();
    const ship = Ship.createShip(2);
    Gameboard.placeShip(Game.computerBoard, ship, 0, 0, true);
    
    // Mock event object
    const event = {
      target: {
        dataset: {
          row: '0',
          col: '0',
        },
      },
    };

    // Execute
    Game.handleCellClick(event);
    
    // Assert
    expect(Game.currentTurn).toBe('computer');
  });

  it('should not switch turns if the human player misses', () => {
    Game.init();
    
    // Mock event for a cell with no ship
    const event = {
      target: {
        dataset: {
          row: '5',
          col: '5',
        },
      },
    };

    // Make sure there's no ship at this location
    Game.computerBoard[5][5] = 0;
    
    Game.handleCellClick(event);
    expect(Game.currentTurn).toBe('computer');
  });

  it('should handle game over when all computer ships are sunk', () => {
    Game.init();
    const ship = Ship.createShip(1);
    Gameboard.placeShip(Game.computerBoard, ship, 0, 0, true);
    
    // Mock console.log to test winning message
    const consoleSpy = vi.spyOn(console, 'log');
    
    // Simulate player attack that sinks the only ship
    const event = {
      target: {
        dataset: {
          row: '0',
          col: '0',
        },
      },
    };
    Game.handleCellClick(event);
    
    expect(Gameboard.allShipsSunk(Game.computerBoard)).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith('You win!');
    
    consoleSpy.mockRestore();
  });

  it('should not allow human player to attack if it is not their turn', () => {
    Game.currentTurn = 'computer';
    const initialTurn = Game.currentTurn;
    
    const event = {
      target: {
        dataset: {
          row: '0',
          col: '0',
        },
      },
    };
    
    Game.handleCellClick(event);
    expect(Game.currentTurn).toBe(initialTurn);
  });
});