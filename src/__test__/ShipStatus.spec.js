import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ShipStatus } from "../js/ShipStatus";

describe("ShipStatus module", () => {
    beforeEach(() => {
        // Set up a clean DOM environment for each test
        document.body.innerHTML = `
            <div id="test-container"></div>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.restoreAllMocks();
    });

    describe("createShipStatusDisplay function", () => {
        it("creates a ship status display with the correct structure", () => {
            const container = document.getElementById("test-container");
            ShipStatus.createShipStatusDisplay("test-container", [5, 4, 3]);
            
            const statusDisplay = container.querySelector(".ship-status-display");
            expect(statusDisplay).not.toBeNull();
            
            const title = statusDisplay.querySelector("h3");
            expect(title.textContent).toBe("Fleet Status");
            
            const indicators = statusDisplay.querySelectorAll(".ship-indicator");
            expect(indicators.length).toBe(3);
        });
        
        it("creates the correct number of segments for each ship", () => {
            ShipStatus.createShipStatusDisplay("test-container", [5, 3, 2]);
            
            const indicators = document.querySelectorAll(".ship-indicator");
            
            // First ship (size 5)
            const firstShipSegments = indicators[0].querySelectorAll(".ship-segment");
            expect(firstShipSegments.length).toBe(5);
            
            // Second ship (size 3)
            const secondShipSegments = indicators[1].querySelectorAll(".ship-segment");
            expect(secondShipSegments.length).toBe(3);
            
            // Third ship (size 2)
            const thirdShipSegments = indicators[2].querySelectorAll(".ship-segment");
            expect(thirdShipSegments.length).toBe(2);
        });
        
        it("removes any existing status display before creating a new one", () => {
            const container = document.getElementById("test-container");
            
            // Create a display
            ShipStatus.createShipStatusDisplay("test-container", [3, 2]);
            expect(container.querySelectorAll(".ship-status-display").length).toBe(1);
            
            // Create another display
            ShipStatus.createShipStatusDisplay("test-container", [5, 4]);
            expect(container.querySelectorAll(".ship-status-display").length).toBe(1);
        });
        
        it("does nothing if the container does not exist", () => {
            ShipStatus.createShipStatusDisplay("non-existent-container", [3, 2]);
            // Test should not throw any errors
        });
    });

    describe("updateShipStatus function", () => {
        it("updates ship segments when ships take hits", () => {
            // Create a status display
            ShipStatus.createShipStatusDisplay("test-container", [3, 2]);
            
            // Create a mock ship with 1 hit
            const ship1 = {
                length: 3,
                hitCounter: 1,
                isSunk: () => false
            };
            
            // Create a mock ship with 0 hits
            const ship2 = {
                length: 2,
                hitCounter: 0,
                isSunk: () => false
            };
            
            // Create a board with these ships
            const board = [
                [ship1, ship1, ship1, 0, 0],
                [0, 0, 0, 0, 0],
                [0, ship2, ship2, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            
            // Update the status
            ShipStatus.updateShipStatus("test-container", board);
            
            // Check that only the first segment of the first ship is marked as hit
            const indicators = document.querySelectorAll(".ship-indicator");
            
            // First ship (size 3)
            const firstShipSegments = indicators[0].querySelectorAll(".ship-segment");
            expect(firstShipSegments[0].classList.contains("hit")).toBe(true);
            expect(firstShipSegments[1].classList.contains("hit")).toBe(false);
            expect(firstShipSegments[2].classList.contains("hit")).toBe(false);
            
            // Second ship (size 2)
            const secondShipSegments = indicators[1].querySelectorAll(".ship-segment");
            expect(secondShipSegments[0].classList.contains("hit")).toBe(false);
            expect(secondShipSegments[1].classList.contains("hit")).toBe(false);
        });
        
        it("marks ships as sunk when they are completely hit", () => {
            // Create a status display
            ShipStatus.createShipStatusDisplay("test-container", [2]);
            
            // Create a mock sunk ship
            const sunkShip = {
                length: 2,
                hitCounter: 2,
                isSunk: () => true
            };
            
            // Create a board with this ship
            const board = [
                [sunkShip, sunkShip, 0],
                [0, 0, 0],
                [0, 0, 0]
            ];
            
            // Update the status
            ShipStatus.updateShipStatus("test-container", board);
            
            // Check that the ship is marked as sunk
            const indicator = document.querySelector(".ship-indicator");
            expect(indicator.classList.contains("sunk")).toBe(true);
            
            // Check that all segments are marked as hit
            const segments = indicator.querySelectorAll(".ship-segment");
            expect(segments[0].classList.contains("hit")).toBe(true);
            expect(segments[1].classList.contains("hit")).toBe(true);
        });
        
        it("handles boards with sunk ships (marked as hit)", () => {
            // Create a status display
            ShipStatus.createShipStatusDisplay("test-container", [2]);
            
            // Create a board with a sunken ship (no ship objects, just hits)
            const board = [
                ["hit", "hit", 0],
                [0, 0, 0],
                [0, 0, 0]
            ];
            
            // Update the status
            ShipStatus.updateShipStatus("test-container", board);
            
            // Check that the ship indicator shows as sunk
            const indicator = document.querySelector(".ship-indicator");
            expect(indicator.classList.contains("sunk")).toBe(true);
            
            // Check that all segments are marked as hit
            const segments = indicator.querySelectorAll(".ship-segment");
            expect(segments[0].classList.contains("hit")).toBe(true);
            expect(segments[1].classList.contains("hit")).toBe(true);
        });
        
        it("maintains consistent ship-to-indicator mapping", () => {
            // Create a status display
            ShipStatus.createShipStatusDisplay("test-container", [3, 3]);
            
            // Create two ships of the same size
            const ship1 = {
                length: 3,
                hitCounter: 1,
                isSunk: () => false
            };
            
            const ship2 = {
                length: 3,
                hitCounter: 2,
                isSunk: () => false
            };
            
            // Create a board with these ships
            const board = [
                [ship1, ship1, ship1, 0, 0],
                [0, 0, 0, 0, 0],
                [ship2, ship2, ship2, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            
            // First update
            ShipStatus.updateShipStatus("test-container", board);
            
            // Get the assigned ship IDs
            const indicators = document.querySelectorAll(".ship-indicator");
            const firstShipId = indicators[0].dataset.shipId;
            const secondShipId = indicators[1].dataset.shipId;
            
            // Create a new board with the same ships but in different positions
            const board2 = [
                [0, 0, 0, 0, 0],
                [ship2, ship2, ship2, 0, 0],
                [0, 0, 0, 0, 0],
                [ship1, ship1, ship1, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            
            // Second update
            ShipStatus.updateShipStatus("test-container", board2);
            
            // The shipIds should still be assigned to the same indicators
            expect(indicators[0].dataset.shipId).toBe(firstShipId);
            expect(indicators[1].dataset.shipId).toBe(secondShipId);
            
            // And hit counts should be preserved
            const firstShipSegments = indicators[0].querySelectorAll(".ship-segment");
            expect(firstShipSegments[0].classList.contains("hit")).toBe(true);
            expect(firstShipSegments[1].classList.contains("hit")).toBe(false);
            expect(firstShipSegments[2].classList.contains("hit")).toBe(false);
            
            const secondShipSegments = indicators[1].querySelectorAll(".ship-segment");
            expect(secondShipSegments[0].classList.contains("hit")).toBe(true);
            expect(secondShipSegments[1].classList.contains("hit")).toBe(true);
            expect(secondShipSegments[2].classList.contains("hit")).toBe(false);
        });
        
        it("handles missing ships that were previously on the board", () => {
            // Create a status display
            ShipStatus.createShipStatusDisplay("test-container", [3]);
            
            // Create a ship
            const ship = {
                length: 3,
                hitCounter: 3,
                isSunk: () => true
            };
            
            // Create a board with this ship
            const board = [
                [ship, ship, ship],
                [0, 0, 0],
                [0, 0, 0]
            ];
            
            // First update - ship is on board
            ShipStatus.updateShipStatus("test-container", board);
            
            // Check that the ship is shown as sunk
            const indicator = document.querySelector(".ship-indicator");
            expect(indicator.classList.contains("sunk")).toBe(true);
            
            // Create a new board with the ship removed (replaced with hits)
            const board2 = [
                ["hit", "hit", "hit"],
                [0, 0, 0],
                [0, 0, 0]
            ];
            
            // Second update - ship is gone but hits remain
            ShipStatus.updateShipStatus("test-container", board2);
            
            // The indicator should still show the ship as sunk
            expect(indicator.classList.contains("sunk")).toBe(true);
            
            // All segments should still be marked as hit
            const segments = indicator.querySelectorAll(".ship-segment");
            segments.forEach(segment => {
                expect(segment.classList.contains("hit")).toBe(true);
            });
        });
        
        it("does nothing if the container does not exist", () => {
            const board = [[0, 0], [0, 0]];
            ShipStatus.updateShipStatus("non-existent-container", board);
            // Test should not throw any errors
        });
        
        it("does nothing if status display does not exist", () => {
            // Create an empty container without a status display
            document.body.innerHTML = `<div id="empty-container"></div>`;
            
            const board = [[0, 0], [0, 0]];
            ShipStatus.updateShipStatus("empty-container", board);
            // Test should not throw any errors
        });
    });
});