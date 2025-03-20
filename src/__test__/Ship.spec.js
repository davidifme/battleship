import { describe, it, expect } from "vitest";
import { Ship } from "../js/Ship";

describe("Ship factory", () => {
  it("creates ships with the correct length", () => {
    const ship1 = Ship.createShip(3);
    const ship2 = Ship.createShip(5);
    
    expect(ship1.length).toBe(3);
    expect(ship2.length).toBe(5);
  });

  it("initializes ships with 0 hits", () => {
    const ship = Ship.createShip(4);
    
    expect(ship.hits).toBe(0);
    expect(ship.hitCounter).toBe(0);
  });

  it("initializes ships as not sunk", () => {
    const ship = Ship.createShip(3);
    
    expect(ship.sunk).toBe(false);
    expect(ship.isSunk()).toBe(false);
  });
  
  it("initializes ships with null coordinates", () => {
    const ship = Ship.createShip(2);
    
    expect(ship.coordinates).toBe(null);
  });
});

describe("Ship hit method", () => {
  it("increases hit counter when hit", () => {
    const ship = Ship.createShip(4);
    
    ship.hit();
    expect(ship.hits).toBe(1);
    
    ship.hit();
    expect(ship.hits).toBe(2);
  });

  it("doesn't sink the ship when hits < length", () => {
    const ship = Ship.createShip(3);
    
    ship.hit();
    ship.hit();
    
    expect(ship.isSunk()).toBe(false);
    expect(ship.sunk).toBe(false);
  });
  
  it("sinks the ship when hits = length", () => {
    const ship = Ship.createShip(2);
    
    ship.hit();
    ship.hit();
    
    expect(ship.isSunk()).toBe(true);
    expect(ship.sunk).toBe(true);
  });
  
  it("keeps ship sunk status when hits > length", () => {
    const ship = Ship.createShip(1);
    
    ship.hit();
    expect(ship.isSunk()).toBe(true);
    
    ship.hit();
    expect(ship.isSunk()).toBe(true);
    expect(ship.hits).toBe(2);
  });
});

describe("Ship isSunk method", () => {
  it("returns false when hits < length", () => {
    const ship = Ship.createShip(3);
    
    expect(ship.isSunk()).toBe(false);
    
    ship.hit();
    expect(ship.isSunk()).toBe(false);
    
    ship.hit();
    expect(ship.isSunk()).toBe(false);
  });
  
  it("returns true when hits >= length", () => {
    const ship = Ship.createShip(3);
    
    ship.hit();
    ship.hit();
    ship.hit();
    
    expect(ship.isSunk()).toBe(true);
    
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
  
  it("works with ships of different lengths", () => {
    const smallShip = Ship.createShip(1);
    const largeShip = Ship.createShip(5);
    
    smallShip.hit();
    expect(smallShip.isSunk()).toBe(true);
    
    for (let i = 0; i < 4; i++) {
      largeShip.hit();
      expect(largeShip.isSunk()).toBe(false);
    }
    
    largeShip.hit();
    expect(largeShip.isSunk()).toBe(true);
  });
});