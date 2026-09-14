// EnemyRenderer: 9 種敵人純繪製函式（由 GameScene 抽離，無遊戲狀態依賴）
export class EnemyRenderer {
    static draw(graphics, type, radius) {
        graphics.clear();

        switch (type) {
            case 'NORMAL':
                // Red body
                graphics.fillStyle(0xe74c3c, 1);
                graphics.fillCircle(0, 0, radius);
                // White eyes
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(-5, -3, 4);
                graphics.fillCircle(5, -3, 4);
                // Angry pupils
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-4, -2, 2);
                graphics.fillCircle(6, -2, 2);
                // Angry mouth
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.moveTo(-5, 5);
                graphics.lineTo(5, 5);
                graphics.strokePath();
                break;

            case 'FAST':
                // Green body (smaller)
                graphics.fillStyle(0x27ae60, 1);
                graphics.fillCircle(0, 0, radius);
                // Horn
                graphics.fillStyle(0x1e8449, 1);
                graphics.fillTriangle(-4, -radius, 0, -radius - 8, 4, -radius);
                // Eyes
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(-3, -2, 3);
                graphics.fillCircle(3, -2, 3);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-2, -1, 1.5);
                graphics.fillCircle(4, -1, 1.5);
                break;

            case 'TANK':
                // Grey large body
                graphics.fillStyle(0x7f8c8d, 1);
                graphics.fillCircle(0, 0, radius);
                // Outer ring
                graphics.lineStyle(3, 0x95a5a6, 1);
                graphics.strokeCircle(0, 0, radius - 2);
                // Red eyes
                graphics.fillStyle(0xe74c3c, 1);
                graphics.fillCircle(-6, -4, 5);
                graphics.fillCircle(6, -4, 5);
                // Big mouth
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillEllipse(0, 6, 12, 6);
                break;

            case 'RANGED':
                // Purple body
                graphics.fillStyle(0x9b59b6, 1);
                graphics.fillCircle(0, 0, radius);
                // Circle marker on top
                graphics.fillStyle(0x8e44ad, 1);
                graphics.fillCircle(0, -radius + 3, 4);
                // Yellow eyes
                graphics.fillStyle(0xf1c40f, 1);
                graphics.fillCircle(-4, -2, 3);
                graphics.fillCircle(4, -2, 3);
                // Arc mouth
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.beginPath();
                graphics.arc(0, 2, 5, 0, Math.PI, false);
                graphics.strokePath();
                break;

            case 'ELITE':
                graphics.fillStyle(0xf1c40f, 1);
                graphics.fillCircle(0, 0, radius);
                graphics.lineStyle(3, 0xf39c12, 1);
                graphics.strokeCircle(0, 0, radius + 3);
                graphics.fillStyle(0x3498db, 0.8);
                graphics.strokeCircle(0, 0, radius - 2);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-4, -3, 3);
                graphics.fillCircle(4, -3, 3);
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.beginPath();
                graphics.arc(0, 3, 4, 0, Math.PI, false);
                graphics.strokePath();
                break;

            case 'SPLIT':
                graphics.fillStyle(0x2ecc71, 1);
                graphics.fillCircle(0, 0, radius);
                graphics.fillStyle(0x27ae60, 1);
                graphics.fillCircle(0, -radius + 2, 5);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(-3, -2, 3);
                graphics.fillCircle(3, -2, 3);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-2, -1, 1.5);
                graphics.fillCircle(4, -1, 1.5);
                break;

            case 'EXPLOSIVE':
                graphics.fillStyle(0xe67e22, 1);
                graphics.fillCircle(0, 0, radius);
                graphics.fillStyle(0xd35400, 1);
                graphics.fillCircle(0, -radius + 3, 6);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(-4, -3, 3);
                graphics.fillCircle(4, -3, 3);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-3, -2, 1.5);
                graphics.fillCircle(5, -2, 1.5);
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.moveTo(-5, 4);
                graphics.lineTo(5, 4);
                graphics.strokePath();
                break;

            case 'INVISIBLE':
                graphics.fillStyle(0x95a5a6, 1);
                graphics.fillCircle(0, 0, radius);
                graphics.lineStyle(2, 0x7f8c8d, 0.5);
                graphics.strokeCircle(0, 0, radius);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-4, -3, 3);
                graphics.fillCircle(4, -3, 3);
                graphics.lineStyle(2, 0x2c3e50, 1);
                graphics.moveTo(-4, 3);
                graphics.lineTo(4, 3);
                graphics.strokePath();
                break;

            case 'BOSS':
                // Dark red body
                graphics.fillStyle(0xc0392b, 1);
                graphics.fillCircle(0, 0, radius);
                // Crown
                graphics.fillStyle(0xf1c40f, 1);
                graphics.fillTriangle(-12, -radius, -6, -radius - 12, 0, -radius);
                graphics.fillTriangle(0, -radius, 6, -radius - 12, 12, -radius);
                graphics.fillTriangle(-6, -radius - 12, 0, -radius - 16, 6, -radius - 12);
                // Red glow
                graphics.lineStyle(4, 0xe74c3c, 0.5);
                graphics.strokeCircle(0, 0, radius + 4);
                // Angry eyes
                graphics.fillStyle(0xf1c40f, 1);
                graphics.fillCircle(-8, -5, 6);
                graphics.fillCircle(8, -5, 6);
                graphics.fillStyle(0x2c3e50, 1);
                graphics.fillCircle(-7, -4, 3);
                graphics.fillCircle(9, -4, 3);
                // Unhappy mouth
                graphics.lineStyle(3, 0x2c3e50, 1);
                graphics.beginPath();
                graphics.arc(0, 8, 8, Math.PI, 0, true);
                graphics.strokePath();
                break;
        }
    }

