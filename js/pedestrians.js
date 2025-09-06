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
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.state = 'dead';
            this.createDeathParticles();
        }
    }
    
    createDeathParticles() {
        for (let i = 0; i < 5; i++) {
            this.game.addParticle(new Particle(
                this.x + (Math.random() - 0.5) * 20,
                this.y + (Math.random() - 0.5) * 20,
                this.color,
                30,
                3
            ));
        }
    }
    
    render(ctx, lodLevel = 'high') {
        if (this.state === 'dead') return;
        
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
