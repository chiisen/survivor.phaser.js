# survivor.phaser.js 功能擴充設計規格

**日期：** 2025-05-05
**版本：** 1.0
**狀態：** 待實作

---

## 一、專案概述

### 1.1 背景

本專案為類倖存者（Survivor-like）網頁遊戲，使用 **Phaser.js** 框架開發（而非 PRD.md 描述的純 Canvas API）。現有代碼已實作核心功能（玩家、敵人、波次、音效），需擴充14+功能以符合 PRD 完整規格。

### 1.2 現況分析

**已完成功能：**
- ✅ 玩家移動、盔甲戰士外觀、自動射擊、揮劍動畫
- ✅ 4種敵人（NORMAL/FAST/TANK/RANGED）+ Boss
- ✅ 波次系統、連殺系統、經驗值、天賦（8種）
- ✅ 音效、背景音樂、暫停、UI

**待實作功能：**
- ❌ 敵人類型擴展（精英/分裂/爆炸/隱形）
- ❌ Boss 多階段狂暴模式
- ❌ 護盾系統、視野遮罩、Q键终极技能、暴击系统
- ❌ 成就系統、排行榜 TOP 10、存檔系統
- ❌ 階段性難度、遊戲開始畫面
- ❌ 天賦擴展（8→14種）、連殺經驗加成

---

## 二、架構設計

### 2.1 Phaser.js 最佳實踐

本設計遵循 Phaser.js 官方推薦架構：

- **Scene 系統：** 使用多 Scene 管理遊戲流程（StartScene/GameScene/GameOverScene）
- **GameObjects.Container：** 將複雜實體（Player/Boss）拆分為可重用類別
- **Group：** 管理同類實體（enemies/projectiles/expOrbs）
- **Manager：** 管理全局系統（Achievement/Storage/Wave）

### 2.2 檔案結構

```
js/
├── main.js                      # 入口（不變）
├── constants.js                 # 所有常量（ENEMY/TALENTS/ACHIEVEMENTS/DIFFICULTY）
├── scenes/
│   ├── BootScene.js             # 載入資源 + 階段性難度選擇
│   ├── StartScene.js            # 遊戲開始畫面（新增）
│   ├── GameScene.js             # 主遊戲場景（核心邏輯）
│   ├── UIScene.js               # UI渲染（擴充）
│   └── GameOverScene.js         # 遊戲結束畫面（新增，含排行榜）
├── entities/
│   ├── Player.js                # 玩家類別（新增護盾、暴击、Q技能）
│   ├── Enemy.js                 # 敵人基類（新增射擊、分裂邏輯）
│   ├── Boss.js                  # Boss類別（新增多階段狂暴）
│   ├── Projectile.js            # 投射物類別（新增暴击特效）
│   ├── ExpOrb.js                # 經驗球類別
│   ├── Shield.js                # 護盾實體（新增）
│   ├── EliteEnemy.js            # 精英敵人（新增）
│   ├── SplitEnemy.js            # 分裂敵人（新增）
│   ├── ExplosiveEnemy.js        # 爆炸敵人（新增）
│   ├── InvisibleEnemy.js        # 隱形敵人（新增）
│   └── ChainKillDisplay.js      # 連殺顯示（新增經驗加成）
└── managers/
│   ├── WaveManager.js           # 波次管理（擴充Boss多階段）
│   ├── AchievementManager.js    # 成就系統
│   ├── StorageManager.js        # 存檔 + 排行榜
│   ├── VisibilityManager.js     # 視野遮罩
│   ├── DifficultyManager.js     # 階段性難度
│   ├── TalentManager.js         # 天賦系統（擴充14種）
│   ├── AudioManager.js          # 音效管理（從 GameScene 抽出）
│   └ ChainKillManager.js        # 連殺系統（新增經驗加成）
└── utils/
│   ├── math.js                  # 數學工具（distanceSquared）
│   └ random.js                  # 隨機工具
```

### 2.3 Scene 流程圖

```
BootScene（載入）→ StartScene（開始畫面）→ GameScene（遊戲）↔ UIScene（UI）
                                                              ↓
                                                        GameOverScene（結束）
                                                              ↓
                                                        StartScene（重玩）
```

---

## 三、功能規格

### 3.1 敵人類型擴展（Batch 1）

#### 3.1.1 精英敵人（Elite）

**外觀：**
- 金色光環 + 藍色護盾
- 需先破盾才能傷害本體

**屬性：**
- 血量：5（本體）+ 20（護盾）
- 速度：60 px/秒
- 傷害：15
- 經驗值：50
- 出現時間：90秒後

**實作：**
- `EliteEnemy.js` 繼承 `Enemy.js`
- `Shield.js` 管理護盾HP
- `ShieldBreakEffect.js` 警盾破碎特效（藍色碎片爆散）

#### 3.1.2 分裂敵人（Split）

**外觀：**
- 綠色圓形怪物 + 分裂標記

**屬性：**
- 血量：2
- 速度：70 px/秒
- 傷害：10
- 經驗值：20
- 出現時間：120秒後

**特殊邏輯：**
- 死亡時分裂成2個小型敵人（半徑 10px）
- 觸發周圍80px內分裂敵人鏈式分裂
- 分裂特效：綠色光環擴散 + 粒子爆散

**實作：**
- `SplitEnemy.js` 繼承 `Enemy.js`
- `SplitEffect.js` 分裂特效

#### 3.1.3 爆炸敵人（Explosive）

**外觀：**
- 橙色圓形怪物 + 爆炸標記

**屬性：**
- 血量：1
- 速度：50 px/秒
- 傷害：5（碰撞）+ 30（爆炸）
- 經驗值：15
- 出現時間：150秒後

**特殊邏輯：**
- 死亡時對範圍內玩家造成爆炸傷害（範圍 60px）

**實作：**
- `ExplosiveEnemy.js` 繼承 `Enemy.js`

#### 3.1.4 隱形敵人（Invisible）

**外觀：**
- 半透明灰色怪物（alpha 0.3）

**屬性：**
- 血量：2
- 速度：80 px/秒
- 傷害：12
- 經驗值：25
- 出現時間：180秒後

**特殊邏輯：**
- 初始半透明（alpha 0.3）
- 受擊後現形（alpha 1.0）1秒

**實作：**
- `InvisibleEnemy.js` 繼承 `Enemy.js`

#### 3.1.5 敵人權重系統

**實作：**
- `constants.js` 定義 `ENEMY_SPAWN_WEIGHTS`
- `WaveManager.js` 根據遊戲時間動態調整權重

**權重表：**
```javascript
ENEMY_SPAWN_WEIGHTS: {
    NORMAL:   { base: 100, timeMultipliers: { 0: 1.0, 30: 0.8, 60: 0.6 } },
    FAST:     { base: 0,   timeMultipliers: { 30: 30, 60: 40 } },
    TANK:     { base: 0,   timeMultipliers: { 60: 25, 120: 30 } },
    RANGED:   { base: 0,   timeMultipliers: { 45: 20, 90: 25 } },
    ELITE:    { base: 0,   timeMultipliers: { 90: 15, 150: 20 } },
    SPLIT:    { base: 0,   timeMultipliers: { 120: 10, 180: 15 } },
    EXPLOSIVE: { base: 0,  timeMultipliers: { 150: 8, 210: 12 } },
    INVISIBLE: { base: 0,  timeMultipliers: { 180: 5, 240: 10 } }
}
```

---

### 3.2 Boss 多階段狂暴模式（Batch 1）

#### 3.2.1 Boss 出場特效

**實作：**
- `BossSpawnEffect.js` 紅色光環擴散 + 震動效果
- `UIScene.js` Boss波警告公告

#### 3.2.2 Boss 屬性（擴充）

**基礎屬性：**
- 體型：半徑 35px（最大）
- 血量：50HP
- 移速：25 px/秒
- 傷害：30
- 經驗值：100
- 射擊：每 1.5秒發射紫色子彈

**多階段邏輯：**

| 階段 | HP門檻 | 技能 |
|------|--------|------|
| Phase 1 | 100% HP | 基礎射擊（1方向） |
| Phase 2 | ≤70% HP | 4方向射擊 + 速度加快 |
| Phase 3 | ≤40% HP | 8方向射擊 + 召唤精英小怪 + 速度最快 |

**實作：**
- `Boss.js` 管理 `phase`、`phaseThresholds`、`isEnraged`
- `BossPhaseManager.js` 階段轉換邏輯

#### 3.2.3 Boss 死亡特效

**實作：**
- `BossDeathEffect.js` 多重粒子爆散 + 光環擴散 + 閃電效果

---

### 3.3 護盾系統（Batch 2）

#### 3.3.1 護盾屬性

- **初始護盾：** 0（需透過天賦「護盾强化」獲得）
- **護盾上限：** 50（可透過天賦提升）
- **護盾回復：** 休息時間自動回復至满值

#### 3.3.2 護盾 UI

- **位置：** HP 條上方
- **顏色：** 藍色半透明
- **顯示：** 「護盾: 20/50」

#### 3.3.3 實作

- `Shield.js` 管理護盾HP + 繪製護盾UI
- `Player.js` `takeDamage()` 方法優先使用護盾吸收傷害
- `UIScene.js` 繪製護盾UI（HP條上方）

---

### 3.4 視野遮罩（Batch 2）

#### 3.4.1 效果

- 玩家周圍清晰可見（半徑 200px）
- 視野外深色模糊（戰爭迷霧）

#### 3.4.2 實作

- `VisibilityManager.js` 使用 `Phaser.GameObjects.Graphics`
- 繪製深色覆蓋（`rgba(0, 0, 0, 0.6)`）
- 清除玩家周圍區域（可視範圍）

---

### 3.5 Q键终极技能（Batch 2）

#### 3.5.1 屬性

- **傷害：** 玩家攻擊力 × 10
- **冷卻：** 30秒
- **效果：** 全屏攻擊，對所有敵人造成傷害

#### 3.5.2 實作

- `Player.js` `useUltimateSkill()` 方法
- `UIScene.js` 顯示冷卻狀態（右上角）

---

### 3.6 暴击系统（Batch 2）

#### 3.6.1 属性

- **暴击率：** 5%（可透過天賦提升）
- **暴击倍率：** 2.0（可透過天賦提升）

#### 3.6.2 視覺特效

- 暴击子彈顯示紅色 + 金色光環
- 暴击傷害數字顯示金色 + 外框描邊

#### 3.6.3 實作

- `Player.js` `calculateDamage()` 方法
- `Projectile.js` `draw(isCrit)` 方法
- `DamageNumber.js` 暴击特效

---

### 3.7 成就系統（Batch 3）

#### 3.7.1 成就列表（19個）

| 成就名稱 | 觸發條件 | 描述 |
|---------|---------|------|
| 首殺 | 擊殺 1隻敵人 | 第一次擊殺敵人 |
| 百殺 | 擊殺 100隻敵人 | 擊殺100隻敵人 |
| 千殺 | 擊殺 1000隻敵人 | 擊殺1000隻敵人 |
| 存活時間 5分 | 存活 5分鐘 | 存活5分鐘 |
| 存活時間 10分 | 存活 10分鐘 | 存活10分鐘 |
| 存活時間 20分 | 存活 20分鐘 | 存活20分鐘 |
| Boss擊殺 1 | 擊殺 1隻Boss | 第一次擊殺Boss |
| Boss擊殺 5 | 擊殺 5隻Boss | 擊殺5隻Boss |
| Boss擊殺 10 | 擊殺 10隻Boss | 擊殺10隻Boss |
| 波次 5 | 完成第5波 | 完成第5波 |
| 波次 10 | 完成第10波 | 完成第10波 |
| 波次 20 | 完成第20波 | 完成第20波 |
| 等級 5 | 达到等級5 | 达到等級5 |
| 等級 10 | 达到等級10 | 达到等級10 |
| 等級 20 | 达到等級20 | 达到等級20 |
| 游戏次数 10 | 游玩 10次 | 游玩10次 |
| 游戏次数 50 | 游玩 50次 | 游玩50次 |
| 地狱模式存活 5分 | 地狱模式存活 5分鐘 | 地狱模式存活5分鐘 |
| 地狱模式波次 10 | 地狱模式完成第10波 | 地狱模式完成第10波 |

#### 3.7.2 实作

- `constants.js` 定義 `ACHIEVEMENTS`
- `AchievementManager.js` 管理 `check()`、`unlockAchievement()`
- `StorageManager.js` 儲存已解锁成就
- `UIScene.js` 成就通知動畫（2秒後消失）

---

### 3.8 排行榜 TOP 10（Batch 3）

#### 3.8.1 功能

- **TOP 10 排行榜：** 顯示前10名最高成绩
- **預設關閉：** 点击按钮展開
- **排序依據：** 存活時間 + 等級 + 擊殺數

#### 3.8.2 排行榜顯示

| 排名 | 等級 | 存活時間 | 擊殺數 | Boss擊殺 |
|------|------|---------|-------|---------|
| 1 | Lv.20 | 20分30秒 | 500 | 5 |
| 2 | Lv.15 | 15分20秒 | 300 | 3 |

#### 3.8.3 实作

- `StorageManager.js` 管理 `getLeaderboard()`
- `GameOverScene.js` 顯示排行榜 TOP 10

---

### 3.9 存檔系統（Batch 3）

#### 3.9.1 储存項目

| 項目 | 描述 | 類型 |
|------|------|------|
| highestLevel | 最高达成等級 | 整數 |
| longestTime | 最長存活時間（秒） | 整數 |
| totalKills | 總擊殺數（累積所有遊戲） | 整數 |
| highestWave | 最高波次 | 整數 |
| totalGames | 總遊戲次数 | 整數 |
| bossesKilled | Boss擊殺總數 | 整數 |
| achievements | 已解锁成就 | 陣列 |
| leaderboard | 排行榜 TOP 10 | 陣列 |

#### 3.9.2 实作

- `StorageManager.js` 使用 `localStorage`
- JSON 序列化（key: `survivor_phaser_stats`）
- 错误处理：localStorage 失效時静默失败

---

### 3.10 階段性難度（Batch 4）

#### 3.10.1 难度模式

| 难度 | 敵人生成速度 | 敵人血量倍率 | 敵人傷害倍率 | 描述 |
|------|-------------|-------------|-------------|------|
| **普通** | 1.0x | 1.0x | 1.0x | 預設難度 |
| **困難** | 1.5x | 1.5x | 1.5x | 敵人更快更強 |
| **地狱** | 2.0x | 2.0x | 2.0x | 极限挑戰 |

#### 3.10.2 实作

- `constants.js` 定義 `DIFFICULTY`
- `DifficultyManager.js` 管理難度倍率
- `StartScene.js` 难度選擇按鈕

---

### 3.11 遊戲開始畫面（Batch 4）

#### 3.11.1 功能

- **標題：** 「Survivor.js」
- **操作說明：** WASD移動、ESC暫停、Q技能
- **難度選擇：** 普通/困難/地狱
- **歷史紀錄：** 可展開排行榜 TOP 10
- **開始按鈕：** 点击後進入 GameScene

#### 3.11.2 实作

- `StartScene.js` 管理開始畫面
- `BootScene.js` 跳轉至 StartScene

---

### 3.12 天賦擴展（Batch 5）

#### 3.12.1 天賦列表（14種）

| 天賦名稱 | 效果 | 圖示 |
|---------|------|------|
| 生命強化 | 最大生命值 +20 | ❤️ |
| 疾風步 | 移動速度 +30 | 💨 |
| 磁力手套 | 拾取範圍 +30 | 🧲 |
| 鷹眼 | 攻擊範圍 +50 | 👁️ |
| 急速射擊 | 射擊間隔 -80ms | ⚡ |
| 魔力增幅 | 傷害 +1 | ✨ |
| 子彈加速 | 子彈速度 +100 | 🚀 |
| 多重射擊 | 同時發射 +1 顆子彈 | 🎯 |
| **暴击率（新增）** | 暴击率 +5% | 💥 |
| **暴击傷害（新增）** | 暴击傷害 +50% | 💢 |
| **吸血（新增）** | 擊殺回復 1HP | 🩸 |
| **护盾强化（新增）** | 護盾上限 +10 | 🛡️ |
| **经验加成（新增）** | 经验值 +20% | 📚 |
| **护甲（新增）** | 傷害減免 10% | 🛡️ |

#### 3.12.2 实作

- `constants.js` 擴充 `TALENTS`（8→14種）
- `TalentManager.js` 管理天賦效果

---

### 3.13 連殺經驗加成（Batch 5）

#### 3.13.1 加成表

| 連殺數 | 经验加成 |
|-------|---------|
| 2 kills | +20% |
| 3 kills | +30% |
| 4 kills | +40% |
| 5 kills | +60% |
| 6 kills | +80% |
| 7 kills | +100% |
| 8 kills | +120% |
| 9 kills | +150% |
| 10 kills | +150%（上限） |

#### 3.13.2 实作

- `constants.js` 定義 `CHAIN_KILL_EXP_BONUS`
- `ChainKillManager.js` 管理經驗加成計算

---

## 四、實作計畫

### 4.1 批次實作順序

| 批次 | 功能範圍 | 预估代碼行數 | 预估時間 |
|------|---------|------------|---------|
| **Batch 1** | 敵人擴展 + Boss多階段 | ~800行 | 2-3天 |
| **Batch 2** | 護盾 + 視野 + Q技能 + 暴击 | ~600行 | 1-2天 |
| **Batch 3** | 成就 + 排行榜 + 存檔 | ~500行 | 1-2天 |
| **Batch 4** | 階段性難度 + 遊戲開始畫面 | ~400行 | 1天 |
| **Batch 5** | 天賦擴展 + 連殺經驗加成 | ~200行 | 0.5天 |

**總計：** ~2500行代碼，5-8天開發時間

### 4.2 測試檢核表

#### Batch 1 測試

- ✅ 精英敵人護盾可正常破盾
- ✅ 分裂敵人可正常分裂
- ✅ 爆炸敵人死亡時可正常爆炸傷害玩家
- ✅ 隱形敵人受擊後可現形
- ✅ Boss 多階段可正常轉換
- ✅ Boss 第三階段可召喚精英小怪

#### Batch 2 測試

- ✅ 護盾可正常吸收傷害
- ✅ 視野遮罩可正常顯示
- ✅ Q技能可正常釋放（冷卻30秒）
- ✅ 暴击可正常觸發（紅色子弹 + 金色光環）

#### Batch 3 測試

- ✅ 成就可正常解锁
- ✅ 排行榜 TOP 10 可正常顯示
- ✅ 存檔可正常保存/載入

#### Batch 4 測試

- ✅ 階段性難度可正常切換
- ✅ 遊戲開始畫面可正常顯示

#### Batch 5 測試

- ✅ 14種天賦可正常選擇
- ✅ 連殺經驗加成可正常計算

---

## 五、風險與限制

### 5.1 已知風險

1. **localStorage 限制：** 排行榜 TOP 10 可能因 localStorage 失效而無法保存（已做錯誤處理）
2. **Boss 多階段複雜度：** 第三階段召喚精英小怪可能造成性能壓力（需限制召喚數量）
3. **視野遮罩性能：** 每幀繪製大型遮罩可能影響 FPS（可降低更新頻率）

### 5.2 不實作功能

根據 PRD，「TileManager 系統」與「TilesetCleaner 工具」為**待圖集裁切完成後使用**，本次不實作。

---

## 六、參考文件

- PRD.md（完整規格）
- Phaser.js 官方文檔（https://phaser.io/docs）
- 現有代碼（GameScene.js、UIScene.js、main.js）

---

**下一步：** 呼叫 `writing-plans` 技能產生詳細實作計畫