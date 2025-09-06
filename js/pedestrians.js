class Pedestrian {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.radius = 6;
        this.health = 30;
        this.maxHealth = 30;
        
        // Movement
        this.speed = 0.5 + Math.random() * 0.5;
        this.direction = Math.random() * Math.PI * 2;
        this.changeDirectionTimer = 0;
        this.changeDirectionInterval = 2000 + Math.random() * 3000; // 2-5 seconds
        
        // AI states
        this.state = 'walking'; // walking, running, panicking, dead
        this.targetX = x;
        this.targetY = y;
        this.panicTimer = 0;
        
        // Visual properties
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.animationFrame = 0;
        
        // Death and corpse properties
        this.corpse = null;
        this.deathTime = 0;
        this.bloodSplatterCreated = false;
        
        // Find initial target
        this.findNewTarget();
    }
    
    update(deltaTime) {
        if (this.state === 'dead') return;
        
        this.changeDirectionTimer += deltaTime;
        
        // Check for nearby danger (player, police, gunshots)
        const danger = this.checkForDanger();
        
        if (danger) {
            this.state = 'panicking';
            this.panicTimer = 3000; // Panic for 3 seconds
            this.speed = 1.5; // Run faster when panicking
            this.fleeFromDanger(danger);
        } else if (this.state === 'panicking') {
            this.panicTimer -= deltaTime;
            if (this.panicTimer <= 0) {
                this.state = 'walking';
                this.speed = 0.5 + Math.random() * 0.5;
            }
        } else {
            // Normal walking behavior
            this.walkToTarget();
        }
        
        // Move
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
        
        // Keep within city bounds
        this.x = Math.max(0, Math.min(this.game.city.width, this.x));
        this.y = Math.max(0, Math.min(this.game.city.height, this.y));
        
        // Change direction occasionally
        if (this.changeDirectionTimer > this.changeDirectionInterval) {
            this.findNewTarget();
            this.changeDirectionTimer = 0;
            this.changeDirectionInterval = 2000 + Math.random() * 3000;
        }
        
        // Animation
        this.animationFrame += deltaTime * 0.01;
    }
    
    checkForDanger() {
        // Check distance to player
        const playerDistance = this.game.getDistance(this, this.game.player);
        if (playerDistance < 100) {
            return { x: this.game.player.x, y: this.game.player.y, type: 'player' };
        }
        
        // Check distance to police
        for (const cop of this.game.police) {
            const copDistance = this.game.getDistance(this, cop);
            if (copDistance < 80) {
                return { x: cop.x, y: cop.y, type: 'police' };
            }
        }
        
        // Check for nearby gunshots (bullets)
        for (const bullet of this.game.bullets) {
            const bulletDistance = this.game.getDistance(this, bullet);
            if (bulletDistance < 50) {
                return { x: bullet.x, y: bullet.y, type: 'gunshot' };
            }
        }
        
        return null;
    }
    
    fleeFromDanger(danger) {
        const angle = Math.atan2(this.y - danger.y, this.x - danger.x);
        this.direction = angle + (Math.random() - 0.5) * 0.5; // Add some randomness
    }
    
    walkToTarget() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) {
            this.findNewTarget();
        } else {
            this.direction = Math.atan2(dy, dx);
        }
    }
    
    findNewTarget() {
        // Try to find a position on a road
        const roadPos = this.game.city.getRandomRoadPosition();
        this.targetX = roadPos.x;
        this.targetY = roadPos.y;
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
                this.game.progression.recordKill('pedestrian');
            }
        }
    }
    
    /**
     * Create blood splatter effect when pedestrian dies
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
            if (window.BloodParticle) {
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
                        continue; // Use pooled particle instead
                    }
                } catch (error) {
                    // Fall back to regular particle creation
                }
            }
            
            // Add particle to game
            if (this.game.addParticle) {
                this.game.addParticle(bloodParticle);
            } else if (this.game.particles) {
                this.game.particles.push(bloodParticle);
            }
        }
        
        // Create additional smaller blood droplets
        for (let i = 0; i < 8; i++) {
            const dropAngle = Math.random() * Math.PI * 2;
            const dropSpeed = 0.5 + Math.random() * 1.5;
            const dropSize = 0.5 + Math.random() * 1;
            
            const bloodDrop = new Particle(
                this.game,
                this.x + (Math.random() - 0.5) * 25,
                this.y + (Math.random() - 0.5) * 25,
                '#660000',
                60 + Math.random() * 40,
                dropSize,
                dropAngle,
                dropSpeed
            );
            
            if (this.game.addParticle) {
                this.game.addParticle(bloodDrop);
            } else if (this.game.particles) {
                this.game.particles.push(bloodDrop);
            }
        }
    }
    
    /**
     * Create persistent corpse object
     */
    createCorpse() {
        this.corpse = {
            x: this.x,
            y: this.y,
            angle: this.direction,
            color: this.color,
            width: this.width,
            height: this.height,
            bloodStains: this.createBloodStains(),
            creationTime: Date.now(),
            alpha: 1.0,
            priority: this.calculateCorpsePriority()
        };
        
        // Add corpse to game's corpse management system
        if (this.game.addCorpse) {
            this.game.addCorpse(this.corpse);
        } else {
            // Fallback: create corpses array if it doesn't exist
            if (!this.game.corpses) {
                this.game.corpses = [];
            }
            this.game.corpses.push(this.corpse);
        }
    }
    
    /**
     * Create blood stains around the corpse
     * @returns {Array} Array of blood stain objects
     */
    createBloodStains() {
        const stains = [];
        const stainCount = 5 + Math.random() * 8; // 5-13 stains
        
        for (let i = 0; i < stainCount; i++) {
            stains.push({
                x: this.x + (Math.random() - 0.5) * 30,
                y: this.y + (Math.random() - 0.5) * 30,
                size: 2 + Math.random() * 4,
                color: ['#4a0000', '#660000', '#800000', '#330000'][Math.floor(Math.random() * 4)],
                alpha: 0.6 + Math.random() * 0.4
            });
        }
        
        return stains;
    }
    
    /**
     * Calculate priority for corpse cleanup (higher priority = keep longer)
     * @returns {number} Priority score
     */
    calculateCorpsePriority() {
        let priority = 1;
        
        // Higher priority if closer to player
        const distanceToPlayer = this.game.getDistance(this, this.game.player);
        if (distanceToPlayer < 200) priority += 3;
        else if (distanceToPlayer < 400) priority += 2;
        else if (distanceToPlayer < 600) priority += 1;
        
        // Higher priority if visible on screen
        if (this.game.isInViewport && this.game.isInViewport(this)) {
            priority += 2;
        }
        
        return priority;
    }
    
    render(ctx, lodLevel = 'high') {
        if (this.state === 'dead') {
            // Dead pedestrians are now handled by corpse system
            return;
        }
        
        if (lodLevel === 'skip') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction);
        
        if (lodLevel === 'low') {
            // Low detail: just a colored dot
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (lodLevel === 'medium') {
            // Medium detail: simple body shape
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 2);
        } else {
            // High detail: full pedestrian rendering
            // Body
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Head
            ctx.fillStyle = '#ffdbac';
            ctx.beginPath();
            ctx.arc(0, -this.height / 2 - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Walking animation
            if (this.state === 'walking' || this.state === 'panicking') {
                const legOffset = Math.sin(this.animationFrame * 10) * 2;
                ctx.fillStyle = '#000';
                ctx.fillRect(-2, this.height / 2 - 2 + legOffset, 1, 4);
                ctx.fillRect(1, this.height / 2 - 2 - legOffset, 1, 4);
            }
            
            // Panic indicator
            if (this.state === 'panicking') {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(-1, -this.height / 2 - 6, 2, 2);
            }
        }
        
        ctx.restore();
        
        // Health bar only at high detail
        if (lodLevel === 'high' && this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }
    }
    
    renderHealthBar(ctx) {
        const barWidth = 16;
        const barHeight = 2;
        const x = this.x - barWidth / 2;
        const y = this.y - this.height / 2 - 8;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
}
