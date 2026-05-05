import { GAME_CONSTANTS } from '../main.js';

export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, 100, '⚔️ Survivor.js ⚔️', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(width / 2, 200, 'WASD 或 方向鍵 移動\n自動攻擊範圍內敵人\nESC 或 P 暫停\nQ 终极技能', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        const difficulties = ['normal', 'hard', 'hell'];
        difficulties.forEach((diff, i) => {
            const config = GAME_CONSTANTS.DIFFICULTY[diff];
            const btn = this.add.text(width / 2, 350 + i * 60, 
                config.icon + ' ' + config.label, {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: '#2c3e50',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive();

            btn.on('pointerover', () => {
                btn.setBackgroundColor('#34495e');
            });
            btn.on('pointerout', () => {
                btn.setBackgroundColor('#2c3e50');
            });
            btn.on('pointerdown', () => {
                this.startGame(diff);
            });
        });
    }

    startGame(difficulty) {
        this.scene.start('GameScene', { difficulty });
        this.scene.start('UIScene');
    }
}