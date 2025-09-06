/**
 * Power-up System for GTA Clone
 * Implements various power-ups and collectibles
 */

class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = this.getPowerUpConfig(type);
        
        this.radius = 15;
        this.active = true;
        this.collected = false;
        this.pulseTimer = 0;
        this.rotation = 0;
        
        // Visual effects
        this.glowIntensity = 0;
        this.glowDirection = 1;
    }
    
    /**
     * Get power-up configuration based on type
     * @param {string} type - Power-up type
     * @returns {Object} Power-up configuration
     */
    getPowerUpConfig(type) {
        const configs = {
            health: {
                name: 'Health Pack',
                color: '#00ff00',
                icon: '❤️',
                effect: 'heal',
                value: 50,
                duration: 0,
                sound: 'health_pickup'
            },
            ammo: {
                name: 'Ammo Pack',
                color: '#ffff00',
                icon: '🔫',
                effect: 'ammo',
                value: 0, // Refills current weapon
                duration: 0,
                sound: 'ammo_pickup'
            },
            speed: {
                name: 'Speed Boost',
                color: '#00ffff',
                icon: '⚡',
                effect: 'speed',
                value: 1.5,
                duration: 10000, // 10 seconds
                sound: 'speed_pickup'
            },
            damage: {
                name: 'Damage Boost',
                color: '#ff0000',
                icon: '💥',
                effect: 'damage',
                value: 2.0,
                duration: 15000, // 15 seconds
                sound: 'damage_pickup'
            },
            invincibility: {
                name: 'Invincibility',
                color: '#ff00ff',
                icon: '🛡️',
                effect: 'invincibility',
                value: 1,
                duration: 8000, // 8 seconds
                sound: 'invincibility_pickup'
            },
            rapid_fire: {
                name: 'Rapid Fire',
                color: '#ff6600',
                icon: '🔥',
                effect: 'rapid_fire',
                value: 0.3, // 30% of original fire rate
                duration: 12000, // 12 seconds
                sound: 'rapid_fire_pickup'
            },
            multi_shot: {
                name: 'Multi Shot',
                color: '#6600ff',
                icon: '🎯',
                effect: 'multi_shot',
                value: 3, // 3 bullets per shot
                duration: 10000, // 10 seconds
                sound: 'multi_shot_pickup'
            },
            explosive_ammo: {
                name: 'Explosive Ammo',
                color: '#ff0066',
                icon: '💣',
                effect: 'explosive_ammo',
                value: 1,
                duration: 20000, // 20 seconds
                sound: 'explosive_pickup'
            }
        };
        
        return configs[type] || configs.health;
    }
    
    /**
     * Update power-up
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        if (!this.active || this.collected) return;
        
        // Update visual effects
        this.pulseTimer += deltaTime;
        this.rotation += deltaTime * 0.002;
        
        // Update glow effect
        this.glowIntensity += this.glowDirection * deltaTime * 0.003;
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
        
        // Check collision with player
        this.checkPlayerCollision();
    }
    
    /**
     * Check collision with player
     */
    checkPlayerCollision() {
        if (!this.game.player) return;
        
        const dx = this.x - this.game.player.x;
        const dy = this.y - this.game.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (this.radius + this.game.player.radius)) {
            this.collect();
        }
    }
    
    /**
     * Collect the power-up
     */
    collect() {
        if (this.collected) return;
        
        this.collected = true;
        this.active = false;
        
        // Apply effect
        this.applyEffect();
        
        // Play sound
        this.playSound();
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Add to score
        this.game.score += 100;
    }
    
    /**
     * Apply power-up effect
     */
    applyEffect() {
        const player = this.game.player;
        if (!player) return;
        
        switch (this.config.effect) {
            case 'heal':
                player.health = Math.min(player.health + this.config.value, player.maxHealth);
                break;
                
            case 'ammo':
                if (player.weapon) {
                    player.weapon.ammo = player.weapon.config.maxAmmo;
                }
                break;
                
            case 'speed':
                player.addPowerUp('speed', this.config.value, this.config.duration);
                break;
                
            case 'damage':
                player.addPowerUp('damage', this.config.value, this.config.duration);
                break;
                
            case 'invincibility':
                player.addPowerUp('invincibility', this.config.value, this.config.duration);
                break;
                
            case 'rapid_fire':
                player.addPowerUp('rapid_fire', this.config.value, this.config.duration);
                break;
                
            case 'multi_shot':
                player.addPowerUp('multi_shot', this.config.value, this.config.duration);
                break;
                
            case 'explosive_ammo':
                player.addPowerUp('explosive_ammo', this.config.value, this.config.duration);
                break;
        }
    }
    
    /**
     * Play collection sound
     */
    playSound() {
        // Play pickup sound using audio manager
        if (this.game.audioManager) {
            this.game.audioManager.playSound('pickup', 0.6);
        } else {
            console.log(`Sound: ${this.config.sound}`);
        }
        
        // Create sound particle
        if (this.game.addParticle) {
            this.game.addParticle(new Particle(
                this.game,
                this.x,
                this.y,
                this.config.color,
                20,
                2
            ));
        }
    }
    
    /**
     * Create collection effect
     */
    createCollectionEffect() {
        // Create burst particles
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
                if (this.game.addParticle) {
                    this.game.addParticle(new Particle(
                        this.game,
                        this.x,
                        this.y,
                        this.config.color,
                        20,
                        2,
                        angle,
                        speed
                    ));
                }
        }
        
        // Create text effect
        this.createTextEffect();
    }
    
    /**
     * Create text effect
     */
    createTextEffect() {
        const textEffect = new TextEffect(
            this.game,
            this.x,
            this.y,
            this.config.name,
            this.config.color,
            2000 // 2 seconds
        );
        
        if (this.game.textEffects) {
            this.game.textEffects.push(textEffect);
        } else if (this.game.powerUpManager && this.game.powerUpManager.textEffects) {
            this.game.powerUpManager.textEffects.push(textEffect);
        }
    }
    
    /**
     * Render power-up
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active || this.collected) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Outer glow
        const glowSize = this.radius + (this.glowIntensity * 10);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        gradient.addColorStop(0, `${this.config.color}${Math.floor(this.glowIntensity * 100).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${this.config.color}00`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Main body
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, 0, 0);
        
        ctx.restore();
    }
}

/**
 * Text Effect class for floating text
 */
class TextEffect {
    constructor(game, x, y, text, color, duration) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.duration = duration;
        this.maxDuration = duration;
        this.active = true;
        
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: -2
        };
    }
    
    /**
     * Update text effect
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.duration -= deltaTime;
        
        if (this.duration <= 0) {
            this.active = false;
        }
    }
    
    /**
     * Render text effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active) return;
        
        const alpha = this.duration / this.maxDuration;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

/**
 * Power-up Manager class
 */
class PowerUpManager {
    constructor(game) {
        this.game = game;
        this.powerUps = [];
        this.textEffects = [];
        this.spawnTimer = 0;
        this.spawnInterval = 15000; // 15 seconds
        this.maxPowerUps = 5;
    }
    
    /**
     * Update power-up manager
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update(deltaTime);
            return powerUp.active;
        });
        
        // Update text effects
        this.textEffects = this.textEffects.filter(effect => {
            effect.update(deltaTime);
            return effect.active;
        });
        
        // Spawn new power-ups
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval && 
            this.powerUps.length < this.maxPowerUps) {
            this.spawnPowerUp();
            this.spawnTimer = 0;
        }
    }
    
    /**
     * Spawn a new power-up
     */
    spawnPowerUp() {
        // Random position (avoid buildings)
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.random() * this.game.city.width;
            y = Math.random() * this.game.city.height;
            attempts++;
        } while (this.isPositionBlocked(x, y) && attempts < 50);
        
        if (attempts >= 50) return; // Give up if can't find good position
        
        // Random power-up type
        const types = ['health', 'ammo', 'speed', 'damage', 'invincibility', 
                      'rapid_fire', 'multi_shot', 'explosive_ammo'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const powerUp = new PowerUp(this.game, x, y, type);
        this.powerUps.push(powerUp);
    }
    
    /**
     * Check if position is blocked by buildings
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean} Whether position is blocked
     */
    isPositionBlocked(x, y) {
        if (!this.game.city || !this.game.city.buildings) return false;
        
        return this.game.city.buildings.some(building => {
            return x >= building.x && x <= building.x + building.width &&
                   y >= building.y && y <= building.y + building.height;
        });
    }
    
    /**
     * Render all power-ups
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Render power-ups
        this.powerUps.forEach(powerUp => powerUp.render(ctx));
        
        // Render text effects
        this.textEffects.forEach(effect => effect.render(ctx));
    }
    
    /**
     * Clear all power-ups
     */
    clear() {
        this.powerUps = [];
        this.textEffects = [];
    }
}

// Export classes
window.PowerUp = PowerUp;
window.TextEffect = TextEffect;
window.PowerUpManager = PowerUpManager;
