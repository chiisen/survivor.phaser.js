# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **修復第一波立即過關 Bug**：波次完成檢查缺少前置條件，導致第一帧 update 時 `enemies` group 空陣列即判定休息。現已加入條件 `waveEnemiesSpawned >= waveEnemiesTotal`，確保生成所有預期敵人後才判定波次結束。
- 修復連殺系統（Chain Kill）導致的無限遞迴（Maximum call stack size exceeded）。在殺死敵人時立即將其標記為不活躍，防止在同一幀內重複觸發連鎖反應。
- 修正 `index-standalone.html` 與 `js/scenes/GameScene.js` 中相同的邏輯錯誤。
- **修復 Boss 多方向子彈同向 Bug**：`createEnemyProjectile` 誤將 `phaseDirections` 整陣列遍歷，除以當階段數量後角度重合。改為依階段數量均分圓周並以玩家方向為基準。
- **連殺遞迴改佇列迭代**：`killEnemy` 內以 BFS 佇列處理連帶擊殺，消除深遞迴堆疊溢出風險；`checkChainKill` 保留空殼避免舊呼叫。
- **修復結算新紀錄永不顯示**：`showGameOver` 先判定再存檔，避免存檔後比對恆為 false；重開保留難度參數；修正暫停/結算按鈕座標不一致。

### Added
- 結算畫面排行榜 TOP 5（左：本次/歷史，右：前5名等級/時間/擊殺）。
- Q 技能冷卻 HUD（右上計時器下方即時顯示就緒/冷卻秒數）。
- 暫停畫面音量調整（主音量/音效/背景 ±10%，BGM 即時生效）。
- 成就即時觸發：擊殺/Boss/等級/波次/存活時間於遊戲中即時檢查，結算補 `games` 次數。
- 分裂敵人 80px 同類鏈式分裂；Boss 出場紅金雙環+震動+警告、死亡多重爆炸+金環擴散。

### Refactored
- 新增 `js/constants.js` 收容遊戲常數，`main.js` 改為轉出口（既有引用零修改）。
- 新增 `js/managers/AudioManager.js` 接管音效/BGM/音量，`GameScene`/`UIScene` 改為委派。
- 新增 `js/utils/ObjectPool.js`（子彈池化，附 Tween 物件不池化）與 `js/utils/SpatialGrid.js`（100px 網格，碰撞/索敵/連殺查詢加速，唯讀不改語意，維持多重命中原行為）。
- 新增 `js/utils/GameLogger.js`（Ctrl+Shift+L 切換等級）、`js/utils/DebugOverlay.js`（Ctrl+D：FPS/記憶體/實體/網格/冷卻/池統計+自動警告）、`js/utils/GameValidator.js`（Ctrl+Shift+V 硬斷言）；Ctrl+Shift+P 輸出池統計。
- 新增 `js/renderers/PlayerRenderer.js` 與 `js/renderers/EnemyRenderer.js`（純繪製函式逐字搬移），`GameScene` 縮減約 340 行。

### Removed
- 刪除過期 `index-standalone.html`（舊 5 敵人單檔快照，與模組版脫鉤且曾重複同類 Bug），以 `index.html` 模組版為唯一入口。

### Docs
- `PRD.md §9` 加註實際選擇：專案已遷移至 Phaser.js 3.70，原純 Canvas 結論保留為決策歷史。
