import { GAME_CONSTANTS } from '../main.js';

export class DifficultyManager {
    constructor(scene, difficulty) {
        this.scene = scene;
        this.difficulty = difficulty;
        this.config = GAME_CONSTANTS.DIFFICULTY[difficulty];
    }

    applyDifficulty(enemyConfig) {
        return {
            hp: enemyConfig.hp * this.config.hpMultiplier,
            damage: enemyConfig.damage * this.config.damageMultiplier,
            speed: enemyConfig.speed
        };
    }

    getSpawnInterval(baseInterval) {
        return baseInterval / this.config.spawnRateMultiplier;
    }

    getDifficultyLabel() {
        return this.config.label;
    }

    getDifficultyIcon() {
        return this.config.icon;
    }
}