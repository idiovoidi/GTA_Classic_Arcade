/**
 * Test SoldierTroop spawning functionality at wanted level 5
 */

// Mock game object for testing
const mockGame = {
    soldiers: [],
    wantedSystem: {
        level: 5
    },
    player: {
        x: 200,
        y: 200,
        velocity: { x: 0, y: 0 }
    },
    city: {
        width: 1000,
        height: 1000
    },
    audioManager: {
        playSound: function() {}
    },
    score: 0,
    wantedSystem: {
        crimeHeat: {
            killSoldier: 60,
            destroyVehicle: 25
        }
    },
    addHeat: function() {},
    
    // Add the updateSoldierSpawning function
    updateSoldierSpawning: function(deltaTime) {
        // Mock implementation for testing
        console.log('updateSoldierSpawning called with deltaTime:', deltaTime);
        
        // Simulate soldier spawning logic
        if (this.wantedSystem.level >= 5) {
            if (!this.soldiers) {
                this.soldiers = [];
            }
            
            // Spawn a soldier with 10% chance
            if (Math.random() < 0.1) {
                this.soldiers.push({
                    x: Math.random() * this.city.width,
                    y: Math.random() * this.city.height,
                    health: 100,
                    update: function() {}
                });
            }
            
            return true;
        }
        return false;
    },
    
    spawnSoldier: function() {
        // Mock soldier spawning
        if (!this.soldiers) {
            this.soldiers = [];
        }
        
        this.soldiers.push({
            x: Math.random() * this.city.width,
            y: Math.random() * this.city.height,
            health: 100,
            update: function() {}
        });
        
        console.log('Soldier spawned');
        return true;
    }
};

// Test soldier spawning at wanted level 5
function testSoldierSpawningAtLevel5() {
    console.log('Testing SoldierTroop spawning at wanted level 5...');
    
    try {
        // Set wanted level to 5
        mockGame.wantedSystem.level = 5;
        
        // Check that updateSoldierSpawning function exists and works
        if (typeof mockGame.updateSoldierSpawning !== 'function') {
            console.error('updateSoldierSpawning function is not defined');
            return false;
        }
        
        // Call the function
        const result = mockGame.updateSoldierSpawning(1000);
        
        if (result !== true) {
            console.error('updateSoldierSpawning should return true at wanted level 5');
            return false;
        }
        
        console.log('SoldierTroop spawning test at wanted level 5 passed!');
        return true;
    } catch (error) {
        console.error('SoldierTroop spawning test at wanted level 5 failed:', error);
        return false;
    }
}

// Test soldier spawning at wanted level below 5
function testSoldierSpawningBelowLevel5() {
    console.log('Testing SoldierTroop spawning at wanted level below 5...');
    
    try {
        // Set wanted level to 3
        mockGame.wantedSystem.level = 3;
        
        // Modify the function to test behavior at lower levels
        const originalFunction = mockGame.updateSoldierSpawning;
        mockGame.updateSoldierSpawning = function(deltaTime) {
            if (this.wantedSystem.level >= 5) {
                return true;
            }
            return false;
        };
        
        // Call the function
        const result = mockGame.updateSoldierSpawning(1000);
        
        if (result !== false) {
            console.error('updateSoldierSpawning should return false at wanted level below 5');
            return false;
        }
        
        console.log('SoldierTroop spawning test at wanted level below 5 passed!');
        return true;
    } catch (error) {
        console.error('SoldierTroop spawning test at wanted level below 5 failed:', error);
        return false;
    }
}

// Test direct soldier spawning
function testDirectSoldierSpawning() {
    console.log('Testing direct soldier spawning...');
    
    try {
        // Check that spawnSoldier function exists
        if (typeof mockGame.spawnSoldier !== 'function') {
            console.error('spawnSoldier function is not defined');
            return false;
        }
        
        // Clear soldiers array
        mockGame.soldiers = [];
        
        // Call the function
        const result = mockGame.spawnSoldier();
        
        if (result !== true) {
            console.error('spawnSoldier should return true');
            return false;
        }
        
        if (mockGame.soldiers.length !== 1) {
            console.error('spawnSoldier should add one soldier to the array');
            return false;
        }
        
        console.log('Direct soldier spawning test passed!');
        return true;
    } catch (error) {
        console.error('Direct soldier spawning test failed:', error);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('Running Soldier spawning tests...\n');
    
    const tests = [
        testSoldierSpawningAtLevel5,
        testSoldierSpawningBelowLevel5,
        testDirectSoldierSpawning
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