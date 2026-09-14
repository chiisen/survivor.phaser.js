import { GAME_CONSTANTS } from '../main.js';
import { StorageManager } from '../managers/StorageManager.js';

export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, 80, '⚔️ Survivor.js ⚔️', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(width / 2, 170, 'WASD 或 方向鍵 移動｜自動攻擊範圍內敵人\nESC 或 P 暫停｜Q 終極技能', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);

        const difficulties = ['normal', 'hard', 'hell'];
        difficulties.forEach((diff, i) => {
            const config = GAME_CONSTANTS.DIFFICULTY[diff];
            const label = (config.icon ? config.icon + ' ' : '') + config.label + '開始';
            const btn = this.add.text(width / 2, 300 + i * 62,
                label, {
                fontSize: '26px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: '#2c3e50',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

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

        this.showHistory(width);
    }

    showHistory(width) {
        let data;
        try {
            data = new StorageManager().load();
        } catch (e) {
            data = null;
        }
        if (!data) return;

        const fmt = (s) => Math.floor(s / 60) + '分' + (s % 60) + '秒';

        // 左欄：歷史紀錄
        const lx = 120;
        this.add.text(lx, 280, '📜 歷史紀錄', {
            fontSize: '20px', fontFamily: 'Arial', color: '#3498db', fontStyle: 'bold'
        });
        const hist = [
            '最高等級：Lv.' + data.highestLevel,
            '最長存活：' + fmt(data.longestTime),
            '最高波次：' + data.highestWave,
            '總擊殺：' + data.totalKills,
            'Boss擊殺：' + data.bossesKilled,
            '總場次：' + data.totalGames
        ];
        this.add.text(lx, 315, hist.join('\n'), {
            fontSize: '15px', fontFamily: 'Arial', color: '#bdc3c7', lineSpacing: 7
        });

        // 右欄：排行榜 TOP 5
        const rx = width - 120;
        this.add.text(rx, 280, '🏆 排行榜 TOP 5', {
            fontSize: '20px', fontFamily: 'Arial', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(1, 0);
        const top5 = (data.leaderboard || []).slice(0, 5);
        if (top5.length === 0) {
            this.add.text(rx, 320, '尚無紀錄，來開第一局！', {
                fontSize: '15px', fontFamily: 'Arial', color: '#7f8c8d'
            }).setOrigin(1, 0);
        } else {
            const lines = top5.map((e, i) =>
                (i + 1) + '. Lv.' + e.level + '｜' + fmt(e.time) +
                '｜殺' + e.kills + ' B' + e.bossKills + ' W' + e.wave);
            this.add.text(rx, 315, lines.join('\n'), {
                fontSize: '15px', fontFamily: 'Arial', color: '#ecf0f1',
                align: 'right', lineSpacing: 7
            }).setOrigin(1, 0);
        }
    }

    startGame(difficulty) {
        this.scene.start('GameScene', { difficulty });
        this.scene.start('UIScene');
    }
}