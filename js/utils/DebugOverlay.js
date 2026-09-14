// DebugOverlay: 可視化調試面板（Ctrl+D 開關，每 250ms 更新一次）
// 顯示 FPS/Memory、實體統計、網格狀態、射擊冷卻、物件池統計與自動警告。
import { GameValidator } from './GameValidator.js';

export class DebugOverlay {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        this.lastUpdate = 0;
        this.text = null;
    }

    create() {
        this.text = this.scene.add.text(10, 200, '', {
            fontSize: '12px',
            fontFamily: 'Consolas, monospace',
            color: '#00ff00',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: { x: 6, y: 6 },
            lineSpacing: 3
        }).setDepth(1000).setVisible(false);
    }

    toggle() {
        this.visible = !this.visible;
        if (this.text) this.text.setVisible(this.visible);
        return this.visible;
    }

    update(time, validatorEnabled) {
        if (!this.visible || !this.text) return;
        if (time - this.lastUpdate < 250) return;
        this.lastUpdate = time;

        const s = this.scene;
        const fps = Math.round(s.game.loop.actualFps || 0);
        const mem = (typeof performance !== 'undefined' && performance.memory)
            ? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + 'MB'
            : 'n/a';
        const count = (group) => group ? group.getChildren().filter(e => e.active !== false).length : 0;
        const grid = s.enemyGrid ? s.enemyGrid.getStats() : { cellCount: 0, totalEntities: 0 };
        const pool = s.projectilePool ? s.projectilePool.getStats() : null;
        const epool = s.enemyProjectilePool ? s.enemyProjectilePool.getStats() : null;
        const cd = s.player ? s.player.fireCooldown : -1;

        const lines = [
            'FPS:' + fps + ' MEM:' + mem,
            'P:1 E:' + count(s.enemies) + ' Exp:' + count(s.expOrbs) +
                ' EP:' + count(s.projectiles) + '+' + count(s.enemyProjectiles),
            'Grid cells:' + grid.cellCount + ' entities:' + grid.totalEntities,
            'fireCooldown:' + (typeof cd === 'number' ? cd.toFixed(0) : cd) +
                ' canFire:' + (s.player ? cd <= 0 : false),
            'Pool P active:' + (pool ? pool.active + '/' + pool.poolSize + ' hit:' + (pool.hitRate * 100).toFixed(0) + '%' : 'n/a') +
                ' EP:' + (epool ? epool.active + '/' + epool.poolSize : 'n/a'),
            'Validator:' + (validatorEnabled ? 'ON' : 'OFF') + ' Log:' + (s.logger ? s.logger.level : '?')
        ];

        const warnings = [];
        if (fps > 0 && fps < 30) warnings.push('⚠ FPS過低(' + fps + ')');
        if (count(s.enemies) > 0 && grid.totalEntities === 0) warnings.push('⚠ Grid空（碰撞將失效）');
        if (count(s.enemies) > 150) warnings.push('⚠ 敵人過多(' + count(s.enemies) + ')');
        if (validatorEnabled) {
            for (const err of GameValidator.validate(s)) warnings.push('⚠ ' + err);
        }
        if (warnings.length > 0) lines.push(warnings.join('\n'));

        this.text.setText(lines.join('\n'));
    }
}
