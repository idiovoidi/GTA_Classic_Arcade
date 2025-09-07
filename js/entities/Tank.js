class Tank extends Vehicle {
    constructor(game, x, y) {
        // Call parent constructor with TANK vehicle type
        super(game, x, y, 'TANK');
        
        // Tank-specific properties
        this.weaponCooldown = 0;
        this.lastShot = 0;
        this.turretAngle = this.angle; // Turret starts aligned with tank
        this.primaryWeaponRange = 500;
        this.armorThickness = 0.8; // 80% damage reduction on front armor
        
        // Tank-specific AI properties
        this.targetingPlayer = false;
        this.primaryWeaponCooldown = 3000; // 3 seconds between primary shots
        this.secondaryWeaponCooldown = 200; // 0.2 seconds between secondary shots
        this.lastPrimaryShot = 0;
        this.lastSecondaryShot = 0;
    }
    
    update(deltaTime) {
        if (this.state === 'dead') return;
        
        // Update weapon cooldowns
        this.weaponCooldown = Math.max(0, this.weaponCooldown - deltaTime);
        
        // Update AI targeting
        this.updateTankAI(deltaTime);
        
        // Update movement (inherit from Vehicle)
        super.update(deltaTime);
        
        // Update turret to track player
        this.updateTurret();
    }
    
    updateTankAI(deltaTime) {
        const playerDistance = this.game.getDistance(this, this.game.player);
        
        // Check if player is visible (not behind buildings)
        const canSeePlayer = this.canSeePlayer();
        
        if (canSeePlayer && playerDistance < 600) {
            this.targetingPlayer = true;
            this.state = 'attacking';
            
            // Position for optimal firing angle
            this.positionForFiring(playerDistance);
            
            // Fire weapons based on distance
            if (playerDistance < this.primaryWeaponRange) {
                this.firePrimaryWeapon();
            }
            
            if (playerDistance < 200) { // Close range
                this.fireSecondaryWeapon();
            }
        } else {
            this.targetingPlayer = false;
            this.state = 'patrolling';
            this.patrol();
        }
    }
    
    canSeePlayer() {
        const playerDistance = this.game.getDistance(this, this.game.player);
        
        // Can't see if too far
        if (playerDistance > 600) return false;
        
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
    
    lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
        // Check if line from (x1,y1) to (x2,y2) intersects rectangle (rx,ry,rw,rh)
        const left = this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
        const right = this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
        const top = this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
        const bottom = this.lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
        
        return left || right || top || bottom;
    }
    
    lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 0.0001) return false;
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    
    positionForFiring(playerDistance) {
        // Try to maintain optimal distance for firing
        const optimalDistance = 400;
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        
        if (playerDistance > optimalDistance + 50) {
            // Move closer to player
            this.targetX = this.game.player.x;
            this.targetY = this.game.player.y;
        } else if (playerDistance < optimalDistance - 50) {
            // Move away from player
            this.targetX = this.x - dx * 0.5;
            this.targetY = this.y - dy * 0.5;
        } else {
            // Maintain distance, just rotate to face player
            this.targetX = this.x;
            this.targetY = this.y;
        }
    }
    
    updateTurret() {
        // Turret always points toward player
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        this.turretAngle = Math.atan2(dy, dx);
    }
    
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    
    firePrimaryWeapon() {
        const now = Date.now();
        if (now - this.lastPrimaryShot > this.primaryWeaponCooldown) {
            const angle = this.turretAngle;
            
            // Create explosive bullet using object pooling if available
            let bullet;
            if (this.game.poolManager) {
                bullet = this.game.poolManager.createBullet(
                    this.x + Math.cos(angle) * 30,
                    this.y + Math.sin(angle) * 30,
                    angle,
                    4, // speed
                    120, // damage
                    this.primaryWeaponRange,
                    4, // size
                    '#ff8800', // orange color for explosive shells
                    true, // explosive
                    50 // explosion radius
                );
                bullet.owner = 'tank'; // Mark as tank bullet
            } else {
                bullet = new Bullet(
                    this.game,
                    this.x + Math.cos(angle) * 30,
                    this.y + Math.sin(angle) * 30,
                    angle,
                    4, // speed
                    120, // damage
                    this.primaryWeaponRange,
                    4, // size
                    '#ff8800', // orange color
                    true, // explosive
                    50 // explosion radius
                );
                bullet.owner = 'tank'; // Mark as tank bullet
            }
            
            this.game.addBullet(bullet);
            this.lastPrimaryShot = now;
            
            // Play cannon fire sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('tank_cannon', this.x, this.y);
            }
            
            // Muzzle flash effect
            this.createMuzzleFlash(angle);
        }
    }
    
    fireSecondaryWeapon() {
        const now = Date.now();
        if (now - this.lastSecondaryShot > this.secondaryWeaponCooldown) {
            const angle = this.turretAngle + (Math.random() - 0.5) * 0.2; // Add some spread
            
            // Create machine gun bullet using object pooling if available
            let bullet;
            if (this.game.poolManager) {
                bullet = this.game.poolManager.createBullet(
                    this.x + Math.cos(angle) * 25,
                    this.y + Math.sin(angle) * 25,
                    angle,
                    8, // speed
                    20, // damage
                    200, // range
                    2, // size
                    '#ffff00' // yellow color for machine gun
                );
                bullet.owner = 'tank'; // Mark as tank bullet
            } else {
                bullet = new Bullet(
                    this.game,
                    this.x + Math.cos(angle) * 25,
                    this.y + Math.sin(angle) * 25,
                    angle,
                    8, // speed
                    20, // damage
                    200, // range
                    2, // size
                    '#ffff00' // yellow color
                );
                bullet.owner = 'tank'; // Mark as tank bullet
            }
            
            this.game.addBullet(bullet);
            this.lastSecondaryShot = now;
            
            // Play machine gun sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('tank_machinegun', this.x, this.y);
            }
        }
    }
    
    createMuzzleFlash(angle) {
        // Create muzzle flash particles
        if (this.game.poolManager) {
            const particleCount = 8;
            for (let i = 0; i < particleCount; i++) {
                const particleAngle = angle + (Math.random() - 0.5) * 0.5;
                const speed = 2 + Math.random() * 3;
                const life = 20 + Math.random() * 20;
                const size = 3 + Math.random() * 3;
                
                const particle = this.game.poolManager.createParticle(
                    this.x + Math.cos(angle) * 30,
                    this.y + Math.sin(angle) * 30,
                    '#ffaa00',
                    life,
                    size,
                    particleAngle,
                    speed
                );
            }
        } else {
            // Fallback to direct particle creation
            for (let i = 0; i < 5; i++) {
                this.game.addParticle(new Particle(
                    this.game,
                    this.x + Math.cos(angle) * 30 + (Math.random() - 0.5) * 10,
                    this.y + Math.sin(angle) * 30 + (Math.random() - 0.5) * 10,
                    '#ffaa00',
                    30,
                    4 + Math.random() * 3
                ));
            }
        }
    }
    
    takeDamage(amount, fromAngle = null) {
        // Apply armor reduction based on angle of attack
        const damageReduction = this.calculateArmorReduction(fromAngle);
        const actualDamage = amount * (1 - damageReduction);
        
        this.health -= actualDamage;
        
        // Tank-specific damage effects
        if (this.health <= 0 && this.state !== 'dead') {
            this.state = 'dead';
            this.deathTime = Date.now();
            this.createTankExplosion();
            this.createVehicleWreckage(fromAngle);
            
            // Record kill in progression system
            if (this.game.progression) {
                this.game.progression.recordKill('tank');
            }
            
            // Play tank explosion sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('tank_explosion', this.x, this.y);
            }
        } else if (this.health > 0) {
            // Play damage sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('tank_damage', this.x, this.y);
            }
        }
    }
    
    calculateArmorReduction(fromAngle) {
        if (fromAngle === null) return 0.5; // Default 50% reduction for unknown angle
        
        // Calculate angle difference between tank facing and attack direction
        const angleDiff = Math.abs(this.normalizeAngle(fromAngle - this.angle));
        
        // Front armor (0-45 degrees from front): 80% reduction
        if (angleDiff < Math.PI / 4) {
            return 0.8;
        }
        // Side armor (45-135 degrees from front): 60% reduction
        else if (angleDiff < 3 * Math.PI / 4) {
            return 0.6;
        }
        // Rear armor (135+ degrees from front): 40% reduction
        else {
            return 0.4;
        }
    }
    
    createTankExplosion() {
        // Enhanced explosion effects for tank destruction
        const particleCount = 30;
        const smokeCount = 20;
        const spreadRadius = 60;
        
        // Create explosion particles
        for (let i = 0; i < particleCount; i++) {
            if (this.game.poolManager) {
                // Use object pooling if available
                const particle = this.game.poolManager.getParticle(
                    this.x + (Math.random() - 0.5) * spreadRadius,
                    this.y + (Math.random() - 0.5) * spreadRadius,
                    '#ff4500',
                    40,
                    5 + Math.random() * 5,
                    Math.random() * Math.PI * 2,
                    1 + Math.random() * 3
                );
            } else {
                // Fallback to direct particle creation
                this.game.addParticle(new Particle(
                    this.game,
                    this.x + (Math.random() - 0.5) * spreadRadius,
                    this.y + (Math.random() - 0.5) * spreadRadius,
                    '#ff4500',
                    40,
                    5 + Math.random() * 5
                ));
            }
        }
        
        // Create smoke particles
        for (let i = 0; i < smokeCount; i++) {
            if (this.game.poolManager) {
                const particle = this.game.poolManager.getParticle(
                    this.x + (Math.random() - 0.5) * (spreadRadius * 0.75),
                    this.y + (Math.random() - 0.5) * (spreadRadius * 0.75),
                    '#666666',
                    80,
                    8 + Math.random() * 10,
                    Math.random() * Math.PI * 2,
                    0.5 + Math.random() * 1
                );
            } else {
                this.game.addParticle(new Particle(
                    this.game,
                    this.x + (Math.random() - 0.5) * (spreadRadius * 0.75),
                    this.y + (Math.random() - 0.5) * (spreadRadius * 0.75),
                    '#666666',
                    80,
                    8 + Math.random() * 10
                ));
            }
        }
        
        // Camera shake for tank explosion
        if (this.game.camera) {
            this.game.camera.shake = 10;
            this.game.camera.shakeTimer = 1000;
        }
    }
    
    render(ctx, lodLevel = 'high') {
        if (this.state === 'dead') {
            // Dead tanks are handled by wreckage/corpse system
            return;
        }
        
        // Skip detailed rendering for distant objects
        if (lodLevel === 'skip') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (lodLevel === 'low') {
            // Low detail: just a dark gray rectangle
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 2);
        } else if (lodLevel === 'medium') {
            // Medium detail: basic tank shape
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Simple turret
            ctx.fillStyle = '#333333';
            ctx.fillRect(-5, -8, 10, 16);
        } else {
            // High detail: full tank rendering
            this.renderTankDetails(ctx);
        }
        
        ctx.restore();
        
        // Only draw health bar at high detail
        if (lodLevel === 'high' && this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }
    }
    
    renderTankDetails(ctx) {
        // Main tank body (rectangular with sloped edges)
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Tank details
        ctx.fillStyle = '#333333';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4);
        
        // Caterpillar tracks on both sides
        ctx.fillStyle = '#222222';
        ctx.fillRect(-this.width / 2 - 3, -this.height / 2 - 2, this.width + 6, 3); // Top track
        ctx.fillRect(-this.width / 2 - 3, this.height / 2 - 1, this.width + 6, 3); // Bottom track
        
        // Render turret (rotates independently)
        ctx.save();
        ctx.rotate(this.turretAngle - this.angle); // Relative to tank body
        
        // Turret base
        ctx.fillStyle = '#333333';
        ctx.fillRect(-8, -10, 16, 20);
        
        // Main cannon
        ctx.fillStyle = '#111111';
        ctx.fillRect(8, -2, 20, 4); // Cannon barrel
        
        // Machine gun (smaller cannon on top)
        ctx.fillStyle = '#000000';
        ctx.fillRect(5, -8, 15, 2);
        
        ctx.restore();
        
        // Exhaust smoke
        if (Math.random() < 0.1) {
            if (this.game.poolManager) {
                this.game.poolManager.createParticle(
                    this.x - Math.cos(this.angle) * (this.width / 2),
                    this.y - Math.sin(this.angle) * (this.width / 2),
                    '#999999',
                    60,
                    3 + Math.random() * 3,
                    this.angle + Math.PI + (Math.random() - 0.5) * 0.5,
                    0.5 + Math.random() * 0.5
                );
            } else {
                this.game.addParticle(new Particle(
                    this.game,
                    this.x - Math.cos(this.angle) * (this.width / 2),
                    this.y - Math.sin(this.angle) * (this.width / 2),
                    '#999999',
                    60,
                    3 + Math.random() * 3
                ));
            }
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
}

// Export Tank class
window.Tank = Tank;