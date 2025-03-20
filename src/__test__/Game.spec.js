import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { Game } from "../js/Game";
import { Gameboard } from "../js/gameBoard";
import { Player } from "../js/Player";
import { Ship } from "../js/Ship";
import { UserInterface } from "../js/UserInterface";

describe("Game module", () => {
  let mockPlayerAttack;
  
  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div class="grid-container"></div>
    `;
    
    // Create a mock attack function that we can track
    mockPlayerAttack = vi.fn().mockReturnValue(true);
    
    // Mock dependencies
    vi.spyOn(Gameboard, "createBoard").mockReturnValue([]);
    vi.spyOn(Gameboard, "placeShip").mockReturnValue(true);
    vi.spyOn(Player, "createPlayer").mockImplementation((type) => ({
      type,
      board: [],
      isComputer: type === "computer",
      attack: mockPlayerAttack
    }));
    vi.spyOn(Ship, "createShip").mockReturnValue({ length: 3 });
    vi.spyOn(UserInterface, "renderBoard").mockImplementation(() => {});
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize game state correctly", () => {
    Game.init();
    const state = Game.getCurrentState();
    
    expect(state.gameState).toBe("setup");
    expect(state.currentTurn).toBe("player");
    expect(state.playerBoard).toEqual([]);
    expect(state.computerBoard).toEqual([]);
  });

  it("should place ships randomly for computer", () => {
    Game.init();
    
    // Get the number of ships that should be placed
    const shipSizes = Game.getShipSizes();
    
    // Verify each ship was created and placed
    expect(Ship.createShip).toHaveBeenCalledTimes(shipSizes.length);
    expect(Gameboard.placeShip).toHaveBeenCalledTimes(shipSizes.length);
  });

  it("should start game with ship placements", () => {
    Game.init();
    
    const shipPlacements = [
      { size: 5, row: 0, col: 0, isHorizontal: true },
      { size: 4, row: 1, col: 0, isHorizontal: true }
    ];
    
    const result = Game.startGame(shipPlacements);
    
    expect(result).toBe(true);
    expect(Game.getCurrentState().gameState).toBe("playing");
    expect(Ship.createShip).toHaveBeenCalledWith(5);
    expect(Ship.createShip).toHaveBeenCalledWith(4);
    expect(Gameboard.placeShip).toHaveBeenCalledWith([], { length: 3 }, 0, 0, true);
    expect(Gameboard.placeShip).toHaveBeenCalledWith([], { length: 3 }, 1, 0, true);
  });

  it("should not start game if already playing", () => {
    Game.init();
    
    // Start once
    Game.startGame([{ size: 5, row: 0, col: 0, isHorizontal: true }]);
    
    // Try to start again
    const secondResult = Game.startGame([{ size: 4, row: 1, col: 0, isHorizontal: true }]);
    
    expect(secondResult).toBe(false);
  });

  it("should handle cell click correctly during player turn", () => {
    Game.init();
    Game.startGame([{ size: 5, row: 0, col: 0, isHorizontal: true }]);
    
    // Mock DOM event
    const cell = document.createElement("button");
    cell.classList.add("grid-cell");
    cell.dataset.row = "1";
    cell.dataset.col = "2";
    
    const clickEvent = { target: cell };
    
    // Mock checkGameOver to return false (game not over)
    vi.spyOn(Gameboard, "allShipsSunk").mockReturnValue(false);
    
    // Set setTimeout to execute immediately
    vi.spyOn(global, "setTimeout").mockImplementation((fn) => fn());
    
    Game.handleCellClick(clickEvent);
    
    // Verify attack was made with correct coordinates
    expect(mockPlayerAttack).toHaveBeenCalled();
    
    // Verify UI was updated
    expect(UserInterface.renderBoard).toHaveBeenCalled();
  });

  it("should ignore clicks when not in playing state", () => {
    Game.init();
    // Don't start game, stay in setup state
    
    const cell = document.createElement("button");
    cell.classList.add("grid-cell");
    cell.dataset.row = "1";
    cell.dataset.col = "2";
    
    const clickEvent = { target: cell };
    
    Game.handleCellClick(clickEvent);
    
    // Verify no attack was made
    expect(mockPlayerAttack).not.toHaveBeenCalled();
  });

  it("should correctly get ship sizes", () => {
    const sizes = Game.getShipSizes();
    expect(sizes).toEqual([5, 4, 3, 3, 2]);
  });
});
