import { describe, it, expect } from "vitest";
import { Ship } from "../js/Ship";

describe("Ship factory", () => {
  it("should create a ship with the given length", () => {
    const ship = Ship.createShip(3);
    expect(ship.length).toBe(3);
  });

  it("should initialize the ship with 0 hits", () => {
    const ship = Ship.createShip(3);
    expect(ship.hitCounter).toBe(0);
    expect(ship.hits).toBe(0);
  });

  it("should initialize as not sunk", () => {
    const ship = Ship.createShip(3);
    expect(ship.sunk).toBe(false);
  });

  describe("hit function", () => {
    it("should increase hit counter when hit() is called", () => {
      const ship = Ship.createShip(3);
      ship.hit();
      expect(ship.hitCounter).toBe(1);
      expect(ship.hits).toBe(1);
    });

    it("should update sunk status when hit enough times", () => {
      const ship = Ship.createShip(2);
      ship.hit();
      expect(ship.sunk).toBe(false);
      ship.hit();
      expect(ship.sunk).toBe(true);
    });
  });

  describe("isSunk function", () => {
    it("should return true when hits equal length", () => {
      const ship = Ship.createShip(1);
      ship.hit();
      expect(ship.isSunk()).toBe(true);
    });

    it("should return true when hits exceed length", () => {
      const ship = Ship.createShip(2);
      ship.hit();
      ship.hit();
      ship.hit(); // Extra hit
      expect(ship.isSunk()).toBe(true);
    });

    it("should return false when hits are less than length", () => {
      const ship = Ship.createShip(3);
      ship.hit();
      ship.hit();
      expect(ship.isSunk()).toBe(false);
    });
  });
});