/**
 * Building System for GTA Clone
 * Implements destructible building walls with invincible support beams
 */

class Building {
    constructor(game, x, y, width, height) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.walls = [];
        this.beams = [];
        this.collider = new BuildingCollider(this);
        this.isDestroyed = false;
        this.structuralIntegrity = 100;
        this.maxStructuralIntegrity = 100;
        
        // New properties for variety
        this.buildingType = 'residential'; // Default type
        this.features = [];
        this.windowPattern = 'grid';
        this.colorScheme = ['#666666', '#777777', '#888888'];
        
        // Performance settings
        this.maxParticlesPerEvent = 50; // Limit particles per destruction event
        
        // Initialize the building structure
        this.initialize();
    }
    
    /**
     * Initialize the building with walls and support beams
     */
    initialize() {
        // Create destructible walls around the perimeter
        // Top wall
        this.walls.push(new DestructibleWall(
            this.x, 
            this.y, 
            this.width, 
            10,
            this
        ));
        
        // Bottom wall
        this.walls.push(new DestructibleWall(
            this.x, 
            this.y + this.height - 10, 
            this.width, 
            10,
            this
        ));
        
        // Left wall
        this.walls.push(new DestructibleWall(
            this.x, 
            this.y + 10, 
            10, 
            this.height - 20,
            this
        ));
        
        // Right wall
        this.walls.push(new DestructibleWall(
            this.x + this.width - 10, 
            this.y + 10, 
            10, 
            this.height - 20,
            this
        ));
        
        // Create support beams at corners for structural integrity
        // Top-left corner
        this.beams.push(new SupportBeam(
            this.x, 
            this.y, 
            20, 
            20
        ));
        
        // Top-right corner
        this.beams.push(new SupportBeam(
            this.x + this.width - 20, 
            this.y, 
            20, 
            20
        ));
        
        // Bottom-left corner
        this.beams.push(new SupportBeam(
            this.x, 
            this.y + this.height - 20, 
            20, 
            20
        ));
        
        // Bottom-right corner
        this.beams.push(new SupportBeam(
            this.x + this.width - 20, 
            this.y + this.height - 20, 
            20, 
            20
        ));
        
        // Central support beam
        this.beams.push(new SupportBeam(
            this.x + this.width / 2 - 10, 
            this.y + this.height / 2 - 10, 
            20, 
            20
        ));
        
        // Generate architectural features
        this.generateFeatures();
    }
    
    /**
     * Generate architectural features based on building type
     */
    generateFeatures() {
        this.features = [];
        
        // Generate windows based on pattern
        this.generateWindows();
        
        // Add other features based on building type
        switch (this.buildingType) {
            case 'residential':
                if (Math.random() < 0.3) {
                    this.features.push({
                        type: 'balcony',
                        x: this.x + this.width * 0.2,
                        y: this.y + this.height * 0.3,
                        width: this.width * 0.6,
                        height: 8
                    });
                }
                break;
            case 'commercial':
                if (Math.random() < 0.4) {
                    this.features.push({
                        type: 'sign',
                        x: this.x + this.width * 0.1,
                        y: this.y + 20,
                        width: this.width * 0.8,
                        height: 15
                    });
                }
                break;
            case 'industrial':
                if (Math.random() < 0.5) {
                    this.features.push({
                        type: 'pipe',
                        x: this.x + this.width - 15,
                        y: this.y,
                        width: 8,
                        height: this.height
                    });
                }
                break;
            case 'skyscraper':
                if (Math.random() < 0.6) {
                    this.features.push({
                        type: 'antenna',
                        x: this.x + this.width / 2 - 2,
                        y: this.y - 20,
                        width: 4,
                        height: 30
                    });
                }
                break;
        }
    }
    
    /**
     * Generate windows based on pattern
     */
    generateWindows() {
        const windowSize = 6;
        const spacing = 12;
        
        // Different window patterns based on building type
        switch (this.windowPattern) {
            case 'grid':
                for (let x = 15; x < this.width - windowSize; x += spacing) {
                    for (let y = 15; y < this.height - windowSize; y += spacing) {
                        if (Math.random() < 0.7) {
                            this.features.push({
                                type: 'window',
                                x: this.x + x,
                                y: this.y + y,
                                width: windowSize,
                                height: windowSize,
                                lit: Math.random() < 0.3
                            });
                        }
                    }
                }
                break;
            case 'vertical':
                for (let x = 15; x < this.width - windowSize; x += spacing * 2) {
                    for (let y = 15; y < this.height - windowSize; y += spacing) {
                        if (Math.random() < 0.8) {
                            this.features.push({
                                type: 'window',
                                x: this.x + x,
                                y: this.y + y,
                                width: windowSize,
                                height: windowSize,
                                lit: Math.random() < 0.4
                            });
                        }
                    }
                }
                break;
            case 'horizontal':
                for (let y = 15; y < this.height - windowSize; y += spacing * 2) {
                    for (let x = 15; x < this.width - windowSize; x += spacing) {
                        if (Math.random() < 0.8) {
                            this.features.push({
                                type: 'window',
                                x: this.x + x,
                                y: this.y + y,
                                width: windowSize,
                                height: windowSize,
                                lit: Math.random() < 0.4
                            });
                        }
                    }
                }
                break;
        }
    }
    
    /**
     * Update building state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Update all walls
        this.walls.forEach(wall => {
            wall.update(deltaTime);
        });
        
        // Update all beams
        this.beams.forEach(beam => {
            beam.update(deltaTime);
        });
        
        // Update collider
        this.collider.update(deltaTime);
        
        // Check if building should collapse
        this.checkIntegrity();
    }
    
    /**
     * Render the building
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Render building base
        const baseColor = this.colorScheme[0] || '#666666';
        ctx.fillStyle = baseColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Render all walls
        this.walls.forEach(wall => {
            wall.render(ctx);
        });
        
        // Render all beams
        this.beams.forEach(beam => {
            beam.render(ctx);
        });
        
        // Render architectural features
        this.renderFeatures(ctx);
    }
    
    /**
     * Render architectural features
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderFeatures(ctx) {
        this.features.forEach(feature => {
            switch (feature.type) {
                case 'window':
                    ctx.fillStyle = feature.lit ? '#FFFF99' : '#666666';
                    ctx.fillRect(feature.x, feature.y, feature.width, feature.height);
                    // Window frame
                    ctx.strokeStyle = '#333333';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(feature.x, feature.y, feature.width, feature.height);
                    break;
                case 'balcony':
                    ctx.fillStyle = '#555555';
                    ctx.fillRect(feature.x, feature.y, feature.width, feature.height);
                    // Balcony railing
                    ctx.strokeStyle = '#444444';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(feature.x, feature.y);
                    ctx.lineTo(feature.x + feature.width, feature.y);
                    ctx.stroke();
                    break;
                case 'sign':
                    ctx.fillStyle = '#FF0000';
                    ctx.fillRect(feature.x, feature.y, feature.width, feature.height);
                    // Sign text (simplified)
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '8px Arial';
                    ctx.fillText('SIGN', feature.x + 2, feature.y + 10);
                    break;
                case 'pipe':
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(feature.x, feature.y, feature.width, feature.height);
                    break;
                case 'antenna':
                    ctx.fillStyle = '#222222';
                    ctx.fillRect(feature.x, feature.y, feature.width, feature.height);
                    break;
            }
        });
    }
    
    /**
     * Take damage at a specific point
     * @param {number} damage - Damage amount
     * @param {Object} point - Impact point {x, y}
     */
    takeDamage(damage, point) {
        // Check if point hits a wall
        for (const wall of this.walls) {
            if (Physics.checkPointInRect(point.x, point.y, wall)) {
                wall.takeDamage(damage);
                return;
            }
        }
        
        // Check if point hits a beam (beams are invincible but we might want visual feedback)
        for (const beam of this.beams) {
            if (Physics.checkPointInRect(point.x, point.y, beam)) {
                // Beams are invincible, but we can create visual effects
                this.createImpactEffect(point.x, point.y);
                return;
            }
        }
    }
    
    /**
     * Check building structural integrity and handle collapse
     */
    checkIntegrity() {
        // Count destroyed walls
        const destroyedWalls = this.walls.filter(wall => wall.isDestroyed).length;
        const totalWalls = this.walls.length;
        
        // Calculate structural integrity based on destroyed walls
        this.structuralIntegrity = Math.max(0, 100 - (destroyedWalls / totalWalls) * 100);
        
        // Check collapse conditions
        // Collapse if more than 50% of walls are destroyed
        // or if structural integrity falls below 30%
        if ((destroyedWalls / totalWalls) > 0.5 || this.structuralIntegrity < 30) {
            this.collapse();
        }
    }
    
    /**
     * Handle building collapse
     */
    collapse() {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        
        // Create collapse particles
        this.createCollapseEffect();
        
        // Play collapse sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('explosion', 0.8);
        }
        
        // Add score for destroying building
        this.game.score += 500;
        
        // Add heat for destruction
        if (this.game.addHeat) {
            this.game.addHeat(this.game.wantedSystem.crimeHeat.destroyVehicle, 'building_destruction');
        }
    }
    
    /**
     * Create impact visual effects
     * @param {number} x - Impact x coordinate
     * @param {number} y - Impact y coordinate
     */
    createImpactEffect(x, y) {
        // Create spark particles for beam impacts
        for (let i = 0; i < 5; i++) {
            if (this.game && this.game.poolManager) {
                this.game.poolManager.createSpecializedParticle('spark', x, y);
            } else if (this.game) {
                this.game.addParticle(new SparkParticle(this.game, x, y));
            }
        }
    }
    
    /**
     * Create collapse visual effects
     */
    createCollapseEffect() {
        // Create explosion particles at multiple points
        const particlesPerPoint = 8;
        
        // Create particles at corners
        for (let i = 0; i < particlesPerPoint; i++) {
            if (this.game && this.game.poolManager) {
                this.game.poolManager.createSpecializedParticle('explosion', this.x, this.y);
                this.game.poolManager.createSpecializedParticle('explosion', this.x + this.width, this.y);
                this.game.poolManager.createSpecializedParticle('explosion', this.x, this.y + this.height);
                this.game.poolManager.createSpecializedParticle('explosion', this.x + this.width, this.y + this.height);
            } else if (this.game) {
                this.game.addParticle(new ExplosionParticle(this.game, this.x, this.y, 1.5));
                this.game.addParticle(new ExplosionParticle(this.game, this.x + this.width, this.y, 1.5));
                this.game.addParticle(new ExplosionParticle(this.game, this.x, this.y + this.height, 1.5));
                this.game.addParticle(new ExplosionParticle(this.game, this.x + this.width, this.y + this.height, 1.5));
            }
        }
        
        // Create smoke particles
        for (let i = 0; i < particlesPerPoint * 2; i++) {
            const x = this.x + Math.random() * this.width;
            const y = this.y + Math.random() * this.height;
            if (this.game && this.game.poolManager) {
                this.game.poolManager.createSpecializedParticle('smoke', x, y);
            } else if (this.game) {
                this.game.addParticle(new SmokeParticle(this.game, x, y));
            }
        }
        
        // Create enhanced collapse particles
        this.createBuildingCollapseEffect();
    }
    
    /**
     * Create enhanced building collapse effects
     */
    createBuildingCollapseEffect() {
        // Track particle count to respect limits
        let particleCount = 0;
        const maxParticles = this.maxParticlesPerEvent;
        
        // Explosion particles at corners
        const corners = [
            {x: this.x, y: this.y},
            {x: this.x + this.width, y: this.y},
            {x: this.x, y: this.y + this.height},
            {x: this.x + this.width, y: this.y + this.height}
        ];
        
        corners.forEach(corner => {
            for (let i = 0; i < 5 && particleCount < maxParticles; i++) {
                if (this.game && this.game.poolManager) {
                    this.game.poolManager.createSpecializedParticle('explosion', corner.x, corner.y);
                } else if (this.game) {
                    this.game.addParticle(new Particle(
                        this.game,
                        corner.x,
                        corner.y,
                        '#FF4500',
                        40,
                        2 + Math.random() * 4,
                        Math.random() * Math.PI * 2,
                        3 + Math.random() * 5
                    ));
                }
                particleCount++;
            }
        });
        
        // Smoke particles throughout building (limit to remaining particles)
        const remainingParticles = maxParticles - particleCount;
        const smokeParticleCount = Math.min(20, remainingParticles);
        
        for (let i = 0; i < smokeParticleCount; i++) {
            const x = this.x + Math.random() * this.width;
            const y = this.y + Math.random() * this.height;
            if (this.game && this.game.poolManager) {
                this.game.poolManager.createSpecializedParticle('smoke', x, y);
            } else if (this.game) {
                this.game.addParticle(new Particle(
                    this.game,
                    x,
                    y,
                    '#666666',
                    120,
                    5 + Math.random() * 10,
                    -Math.PI/2 + (Math.random() - 0.5) * 0.5,
                    0.5 + Math.random() * 2
                ));
            }
        }
        particleCount += smokeParticleCount;
        
        // Debris particles (limit to remaining particles)
        const debrisParticleCount = Math.min(15, maxParticles - particleCount);
        
        for (let i = 0; i < debrisParticleCount; i++) {
            const x = this.x + Math.random() * this.width;
            const y = this.y + Math.random() * this.height;
            if (this.game && this.game.poolManager) {
                this.game.poolManager.createSpecializedParticle('debris', x, y);
            } else if (this.game) {
                this.game.addParticle(new DebrisParticle(this.game, x, y));
            }
        }
    }
}

// Export the Building class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Building;
}