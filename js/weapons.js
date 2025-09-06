/**
 * Weapon System for GTA Clone
 * Implements various weapons with different characteristics
 */

class Weapon {
    constructor(type, game) {
        this.game = game;
        this.type = type;
        this.config = this.getWeaponConfig(type);
        
        // Weapon state
        this.ammo = this.config.maxAmmo;
        this.reloadTime = 0;
        this.lastFired = 0;
        this.isReloading = false;
        
        // Visual effects
        this.muzzleFlash = null;
        this.muzzleFlashTimer = 0;
    }
    
    /**
     * Get weapon configuration based on type
     * @param {string} type - Weapon type
     * @returns {Object} Weapon configuration
     */
    getWeaponConfig(type) {
        const configs = {
            pistol: {
                name: 'Pistol',
                damage: 25,
                range: 200,
                fireRate: 500, // ms between shots
                maxAmmo: 12,
                reloadTime: 2000, // ms
                accuracy: 0.9,
                bulletSpeed: 8,
                bulletSize: 2,
                color: '#ffff00',
                sound: 'pistol_shot',
                spread: 0.1
            },
            shotgun: {
                name: 'Shotgun',
                damage: 60,
                range: 150,
                fireRate: 800,
                maxAmmo: 8,
                reloadTime: 3000,
                accuracy: 0.7,
                bulletSpeed: 6,
                bulletSize: 3,
                color: '#ff6600',
                sound: 'shotgun_shot',
                spread: 0.3,
                pellets: 5
            },
            uzi: {
                name: 'Uzi',
                damage: 15,
                range: 180,
                fireRate: 100,
                maxAmmo: 30,
                reloadTime: 2500,
                accuracy: 0.8,
                bulletSpeed: 10,
                bulletSize: 1.5,
                color: '#00ff00',
                sound: 'uzi_shot',
                spread: 0.2
            },
            rifle: {
                name: 'Rifle',
                damage: 40,
                range: 300,
                fireRate: 600,
                maxAmmo: 20,
                reloadTime: 3500,
                accuracy: 0.95,
                bulletSpeed: 12,
                bulletSize: 2.5,
                color: '#0066ff',
                sound: 'rifle_shot',
                spread: 0.05
            },
            rocket: {
                name: 'Rocket Launcher',
                damage: 100,
                range: 400,
                fireRate: 2000,
                maxAmmo: 5,
                reloadTime: 4000,
                accuracy: 0.9,
                bulletSpeed: 4,
                bulletSize: 4,
                color: '#ff0000',
                sound: 'rocket_shot',
                spread: 0.0,
                explosive: true,
                explosionRadius: 80
            }
        };
        
        return configs[type] || configs.pistol;
    }
    
    /**
     * Fire the weapon
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} angle - Firing angle
     * @returns {boolean} Whether weapon fired successfully
     */
    fire(x, y, angle) {
        const now = Date.now();
        
        // Check if weapon can fire
        if (this.isReloading || 
            now - this.lastFired < this.config.fireRate || 
            this.ammo <= 0) {
            return false;
        }
        
        // Consume ammo
        this.ammo--;
        this.lastFired = now;
        
        // Create muzzle flash
        this.createMuzzleFlash(x, y, angle);
        
        // Play sound
        this.playSound();
        
        // Create bullets
        this.createBullets(x, y, angle);
        
        // Start reload if out of ammo
        if (this.ammo <= 0) {
            this.startReload();
        }
        
        return true;
    }
    
    /**
     * Create bullets based on weapon type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} angle - Firing angle
     */
    createBullets(x, y, angle) {
        if (this.config.pellets) {
            // Shotgun - multiple pellets
            for (let i = 0; i < this.config.pellets; i++) {
                const spread = (Math.random() - 0.5) * this.config.spread;
                const pelletAngle = angle + spread;
                this.createBullet(x, y, pelletAngle);
            }
        } else {
            // Single bullet
            const spread = (Math.random() - 0.5) * this.config.spread;
            const bulletAngle = angle + spread;
            this.createBullet(x, y, bulletAngle);
        }
    }
    
    /**
     * Create a single bullet
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} angle - Bullet angle
     */
    createBullet(x, y, angle) {
        // Use object pooling if available
        if (this.game.poolManager) {
            const bullet = this.game.poolManager.createBullet(
                x, y, angle,
                this.config.bulletSpeed,
                this.config.damage,
                this.config.range,
                this.config.bulletSize,
                this.config.color,
                this.config.explosive,
                this.config.explosionRadius
            );
            
            // Add to game bullets array for rendering
            this.game.bullets.push(bullet);
        } else {
            // Fallback to direct creation
            const bullet = new Bullet(
                this.game,
                x,
                y,
                angle,
                this.config.bulletSpeed,
                this.config.damage,
                this.config.range,
                this.config.bulletSize,
                this.config.color,
                this.config.explosive,
                this.config.explosionRadius
            );
            
            this.game.addBullet(bullet);
        }
    }
    
    /**
     * Create muzzle flash effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} angle - Firing angle
     */
    createMuzzleFlash(x, y, angle) {
        this.muzzleFlash = {
            x: x,
            y: y,
            angle: angle,
            timer: 100 // ms
        };
        this.muzzleFlashTimer = 100;
    }
    
    /**
     * Play weapon sound
     */
    playSound() {
        // Play procedural sound using audio manager
        if (this.game.audioManager) {
            this.game.audioManager.playSound(this.config.sound);
        } else {
            // Fallback console log
            console.log(`Sound: ${this.config.sound}`);
        }
        
        // Create visual sound indicator
        if (this.game.poolManager) {
            const particle = this.game.poolManager.createParticle(
                this.game.player.x,
                this.game.player.y,
                '#ffffff',
                50,
                2
            );
            this.game.particles.push(particle);
        } else if (this.game.addParticle) {
            this.game.addParticle(new Particle(
                this.game,
                this.game.player.x,
                this.game.player.y,
                '#ffffff',
                50,
                2
            ));
        }
    }
    
    /**
     * Start reloading
     */
    startReload() {
        if (this.isReloading || this.ammo >= this.config.maxAmmo) return;
        
        this.isReloading = true;
        this.reloadTime = this.config.reloadTime;
        
        // Create reload particle effect
        if (this.game.particles) {
            this.game.particles.push(new Particle(
                this.game,
                this.game.player.x,
                this.game.player.y,
                '#666666',
                30,
                1.0
            ));
        }
    }
    
    /**
     * Update weapon state
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        // Update reload timer
        if (this.isReloading) {
            this.reloadTime -= deltaTime;
            if (this.reloadTime <= 0) {
                this.ammo = this.config.maxAmmo;
                this.isReloading = false;
            }
        }
        
        // Update muzzle flash
        if (this.muzzleFlashTimer > 0) {
            this.muzzleFlashTimer -= deltaTime;
            if (this.muzzleFlashTimer <= 0) {
                this.muzzleFlash = null;
            }
        }
    }
    
    /**
     * Render weapon effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Render muzzle flash
        if (this.muzzleFlash) {
            this.renderMuzzleFlash(ctx);
        }
    }
    
    /**
     * Render muzzle flash effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderMuzzleFlash(ctx) {
        const flash = this.muzzleFlash;
        const intensity = this.muzzleFlashTimer / 100;
        
        ctx.save();
        ctx.translate(flash.x, flash.y);
        ctx.rotate(flash.angle);
        
        // Muzzle flash effect
        ctx.fillStyle = `rgba(255, 255, 0, ${intensity * 0.8})`;
        ctx.fillRect(15, -2, 20, 4);
        
        ctx.fillStyle = `rgba(255, 100, 0, ${intensity * 0.6})`;
        ctx.fillRect(18, -1, 15, 2);
        
        ctx.restore();
    }
    
    /**
     * Get weapon info for UI
     * @returns {Object} Weapon information
     */
    getInfo() {
        return {
            name: this.config.name,
            ammo: this.ammo,
            maxAmmo: this.config.maxAmmo,
            isReloading: this.isReloading,
            reloadProgress: this.isReloading ? 
                (this.config.reloadTime - this.reloadTime) / this.config.reloadTime : 1
        };
    }
}


// Export classes
window.Weapon = Weapon;
