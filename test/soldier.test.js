/**
 * Unit tests for the SoldierTroop class
 */

// Include the SoldierTroop class
const path = require('path');

// Mock global objects that SoldierTroop depends on
global.Weapon = class {
    constructor(type, game) {
        this.type = type;
        this.game = game;
        this.config = {
            fireRate: 600,
            damage: 40,
            range: 300,
            bulletSpeed: 12,
            bulletSize: 2.5,
            color: '#0066ff'
        };
        this.lastFired = 0;
    }
    
    update(deltaTime) {}
    
    fire(x, y, angle) {
        this.lastFired = Date.now();
        return true;
    }
};

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

global.BloodParticle = class {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
    }
};

// Mock module system
global.module = { exports: {} };
global.require = function() { return {}; };

// Now try to load the SoldierTroop class
try {
    const soldierTroopPath = path.join(__dirname, '..', 'js', 'entities', 'SoldierTroop.js');
    const fs = require('fs');
    let soldierCode = fs.readFileSync(soldierTroopPath, 'utf8');
    
    // Remove the export lines at the end since we're in Node.js
    soldierCode = soldierCode.replace(/if \(typeof module !== 'undefined' && module.exports\) \{[^}]+\} else \{[^}]+\}/, '');
    
    // Execute the code
    eval(soldierCode);
    
    console.log('SoldierTroop class loaded successfully');
} catch (error) {
    console.error('Failed to load SoldierTroop class:', error);
}

// Mock game object for testing
const mockGame = {
    addParticle: function() {},
    audioManager: {
        playSound: function() {}
    },
    wantedSystem: {
        crimeHeat: {
            killSoldier: 60
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
        buildings: []
    },
    bullets: [],
    particles: [],
    addBullet: function(bullet) {
        this.bullets.push(bullet);
    },
    addParticle: function(particle) {
        this.particles.push(particle);
    },
    addCorpse: function() {}
};

// Test SoldierTroop creation
function testSoldierTroopCreation() {
    console.log('Testing SoldierTroop creation...');
    
    try {
        const soldier = new SoldierTroop(mockGame, 100, 100);
        
        // Check that the soldier was created with correct properties
        if (soldier.x !== 100) {
            console.error('Soldier x position is incorrect');
            return false;
        }
        
        if (soldier.y !== 100) {
            console.error('Soldier y position is incorrect');
            return false;
        }
        
        if (soldier.width !== 12) {
            console.error('Soldier width is incorrect');
            return false;
        }
        
        if (soldier.height !== 12) {
            console.error('Soldier height is incorrect');
            return false;
        }
        
        if (soldier.health !== 100) {
            console.error('Soldier health is incorrect');
            return false;
        }
        
        if (soldier.maxHealth !== 100) {
            console.error('Soldier max health is incorrect');
            return false;
        }
        
        if (soldier.speed !== 1.0) {
            console.error('Soldier speed is incorrect');
            return false;
        }
        
        if (!(soldier.weapon instanceof global.Weapon)) {
            console.error('Soldier weapon is not properly initialized');
            return false;
        }
        
        console.log('SoldierTroop creation test passed!');
        return true;
    } catch (error) {
        console.error('SoldierTroop creation test failed:', error);
        return false;
    }
}

// Test SoldierTroop movement
function testSoldierTroopMovement() {
    console.log('Testing SoldierTroop movement...');
    
    try {
        const soldier = new SoldierTroop(mockGame, 100, 100);
        const initialX = soldier.x;
        const initialY = soldier.y;
        
        // Update soldier to move toward player
        soldier.update(1000); // 1 second delta time
        
        // Check that soldier has moved
        if (soldier.x === initialX && soldier.y === initialY) {
            console.error('Soldier did not move');
            return false;
        }
        
        // Check that soldier is moving toward player
        const distanceToPlayer = Math.sqrt(
            Math.pow(soldier.x - mockGame.player.x, 2) + 
            Math.pow(soldier.y - mockGame.player.y, 2)
        );
        
        if (distanceToPlayer >= Math.sqrt(Math.pow(initialX - mockGame.player.x, 2) + Math.pow(initialY - mockGame.player.y, 2))) {
            console.error('Soldier is not moving toward player');
            return false;
        }
        
        console.log('SoldierTroop movement test passed!');
        return true;
    } catch (error) {
        console.error('SoldierTroop movement test failed:', error);
        return false;
    }
}

// Test SoldierTroop damage
function testSoldierTroopDamage() {
    console.log('Testing SoldierTroop damage...');
    
    try {
        const soldier = new SoldierTroop(mockGame, 100, 100);
        const initialHealth = soldier.health;
        const damageAmount = 30;
        
        // Apply damage
        soldier.takeDamage(damageAmount);
        
        // Check that health was reduced
        if (soldier.health !== initialHealth - damageAmount) {
            console.error('Soldier health was not reduced correctly');
            return false;
        }
        
        // Test that soldier dies when health reaches 0
        soldier.takeDamage(70);
        if (soldier.health !== 0) {
            console.error('Soldier health should be 0');
            return false;
        }
        
        if (soldier.state !== 'dead') {
            console.error('Soldier state should be dead');
            return false;
        }
        
        console.log('SoldierTroop damage test passed!');
        return true;
    } catch (error) {
        console.error('SoldierTroop damage test failed:', error);
        return false;
    }
}

// Test SoldierTroop shooting
function testSoldierTroopShooting() {
    console.log('Testing SoldierTroop shooting...');
    
    try {
        const soldier = new SoldierTroop(mockGame, 150, 150); // Place soldier closer to player
        const initialBulletCount = mockGame.bullets.length;
        
        // Try to shoot at player
        soldier.shootAtPlayer();
        
        // Check that a bullet was added
        if (mockGame.bullets.length <= initialBulletCount) {
            console.error('No bullet was fired');
            return false;
        }
        
        // Check that the bullet has correct properties
        const bullet = mockGame.bullets[mockGame.bullets.length - 1];
        if (bullet.owner !== 'soldier') {
            console.error('Bullet owner is not set to soldier');
            return false;
        }
        
        console.log('SoldierTroop shooting test passed!');
        return true;
    } catch (error) {
        console.error('SoldierTroop shooting test failed:', error);
        return false;
    }
}

// Test SoldierTroop line of sight
function testSoldierTroopLineOfSight() {
    console.log('Testing SoldierTroop line of sight...');
    
    try {
        const soldier = new SoldierTroop(mockGame, 100, 100);
        
        // Test that soldier can see player when there are no buildings
        const canSee = soldier.canSeePlayer();
        if (typeof canSee !== 'boolean') {
            console.error('canSeePlayer should return a boolean');
            return false;
        }
        
        console.log('SoldierTroop line of sight test passed!');
        return true;
    } catch (error) {
        console.error('SoldierTroop line of sight test failed:', error);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('Running SoldierTroop tests...\n');
    
    const tests = [
        testSoldierTroopCreation,
        testSoldierTroopMovement,
        testSoldierTroopDamage,
        testSoldierTroopShooting,
        testSoldierTroopLineOfSight
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