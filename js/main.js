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

// Game constants
export const GAME_CONSTANTS = {
    PLAYER: {
        HP: 100,
        SPEED: 200,
        PICKUP_RANGE: 80,
        ATTACK_RANGE: 300,
        FIRE_RATE: 500, // ms
        DAMAGE: 1,
        PROJECTILE_SPEED: 400,
        PROJECTILE_COUNT: 3,
        INVINCIBLE_TIME: 1000
    },
    ENEMY: {
        NORMAL: {
            hp: 1,
            speed: { min: 50, max: 70 },
            damage: 10,
            exp: 10,
            radius: 15,
            color: 0xe74c3c,
            spawnTime: 0
        },
        FAST: {
            hp: 1,
            speed: { min: 90, max: 110 },
            damage: 8,
            exp: 12,
            radius: 12,
            color: 0x27ae60,
            spawnTime: 30000
        },
        TANK: {
            hp: 3,
            speed: { min: 25, max: 45 },
            damage: 20,
            exp: 25,
            radius: 22,
            color: 0x7f8c8d,
            spawnTime: 60000
        },
        RANGED: {
            hp: 2,
            speed: { min: 30, max: 50 },
            damage: 10,
            exp: 15,
            radius: 14,
            color: 0x9b59b6,
            spawnTime: 45000,
            shootInterval: 2000
        },
        BOSS: {
            hp: 50,
            speed: 25,
            damage: 30,
            exp: 100,
            radius: 35,
            color: 0xc0392b,
            shootInterval: 1500
        }
    },
    WAVE: {
        DURATION: 60000, // 60 seconds
        REST_TIME: 5000, // 5 seconds
        BASE_ENEMIES: 10,
        ENEMY_MULTIPLIER: 1.3,
        BASE_SPAWN_INTERVAL: 1500,
        SPAWN_INTERVAL_DECREASE: 50,
        MIN_SPAWN_INTERVAL: 300,
        HP_INCREASE_WAVE: 3,
        HP_MULTIPLIER: 1.5,
        BOSS_WAVE_INTERVAL: 5
    },
    TALENTS: [
        { id: 'hp', name: '生命強化', desc: '最大生命值 +20', icon: '❤️', effect: { hp: 20 } },
        { id: 'speed', name: '疾風步', desc: '移動速度 +30', icon: '💨', effect: { speed: 30 } },
        { id: 'pickup', name: '磁力手套', desc: '拾取範圍 +30', icon: '🧲', effect: { pickupRange: 30 } },
        { id: 'range', name: '鷹眼', desc: '攻擊範圍 +50', icon: '👁️', effect: { attackRange: 50 } },
        { id: 'fireRate', name: '急速射擊', desc: '射擊間隔 -0.08秒', icon: '⚡', effect: { fireRate: -80 } },
        { id: 'damage', name: '魔力增幅', desc: '傷害 +1', icon: '✨', effect: { damage: 1 } },
        { id: 'projSpeed', name: '子彈加速', desc: '子彈速度 +100', icon: '🚀', effect: { projectileSpeed: 100 } },
        { id: 'multiShot', name: '多重射擊', desc: '同時發射 +1 顆子彈', icon: '🎯', effect: { projectileCount: 1 } }
    ],
    CHAIN_KILL: {
        RANGE: 40,
        BUFF_DURATION: 5000,
        ATTACK_SPEED_BONUS: 0.7
    },
    EXP_TO_LEVEL: (level) => level * 20
};

// Import scenes
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

// Add scenes to config
config.scene = [BootScene, GameScene, UIScene];

// Create game instance
const game = new Phaser.Game(config);

// Make game globally accessible for debugging
window.game = game;