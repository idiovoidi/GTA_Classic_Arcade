/**
 * Particle System for GTA Clone
 * Implements visual effects, explosions, and environmental particles
 */

class Particle {
    constructor(game, x, y, color, life, size, angle = 0, speed = 1) {
        this.game = game;
        this.x = x || 0;
        this.y = y || 0;
        this.color = color || '#ffffff';
        this.maxLife = life || 60;
        this.life = life || 60;
        this.maxSize = size || 2;
        this.size = size || 2;
        this.angle = angle || 0;
        this.speed = speed || 1;
        
        // Physics properties
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        
        this.gravity = 0.02;
        this.friction = 0.98;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        
        // Visual properties
        this.alpha = 1.0;
        this.fadeRate = 1 / life;
        this.scaleRate = Math.random() * 0.02 + 0.01;
        
        // Particle type effects
        try {
            this.particleType = this.determineParticleType(this.color);
            this.setupParticleType();
        } catch (error) {
            console.warn('Failed to setup particle type:', error);
            this.particleType = 'generic';
        }
    }
    
    determineParticleType(color) {
        // Ensure color is a string and handle null/undefined
        if (!color || typeof color !== 'string') {
            return 'generic';
        }
        
        const colorStr = color.toLowerCase();
        if (colorStr.includes('#ff4500') || colorStr.includes('#ff8c00')) return 'explosion';
        if (colorStr.includes('#666') || colorStr.includes('#999')) return 'smoke';
        if (colorStr.includes('#ff0000')) return 'blood';
        if (colorStr.includes('#ffff00') || colorStr.includes('#ffffff')) return 'spark';
        if (colorStr.includes('#00ff00')) return 'energy';
        return 'generic';
    }
    
    setupParticleType() {
        try {
            switch (this.particleType) {
                case 'explosion':
                    this.gravity = 0.05;
                    this.friction = 0.96;
                    break;
                case 'smoke':
                    this.gravity = -0.02; // Smoke rises
                    this.friction = 0.99;
                    this.scaleRate = 0.03; // Smoke expands
                    break;
                case 'blood':
                    this.gravity = 0.1;
                    this.friction = 0.94;
                    break;
                case 'spark':
                    this.gravity = 0.03;
                    this.friction = 0.97;
                    break;
                case 'energy':
                    this.gravity = 0;
                    this.friction = 0.95;
                    this.rotationSpeed = 0.2;
                    break;
                default:
                    // Keep default values for generic particles
                    break;
            }
        } catch (error) {
            console.warn('Failed to setup particle type properties:', error);
            // Keep default values
        }
    }
    
    update(deltaTime) {
        if (this.life <= 0) return;
        
        // Apply physics
        this.velocity.y += this.gravity;
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Apply velocity
        const normalizedDelta = deltaTime / 16.67; // Normalize to 60fps
        this.x += this.velocity.x * normalizedDelta;
        this.y += this.velocity.y * normalizedDelta;
        
        // Update rotation
        this.rotation += this.rotationSpeed * normalizedDelta;
        
        // Update size based on particle type
        if (this.particleType === 'smoke') {
            this.size = Math.min(this.maxSize * 2, this.size + this.scaleRate * normalizedDelta);
        } else if (this.particleType === 'explosion') {
            this.size = Math.max(0, this.size - this.scaleRate * normalizedDelta * 0.5);
        }
        
        // Update alpha based on life
        this.alpha = this.life / this.maxLife;
        
        // Special effects for different particle types
        this.updateSpecialEffects(deltaTime);
        
        // Reduce life
        this.life -= deltaTime * 0.01;
    }
    
    updateSpecialEffects(deltaTime) {
        switch (this.particleType) {
            case 'spark':
                // Sparks fade faster and have variable brightness
                this.alpha *= 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
                break;
            case 'energy':
                // Energy particles pulse
                this.size = this.maxSize * (0.8 + 0.2 * Math.sin(Date.now() * 0.005));
                break;
            case 'smoke':
                // Smoke becomes more transparent over time
                this.alpha *= 0.99;
                break;
        }
    }
    
    render(ctx) {
        if (this.life <= 0 || this.alpha <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        
        switch (this.particleType) {
            case 'explosion':
                this.renderExplosionParticle(ctx);
                break;
            case 'smoke':
                this.renderSmokeParticle(ctx);
                break;
            case 'blood':
                this.renderBloodParticle(ctx);
                break;
            case 'spark':
                this.renderSparkParticle(ctx);
                break;
            case 'energy':
                this.renderEnergyParticle(ctx);
                break;
            default:
                this.renderGenericParticle(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    renderExplosionParticle(ctx) {
        // Gradient explosion particle
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.7, this.adjustColorBrightness(this.color, 0.5));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderSmokeParticle(ctx) {
        // Soft smoke particle
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderBloodParticle(ctx) {
        // Splatter-like blood particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        // Create irregular shape
        const points = 6;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = this.size * (0.7 + Math.random() * 0.6);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    renderSparkParticle(ctx) {
        // Bright spark with trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(-this.size * 2, 0);
        ctx.lineTo(this.size * 2, 0);
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = this.color;
        ctx.stroke();
    }
    
    renderEnergyParticle(ctx) {
        // Pulsing energy particle
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add outer ring
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.2, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    renderGenericParticle(ctx) {
        // Simple circular particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    adjustColorBrightness(color, factor) {
        // Simple color brightness adjustment
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            const newR = Math.floor(r * factor);
            const newG = Math.floor(g * factor);
            const newB = Math.floor(b * factor);
            
            return `rgb(${newR}, ${newG}, ${newB})`;
        }
        return color;
    }
    
    /**
     * Reset particle to initial state for object pooling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @param {number} life - Particle lifetime
     * @param {number} size - Particle size
     * @param {number} angle - Movement angle
     * @param {number} speed - Movement speed
     */
    reset(x, y, color, life, size, angle = 0, speed = 1) {
        this.x = x || 0;
        this.y = y || 0;
        this.color = color || '#ffffff';
        this.maxLife = life || 60;
        this.life = life || 60;
        this.maxSize = size || 2;
        this.size = size || 2;
        this.angle = angle || 0;
        this.speed = speed || 1;
        
        // Reset physics properties
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        
        this.gravity = 0.02;
        this.friction = 0.98;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        
        // Reset visual properties
        this.alpha = 1.0;
        this.fadeRate = 1 / this.life;
        this.scaleRate = Math.random() * 0.02 + 0.01;
        
        // Reset particle type effects
        try {
            this.particleType = this.determineParticleType(this.color);
            this.setupParticleType();
        } catch (error) {
            console.warn('Failed to setup particle type during reset:', error);
            this.particleType = 'generic';
        }
    }
}

/**
 * Specialized particle types
 */

class ExplosionParticle extends Particle {
    constructor(game, x, y, intensity = 1) {
        const colors = ['#ff4500', '#ff6600', '#ff8800', '#ffaa00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = 60 + Math.random() * 40;
        const size = 3 + Math.random() * 5 * intensity;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4 * intensity;
        
        super(game, x, y, color, life, size, angle, speed);
        this.particleType = 'explosion';
        this.setupParticleType();
    }
    
    /**
     * Reset explosion particle for object pooling
     */
    reset(x, y, intensity = 1) {
        const colors = ['#ff4500', '#ff6600', '#ff8800', '#ffaa00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = 60 + Math.random() * 40;
        const size = 3 + Math.random() * 5 * intensity;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4 * intensity;
        
        super.reset(x, y, color, life, size, angle, speed);
        this.particleType = 'explosion';
        this.setupParticleType();
    }
}

class SmokeParticle extends Particle {
    constructor(game, x, y) {
        const colors = ['#666666', '#888888', '#aaaaaa'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = 80 + Math.random() * 40;
        const size = 4 + Math.random() * 6;
        const angle = -Math.PI/2 + (Math.random() - 0.5) * 0.5;
        const speed = 0.5 + Math.random() * 1;
        
        super(game, x, y, color, life, size, angle, speed);
        this.particleType = 'smoke';
        this.setupParticleType();
    }
    
    /**
     * Reset smoke particle for object pooling
     */
    reset(x, y) {
        const colors = ['#666666', '#888888', '#aaaaaa'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = 80 + Math.random() * 40;
        const size = 4 + Math.random() * 6;
        const angle = -Math.PI/2 + (Math.random() - 0.5) * 0.5;
        const speed = 0.5 + Math.random() * 1;
        
        super.reset(x, y, color, life, size, angle, speed);
        this.particleType = 'smoke';
        this.setupParticleType();
    }
}

class BloodParticle extends Particle {
    constructor(game, x, y) {
        const colors = ['#8B0000', '#AA0000', '#CC0000'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = 40 + Math.random() * 20;
        const size = 2 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        
        super(game, x, y, color, life, size, angle, speed);
        this.particleType = 'blood';
        this.setupParticleType();
    }
    
    /**
     * Reset blood particle for object pooling
     */
    reset(x, y) {
        const colors = ['#8B0000', '#AA0000', '#CC0000'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = 40 + Math.random() * 20;
        const size = 2 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        
        super.reset(x, y, color, life, size, angle, speed);
        this.particleType = 'blood';
        this.setupParticleType();
    }
}

class SparkParticle extends Particle {
    constructor(game, x, y) {
        const colors = ['#ffff00', '#ffffff', '#ffaa00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = 20 + Math.random() * 20;
        const size = 1 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        
        super(game, x, y, color, life, size, angle, speed);
        this.particleType = 'spark';
        this.setupParticleType();
    }
    
    /**
     * Reset spark particle for object pooling
     */
    reset(x, y) {
        const colors = ['#ffff00', '#ffffff', '#ffaa00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = 20 + Math.random() * 20;
        const size = 1 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        
        super.reset(x, y, color, life, size, angle, speed);
        this.particleType = 'spark';
        this.setupParticleType();
    }
}