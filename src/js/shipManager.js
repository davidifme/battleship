export const shipManager = (function() {

    function createShip(shipLength) {
        const length = shipLength

        return {
            length,
            hitCounter: 0,
            sunk: false,
            hit() {
                this.hitCounter++;
                this.sunk = this.isSunk();
            },
            isSunk() {
                return this.hitCounter >= this.length;
            }
        }
    }

    return {
        createShip
    }
})()