// SpatialGrid: 空間網格分割，將碰撞檢測從 O(n×m) 降至 O(n×k)
// 每幀重建（clear + insert），查詢僅回傳鄰近格子候選，呼叫端仍需做精確距離判斷。
// 語意：唯讀加速，不改變任何遊戲邏輯（死亡物件以 active=false 跳過）。
export class SpatialGrid {
    constructor(cellSize = 100) {
        this.cellSize = cellSize;
        this.cells = new Map();
        this.totalEntities = 0;
    }

    _key(cx, cy) {
        return cx + ':' + cy;
    }

    clear() {
        this.cells.clear();
        this.totalEntities = 0;
    }

    insert(obj) {
        const cx = Math.floor(obj.x / this.cellSize);
        const cy = Math.floor(obj.y / this.cellSize);
        const key = this._key(cx, cy);
        let cell = this.cells.get(key);
        if (!cell) {
            cell = [];
            this.cells.set(key, cell);
        }
        cell.push(obj);
        this.totalEntities++;
    }

    // 回傳圓 (x, y, radius) 覆蓋格子的所有物件（含圓外候選，呼叫端需再做距離檢查）
    query(x, y, radius) {
        const minCx = Math.floor((x - radius) / this.cellSize);
        const maxCx = Math.floor((x + radius) / this.cellSize);
        const minCy = Math.floor((y - radius) / this.cellSize);
        const maxCy = Math.floor((y + radius) / this.cellSize);
        const out = [];
        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cy = minCy; cy <= maxCy; cy++) {
                const cell = this.cells.get(this._key(cx, cy));
                if (cell) {
                    for (const obj of cell) out.push(obj);
                }
            }
        }
        return out;
    }

    getStats() {
        return {
            cellSize: this.cellSize,
            cellCount: this.cells.size,
            totalEntities: this.totalEntities
        };
    }
}

// 距離平方比較（避免 Math.sqrt），回傳 true 表示兩點距離 <= radius
export function withinRadius(ax, ay, bx, by, radius) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy <= radius * radius;
}
