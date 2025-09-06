/**
 * Object Pool System for performance optimization
 * Reduces garbage collection by reusing objects
 */

class ObjectPool {
    constructor(createFn, resetFn, initialSize = 50) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.activeObjects = new Set();
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    /**
     * Get an object from the pool
     * @param {...any} args - Arguments to pass to reset function
     * @returns {Object} Pooled object
     */
    get(...args) {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        
        // Reset object state
        if (this.resetFn) {
            this.resetFn(obj, ...args);
        }
        
        this.activeObjects.add(obj);
        return obj;
    }
    
    /**
     * Return an object to the pool
     * @param {Object} obj - Object to return
     */
    release(obj) {
        if (this.activeObjects.has(obj)) {
            this.activeObjects.delete(obj);
            this.pool.push(obj);
        }
    }
    
    /**
     * Release all inactive objects
     */
    releaseInactive() {
        for (const obj of this.activeObjects) {
            if (obj.active === false || obj.life <= 0) {
                this.release(obj);
            }
        }
    }
    
    /**
     * Get pool statistics
     * @returns {Object} Pool stats
     */
    getStats() {
        return {
            pooled: this.pool.length,
            active: this.activeObjects.size,
            total: this.pool.length + this.activeObjects.size
        };
    }
    
    /**
     * Clear all objects from pool
     */
    clear() {
        this.pool = [];
        this.activeObjects.clear();
    }
}

/**
 * Bullet Pool Manager
 */
class BulletPool extends ObjectPool {
    constructor(game) {
        super(
            // Create function
            () => new Bullet(game, 0, 0, 0, 0, 0, 0, 0, '#000000'),
            // Reset function
            (bullet, x, y, angle, speed, damage, range, size, color, explosive, explosionRadius) => {
                bullet.x = x;
                bullet.y = y;
                bullet.angle = angle;
                bullet.speed = speed;
                bullet.damage = damage;
                bullet.maxRange = range;
                bullet.size = size;
                bullet.color = color;
                bullet.explosive = explosive || false;
                bullet.explosionRadius = explosionRadius || 0;
                
                // Reset physics
                bullet.velocity.x = Math.cos(angle) * speed;
                bullet.velocity.y = Math.sin(angle) * speed;
                
                // Reset lifecycle
                bullet.life = range / speed * 1000;
                bullet.active = true;
                bullet.distanceTraveled = 0;
                
                // Reset trail
                bullet.trail = [];
            },
            100 // Initial pool size
        );
        
        this.game = game;
    }
    
    /**
     * Create a bullet from the pool
     * @param {number} x - X position
     * @param {number} y - Y position  
     * @param {number} angle - Bullet angle
     * @param {number} speed - Bullet speed
     * @param {number} damage - Bullet damage
     * @param {number} range - Bullet range
     * @param {number} size - Bullet size
     * @param {string} color - Bullet color
     * @param {boolean} explosive - Is explosive
     * @param {number} explosionRadius - Explosion radius
     * @returns {Bullet} Pooled bullet
     */
    createBullet(x, y, angle, speed, damage, range, size, color, explosive, explosionRadius) {
        return this.get(x, y, angle, speed, damage, range, size, color, explosive, explosionRadius);
    }
    
    /**
     * Update all active bullets and release inactive ones
     * @param {number} deltaTime - Delta time
     * @returns {Array} Array of active bullets
     */
    updateBullets(deltaTime) {
        const activeBullets = [];
        
        for (const bullet of this.activeObjects) {
            bullet.update(deltaTime);
            
            if (bullet.active && bullet.life > 0) {
                activeBullets.push(bullet);
            } else {
                this.release(bullet);
            }
        }
        
        return activeBullets;
    }
}

/**
 * Particle Pool Manager
 */
class ParticlePool extends ObjectPool {
    constructor(game) {
        super(
            // Create function
            () => new Particle(game, 0, 0, '#000000', 100, 1),
            // Reset function
            (particle, x, y, color, life, size, angle, speed) => {
                particle.x = x;
                particle.y = y;
                particle.color = color;
                particle.maxLife = life;
                particle.life = life;
                particle.maxSize = size;
                particle.size = size;
                particle.angle = angle || 0;
                particle.speed = speed || 1;
                
                // Reset physics
                particle.velocity.x = Math.cos(particle.angle) * particle.speed;
                particle.velocity.y = Math.sin(particle.angle) * particle.speed;
                
                // Reset visual properties
                particle.rotation = Math.random() * Math.PI * 2;
                particle.rotationSpeed = (Math.random() - 0.5) * 0.1;
                particle.alpha = 1.0;
                particle.fadeRate = 1 / life;
                particle.scaleRate = Math.random() * 0.02 + 0.01;
                
                // Setup particle type
                particle.particleType = particle.determineParticleType(color);
                particle.setupParticleType();
            },
            200 // Initial pool size for particles
        );
        
        this.game = game;
    }
    
    /**
     * Create a particle from the pool
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @param {number} life - Particle lifetime
     * @param {number} size - Particle size
     * @param {number} angle - Movement angle
     * @param {number} speed - Movement speed
     * @returns {Particle} Pooled particle
     */
    createParticle(x, y, color, life, size, angle, speed) {
        return this.get(x, y, color, life, size, angle, speed);
    }
    
    /**
     * Create multiple particles for effects
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} count - Number of particles
     * @param {string} color - Particle color
     * @param {Object} options - Particle options
     */
    createParticleBurst(x, y, count, color, options = {}) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (options.minSpeed || 1) + Math.random() * (options.maxSpeed || 3);
            const life = (options.minLife || 20) + Math.random() * (options.maxLife || 40);
            const size = (options.minSize || 1) + Math.random() * (options.maxSize || 3);
            
            const offsetX = x + (Math.random() - 0.5) * (options.spread || 20);
            const offsetY = y + (Math.random() - 0.5) * (options.spread || 20);
            
            particles.push(this.createParticle(offsetX, offsetY, color, life, size, angle, speed));
        }
        
        return particles;
    }
    
    /**
     * Update all active particles and release inactive ones
     * @param {number} deltaTime - Delta time
     * @returns {Array} Array of active particles
     */
    updateParticles(deltaTime) {
        const activeParticles = [];
        
        for (const particle of this.activeObjects) {
            particle.update(deltaTime);
            
            if (particle.life > 0) {
                activeParticles.push(particle);
            } else {
                this.release(particle);
            }
        }
        
        return activeParticles;
    }
}

/**
 * Pool Manager - manages all object pools
 */
class PoolManager {
    constructor(game) {
        this.game = game;
        this.bulletPool = new BulletPool(game);
        this.particlePool = new ParticlePool(game);
    }
    
    /**
     * Create a bullet using object pooling
     */
    createBullet(x, y, angle, speed, damage, range, size, color, explosive, explosionRadius) {
        return this.bulletPool.createBullet(x, y, angle, speed, damage, range, size, color, explosive, explosionRadius);
    }
    
    /**
     * Create a particle using object pooling
     */
    createParticle(x, y, color, life, size, angle, speed) {
        return this.particlePool.createParticle(x, y, color, life, size, angle, speed);
    }
    
    /**
     * Create particle burst effect
     */
    createParticleBurst(x, y, count, color, options) {
        return this.particlePool.createParticleBurst(x, y, count, color, options);
    }
    
    /**
     * Update all pools
     * @param {number} deltaTime - Delta time
     * @returns {Object} Active objects
     */
    update(deltaTime) {
        return {
            bullets: this.bulletPool.updateBullets(deltaTime),
            particles: this.particlePool.updateParticles(deltaTime)
        };
    }
    
    /**
     * Get statistics for all pools
     * @returns {Object} Pool statistics
     */
    getStats() {
        return {
            bullets: this.bulletPool.getStats(),
            particles: this.particlePool.getStats(),
            totalMemoryUsage: this.getMemoryUsage()
        };
    }
    
    /**
     * Estimate memory usage
     * @returns {Object} Memory usage estimate
     */
    getMemoryUsage() {
        const bulletStats = this.bulletPool.getStats();
        const particleStats = this.particlePool.getStats();
        
        // Rough estimates (in bytes)
        const bulletSize = 200; // Estimated size per bullet object
        const particleSize = 150; // Estimated size per particle object
        
        return {
            bullets: bulletStats.total * bulletSize,
            particles: particleStats.total * particleSize,
            total: (bulletStats.total * bulletSize) + (particleStats.total * particleSize)
        };
    }
    
    /**
     * Clear all pools
     */
    clear() {
        this.bulletPool.clear();
        this.particlePool.clear();
    }
}

// Export classes
window.ObjectPool = ObjectPool;
window.BulletPool = BulletPool;
window.ParticlePool = ParticlePool;
window.PoolManager = PoolManager;