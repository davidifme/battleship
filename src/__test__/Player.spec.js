import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Player } from "../js/Player";
import { Gameboard } from "../js/gameBoard";

describe("Player factory", () => {
  it("creates a human player with correct properties", () => {
    // Mock the Gameboard.createBoard function
    vi.spyOn(Gameboard, "createBoard").mockReturnValue([]);

    const player = Player.createPlayer("human");

    expect(player.type).toBe("human");
    expect(player.board).toEqual([]);
    expect(player.isComputer).toBe(false);
    expect(typeof player.attack).toBe("function");
    expect(player.attack).toBe(Player.attack);
  });

  it("creates a computer player with correct properties", () => {
    // Mock the Gameboard.createBoard function
    vi.spyOn(Gameboard, "createBoard").mockReturnValue([]);

    const player = Player.createPlayer("computer");

    expect(player.type).toBe("computer");
    expect(player.board).toEqual([]);
    expect(player.isComputer).toBe(true);
    expect(typeof player.attack).toBe("function");
    expect(player.attack).toBe(Player.computerAttack);
  });

  it("creates a gameboard of size 10 for the player", () => {
    // Mock and spy on the Gameboard.createBoard function
    const createBoardSpy = vi.spyOn(Gameboard, "createBoard");

    Player.createPlayer("human");

    expect(createBoardSpy).toHaveBeenCalledWith(10);
  });
});

describe("makeRandomAttack function", () => {
  it("returns coordinates within the board boundaries", () => {
    const mockBoard = Array(10)
      .fill()
      .map(() => Array(10).fill(null));
    const result = Player.makeRandomAttack(mockBoard);

    expect(result).toHaveProperty("row");
    expect(result).toHaveProperty("col");
    expect(result.row).toBeGreaterThanOrEqual(0);
    expect(result.row).toBeLessThan(10);
    expect(result.col).toBeGreaterThanOrEqual(0);
    expect(result.col).toBeLessThan(10);
  });

  it("only selects non-attacked spots", () => {
    const mockBoard = Array(3)
      .fill()
      .map(() => Array(3).fill("hit"));
    mockBoard[1][1] = null; // Only one available spot

    const result = Player.makeRandomAttack(mockBoard);

    expect(result).toEqual({ row: 1, col: 1 });
  });

  it("returns false when no spots are available", () => {
    const mockBoard = Array(3)
      .fill()
      .map(() => Array(3).fill("hit"));

    const result = Player.makeRandomAttack(mockBoard);

    expect(result).toBe(false);
  });

  it("avoids both hit and miss spots", () => {
    const mockBoard = [
      ["hit", "miss", null],
      ["miss", null, "hit"],
      [null, "hit", "miss"],
    ];

    // Mock Math.random to return predictable values
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const result = Player.makeRandomAttack(mockBoard);

    expect(result).toEqual({ row: 0, col: 2 }); // First available spot

    randomSpy.mockRestore();
  });
});

describe("Player attack functions", () => {
  let makeRandomAttackSpy;
  let receiveAttackSpy;

  beforeEach(() => {
    // Set up spies before each test
    makeRandomAttackSpy = vi.spyOn(Player, "makeRandomAttack");
    receiveAttackSpy = vi.spyOn(Gameboard, "receiveAttack");
  });

  afterEach(() => {
    // Clean up spies after each test
    vi.restoreAllMocks();
  });

  it("attack function calls Gameboard.receiveAttack with correct coordinates", () => {
    const mockBoard = [
      ["ship", null],
      [null, null],
    ];
    receiveAttackSpy.mockReturnValue("hit");

    const result = Player.attack(mockBoard, 0, 0);

    expect(receiveAttackSpy).toHaveBeenCalledWith(mockBoard, 0, 0);
    expect(result).toBe("hit");
  });

  it("computerAttack function selects random coordinates and attacks", () => {
    const mockBoard = [
      ["ship", null],
      [null, null],
    ];

    // Mock the makeRandomAttack function to return fixed coordinates
    makeRandomAttackSpy.mockReturnValue({ row: 0, col: 0 });
    receiveAttackSpy.mockReturnValue("hit");

    const result = Player.computerAttack(mockBoard);

    expect(makeRandomAttackSpy).toHaveBeenCalledWith(mockBoard);
    expect(receiveAttackSpy).toHaveBeenCalledWith(mockBoard, 0, 0);
    expect(result).toBe("hit");
  });

  it("computerAttack returns false when no valid attacks are possible", () => {
    const mockBoard = [
      ["hit", "miss"],
      ["miss", "hit"],
    ];

    // Mock to simulate no available attack spots
    makeRandomAttackSpy.mockReturnValue(false);

    const result = Player.computerAttack(mockBoard);

    expect(result).toBe(false);
  });
});

describe("computerAttack function", () => {
  let mockBoard;
  let makeRandomAttackSpy;
  let receiveAttackSpy;

  beforeEach(() => {
    mockBoard = [
      ["ship", null],
      [null, "ship"],
    ];
    makeRandomAttackSpy = vi.spyOn(Player, "makeRandomAttack");
    receiveAttackSpy = vi.spyOn(Gameboard, "receiveAttack");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls makeRandomAttack with the enemy board", () => {
    makeRandomAttackSpy.mockReturnValue({ row: 0, col: 0 });
    receiveAttackSpy.mockReturnValue("hit");

    Player.computerAttack(mockBoard);

    expect(makeRandomAttackSpy).toHaveBeenCalledWith(mockBoard);
  });

  it("returns the result from receiveAttack when attack is successful", () => {
    makeRandomAttackSpy.mockReturnValue({ row: 1, col: 1 });
    receiveAttackSpy.mockReturnValue("miss");

    const result = Player.computerAttack(mockBoard);

    expect(result).toBe("miss");
    expect(receiveAttackSpy).toHaveBeenCalledWith(mockBoard, 1, 1);
  });

  it("passes the exact coordinates from makeRandomAttack to receiveAttack", () => {
    makeRandomAttackSpy.mockReturnValue({ row: 0, col: 1 });

    // Mock the receiveAttack function to avoid the actual implementation
    receiveAttackSpy.mockReturnValue(true);

    Player.computerAttack(mockBoard);

    expect(receiveAttackSpy).toHaveBeenCalledWith(mockBoard, 0, 1);
  });

  it("returns false without calling receiveAttack when makeRandomAttack returns false", () => {
    makeRandomAttackSpy.mockReturnValue(false);

    const result = Player.computerAttack(mockBoard);

    expect(result).toBe(false);
    expect(receiveAttackSpy).not.toHaveBeenCalled();
  });
});
