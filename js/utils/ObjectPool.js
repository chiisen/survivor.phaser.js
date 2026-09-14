// ObjectPool: 通用物件池（重用物件以減少 GC 壓力）
// 用法：
//   const pool = new ObjectPool(() => scene.add.graphics(), null, { initialSize: 30, maxSize: 100 });
//   const obj = pool.acquire();   // 取得（自動擴容至 maxSize）
//   pool.release(obj);            // 歸還（呼叫 onRelease 清理狀態）
// 注意：附帶 Tween 的物件不適合池化（重用時舊 Tween 仍在跑），本專案僅用於子彈。
export class ObjectPool {
    constructor(factory, options = {}) {
        this.factory = factory;
        this.onRelease = options.onRelease || null;
        this.initialSize = options.initialSize ?? 30;
        this.maxSize = options.maxSize ?? 100;
        this.free = [];
        this.activeCount = 0;
        this.totalCreated = 0;

        // 統計
        this.totalRequests = 0;
        this.reuseHits = 0;
        this.peakActiveCount = 0;
        this.autoExpansions = 0;

        this.preallocate(this.initialSize);
    }

    preallocate(n) {
        for (let i = 0; i < n; i++) {
            const obj = this.factory();
            obj._pooled = true;
            obj._poolActive = false;
            if (obj.setActive) obj.setActive(false);
            if (obj.setVisible) obj.setVisible(false);
            this.free.push(obj);
            this.totalCreated++;
        }
    }

    acquire() {
        this.totalRequests++;
        let obj = this.free.pop();
        if (obj) {
            this.reuseHits++;
        } else {
            if (this.totalCreated >= this.maxSize) return null;
            obj = this.factory();
            obj._pooled = true;
            this.totalCreated++;
            this.autoExpansions++;
        }
        this.activeCount++;
        obj._poolActive = true;
        if (obj.setActive) obj.setActive(true);
        if (obj.setVisible) obj.setVisible(true);
        this.peakActiveCount = Math.max(this.peakActiveCount, this.activeCount);
        return obj;
    }

    release(obj) {
        if (!obj || !obj._poolActive) return;
        obj._poolActive = false;
        this.activeCount = Math.max(0, this.activeCount - 1);
        if (this.onRelease) this.onRelease(obj);
        if (obj.setActive) obj.setActive(false);
        if (obj.setVisible) obj.setVisible(false);
        if (this.free.length < this.maxSize) {
            this.free.push(obj);
        } else if (obj.destroy) {
            obj.destroy();
        }
    }

    getStats() {
        return {
            poolSize: this.totalCreated,
            free: this.free.length,
            active: this.activeCount,
            peakActiveCount: this.peakActiveCount,
            hitRate: this.totalRequests > 0 ? this.reuseHits / this.totalRequests : 0,
            efficiency: this.totalCreated > 0 ? this.activeCount / this.totalCreated : 0,
            autoExpansions: this.autoExpansions
        };
    }
}
