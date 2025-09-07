/**
 * Destructible Wall Component for Building System
 * Represents destructible wall segments of buildings
 */

class DestructibleWall {
    constructor(x, y, width, height, parentBuilding = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = 100;
        this.maxHealth = 100;
        this.isDestroyed = false;
        this.destructionEffect = null;
        this.color = '#666666';
        this.destroyedColor = '#444444';
        
        // New properties for particle effects
        this.lastHitTime = 0;
        this.damageLevel = 0;
        this.parentBuilding = parentBuilding;
        this.game = parentBuilding ? parentBuilding.game : null;
        
        // Performance settings
        this.maxImpactParticles = 5; // Limit particles per impact
        this.minParticleInterval = 100; // Minimum ms between particle effects
    }
    
    /**
     * Take damage and reduce wall health
     * @param {number} damage - Damage amount
     */
    takeDamage(damage) {
        if (this.isDestroyed) return;
        
        this.health = Math.max(0, this.health - damage);
        
        // Change color based on health
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent > 0.7) {
            this.color = '#666666';
        } else if (healthPercent > 0.4) {
            this.color = '#888888';
        } else if (healthPercent > 0.2) {
            this.color = '#AAAAAA';
        } else {
            this.color = '#CCCCCC';
        }
        
        // Update damage level for visual effects
        this.damageLevel = this.getDamageLevel();
        
        // Create impact particles
        if (this.game) {
            this.createImpactParticles(
                this.x + Math.random() * this.width,
                this.y + Math.random() * this.height
            );
        }
        
        // Update last hit time
        this.lastHitTime = Date.now();
        
        // Check if wall is destroyed
        if (this.health <= 0 && !this.isDestroyed) {
            this.destroy();
        }
    }
    
    /**
     * Get damage level based on health (0-3)
     * @returns {number} Damage level
     */
    getDamageLevel() {
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent > 0.7) return 0;
        if (healthPercent > 0.4) return 1;
        if (healthPercent > 0.2) return 2;
        return 3;
    }
    
    /**
     * Create impact particle effects
     * @param {number} x - Impact x coordinate
     * @param {number} y - Impact y coordinate
     */
    createImpactParticles(x, y) {
        // Check if enough time has passed since last particle effect
        const currentTime = Date.now();
        if (currentTime - this.lastHitTime < this.minParticleInterval) {
            return;
        }
        
        if (!this.game || !this.game.poolManager) return;
        
        // Create spark particles for impact (limited count)
        const sparkCount = Math.min(3, this.maxImpactParticles);
        for (let i = 0; i < sparkCount; i++) {
            this.game.poolManager.createSpecializedParticle('spark', x, y);
        }
        
        // Create dust particles (limited count)
        const dustCount = Math.min(5, this.maxImpactParticles - sparkCount);
        for (let i = 0; i < dustCount; i++) {
            this.game.poolManager.createSpecializedParticle('dust', x, y);
        }
        
        // Update last hit time
        this.lastHitTime = currentTime;
    }
    
    /**
     * Destroy the wall
     */
    destroy() {
        this.isDestroyed = true;
        this.health = 0;
        
        // Create destruction particles
        if (this.game) {
            this.createDestructionParticles();
        }
    }
    
    /**
     * Create destruction particle effects
     */
    createDestructionParticles() {
        if (!this.game || !this.game.poolManager) return;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Respect parent building's particle limit if available
        const maxParticles = this.parentBuilding ? 
            this.parentBuilding.maxParticlesPerEvent : 30;
        
        // Create concrete debris particles
        const concreteCount = Math.min(8, maxParticles / 2);
        for (let i = 0; i < concreteCount; i++) {
            this.game.poolManager.createSpecializedParticle('concrete', centerX, centerY);
        }
        
        // Create dust cloud particles
        const dustCount = Math.min(10, maxParticles - concreteCount);
        for (let i = 0; i < dustCount; i++) {
            this.game.poolManager.createSpecializedParticle('dust', centerX, centerY);
        }
    }
    
    /**
     * Update wall state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Wall doesn't need regular updates in this implementation
    }
    
    /**
     * Render the wall
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (this.isDestroyed) {
            // Render destroyed wall with transparency
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = this.destroyedColor;
        } else {
            // Render normal wall
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = this.color;
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Render health bar if damaged but not destroyed
        if (!this.isDestroyed && this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            const barWidth = this.width * 0.8;
            const barHeight = 3;
            const barX = this.x + (this.width - barWidth) / 2;
            const barY = this.y - 5;
            
            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Health
            ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                           healthPercent > 0.25 ? '#ffff00' : '#ff0000';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
        
        // Reset global alpha
        ctx.globalAlpha = 1.0;
    }
}

// Export the DestructibleWall class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DestructibleWall;
}