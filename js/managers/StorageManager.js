export class StorageManager {
    constructor() {
        this.key = 'survivor_phaser_stats';
    }

    load() {
        try {
            const data = localStorage.getItem(this.key);
            if (data) return this.withDefaults(JSON.parse(data));
            const migrated = this.migrateLegacy();
            if (migrated) {
                localStorage.setItem(this.key, JSON.stringify(migrated));
                return migrated;
            }
            return this.getDefaultStats();
        } catch (e) {
            console.warn('localStorage 失效', e);
            return this.getDefaultStats();
        }
    }

    withDefaults(data) {
        return Object.assign(this.getDefaultStats(), data);
    }

    // 一次性遷移舊 key（survivor_js_stats，UIScene 時代遺留），成功後清除舊 key
    migrateLegacy() {
        try {
            const raw = localStorage.getItem('survivor_js_stats');
            if (!raw) return null;
            const old = JSON.parse(raw);
            const merged = this.getDefaultStats();
            for (const k of ['highestLevel', 'longestTime', 'totalKills', 'highestWave', 'totalGames', 'bossesKilled']) {
                if (typeof old[k] === 'number') merged[k] = old[k];
            }
            localStorage.removeItem('survivor_js_stats');
            return merged;
        } catch (e) {
            return null;
        }
    }

    getDefaultStats() {
        return {
            highestLevel: 1,
            longestTime: 0,
            totalKills: 0,
            highestWave: 1,
            totalGames: 0,
            bossesKilled: 0,
            achievements: [],
            leaderboard: []
        };
    }

    save(stats) {
        try {
            const existing = this.load();

            if (stats.level > existing.highestLevel) existing.highestLevel = stats.level;
            if (stats.time > existing.longestTime) existing.longestTime = stats.time;
            if (stats.wave > existing.highestWave) existing.highestWave = stats.wave;

            existing.totalKills += stats.kills;
            existing.bossesKilled += stats.bossKills;
            existing.totalGames++;

            existing.leaderboard.push({
                level: stats.level,
                time: stats.time,
                kills: stats.kills,
                bossKills: stats.bossKills,
                wave: stats.wave,
                difficulty: stats.difficulty,
                date: new Date().toISOString()
            });

            existing.leaderboard.sort((a, b) => b.time - a.time || b.level - a.level);
            existing.leaderboard = existing.leaderboard.slice(0, 10);

            localStorage.setItem(this.key, JSON.stringify(existing));
        } catch (e) {
            console.warn('存檔失敗', e);
        }
    }

    saveAchievement(achievementId) {
        try {
            const data = this.load();
            if (!data.achievements.includes(achievementId)) {
                data.achievements.push(achievementId);
                localStorage.setItem(this.key, JSON.stringify(data));
            }
        } catch (e) {
            console.warn('成就存檔失敗', e);
        }
    }

    getLeaderboard() {
        return this.load().leaderboard;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins + '分' + secs + '秒';
    }
}