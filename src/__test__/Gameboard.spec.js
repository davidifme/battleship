import { describe, it, expect, beforeEach } from "vitest";
import { Gameboard } from "../js/gameBoard";
import { Ship } from "../js/Ship";

describe("Gameboard factory", () => {
  let testBoard;
  let testShip;
  
  beforeEach(() => {
    testBoard = Gameboard.createBoard(10);
    testShip = {
      length: 3,
      hitCounter: 0,
      sunk: false,
      hit() { this.hitCounter++; },
      isSunk() { return this.hitCounter >= this.length; }
    };
  });
  
  it("creates a board with the specified size", () => {
    const smallBoard = Gameboard.createBoard(5);
    const largeBoard = Gameboard.createBoard(10);
    
    expect(smallBoard.length).toBe(5);
    expect(largeBoard.length).toBe(10);
    
    // Check that all cells are initialized to 0
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        expect(largeBoard[i][j]).toBe(0);
      }
    }
  });
  
  describe("placeShip function", () => {
    it("places ships horizontally on the board", () => {
      const result = Gameboard.placeShip(testBoard, testShip, 3, 4, true);
      
      expect(result).toBe(true);
      expect(testBoard[3][4]).toBe(testShip);
      expect(testBoard[3][5]).toBe(testShip);
      expect(testBoard[3][6]).toBe(testShip);
    });
    
    it("places ships vertically on the board", () => {
      const result = Gameboard.placeShip(testBoard, testShip, 2, 2, false);
      
      expect(result).toBe(true);
      expect(testBoard[2][2]).toBe(testShip);
      expect(testBoard[3][2]).toBe(testShip);
      expect(testBoard[4][2]).toBe(testShip);
    });
    
    it("prevents ships from extending beyond the board horizontally", () => {
      const result = Gameboard.placeShip(testBoard, testShip, 0, 8, true);
      
      expect(result).toBe(false);
      expect(testBoard[0][8]).toBe(0);
      expect(testBoard[0][9]).toBe(0);
    });
    
    it("prevents ships from extending beyond the board vertically", () => {
      const result = Gameboard.placeShip(testBoard, testShip, 8, 0, false);
      
      expect(result).toBe(false);
      expect(testBoard[8][0]).toBe(0);
      expect(testBoard[9][0]).toBe(0);
    });
    
    it("prevents ships from overlapping", () => {
      // Place first ship
      Gameboard.placeShip(testBoard, testShip, 3, 3, true);
      
      // Try to place second ship overlapping
      const secondShip = { ...testShip };
      const result = Gameboard.placeShip(testBoard, secondShip, 2, 4, false);
      
      expect(result).toBe(false);
    });
    
    it("prevents ships from being placed adjacent to other ships", () => {
      // Place first ship at (3, 3) horizontally
      Gameboard.placeShip(testBoard, testShip, 3, 3, true);
      
      // Try to place ships adjacent
      const ship2 = { ...testShip };
      const aboveResult = Gameboard.placeShip(testBoard, ship2, 2, 3, true);
      expect(aboveResult).toBe(false);
      
      const ship3 = { ...testShip };
      const belowResult = Gameboard.placeShip(testBoard, ship3, 4, 3, true);
      expect(belowResult).toBe(false);
      
      const ship4 = { ...testShip };
      const leftResult = Gameboard.placeShip(testBoard, ship4, 3, 0, true);
      expect(leftResult).toBe(false);
      
      const ship5 = { ...testShip };
      // The ship at (3, 3) has length 3, so it occupies (3,3), (3,4), (3,5)
      // A ship at (3, 6) would be adjacent to it
      const rightResult = Gameboard.placeShip(testBoard, ship5, 3, 6, true);
      expect(rightResult).toBe(false);
    });
  });
  
  describe("receiveAttack function", () => {
    beforeEach(() => {
      // Place a ship for testing attacks
      Gameboard.placeShip(testBoard, testShip, 2, 3, true);
    });
    
    it("records hits on ships", () => {
      const result = Gameboard.receiveAttack(testBoard, 2, 3);
      
      expect(result).toBe(true);
      expect(testBoard[2][3]).toBe("hit");
      expect(testShip.hitCounter).toBe(1);
    });
    
    it("records misses on empty squares", () => {
      const result = Gameboard.receiveAttack(testBoard, 5, 5);
      
      expect(result).toBe(true);
      expect(testBoard[5][5]).toBe("miss");
      expect(testShip.hitCounter).toBe(0);
    });
    
    it("rejects attacks outside the board boundaries", () => {
      const result1 = Gameboard.receiveAttack(testBoard, -1, 5);
      const result2 = Gameboard.receiveAttack(testBoard, 5, 10);
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
    
    it("rejects attacks on already hit positions", () => {
      // Hit once
      Gameboard.receiveAttack(testBoard, 2, 3);
      
      // Try to hit same position again
      const result = Gameboard.receiveAttack(testBoard, 2, 3);
      
      expect(result).toBe(false);
      expect(testShip.hitCounter).toBe(1); // Hit counter shouldn't increase
    });
    
    it("rejects attacks on already missed positions", () => {
      // Miss once
      Gameboard.receiveAttack(testBoard, 5, 5);
      
      // Try to hit same position again
      const result = Gameboard.receiveAttack(testBoard, 5, 5);
      
      expect(result).toBe(false);
    });
  });
  
  describe("allShipsSunk function", () => {
    it("returns false when no ships have been sunk", () => {
      Gameboard.placeShip(testBoard, testShip, 2, 3, true);
      
      expect(Gameboard.allShipsSunk(testBoard)).toBe(false);
    });
    
    it("returns false when some but not all ships are sunk", () => {
      const ship1 = {
        length: 2,
        hitCounter: 0,
        hit() { this.hitCounter++; },
        isSunk() { return this.hitCounter >= this.length; }
      };
      
      const ship2 = {
        length: 3,
        hitCounter: 0,
        hit() { this.hitCounter++; },
        isSunk() { return this.hitCounter >= this.length; }
      };
      
      Gameboard.placeShip(testBoard, ship1, 1, 1, true);
      Gameboard.placeShip(testBoard, ship2, 5, 5, false);
      
      // Sink the first ship
      Gameboard.receiveAttack(testBoard, 1, 1);
      Gameboard.receiveAttack(testBoard, 1, 2);
      
      expect(ship1.isSunk()).toBe(true);
      expect(ship2.isSunk()).toBe(false);
      expect(Gameboard.allShipsSunk(testBoard)).toBe(false);
    });
    
    it("returns true when all ships are sunk", () => {
      const ship1 = {
        length: 2,
        hitCounter: 0,
        hit() { this.hitCounter++; },
        isSunk() { return this.hitCounter >= this.length; }
      };
      
      const ship2 = {
        length: 1,
        hitCounter: 0,
        hit() { this.hitCounter++; },
        isSunk() { return this.hitCounter >= this.length; }
      };
      
      Gameboard.placeShip(testBoard, ship1, 1, 1, true);
      Gameboard.placeShip(testBoard, ship2, 5, 5, false);
      
      // Sink all ships
      Gameboard.receiveAttack(testBoard, 1, 1);
      Gameboard.receiveAttack(testBoard, 1, 2);
      Gameboard.receiveAttack(testBoard, 5, 5);
      
      expect(ship1.isSunk()).toBe(true);
      expect(ship2.isSunk()).toBe(true);
      expect(Gameboard.allShipsSunk(testBoard)).toBe(true);
    });
    
    it("returns true when no ships are on board but hits exist", () => {
      // Create a board with only hits (simulating all ships being sunk)
      testBoard[3][3] = "hit";
      testBoard[3][4] = "hit";
      testBoard[3][5] = "hit";
      
      expect(Gameboard.allShipsSunk(testBoard)).toBe(true);
    });
    
    it("returns false when board is empty", () => {
      // Empty board, no ships placed yet
      expect(Gameboard.allShipsSunk(testBoard)).toBe(false);
    });
  });
});