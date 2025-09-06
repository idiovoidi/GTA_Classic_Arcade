/**
 * Bullet System for GTA Clone
 * Implements projectile physics, collision detection, and visual effects
 */

class Bullet {
    constructor(game, x, y, angle, speed, damage, range, size, color, explosive = false, explosionRadius = 0) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.maxRange = range;
        this.size = size;
        this.color = color;
        this.explosive = explosive;
        this.explosionRadius = explosionRadius;
        
        // Track bullet ownership for progression tracking
        this.owner = 'player'; // Default to player, can be overridden
        
        // Physics
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        
        // Collision
        this.radius = size;
        
        // Lifecycle
        this.life = range / speed * 1000; // Convert to milliseconds based on range
        this.active = true;
        this.distanceTraveled = 0;
        
        // Visual effects
        this.trail = [];
        this.trailLength = 5;
    }
    
    update(deltaTime) {
        if (!this.active || this.life <= 0) return;
        
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
        
        // Move bullet
        const moveDistance = this.speed * (deltaTime / 16.67); // Normalize to 60fps
        this.x += this.velocity.x * (deltaTime / 16.67);
        this.y += this.velocity.y * (deltaTime / 16.67);
        this.distanceTraveled += moveDistance;
        
        // Check range
        if (this.distanceTraveled >= this.maxRange) {
            this.life = 0;
            this.active = false;
            return;
        }
        
        // Check boundary collisions
        if (this.x < 0 || this.x > this.game.city.width || 
            this.y < 0 || this.y > this.game.city.height) {
            this.life = 0;
            this.active = false;
            return;
        }
        
        // Check collisions with entities
        this.checkCollisions();
        
        // Reduce life
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    checkCollisions() {
        // Use spatial grid if available for optimized collision detection
        if (this.game.spatialGrid) {
            const nearbyObjects = this.game.spatialGrid.getNearbyObjects(this);
            
            for (const obj of nearbyObjects) {
                if (this.shouldCheckCollision(obj) && this.game.checkCollision(this, obj)) {
                    this.hit(obj);
                    return;
                }
            }
        } else {
            // Fallback to original collision detection
            this.checkCollisionsBruteForce();
        }
        
        // Check collision with buildings (static objects)
        for (const building of this.game.city.buildings) {
            if (this.x >= building.x && this.x <= building.x + building.width &&
                this.y >= building.y && this.y <= building.y + building.height) {
                this.hit();
                return;
            }
        }
    }
    
    shouldCheckCollision(obj) {
        // Check if this object type should be hit by bullets
        return (obj.constructor.name === 'Pedestrian' && obj.state !== 'dead') ||
               (obj.constructor.name === 'Vehicle' && obj.state !== 'dead') ||
               (obj.constructor.name === 'Police' && obj.health > 0);
    }
    
    checkCollisionsBruteForce() {
        // Check collision with pedestrians
        for (let i = 0; i < this.game.pedestrians.length; i++) {
            const ped = this.game.pedestrians[i];
            if (ped.state !== 'dead' && this.game.checkCollision(this, ped)) {
                this.hit(ped);
                return;
            }
        }
        
        // Check collision with vehicles
        for (let i = 0; i < this.game.vehicles.length; i++) {
            const vehicle = this.game.vehicles[i];
            if (vehicle.state !== 'dead' && this.game.checkCollision(this, vehicle)) {
                this.hit(vehicle);
                return;
            }
        }
        
        // Check collision with police
        for (let i = 0; i < this.game.police.length; i++) {
            const cop = this.game.police[i];
            if (cop.health > 0 && this.game.checkCollision(this, cop)) {
                this.hit(cop);
                return;
            }
        }
    }
    
    hit(target = null) {
        this.life = 0;
        this.active = false;
        
        // Apply damage to target
        if (target && typeof target.takeDamage === 'function') {
            target.takeDamage(this.damage);
            
            // Record hit in progression system (only for player bullets)
            if (this.owner === 'player' && this.game.progression) {
                this.game.progression.recordShot(true); // Hit successful
                this.game.progression.recordDamage(this.damage, 'dealt');
            }
            
            // Play hit sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('impact', 0.5);
            }
            
            // Add score for player hits
            if (target !== this.game.player) {
                this.game.score += target.constructor.name === 'Pedestrian' ? 10 : 
                                 target.constructor.name === 'Vehicle' ? 50 : 
                                 target.constructor.name === 'Police' ? 100 : 0;
            }
        } else {
            // Record miss in progression system (only for player bullets)
            if (this.owner === 'player' && this.game.progression) {
                this.game.progression.recordShot(false); // Miss
            }
        }
        
        // Create impact particles
        this.createImpactEffect(target);
        
        // Handle explosive bullets
        if (this.explosive) {
            this.explode();
        }
    }
    
    createImpactEffect(target) {
        const particleCount = target ? 5 : 3;
        const particleColor = target ? '#ff0000' : '#ffff00';
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            
            this.game.addParticle(new Particle(
                this.game,
                this.x + (Math.random() - 0.5) * 10,
                this.y + (Math.random() - 0.5) * 10,
                particleColor,
                30,
                2,
                angle,
                speed
            ));
        }
    }
    
    explode() {
        // Play explosion sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('explosion', 0.8);
        }
        
        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const color = i < 10 ? '#ff4500' : '#ff8c00';
            
            this.game.addParticle(new Particle(
                this.game,
                this.x + (Math.random() - 0.5) * this.explosionRadius * 0.5,
                this.y + (Math.random() - 0.5) * this.explosionRadius * 0.5,
                color,
                80,
                3 + Math.random() * 3,
                angle,
                speed
            ));
        }
        
        // Create smoke particles
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            
            this.game.addParticle(new Particle(
                this.game,
                this.x + (Math.random() - 0.5) * this.explosionRadius * 0.3,
                this.y + (Math.random() - 0.5) * this.explosionRadius * 0.3,
                '#666666',
                120,
                4 + Math.random() * 4,
                angle,
                speed
            ));
        }
        
        // Damage nearby entities
        this.damageNearbyEntities();
        
        // Screen shake effect
        this.game.camera.shake = 10;
        this.game.camera.shakeTimer = 300;
    }
    
    damageNearbyEntities() {
        const entities = [
            ...this.game.pedestrians,
            ...this.game.vehicles,
            ...this.game.police
        ];
        
        // Add player to entities if not the shooter
        if (this.owner !== 'player') {
            entities.push(this.game.player);
        }
        
        entities.forEach(entity => {
            if (!entity || entity.health <= 0) return;
            
            const distance = this.game.getDistance(this, entity);
            if (distance < this.explosionRadius) {
                const explosionDamage = this.damage * (1 - distance / this.explosionRadius);
                entity.takeDamage(Math.floor(explosionDamage));
            }
        });
    }
    
    render(ctx) {
        if (!this.active || this.life <= 0) return;
        
        // Render bullet trail
        this.renderTrail(ctx);
        
        // Render main bullet
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Main bullet body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size, -this.size/2, this.size * 2, this.size);
        
        // Bullet tip (brighter)
        const tipColor = this.color === '#ffff00' ? '#ffffff' : 
                        this.color === '#ff0000' ? '#ffaaaa' : '#aaffaa';
        ctx.fillStyle = tipColor;
        ctx.fillRect(this.size * 0.5, -this.size/4, this.size, this.size/2);
        
        ctx.restore();
        
        // Render muzzle flash effect if bullet is young
        if (this.distanceTraveled < 20) {
            this.renderMuzzleFlash(ctx);
        }
    }
    
    renderTrail(ctx) {
        if (this.trail.length < 2) return;
        
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = this.size * 0.5;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderMuzzleFlash(ctx) {
        const flashIntensity = 1 - (this.distanceTraveled / 20);
        
        ctx.save();
        ctx.translate(this.x - Math.cos(this.angle) * 15, this.y - Math.sin(this.angle) * 15);
        ctx.rotate(this.angle);
        ctx.globalAlpha = flashIntensity * 0.6;
        
        // Outer flash
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(-5, -3, 10, 6);
        
        // Inner flash
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -2, 6, 4);
        
        ctx.restore();
    }
}

/**
 * Police Bullet - shoots only at player
 */
class PoliceBullet extends Bullet {
    constructor(game, x, y, angle) {
        super(game, x, y, angle, 6, 20, 180, 2, '#ff0000');
        this.owner = 'police';
    }
    
    checkCollisions() {
        // Only check collision with player
        if (this.game.player && this.game.checkCollision(this, this.game.player)) {
            this.hit(this.game.player);
            return;
        }
        
        // Check collision with buildings
        for (const building of this.game.city.buildings) {
            if (this.x >= building.x && this.x <= building.x + building.width &&
                this.y >= building.y && this.y <= building.y + building.height) {
                this.hit();
                return;
            }
        }
    }
}