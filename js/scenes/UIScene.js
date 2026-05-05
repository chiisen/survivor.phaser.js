export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Stats bar background（擴展高度）
        this.statsBg = this.add.graphics();
        this.statsBg.fillStyle(0x1a1a2e, 0.8);
        this.statsBg.fillRect(10, 10, 220, 180);

        // Shield bar (above HP)
        this.shieldBarBg = this.add.graphics();
        this.shieldBarBg.fillStyle(0x2c3e50, 1);
        this.shieldBarBg.fillRect(20, 20, 200, 10);

        this.shieldBar = this.add.graphics();
        this.shieldText = this.add.text(120, 25, 'Shield: 0 / 50', {
            fontSize: '8px',
            fontFamily: 'Arial',
            color: '#3498db'
        }).setOrigin(0.5);

        // HP bar
        this.hpBarBg = this.add.graphics();
        this.hpBarBg.fillStyle(0x2c3e50, 1);
        this.hpBarBg.fillRect(20, 32, 200, 20);

        this.hpBar = this.add.graphics();
        this.hpText = this.add.text(120, 30, '100 / 100', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // EXP bar
        this.expBarBg = this.add.graphics();
        this.expBarBg.fillStyle(0x34495e, 1);
        this.expBarBg.fillRect(20, 45, 200, 15);

        this.expBar = this.add.graphics();
        this.expText = this.add.text(120, 52, '0 / 20', {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Level display
        this.levelText = this.add.text(20, 65, 'Lv. 1', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold'
        });

        // Skills stats panel（技能數值）
        this.skillsBg = this.add.graphics();
        this.skillsBg.fillStyle(0x2c3e50, 0.6);
        this.skillsBg.fillRect(10, 95, 220, 95);

        this.skillStatsText = this.add.text(20, 100, '', {
            fontSize: '11px',
            fontFamily: 'Arial',
            color: '#ecf0f1',
            lineSpacing: 4
        });

        // Timer (top right)
        this.timerText = this.add.text(width - 20, 20, '00:00', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(1, 0);

        // Wave info (bottom left)
        this.waveText = this.add.text(20, height - 40, '波次: 1', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });

        // Kills counter (bottom right)
        this.killsText = this.add.text(width - 20, height - 40, '擊殺: 0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(1, 0);

        // Wave message container
        this.waveMessageContainer = this.add.container(width / 2, 150);
        this.waveMessageContainer.setAlpha(0);

        // Buff notification container
        this.buffContainer = this.add.container(width / 2, 140);
        this.buffContainer.setAlpha(0);

        // Pause screen (hidden by default)
        this.pauseContainer = this.createPauseScreen(width, height);
        this.pauseContainer.setVisible(false);

        // Level up panel (hidden by default)
        this.levelUpContainer = this.createLevelUpPanel(width, height);
        this.levelUpContainer.setVisible(false);

        // Boss health bar (top center, hidden by default)
        this.bossHealthContainer = this.add.container(width / 2, 50);
        this.bossHealthContainer.setVisible(false);
        
        this.bossNameText = this.add.text(0, -20, 'BOSS', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.bossHealthContainer.add(this.bossNameText);
        
        this.bossHealthBg = this.add.graphics();
        this.bossHealthBg.fillStyle(0x2c3e50, 1);
        this.bossHealthBg.fillRect(-300, 0, 600, 25);
        this.bossHealthContainer.add(this.bossHealthBg);
        
        this.bossHealthBar = this.add.graphics();
        this.bossHealthContainer.add(this.bossHealthBar);
        
        this.bossHealthText = this.add.text(0, 12, '50 / 50', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.bossHealthContainer.add(this.bossHealthText);

        // Game over screen (hidden by default)
        this.gameOverContainer = this.createGameOverScreen(width, height);
        this.gameOverContainer.setVisible(false);

        // Load saved stats
        this.loadStats();
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('survivor_js_stats');
            if (saved) {
                this.savedStats = JSON.parse(saved);
            } else {
                this.savedStats = {
                    highestLevel: 0,
                    longestTime: 0,
                    totalKills: 0,
                    highestWave: 0,
                    totalGames: 0,
                    bossesKilled: 0
                };
            }
        } catch (e) {
            this.savedStats = {
                highestLevel: 0,
                longestTime: 0,
                totalKills: 0,
                highestWave: 0,
                totalGames: 0,
                bossesKilled: 0
            };
        }
    }

    saveStats(newStats) {
        try {
            this.savedStats.highestLevel = Math.max(this.savedStats.highestLevel, newStats.level);
            this.savedStats.longestTime = Math.max(this.savedStats.longestTime, newStats.time);
            this.savedStats.totalKills += newStats.kills;
            this.savedStats.highestWave = Math.max(this.savedStats.highestWave, newStats.wave);
            this.savedStats.totalGames++;
            this.savedStats.bossesKilled += newStats.bossKills;

            localStorage.setItem('survivor_js_stats', JSON.stringify(this.savedStats));
        } catch (e) {
            console.warn('Failed to save stats');
        }
    }

    updateStats(stats) {
        if (!this.shieldBar) return;

        if (stats.shieldHp !== undefined) {
            this.shieldBar.clear();
            const shieldPercent = Math.max(0, stats.shieldHp / stats.maxShieldHp);
            this.shieldBar.fillStyle(0x3498db, shieldPercent > 0 ? 1 : 0.3);
            this.shieldBar.fillRect(20, 20, 200 * shieldPercent, 10);
            this.shieldText.setText('Shield: ' + Math.floor(stats.shieldHp) + ' / ' + stats.maxShieldHp);
        }

        this.hpBar.clear();
        const hpPercent = Math.max(0, stats.hp / stats.maxHp);
        this.hpBar.fillStyle(0xe74c3c, 1);
        this.hpBar.fillRect(20, 32, 200 * hpPercent, 20);
        this.hpText.setText(Math.max(0, Math.floor(stats.hp)) + ' / ' + stats.maxHp);

        // EXP bar
        this.expBar.clear();
        const expPercent = stats.exp / stats.expNeeded;
        this.expBar.fillStyle(0xe67e22, 1);
        this.expBar.fillRect(20, 45, 200 * expPercent, 15);
        this.expText.setText(stats.exp + ' / ' + stats.expNeeded);

        // Level
        this.levelText.setText('Lv. ' + stats.level);

        // Skill stats（技能數值）
        if (stats.skillStats) {
            const skillLines = [
                `⚔️ 攻擊力: ${stats.skillStats.damage}`,
                `🎯 攻擊範圍: ${stats.skillStats.attackRange}`,
                `⚡ 射速: ${(500 - stats.skillStats.fireRate) / 100 + 5}/s`,
                `🚀 子彈速度: ${stats.skillStats.projectileSpeed}`,
                `🧲 拾取範圍: ${stats.skillStats.pickupRange}`,
                `❤️ 最大HP: ${stats.skillStats.maxHp}`
            ];
            this.skillStatsText.setText(skillLines.join('\n'));
        }

        // Timer
        const minutes = Math.floor(stats.gameTime / 60000);
        const seconds = Math.floor((stats.gameTime % 60000) / 1000);
        this.timerText.setText(
            minutes.toString().padStart(2, '0') + ':' +
            seconds.toString().padStart(2, '0')
        );

        // Wave
        let waveText = '波次: ' + stats.wave;
        if (stats.wave % 5 === 0) {
            waveText = 'BOSS 波！';
        }
        if (stats.isRestTime) {
            waveText += ' (休息)';
        }
        this.waveText.setText(waveText);

        // Kills
        this.killsText.setText('擊殺: ' + stats.kills);
    }

showWaveMessage(text, color) {
        // Clear previous
        this.waveMessageContainer.removeAll(true);
        this.waveMessageContainer.setAlpha(1);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(color, 0.9);
        bg.fillRoundedRect(-120, -25, 240, 50, 10);
        this.waveMessageContainer.add(bg);

        // Text
        const msgText = this.add.text(0, 0, text, {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.waveMessageContainer.add(msgText);

        // Fade out after 2 seconds
        this.tweens.add({
            targets: this.waveMessageContainer,
            alpha: 0,
            delay: 2000,
            duration: 500
        });
    }

    showBossHealthBar(name) {
        this.bossNameText.setText(name);
        this.bossHealthContainer.setVisible(true);
    }

    hideBossHealthBar() {
        this.bossHealthContainer.setVisible(false);
    }

    updateBossHealthBar(current, max) {
        const percent = current / max;
        
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0xe74c3c, 1);
        this.bossHealthBar.fillRect(-300, 0, 600 * percent, 25);
        
        this.bossHealthText.setText(`${Math.ceil(current)} / ${max}`);
    }

    showBuffNotification(text, duration) {
        // Clear previous
        this.buffContainer.removeAll(true);
        this.buffContainer.setAlpha(1);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x27ae60, 0.9);
        bg.fillRoundedRect(-100, -20, 200, 40, 8);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-100, -20, 200, 40, 8);
        this.buffContainer.add(bg);

        // Text
        const msgText = this.add.text(0, 0, text, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.buffContainer.add(msgText);

        // Progress bar background
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x1e8449, 1);
        progressBg.fillRect(-95, 12, 190, 5);
        this.buffContainer.add(progressBg);

        // Progress bar
        const progressBar = this.add.graphics();
        this.buffContainer.add(progressBar);

        // Animate progress
        this.tweens.add({
            targets: { progress: 1 },
            progress: 0,
            duration: duration,
            onUpdate: (tween) => {
                const value = tween.targets[0].progress;
                progressBar.clear();
                progressBar.fillStyle(0x2ecc71, 1);
                progressBar.fillRect(-95, 12, 190 * value, 5);
            },
            onComplete: () => {
                this.tweens.add({
                    targets: this.buffContainer,
                    alpha: 0,
                    duration: 300
                });
            }
        });

        // Slide in animation
        this.buffContainer.y = 100;
        this.tweens.add({
            targets: this.buffContainer,
            y: 140,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    createPauseScreen(width, height) {
        const container = this.add.container(width / 2, height / 2);

        // Dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(-width / 2, -height / 2, width, height);
        container.add(overlay);

        // Pause panel
        const panel = this.add.graphics();
        panel.fillStyle(0x2c3e50, 0.95);
        panel.fillRoundedRect(-150, -100, 300, 200, 15);
        panel.lineStyle(3, 0x3498db, 1);
        panel.strokeRoundedRect(-150, -100, 300, 200, 15);
        container.add(panel);

        // Title
        const title = this.add.text(0, -60, '遊戲暫停', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(title);

        // Instructions
        const instructions = this.add.text(0, 20, '按 ESC 或 P 繼續遊戲', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#bdc3c7'
        }).setOrigin(0.5);
        container.add(instructions);

        // Controls info
        const controls = this.add.text(0, 60, 'WASD / 方向鍵：移動', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#95a5a6'
        }).setOrigin(0.5);
        container.add(controls);

        return container;
    }

    showPauseScreen() {
        this.pauseContainer.setVisible(true);
    }

    hidePauseScreen() {
        this.pauseContainer.setVisible(false);
    }

    createLevelUpPanel(width, height) {
        const container = this.add.container(width / 2, height / 2);

        // Dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(-width / 2, -height / 2, width, height);
        container.add(overlay);

        // Panel
        const panel = this.add.graphics();
        panel.fillStyle(0x2c3e50, 0.95);
        panel.fillRoundedRect(-250, -180, 500, 360, 15);
        container.add(panel);

        // Title
        const title = this.add.text(0, -140, '升級！選擇一項強化', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#f1c40f'
        }).setOrigin(0.5);
        container.add(title);

        return container;
    }

    showLevelUpPanel(options, callback) {
        this.levelUpContainer.removeAll(true);
        this.levelUpContainer.setVisible(true);

        // Re-create panel elements
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(-640, -360, 1280, 720);
        this.levelUpContainer.add(overlay);

        const panel = this.add.graphics();
        panel.fillStyle(0x2c3e50, 0.95);
        panel.fillRoundedRect(-250, -180, 500, 360, 15);
        this.levelUpContainer.add(panel);

        const title = this.add.text(0, -140, '升級！選擇一項強化', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#f1c40f'
        }).setOrigin(0.5);
        this.levelUpContainer.add(title);

        // Create option cards
        const cardWidth = 140;
        const startX = -cardWidth - 10;

        options.forEach((talent, index) => {
            const cardX = startX + index * (cardWidth + 20);
            const card = this.createTalentCard(cardX, -30, talent);

            // Make interactive
            card.setInteractive({ useHandCursor: true });

            card.on('pointerover', () => {
                card.setScale(1.05);
                card.each(child => {
                    if (child.type === 'Graphics') {
                        child.clear();
                        child.fillStyle(0x3498db, 1);
                        child.fillRoundedRect(-65, -100, 130, 200, 10);
                        child.lineStyle(3, 0xf1c40f, 1);
                        child.strokeRoundedRect(-65, -100, 130, 200, 10);
                    }
                });
            });

            card.on('pointerout', () => {
                card.setScale(1);
                card.each(child => {
                    if (child.type === 'Graphics') {
                        child.clear();
                        child.fillStyle(0x2980b9, 1);
                        child.fillRoundedRect(-65, -100, 130, 200, 10);
                        child.lineStyle(2, 0x3498db, 1);
                        child.strokeRoundedRect(-65, -100, 130, 200, 10);
                    }
                });
            });

            card.on('pointerdown', () => {
                this.levelUpContainer.setVisible(false);
                callback(talent);
            });

            this.levelUpContainer.add(card);
        });
    }

    createTalentCard(x, y, talent) {
        const card = this.add.container(x, y);

        // Card background
        const bg = this.add.graphics();
        bg.fillStyle(0x2980b9, 1);
        bg.fillRoundedRect(-65, -100, 130, 200, 10);
        bg.lineStyle(2, 0x3498db, 1);
        bg.strokeRoundedRect(-65, -100, 130, 200, 10);
        card.add(bg);

        // Icon
        const icon = this.add.text(0, -50, talent.icon, {
            fontSize: '48px'
        }).setOrigin(0.5);
        card.add(icon);

        // Name
        const name = this.add.text(0, 20, talent.name, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        card.add(name);

        // Description
        const desc = this.add.text(0, 50, talent.desc, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#bdc3c7',
            wordWrap: { width: 120 },
            align: 'center'
        }).setOrigin(0.5);
        card.add(desc);

        // Set size for interactive hitArea
        card.setSize(130, 200);

        return card;
    }

    createGameOverScreen(width, height) {
        const container = this.add.container(width / 2, height / 2);

        // Dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.85);
        overlay.fillRect(-width / 2, -height / 2, width, height);
        container.add(overlay);

        // Panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 0.95);
        panel.fillRoundedRect(-200, -280, 400, 560, 15);
        panel.lineStyle(3, 0xe74c3c, 1);
        panel.strokeRoundedRect(-200, -280, 400, 560, 15);
        container.add(panel);

        return container;
    }

    showGameOver(stats) {
        this.gameOverContainer.removeAll(true);
        this.gameOverContainer.setVisible(true);

        // Save stats
        this.saveStats(stats);

        // Re-create panel elements
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.85);
        overlay.fillRect(-640, -360, 1280, 720);
        this.gameOverContainer.add(overlay);

        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 0.95);
        panel.fillRoundedRect(-200, -280, 400, 560, 15);
        panel.lineStyle(3, 0xe74c3c, 1);
        panel.strokeRoundedRect(-200, -280, 400, 560, 15);
        this.gameOverContainer.add(panel);

        // Title
        const title = this.add.text(0, -240, '遊戲結束', {
            fontSize: '36px',
            fontFamily: 'Arial Black',
            color: '#e74c3c'
        }).setOrigin(0.5);
        this.gameOverContainer.add(title);

        // Current run stats
        const runTitle = this.add.text(0, -180, '本次成績', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#f1c40f'
        }).setOrigin(0.5);
        this.gameOverContainer.add(runTitle);

        // Check for new records
        const isNewLevel = stats.level > this.savedStats.highestLevel;
        const isNewWave = stats.wave > this.savedStats.highestWave;
        const isNewTime = stats.time > this.savedStats.longestTime;

        const currentStats = [
            { label: '等級', value: stats.level + (isNewLevel ? ' 🏆' : '') },
            { label: '擊殺數', value: stats.kills },
            { label: 'Boss擊殺', value: stats.bossKills },
            { label: '最高波次', value: stats.wave + (isNewWave ? ' 🏆' : '') },
            { label: '存活時間', value: this.formatTime(stats.time) + (isNewTime ? ' 🏆' : '') }
        ];

        currentStats.forEach((stat, index) => {
            const text = this.add.text(-150, -140 + index * 30, stat.label + ':', {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#bdc3c7'
            });
            this.gameOverContainer.add(text);

            const value = this.add.text(150, -140 + index * 30, stat.value.toString(), {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }).setOrigin(1, 0);
            this.gameOverContainer.add(value);
        });

        // Historical stats
        const histTitle = this.add.text(0, 30, '歷史紀錄', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#3498db'
        }).setOrigin(0.5);
        this.gameOverContainer.add(histTitle);

        const histStats = [
            { label: '最高等級', value: this.savedStats.highestLevel },
            { label: '最長存活', value: this.formatTime(this.savedStats.longestTime) },
            { label: '總擊殺數', value: this.savedStats.totalKills },
            { label: '最高波次', value: this.savedStats.highestWave },
            { label: 'Boss擊殺總數', value: this.savedStats.bossesKilled },
            { label: '總遊戲次數', value: this.savedStats.totalGames }
        ];

        histStats.forEach((stat, index) => {
            const text = this.add.text(-150, 70 + index * 25, stat.label + ':', {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#7f8c8d'
            });
            this.gameOverContainer.add(text);

            const value = this.add.text(150, 70 + index * 25, stat.value.toString(), {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#bdc3c7'
            }).setOrigin(1, 0);
            this.gameOverContainer.add(value);
        });

        // Restart button
        const button = this.add.graphics();
        button.fillStyle(0x27ae60, 1);
        button.fillRoundedRect(-80, 230, 160, 40, 8);
        this.gameOverContainer.add(button);

        const buttonText = this.add.text(0, 250, '重新開始', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.gameOverContainer.add(buttonText);

        // Make button interactive
        const hitArea = this.add.rectangle(0, 250, 160, 40, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerover', () => {
            button.clear();
            button.fillStyle(0x2ecc71, 1);
            button.fillRoundedRect(-80, 230, 160, 40, 8);
        });
        hitArea.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x27ae60, 1);
            button.fillRoundedRect(-80, 230, 160, 40, 8);
        });
        hitArea.on('pointerdown', () => {
            this.scene.get('GameScene').scene.restart();
            this.scene.restart();
        });
        this.gameOverContainer.add(hitArea);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins + '分' + secs + '秒';
    }

    showAchievementNotification(achievement) {
        const width = this.cameras.main.width;
        const notification = this.add.container(width / 2, 150);

        const bg = this.add.graphics();
        bg.fillStyle(0x27ae60, 0.9);
        bg.fillRoundedRect(-120, -25, 240, 50, 10);
        notification.add(bg);

        const icon = this.add.text(-100, 0, achievement.icon, {
            fontSize: '24px'
        }).setOrigin(0, 0.5);
        notification.add(icon);

        const text = this.add.text(0, -8, '成就解锁！', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        notification.add(text);

        const name = this.add.text(0, 10, achievement.name, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        notification.add(name);

        this.tweens.add({
            targets: notification,
            y: notification.y - 30,
            alpha: 0,
            delay: 2000,
            duration: 300,
            onComplete: () => notification.destroy()
        });
    }
}