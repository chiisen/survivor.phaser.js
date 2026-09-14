// GameLogger: 分級 Console 日誌（ERROR → INFO → DEBUG 循環切換）
export class GameLogger {
    static LEVELS = { ERROR: 0, INFO: 1, DEBUG: 2 };
    static ORDER = ['ERROR', 'INFO', 'DEBUG'];

    constructor(level = 'INFO') {
        this.level = level;
    }

    setLevel(level) {
        if (GameLogger.LEVELS[level] !== undefined) this.level = level;
    }

    cycleLevel() {
        const i = GameLogger.ORDER.indexOf(this.level);
        this.level = GameLogger.ORDER[(i + 1) % GameLogger.ORDER.length];
        return this.level;
    }

    _enabled(level) {
        return GameLogger.LEVELS[level] <= GameLogger.LEVELS[this.level];
    }

    error(...args) {
        if (this._enabled('ERROR')) console.error('[Game]', ...args);
    }

    info(...args) {
        if (this._enabled('INFO')) console.info('[Game]', ...args);
    }

    debug(...args) {
        if (this._enabled('DEBUG')) console.debug('[Game]', ...args);
    }
}
