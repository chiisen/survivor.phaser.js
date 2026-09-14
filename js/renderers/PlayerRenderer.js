// PlayerRenderer: 盔甲戰士純繪製函式（由 GameScene 抽離，無遊戲狀態依賴）
export class PlayerRenderer {
    static drawBody(g) {
        g.clear();

        // Body (armor)
        g.fillStyle(0x95a5a6, 1);
        g.fillRoundedRect(-12, -8, 24, 28, 4);

        // Armor details
        g.fillStyle(0x7f8c8d, 1);
        g.fillRoundedRect(-10, -6, 20, 24, 3);

        // Helmet
        g.fillStyle(0xbdc3c7, 1);
        g.fillCircle(0, -12, 14);
        g.fillStyle(0x95a5a6, 1);
        g.fillCircle(0, -12, 11);

        // Visor slit
        g.fillStyle(0x2c3e50, 1);
        g.fillRect(-6, -14, 12, 4);

        // Golden gauntlets
        g.fillStyle(0xf1c40f, 1);
        g.fillRoundedRect(-16, 8, 8, 12, 2);
        g.fillRoundedRect(8, 8, 8, 12, 2);
    }

    static drawSword(g, swingAngle = 0, isSwinging = false) {
        g.clear();

        // Sword position offset (held in right hand)
        const handOffsetX = 12;
        const handOffsetY = 10;

        // Sword swing animation
        const baseAngle = -Math.PI / 4; // -45 degrees
        const currentAngle = baseAngle + swingAngle;

        // Calculate rotated positions for sword components
        // Use Math.cos and Math.sin to rotate points
        const cos = Math.cos(currentAngle);
        const sin = Math.sin(currentAngle);

        // Helper function to rotate a point around origin
        const rotatePoint = (px, py) => {
            return {
                x: handOffsetX + px * cos - py * sin,
                y: handOffsetY + px * sin + py * cos
            };
        };

        // Sword blade (blue) - draw as rotated rectangle
        const bladeWidth = 4;
        const bladeHeight = 35;
        const bladeTop = rotatePoint(-bladeWidth / 2, -bladeHeight);
        const bladeTopRight = rotatePoint(bladeWidth / 2, -bladeHeight);
        const bladeBottomRight = rotatePoint(bladeWidth / 2, 0);
        const bladeBottomLeft = rotatePoint(-bladeWidth / 2, 0);

        g.fillStyle(0x3498db, 1);
        g.beginPath();
        g.moveTo(bladeTop.x, bladeTop.y);
        g.lineTo(bladeTopRight.x, bladeTopRight.y);
        g.lineTo(bladeBottomRight.x, bladeBottomRight.y);
        g.lineTo(bladeBottomLeft.x, bladeBottomLeft.y);
        g.closePath();
        g.fillPath();

        // Blade highlight
        const highlightTop = rotatePoint(0, -34);
        const highlightBottom = rotatePoint(0, -4);
        g.fillStyle(0x5dade2, 1);
        g.beginPath();
        g.moveTo(highlightTop.x - 1, highlightTop.y);
        g.lineTo(highlightTop.x + 1, highlightTop.y);
        g.lineTo(highlightBottom.x + 1, highlightBottom.y);
        g.lineTo(highlightBottom.x - 1, highlightBottom.y);
        g.closePath();
        g.fillPath();

        // Sword hilt (gold)
        const hiltWidth = 6;
        const hiltHeight = 8;
        const hiltTopLeft = rotatePoint(-hiltWidth / 2, 0);
        const hiltTopRight = rotatePoint(hiltWidth / 2, 0);
        const hiltBottomRight = rotatePoint(hiltWidth / 2, hiltHeight);
        const hiltBottomLeft = rotatePoint(-hiltWidth / 2, hiltHeight);

        g.fillStyle(0xf1c40f, 1);
        g.beginPath();
        g.moveTo(hiltTopLeft.x, hiltTopLeft.y);
        g.lineTo(hiltTopRight.x, hiltTopRight.y);
        g.lineTo(hiltBottomRight.x, hiltBottomRight.y);
        g.lineTo(hiltBottomLeft.x, hiltBottomLeft.y);
        g.closePath();
        g.fillPath();

        // Guard
        const guardWidth = 10;
        const guardHeight = 3;
        const guardTopLeft = rotatePoint(-guardWidth / 2, -guardHeight);
        const guardTopRight = rotatePoint(guardWidth / 2, -guardHeight);
        const guardBottomRight = rotatePoint(guardWidth / 2, 0);
        const guardBottomLeft = rotatePoint(-guardWidth / 2, 0);

        g.fillStyle(0xd4ac0d, 1);
        g.beginPath();
        g.moveTo(guardTopLeft.x, guardTopLeft.y);
        g.lineTo(guardTopRight.x, guardTopRight.y);
        g.lineTo(guardBottomRight.x, guardBottomRight.y);
        g.lineTo(guardBottomLeft.x, guardBottomLeft.y);
        g.closePath();
        g.fillPath();

        // Sword tip glow (when swinging)
        if (isSwinging) {
            const tipPos = rotatePoint(0, -36);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(tipPos.x, tipPos.y, 4);
        }
    }

