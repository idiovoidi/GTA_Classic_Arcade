/**
 * Support Beam Component for Building System
 * Represents invincible structural support elements
 */

class SupportBeam {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isInvincible = true;
        this.structuralIntegrity = 1000; // Very high value
        this.color = '#333333';
        this.glowColor = '#FFFF00';
        this.isGlowing = false;
        this.glowTimer = 0;
    }
    
    /**
     * Update beam state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Update glow effect timer
        if (this.isGlowing) {
            this.glowTimer -= deltaTime;
            if (this.glowTimer <= 0) {
                this.isGlowing = false;
            }
        }
    }
    
    /**
     * Render the beam
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Draw the main beam
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw beam outline
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw glow effect if active
        if (this.isGlowing) {
            const glowIntensity = Math.min(1, this.glowTimer / 500);
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = 10 * glowIntensity;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
        }
        
        // Draw structural integrity indicator
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('S', this.x + this.width / 2, this.y + this.height / 2 + 3);
        ctx.textAlign = 'left';
    }
    
    /**
     * Trigger glow effect when hit
     */
    triggerGlow() {
        this.isGlowing = true;
        this.glowTimer = 500; // 500ms glow
    }
}

// Export the SupportBeam class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupportBeam;
}