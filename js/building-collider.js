/**
 * Building Collider Component for Building System
 * Handles physics interactions for buildings
 */

class BuildingCollider {
    constructor(building) {
        this.building = building;
    }
    
    /**
     * Update collider state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Collider doesn't need regular updates in this implementation
    }
    
    /**
     * Check collision with another object
     * @param {Object} other - Other object to check collision with
     * @returns {boolean} Whether collision occurred
     */
    checkCollision(other) {
        // Check collision with the building's bounding box
        return Physics.checkRectCollision(
            { x: this.building.x, y: this.building.y, width: this.building.width, height: this.building.height },
            { x: other.x, y: other.y, width: other.width || 0, height: other.height || 0 }
        );
    }
    
    /**
     * Resolve collision with another object
     * @param {Object} other - Other object to resolve collision with
     */
    resolveCollision(other) {
        // Simple collision resolution - stop the object
        if (other.velocity) {
            // Determine which side of the building was hit
            const building = this.building;
            
            // Calculate overlap on each side
            const overlapLeft = (other.x + (other.width || 0)) - building.x;
            const overlapRight = (building.x + building.width) - other.x;
            const overlapTop = (other.y + (other.height || 0)) - building.y;
            const overlapBottom = (building.y + building.height) - other.y;
            
            // Find the smallest overlap to determine collision side
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            
            // Resolve based on smallest overlap
            if (minOverlap === overlapLeft) {
                // Hit left side of building
                other.x = building.x - (other.width || 0);
                if (other.velocity.x > 0) other.velocity.x = 0;
            } else if (minOverlap === overlapRight) {
                // Hit right side of building
                other.x = building.x + building.width;
                if (other.velocity.x < 0) other.velocity.x = 0;
            } else if (minOverlap === overlapTop) {
                // Hit top side of building
                other.y = building.y - (other.height || 0);
                if (other.velocity.y > 0) other.velocity.y = 0;
            } else {
                // Hit bottom side of building
                other.y = building.y + building.height;
                if (other.velocity.y < 0) other.velocity.y = 0;
            }
        }
    }
}

// Export the BuildingCollider class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuildingCollider;
}