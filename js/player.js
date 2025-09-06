class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 40;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 4;
        this.acceleration = 0.2;
        this.friction = 0.95;
        this.turnSpeed = 0.05;
        
        // Car physics
        this.velocity = { x: 0, y: 0 };
        this.health = 100;
        this.maxHealth = 100;
        
        // Shooting
        this.lastShot = 0;
        this.shootCooldown = 200; // milliseconds
        
        // Visual properties
        this.color = '#00ff00';
        this.tireMarks = [];
    }
    
    update(deltaTime) {
        this.handleInput();
        this.updatePhysics();
        this.updateTireMarks();
        
        // Keep player within city bounds
        this.x = Math.max(0, Math.min(this.game.city.width, this.x));
        this.y = Math.max(0, Math.min(this.game.city.height, this.y));
    }
    
    handleInput() {
        const keys = this.game.keys;
        
        // Forward/backward movement
        if (keys['KeyW'] || keys['ArrowUp']) {
            this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration);
        } else if (keys['KeyS'] || keys['ArrowDown']) {
            this.speed = Math.max(-this.maxSpeed * 0.5, this.speed - this.acceleration);
        } else {
            this.speed *= this.friction;
        }
        
        // Turning (only when moving)
        if (Math.abs(this.speed) > 0.1) {
            if (keys['KeyA'] || keys['ArrowLeft']) {
                this.angle -= this.turnSpeed * (this.speed / this.maxSpeed);
            }
            if (keys['KeyD'] || keys['ArrowRight']) {
                this.angle += this.turnSpeed * (this.speed / this.maxSpeed);
            }
        }
        
        // Handbrake
        if (keys['Space']) {
            this.speed *= 0.9;
        }
        
        // Shooting
        if (this.game.mouse.clicked && Date.now() - this.lastShot > this.shootCooldown) {
            this.shoot();
            this.lastShot = Date.now();
        }
    }
    
    updatePhysics() {
        // Calculate velocity based on speed and angle
        this.velocity.x = Math.cos(this.angle) * this.speed;
        this.velocity.y = Math.sin(this.angle) * this.speed;
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Add tire marks when moving fast
        if (Math.abs(this.speed) > 1) {
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
        if (Math.random() < 0.3) { // Only add marks occasionally
            this.tireMarks.push({
                x: this.x + (Math.random() - 0.5) * this.width,
                y: this.y + (Math.random() - 0.5) * this.height,
                angle: this.angle,
                life: 100
            });
        }
    }
    
    shoot() {
        const mouseWorldX = this.game.mouse.x + this.game.camera.x;
        const mouseWorldY = this.game.mouse.y + this.game.camera.y;
        
        const angle = Math.atan2(mouseWorldY - this.y, mouseWorldX - this.x);
        
        const bullet = new Bullet(
            this.game,
            this.x + Math.cos(angle) * 30,
            this.y + Math.sin(angle) * 30,
            angle
        );
        
        this.game.addBullet(bullet);
        
        // Add muzzle flash particle
        this.game.addParticle(new Particle(
            this.x + Math.cos(angle) * 30,
            this.y + Math.sin(angle) * 30,
            '#ffff00',
            10,
            0.5
        ));
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw car body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw car details
        ctx.fillStyle = '#000';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4);
        
        // Draw windshield
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(-this.width / 2 + 4, -this.height / 2 + 4, this.width - 8, 8);
        
        // Draw headlights
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, 4, 4);
        ctx.fillRect(this.width / 2 - 6, -this.height / 2 + 2, 4, 4);
        
        // Draw direction indicator
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.width / 2 - 2, -2, 4, 4);
        
        ctx.restore();
        
        // Draw tire marks
        this.tireMarks.forEach(mark => {
            ctx.save();
            ctx.translate(mark.x, mark.y);
            ctx.rotate(mark.angle);
            ctx.fillStyle = `rgba(100, 100, 100, ${mark.life / 100})`;
            ctx.fillRect(-2, -1, 4, 2);
            ctx.restore();
        });
        
        // Draw health bar
        this.renderHealthBar(ctx);
    }
    
    renderHealthBar(ctx) {
        const barWidth = 40;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - this.height / 2 - 10;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            // Game over logic could go here
        }
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}

class Bullet {
    constructor(game, x, y, angle) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 8;
        this.life = 100;
        this.damage = 25;
        this.radius = 2;
    }
    
    update(deltaTime) {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life--;
        
        // Check collisions with pedestrians
        this.game.pedestrians.forEach(ped => {
            if (this.game.checkCollision(this, ped)) {
                ped.takeDamage(this.damage);
                this.life = 0;
            }
        });
        
        // Check collisions with vehicles
        this.game.vehicles.forEach(vehicle => {
            if (this.game.checkCollision(this, vehicle)) {
                vehicle.takeDamage(this.damage);
                this.life = 0;
            }
        });
        
        // Check collisions with police
        this.game.police.forEach(cop => {
            if (this.game.checkCollision(this, cop)) {
                cop.takeDamage(this.damage);
                this.life = 0;
            }
        });
        
        // Remove if out of bounds
        if (this.x < 0 || this.x > this.game.city.width || 
            this.y < 0 || this.y > this.game.city.height) {
            this.life = 0;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color, life, size = 2) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        };
    }
    
    update(deltaTime) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
}
