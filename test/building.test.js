/**
 * Unit tests for the Building system
 */

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
    score: 0
};

// Test Building creation
function testBuildingCreation() {
    console.log('Testing Building creation...');
    
    try {
        const building = new Building(mockGame, 100, 100, 100, 100);
        
        // Check that the building was created with correct properties
        if (building.x !== 100) {
            console.error('Building x position is incorrect');
            return false;
        }
        
        if (building.y !== 100) {
            console.error('Building y position is incorrect');
            return false;
        }
        
        if (building.width !== 100) {
            console.error('Building width is incorrect');
            return false;
        }
        
        if (building.height !== 100) {
            console.error('Building height is incorrect');
            return false;
        }
        
        // Check that walls and beams were created
        if (building.walls.length !== 4) {
            console.error('Incorrect number of walls created');
            return false;
        }
        
        if (building.beams.length !== 5) {
            console.error('Incorrect number of beams created');
            return false;
        }
        
        console.log('Building creation test passed!');
        return true;
    } catch (error) {
        console.error('Building creation test failed:', error);
        return false;
    }
}

// Test DestructibleWall creation and damage
function testDestructibleWall() {
    console.log('Testing DestructibleWall...');
    
    try {
        const wall = new DestructibleWall(0, 0, 50, 10);
        
        // Check initial properties
        if (wall.health !== 100) {
            console.error('Wall initial health is incorrect');
            return false;
        }
        
        if (wall.maxHealth !== 100) {
            console.error('Wall max health is incorrect');
            return false;
        }
        
        if (wall.isDestroyed !== false) {
            console.error('Wall should not be initially destroyed');
            return false;
        }
        
        // Test taking damage
        wall.takeDamage(30);
        if (wall.health !== 70) {
            console.error('Wall health after damage is incorrect');
            return false;
        }
        
        // Test destroying wall
        wall.takeDamage(80);
        if (wall.health !== 0) {
            console.error('Wall health after destruction is incorrect');
            return false;
        }
        
        if (wall.isDestroyed !== true) {
            console.error('Wall should be destroyed');
            return false;
        }
        
        console.log('DestructibleWall test passed!');
        return true;
    } catch (error) {
        console.error('DestructibleWall test failed:', error);
        return false;
    }
}

// Test SupportBeam creation
function testSupportBeam() {
    console.log('Testing SupportBeam...');
    
    try {
        const beam = new SupportBeam(0, 0, 20, 20);
        
        // Check initial properties
        if (beam.isInvincible !== true) {
            console.error('Beam should be invincible');
            return false;
        }
        
        if (beam.structuralIntegrity !== 1000) {
            console.error('Beam structural integrity is incorrect');
            return false;
        }
        
        console.log('SupportBeam test passed!');
        return true;
    } catch (error) {
        console.error('SupportBeam test failed:', error);
        return false;
    }
}

// Test BuildingCollider creation
function testBuildingCollider() {
    console.log('Testing BuildingCollider...');
    
    try {
        const mockBuilding = {
            x: 0,
            y: 0,
            width: 100,
            height: 100
        };
        
        const collider = new BuildingCollider(mockBuilding);
        
        // Check that the collider was created with the building reference
        if (collider.building !== mockBuilding) {
            console.error('Collider building reference is incorrect');
            return false;
        }
        
        console.log('BuildingCollider test passed!');
        return true;
    } catch (error) {
        console.error('BuildingCollider test failed:', error);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('Running Building system tests...\n');
    
    const tests = [
        testBuildingCreation,
        testDestructibleWall,
        testSupportBeam,
        testBuildingCollider
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