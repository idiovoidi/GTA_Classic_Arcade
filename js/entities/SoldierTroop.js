class SoldierTroop {
    constructor(game, x, y) {
        // Properties
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 12;
        this.radius = 8;
        this.health = 100;
        this.maxHealth = 100;
        
        // Movement
        this.speed = 1.0;
        this.angle = 0;
        this.targetX = x;
        this.targetY = y;
        
        // Combat
        this.lastShot = 0;
        this.shootCooldown = 800; // ms
        this.weaponRange = 250;
        
        // Visual properties
        this.color = '#8B4513'; // Military brown
        this.uniformColor = '#4169E1'; // Royal blue for uniform
        
        // Weapon system
        this.weapon = new Weapon('rifle', game);
        
        // Death properties
        this.state = 'alive';
        this.deathTime = 0;
        this.bloodSplatterCreated = false;
    }
    
    update(deltaTime) {
        if (this.state === 'dead') return;
        
        // Move toward player
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.angle = Math.atan2(dy, dx);
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        }
        
        // Shoot at player if in range and can see them
        if (distance < this.weaponRange && this.canSeePlayer()) {
            this.shootAtPlayer();
        }
        
        // Update weapon
        this.weapon.update(deltaTime);
        
        // Keep within city bounds
        this.x = Math.max(0, Math.min(this.game.city.width, this.x));
        this.y = Math.max(0, Math.min(this.game.city.height, this.y));
    }
    
    render(ctx, lodLevel = 'high') {
        if (this.state === 'dead') return;
        if (lodLevel === 'skip') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (lodLevel === 'low') {
            // Low detail: just a colored rectangle
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 2);
        } else if (lodLevel === 'medium') {
            // Medium detail: basic soldier shape
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Simple uniform detail
            ctx.fillStyle = this.uniformColor;
            ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, 4);
        } else {
            // High detail: full soldier rendering
            // Body
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Uniform
            ctx.fillStyle = this.uniformColor;
            ctx.fillRect(-this.width / 2 + 1, -this.height / 2 + 1, this.width - 2, 5);
            
            // Helmet
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(-this.width / 2 - 1, -this.height / 2 - 2, this.width + 2, 4);
            
            // Rifle
            ctx.fillStyle = '#333333';
            ctx.fillRect(this.width / 2 - 2, -2, 15, 3);
        }
        
        ctx.restore();
        
        // Only draw health bar at high detail
        if (lodLevel === 'high' && this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }
    }
    
    renderHealthBar(ctx) {
        const barWidth = 30;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - this.height / 2 - 15;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
    
    takeDamage(amount, fromAngle = null) {
        this.health -= amount;
        
        if (this.health <= 0 && this.state !== 'dead') {
            this.state = 'dead';
            this.deathTime = Date.now();
            this.createBloodSplatter(fromAngle);
            this.createCorpse();
            
            // Record kill in progression system
            if (this.game.progression) {
                this.game.progression.recordKill('soldier');
            }
            
            // Play death sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('pedestrian_death', this.x, this.y);
            }
        } else if (this.health > 0) {
            // Play damage sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('pedestrian_hurt', this.x, this.y);
            }
        }
    }
    
    /**
     * Create blood splatter effect when soldier dies
     * @param {number} fromAngle - Angle from which damage came (for directional splatter)
     */
    createBloodSplatter(fromAngle = null) {
        if (this.bloodSplatterCreated) return;
        this.bloodSplatterCreated = true;
        
        // Determine splatter direction
        const baseAngle = fromAngle !== null ? fromAngle : Math.random() * Math.PI * 2;
        const splatterSpread = Math.PI / 3; // 60 degree spread
        
        // Create multiple blood particles with realistic physics
        const bloodParticleCount = 15 + Math.random() * 10; // 15-25 particles
        
        for (let i = 0; i < bloodParticleCount; i++) {
            // Vary angle for realistic splatter pattern
            const angle = baseAngle + (Math.random() - 0.5) * splatterSpread;
            const speed = 2 + Math.random() * 4;
            const size = 1 + Math.random() * 3;
            
            // Create blood particle using proper BloodParticle class if available
            let bloodParticle;
            if (typeof BloodParticle !== 'undefined') {
                bloodParticle = new BloodParticle(this.game, 
                    this.x + (Math.random() - 0.5) * 15,
                    this.y + (Math.random() - 0.5) * 15
                );
            } else {
                // Fallback to regular particle with blood colors
                const bloodColors = ['#8B0000', '#AA0000', '#CC0000', '#660000'];
                const color = bloodColors[Math.floor(Math.random() * bloodColors.length)];
                bloodParticle = new Particle(
                    this.game,
                    this.x + (Math.random() - 0.5) * 15,
                    this.y + (Math.random() - 0.5) * 15,
                    color,
                    40 + Math.random() * 30, // Longer lasting blood
                    size,
                    angle,
                    speed
                );
            }
            
            // Try to use pooled particle system first
            if (this.game.poolManager && this.game.poolManager.getParticle) {
                try {
                    const pooledParticle = this.game.poolManager.getParticle(
                        this.x + (Math.random() - 0.5) * 15,
                        this.y + (Math.random() - 0.5) * 15,
                        '#8B0000',
                        50 + Math.random() * 20,
                        size,
                        angle,
                        speed
                    );
                    if (pooledParticle) {
                        this.game.particles.push(pooledParticle);
                        continue; // Skip regular particle creation
                    }
                } catch (e) {
                    // Fall back to regular particle creation if pooling fails
                    console.warn('Particle pooling failed, using regular particle creation');
                }
            }
            
            // Add particle to game
            this.game.addParticle(bloodParticle);
        }
    }
    
    /**
     * Create corpse when soldier dies
     */
    createCorpse() {
        // Create corpse object
        const corpse = {
            x: this.x,
            y: this.y,
            angle: this.angle,
            color: this.color,
            width: this.width,
            height: this.height,
            creationTime: Date.now(),
            alpha: 1.0,
            vehicleType: null, // Not a vehicle
            bloodStains: []
        };
        
        // Add some blood stains around the corpse
        const stainCount = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < stainCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 5 + Math.random() * 15;
            const size = 2 + Math.random() * 4;
            
            corpse.bloodStains.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                size: size,
                color: '#4a0000',
                alpha: 0.7 + Math.random() * 0.3
            });
        }
        
        // Add corpse to game
        this.game.addCorpse(corpse);
    }
    
    /**
     * Shoot at the player with the soldier's weapon
     */
    shootAtPlayer() {
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown) {
            const angle = Math.atan2(
                this.game.player.y - this.y,
                this.game.player.x - this.x
            );
            
            // Use weapon system to fire
            const fired = this.weapon.fire(
                this.x + Math.cos(angle) * 15,
                this.y + Math.sin(angle) * 15,
                angle
            );
            
            if (fired) {
                // Mark bullet as coming from soldier
                if (this.game.bullets.length > 0) {
                    const bullet = this.game.bullets[this.game.bullets.length - 1];
                    bullet.owner = 'soldier';
                }
                
                this.lastShot = now;
                
                // Create muzzle flash effect
                this.createMuzzleFlash(angle);
            }
        }
    }
    
    /**
     * Create muzzle flash effect when shooting
     * @param {number} angle - Firing angle
     */
    createMuzzleFlash(angle) {
        // Try to use pooled particle system first
        if (this.game.poolManager && this.game.poolManager.createParticle) {
            try {
                const particleCount = 5;
                for (let i = 0; i < particleCount; i++) {
                    const flashAngle = angle + (Math.random() - 0.5) * 0.3;
                    const speed = 1 + Math.random() * 2;
                    const life = 10 + Math.random() * 20;
                    const size = 2 + Math.random() * 2;
                    
                    const particle = this.game.poolManager.createParticle(
                        this.x + Math.cos(angle) * 15,
                        this.y + Math.sin(angle) * 15,
                        '#ffaa00',
                        life,
                        size,
                        flashAngle,
                        speed
                    );
                }
                return;
            } catch (e) {
                // Fall back to regular particle creation if pooling fails
                console.warn('Particle pooling failed for muzzle flash, using regular particle creation');
            }
        }
        
        // Fallback to direct particle creation
        for (let i = 0; i < 3; i++) {
            this.game.addParticle(new Particle(
                this.game,
                this.x + Math.cos(angle) * 15 + (Math.random() - 0.5) * 5,
                this.y + Math.sin(angle) * 15 + (Math.random() - 0.5) * 5,
                '#ffaa00',
                20,
                3 + Math.random() * 2
            ));
        }
    }
    
    /**
     * Check if soldier can see the player (line of sight)
     * @returns {boolean} Whether soldier can see player
     */
    canSeePlayer() {
        const playerDistance = Math.sqrt(
            Math.pow(this.game.player.x - this.x, 2) + 
            Math.pow(this.game.player.y - this.y, 2)
        );
        
        // Can't see if too far
        if (playerDistance > this.weaponRange) return false;
        
        // Check if player is behind buildings
        for (const building of this.game.city.buildings) {
            if (this.lineIntersectsRect(
                this.x, this.y,
                this.game.player.x, this.game.player.y,
                building.x, building.y, building.width, building.height
            )) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if a line intersects a rectangle
     * @param {number} x1 - Line start X
     * @param {number} y1 - Line start Y
     * @param {number} x2 - Line end X
     * @param {number} y2 - Line end Y
     * @param {number} rx - Rectangle X
     * @param {number} ry - Rectangle Y
     * @param {number} rw - Rectangle width
     * @param {number} rh - Rectangle height
     * @returns {boolean} Whether line intersects rectangle
     */
    lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
        // Check if line from (x1,y1) to (x2,y2) intersects rectangle (rx,ry,rw,rh)
        const left = this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
        const right = this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
        const top = this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
        const bottom = this.lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
        
        return left || right || top || bottom;
    }
    
    /**
     * Check if two lines intersect
     * @param {number} x1 - First line start X
     * @param {number} y1 - First line start Y
     * @param {number} x2 - First line end X
     * @param {number} y2 - First line end Y
     * @param {number} x3 - Second line start X
     * @param {number} y3 - Second line start Y
     * @param {number} x4 - Second line end X
     * @param {number} y4 - Second line end Y
     * @returns {boolean} Whether lines intersect
     */
    lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 0.0001) return false;
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
}

// Export SoldierTroop class for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoldierTroop;
} else if (typeof window !== 'undefined') {
    window.SoldierTroop = SoldierTroop;
}