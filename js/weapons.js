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
        // Simple sound simulation - in a real game, you'd use Web Audio API
        console.log(`Sound: ${this.config.sound}`);
        
        // Create visual sound indicator
        if (this.game.particles) {
            this.game.particles.push(new Particle(
                this.game,
                this.game.player.x,
                this.game.player.y,
                '#ffffff',
                50,
                0.5
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

/**
 * Bullet class for projectiles
 */
class Bullet {
    constructor(game, x, y, angle, speed, damage, range, size, color, explosive = false, explosionRadius = 0) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.size = size;
        this.color = color;
        this.explosive = explosive;
        this.explosionRadius = explosionRadius;
        
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        
        this.distanceTraveled = 0;
        this.active = true;
        this.trail = [];
    }
    
    /**
     * Update bullet
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.distanceTraveled += this.speed;
        
        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.shift();
        }
        
        // Check range
        if (this.distanceTraveled >= this.range) {
            this.destroy();
            return;
        }
        
        // Check collisions
        this.checkCollisions();
    }
    
    /**
     * Check for collisions
     */
    checkCollisions() {
        // Check collision with pedestrians
        this.game.pedestrians.forEach(ped => {
            if (this.checkCollision(ped)) {
                ped.takeDamage(this.damage);
                this.hit(ped.x, ped.y);
            }
        });
        
        // Check collision with vehicles
        this.game.vehicles.forEach(vehicle => {
            if (this.checkCollision(vehicle)) {
                vehicle.takeDamage(this.damage);
                this.hit(vehicle.x, vehicle.y);
            }
        });
        
        // Check collision with police
        this.game.police.forEach(cop => {
            if (this.checkCollision(cop)) {
                cop.takeDamage(this.damage);
                this.hit(cop.x, cop.y);
            }
        });
        
        // Check collision with buildings
        if (this.game.city) {
            this.game.city.buildings.forEach(building => {
                if (this.checkBuildingCollision(building)) {
                    this.hit(this.x, this.y);
                }
            });
        }
    }
    
    /**
     * Check collision with entity
     * @param {Object} entity - Entity to check
     * @returns {boolean} Whether collision occurred
     */
    checkCollision(entity) {
        if (!entity || !entity.active) return false;
        
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + (entity.radius || 10));
    }
    
    /**
     * Check collision with building
     * @param {Object} building - Building to check
     * @returns {boolean} Whether collision occurred
     */
    checkBuildingCollision(building) {
        return this.x >= building.x && 
               this.x <= building.x + building.width &&
               this.y >= building.y && 
               this.y <= building.y + building.height;
    }
    
    /**
     * Handle bullet hit
     * @param {number} x - Hit X position
     * @param {number} y - Hit Y position
     */
    hit(x, y) {
        // Create hit effect
        this.createHitEffect(x, y);
        
        // Create explosion if explosive
        if (this.explosive) {
            this.createExplosion(x, y);
        }
        
        this.destroy();
    }
    
    /**
     * Create hit effect
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createHitEffect(x, y) {
        // Create sparks
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.game.particles.push(new Particle(
                this.game,
                x,
                y,
                '#ffff00',
                speed,
                0.5,
                angle
            ));
        }
    }
    
    /**
     * Create explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createExplosion(x, y) {
        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            const color = ['#ff0000', '#ff6600', '#ffff00'][Math.floor(Math.random() * 3)];
            this.game.particles.push(new Particle(
                this.game,
                x,
                y,
                color,
                speed,
                1.0,
                angle
            ));
        }
        
        // Damage entities in explosion radius
        this.damageEntitiesInRadius(x, y, this.explosionRadius);
    }
    
    /**
     * Damage entities in explosion radius
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Explosion radius
     */
    damageEntitiesInRadius(x, y, radius) {
        const entities = [
            ...this.game.pedestrians,
            ...this.game.vehicles,
            ...this.game.police
        ];
        
        entities.forEach(entity => {
            if (!entity || !entity.active) return;
            
            const dx = entity.x - x;
            const dy = entity.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                const damage = this.damage * (1 - distance / radius);
                entity.takeDamage(damage);
            }
        });
    }
    
    /**
     * Render bullet
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active) return;
        
        // Render trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = `${this.color}80`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }
        
        // Render bullet
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    /**
     * Destroy bullet
     */
    destroy() {
        this.active = false;
    }
}

/**
 * Particle class for effects
 */
class Particle {
    constructor(game, x, y, color, speed, life, angle = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.life = life;
        this.maxLife = life;
        this.angle = angle || Math.random() * Math.PI * 2;
        
        this.velocity = {
            x: Math.cos(this.angle) * speed,
            y: Math.sin(this.angle) * speed
        };
        
        this.active = true;
    }
    
    /**
     * Update particle
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life -= deltaTime / 1000;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    /**
     * Render particle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active) return;
        
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `${this.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Export classes
window.Weapon = Weapon;
window.Bullet = Bullet;
window.Particle = Particle;
