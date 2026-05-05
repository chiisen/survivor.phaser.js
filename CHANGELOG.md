# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **修復第一波立即過關 Bug**：波次完成檢查缺少前置條件，導致第一帧 update 時 `enemies` group 空陣列即判定休息。現已加入條件 `waveEnemiesSpawned >= waveEnemiesTotal`，確保生成所有預期敵人後才判定波次結束。
- 修復連殺系統（Chain Kill）導致的無限遞迴（Maximum call stack size exceeded）。在殺死敵人時立即將其標記為不活躍，防止在同一幀內重複觸發連鎖反應。
- 修正 `index-standalone.html` 與 `js/scenes/GameScene.js` 中相同的邏輯錯誤。
