// Vehicle type definitions
const VEHICLE_TYPES = {
    SEDAN: {
        name: 'Sedan',
        width: 36, // Length of the car (front to back)
        height: 18, // Width of the car (side to side)
        radius: 15,
        health: 40,
        mass: 1.5,
        maxSpeed: 2.0,
        acceleration: 0.1,
        turnSpeed: 0.03,
        colors: ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6348', '#ff3838'],
        spawnWeight: 50 // Higher = more common
    },
    SPORTS_CAR: {
        name: 'Sports Car',
        width: 32, // Length of the car
        height: 16, // Width of the car
        radius: 14,
        health: 35,
        mass: 1.2,
        maxSpeed: 3.5,
        acceleration: 0.15,
        turnSpeed: 0.04,
        colors: ['#ff0000', '#ffff00', '#ff8c00', '#9400d3', '#00ffff'],
        spawnWeight: 15
    },
    TRUCK: {
        name: 'Truck',
        width: 45, // Length of the truck
        height: 22, // Width of the truck
        radius: 20,
        health: 80,
        mass: 3.0,
        maxSpeed: 1.2,
        acceleration: 0.06,
        turnSpeed: 0.02,
        colors: ['#654321', '#8b4513', '#228b22', '#4682b4', '#696969'],
        spawnWeight: 20
    },
    MOTORCYCLE: {
        name: 'Motorcycle',
        width: 24, // Length of the motorcycle
        height: 10, // Width of the motorcycle
        radius: 8,
        health: 15,
        mass: 0.8,
        maxSpeed: 2.8,
        acceleration: 0.12,
        turnSpeed: 0.06,
        colors: ['#000000', '#ff0000', '#0000ff', '#ffd700', '#800080'],
        spawnWeight: 15
    }
};

class Vehicle {
    constructor(game, x, y, vehicleType = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        
        // Determine vehicle type if not specified
        if (!vehicleType) {
            vehicleType = this.selectRandomVehicleType();
        }
        
        this.vehicleType = vehicleType;
        const typeData = VEHICLE_TYPES[vehicleType];
        
        // Apply vehicle type properties
        this.width = typeData.width;
        this.height = typeData.height;
        this.radius = typeData.radius;
        this.health = typeData.health;
        this.maxHealth = typeData.health;
        this.mass = typeData.mass;
        
        // Movement properties based on vehicle type
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.8 + Math.random() * 0.4;
        this.maxSpeed = typeData.maxSpeed;
        this.acceleration = typeData.acceleration;
        this.friction = 0.95;
        this.turnSpeed = typeData.turnSpeed;
        this.velocity = { x: 0, y: 0 };
        
        // AI properties
        this.targetX = x;
        this.targetY = y;
        this.path = [];
        this.currentPathIndex = 0;
        this.state = 'driving'; // driving, stopped, panicking, dead
        this.stopTimer = 0;
        this.panicTimer = 0;
        
        // Visual properties
        this.color = typeData.colors[Math.floor(Math.random() * typeData.colors.length)];
        this.tireMarks = [];
        
        // Death and corpse properties
        this.corpse = null;
        this.deathTime = 0;
        this.wreckageCreated = false;
        
        // Vehicle-specific behavior modifiers
        this.setupVehicleBehavior();
        
        // Find initial path
        this.findNewPath();
    }
    
    selectRandomVehicleType() {
        const types = Object.keys(VEHICLE_TYPES);
        const weights = types.map(type => VEHICLE_TYPES[type].spawnWeight);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let random = Math.random() * totalWeight;
        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return types[i];
            }
        }
        
        return 'SEDAN'; // Fallback
    }
    
    setupVehicleBehavior() {
        switch (this.vehicleType) {
            case 'SPORTS_CAR':
                // Sports cars are more aggressive, take more risks
                this.aggressiveness = 0.8;
                this.riskTolerance = 0.7;
                break;
            case 'TRUCK':
                // Trucks are slower but more cautious
                this.aggressiveness = 0.3;
                this.riskTolerance = 0.2;
                break;
            case 'MOTORCYCLE':
                // Motorcycles are agile and take risks
                this.aggressiveness = 0.6;
                this.riskTolerance = 0.8;
                break;
            default: // SEDAN
                this.aggressiveness = 0.5;
                this.riskTolerance = 0.4;
                break;
        }
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
            
            // Vehicle-specific panic behavior
            const panicSpeedMultiplier = this.vehicleType === 'SPORTS_CAR' ? 1.8 : 
                                       this.vehicleType === 'MOTORCYCLE' ? 1.6 :
                                       this.vehicleType === 'TRUCK' ? 1.2 : 1.5;
            
            this.speed = Math.min(this.maxSpeed * panicSpeedMultiplier, this.speed + 0.2);
            this.fleeFromDanger(danger);
        } else if (this.state === 'panicking') {
            this.panicTimer -= deltaTime;
            if (this.panicTimer <= 0) {
                this.state = 'driving';
                this.speed = 0.8 + Math.random() * 0.4;
            }
        } else {
            // Normal driving behavior with vehicle-specific characteristics
            this.followPath();
            
            // Adjust driving behavior based on vehicle type
            this.adjustDrivingBehavior();
        }
        
        // Random stops based on vehicle aggressiveness
        const stopChance = 0.001 * (1 - this.aggressiveness);
        if (this.state === 'driving' && Math.random() < stopChance) {
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
    
    adjustDrivingBehavior() {
        // Adjust speed based on vehicle characteristics
        switch (this.vehicleType) {
            case 'SPORTS_CAR':
                // Sports cars drive faster and more aggressively
                if (Math.random() < 0.01) {
                    this.speed = Math.min(this.maxSpeed, this.speed + 0.1);
                }
                break;
            case 'TRUCK':
                // Trucks drive more conservatively
                this.speed = Math.min(this.maxSpeed * 0.8, this.speed);
                break;
            case 'MOTORCYCLE':
                // Motorcycles weave and change direction more
                if (Math.random() < 0.005) {
                    this.angle += (Math.random() - 0.5) * 0.2;
                }
                break;
        }
    }
    
    checkForDanger() {
        // Base danger detection distances modified by risk tolerance
        const playerDetectionDistance = 80 * (1 - this.riskTolerance);
        const policeDetectionDistance = 60 * (1 - this.riskTolerance);
        const gunDetectionDistance = 40 * (1 - this.riskTolerance);
        
        // Check distance to player
        const playerDistance = this.game.getDistance(this, this.game.player);
        if (playerDistance < playerDetectionDistance) {
            return { x: this.game.player.x, y: this.game.player.y, type: 'player' };
        }
        
        // Check distance to police
        for (const cop of this.game.police) {
            const copDistance = this.game.getDistance(this, cop);
            if (copDistance < policeDetectionDistance) {
                return { x: cop.x, y: cop.y, type: 'police' };
            }
        }
        
        // Check for nearby gunshots
        for (const bullet of this.game.bullets) {
            const bulletDistance = this.game.getDistance(this, bullet);
            if (bulletDistance < gunDetectionDistance) {
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
        
        // Update velocity based on movement
        this.velocity.x = Math.cos(this.angle) * this.speed;
        this.velocity.y = Math.sin(this.angle) * this.speed;
        
        // Move
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
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
    
    takeDamage(amount, fromAngle = null) {
        this.health -= amount;
        
        // Vehicle-specific damage effects
        if (this.health <= 0 && this.state !== 'dead') {
            this.state = 'dead';
            this.deathTime = Date.now();
            this.createExplosion();
            this.createVehicleWreckage(fromAngle);
            
            // Record kill in progression system
            if (this.game.progression) {
                this.game.progression.recordKill('vehicle');
            }
            
            // Play vehicle-specific explosion sound
            if (this.game.audioManager) {
                const soundType = this.vehicleType === 'TRUCK' ? 'truck_explosion' : 
                                this.vehicleType === 'MOTORCYCLE' ? 'motorcycle_explosion' :
                                'car_explosion';
                this.game.audioManager.playSound(soundType, this.x, this.y);
            }
        } else if (this.health > 0) {
            // Play damage sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('car_damage', this.x, this.y);
            }
        }
    }
    
    createExplosion() {
        // Vehicle-specific explosion effects
        const explosionIntensity = this.vehicleType === 'TRUCK' ? 2.0 :
                                   this.vehicleType === 'SPORTS_CAR' ? 1.5 :
                                   this.vehicleType === 'MOTORCYCLE' ? 0.8 : 1.0;
        
        const particleCount = Math.floor(15 * explosionIntensity);
        const smokeCount = Math.floor(10 * explosionIntensity);
        const spreadRadius = 40 * explosionIntensity;
        
        // Create explosion particles
        for (let i = 0; i < particleCount; i++) {
            if (this.game.poolManager) {
                // Use object pooling if available
                const particle = this.game.poolManager.getParticle('explosion');
                if (particle) {
                    particle.reset(
                        this.x + (Math.random() - 0.5) * spreadRadius,
                        this.y + (Math.random() - 0.5) * spreadRadius,
                        explosionIntensity
                    );
                }
            } else {
                // Fallback to direct particle creation
                this.game.addParticle(new ExplosionParticle(
                    this.game,
                    this.x + (Math.random() - 0.5) * spreadRadius,
                    this.y + (Math.random() - 0.5) * spreadRadius,
                    explosionIntensity
                ));
            }
        }
        
        // Create smoke particles
        for (let i = 0; i < smokeCount; i++) {
            if (this.game.poolManager) {
                const particle = this.game.poolManager.getParticle('smoke');
                if (particle) {
                    particle.reset(
                        this.x + (Math.random() - 0.5) * (spreadRadius * 0.75),
                        this.y + (Math.random() - 0.5) * (spreadRadius * 0.75)
                    );
                }
            } else {
                this.game.addParticle(new SmokeParticle(
                    this.game,
                    this.x + (Math.random() - 0.5) * (spreadRadius * 0.75),
                    this.y + (Math.random() - 0.5) * (spreadRadius * 0.75)
                ));
            }
        }
        
        // Camera shake based on explosion intensity
        if (this.game.camera) {
            this.game.camera.shake = Math.min(10, 5 * explosionIntensity);
            this.game.camera.shakeTimer = 500 * explosionIntensity;
        }
    }
    
    /**
     * Create persistent vehicle wreckage when destroyed
     * @param {number} damageAngle - Optional angle from damage source
     */
    createVehicleWreckage(damageAngle = null) {
        if (this.wreckageCreated) return;
        this.wreckageCreated = true;
        
        // Create wreckage object with burned ground effects
        this.corpse = {
            x: this.x,
            y: this.y,
            angle: this.angle,
            vehicleType: this.vehicleType,
            originalColor: this.color,
            width: this.width,
            height: this.height,
            burnMarks: this.createBurnMarks(),
            debrisField: this.createDebrisField(damageAngle),
            creationTime: Date.now(),
            alpha: 1.0,
            priority: this.calculateWreckagePriority()
        };
        
        // Add wreckage to game's corpse management system
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
     * Create burn marks on the ground around the wreckage
     * @returns {Array} Array of burn mark objects
     */
    createBurnMarks() {
        const marks = [];
        const markCount = this.vehicleType === 'TRUCK' ? 12 : 
                         this.vehicleType === 'MOTORCYCLE' ? 6 : 8;
        
        // Create main burn area
        const mainBurnSize = this.vehicleType === 'TRUCK' ? 35 : 
                            this.vehicleType === 'MOTORCYCLE' ? 15 : 25;
        
        marks.push({
            x: this.x,
            y: this.y,
            size: mainBurnSize,
            color: '#1a1a1a', // Dark burn mark
            alpha: 0.8,
            type: 'main'
        });
        
        // Create scattered burn patches around the main area
        for (let i = 0; i < markCount; i++) {
            const angle = (i / markCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const distance = (this.width + this.height) * 0.3 + Math.random() * 20;
            
            marks.push({
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance,
                size: 8 + Math.random() * 12,
                color: ['#2a2a2a', '#333333', '#1a1a1a'][Math.floor(Math.random() * 3)],
                alpha: 0.4 + Math.random() * 0.4,
                type: 'scatter'
            });
        }
        
        return marks;
    }
    
    /**
     * Create debris field around the wreckage
     * @param {number} damageAngle - Optional angle from damage source for directional debris
     * @returns {Array} Array of debris objects
     */
    createDebrisField(damageAngle = null) {
        const debris = [];
        const debrisCount = this.vehicleType === 'TRUCK' ? 15 : 
                           this.vehicleType === 'MOTORCYCLE' ? 8 : 12;
        
        for (let i = 0; i < debrisCount; i++) {
            let angle;
            
            if (damageAngle !== null && Math.random() < 0.6) {
                // 60% of debris flies in direction of damage (away from impact)
                const spread = Math.PI / 3; // 60 degree spread
                angle = damageAngle + (Math.random() - 0.5) * spread;
            } else {
                // Random direction
                angle = Math.random() * Math.PI * 2;
            }
            
            const distance = Math.random() * 40;
            
            debris.push({
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance,
                size: 2 + Math.random() * 4,
                color: this.getDebrisColor(),
                angle: Math.random() * Math.PI * 2,
                alpha: 0.6 + Math.random() * 0.4
            });
        }
        
        return debris;
    }
    
    /**
     * Get appropriate debris color based on vehicle type
     * @returns {string} Debris color
     */
    getDebrisColor() {
        const debrisColors = {
            'TRUCK': ['#654321', '#8b4513', '#333333', '#666666'],
            'SPORTS_CAR': ['#ff4757', '#333333', '#666666', '#999999'],
            'MOTORCYCLE': ['#000000', '#333333', '#666666'],
            'SEDAN': ['#333333', '#666666', '#999999', '#555555']
        };
        
        const colors = debrisColors[this.vehicleType] || debrisColors['SEDAN'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Calculate priority for wreckage cleanup (higher priority = keep longer)
     * @returns {number} Priority score
     */
    calculateWreckagePriority() {
        let priority = 1;
        
        // Higher priority for larger vehicles (more noticeable)
        if (this.vehicleType === 'TRUCK') priority += 2;
        else if (this.vehicleType === 'SPORTS_CAR') priority += 1;
        
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
            // Dead vehicles are now handled by wreckage/corpse system
            return;
        }
        
        // Skip detailed rendering for distant objects
        if (lodLevel === 'skip') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (lodLevel === 'low') {
            // Low detail: just a simple colored square
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 2);
        } else if (lodLevel === 'medium') {
            // Medium detail: basic car shape without details
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // High detail: vehicle-type specific rendering
            this.renderVehicleType(ctx);
        }
        
        ctx.restore();
        
        // Only draw tire marks and health bar at high detail
        if (lodLevel === 'high') {
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
    }
    
    renderVehicleType(ctx) {
        switch (this.vehicleType) {
            case 'SPORTS_CAR':
                this.renderSportsCar(ctx);
                break;
            case 'TRUCK':
                this.renderTruck(ctx);
                break;
            case 'MOTORCYCLE':
                this.renderMotorcycle(ctx);
                break;
            default: // SEDAN
                this.renderSedan(ctx);
                break;
        }
    }
    
    renderSedan(ctx) {
        // Standard sedan rendering - width is length (front to back)
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Car details
        ctx.fillStyle = '#000';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4);
        
        // Windshield at the front
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(this.width / 2 - 8, -this.height / 2 + 3, 6, this.height - 6);
        
        // Headlights at the front
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(this.width / 2 - 2, -this.height / 2 + 1, 3, 3);
        ctx.fillRect(this.width / 2 - 2, this.height / 2 - 4, 3, 3);
        
        // Direction indicator at the very front
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.width / 2 - 1, -2, 3, 4);
    }
    
    renderSportsCar(ctx) {
        // Sleeker sports car design - width is length
        ctx.fillStyle = this.color;
        
        // Main body (more aerodynamic shape)
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Car details
        ctx.fillStyle = '#000';
        ctx.fillRect(-this.width / 2 + 1, -this.height / 2 + 1, this.width - 2, this.height - 2);
        
        // Windshield at the front (larger for sports car)
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(this.width / 2 - 10, -this.height / 2 + 2, 8, this.height - 4);
        
        // Racing stripes along the length
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, -this.width / 2, 4, this.width);
        
        // Bright headlights at the front
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.width / 2 - 2, -this.height / 2 + 1, 2, 2);
        ctx.fillRect(this.width / 2 - 2, this.height / 2 - 3, 2, 2);
    }
    
    renderTruck(ctx) {
        // Larger, more robust truck design - width is length
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Truck cab at the front
        ctx.fillStyle = this.adjustColor(this.color, -20);
        ctx.fillRect(this.width / 3, -this.height / 2, this.width / 6, this.height);
        
        // Cargo area behind cab
        ctx.fillStyle = '#654321';
        ctx.fillRect(-this.width / 2 + 1, -this.height / 2 + 1, 2 * this.width / 3, this.height - 2);
        
        // Windshield at the front
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(this.width / 2 - 8, -this.height / 2 + 2, 6, this.height - 4);
        
        // Large headlights at the front
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(this.width / 2 - 2, -this.height / 2 + 1, 4, 4);
        ctx.fillRect(this.width / 2 - 2, this.height / 2 - 5, 4, 4);
        
        // Grille at the very front
        ctx.fillStyle = '#333';
        ctx.fillRect(this.width / 2 - 1, -this.height / 2 + 1, 3, this.height - 2);
    }
    
    renderMotorcycle(ctx) {
        // Thin motorcycle design - width is length
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Rider in the middle
        ctx.fillStyle = '#333';
        ctx.fillRect(-4, -this.height / 4, 8, this.height / 2);
        
        // Wheels along the length (front and back)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.width / 3, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-this.width / 3, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Headlight at the front
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.width / 2 - 2, 0, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    getVehicleInfo() {
        const typeData = VEHICLE_TYPES[this.vehicleType];
        return {
            name: typeData.name,
            type: this.vehicleType,
            health: this.health,
            maxHealth: this.maxHealth,
            maxSpeed: this.maxSpeed.toFixed(1),
            mass: this.mass,
            condition: this.health > this.maxHealth * 0.75 ? 'Excellent' :
                      this.health > this.maxHealth * 0.5 ? 'Good' :
                      this.health > this.maxHealth * 0.25 ? 'Damaged' : 'Critical'
        };
    }
    
    getDisplayName() {
        const typeData = VEHICLE_TYPES[this.vehicleType];
        return typeData.name;
    }
    
    adjustColor(color, amount) {
        // Simple color adjustment helper
        if (color.startsWith('#')) {
            const num = parseInt(color.slice(1), 16);
            const r = Math.max(0, Math.min(255, (num >> 16) + amount));
            const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
            const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        }
        return color;
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
