import { GAME_CONSTANTS } from '../main.js';

export class AchievementManager {
    constructor(storageManager, scene) {
        this.storage = storageManager;
        this.scene = scene;
        this.achievements = this.loadAchievements();
    }

    loadAchievements() {
        const saved = this.storage.load().achievements || [];
        return GAME_CONSTANTS.ACHIEVEMENTS.map(achievement => ({
            ...achievement,
            unlocked: saved.includes(achievement.id)
        }));
    }

    check(type, value, difficulty = 'normal') {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;

            const condition = achievement.condition;
            let matched = false;

            if (condition.type === type && value >= condition.value) {
                matched = true;
            }

            if (condition.type === 'hellTime' && difficulty === 'hell' && type === 'time' && value >= condition.value) {
                matched = true;
            }

            if (condition.type === 'hellWave' && difficulty === 'hell' && type === 'wave' && value >= condition.value) {
                matched = true;
            }

            if (matched) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        achievement.unlocked = true;
        this.storage.saveAchievement(achievement.id);
        this.showNotification(achievement);
    }

    showNotification(achievement) {
        if (this.scene && this.scene.uiScene) {
            this.scene.uiScene.showAchievementNotification(achievement);
        }
    }

    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }
}