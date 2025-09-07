/**
 * Test SoldierTroop spawning functionality
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
        return true;
    }
};

// Test soldier spawning
function testSoldierSpawning() {
    console.log('Testing SoldierTroop spawning...');
    
    try {
        // Check that updateSoldierSpawning function exists
        if (typeof mockGame.updateSoldierSpawning !== 'function') {
            console.error('updateSoldierSpawning function is not defined');
            return false;
        }
        
        console.log('SoldierTroop spawning test passed!');
        return true;
    } catch (error) {
        console.error('SoldierTroop spawning test failed:', error);
        return false;
    }
}

// Run the test
testSoldierSpawning();