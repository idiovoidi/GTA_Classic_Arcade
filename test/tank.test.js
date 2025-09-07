/**
 * Unit tests for the Tank class
 */

// Mock global objects that Tank depends on
global.Particle = class {
    constructor(game, x, y, color, life, size) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.size = size;
    }
};

global.Bullet = class {
    constructor(game, x, y, angle, speed, damage, range, size, color) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.size = size;
        this.color = color;
    }
};

// Mock Vehicle class
global.Vehicle = class {
    constructor(game, x, y, vehicleType) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vehicleType = vehicleType;
        this.width = 60;
        this.height = 30;
        this.radius = 25;
        this.health = 300;
        this.maxHealth = 300;
        this.mass = 8.0;
        this.angle = 0;
        this.speed = 0.8;
        this.maxSpeed = 0.8;
        this.acceleration = 0.03;
        this.friction = 0.95;
        this.turnSpeed = 0.01;
        this.velocity = { x: 0, y: 0 };
        this.targetX = x;
        this.targetY = y;
        this.state = 'patrolling';
    }
    
    update(deltaTime) {}
};

// Load the Tank class
const fs = require('fs');
const path = require('path');
let tankCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'entities', 'Tank.js'), 'utf8');

// Remove the export lines at the end since we're in Node.js
tankCode = tankCode.replace(/window\.Tank = Tank;/, '');
tankCode = tankCode.replace(/class Tank extends Vehicle \{/, 'global.Tank = class Tank extends Vehicle {');

// Execute the code
eval(tankCode);

console.log('Tank class loaded successfully');

// Mock game object for testing
const mockGame = {
    addParticle: function() {},
    audioManager: {
        playSound: function() {}
    },
    wantedSystem: {
        crimeHeat: {
            destroyVehicle: 25
        }
    },
    addHeat: function() {},
    score: 0,
    player: {
        x: 200,
        y: 200
    },
    city: {
        width: 1000,
        height: 1000,
        buildings: [],
        getRandomRoadPosition: function() {
            return { x: Math.random() * this.width, y: Math.random() * this.height };
        }
    },
    bullets: [],
    particles: [],
    addBullet: function(bullet) {
        this.bullets.push(bullet);
    },
    addParticle: function(particle) {
        this.particles.push(particle);
    },
    getDistance: function(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
};

// Test Tank creation
function testTankCreation() {
    console.log('Testing Tank creation...');
    
    try {
        const tank = new global.Tank(mockGame, 100, 100);
        
        // Check that the tank was created with correct properties
        if (tank.x !== 100) {
            console.error('Tank x position is incorrect');
            return false;
        }
        
        if (tank.y !== 100) {
            console.error('Tank y position is incorrect');
            return false;
        }
        
        if (tank.vehicleType !== 'TANK') {
            console.error('Tank vehicle type is incorrect');
            return false;
        }
        
        if (tank.health !== 300) {
            console.error('Tank health is incorrect');
            return false;
        }
        
        if (tank.maxHealth !== 300) {
            console.error('Tank max health is incorrect');
            return false;
        }
        
        console.log('Tank creation test passed!');
        return true;
    } catch (error) {
        console.error('Tank creation test failed:', error);
        return false;
    }
}

// Test Tank patrol method
function testTankPatrol() {
    console.log('Testing Tank patrol method...');
    
    try {
        const tank = new global.Tank(mockGame, 100, 100);
        const initialTargetX = tank.targetX;
        const initialTargetY = tank.targetY;
        
        // Call patrol method
        tank.patrol();
        
        // The patrol method should set new target coordinates
        // Since it uses random road positions, we can't check exact values
        // But we can check that the method exists and runs without error
        console.log('Tank patrol test passed!');
        return true;
    } catch (error) {
        console.error('Tank patrol test failed:', error);
        return false;
    }
}

// Test Tank AI update
function testTankAIUpdate() {
    console.log('Testing Tank AI update...');
    
    try {
        const tank = new global.Tank(mockGame, 100, 100);
        
        // Test that updateTankAI method exists and runs
        tank.updateTankAI(1000);
        
        console.log('Tank AI update test passed!');
        return true;
    } catch (error) {
        console.error('Tank AI update test failed:', error);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('Running Tank tests...\n');
    
    const tests = [
        testTankCreation,
        testTankPatrol,
        testTankAIUpdate
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            if (test()) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error('Test failed with exception:', error);
            failed++;
        }
        console.log(''); // Add spacing between tests
    }
    
    console.log(`Tests completed: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
        console.log('All tests passed! 🎉');
    } else {
        console.log('Some tests failed! ❌');
    }
    
    return failed === 0;
}

// Run the tests
runAllTests();