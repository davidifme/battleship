import { describe, it, expect, vi, beforeEach } from "vitest";
import { Player } from "../js/Player";
import { Gameboard } from "../js/gameBoard";

describe("Player factory", () => {
  beforeEach(() => {
    vi.spyOn(Gameboard, "createBoard").mockReturnValue([[]]);
    vi.spyOn(Gameboard, "receiveAttack").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createPlayer function", () => {
    it("creates a human player correctly", () => {
      const player = Player.createPlayer("human");
      
      expect(player.type).toBe("human");
      expect(player.board).toEqual([[]]);
      expect(player.isComputer).toBe(false);
      expect(typeof player.attack).toBe("function");
    });
    
    it("creates a computer player correctly", () => {
      const computer = Player.createPlayer("computer");
      
      expect(computer.type).toBe("computer");
      expect(computer.board).toEqual([[]]);
      expect(computer.isComputer).toBe(true);
      expect(typeof computer.attack).toBe("function");
    });

    it("initializes a 10x10 board for players", () => {
      Player.createPlayer("human");
      
      expect(Gameboard.createBoard).toHaveBeenCalledWith(10);
    });
  });

  describe("attack function", () => {
    it("calls receiveAttack with correct coordinates for human player", () => {
      const player = Player.createPlayer("human");
      const enemyBoard = [[]];
      
      const result = player.attack(enemyBoard, 3, 5);
      
      expect(Gameboard.receiveAttack).toHaveBeenCalledWith(enemyBoard, 3, 5);
      expect(result).toBe(true);
    });
  });

  describe("makeRandomAttack function", () => {
    it("returns valid coordinates from available spots", () => {
      const mockBoard = [
        ["hit", "miss", 0],
        [0, "hit", "hit"],
        ["miss", 0, "miss"]
      ];
      
      // Mock Math.random to return predictable values
      vi.spyOn(Math, "random").mockReturnValue(0.1);
      
      const result = Player.makeRandomAttack(mockBoard);
      
      expect(result).toEqual({ row: 0, col: 2 });
    });
    
    it("returns false when no available spots remain", () => {
      const mockBoard = [
        ["hit", "miss", "hit"],
        ["miss", "hit", "hit"],
        ["miss", "hit", "miss"]
      ];
      
      const result = Player.makeRandomAttack(mockBoard);
      
      expect(result).toBe(false);
    });
    
    it("only selects non-attacked spots", () => {
      const mockBoard = [
        [0, "miss", 0],
        [0, "hit", 0],
        [0, 0, 0]
      ];
      
      // Mock to get different results on multiple calls
      const mockMath = vi.spyOn(Math, "random");
      mockMath.mockReturnValueOnce(0.8); // Will select one of the later available spots
      
      const result = Player.makeRandomAttack(mockBoard);
      
      // Check that the selected coordinates contain neither "hit" nor "miss"
      expect(mockBoard[result.row][result.col]).toBe(0);
    });
  });

  describe("computerAttack function", () => {
    it("uses makeRandomAttack to determine attack coordinates", () => {
      const computer = Player.createPlayer("computer");
      const enemyBoard = [[]];
      
      vi.spyOn(Player, "makeRandomAttack").mockReturnValue({ row: 2, col: 3 });
      
      computer.attack(enemyBoard);
      
      expect(Player.makeRandomAttack).toHaveBeenCalledWith(enemyBoard);
      expect(Gameboard.receiveAttack).toHaveBeenCalledWith(enemyBoard, 2, 3);
    });
    
    it("returns false when no valid attacks are possible", () => {
      const computer = Player.createPlayer("computer");
      const enemyBoard = [[]];
      
      vi.spyOn(Player, "makeRandomAttack").mockReturnValue(false);
      
      const result = computer.attack(enemyBoard);
      
      expect(result).toBe(false);
      expect(Gameboard.receiveAttack).not.toHaveBeenCalled();
    });
    
    it("returns the result of the attack", () => {
      const computer = Player.createPlayer("computer");
      const enemyBoard = [[]];
      
      vi.spyOn(Player, "makeRandomAttack").mockReturnValue({ row: 1, col: 1 });
      vi.spyOn(Gameboard, "receiveAttack").mockReturnValueOnce(true);
      
      const result = computer.attack(enemyBoard);
      expect(result).toBe(true);
      
      vi.spyOn(Gameboard, "receiveAttack").mockReturnValueOnce(false);
      vi.spyOn(Player, "makeRandomAttack").mockReturnValue({ row: 2, col: 2 });
      
      const result2 = computer.attack(enemyBoard);
      expect(result2).toBe(false);
    });
  });
});