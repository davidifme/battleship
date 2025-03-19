export const Ship = (function () {
  function createShip(shipLength) {
    const length = shipLength;

    return {
      length,
      hitCounter: 0,
      sunk: false,
      coordinates: null,
      hit() {
        this.hitCounter++;
        this.sunk = this.isSunk();
      },
      isSunk() {
        return this.hitCounter >= this.length;
      },
      get hits() {
        return this.hitCounter;
      },
    };
  }

  return {
    createShip,
  };
})();
