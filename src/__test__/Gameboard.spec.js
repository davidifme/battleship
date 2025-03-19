import { describe, it } from "vitest";
import { Gameboard } from "../js/gameBoard";
import { Ship } from "../js/Ship";

describe("Gameboard placeShip function", () => {
  it("should place a ship horizontally when there is enough space", () => {
    const board = Gameboard.createBoard(10);
    const ship = Ship.createShip(3);
    const result = Gameboard.placeShip(board, ship, 0, 0, true);

    expect(result).toBe(true);
    expect(board[0][0]).toBe(ship);
    expect(board[0][1]).toBe(ship);
    expect(board[0][2]).toBe(ship);
  });

  it("should place a ship vertically when there is enough space", () => {
    const board = Gameboard.createBoard(10);
    const ship = Ship.createShip(3);
    const result = Gameboard.placeShip(board, ship, 0, 0, false);

    expect(result).toBe(true);
    expect(board[0][0]).toBe(ship);
    expect(board[1][0]).toBe(ship);
    expect(board[2][0]).toBe(ship);
  });

  it("should not place a ship horizontally when there is not enough space", () => {
    const board = Gameboard.createBoard(10);
    const ship = Ship.createShip(3);
    const result = Gameboard.placeShip(board, ship, 0, 8, true);

    expect(result).toBe(false);
  });

  it("should not place a ship vertically when there is not enough space", () => {
    const board = Gameboard.createBoard(10);
    const ship = Ship.createShip(3);
    const result = Gameboard.placeShip(board, ship, 8, 0, false);

    expect(result).toBe(false);
  });

  it("should not place a ship when it overlaps with another ship", () => {
    const board = Gameboard.createBoard(10);
    const ship1 = Ship.createShip(3);
    const ship2 = Ship.createShip(4);

    Gameboard.placeShip(board, ship1, 0, 0, true);
    const result = Gameboard.placeShip(board, ship2, 0, 1, true);

    expect(result).toBe(false);
  });
});

describe("Gameboard receiveAttack function", () => {
  it("should return false when coordinates are outside the board", () => {
    const board = Gameboard.createBoard(10);
    const result1 = Gameboard.receiveAttack(board, -1, 0);
    const result2 = Gameboard.receiveAttack(board, 0, -1);
    const result3 = Gameboard.receiveAttack(board, 10, 0);
    const result4 = Gameboard.receiveAttack(board, 0, 10);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
    expect(result4).toBe(false);
  });

  it("should record a miss when attacking an empty cell", () => {
    const board = Gameboard.createBoard(10);
    const result = Gameboard.receiveAttack(board, 0, 0);

    expect(result).toBe(true);
    expect(board[0][0]).toBe("miss");
  });

  it("should record a hit when attacking a cell with a ship", () => {
    const board = Gameboard.createBoard(10);
    const ship = Ship.createShip(3);
    Gameboard.placeShip(board, ship, 0, 0, true);

    const result = Gameboard.receiveAttack(board, 0, 0);

    expect(result).toBe(true);
    expect(board[0][0]).toBe("hit");
    expect(ship.hits).toBe(1);
  });

  it("should return false when attacking an already hit position", () => {
    const board = Gameboard.createBoard(10);
    const ship = Ship.createShip(3);
    Gameboard.placeShip(board, ship, 0, 0, true);

    Gameboard.receiveAttack(board, 0, 0);
    const result = Gameboard.receiveAttack(board, 0, 0);

    expect(result).toBe(false);
  });

  it("should return false when attacking an already missed position", () => {
    const board = Gameboard.createBoard(10);

    Gameboard.receiveAttack(board, 5, 5);
    const result = Gameboard.receiveAttack(board, 5, 5);

    expect(result).toBe(false);
  });

  it("should correctly hit multiple parts of the same ship", () => {
    const board = Gameboard.createBoard(10);
    const ship = Ship.createShip(3);
    Gameboard.placeShip(board, ship, 0, 0, true);

    Gameboard.receiveAttack(board, 0, 0);
    Gameboard.receiveAttack(board, 0, 1);
    const result = Gameboard.receiveAttack(board, 0, 2);

    expect(result).toBe(true);
    expect(ship.hits).toBe(3);
    expect(ship.isSunk()).toBe(true);
  });
});

describe("Gameboard allShipsSunk function", () => {
  it("should return false when there are no ships on the board", () => {
    const board = Gameboard.createBoard(10);
    const result = Gameboard.allShipsSunk(board);

    expect(result).toBe(false);
  });

  it("should return false when not all ships are sunk", () => {
    const board = Gameboard.createBoard(10);
    const ship1 = Ship.createShip(2);
    const ship2 = Ship.createShip(3);

    Gameboard.placeShip(board, ship1, 0, 0, true);
    Gameboard.placeShip(board, ship2, 2, 0, true);

    // Sink only the first ship
    Gameboard.receiveAttack(board, 0, 0);
    Gameboard.receiveAttack(board, 0, 1);

    expect(Gameboard.allShipsSunk(board)).toBe(false);
  });

  it("should return true when all ships are sunk", () => {
    const board = Gameboard.createBoard(10);
    const ship1 = Ship.createShip(2);
    const ship2 = Ship.createShip(3);

    Gameboard.placeShip(board, ship1, 0, 0, true);
    Gameboard.placeShip(board, ship2, 2, 0, true);

    // Sink both ships
    Gameboard.receiveAttack(board, 0, 0);
    Gameboard.receiveAttack(board, 0, 1);
    Gameboard.receiveAttack(board, 2, 0);
    Gameboard.receiveAttack(board, 2, 1);
    Gameboard.receiveAttack(board, 2, 2);

    expect(Gameboard.allShipsSunk(board)).toBe(true);
  });

  it("should correctly handle multiple ships of the same size", () => {
    const board = Gameboard.createBoard(10);
    const ship1 = Ship.createShip(2);
    const ship2 = Ship.createShip(2);

    Gameboard.placeShip(board, ship1, 0, 0, true);
    Gameboard.placeShip(board, ship2, 2, 0, true);

    // Sink only the first ship
    Gameboard.receiveAttack(board, 0, 0);
    Gameboard.receiveAttack(board, 0, 1);

    expect(Gameboard.allShipsSunk(board)).toBe(false);

    // Sink the second ship
    Gameboard.receiveAttack(board, 2, 0);
    Gameboard.receiveAttack(board, 2, 1);

    expect(Gameboard.allShipsSunk(board)).toBe(true);
  });
});
