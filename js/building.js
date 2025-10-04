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
     * Generate windows on building edges (breakable)
     */
    generateWindows() {
        const windowSize = 8;
        const spacing = 15;
        const edgeOffset = 12; // Distance from edge

        // Top edge windows
        for (let x = edgeOffset; x < this.width - edgeOffset; x += spacing) {
            if (Math.random() < 0.7) {
                this.features.push({
                    type: 'window',
                    x: this.x + x,
                    y: this.y + 2,
                    width: windowSize,
                    height: 6,
                    lit: Math.random() < 0.3,
                    broken: false,
                    health: 10
                });
            }
        }

        // Bottom edge windows
        for (let x = edgeOffset; x < this.width - edgeOffset; x += spacing) {
            if (Math.random() < 0.7) {
                this.features.push({
                    type: 'window',
                    x: this.x + x,
                    y: this.y + this.height - 8,
                    width: windowSize,
                    height: 6,
                    lit: Math.random() < 0.3,
                    broken: false,
                    health: 10
                });
            }
        }

        // Left edge windows
        for (let y = edgeOffset; y < this.height - edgeOffset; y += spacing) {
            if (Math.random() < 0.7) {
                this.features.push({
                    type: 'window',
                    x: this.x + 2,
                    y: this.y + y,
                    width: 6,
                    height: windowSize,
                    lit: Math.random() < 0.3,
                    broken: false,
                    health: 10
                });
            }
        }

        // Right edge windows
        for (let y = edgeOffset; y < this.height - edgeOffset; y += spacing) {
            if (Math.random() < 0.7) {
                this.features.push({
                    type: 'window',
                    x: this.x + this.width - 8,
                    y: this.y + y,
                    width: 6,
                    height: windowSize,
                    lit: Math.random() < 0.3,
                    broken: false,
                    health: 10
                });
            }
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
        // Render building interior (floor)
        const floorColor = this.getFloorColor();
        ctx.fillStyle = floorColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Render all walls
        this.walls.forEach(wall => {
            wall.render(ctx);
        });

        // Render all beams
        this.beams.forEach(beam => {
            beam.render(ctx);
        });

        // Render edge windows
        this.renderWindows(ctx);

        // Render roof (with transparency if player is inside)
        this.renderRoof(ctx);

        // Render other architectural features
        this.renderFeatures(ctx);
    }

    /**
     * Get floor color based on building type
     */
    getFloorColor() {
        switch (this.buildingType) {
            case 'residential':
                return '#8B7355'; // Wood floor
            case 'commercial':
                return '#D3D3D3'; // Tile floor
            case 'industrial':
                return '#696969'; // Concrete floor
            case 'skyscraper':
                return '#C0C0C0'; // Polished floor
            default:
                return '#808080';
        }
    }

    /**
     * Render the roof with proper top-down perspective
     */
    renderRoof(ctx) {
        // Check if player is inside building
        const playerInside = this.isPlayerInside();

        // Set roof transparency
        const roofAlpha = playerInside ? 0.3 : 1.0;

        ctx.save();
        ctx.globalAlpha = roofAlpha;

        // Get roof color based on building type
        const roofColor = this.getRoofColor();
        ctx.fillStyle = roofColor;

        // Draw main roof
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);

        // Add roof details based on building type
        this.renderRoofDetails(ctx);

        ctx.restore();
    }

    /**
     * Get roof color based on building type
     */
    getRoofColor() {
        switch (this.buildingType) {
            case 'residential':
                return '#8B4513'; // Brown shingles
            case 'commercial':
                return '#4A4A4A'; // Dark gray
            case 'industrial':
                return '#2F4F4F'; // Dark slate gray
            case 'skyscraper':
                return '#1C1C1C'; // Almost black
            default:
                return '#555555';
        }
    }

    /**
     * Render roof details (vents, AC units, etc.)
     */
    renderRoofDetails(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        switch (this.buildingType) {
            case 'residential':
                // Chimney
                if (this.width > 60 && this.height > 60) {
                    ctx.fillStyle = '#8B0000';
                    ctx.fillRect(centerX - 5, centerY - 5, 10, 10);
                }
                break;
            case 'commercial':
                // AC units
                if (this.width > 70 && this.height > 70) {
                    ctx.fillStyle = '#696969';
                    ctx.fillRect(centerX - 8, centerY - 8, 16, 16);
                    ctx.fillRect(centerX + 15, centerY - 8, 12, 12);
                }
                break;
            case 'industrial':
                // Vents and pipes
                if (this.width > 80 && this.height > 80) {
                    ctx.fillStyle = '#4A4A4A';
                    ctx.fillRect(centerX - 10, centerY - 10, 8, 20);
                    ctx.fillRect(centerX + 5, centerY - 5, 8, 15);
                }
                break;
            case 'skyscraper':
                // Helipad
                if (this.width > 70 && this.height > 70) {
                    ctx.strokeStyle = '#FFFF00';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
                    ctx.stroke();
                    // H for helipad
                    ctx.fillStyle = '#FFFF00';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('H', centerX, centerY);
                }
                break;
        }
    }

    /**
     * Check if player is inside the building
     */
    isPlayerInside() {
        if (!this.game || !this.game.player) return false;

        const player = this.game.player;
        return player.x >= this.x &&
            player.x <= this.x + this.width &&
            player.y >= this.y &&
            player.y <= this.y + this.height;
    }

    /**
     * Render windows on building edges
     */
    renderWindows(ctx) {
        this.features.forEach(feature => {
            if (feature.type === 'window') {
                if (feature.broken) {
                    // Broken window - show shattered glass
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(feature.x, feature.y, feature.width, feature.height);

                    // Jagged edges
                    ctx.strokeStyle = '#666666';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(feature.x, feature.y);
                    ctx.lineTo(feature.x + feature.width * 0.3, feature.y + feature.height * 0.5);
                    ctx.lineTo(feature.x + feature.width * 0.7, feature.y + feature.height * 0.3);
                    ctx.lineTo(feature.x + feature.width, feature.y + feature.height);
                    ctx.stroke();
                } else {
                    // Intact window
                    ctx.fillStyle = feature.lit ? '#FFFF99' : '#87CEEB';
                    ctx.fillRect(feature.x, feature.y, feature.width, feature.height);

                    // Window frame
                    ctx.strokeStyle = '#2F4F4F';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(feature.x, feature.y, feature.width, feature.height);

                    // Window reflection
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(feature.x + 1, feature.y + 1, feature.width - 2, feature.height / 2);
                }
            }
        });
    }

    /**
     * Render other architectural features (non-window)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderFeatures(ctx) {
        this.features.forEach(feature => {
            switch (feature.type) {
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
                    ctx.fillText('SHOP', feature.x + 2, feature.y + 10);
                    break;
                case 'pipe':
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(feature.x, feature.y, feature.width, feature.height);
                    // Pipe segments
                    ctx.strokeStyle = '#222222';
                    ctx.lineWidth = 1;
                    for (let i = 0; i < feature.height; i += 10) {
                        ctx.beginPath();
                        ctx.moveTo(feature.x, feature.y + i);
                        ctx.lineTo(feature.x + feature.width, feature.y + i);
                        ctx.stroke();
                    }
                    break;
                case 'antenna':
                    ctx.fillStyle = '#222222';
                    ctx.fillRect(feature.x, feature.y, feature.width, feature.height);
                    // Antenna tip
                    ctx.fillStyle = '#FF0000';
                    ctx.fillRect(feature.x, feature.y, feature.width, 3);
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
        // Check if point hits a window first
        for (const feature of this.features) {
            if (feature.type === 'window' && !feature.broken) {
                if (Physics.checkPointInRect(point.x, point.y, feature)) {
                    this.breakWindow(feature, point);
                    return;
                }
            }
        }

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
     * Break a window and create glass shatter effect
     * @param {Object} window - Window feature object
     * @param {Object} point - Impact point {x, y}
     */
    breakWindow(window, point) {
        window.broken = true;

        // Create glass shatter particles
        const glassParticleCount = 8;
        for (let i = 0; i < glassParticleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const size = 1 + Math.random() * 2;

            // Glass colors (light blue/white)
            const glassColors = ['#87CEEB', '#B0E0E6', '#ADD8E6', '#FFFFFF'];
            const color = glassColors[Math.floor(Math.random() * glassColors.length)];

            if (this.game && this.game.poolManager) {
                const particle = this.game.poolManager.createParticle(
                    window.x + window.width / 2,
                    window.y + window.height / 2,
                    color,
                    30 + Math.random() * 20,
                    size,
                    angle,
                    speed,
                    'glass'
                );
                if (particle) {
                    this.game.particles.push(particle);
                }
            } else if (this.game) {
                this.game.addParticle(new Particle(
                    this.game,
                    window.x + window.width / 2,
                    window.y + window.height / 2,
                    color,
                    30 + Math.random() * 20,
                    size,
                    angle,
                    speed
                ));
            }
        }

        // Play glass break sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('glass_break', 0.4);
        }

        // Small score bonus for breaking windows
        if (this.game) {
            this.game.score += 5;
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
            { x: this.x, y: this.y },
            { x: this.x + this.width, y: this.y },
            { x: this.x, y: this.y + this.height },
            { x: this.x + this.width, y: this.y + this.height }
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
                    -Math.PI / 2 + (Math.random() - 0.5) * 0.5,
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