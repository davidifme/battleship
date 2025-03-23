import { Game } from "./js/Game";
import "./styles/index.scss";

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    Game.init("select"); // Start with game mode selection
});