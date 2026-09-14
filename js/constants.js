// Game constants
export const GAME_CONSTANTS = {
    PLAYER: {
        HP: 100,
        SPEED: 200,
        PICKUP_RANGE: 80,
        ATTACK_RANGE: 300,
        FIRE_RATE: 500,
        DAMAGE: 1,
        PROJECTILE_SPEED: 400,
        PROJECTILE_COUNT: 3,
        INVINCIBLE_TIME: 1000,
        SHIELD_HP: 0,
        SHIELD_MAX: 50,
        CRIT_CHANCE: 0.05,
        CRIT_MULTIPLIER: 2.0,
        SKILL_COOLDOWN: 30000,
        SKILL_DAMAGE_MULTIPLIER: 10,
        VISIBILITY_RADIUS: 200
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
            hp: 100, // 原50，加2倍
            speed: 25,
            damage: 30,
            exp: 100,
            radius: 105, // 放大3倍（原35 * 3）
            color: 0xc0392b,
            shootInterval: 1500,
            phaseThresholds: [0.7, 0.4, 0.2],
            phaseSpeedMultipliers: [1.0, 1.5, 2.0],
            phaseShootIntervals: [1500, 1050, 750],
            phaseDirections: [1, 4, 8],
            summonInterval: 5000,
            summonCount: 2
        },
        ELITE: {
            hp: 5,
            speed: 60,
            damage: 15,
            exp: 50,
            radius: 18,
            color: 0xf1c40f,
            spawnTime: 90000,
            shieldHp: 20
        },
        SPLIT: {
            hp: 2,
            speed: 70,
            damage: 10,
            exp: 20,
            radius: 16,
            color: 0x2ecc71,
            spawnTime: 120000,
            splitRadius: 10,
            splitCount: 2
        },
        EXPLOSIVE: {
            hp: 1,
            speed: 50,
            damage: 5,
            exp: 15,
            radius: 14,
            color: 0xe67e22,
            spawnTime: 150000,
            explosionDamage: 30,
            explosionRadius: 60
        },
        INVISIBLE: {
            hp: 2,
            speed: 80,
            damage: 12,
            exp: 25,
            radius: 14,
            color: 0x95a5a6,
            spawnTime: 180000,
            invisibleAlpha: 0.3,
            revealDuration: 1000
        }
    },
    ENEMY_SPAWN_WEIGHTS: {
        NORMAL: { base: 100, timeMultipliers: { 0: 1.0, 30: 0.8, 60: 0.6 } },
        FAST: { base: 0, timeMultipliers: { 30: 30, 60: 40 } },
        TANK: { base: 0, timeMultipliers: { 60: 25, 120: 30 } },
        RANGED: { base: 0, timeMultipliers: { 45: 20, 90: 25 } },
        ELITE: { base: 0, timeMultipliers: { 90: 15, 150: 20 } },
        SPLIT: { base: 0, timeMultipliers: { 120: 10, 180: 15 } },
        EXPLOSIVE: { base: 0, timeMultipliers: { 150: 8, 210: 12 } },
        INVISIBLE: { base: 0, timeMultipliers: { 180: 5, 240: 10 } }
    },
    WAVE: {
        DURATION: 60000, // 60 seconds
        REST_TIME: 5000, // 5 seconds
        BASE_ENEMIES: 20, // 增加2倍（原10）
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
        { id: 'multiShot', name: '多重射擊', desc: '同時發射 +2 顆子彈', icon: '🎯', effect: { projectileCount: 2 } },
        { id: 'critChance', name: '暴击率', desc: '暴击率 +5%', icon: '💥', effect: { critChance: 0.05 } },
        { id: 'critMultiplier', name: '暴击傷害', desc: '暴击傷害 +50%', icon: '💢', effect: { critMultiplier: 0.5 } },
        { id: 'vampire', name: '吸血', desc: '擊殺回復 1HP', icon: '🩸', effect: { vampire: 1 } },
        { id: 'shield', name: '护盾强化', desc: '护盾上限 +10', icon: '🛡️', effect: { maxShield: 10 } },
        { id: 'expBonus', name: '经验加成', desc: '经验值 +20%', icon: '📚', effect: { expMultiplier: 0.2 } },
        { id: 'armor', name: '护甲', desc: '傷害減免 10%', icon: '🛡️', effect: { armor: 0.1 } }
    ],
    CHAIN_KILL: {
        RANGE: 40,
        BUFF_DURATION: 5000,
        ATTACK_SPEED_BONUS: 0.7
    },
    CHAIN_KILL_EXP_BONUS: {
        2: 0.2,
        3: 0.3,
        4: 0.4,
        5: 0.6,
        6: 0.8,
        7: 1.0,
        8: 1.2,
        9: 1.5,
        10: 1.5
    },
    ACHIEVEMENTS: [
        { id: 'firstKill', name: '首殺', condition: { type: 'kills', value: 1 }, icon: '⚔️' },
        { id: 'hundredKill', name: '百殺', condition: { type: 'kills', value: 100 }, icon: '💯' },
        { id: 'thousandKill', name: '千殺', condition: { type: 'kills', value: 1000 }, icon: '💀' },
        { id: 'survive5min', name: '存活時間 5分', condition: { type: 'time', value: 300 }, icon: '⏱️' },
        { id: 'survive10min', name: '存活時間 10分', condition: { type: 'time', value: 600 }, icon: '⏱️' },
        { id: 'survive20min', name: '存活時間 20分', condition: { type: 'time', value: 1200 }, icon: '⏱️' },
        { id: 'bossKill1', name: 'Boss擊殺 1', condition: { type: 'bossKills', value: 1 }, icon: '👹' },
        { id: 'bossKill5', name: 'Boss擊殺 5', condition: { type: 'bossKills', value: 5 }, icon: '👹' },
        { id: 'bossKill10', name: 'Boss擊殺 10', condition: { type: 'bossKills', value: 10 }, icon: '👹' },
        { id: 'wave5', name: '波次 5', condition: { type: 'wave', value: 5 }, icon: '🌊' },
        { id: 'wave10', name: '波次 10', condition: { type: 'wave', value: 10 }, icon: '🌊' },
        { id: 'wave20', name: '波次 20', condition: { type: 'wave', value: 20 }, icon: '🌊' },
        { id: 'level5', name: '等級 5', condition: { type: 'level', value: 5 }, icon: '⭐' },
        { id: 'level10', name: '等級 10', condition: { type: 'level', value: 10 }, icon: '⭐' },
        { id: 'level20', name: '等級 20', condition: { type: 'level', value: 20 }, icon: '⭐' },
        { id: 'games10', name: '游戲次数 10', condition: { type: 'games', value: 10 }, icon: '🎮' },
        { id: 'games50', name: '游戲次数 50', condition: { type: 'games', value: 50 }, icon: '🎮' },
        { id: 'hell5min', name: '地狱模式存活 5分', condition: { type: 'hellTime', value: 300 }, icon: '🔥' },
        { id: 'hellWave10', name: '地狱模式波次 10', condition: { type: 'hellWave', value: 10 }, icon: '🔥' }
    ],
    DIFFICULTY: {
        normal: {
            spawnRateMultiplier: 1.0,
            hpMultiplier: 1.0,
            damageMultiplier: 1.0,
            label: '普通',
            icon: ''
        },
        hard: {
            spawnRateMultiplier: 1.5,
            hpMultiplier: 1.5,
            damageMultiplier: 1.5,
            label: '困難',
            icon: ''
        },
        hell: {
            spawnRateMultiplier: 2.0,
            hpMultiplier: 2.0,
            damageMultiplier: 2.0,
            label: '地狱',
            icon: '🔥'
        }
    },
    EXP_TO_LEVEL: (level) => level * 20
};
