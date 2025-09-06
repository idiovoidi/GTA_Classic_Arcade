class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40; // Length of the car (front to back)
        this.height = 20; // Width of the car (side to side)
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
        this.mass = 2; // Player car is heavier
        
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
        
        // Audio
        this.engineSound = null;
        this.lastEngineUpdate = 0;
        
        // Visual properties
        this.color = '#00ff00';
        this.tireMarks = [];
        this.invincible = false;
        this.invincibilityTimer = 0;
        
        // Boost system
        this.boost = 50; // Start with 50% boost
        this.maxBoost = 100;
        this.boostDrain = 35; // Boost consumed per second when active
        this.boostRecharge = 15; // Boost recharged per second when not active (disabled for now)
        this.boostRegenEnabled = false; // Disable automatic regeneration
        this.boostActive = false;
        this.boostMultiplier = 2.0; // Speed multiplier when boost is active
        this.boostMinimum = 10; // Minimum boost needed to activate
    }
    
    update(deltaTime) {
        this.handleInput();
        this.updatePhysics();
        this.updateTireMarks();
        this.updateWeapon(deltaTime);
        this.updatePowerUps(deltaTime);
        this.updateInvincibility(deltaTime);
        this.updateEngineSound(deltaTime);
        this.updateBoost(deltaTime);
        
        // Keep player within city bounds
        this.x = Math.max(0, Math.min(this.game.city.width, this.x));
        this.y = Math.max(0, Math.min(this.game.city.height, this.y));
    }
    
    handleInput() {
        const keys = this.game.keys;
        
        // Forward/backward movement
        let currentMaxSpeed = this.maxSpeed;
        if (this.boostActive) {
            currentMaxSpeed *= this.boostMultiplier;
        }
        
        if (keys['KeyW'] || keys['ArrowUp']) {
            this.speed = Math.min(currentMaxSpeed, this.speed + this.acceleration);
        } else if (keys['KeyS'] || keys['ArrowDown']) {
            this.speed = Math.max(-currentMaxSpeed * 0.5, this.speed - this.acceleration);
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
        
        // Boost (Left Shift)
        if (keys['ShiftLeft'] && this.boost >= this.boostMinimum) {
            this.boostActive = true;
        } else {
            this.boostActive = false;
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
        // Apply boost multiplier to max speed if boost is active
        let currentMaxSpeed = this.maxSpeed;
        if (this.boostActive) {
            currentMaxSpeed *= this.boostMultiplier;
        }
        
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
        
        // Add boost-specific tire marks when boosting
        if (this.boostActive && Math.abs(this.speed) > 2) {
            this.addBoostTireMark();
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
                life: 100,
                boost: false
            });
        }
    }
    
    addBoostTireMark() {
        if (Math.random() < 0.6) { // More frequent boost marks
            this.tireMarks.push({
                x: this.x + (Math.random() - 0.5) * this.width,
                y: this.y + (Math.random() - 0.5) * this.height,
                angle: this.angle,
                life: 150, // Boost marks last longer
                boost: true
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
        
        // Draw windshield at the front
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(this.width / 2 - 10, -this.height / 2 + 4, 8, this.height - 8);
        
        // Draw headlights at the front
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.width / 2 - 2, -this.height / 2 + 2, 4, 4);
        ctx.fillRect(this.width / 2 - 2, this.height / 2 - 6, 4, 4);
        
        // Draw direction indicator at the very front
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.width / 2 - 1, -2, 3, 4);
        
        ctx.restore();
        
        // Draw tire marks
        this.tireMarks.forEach(mark => {
            ctx.save();
            ctx.translate(mark.x, mark.y);
            ctx.rotate(mark.angle);
            
            if (mark.boost) {
                // Boost tire marks are brighter and wider
                ctx.fillStyle = `rgba(255, 100, 0, ${mark.life / 150})`;
                ctx.fillRect(-3, -1.5, 6, 3);
            } else {
                // Normal tire marks
                ctx.fillStyle = `rgba(100, 100, 100, ${mark.life / 100})`;
                ctx.fillRect(-2, -1, 4, 2);
            }
            
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
     * Update boost system
     * @param {number} deltaTime - Delta time
     */
    updateBoost(deltaTime) {
        const deltaSeconds = deltaTime / 1000; // Convert to seconds
        
        if (this.boostActive && this.boost > 0) {
            // Drain boost when active
            this.boost -= this.boostDrain * deltaSeconds;
            this.boost = Math.max(0, this.boost);
            
            // Deactivate boost if depleted
            if (this.boost <= 0) {
                this.boostActive = false;
            }
        } else if (!this.boostActive && this.boost < this.maxBoost && this.boostRegenEnabled) {
            // Only recharge boost when regen is enabled (currently disabled)
            this.boost += this.boostRecharge * deltaSeconds;
            this.boost = Math.min(this.maxBoost, this.boost);
        }
    }
    /**
     * Update engine sound based on speed
     * @param {number} deltaTime - Delta time
     */
    updateEngineSound(deltaTime) {
        if (!this.game.audioManager) return;
        
        this.lastEngineUpdate += deltaTime;
        
        // Update engine sound every 100ms
        if (this.lastEngineUpdate > 100) {
            const speedRatio = Math.abs(this.speed) / this.maxSpeed;
            const pitch = 0.8 + speedRatio * 0.6; // Pitch varies from 0.8 to 1.4
            const volume = 0.2 + speedRatio * 0.3; // Volume varies from 0.2 to 0.5
            
            // Play engine sound if moving
            if (Math.abs(this.speed) > 0.1) {
                if (!this.engineSound || this.engineSound.playbackState === 'finished') {
                    this.engineSound = this.game.audioManager.playSound('car_engine', volume, pitch, true);
                }
            } else {
                // Stop engine sound when not moving
                if (this.engineSound && this.engineSound.stop) {
                    this.engineSound.stop();
                    this.engineSound = null;
                }
            }
            
            this.lastEngineUpdate = 0;
        }
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
        
        // Add heat for shooting
        if (this.game.addHeat) {
            this.game.addHeat(this.game.wantedSystem.crimeHeat.shooting, 'shooting');
        }
        
        // Record shot in progression system
        if (this.game.progression) {
            this.game.progression.recordShot(false); // Will be updated to true if hit is detected
        }
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
        
        // Record damage taken in progression system
        if (this.game.progression) {
            this.game.progression.recordDamage(damage, 'taken');
        }
        
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
        
        // Reduce wanted level significantly when player dies
        if (this.game.addHeat) {
            this.game.addHeat(-30, 'player_death'); // Reduce heat when dying
        } else {
            this.game.increaseWantedLevel(1); // Fallback to old system
        }
        
        // Trigger death music
        if (this.game.audioManager) {
            this.game.audioManager.setMusicState('death');
        }
    }
    
    /**
     * Add boost amount
     * @param {number} amount - Amount to add to boost
     */
    addBoost(amount) {
        this.boost = Math.min(this.maxBoost, this.boost + amount);
        
        // Show boost pickup effect
        if (this.game.addTextEffect) {
            this.game.addTextEffect(
                this.x,
                this.y - 40,
                `+${amount} Boost!`,
                '#00ccff',
                1500
            );
        }
    }
    
    /**
     * Enable or disable boost regeneration (for future implementations)
     * @param {boolean} enabled - Whether to enable boost regeneration
     */
    setBoostRegeneration(enabled) {
        this.boostRegenEnabled = enabled;
    }
    
    /**
     * Get player info for UI
     * @returns {Object} Player information
     */
    getInfo() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            boost: this.boost,
            maxBoost: this.maxBoost,
            boostActive: this.boostActive,
            weapon: this.weapon ? this.weapon.getInfo() : null,
            powerUps: Array.from(this.activePowerUps.entries()).map(([type, powerUp]) => ({
                type: type,
                value: powerUp.value,
                duration: powerUp.duration,
                maxDuration: powerUp.maxDuration
            }))
        };
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}