class Vehicle {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 18;
        this.height = 36;
        this.radius = 15;
        this.health = 40;
        this.maxHealth = 40;
        
        // Movement
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.8 + Math.random() * 0.4;
        this.maxSpeed = 2;
        this.acceleration = 0.1;
        this.friction = 0.95;
        this.turnSpeed = 0.03;
        
        // AI
        this.targetX = x;
        this.targetY = y;
        this.path = [];
        this.currentPathIndex = 0;
        this.state = 'driving'; // driving, stopped, panicking
        this.stopTimer = 0;
        this.panicTimer = 0;
        
        // Visual properties
        this.colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6348', '#ff3838'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.tireMarks = [];
        
        // Find initial path
        this.findNewPath();
    }
    
    update(deltaTime) {
        if (this.state === 'dead') return;
        
        this.updateAI(deltaTime);
        this.updateMovement(deltaTime);
        this.updateTireMarks();
        
        // Keep within city bounds
        this.x = Math.max(0, Math.min(this.game.city.width, this.x));
        this.y = Math.max(0, Math.min(this.game.city.height, this.y));
    }
    
    updateAI(deltaTime) {
        // Check for nearby danger
        const danger = this.checkForDanger();
        
        if (danger) {
            this.state = 'panicking';
            this.panicTimer = 2000; // Panic for 2 seconds
            this.speed = Math.min(this.maxSpeed * 1.5, this.speed + 0.2);
            this.fleeFromDanger(danger);
        } else if (this.state === 'panicking') {
            this.panicTimer -= deltaTime;
            if (this.panicTimer <= 0) {
                this.state = 'driving';
                this.speed = 0.8 + Math.random() * 0.4;
            }
        } else {
            // Normal driving behavior
            this.followPath();
        }
        
        // Random stops
        if (this.state === 'driving' && Math.random() < 0.001) {
            this.state = 'stopped';
            this.stopTimer = 1000 + Math.random() * 2000; // 1-3 seconds
        }
        
        if (this.state === 'stopped') {
            this.stopTimer -= deltaTime;
            if (this.stopTimer <= 0) {
                this.state = 'driving';
            }
        }
    }
    
    checkForDanger() {
        // Check distance to player
        const playerDistance = this.game.getDistance(this, this.game.player);
        if (playerDistance < 80) {
            return { x: this.game.player.x, y: this.game.player.y, type: 'player' };
        }
        
        // Check distance to police
        for (const cop of this.game.police) {
            const copDistance = this.game.getDistance(this, cop);
            if (copDistance < 60) {
                return { x: cop.x, y: cop.y, type: 'police' };
            }
        }
        
        // Check for nearby gunshots
        for (const bullet of this.game.bullets) {
            const bulletDistance = this.game.getDistance(this, bullet);
            if (bulletDistance < 40) {
                return { x: bullet.x, y: bullet.y, type: 'gunshot' };
            }
        }
        
        return null;
    }
    
    fleeFromDanger(danger) {
        const angle = Math.atan2(this.y - danger.y, this.x - danger.x);
        this.angle = angle + (Math.random() - 0.5) * 0.3; // Add some randomness
    }
    
    followPath() {
        if (this.path.length === 0) {
            this.findNewPath();
            return;
        }
        
        const target = this.path[this.currentPathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
            this.currentPathIndex++;
            if (this.currentPathIndex >= this.path.length) {
                this.findNewPath();
            }
        } else {
            const targetAngle = Math.atan2(dy, dx);
            const angleDiff = this.normalizeAngle(targetAngle - this.angle);
            
            if (Math.abs(angleDiff) > 0.1) {
                this.angle += Math.sign(angleDiff) * this.turnSpeed;
            }
        }
    }
    
    findNewPath() {
        this.path = [];
        this.currentPathIndex = 0;
        
        // Generate a path with 2-4 waypoints
        const numWaypoints = 2 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numWaypoints; i++) {
            const roadPos = this.game.city.getRandomRoadPosition();
            this.path.push({ x: roadPos.x, y: roadPos.y });
        }
    }
    
    updateMovement(deltaTime) {
        if (this.state === 'stopped') {
            this.speed *= this.friction;
        } else {
            // Accelerate towards max speed
            this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration);
        }
        
        // Apply friction
        this.speed *= this.friction;
        
        // Move
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        
        // Add tire marks when moving fast
        if (Math.abs(this.speed) > 0.5) {
            this.addTireMark();
        }
    }
    
    updateTireMarks() {
        this.tireMarks.forEach(mark => {
            mark.life -= 1;
        });
        this.tireMarks = this.tireMarks.filter(mark => mark.life > 0);
    }
    
    addTireMark() {
        if (Math.random() < 0.2) {
            this.tireMarks.push({
                x: this.x + (Math.random() - 0.5) * this.width,
                y: this.y + (Math.random() - 0.5) * this.height,
                angle: this.angle,
                life: 80
            });
        }
    }
    
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.state = 'dead';
            this.createExplosion();
        }
    }
    
    createExplosion() {
        // Create explosion particles
        for (let i = 0; i < 15; i++) {
            this.game.addParticle(new Particle(
                this.x + (Math.random() - 0.5) * 40,
                this.y + (Math.random() - 0.5) * 40,
                '#ff4500',
                60,
                5
            ));
        }
        
        // Create smoke particles
        for (let i = 0; i < 10; i++) {
            this.game.addParticle(new Particle(
                this.x + (Math.random() - 0.5) * 30,
                this.y + (Math.random() - 0.5) * 30,
                '#666',
                100,
                8
            ));
        }
    }
    
    render(ctx) {
        if (this.state === 'dead') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Car body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Car details
        ctx.fillStyle = '#000';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4);
        
        // Windshield
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(-this.width / 2 + 3, -this.height / 2 + 3, this.width - 6, 6);
        
        // Headlights
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(-this.width / 2 + 1, -this.height / 2 + 1, 3, 3);
        ctx.fillRect(this.width / 2 - 4, -this.height / 2 + 1, 3, 3);
        
        // Direction indicator
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.width / 2 - 2, -2, 4, 4);
        
        ctx.restore();
        
        // Draw tire marks
        this.tireMarks.forEach(mark => {
            ctx.save();
            ctx.translate(mark.x, mark.y);
            ctx.rotate(mark.angle);
            ctx.fillStyle = `rgba(100, 100, 100, ${mark.life / 80})`;
            ctx.fillRect(-2, -1, 4, 2);
            ctx.restore();
        });
        
        // Health bar
        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }
    }
    
    renderHealthBar(ctx) {
        const barWidth = 25;
        const barHeight = 3;
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
