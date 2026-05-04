export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Show loading text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.add.text(width / 2, height / 2, '載入中...', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Create loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 + 40, 320, 30);

        // Loading progress
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x3498db, 1);
            progressBar.fillRect(width / 2 - 155, height / 2 + 45, 310 * value, 20);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Since we're using graphics, we don't need to load external assets
        // But we can create some textures here for reuse
        this.createGameTextures();
    }

    createGameTextures() {
        // Create projectile texture
        const projectileGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        projectileGraphics.fillStyle(0xf39c12, 1);
        projectileGraphics.fillCircle(8, 8, 8);
        projectileGraphics.fillStyle(0xffffff, 0.8);
        projectileGraphics.fillCircle(6, 5, 3);
        projectileGraphics.generateTexture('projectile', 16, 16);

        // Create enemy projectile texture (purple)
        const enemyProjectileGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        enemyProjectileGraphics.fillStyle(0x9b59b6, 1);
        enemyProjectileGraphics.fillCircle(6, 6, 6);
        enemyProjectileGraphics.fillStyle(0xffffff, 0.6);
        enemyProjectileGraphics.fillCircle(4, 4, 2);
        enemyProjectileGraphics.generateTexture('enemyProjectile', 12, 12);

        // Create experience orb texture
        const expGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        expGraphics.fillStyle(0x2ecc71, 1);
        expGraphics.fillCircle(10, 10, 10);
        expGraphics.fillStyle(0xffffff, 0.7);
        expGraphics.fillCircle(7, 6, 4);
        expGraphics.generateTexture('expOrb', 20, 20);

        // Create particle texture
        const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        particleGraphics.fillStyle(0xffffff, 1);
        particleGraphics.fillCircle(4, 4, 4);
        particleGraphics.generateTexture('particle', 8, 8);
    }

    create() {
        // Start game scene
        this.scene.start('GameScene');
        this.scene.start('UIScene');
    }
}