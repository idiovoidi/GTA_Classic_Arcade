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
        this.radius = 15;
        
        // Weapon system
        this.weapon = new Weapon('pistol', this.game);
        this.weapons = ['pistol', 'shotgun', 'uzi', 'rifle', 'rocket'];
        this.currentWeaponIndex = 0;
        
        // Power-up system
        this.powerUps = new Map();
        this.activePowerUps = new Map();
        
        // Shooting
        this.lastShot = 0;
        this.shootCooldown = 200; // milliseconds
        
        // Visual properties
        this.color = '#00ff00';
        this.tireMarks = [];
        this.invincible = false;
        this.invincibilityTimer = 0;
    }
    
    update(deltaTime) {
        this.handleInput();
        this.updatePhysics();
        this.updateTireMarks();
        this.updateWeapon(deltaTime);
        this.updatePowerUps(deltaTime);
        this.updateInvincibility(deltaTime);
        
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
        
        // Weapon switching
        if (keys['Digit1']) {
            this.switchWeapon(0); // Pistol
        } else if (keys['Digit2']) {
            this.switchWeapon(1); // Shotgun
        } else if (keys['Digit3']) {
            this.switchWeapon(2); // Uzi
        } else if (keys['Digit4']) {
            this.switchWeapon(3); // Rifle
        } else if (keys['Digit5']) {
            this.switchWeapon(4); // Rocket
        }
        
        // Reload
        if (keys['KeyR']) {
            this.reloadWeapon();
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
    
    render(ctx) {
        // Render invincibility effect
        if (this.invincible) {
            ctx.save();
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this.invincibilityTimer * 0.01);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
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
        
        // Render weapon
        if (this.weapon) {
            this.weapon.render(ctx);
        }
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
    
    /**
     * Update weapon
     * @param {number} deltaTime - Delta time
     */
    updateWeapon(deltaTime) {
        if (this.weapon) {
            this.weapon.update(deltaTime);
        }
    }
    
    /**
     * Switch weapon
     * @param {number} weaponIndex - Weapon index
     */
    switchWeapon(weaponIndex) {
        if (weaponIndex >= 0 && weaponIndex < this.weapons.length) {
            this.currentWeaponIndex = weaponIndex;
            this.weapon = new Weapon(this.weapons[weaponIndex], this.game);
        }
    }
    
    /**
     * Reload current weapon
     */
    reloadWeapon() {
        if (this.weapon && !this.weapon.isReloading) {
            this.weapon.startReload();
        }
    }
    
    /**
     * Shoot weapon
     */
    shoot() {
        if (!this.weapon) return;
        
        // Calculate shooting angle towards mouse
        const mouseX = this.game.mouse.x + this.game.camera.x;
        const mouseY = this.game.mouse.y + this.game.camera.y;
        const angle = Math.atan2(mouseY - this.y, mouseX - this.x);
        
        // Apply power-up modifiers
        let modifiedWeapon = this.weapon;
        if (this.activePowerUps.has('rapid_fire')) {
            modifiedWeapon = this.createModifiedWeapon('rapid_fire');
        }
        if (this.activePowerUps.has('multi_shot')) {
            this.shootMultiShot(angle);
            return;
        }
        if (this.activePowerUps.has('explosive_ammo')) {
            modifiedWeapon = this.createModifiedWeapon('explosive_ammo');
        }
        
        // Fire weapon
        modifiedWeapon.fire(this.x, this.y, angle);
    }
    
    /**
     * Shoot multiple bullets (multi-shot power-up)
     * @param {number} angle - Base shooting angle
     */
    shootMultiShot(angle) {
        const multiShotCount = this.activePowerUps.get('multi_shot')?.value || 3;
        const spread = 0.3; // radians
        
        for (let i = 0; i < multiShotCount; i++) {
            const offset = (i - (multiShotCount - 1) / 2) * spread / multiShotCount;
            const shotAngle = angle + offset;
            this.weapon.fire(this.x, this.y, shotAngle);
        }
    }
    
    /**
     * Create modified weapon for power-ups
     * @param {string} powerUpType - Power-up type
     * @returns {Weapon} Modified weapon
     */
    createModifiedWeapon(powerUpType) {
        const modifiedWeapon = new Weapon(this.weapon.type, this.game);
        
        if (powerUpType === 'rapid_fire') {
            const multiplier = this.activePowerUps.get('rapid_fire')?.value || 0.3;
            modifiedWeapon.config.fireRate *= multiplier;
        }
        
        if (powerUpType === 'explosive_ammo') {
            modifiedWeapon.config.explosive = true;
            modifiedWeapon.config.explosionRadius = 50;
        }
        
        return modifiedWeapon;
    }
    
    /**
     * Update power-ups
     * @param {number} deltaTime - Delta time
     */
    updatePowerUps(deltaTime) {
        // Update active power-ups
        for (const [type, powerUp] of this.activePowerUps) {
            powerUp.duration -= deltaTime;
            
            if (powerUp.duration <= 0) {
                this.removePowerUp(type);
            }
        }
    }
    
    /**
     * Add power-up
     * @param {string} type - Power-up type
     * @param {number} value - Power-up value
     * @param {number} duration - Power-up duration
     */
    addPowerUp(type, value, duration) {
        this.activePowerUps.set(type, {
            value: value,
            duration: duration,
            maxDuration: duration
        });
        
        // Apply immediate effects
        this.applyPowerUpEffect(type, value);
    }
    
    /**
     * Remove power-up
     * @param {string} type - Power-up type
     */
    removePowerUp(type) {
        this.activePowerUps.delete(type);
        this.removePowerUpEffect(type);
    }
    
    /**
     * Apply power-up effect
     * @param {string} type - Power-up type
     * @param {number} value - Power-up value
     */
    applyPowerUpEffect(type, value) {
        switch (type) {
            case 'speed':
                this.maxSpeed *= value;
                break;
            case 'damage':
                // Damage multiplier is handled in weapon creation
                break;
            case 'invincibility':
                this.invincible = true;
                this.invincibilityTimer = 0;
                break;
        }
    }
    
    /**
     * Remove power-up effect
     * @param {string} type - Power-up type
     */
    removePowerUpEffect(type) {
        switch (type) {
            case 'speed':
                this.maxSpeed = 4; // Reset to default
                break;
            case 'damage':
                // Damage multiplier is handled in weapon creation
                break;
            case 'invincibility':
                this.invincible = false;
                break;
        }
    }
    
    /**
     * Update invincibility
     * @param {number} deltaTime - Delta time
     */
    updateInvincibility(deltaTime) {
        if (this.invincible) {
            this.invincibilityTimer += deltaTime;
        }
    }
    
    /**
     * Take damage (with invincibility check)
     * @param {number} damage - Damage amount
     */
    takeDamage(damage) {
        if (this.invincible) return;
        
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            // Handle death
            this.handleDeath();
        }
    }
    
    /**
     * Handle player death
     */
    handleDeath() {
        // Create death effect
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.game.particles.push(new Particle(
                this.game,
                this.x,
                this.y,
                '#ff0000',
                speed,
                1.0,
                angle
            ));
        }
        
        // Reset player
        this.health = this.maxHealth;
        this.x = this.game.city.width / 2;
        this.y = this.game.city.height / 2;
        this.speed = 0;
        this.velocity = { x: 0, y: 0 };
        
        // Clear power-ups
        this.activePowerUps.clear();
        this.invincible = false;
        
        // Increase wanted level
        this.game.increaseWantedLevel(1);
    }
    
    /**
     * Get player info for UI
     * @returns {Object} Player information
     */
    getInfo() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            weapon: this.weapon ? this.weapon.getInfo() : null,
            powerUps: Array.from(this.activePowerUps.entries()).map(([type, powerUp]) => ({
                type: type,
                value: powerUp.value,
                duration: powerUp.duration,
                maxDuration: powerUp.maxDuration
            }))
        };
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