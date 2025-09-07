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
            10
        ));
        
        // Bottom wall
        this.walls.push(new DestructibleWall(
            this.x, 
            this.y + this.height - 10, 
            this.width, 
            10
        ));
        
        // Left wall
        this.walls.push(new DestructibleWall(
            this.x, 
            this.y + 10, 
            10, 
            this.height - 20
        ));
        
        // Right wall
        this.walls.push(new DestructibleWall(
            this.x + this.width - 10, 
            this.y + 10, 
            10, 
            this.height - 20
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
        // Render all walls
        this.walls.forEach(wall => {
            wall.render(ctx);
        });
        
        // Render all beams
        this.beams.forEach(beam => {
            beam.render(ctx);
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
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            this.game.addParticle(new SparkParticle(this.game, x, y));
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
            this.game.addParticle(new ExplosionParticle(this.game, this.x, this.y, 1.5));
            this.game.addParticle(new ExplosionParticle(this.game, this.x + this.width, this.y, 1.5));
            this.game.addParticle(new ExplosionParticle(this.game, this.x, this.y + this.height, 1.5));
            this.game.addParticle(new ExplosionParticle(this.game, this.x + this.width, this.y + this.height, 1.5));
        }
        
        // Create smoke particles
        for (let i = 0; i < particlesPerPoint * 2; i++) {
            this.game.addParticle(new SmokeParticle(this.game, 
                this.x + Math.random() * this.width, 
                this.y + Math.random() * this.height));
        }
    }
}

// Export the Building class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Building;
}