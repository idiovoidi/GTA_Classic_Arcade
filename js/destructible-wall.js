/**
 * Destructible Wall Component for Building System
 * Represents destructible wall segments of buildings
 */

class DestructibleWall {
    constructor(x, y, width, height) {
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
        
        // Check if wall is destroyed
        if (this.health <= 0 && !this.isDestroyed) {
            this.destroy();
        }
    }
    
    /**
     * Destroy the wall
     */
    destroy() {
        this.isDestroyed = true;
        this.health = 0;
        
        // Create destruction particles (will be handled by the building)
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