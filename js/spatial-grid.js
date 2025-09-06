/**
 * Spatial Grid for collision optimization
 * Implements grid-based spatial partitioning for efficient collision detection
 */

class SpatialGrid {
    constructor(width, height, cellSize = 100) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        
        // Initialize object tracking first
        this.objects = new Set();
        
        // Grid storage - initialize array
        this.grid = new Array(this.cols * this.rows);
        
        // Initialize grid cells
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = [];
        }
    }
    
    /**
     * Clear all grid cells
     */
    clear() {
        // Ensure grid is initialized
        if (!this.grid) {
            this.grid = new Array(this.cols * this.rows);
        }
        
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = [];
        }
        
        // Ensure objects set is initialized
        if (!this.objects) {
            this.objects = new Set();
        } else {
            this.objects.clear();
        }
    }
    
    /**
     * Get grid index for world coordinates
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @returns {number} Grid index
     */
    getIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return row * this.cols + col;
    }
    
    /**
     * Get grid coordinates for world position
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @returns {Object} Grid coordinates {col, row}
     */
    getGridCoords(x, y) {
        return {
            col: Math.floor(x / this.cellSize),
            row: Math.floor(y / this.cellSize)
        };
    }
    
    /**
     * Add object to spatial grid
     * @param {Object} obj - Object with x, y, and radius properties
     */
    addObject(obj) {
        if (!obj || typeof obj.x !== 'number' || typeof obj.y !== 'number') {
            return;
        }
        
        const radius = obj.radius || obj.size || 10;
        const minX = obj.x - radius;
        const maxX = obj.x + radius;
        const minY = obj.y - radius;
        const maxY = obj.y + radius;
        
        const minCol = Math.max(0, Math.floor(minX / this.cellSize));
        const maxCol = Math.min(this.cols - 1, Math.floor(maxX / this.cellSize));
        const minRow = Math.max(0, Math.floor(minY / this.cellSize));
        const maxRow = Math.min(this.rows - 1, Math.floor(maxY / this.cellSize));
        
        // Add object to all overlapping cells
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const index = row * this.cols + col;
                if (index >= 0 && index < this.grid.length) {
                    this.grid[index].push(obj);
                }
            }
        }
        
        this.objects.add(obj);
    }
    
    /**
     * Get nearby objects for collision testing
     * @param {Object} obj - Object to find neighbors for
     * @returns {Set} Set of nearby objects
     */
    getNearbyObjects(obj) {
        if (!obj || typeof obj.x !== 'number' || typeof obj.y !== 'number') {
            return new Set();
        }
        
        const nearby = new Set();
        const radius = obj.radius || obj.size || 10;
        const searchRadius = radius + 50; // Add buffer for collision detection
        
        const minX = obj.x - searchRadius;
        const maxX = obj.x + searchRadius;
        const minY = obj.y - searchRadius;
        const maxY = obj.y + searchRadius;
        
        const minCol = Math.max(0, Math.floor(minX / this.cellSize));
        const maxCol = Math.min(this.cols - 1, Math.floor(maxX / this.cellSize));
        const minRow = Math.max(0, Math.floor(minY / this.cellSize));
        const maxRow = Math.min(this.rows - 1, Math.floor(maxY / this.cellSize));
        
        // Collect objects from all nearby cells
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const index = row * this.cols + col;
                if (index >= 0 && index < this.grid.length) {
                    this.grid[index].forEach(other => {
                        if (other !== obj) {
                            nearby.add(other);
                        }
                    });
                }
            }
        }
        
        return nearby;
    }
    
    /**
     * Get objects in a specific region
     * @param {number} x - Region center X
     * @param {number} y - Region center Y
     * @param {number} width - Region width
     * @param {number} height - Region height
     * @returns {Set} Set of objects in the region
     */
    getObjectsInRegion(x, y, width, height) {
        const objects = new Set();
        
        const minX = x - width / 2;
        const maxX = x + width / 2;
        const minY = y - height / 2;
        const maxY = y + height / 2;
        
        const minCol = Math.max(0, Math.floor(minX / this.cellSize));
        const maxCol = Math.min(this.cols - 1, Math.floor(maxX / this.cellSize));
        const minRow = Math.max(0, Math.floor(minY / this.cellSize));
        const maxRow = Math.min(this.rows - 1, Math.floor(maxY / this.cellSize));
        
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const index = row * this.cols + col;
                if (index >= 0 && index < this.grid.length) {
                    this.grid[index].forEach(obj => {
                        // Check if object is actually within the region
                        if (obj.x >= minX && obj.x <= maxX && 
                            obj.y >= minY && obj.y <= maxY) {
                            objects.add(obj);
                        }
                    });
                }
            }
        }
        
        return objects;
    }
    
    /**
     * Update spatial grid with current object positions
     * @param {Array} objects - Array of objects to add to grid
     */
    update(objects) {
        this.clear();
        
        objects.forEach(obj => {
            if (obj && obj.health > 0 && obj.active !== false) {
                this.addObject(obj);
            }
        });
    }
    
    /**
     * Render grid for debugging
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera object with x, y offset
     */
    renderDebug(ctx, camera) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Draw grid lines
        for (let col = 0; col <= this.cols; col++) {
            const x = col * this.cellSize - camera.x;
            ctx.beginPath();
            ctx.moveTo(x, -camera.y);
            ctx.lineTo(x, this.height - camera.y);
            ctx.stroke();
        }
        
        for (let row = 0; row <= this.rows; row++) {
            const y = row * this.cellSize - camera.y;
            ctx.beginPath();
            ctx.moveTo(-camera.x, y);
            ctx.lineTo(this.width - camera.x, y);
            ctx.stroke();
        }
        
        // Draw cell object counts
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                const count = this.grid[index].length;
                
                if (count > 0) {
                    const x = (col + 0.5) * this.cellSize - camera.x;
                    const y = (row + 0.5) * this.cellSize - camera.y;
                    ctx.fillText(count.toString(), x, y);
                }
            }
        }
        
        ctx.restore();
    }
    
    /**
     * Get grid statistics for performance monitoring
     * @returns {Object} Grid statistics
     */
    getStats() {
        let totalObjects = 0;
        let filledCells = 0;
        let maxObjectsPerCell = 0;
        
        for (let i = 0; i < this.grid.length; i++) {
            const cellCount = this.grid[i].length;
            totalObjects += cellCount;
            
            if (cellCount > 0) {
                filledCells++;
                maxObjectsPerCell = Math.max(maxObjectsPerCell, cellCount);
            }
        }
        
        return {
            totalCells: this.grid.length,
            filledCells: filledCells,
            totalObjects: totalObjects,
            maxObjectsPerCell: maxObjectsPerCell,
            averageObjectsPerCell: filledCells > 0 ? totalObjects / filledCells : 0,
            gridEfficiency: filledCells / this.grid.length
        };
    }
}

// Export class
window.SpatialGrid = SpatialGrid;