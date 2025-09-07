// Test runner for tank tests
const fs = require('fs');
const path = require('path');

// Add required classes to global scope
global.window = global;

// Mock required browser APIs
global.AudioContext = class {};
global.HTMLCanvasElement = class {};
global.CanvasRenderingContext2D = class {};

// Mock error handling system
global.window.errorHandler = {
    handleError: (type, error) => {
        console.warn(`Handled error: ${type}`, error);
    }
};

global.window.ErrorWrappers = {
    safeAIUpdate: (obj, deltaTime, type) => {
        if (obj.update) obj.update(deltaTime);
    },
    safeRenderOperation: (ctx, operation, type) => {
        try {
            operation(ctx);
        } catch (error) {
            console.warn(`Render error in ${type}:`, error);
        }
    },
    safeArrayOperation: (array, operation, type) => {
        try {
            return operation(array);
        } catch (error) {
            console.warn(`Array operation error in ${type}:`, error);
            return array;
        }
    }
};

// Mock other required classes
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
    }
    
    update(objects) {}
    getNearbyObjects(obj) { return []; }
}

class PoolManager {
    constructor(game) {
        this.game = game;
    }
    
    update(deltaTime) {
        return { bullets: [], particles: [] };
    }
    
    createBullet(x, y, angle, speed, damage, range, size, color, explosive, explosionRadius) {
        return new Bullet(this.game, x, y, angle, speed, damage, range, size, color, explosive, explosionRadius);
    }
    
    createParticle(x, y, color, life, size, angle, speed) {
        return new Particle(this.game, x, y, color, life, size, angle, speed);
    }
}

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
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.gravity = 0.02;
        this.friction = 0.98;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.alpha = 1.0;
        this.fadeRate = 1 / life;
        this.scaleRate = Math.random() * 0.02 + 0.01;
        this.particleType = 'generic';
    }
    
    update(deltaTime) {}
    render(ctx) {}
}

class Bullet {
    constructor(game, x, y, angle, speed, damage, range, size, color, explosive = false, explosionRadius = 0) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.maxRange = range;
        this.size = size;
        this.color = color;
        this.explosive = explosive;
        this.explosionRadius = explosionRadius;
        this.owner = 'player';
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.radius = size;
        this.life = range / speed * 1000;
        this.active = true;
        this.distanceTraveled = 0;
        this.trail = [];
        this.trailLength = 5;
    }
    
    update(deltaTime) {}
    render(ctx) {}
    checkCollisions() {}
    hit(target = null) {}
}

class Vehicle {
    constructor(game, x, y, vehicleType = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        
        // Mock vehicle types
        const VEHICLE_TYPES = {
            TANK: {
                name: 'Tank',
                width: 60,
                height: 30,
                radius: 25,
                health: 300,
                mass: 8.0,
                maxSpeed: 0.8,
                acceleration: 0.03,
                turnSpeed: 0.01,
                colors: ['#4a4a4a', '#333333', '#555555'],
                spawnWeight: 0
            }
        };
        
        if (!vehicleType) {
            vehicleType = 'TANK';
        }
        
        this.vehicleType = vehicleType;
        const typeData = VEHICLE_TYPES[vehicleType];
        
        this.width = typeData.width;
        this.height = typeData.height;
        this.radius = typeData.radius;
        this.health = typeData.health;
        this.maxHealth = typeData.health;
        this.mass = typeData.mass;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.8 + Math.random() * 0.4;
        this.maxSpeed = typeData.maxSpeed;
        this.acceleration = typeData.acceleration;
        this.friction = 0.95;
        this.turnSpeed = typeData.turnSpeed;
        this.velocity = { x: 0, y: 0 };
        this.targetX = x;
        this.targetY = y;
        this.path = [];
        this.currentPathIndex = 0;
        this.state = 'driving';
        this.stopTimer = 0;
        this.panicTimer = 0;
        this.color = typeData.colors[Math.floor(Math.random() * typeData.colors.length)];
        this.tireMarks = [];
        this.corpse = null;
        this.deathTime = 0;
        this.wreckageCreated = false;
    }
    
    update(deltaTime) {}
    render(ctx, lodLevel = 'high') {}
    takeDamage(amount, fromAngle = null) {
        this.health -= amount;
    }
}

// Make classes available globally
global.SpatialGrid = SpatialGrid;
global.PoolManager = PoolManager;
global.Particle = Particle;
global.Bullet = Bullet;
global.Vehicle = Vehicle;

// Load the Tank class
const tankPath = path.join(__dirname, '..', 'js', 'entities', 'Tank.js');
const tankCode = fs.readFileSync(tankPath, 'utf8');
eval(tankCode);

// Load the tank tests
const tankTestPath = path.join(__dirname, 'tank.test.js');
const tankTestCode = fs.readFileSync(tankTestPath, 'utf8');
eval(tankTestCode);

// Run the tests
console.log('Starting Tank Tests...\n');

// Run tank tests
const tankTestsPassed = runTankTests();

console.log('\n' + '='.repeat(50));
if (tankTestsPassed) {
    console.log('✅ All tank tests passed!');
    process.exit(0);
} else {
    console.log('❌ Some tank tests failed!');
    process.exit(1);
}