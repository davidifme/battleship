import { Gameboard } from "./gameBoard";

export const Player = (function () {
  function createPlayer(playerType) {
    const gameBoard = Gameboard.createBoard(10);

    return {
      type: playerType,
      board: gameBoard,
      attack: playerType === "computer" ? computerAttack : attack,
      isComputer: playerType === "computer",
    };
  }

  function makeRandomAttack(enemyBoard) {
    const boardSize = enemyBoard.length;
    const availableSpots = [];

    // Find all non-attacked spots
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (enemyBoard[i][j] !== "hit" && enemyBoard[i][j] !== "miss") {
          availableSpots.push({ row: i, col: j });
        }
      }
    }

    if (availableSpots.length === 0) {
      return false;
    }

    // Pick a random spot from available ones
    const randomIndex = Math.floor(Math.random() * availableSpots.length);
    const { row, col } = availableSpots[randomIndex];

    return { row, col };
  }

  function attack(enemyBoard, row, col) {
    return Gameboard.receiveAttack(enemyBoard, row, col);
  }

  function computerAttack(enemyBoard) {
    // Using our module's own makeRandomAttack - this is key for testability
    const attackCoords = Player.makeRandomAttack(enemyBoard);
    if (!attackCoords) return false;

    return Gameboard.receiveAttack(
      enemyBoard,
      attackCoords.row,
      attackCoords.col,
    );
  }

  return {
    createPlayer,
    makeRandomAttack,
    attack,
    computerAttack,
  };
})();
