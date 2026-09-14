// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#2d3436',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: []
};

// Game constants live in ./constants.js (re-exported here for backward compatibility)
import { GAME_CONSTANTS } from './constants.js';
export { GAME_CONSTANTS };

// Import scenes
import { BootScene } from './scenes/BootScene.js';
import { StartScene } from './scenes/StartScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

config.scene = [BootScene, StartScene, GameScene, UIScene];

// Create game instance
const game = new Phaser.Game(config);

// Make game globally accessible for debugging
window.game = game;