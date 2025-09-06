class Police {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 32;
        this.radius = 12;
        this.health = 50;
        this.maxHealth = 50;
        this.mass = 1.8; // Police cars are reinforced
        
        // Movement and AI
        this.speed = 1.5;
        this.angle = 0;
        this.targetX = x;
        this.targetY = y;
        this.velocity = { x: 0, y: 0 }; // Add velocity for collision physics
        this.state = 'patrolling'; // patrolling, chasing, attacking
        this.alertLevel = 0; // 0-100
        this.lastSeenPlayerX = 0;
        this.lastSeenPlayerY = 0;
        this.lastSeenTimer = 0;
        
        // Combat
        this.lastShot = 0;
        this.shootCooldown = 1000; // 1 second
        this.weaponRange = 150;
        
        // Visual properties
        this.color = '#0000ff';
        this.sirenOn = false;
        this.sirenTimer = 0;
    }
    
    update(deltaTime) {
        this.lastSeenTimer += deltaTime;
        this.sirenTimer += deltaTime;
        
        // Toggle siren
        if (this.sirenTimer > 500) {
            this.sirenOn = !this.sirenOn;
            this.sirenTimer = 0;
        }
        
        // AI behavior
        this.updateAI(deltaTime);
        
        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.angle = Math.atan2(dy, dx);
            this.velocity.x = Math.cos(this.angle) * this.speed;
            this.velocity.y = Math.sin(this.angle) * this.speed;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
        
        // Keep within city bounds
        this.x = Math.max(0, Math.min(this.game.city.width, this.x));
        this.y = Math.max(0, Math.min(this.game.city.height, this.y));
        
        // Shoot at player if in range and alert
        if (this.state === 'attacking' && this.canSeePlayer()) {
            this.shootAtPlayer();
        }
    }
    
    updateAI(deltaTime) {
        const playerDistance = this.game.getDistance(this, this.game.player);
        
        // Check if player is visible (not behind buildings)
        const canSeePlayer = this.canSeePlayer();
        
        if (canSeePlayer) {
            this.lastSeenPlayerX = this.game.player.x;
            this.lastSeenPlayerY = this.game.player.y;
            this.lastSeenTimer = 0;
            this.alertLevel = Math.min(100, this.alertLevel + 2);
        } else {
            this.alertLevel = Math.max(0, this.alertLevel - 1);
        }
        
        // State transitions
        if (this.alertLevel > 80) {
            this.state = 'attacking';
            this.targetX = this.game.player.x;
            this.targetY = this.game.player.y;
        } else if (this.alertLevel > 40) {
            this.state = 'chasing';
            if (this.lastSeenTimer < 3000) { // 3 seconds
                this.targetX = this.lastSeenPlayerX;
                this.targetY = this.lastSeenPlayerY;
            } else {
                this.state = 'patrolling';
            }
        } else {
            this.state = 'patrolling';
            this.patrol();
        }
    }
    
    canSeePlayer() {
        const playerDistance = this.game.getDistance(this, this.game.player);
        
        // Can't see if too far
        if (playerDistance > 200) return false;
        
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
    
    patrol() {
        // Simple patrol behavior - move to random points
        if (Math.random() < 0.01) { // 1% chance each frame
            const roadPos = this.game.city.getRandomRoadPosition();
            this.targetX = roadPos.x;
            this.targetY = roadPos.y;
        }
    }
    
    shootAtPlayer() {
        if (Date.now() - this.lastShot > this.shootCooldown) {
            const angle = Math.atan2(
                this.game.player.y - this.y,
                this.game.player.x - this.x
            );
            
            const bullet = new Bullet(
                this.game,
                this.x + Math.cos(angle) * 20,
                this.y + Math.sin(angle) * 20,
                angle,
                6, // speed
                15, // damage
                180, // range
                2, // size
                '#00ffff' // color
            );
            bullet.owner = 'police'; // Mark as police bullet
            
            this.game.addBullet(bullet);
            this.lastShot = Date.now();
            
            // Muzzle flash
            this.game.addParticle(new Particle(
                this.x + Math.cos(angle) * 20,
                this.y + Math.sin(angle) * 20,
                '#ffff00',
                15,
                0.3
            ));
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.alertLevel = 100; // Become fully alert when shot
        this.state = 'attacking';
        
        if (this.health <= 0) {
            this.createDeathParticles();
        }
    }
    
    createDeathParticles() {
        for (let i = 0; i < 8; i++) {
            this.game.addParticle(new Particle(
                this.x + (Math.random() - 0.5) * 30,
                this.y + (Math.random() - 0.5) * 30,
                this.color,
                40,
                4
            ));
        }
    }
    
    render(ctx, lodLevel = 'high') {
        if (lodLevel === 'skip') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (lodLevel === 'low') {
            // Low detail: just a blue square
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 2);
        } else if (lodLevel === 'medium') {
            // Medium detail: basic police car shape
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Basic police lights
            if (this.sirenOn) {
                ctx.fillStyle = '#ff0000';
            } else {
                ctx.fillStyle = '#0000ff';
            }
            ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, 4, 4);
        } else {
            // High detail: full police car rendering
            // Police car body
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Police car details
            ctx.fillStyle = '#fff';
            ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4);
            
            // Windshield
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(-this.width / 2 + 4, -this.height / 2 + 4, this.width - 8, 8);
            
            // Police lights
            if (this.sirenOn) {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, 4, 4);
                ctx.fillRect(this.width / 2 - 6, -this.height / 2 + 2, 4, 4);
            } else {
                ctx.fillStyle = '#0000ff';
                ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, 4, 4);
                ctx.fillRect(this.width / 2 - 6, -this.height / 2 + 2, 4, 4);
            }
            
            // Direction indicator
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.width / 2 - 2, -2, 4, 4);
        }
        
        ctx.restore();
        
        // Only show detailed UI at high detail
        if (lodLevel === 'high') {
            // Alert level indicator
            if (this.alertLevel > 0) {
                this.renderAlertIndicator(ctx);
            }
            
            // Health bar
            if (this.health < this.maxHealth) {
                this.renderHealthBar(ctx);
            }
        }
    }
    
    renderAlertIndicator(ctx) {
        const barWidth = 30;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - this.height / 2 - 15;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Alert level
        const alertPercent = this.alertLevel / 100;
        ctx.fillStyle = alertPercent > 0.7 ? '#ff0000' : alertPercent > 0.4 ? '#ffff00' : '#00ff00';
        ctx.fillRect(x, y, barWidth * alertPercent, barHeight);
    }
    
    renderHealthBar(ctx) {
        const barWidth = 30;
        const barHeight = 3;
        const x = this.x - barWidth / 2;
        const y = this.y - this.height / 2 - 10;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
}

// Export Police class
window.Police = Police;
