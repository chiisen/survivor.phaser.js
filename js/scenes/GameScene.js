import { GAME_CONSTANTS } from '../main.js';
import { StorageManager } from '../managers/StorageManager.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { DifficultyManager } from '../managers/DifficultyManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'normal';

        this.gameTime = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.isLevelUp = false;

        this.stats = {
            level: 1,
            exp: 0,
            kills: 0,
            bossKills: 0,
            wave: 1
        };

        this.waveTimer = 0;
        this.isRestTime = false;
        this.spawnTimer = 0;
        this.bossSpawned = false;
        this.hpMultiplier = 1;

        this.chainKillCount = 0;
        this.chainKillTimer = 0;
        this.hasChainKillBuff = false;
        this.chainKillBuffTimer = 0;

        this.cursors = null;
        this.wasd = null;

        this.storageManager = new StorageManager();
        this.achievementManager = new AchievementManager(this.storageManager, this);
        this.difficultyManager = new DifficultyManager(this, this.difficulty);
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create background
        this.createBackground(width, height);

        // Create groups
        this.enemies = this.add.group({
            classType: Phaser.GameObjects.Container,
            maxSize: 200,
            runChildUpdate: true
        });

        this.projectiles = this.add.group({
            maxSize: 100,
            runChildUpdate: false
        });

        this.enemyProjectiles = this.add.group({
            maxSize: 50,
            runChildUpdate: false
        });

        this.expOrbs = this.add.group({
            maxSize: 200,
            runChildUpdate: false
        });

        // Create player
        this.createPlayer(width, height);

        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            pause: Phaser.Input.Keyboard.KeyCodes.ESC,
            pauseAlt: Phaser.Input.Keyboard.KeyCodes.P,
            skill: Phaser.Input.Keyboard.KeyCodes.Q
        });

        // Pause input
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard.on('keydown-P', () => this.togglePause());
        this.input.keyboard.on('keydown-Q', () => this.useUltimateSkill());

        this.uiScene = this.scene.get('UIScene');

        this.initAudio();

        this.updateUI();
    }

    useUltimateSkill() {
        if (this.player.skillTimer > 0) return;

        this.player.skillTimer = GAME_CONSTANTS.PLAYER.SKILL_COOLDOWN;

        const damage = this.player.damage * GAME_CONSTANTS.PLAYER.SKILL_DAMAGE_MULTIPLIER;

        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                this.damageEnemy(enemy, damage);
            }
        });

        this.cameras.main.flash(500, 0xffffff);
        this.cameras.main.shake(300, 0.02);
        this.playSound('chainKill');

        this.uiScene.showBuffNotification('⚡ Q技能釋放！', 2000);
    }

    createBackground(width, height) {
        this.decorations = [];

        const graphics = this.add.graphics();
        graphics.fillStyle(0x2d3436, 1);
        graphics.fillRect(0, 0, width, height);

        graphics.lineStyle(1, 0x3d4446, 0.3);
        for (let x = 0; x < width; x += 50) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }
        for (let y = 0; y < height; y += 50) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }
        graphics.strokePath();

        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(20, width - 20);
            const y = Phaser.Math.Between(20, height - 20);
            const type = Phaser.Math.Between(0, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.5);

            const decGraphics = this.add.graphics();
            decGraphics.setAlpha(alpha);

            switch (type) {
                case 0:
                    decGraphics.fillStyle(0x636e72, 1);
                    decGraphics.fillEllipse(0, 0, Phaser.Math.Between(8, 15), Phaser.Math.Between(6, 10));
                    break;
                case 1:
                    decGraphics.fillStyle(0x27ae60, 1);
                    for (let j = 0; j < 3; j++) {
                        decGraphics.fillTriangle(
                            -3 + j * 3, 0,
                            -5 + j * 3, -12,
                            -1 + j * 3, 0
                        );
                    }
                    break;
                case 2:
                    decGraphics.fillStyle(0x1e8449, 1);
                    decGraphics.fillCircle(0, 0, Phaser.Math.Between(5, 10));
                    decGraphics.fillCircle(8, 2, Phaser.Math.Between(4, 8));
                    decGraphics.fillCircle(-6, 3, Phaser.Math.Between(4, 8));
                    break;
                case 3:
                    decGraphics.lineStyle(1, 0x4a4a4a, 1);
                    decGraphics.moveTo(0, 0);
                    decGraphics.lineTo(Phaser.Math.Between(-10, 10), Phaser.Math.Between(5, 15));
                    decGraphics.lineTo(Phaser.Math.Between(-15, 15), Phaser.Math.Between(10, 20));
                    decGraphics.strokePath();
                    break;
            }

            decGraphics.setPosition(x, y);
            this.decorations.push(decGraphics);
        }

        this.particles = [];
        for (let i = 0; i < 20; i++) {
            const particle = this.add.graphics();
            particle.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.25));
            particle.fillCircle(0, 0, Phaser.Math.Between(1, 3));
            particle.setPosition(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height)
            );
            particle.vx = Phaser.Math.Between(10, 30);
            particle.vy = Phaser.Math.Between(5, 15);
            this.particles.push(particle);
        }

        this.visibilityMask = this.add.graphics();
        this.visibilityMask.setDepth(100);
    }

    createPlayer(width, height) {
        // Player container
        this.player = this.add.container(width / 2, height / 2);

        // Player stats
        this.player.hp = GAME_CONSTANTS.PLAYER.HP;
        this.player.maxHp = GAME_CONSTANTS.PLAYER.HP;
        this.player.speed = GAME_CONSTANTS.PLAYER.SPEED;
        this.player.pickupRange = GAME_CONSTANTS.PLAYER.PICKUP_RANGE;
        this.player.attackRange = GAME_CONSTANTS.PLAYER.ATTACK_RANGE;
        this.player.fireRate = GAME_CONSTANTS.PLAYER.FIRE_RATE;
        this.player.damage = GAME_CONSTANTS.PLAYER.DAMAGE;
        this.player.projectileSpeed = GAME_CONSTANTS.PLAYER.PROJECTILE_SPEED;
        this.player.projectileCount = GAME_CONSTANTS.PLAYER.PROJECTILE_COUNT;
        this.player.fireCooldown = 0;
        this.player.isInvincible = false;
        this.player.invincibleTimer = 0;
        this.player.facingAngle = 0;

        this.player.shieldHp = GAME_CONSTANTS.PLAYER.SHIELD_HP;
        this.player.maxShieldHp = GAME_CONSTANTS.PLAYER.SHIELD_MAX;
        this.player.critChance = GAME_CONSTANTS.PLAYER.CRIT_CHANCE;
        this.player.critMultiplier = GAME_CONSTANTS.PLAYER.CRIT_MULTIPLIER;
        this.player.skillCooldown = GAME_CONSTANTS.PLAYER.SKILL_COOLDOWN;
        this.player.skillTimer = 0;
        this.player.vampire = 0;
        this.player.expMultiplier = 0;
        this.player.armor = 0;

        // Attack range indicator
        this.attackRangeGraphics = this.add.graphics();
        this.updateAttackRangeGraphics();

        // Player body graphics
        this.playerGraphics = this.add.graphics();
        this.drawPlayer(0);
        this.player.add(this.playerGraphics);

        // Sword graphics (separate for animation)
        this.swordGraphics = this.add.graphics();
        this.player.add(this.swordGraphics);

        this.player.swordAngle = 0;
        this.player.isSwinging = false;
        this.player.swingTimer = 0;

        this.drawSword(0);
    }

    updateAttackRangeGraphics() {
        this.attackRangeGraphics.clear();

        // Base range (blue)
        this.attackRangeGraphics.lineStyle(2, 0x3498db, 0.3);
        this.attackRangeGraphics.strokeCircle(
            this.player.x,
            this.player.y,
            GAME_CONSTANTS.PLAYER.ATTACK_RANGE
        );

        // Upgraded range (green) - if upgraded
        if (this.player.attackRange > GAME_CONSTANTS.PLAYER.ATTACK_RANGE) {
            this.attackRangeGraphics.lineStyle(2, 0x2ecc71, 0.3);
            this.attackRangeGraphics.strokeCircle(
                this.player.x,
                this.player.y,
                this.player.attackRange
            );

            // Middle gradient
            const midRange = (GAME_CONSTANTS.PLAYER.ATTACK_RANGE + this.player.attackRange) / 2;
            this.attackRangeGraphics.lineStyle(1, 0x2ecc71, 0.15);
            this.attackRangeGraphics.strokeCircle(
                this.player.x,
                this.player.y,
                midRange
            );
        }

        // Pickup range (lighter blue)
        this.attackRangeGraphics.lineStyle(1, 0x3498db, 0.2);
        this.attackRangeGraphics.strokeCircle(
            this.player.x,
            this.player.y,
            this.player.pickupRange
        );
    }

    drawPlayer(swingProgress = 0) {
        const g = this.playerGraphics;
        g.clear();

        // Body (armor)
        g.fillStyle(0x95a5a6, 1);
        g.fillRoundedRect(-12, -8, 24, 28, 4);

        // Armor details
        g.fillStyle(0x7f8c8d, 1);
        g.fillRoundedRect(-10, -6, 20, 24, 3);

        // Helmet
        g.fillStyle(0xbdc3c7, 1);
        g.fillCircle(0, -12, 14);
        g.fillStyle(0x95a5a6, 1);
        g.fillCircle(0, -12, 11);

        // Visor slit
        g.fillStyle(0x2c3e50, 1);
        g.fillRect(-6, -14, 12, 4);

        // Golden gauntlets
        g.fillStyle(0xf1c40f, 1);
        g.fillRoundedRect(-16, 8, 8, 12, 2);
        g.fillRoundedRect(8, 8, 8, 12, 2);
    }

    drawSword(swingAngle = 0) {
        const g = this.swordGraphics;
        g.clear();

        // Sword position offset (held in right hand)
        const handOffsetX = 12;
        const handOffsetY = 10;

        // Sword swing animation
        const baseAngle = -Math.PI / 4; // -45 degrees
        const currentAngle = baseAngle + swingAngle;

        // Calculate rotated positions for sword components
        // Use Math.cos and Math.sin to rotate points
        const cos = Math.cos(currentAngle);
        const sin = Math.sin(currentAngle);

        // Helper function to rotate a point around origin
        const rotatePoint = (px, py) => {
            return {
                x: handOffsetX + px * cos - py * sin,
                y: handOffsetY + px * sin + py * cos
            };
        };

        // Sword blade (blue) - draw as rotated rectangle
        const bladeWidth = 4;
        const bladeHeight = 35;
        const bladeTop = rotatePoint(-bladeWidth / 2, -bladeHeight);
        const bladeTopRight = rotatePoint(bladeWidth / 2, -bladeHeight);
        const bladeBottomRight = rotatePoint(bladeWidth / 2, 0);
        const bladeBottomLeft = rotatePoint(-bladeWidth / 2, 0);

        g.fillStyle(0x3498db, 1);
        g.beginPath();
        g.moveTo(bladeTop.x, bladeTop.y);
        g.lineTo(bladeTopRight.x, bladeTopRight.y);
        g.lineTo(bladeBottomRight.x, bladeBottomRight.y);
        g.lineTo(bladeBottomLeft.x, bladeBottomLeft.y);
        g.closePath();
        g.fillPath();

        // Blade highlight
        const highlightTop = rotatePoint(0, -34);
        const highlightBottom = rotatePoint(0, -4);
        g.fillStyle(0x5dade2, 1);
        g.beginPath();
        g.moveTo(highlightTop.x - 1, highlightTop.y);
        g.lineTo(highlightTop.x + 1, highlightTop.y);
        g.lineTo(highlightBottom.x + 1, highlightBottom.y);
        g.lineTo(highlightBottom.x - 1, highlightBottom.y);
        g.closePath();
        g.fillPath();

        // Sword hilt (gold)
        const hiltWidth = 6;
        const hiltHeight = 8;
        const hiltTopLeft = rotatePoint(-hiltWidth / 2, 0);
        const hiltTopRight = rotatePoint(hiltWidth / 2, 0);
        const hiltBottomRight = rotatePoint(hiltWidth / 2, hiltHeight);
        const hiltBottomLeft = rotatePoint(-hiltWidth / 2, hiltHeight);

        g.fillStyle(0xf1c40f, 1);
        g.beginPath();
        g.moveTo(hiltTopLeft.x, hiltTopLeft.y);
        g.lineTo(hiltTopRight.x, hiltTopRight.y);
        g.lineTo(hiltBottomRight.x, hiltBottomRight.y);
        g.lineTo(hiltBottomLeft.x, hiltBottomLeft.y);
        g.closePath();
        g.fillPath();

        // Guard
        const guardWidth = 10;
        const guardHeight = 3;
        const guardTopLeft = rotatePoint(-guardWidth / 2, -guardHeight);
        const guardTopRight = rotatePoint(guardWidth / 2, -guardHeight);
        const guardBottomRight = rotatePoint(guardWidth / 2, 0);
        const guardBottomLeft = rotatePoint(-guardWidth / 2, 0);

        g.fillStyle(0xd4ac0d, 1);
        g.beginPath();
        g.moveTo(guardTopLeft.x, guardTopLeft.y);
        g.lineTo(guardTopRight.x, guardTopRight.y);
        g.lineTo(guardBottomRight.x, guardBottomRight.y);
        g.lineTo(guardBottomLeft.x, guardBottomLeft.y);
        g.closePath();
        g.fillPath();

        // Sword tip glow (when swinging)
        if (this.player && this.player.isSwinging) {
            const tipPos = rotatePoint(0, -36);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(tipPos.x, tipPos.y, 4);
        }
    }

    initAudio() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.sfxVolume = 0.7;
        this.bgmVolume = 0.3;
        this.bgmOscillator = null;

        // Initialize audio context on first user interaction
        this.input.once('pointerdown', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.startBGM();
}
        });
    }

    updateBossPhase(boss, delta) {
        const hpPercent = boss.hp / boss.maxHp;
        const thresholds = boss.phaseThresholds;
        const currentPhase = boss.phase;

        if (currentPhase < 3 && hpPercent <= thresholds[currentPhase - 1]) {
            this.enterBossNextPhase(boss);
        }

        if (boss.phase >= 3) {
            boss.summonTimer += delta;
            if (boss.summonTimer >= boss.summonInterval) {
                boss.summonTimer = 0;
                this.summonEliteMinions(boss);
            }
        }
    }

    enterBossNextPhase(boss) {
        boss.phase++;
        boss.isEnraged = true;
        const multiplier = boss.phaseSpeedMultipliers[boss.phase - 1];
        boss.speed *= multiplier;
        boss.shootInterval = boss.phaseShootIntervals[boss.phase - 1];

        this.cameras.main.shake(500, 0.01);
        this.showBossEnrageEffect(boss.x, boss.y);
        this.uiScene.showWaveMessage('BOSS 狂暴階段 ' + boss.phase, 0xe74c3c);
    }

    summonEliteMinions(boss) {
        for (let i = 0; i < boss.summonCount; i++) {
            const angle = (i / boss.summonCount) * Math.PI * 2;
            const dist = 50;
            const x = boss.x + Math.cos(angle) * dist;
            const y = boss.y + Math.sin(angle) * dist;
            this.createEnemy(x, y, 'ELITE');
        }
    }

    showBossEnrageEffect(x, y) {
        const ring = this.add.graphics();
        ring.lineStyle(6, 0xe74c3c, 1);
        ring.strokeCircle(x, y, 0);

        this.tweens.add({
            targets: ring,
            radius: 100,
            alpha: 0,
            duration: 500,
            onUpdate: (tween, target) => {
                target.clear();
                target.lineStyle(6, 0xe74c3c, 1 - tween.progress);
                target.strokeCircle(x, y, tween.progress * 100);
            },
            onComplete: () => ring.destroy()
        });
    }
        });
    }

    playSound(type) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const volume = this.masterVolume * this.sfxVolume;

        switch (type) {
            case 'swing':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialDecayTo?.(0.01, 0.15) ||
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + 0.15);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;

            case 'hit':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;

            case 'kill':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;

            case 'chainKill':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.5);
                break;

            case 'levelUp':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1800, this.audioContext.currentTime + 0.8);
                gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.8);
                break;

            case 'damage':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;

            case 'pickup':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.15, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;

            case 'gameOver':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 1.0);
                break;
        }
    }

    startBGM() {
        if (!this.audioContext || this.bgmOscillator) return;

        this.bgmOscillator = this.audioContext.createOscillator();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        const gainNode = this.audioContext.createGain();

        this.bgmOscillator.type = 'triangle';
        this.bgmOscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(this.bgmOscillator.frequency);

        const volume = this.masterVolume * this.bgmVolume * 0.1;
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

        this.bgmOscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        lfo.start();
        this.bgmOscillator.start();
    }

    stopBGM() {
        if (this.bgmOscillator) {
            this.bgmOscillator.stop();
            this.bgmOscillator = null;
        }
    }

    update(time, delta) {
        if (this.isPaused || this.isGameOver || this.isLevelUp) return;

        const dt = delta / 1000;

        // Update game time
        this.gameTime += delta;
        this.waveTimer += delta;

        // Update floating particles
        this.updateParticles(delta);

        // Phase 1: Input & Movement
        this.handleInput(dt);

        // Phase 2: Update entities
        this.updatePlayer(delta);
        this.updateEnemies(delta);
        this.updateProjectiles(delta);
        this.updateExpOrbs(delta);

        // Phase 3: Game systems
        this.handleWaveSystem(delta);
        this.handleAutoFire(delta);
        this.handleCollisions();
        this.handleChainKill(delta);

        // Phase 4: Update UI
        this.updateUI();
        this.updateAttackRangeGraphics();
    }

    updateParticles(delta) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.particles.forEach(particle => {
            particle.x += particle.vx * delta / 1000;
            particle.y += particle.vy * delta / 1000;

            if (particle.x > width) particle.x = 0;
            if (particle.y > height) particle.y = 0;
        });

        if (this.visibilityMask) {
            this.updateVisibilityMask();
        }
    }

    updateVisibilityMask() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const radius = GAME_CONSTANTS.PLAYER.VISIBILITY_RADIUS;

        this.visibilityMask.clear();

        this.visibilityMask.fillStyle(0x000000, 0.6);
        this.visibilityMask.fillRect(0, 0, width, height);

        this.visibilityMask.fillStyle(0x000000, 0);
        this.visibilityMask.beginPath();
        this.visibilityMask.arc(this.player.x, this.player.y, radius, 0, Math.PI * 2);
        this.visibilityMask.fillPath();
    }

    handleInput(dt) {
        if (!this.player) return;

        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -1;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = 1;

        if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = 1;

        // Normalize diagonal movement
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

        this.player.vx = vx;
        this.player.vy = vy;

        // Update facing angle when moving
        if (vx !== 0 || vy !== 0) {
            this.player.facingAngle = Math.atan2(vy, vx);
        }
    }

    updatePlayer(delta) {
        if (!this.player) return;

        // Move player
        const speed = this.player.speed;
        const dt = delta / 1000;
        const vx = this.player.vx || 0;
        const vy = this.player.vy || 0;

        this.player.x += vx * speed * dt;
        this.player.y += vy * speed * dt;

        // Clamp to bounds
        const padding = 20;
        this.player.x = Phaser.Math.Clamp(this.player.x, padding, this.cameras.main.width - padding);
        this.player.y = Phaser.Math.Clamp(this.player.y, padding, this.cameras.main.height - padding);

        // Update fire cooldown
        if (this.player.fireCooldown > 0) {
            let cooldown = this.player.fireCooldown - delta;
            if (this.hasChainKillBuff) {
                cooldown -= delta * (1 - GAME_CONSTANTS.CHAIN_KILL.ATTACK_SPEED_BONUS);
            }
            this.player.fireCooldown = Math.max(0, cooldown);
        }

        if (this.player.skillTimer > 0) {
            this.player.skillTimer -= delta;
        }

        // Update invincibility
        if (this.player.isInvincible) {
            this.player.invincibleTimer -= delta;
            if (this.player.invincibleTimer <= 0) {
                this.player.isInvincible = false;
                this.player.setAlpha(1);
            }
        }

        // Update sword swing animation
        if (this.player.isSwinging) {
            this.player.swingTimer -= delta;
            const swingProgress = 1 - (this.player.swingTimer / 150);
            const swingAngle = (swingProgress * Math.PI / 2); // 0 to 90 degrees

            this.drawSword(swingAngle);

            if (this.player.swingTimer <= 0) {
                this.player.isSwinging = false;
                this.drawSword(0);
            }
        }
    }

    handleAutoFire(delta) {
        if (this.player.fireCooldown > 0) return;

        // Find nearest enemy in range
        const nearestEnemy = this.findNearestEnemy();

        if (nearestEnemy) {
            this.fireProjectiles(nearestEnemy);
            this.player.fireCooldown = this.player.fireRate;

            // Trigger swing animation
            this.player.isSwinging = true;
            this.player.swingTimer = 150;
            this.playSound('swing');
        }
    }

    findNearestEnemy() {
        let nearest = null;
        let nearestDist = this.player.attackRange;

        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;

            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        });

        return nearest;
    }

    fireProjectiles(target) {
        const count = this.player.projectileCount;
        const baseAngle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            target.x, target.y
        );

        const spreadAngle = Math.PI / 8;

        const isCrit = Math.random() < this.player.critChance;

        for (let i = 0; i < count; i++) {
            let angle = baseAngle;
            if (count > 1) {
                const offset = (i - (count - 1) / 2) * spreadAngle;
                angle += offset;
            }

            this.createProjectile(this.player.x, this.player.y, angle, isCrit);
        }

        if (isCrit) {
            this.showDamageNumber(this.player.x, this.player.y - 60, 'CRIT!', 0xf1c40f);
        }
    }

    createProjectile(x, y, angle, isCrit = false) {
        const projectile = this.add.graphics();
        projectile.x = x;
        projectile.y = y;
        projectile.direction = angle;
        projectile.speed = this.player.projectileSpeed;
        projectile.damage = isCrit ? this.player.damage * this.player.critMultiplier : this.player.damage;
        projectile.isCrit = isCrit;

        projectile.clear();
        const color = isCrit ? 0xe74c3c : 0xf39c12;
        projectile.fillStyle(color, 1);
        projectile.fillCircle(0, 0, isCrit ? 8 : 6);
        projectile.fillStyle(0xffffff, 0.8);
        projectile.fillCircle(-2, -2, isCrit ? 3 : 2);

        if (isCrit) {
            projectile.lineStyle(2, 0xf1c40f, 0.8);
            projectile.strokeCircle(0, 0, 12);
        } else {
            projectile.fillStyle(0xf39c12, 0.3);
            projectile.fillCircle(0, 0, 10);
        }

        this.projectiles.add(projectile);
    }

    updateProjectiles(delta) {
        const dt = delta / 1000;
        const bounds = {
            left: -50,
            right: this.cameras.main.width + 50,
            top: -50,
            bottom: this.cameras.main.height + 50
        };

        // Player projectiles
        this.projectiles.getChildren().forEach(proj => {
            if (!proj.active) return;

            proj.x += Math.cos(proj.direction) * proj.speed * dt;
            proj.y += Math.sin(proj.direction) * proj.speed * dt;

            // Remove if out of bounds
            if (proj.x < bounds.left || proj.x > bounds.right ||
                proj.y < bounds.top || proj.y > bounds.bottom) {
                proj.destroy();
            }
        });

        // Enemy projectiles
        this.enemyProjectiles.getChildren().forEach(proj => {
            if (!proj.active) return;

            proj.x += Math.cos(proj.direction) * proj.speed * dt;
            proj.y += Math.sin(proj.direction) * proj.speed * dt;

            if (proj.x < bounds.left || proj.x > bounds.right ||
                proj.y < bounds.top || proj.y > bounds.bottom) {
                proj.destroy();
            }
        });
    }

    handleWaveSystem(delta) {
        // Check for wave completion
        if (!this.isRestTime) {
            // Check if it's time for boss wave (50% of wave duration)
            const isBossWave = this.stats.wave % GAME_CONSTANTS.WAVE.BOSS_WAVE_INTERVAL === 0;
            if (isBossWave && !this.bossSpawned && this.waveTimer >= GAME_CONSTANTS.WAVE.DURATION / 2) {
                this.spawnBoss();
                this.bossSpawned = true;
            }

            // Check for wave end
            if (this.waveTimer >= GAME_CONSTANTS.WAVE.DURATION) {
                this.startRestTime();
            }
        } else {
            // Rest time countdown
            if (this.waveTimer >= GAME_CONSTANTS.WAVE.REST_TIME) {
                this.startNextWave();
            }
        }

        // Spawn enemies
        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0 && !this.isRestTime) {
            this.spawnEnemy();
            const baseInterval = Math.max(
                GAME_CONSTANTS.WAVE.MIN_SPAWN_INTERVAL,
                GAME_CONSTANTS.WAVE.BASE_SPAWN_INTERVAL - (this.stats.wave - 1) * GAME_CONSTANTS.WAVE.SPAWN_INTERVAL_DECREASE
            );
            this.spawnTimer = this.difficultyManager.getSpawnInterval(baseInterval);
        }
    }

    startRestTime() {
        this.isRestTime = true;
        this.waveTimer = 0;

        if (this.player.maxShieldHp > 0 && this.player.shieldHp < this.player.maxShieldHp) {
            this.player.shieldHp = this.player.maxShieldHp;
            this.uiScene.showBuffNotification('🛡️ 護盾已回復', 2000);
        }

        this.uiScene.showWaveMessage('波次結束！休息時間', 0x2ecc71);
    }

    startNextWave() {
        this.stats.wave++;
        this.isRestTime = false;
        this.waveTimer = 0;
        this.bossSpawned = false;

        // Update HP multiplier
        if (this.stats.wave % GAME_CONSTANTS.WAVE.HP_INCREASE_WAVE === 1) {
            this.hpMultiplier *= GAME_CONSTANTS.WAVE.HP_MULTIPLIER;
        }

        const isBossWave = this.stats.wave % GAME_CONSTANTS.WAVE.BOSS_WAVE_INTERVAL === 0;
        if (isBossWave) {
            this.uiScene.showWaveMessage('BOSS 波！第 ' + this.stats.wave + ' 波', 0xe74c3c);
        } else {
            this.uiScene.showWaveMessage('第 ' + this.stats.wave + ' 波開始！', 0xe67e22);
        }
    }

    spawnEnemy() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Determine spawn position (outside screen)
        let x, y;
        const side = Phaser.Math.Between(0, 3);
        switch (side) {
            case 0: x = Phaser.Math.Between(0, width); y = -30; break;
            case 1: x = width + 30; y = Phaser.Math.Between(0, height); break;
            case 2: x = Phaser.Math.Between(0, width); y = height + 30; break;
            case 3: x = -30; y = Phaser.Math.Between(0, height); break;
        }

        // Determine enemy type based on game time and weights
        const enemyType = this.getRandomEnemyType();
        this.createEnemy(x, y, enemyType);
    }

    getRandomEnemyType() {
        const time = this.gameTime;
        const weights = GAME_CONSTANTS.ENEMY_SPAWN_WEIGHTS;
        const types = [];
        const weightValues = [];

        Object.keys(weights).forEach(type => {
            const weightConfig = weights[type];
            let weight = weightConfig.base;

            Object.keys(weightConfig.timeMultipliers).forEach(timeKey => {
                if (time >= parseInt(timeKey) * 1000) {
                    weight = weightConfig.timeMultipliers[timeKey];
                }
            });

            if (weight > 0) {
                types.push(type);
                weightValues.push(weight);
            }
        });

        const totalWeight = weightValues.reduce((a, b) => a + b, 0);
        let random = Phaser.Math.Between(1, totalWeight);

        for (let i = 0; i < types.length; i++) {
            random -= weightValues[i];
            if (random <= 0) return types[i];
        }

        return 'NORMAL';
    }

    createEnemy(x, y, type) {
        const config = GAME_CONSTANTS.ENEMY[type];
        const enemy = this.add.container(x, y);

        enemy.type = type;
        const diffConfig = this.difficultyManager.applyDifficulty(config);
        enemy.hp = diffConfig.hp * this.hpMultiplier;
        enemy.maxHp = diffConfig.hp * this.hpMultiplier;
        enemy.speed = typeof config.speed === 'object'
            ? Phaser.Math.Between(config.speed.min, config.speed.max)
            : config.speed;
        enemy.damage = diffConfig.damage;
        enemy.exp = config.exp;
        enemy.radius = config.radius;
        enemy.shootTimer = 0;
        enemy.shootInterval = config.shootInterval || 0;

        if (type === 'ELITE' && config.shieldHp) {
            enemy.shieldHp = config.shieldHp;
            enemy.maxShieldHp = config.shieldHp;
            enemy.hasShield = true;
        }

        if (type === 'INVISIBLE' && config.invisibleAlpha) {
            enemy.alpha = config.invisibleAlpha;
            enemy.isInvisible = true;
            enemy.revealTimer = 0;
        }

        if (type === 'BOSS') {
            enemy.phase = 1;
            enemy.phaseThresholds = config.phaseThresholds;
            enemy.phaseSpeedMultipliers = config.phaseSpeedMultipliers;
            enemy.phaseShootIntervals = config.phaseShootIntervals;
            enemy.phaseDirections = config.phaseDirections;
            enemy.summonInterval = config.summonInterval;
            enemy.summonCount = config.summonCount;
            enemy.summonTimer = 0;
            enemy.isEnraged = false;
        }

        // Draw enemy
        const graphics = this.add.graphics();
        this.drawEnemy(graphics, type, enemy.radius);
        enemy.add(graphics);
        enemy.graphics = graphics;

        // Add health bar for tank
        if (type === 'TANK' || type === 'BOSS') {
            enemy.healthBarBg = this.add.graphics();
            enemy.healthBar = this.add.graphics();
            enemy.add(enemy.healthBarBg);
            enemy.add(enemy.healthBar);
        }

        this.enemies.add(enemy);
    }

    drawEnemy(graphics, type, radius) {
        graphics.clear();

        switch (type) {
            case 'NORMAL':
                // Red body
                graphics.fillStyle(0xe74c3c, 1);
                graphics.fillCircle(0, 0, radius);
                // White eyes
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(-5, -3, 4);
                graphics.fillCircle(5, -3, 4);
                // Angry pupils
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-4, -2, 2);
                graphics.fillCircle(6, -2, 2);
                // Angry mouth
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.moveTo(-5, 5);
                graphics.lineTo(5, 5);
                graphics.strokePath();
                break;

            case 'FAST':
                // Green body (smaller)
                graphics.fillStyle(0x27ae60, 1);
                graphics.fillCircle(0, 0, radius);
                // Horn
                graphics.fillStyle(0x1e8449, 1);
                graphics.fillTriangle(-4, -radius, 0, -radius - 8, 4, -radius);
                // Eyes
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(-3, -2, 3);
                graphics.fillCircle(3, -2, 3);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-2, -1, 1.5);
                graphics.fillCircle(4, -1, 1.5);
                break;

            case 'TANK':
                // Grey large body
                graphics.fillStyle(0x7f8c8d, 1);
                graphics.fillCircle(0, 0, radius);
                // Outer ring
                graphics.lineStyle(3, 0x95a5a6, 1);
                graphics.strokeCircle(0, 0, radius - 2);
                // Red eyes
                graphics.fillStyle(0xe74c3c, 1);
                graphics.fillCircle(-6, -4, 5);
                graphics.fillCircle(6, -4, 5);
                // Big mouth
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillEllipse(0, 6, 12, 6);
                break;

            case 'RANGED':
                // Purple body
                graphics.fillStyle(0x9b59b6, 1);
                graphics.fillCircle(0, 0, radius);
                // Circle marker on top
                graphics.fillStyle(0x8e44ad, 1);
                graphics.fillCircle(0, -radius + 3, 4);
                // Yellow eyes
                graphics.fillStyle(0xf1c40f, 1);
                graphics.fillCircle(-4, -2, 3);
                graphics.fillCircle(4, -2, 3);
                // Arc mouth
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.beginPath();
                graphics.arc(0, 2, 5, 0, Math.PI, false);
                graphics.strokePath();
                break;

            case 'ELITE':
                graphics.fillStyle(0xf1c40f, 1);
                graphics.fillCircle(0, 0, radius);
                graphics.lineStyle(3, 0xf39c12, 1);
                graphics.strokeCircle(0, 0, radius + 3);
                graphics.fillStyle(0x3498db, 0.8);
                graphics.strokeCircle(0, 0, radius - 2);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-4, -3, 3);
                graphics.fillCircle(4, -3, 3);
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.beginPath();
                graphics.arc(0, 3, 4, 0, Math.PI, false);
                graphics.strokePath();
                break;

            case 'SPLIT':
                graphics.fillStyle(0x2ecc71, 1);
                graphics.fillCircle(0, 0, radius);
                graphics.fillStyle(0x27ae60, 1);
                graphics.fillCircle(0, -radius + 2, 5);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(-3, -2, 3);
                graphics.fillCircle(3, -2, 3);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-2, -1, 1.5);
                graphics.fillCircle(4, -1, 1.5);
                break;

            case 'EXPLOSIVE':
                graphics.fillStyle(0xe67e22, 1);
                graphics.fillCircle(0, 0, radius);
                graphics.fillStyle(0xd35400, 1);
                graphics.fillCircle(0, -radius + 3, 6);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(-4, -3, 3);
                graphics.fillCircle(4, -3, 3);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-3, -2, 1.5);
                graphics.fillCircle(5, -2, 1.5);
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.moveTo(-5, 4);
                graphics.lineTo(5, 4);
                graphics.strokePath();
                break;

            case 'INVISIBLE':
                graphics.fillStyle(0x95a5a6, 1);
                graphics.fillCircle(0, 0, radius);
                graphics.lineStyle(2, 0x7f8c8d, 0.5);
                graphics.strokeCircle(0, 0, radius);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-4, -3, 3);
                graphics.fillCircle(4, -3, 3);
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.moveTo(-4, 3);
                graphics.lineTo(4, 3);
                graphics.strokePath();
                break;

            case 'BOSS':
                // Dark red body
                graphics.fillStyle(0xc0392b, 1);
                graphics.fillCircle(0, 0, radius);
                // Crown
                graphics.fillStyle(0xf1c40f, 1);
                graphics.fillTriangle(-12, -radius, -6, -radius - 12, 0, -radius);
                graphics.fillTriangle(0, -radius, 6, -radius - 12, 12, -radius);
                graphics.fillTriangle(-6, -radius - 12, 0, -radius - 16, 6, -radius - 12);
                // Red glow
                graphics.lineStyle(4, 0xe74c3c, 0.5);
                graphics.strokeCircle(0, 0, radius + 4);
                // Angry eyes
                graphics.fillStyle(0xf1c40f, 1);
                graphics.fillCircle(-8, -5, 6);
                graphics.fillCircle(8, -5, 6);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-7, -4, 3);
                graphics.fillCircle(9, -4, 3);
                // Unhappy mouth
                graphics.lineStyle(3, 0x2c3e50, 1);
                graphics.beginPath();
                graphics.arc(0, 8, 8, Math.PI, 0, true);
                graphics.strokePath();
                break;
        }
    }

    updateEnemyHealthBar(enemy) {
        if (!enemy.healthBar) return;

        const barWidth = enemy.radius * 2;
        const barHeight = 4;
        const y = -enemy.radius - 10;

        enemy.healthBarBg.clear();
        enemy.healthBarBg.fillStyle(0x2c3e50, 1);
        enemy.healthBarBg.fillRect(-barWidth / 2, y, barWidth, barHeight);

        enemy.healthBar.clear();
        const healthPercent = enemy.hp / enemy.maxHp;
        enemy.healthBar.fillStyle(0xe74c3c, 1);
        enemy.healthBar.fillRect(-barWidth / 2, y, barWidth * healthPercent, barHeight);
    }

    spawnBoss() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Spawn from random edge
        let x, y;
        const side = Phaser.Math.Between(0, 3);
        switch (side) {
            case 0: x = Phaser.Math.Between(100, width - 100); y = -50; break;
            case 1: x = width + 50; y = Phaser.Math.Between(100, height - 100); break;
            case 2: x = Phaser.Math.Between(100, width - 100); y = height + 50; break;
            case 3: x = -50; y = Phaser.Math.Between(100, height - 100); break;
        }

        this.createEnemy(x, y, 'BOSS');
    }

    updateEnemies(delta) {
        const dt = delta / 1000;

        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;

            // Move towards player
            const angle = Phaser.Math.Angle.Between(
                enemy.x, enemy.y,
                this.player.x, this.player.y
            );

            enemy.x += Math.cos(angle) * enemy.speed * dt;
            enemy.y += Math.sin(angle) * enemy.speed * dt;

            // Ranged enemy shooting
            if ((enemy.type === 'RANGED' || enemy.type === 'BOSS') && enemy.shootInterval > 0) {
                enemy.shootTimer += delta;
                if (enemy.shootTimer >= enemy.shootInterval) {
                    enemy.shootTimer = 0;
                    this.createEnemyProjectile(enemy);
                }
            }

            if (enemy.type === 'BOSS') {
                this.updateBossPhase(enemy, delta);
            }

            // Update health bar for tank/boss
            if (enemy.type === 'TANK' || enemy.type === 'BOSS') {
                this.updateEnemyHealthBar(enemy);
            }

            if (enemy.isInvisible && enemy.revealTimer > 0) {
                enemy.revealTimer -= delta;
                if (enemy.revealTimer <= 0) {
                    enemy.alpha = GAME_CONSTANTS.ENEMY.INVISIBLE.invisibleAlpha;
                }
            }
        });
    }

    createEnemyProjectile(enemy) {
        if (enemy.type === 'BOSS') {
            const directions = enemy.phaseDirections || [1];
            directions.forEach(dirIndex => {
                const angle = (dirIndex / enemy.phaseDirections[enemy.phase - 1]) * Math.PI * 2;
                this.createSingleEnemyProjectile(enemy, angle);
            });
        } else {
            const angle = Phaser.Math.Angle.Between(
                enemy.x, enemy.y,
                this.player.x, this.player.y
            );
            this.createSingleEnemyProjectile(enemy, angle);
        }
    }

    createSingleEnemyProjectile(enemy, angle) {
        const proj = this.add.graphics();
        proj.x = enemy.x;
        proj.y = enemy.y;

        proj.direction = angle;
        proj.speed = 200;
        proj.damage = enemy.type === 'BOSS' ? 5 : 5;

        proj.fillStyle(0x9b59b6, 1);
        proj.fillCircle(0, 0, 5);
        proj.fillStyle(0xffffff, 0.6);
        proj.fillCircle(-1, -1, 2);

        this.enemyProjectiles.add(proj);
    }

    handleCollisions() {
        // Player projectiles vs enemies
        this.projectiles.getChildren().forEach(proj => {
            if (!proj.active) return;

            this.enemies.getChildren().forEach(enemy => {
                if (!enemy.active) return;

                const dist = Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y);
                if (dist < enemy.radius + 6) {
                    this.damageEnemy(enemy, proj.damage);
                    proj.destroy();
                    this.playSound('hit');
                }
            });
        });

        // Enemy projectiles vs player
        this.enemyProjectiles.getChildren().forEach(proj => {
            if (!proj.active) return;

            const dist = Phaser.Math.Distance.Between(proj.x, proj.y, this.player.x, this.player.y);
            if (dist < 20) {
                this.damagePlayer(proj.damage);
                proj.destroy();
            }
        });

        // Enemies vs player
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;

            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            if (dist < enemy.radius + 15) {
                this.damagePlayer(enemy.damage);
            }
        });

        // Experience orbs vs player
        this.expOrbs.getChildren().forEach(orb => {
            if (!orb.active) return;

            const dist = Phaser.Math.Distance.Between(orb.x, orb.y, this.player.x, this.player.y);

            // Magnetic pickup
            if (dist < this.player.pickupRange) {
                const angle = Phaser.Math.Angle.Between(orb.x, orb.y, this.player.x, this.player.y);
                orb.x += Math.cos(angle) * 8;
                orb.y += Math.sin(angle) * 8;
            }

            if (dist < 15) {
                this.collectExp(orb.value);
                orb.destroy();
                this.playSound('pickup');
            }
        });
    }

    damageEnemy(enemy, damage) {
        if (enemy.isInvisible) {
            enemy.alpha = 1;
            enemy.revealTimer = GAME_CONSTANTS.ENEMY.INVISIBLE.revealDuration;
        }

        if (enemy.hasShield && enemy.shieldHp > 0) {
            const shieldDamage = Math.min(damage, enemy.shieldHp);
            enemy.shieldHp -= shieldDamage;
            damage -= shieldDamage;

            this.showDamageNumber(enemy.x, enemy.y - 20, shieldDamage + ' (shield)', 0x3498db);

            if (enemy.shieldHp <= 0) {
                enemy.hasShield = false;
                this.showShieldBreakEffect(enemy.x, enemy.y);
            }
        }

        if (damage > 0) {
            enemy.hp -= damage;
            this.showDamageNumber(enemy.x, enemy.y, damage);
        }

        if (enemy.hp <= 0) {
            this.killEnemy(enemy);
        }
    }

    showShieldBreakEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = Phaser.Math.Between(50, 100);
            const particle = this.add.graphics();

            particle.fillStyle(0x3498db, 1);
            particle.fillCircle(0, 0, Phaser.Math.Between(3, 6));
            particle.x = x;
            particle.y = y;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed * 0.5,
                y: y + Math.sin(angle) * speed * 0.5,
                alpha: 0,
                scale: 0.5,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }

    killEnemy(enemy) {
        if (!enemy || !enemy.active) return;
        enemy.active = false;

        if (enemy.type === 'SPLIT') {
            this.splitEnemy(enemy);
        }

        if (enemy.type === 'EXPLOSIVE') {
            this.explosiveEnemyDeath(enemy);
        }

        this.createExplosion(enemy.x, enemy.y);

        this.createExpOrb(enemy.x, enemy.y, enemy.exp);

        this.stats.kills++;
        if (enemy.type === 'BOSS') {
            this.stats.bossKills++;
        }

        if (this.player.vampire > 0) {
            this.player.hp = Math.min(this.player.hp + this.player.vampire, this.player.maxHp);
        }

        this.checkChainKill(enemy);

        this.playSound('kill');

        enemy.destroy();
    }

    splitEnemy(enemy) {
        const config = GAME_CONSTANTS.ENEMY.SPLIT;
        for (let i = 0; i < config.splitCount; i++) {
            const angle = (i / config.splitCount) * Math.PI * 2;
            const offsetDist = 20;
            const newX = enemy.x + Math.cos(angle) * offsetDist;
            const newY = enemy.y + Math.sin(angle) * offsetDist;

            const miniEnemy = this.add.container(newX, newY);
            miniEnemy.type = 'NORMAL';
            miniEnemy.hp = 1;
            miniEnemy.maxHp = 1;
            miniEnemy.speed = enemy.speed;
            miniEnemy.damage = enemy.damage / 2;
            miniEnemy.exp = enemy.exp / 2;
            miniEnemy.radius = config.splitRadius;
            miniEnemy.shootTimer = 0;

            const graphics = this.add.graphics();
            this.drawEnemy(graphics, 'NORMAL', miniEnemy.radius);
            miniEnemy.add(graphics);
            miniEnemy.graphics = graphics;

            this.enemies.add(miniEnemy);
        }

        this.showSplitEffect(enemy.x, enemy.y);
    }

    explosiveEnemyDeath(enemy) {
        const config = GAME_CONSTANTS.ENEMY.EXPLOSIVE;
        const dist = Phaser.Math.Distance.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
        );

        if (dist < config.explosionRadius) {
            this.damagePlayer(config.explosionDamage);
        }

        this.showExplosiveEffect(enemy.x, enemy.y, config.explosionRadius);
    }

    showSplitEffect(x, y) {
        const flash = this.add.graphics();
        flash.fillStyle(0x2ecc71, 0.8);
        flash.fillCircle(x, y, 20);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 300,
            onComplete: () => flash.destroy()
        });
    }

    showExplosiveEffect(x, y, radius) {
        const explosionRing = this.add.graphics();
        explosionRing.lineStyle(4, 0xe67e22, 1);
        explosionRing.strokeCircle(x, y, 0);

        this.tweens.add({
            targets: explosionRing,
            radius: radius,
            duration: 300,
            onUpdate: (tween, target) => {
                target.clear();
                target.lineStyle(4, 0xe67e22, 1 - tween.progress);
                target.strokeCircle(x, y, target.radius);
            },
            onComplete: () => explosionRing.destroy()
        });
    }

    checkChainKill(killedEnemy) {
        // Check for nearby enemies within chain range
        let chainKills = 0;
        const chainRange = GAME_CONSTANTS.CHAIN_KILL.RANGE;

        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active || enemy === killedEnemy) return;

            const dist = Phaser.Math.Distance.Between(
                killedEnemy.x, killedEnemy.y,
                enemy.x, enemy.y
            );

            if (dist < chainRange) {
                chainKills++;
                // Chain kill
                enemy.hp = 0;
                this.killEnemy(enemy);
            }
        });

        if (chainKills > 0) {
            this.chainKillCount = chainKills + 1;
            this.chainKillTimer = 100; // 100ms window to count total

            // Trigger chain kill buff
            this.triggerChainKillBuff(chainKills + 1);
        }
    }

    triggerChainKillBuff(count) {
        this.hasChainKillBuff = true;
        this.chainKillBuffTimer = GAME_CONSTANTS.CHAIN_KILL.BUFF_DURATION;

        // Show chain kill display
        this.showChainKillDisplay(count);

        // Show buff notification
        this.uiScene.showBuffNotification('⚡ 連殺！攻擊速度 +30%', GAME_CONSTANTS.CHAIN_KILL.BUFF_DURATION);

        this.playSound('chainKill');
    }

    showChainKillDisplay(count) {
        let text, color;
        if (count >= 10) {
            text = 'GODLIKE!';
            color = 0x6c3483;
        } else if (count >= 6) {
            text = 'ULTRA KILL!';
            color = 0x8e44ad;
        } else if (count >= 5) {
            text = 'MEGA KILL!';
            color = 0xc0392b;
        } else if (count >= 4) {
            text = 'QUAD KILL!';
            color = 0xe74c3c;
        } else if (count >= 3) {
            text = 'TRIPLE KILL!';
            color = 0xe67e22;
        } else {
            text = 'DOUBLE KILL!';
            color = 0xf1c40f;
        }

        // Create floating text
        const display = this.add.text(
            this.player.x,
            this.player.y - 50,
            text,
            {
                fontSize: count >= 10 ? '36px' : '32px',
                fontFamily: 'Arial Black',
                color: '#' + color.toString(16).padStart(6, '0'),
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Animate
        this.tweens.add({
            targets: display,
            y: display.y - 30,
            alpha: 0,
            scale: { from: 1.2, to: 2.5 },
            duration: 1500,
            onComplete: () => display.destroy()
        });
    }

    handleChainKill(delta) {
        if (this.hasChainKillBuff) {
            this.chainKillBuffTimer -= delta;
            if (this.chainKillBuffTimer <= 0) {
                this.hasChainKillBuff = false;
            }
        }
    }

    createExplosion(x, y) {
        // Create particle explosion
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = Phaser.Math.Between(80, 140);
            const particle = this.add.graphics();

            particle.fillStyle(Phaser.Math.RND.pick([0xe74c3c, 0xf39c12]), 1);
            particle.fillCircle(0, 0, Phaser.Math.Between(3, 5));
            particle.x = x;
            particle.y = y;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed * 0.5,
                y: y + Math.sin(angle) * speed * 0.5,
                alpha: 0,
                scale: 0.5,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }

        // Center flash
        const flash = this.add.graphics();
        flash.fillStyle(0xffffff, 1);
        flash.fillCircle(x, y, 10);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 3,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }

    createExpOrb(x, y, value) {
        const orb = this.add.graphics();

        let expValue = value;
        if (this.hasChainKillBuff) {
            const chainBonus = GAME_CONSTANTS.CHAIN_KILL_EXP_BONUS[Math.min(this.chainKillCount, 10)] || 0;
            expValue = Math.floor(value * (1 + chainBonus) * (1 + this.player.expMultiplier));
        } else {
            expValue = Math.floor(value * (1 + this.player.expMultiplier));
        }

        orb.fillStyle(0x2ecc71, 1);
        orb.fillCircle(0, 0, 8);
        orb.fillStyle(0xffffff, 0.7);
        orb.fillCircle(-2, -2, 3);

        orb.fillStyle(0x2ecc71, 0.3);
        orb.fillCircle(0, 0, 12);

        orb.x = x;
        orb.y = y;
        orb.value = expValue;

        this.tweens.add({
            targets: orb,
            scale: { from: 1, to: 1.2 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        this.expOrbs.add(orb);
    }

    updateExpOrbs(delta) {
        // Orbs move towards player in handleCollisions
    }

    collectExp(value) {
        this.stats.exp += value;

        // Check for level up
        const expNeeded = GAME_CONSTANTS.EXP_TO_LEVEL(this.stats.level);
        if (this.stats.exp >= expNeeded) {
            this.levelUp();
        }

        this.updateUI();
    }

    levelUp() {
        this.stats.exp -= GAME_CONSTANTS.EXP_TO_LEVEL(this.stats.level);
        this.stats.level++;

        this.isLevelUp = true;
        this.playSound('levelUp');

        // Show talent selection
        this.showTalentSelection();
    }

    showTalentSelection() {
        // Get 3 random talents
        const shuffled = [...GAME_CONSTANTS.TALENTS].sort(() => Math.random() - 0.5);
        const options = shuffled.slice(0, 3);

        this.uiScene.showLevelUpPanel(options, (talent) => {
            this.applyTalent(talent);
            this.isLevelUp = false;
        });
    }

    applyTalent(talent) {
        const effect = talent.effect;

        if (effect.hp) {
            this.player.maxHp += effect.hp;
            this.player.hp += effect.hp;
        }
        if (effect.speed) {
            this.player.speed += effect.speed;
        }
        if (effect.pickupRange) {
            this.player.pickupRange += effect.pickupRange;
        }
        if (effect.attackRange) {
            this.player.attackRange += effect.attackRange;
        }
        if (effect.fireRate) {
            this.player.fireRate = Math.max(100, this.player.fireRate + effect.fireRate);
        }
        if (effect.damage) {
            this.player.damage += effect.damage;
        }
        if (effect.projectileSpeed) {
            this.player.projectileSpeed += effect.projectileSpeed;
        }
        if (effect.projectileCount) {
            this.player.projectileCount += effect.projectileCount;
        }
        if (effect.critChance) {
            this.player.critChance += effect.critChance;
        }
        if (effect.critMultiplier) {
            this.player.critMultiplier += effect.critMultiplier;
        }
        if (effect.vampire) {
            this.player.vampire += effect.vampire;
        }
        if (effect.maxShield) {
            this.player.maxShieldHp += effect.maxShield;
            if (this.player.shieldHp === 0) {
                this.player.shieldHp = this.player.maxShieldHp;
            }
        }
        if (effect.expMultiplier) {
            this.player.expMultiplier += effect.expMultiplier;
        }
        if (effect.armor) {
            this.player.armor += effect.armor;
        }

        this.updateUI();
    }

    showDamageNumber(x, y, damage) {
        const size = Math.min(16 + damage * 2, 36);
        const color = damage >= 5 ? 0xf1c40f : 0xffffff;

        const text = this.add.text(x, y, damage.toString(), {
            fontSize: size + 'px',
            fontFamily: 'Arial',
            color: '#' + color.toString(16).padStart(6, '0'),
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 30,
            alpha: 0,
            scale: { from: 1, to: 1.5 },
            duration: 800,
            onComplete: () => text.destroy()
        });
    }

    damagePlayer(damage) {
        if (this.player.isInvincible) return;

        if (this.player.shieldHp > 0) {
            const shieldDamage = Math.min(damage, this.player.shieldHp);
            this.player.shieldHp -= shieldDamage;
            damage -= shieldDamage;

            this.showDamageNumber(this.player.x, this.player.y - 30, shieldDamage + ' (shield)', 0x3498db);

            if (this.player.shieldHp <= 0) {
                this.showPlayerShieldBreakEffect();
            }
        }

        if (this.player.armor > 0) {
            damage = damage * (1 - this.player.armor);
        }

        if (damage > 0) {
            this.player.hp -= damage;
            this.player.isInvincible = true;
            this.player.invincibleTimer = GAME_CONSTANTS.PLAYER.INVINCIBLE_TIME;

            this.player.setAlpha(0.5);
            this.tweens.add({
                targets: this.player,
                alpha: 1,
                duration: 100,
                yoyo: true,
                repeat: 5
            });

            this.playerGraphics.clear();
            this.playerGraphics.fillStyle(0xe74c3c, 1);
            this.playerGraphics.fillCircle(0, -12, 14);
            this.playerGraphics.fillRoundedRect(-12, -8, 24, 28, 4);
            this.time.delayedCall(100, () => this.drawPlayer(0));

            this.playSound('damage');
        }

        this.updateUI();

        if (this.player.hp <= 0) {
            this.gameOver();
        }
    }

    showPlayerShieldBreakEffect() {
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const speed = Phaser.Math.Between(60, 120);
            const particle = this.add.graphics();

            particle.fillStyle(0x3498db, 1);
            particle.fillCircle(0, 0, Phaser.Math.Between(4, 8));
            particle.x = this.player.x;
            particle.y = this.player.y;

            this.tweens.add({
                targets: particle,
                x: this.player.x + Math.cos(angle) * speed * 0.6,
                y: this.player.y + Math.sin(angle) * speed * 0.6,
                alpha: 0,
                scale: 0.3,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.stopBGM();
        this.playSound('gameOver');

        const stats = {
            level: this.stats.level,
            kills: this.stats.kills,
            bossKills: this.stats.bossKills,
            wave: this.stats.wave,
            time: Math.floor(this.gameTime / 1000),
            difficulty: this.difficulty
        };

        this.storageManager.save(stats);

        this.achievementManager.check('kills', stats.kills, this.difficulty);
        this.achievementManager.check('bossKills', stats.bossKills, this.difficulty);
        this.achievementManager.check('wave', stats.wave, this.difficulty);
        this.achievementManager.check('level', stats.level, this.difficulty);
        this.achievementManager.check('time', stats.time, this.difficulty);

        this.uiScene.showGameOver(stats, this.storageManager.load());
    }

    togglePause() {
        if (this.isLevelUp || this.isGameOver) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.uiScene.showPauseScreen();
        } else {
            this.uiScene.hidePauseScreen();
        }
    }

    updateUI() {
        if (this.uiScene) {
            this.uiScene.updateStats({
                hp: this.player.hp,
                maxHp: this.player.maxHp,
                level: this.stats.level,
                exp: this.stats.exp,
                expNeeded: GAME_CONSTANTS.EXP_TO_LEVEL(this.stats.level),
                kills: this.stats.kills,
                wave: this.stats.wave,
                gameTime: this.gameTime,
                isRestTime: this.isRestTime
            });
        }
    }
}