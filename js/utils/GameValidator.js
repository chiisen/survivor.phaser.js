// GameValidator: 硬斷言檢查（Ctrl+Shift+V 啟用），回傳錯誤訊息陣列
// 設計為寬鬆比對：網格在碰撞後可能含有當幀已擊殺殘留，只斷言「網格遺漏」方向。
export class GameValidator {
    static validate(scene) {
        const errors = [];
        if (!scene.player || !scene.enemies || !scene.enemyGrid) return errors;

        // Phase 1: 網格實體數不得少於存活敵人數
        const activeEnemies = scene.enemies.getChildren().filter(e => e.active).length;
        const gridTotal = scene.enemyGrid.getStats().totalEntities;
        if (gridTotal < activeEnemies) {
            errors.push('Phase 1失敗：Grid實體數(' + gridTotal + ') < 存活敵人(' + activeEnemies + ')');
        }

        // Phase 2: fireCooldown 必須是有效非負數
        const cd = scene.player.fireCooldown;
        if (typeof cd !== 'number' || Number.isNaN(cd) || cd < 0) {
            errors.push('Phase 2失敗：fireCooldown異常(' + cd + ')');
        }

        // Phase 3: 有存活敵人時，網格查詢不得為空
        if (activeEnemies > 0) {
            const first = scene.enemies.getChildren().find(e => e.active);
            if (first) {
                const found = scene.enemyGrid.query(first.x, first.y, 1).filter(e => e.active).length;
                if (found === 0) {
                    errors.push('Phase 3失敗：碰撞檢測失效（查詢不到已知敵人）');
                }
            }
        }

        // 物件池帳務一致性
        for (const [name, pool] of [['projectilePool', scene.projectilePool], ['enemyProjectilePool', scene.enemyProjectilePool]]) {
            if (pool) {
                const s = pool.getStats();
                if (s.active < 0 || s.free + s.active !== s.poolSize) {
                    errors.push(name + '帳務異常：' + JSON.stringify(s));
                }
            }
        }

        return errors;
    }
}
