/**
 * 横版2D闯关游戏 - 使用 Phaser 3 开发
 */

const GAME_CONFIG = {
    WIDTH: 1024,
    HEIGHT: 576,
    TILE_SIZE: 32,
    GRAVITY: 800,
    PLAYER_SPEED: 250,
    JUMP_VELOCITY: -450,
    ENEMY_SPEED: 80,
    ATTACK_DAMAGE: 25,
    ATTACK_COOLDOWN: 500,
    ATTACK_RANGE: 50
};

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
            font: '20px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const percentText = this.add.text(width / 2, height / 2, '0%', {
            font: '18px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const totalSteps = 10;
        let currentStep = 0;
        
        const loadNextStep = () => {
            currentStep++;
            const progress = currentStep / totalSteps;
            percentText.setText(parseInt(progress * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x00d4ff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * progress, 30);
            
            if (currentStep >= totalSteps) {
                this.time.delayedCall(300, () => {
                    this.scene.start('GameScene');
                });
            } else {
                this.time.delayedCall(100, loadNextStep);
            }
        };
        
        loadNextStep();
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.enemies = null;
        this.platforms = null;
        this.ground = null;
        this.keys = {};
        this.score = 0;
        this.lives = 3;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.gameOver = false;
    }

    create() {
        this.createBackground();
        this.createGround();
        this.createPlatforms();
        this.createPlayer();
        this.createEnemies();
        this.createInput();
        this.createUI();
        this.createCamera();
        this.setupCollisions();
    }

    createBackground() {
        const bg1 = this.add.rectangle(
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH * 3, 
            GAME_CONFIG.HEIGHT, 
            0x0f172a
        );
        bg1.setScrollFactor(0.1);
        
        const bg2 = this.add.rectangle(
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH * 3, 
            GAME_CONFIG.HEIGHT, 
            0x1e293b
        );
        bg2.setScrollFactor(0.3);
        bg2.alpha = 0.5;
    }

    createGround() {
        const mapWidth = 40;
        const mapHeight = 18;
        const tileSize = GAME_CONFIG.TILE_SIZE;
        
        this.ground = this.physics.add.staticGroup();
        
        for (let x = 0; x < mapWidth; x++) {
            const groundY = mapHeight - 1;
            const color = x % 2 === 0 ? 0x65a30d : 0x92400e;
            
            const tile = this.add.rectangle(
                x * tileSize + tileSize / 2,
                groundY * tileSize + tileSize / 2,
                tileSize,
                tileSize,
                color
            );
            tile.setStrokeStyle(2, 0xffffff, 0.2);
            this.ground.add(tile);
        }
        
        for (let x = 0; x < mapWidth; x++) {
            const groundY = mapHeight - 2;
            const tile = this.add.rectangle(
                x * tileSize + tileSize / 2,
                groundY * tileSize + tileSize / 2,
                tileSize,
                tileSize,
                0x92400e
            );
            tile.setStrokeStyle(2, 0xffffff, 0.2);
            this.ground.add(tile);
        }
        
        this.physics.world.bounds.width = mapWidth * tileSize;
        this.physics.world.bounds.height = mapHeight * tileSize;
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();
        
        this.addPlatform(5, 12, 4);
        this.addPlatform(12, 9, 3);
        this.addPlatform(18, 12, 5);
        this.addPlatform(25, 10, 3);
        this.addPlatform(32, 13, 4);
    }

    addPlatform(startX, startY, length) {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        
        for (let i = 0; i < length; i++) {
            const tile = this.add.rectangle(
                (startX + i) * tileSize + tileSize / 2,
                startY * tileSize + tileSize / 2,
                tileSize,
                tileSize,
                0x64748b
            );
            tile.setStrokeStyle(2, 0xffffff, 0.2);
            this.platforms.add(tile);
        }
    }

    createPlayer() {
        const startX = GAME_CONFIG.TILE_SIZE * 2;
        const startY = GAME_CONFIG.HEIGHT - GAME_CONFIG.TILE_SIZE * 3;
        
        const playerRect = this.add.rectangle(startX, startY, 48, 64, 0x4ade80);
        playerRect.setStrokeStyle(2, 0xffffff, 0.2);
        
        const playerText = this.add.text(startX, startY, '玩家', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.physics.add.existing(playerRect);
        playerRect.body.setBounce(0.2);
        playerRect.body.setCollideWorldBounds(true);
        playerRect.body.setSize(40, 56);
        
        this.player = playerRect;
        this.player.text = playerText;
        this.player.health = 100;
        this.player.isJumping = false;
        this.player.isGrounded = false;
        this.player.facingRight = true;
        this.player.invulnerable = false;
        this.player.invulnerableTimer = 0;
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        
        this.addEnemy(8 * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.HEIGHT - GAME_CONFIG.TILE_SIZE * 3, 6 * GAME_CONFIG.TILE_SIZE, 10 * GAME_CONFIG.TILE_SIZE);
        this.addEnemy(15 * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.HEIGHT - GAME_CONFIG.TILE_SIZE * 3, 13 * GAME_CONFIG.TILE_SIZE, 18 * GAME_CONFIG.TILE_SIZE);
        this.addEnemy(28 * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.HEIGHT - GAME_CONFIG.TILE_SIZE * 3, 26 * GAME_CONFIG.TILE_SIZE, 32 * GAME_CONFIG.TILE_SIZE);
        this.addEnemy(35 * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.HEIGHT - GAME_CONFIG.TILE_SIZE * 3, 33 * GAME_CONFIG.TILE_SIZE, 38 * GAME_CONFIG.TILE_SIZE);
    }

    addEnemy(x, y, patrolLeft, patrolRight) {
        const enemyRect = this.add.rectangle(x, y, 48, 64, 0xef4444);
        enemyRect.setStrokeStyle(2, 0xffffff, 0.2);
        
        const enemyText = this.add.text(x, y, '怪物', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.physics.add.existing(enemyRect);
        enemyRect.body.setBounce(0);
        enemyRect.body.setCollideWorldBounds(true);
        enemyRect.body.setSize(40, 56);
        
        enemyRect.text = enemyText;
        enemyRect.health = 50;
        enemyRect.patrolLeft = patrolLeft;
        enemyRect.patrolRight = patrolRight;
        enemyRect.direction = 1;
        enemyRect.isMoving = true;
        enemyRect.attackCooldown = 0;
        
        this.enemies.add(enemyRect);
        return enemyRect;
    }

    createInput() {
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.Z = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keys.X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    }

    createUI() {
        this.scoreText = this.add.text(20, 20, '分数: 0', {
            fontSize: '20px',
            fill: '#00d4ff',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setScrollFactor(0);
        
        this.healthText = this.add.text(20, 50, '生命: 100', {
            fontSize: '18px',
            fill: '#4ade80',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setScrollFactor(0);
        
        this.livesText = this.add.text(20, 75, '生命条: ❤️ ❤️ ❤️', {
            fontSize: '16px',
            fill: '#f87171',
            fontFamily: 'Arial'
        }).setScrollFactor(0);
        
        this.controlsText = this.add.text(GAME_CONFIG.WIDTH - 20, 20, 
            '操作说明:\n← → 移动\n↑ 跳跃\nZ 攻击', 
            {
                fontSize: '14px',
                fill: '#94a3b8',
                fontFamily: 'Arial',
                align: 'right'
            }
        ).setScrollFactor(0).setOrigin(1, 0);
    }

    createCamera() {
        this.cameras.main.setBounds(
            0, 0,
            40 * GAME_CONFIG.TILE_SIZE,
            GAME_CONFIG.HEIGHT
        );
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.enemies, this.ground);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision,
            null,
            this
        );
    }

    update(time, delta) {
        if (this.gameOver) return;
        
        this.updatePlayer(delta);
        this.updateEnemies(delta);
        this.updateUI();
        
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
        
        if (this.player.invulnerable) {
            this.player.invulnerableTimer -= delta;
            this.player.alpha = Math.sin(time * 0.02) * 0.5 + 0.5;
            
            if (this.player.invulnerableTimer <= 0) {
                this.player.invulnerable = false;
                this.player.alpha = 1;
            }
        }
    }

    updatePlayer(delta) {
        const player = this.player;
        
        player.isGrounded = player.body.onFloor() || player.body.touching.down;
        
        if (this.keys.left.isDown) {
            player.body.setVelocityX(-GAME_CONFIG.PLAYER_SPEED);
            player.facingRight = false;
            player.setScale(-1, 1);
        } else if (this.keys.right.isDown) {
            player.body.setVelocityX(GAME_CONFIG.PLAYER_SPEED);
            player.facingRight = true;
            player.setScale(1, 1);
        } else {
            player.body.setVelocityX(0);
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.up) && player.isGrounded) {
            player.body.setVelocityY(GAME_CONFIG.JUMP_VELOCITY);
            player.isJumping = true;
        }
        
        if (player.isJumping && player.body.velocity.y > 0 && player.isGrounded) {
            player.isJumping = false;
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.Z) && this.attackCooldown <= 0) {
            this.performAttack();
        }
        
        player.text.setPosition(player.x, player.y);
    }

    performAttack() {
        this.isAttacking = true;
        this.attackCooldown = GAME_CONFIG.ATTACK_COOLDOWN;
        
        this.player.fillColor = 0xf59e0b;
        
        const attackX = this.player.facingRight 
            ? this.player.x + GAME_CONFIG.ATTACK_RANGE 
            : this.player.x - GAME_CONFIG.ATTACK_RANGE;
        
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(attackX, this.player.y, enemy.x, enemy.y);
                
                if (distance < GAME_CONFIG.ATTACK_RANGE + 60) {
                    this.damageEnemy(enemy, GAME_CONFIG.ATTACK_DAMAGE);
                }
            }
        });
        
        this.time.delayedCall(200, () => {
            this.isAttacking = false;
            this.player.fillColor = 0x4ade80;
        });
    }

    damageEnemy(enemy, damage) {
        enemy.health -= damage;
        
        enemy.fillColor = 0xffffff;
        
        this.time.delayedCall(100, () => {
            if (enemy.active) {
                enemy.fillColor = 0xef4444;
            }
        });
        
        if (enemy.health <= 0) {
            this.destroyEnemy(enemy);
        }
    }

    destroyEnemy(enemy) {
        this.tweens.add({
            targets: enemy,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => {
                if (enemy.text && enemy.text.active) {
                    enemy.text.destroy();
                }
                enemy.destroy();
                this.score += 100;
                this.updateUI();
            }
        });
    }

    updateEnemies(delta) {
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            
            if (enemy.attackCooldown > 0) {
                enemy.attackCooldown -= delta;
            }
            
            if (enemy.isMoving) {
                enemy.body.setVelocityX(GAME_CONFIG.ENEMY_SPEED * enemy.direction);
                
                if (enemy.x <= enemy.patrolLeft) {
                    enemy.direction = 1;
                    enemy.setScale(1, 1);
                } else if (enemy.x >= enemy.patrolRight) {
                    enemy.direction = -1;
                    enemy.setScale(-1, 1);
                }
            } else {
                enemy.body.setVelocityX(0);
            }
            
            enemy.text.setPosition(enemy.x, enemy.y);
        });
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (this.gameOver || player.invulnerable) return;
        
        const playerBottom = player.y + 28;
        const enemyTop = enemy.y - 28;
        
        if (player.body.velocity.y > 0 && playerBottom > enemyTop - 20 && playerBottom < enemyTop + 20) {
            this.damageEnemy(enemy, 50);
            player.body.setVelocityY(GAME_CONFIG.JUMP_VELOCITY * 0.7);
        } else {
            this.damagePlayer(25);
        }
    }

    damagePlayer(damage) {
        this.player.health -= damage;
        this.player.invulnerable = true;
        this.player.invulnerableTimer = 1500;
        
        const knockbackX = this.player.facingRight ? -150 : 150;
        this.player.body.setVelocity(knockbackX, -200);
        
        this.player.fillColor = 0xff0000;
        
        this.time.delayedCall(100, () => {
            this.player.fillColor = 0x4ade80;
        });
        
        if (this.player.health <= 0) {
            this.lives--;
            if (this.lives > 0) {
                this.player.health = 100;
                this.player.x = GAME_CONFIG.TILE_SIZE * 2;
                this.player.y = GAME_CONFIG.HEIGHT - GAME_CONFIG.TILE_SIZE * 3;
                this.player.invulnerable = true;
                this.player.invulnerableTimer = 2000;
            } else {
                this.gameOver = true;
                this.showGameOver();
            }
        }
        
        this.updateUI();
    }

    updateUI() {
        this.scoreText.setText(`分数: ${this.score}`);
        this.healthText.setText(`生命: ${Math.max(0, this.player.health)}`);
        this.livesText.setText(`生命条: ${'❤️ '.repeat(Math.max(0, this.lives))}`);
    }

    showGameOver() {
        const gameOverText = this.add.text(
            this.cameras.main.scrollX + GAME_CONFIG.WIDTH / 2,
            this.cameras.main.scrollY + GAME_CONFIG.HEIGHT / 2,
            '游戏结束!',
            {
                fontSize: '48px',
                fill: '#f87171',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5);
        
        const restartText = this.add.text(
            this.cameras.main.scrollX + GAME_CONFIG.WIDTH / 2,
            this.cameras.main.scrollY + GAME_CONFIG.HEIGHT / 2 + 60,
            `最终分数: ${this.score}\n按 空格键 重新开始`,
            {
                fontSize: '24px',
                fill: '#94a3b8',
                fontFamily: 'Arial',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        this.input.keyboard.once('keydown-SPACE', () => {
            gameOverText.destroy();
            restartText.destroy();
            this.scene.restart();
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#0f172a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.GRAVITY },
            debug: false
        }
    },
    scene: [PreloadScene, GameScene]
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
});
