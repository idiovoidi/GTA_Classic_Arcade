class City {
    constructor(game, config = {}) {
        this.game = game;
        
        // City configuration with defaults
        this.config = {
            width: config.width || 2000,
            height: config.height || 2000,
            blockSize: config.blockSize || 200,
            roadWidth: config.roadWidth || 30,
            sidewalkWidth: config.sidewalkWidth || 8,
            buildingMargin: config.buildingMargin || 10,
            minBuildingSize: config.minBuildingSize || 40,
            maxBuildingSize: config.maxBuildingSize || 120,
            addBoulevards: config.addBoulevards !== false, // true by default
            density: config.density || 1.0 // Multiplier for building density
        };
        
        this.width = this.config.width;
        this.height = this.config.height;
        this.tileSize = 50;
        
        // City layout
        this.roads = [];
        this.buildings = [];
        this.decorations = [];
        
        this.generateCity();
    }
    
    generateCity() {
        // Generate city using block-based system
        this.generateBlockBasedCity();
        
        // Generate decorations
        this.generateDecorations();
    }
    
    /**
     * Generate city using a block-based grid system
     * This creates a realistic city with proper roads and building placement
     */
    generateBlockBasedCity() {
        // Use the city configuration
        const config = this.config;
        
        // Calculate grid dimensions
        const blocksX = Math.floor(this.width / (config.blockSize + config.roadWidth));
        const blocksY = Math.floor(this.height / (config.blockSize + config.roadWidth));
        
        console.log(`Generating city: ${blocksX}x${blocksY} blocks`);
        
        // Generate road grid
        this.generateRoadGrid(blocksX, blocksY, config);
        
        // Generate buildings in each block
        this.generateBuildingsInBlocks(blocksX, blocksY, config);
        
        console.log(`City generated: ${this.roads.length} roads, ${this.buildings.length} buildings`);
    }
    
    /**
     * Generate a grid of roads
     */
    generateRoadGrid(blocksX, blocksY, config) {
        // Horizontal roads
        for (let row = 0; row <= blocksY; row++) {
            const y = row * (config.blockSize + config.roadWidth);
            this.roads.push({
                x: 0,
                y: y,
                width: this.width,
                height: config.roadWidth,
                type: 'horizontal',
                lanes: 2
            });
        }
        
        // Vertical roads
        for (let col = 0; col <= blocksX; col++) {
            const x = col * (config.blockSize + config.roadWidth);
            this.roads.push({
                x: x,
                y: 0,
                width: config.roadWidth,
                height: this.height,
                type: 'vertical',
                lanes: 2
            });
        }
        
        // Add a few diagonal/curved roads for variety (optional)
        if (blocksX > 3 && blocksY > 3) {
            this.addSpecialRoads(config);
        }
    }
    
    /**
     * Add special roads like diagonals or main boulevards
     */
    addSpecialRoads(config) {
        if (!config.addBoulevards) return;
        
        // Add a main boulevard (wider road) through the center
        const centerX = Math.floor(this.width / 2);
        this.roads.push({
            x: centerX - config.roadWidth,
            y: 0,
            width: config.roadWidth * 2,
            height: this.height,
            type: 'boulevard',
            lanes: 4
        });
    }
    
    /**
     * Generate buildings within city blocks
     */
    generateBuildingsInBlocks(blocksX, blocksY, config) {
        const buildingTemplates = this.getBuildingTemplates();
        
        for (let row = 0; row < blocksY; row++) {
            for (let col = 0; col < blocksX; col++) {
                // Calculate block boundaries
                const blockX = col * (config.blockSize + config.roadWidth) + config.roadWidth;
                const blockY = row * (config.blockSize + config.roadWidth) + config.roadWidth;
                
                // Determine district type for this block (creates variety)
                const districtType = this.getDistrictTypeForBlock(col, row, blocksX, blocksY);
                
                // Generate buildings in this block
                this.generateBuildingsInBlock(
                    blockX, 
                    blockY, 
                    config.blockSize, 
                    config.blockSize,
                    config,
                    districtType,
                    buildingTemplates
                );
            }
        }
    }
    
    /**
     * Determine what type of district this block should be
     */
    getDistrictTypeForBlock(col, row, blocksX, blocksY) {
        // Center blocks = downtown (commercial/skyscrapers)
        const centerX = blocksX / 2;
        const centerY = blocksY / 2;
        const distanceFromCenter = Math.sqrt(
            Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2)
        );
        
        if (distanceFromCenter < 2) {
            return 'downtown';
        } else if (distanceFromCenter < 4) {
            return 'commercial';
        } else if (Math.random() < 0.3) {
            return 'industrial';
        } else {
            return 'residential';
        }
    }
    
    /**
     * Generate buildings within a single block
     */
    generateBuildingsInBlock(blockX, blockY, blockWidth, blockHeight, config, districtType, templates) {
        // Determine building density based on district type
        const baseDensity = {
            downtown: 0.8,
            commercial: 0.7,
            industrial: 0.6,
            residential: 0.5
        }[districtType] || 0.5;
        
        // Apply global density multiplier
        const density = baseDensity * config.density;
        
        // Try to place buildings in the block
        const maxAttempts = 20;
        const placedBuildings = [];
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Select building type based on district
            const buildingType = this.selectBuildingTypeForDistrict(districtType);
            const template = templates[buildingType];
            
            // Select size
            const sizeOption = template.sizes[Math.floor(Math.random() * template.sizes.length)];
            const width = sizeOption.width;
            const height = sizeOption.height;
            
            // Try to place building
            const x = blockX + config.buildingMargin + Math.random() * (blockWidth - width - config.buildingMargin * 2);
            const y = blockY + config.buildingMargin + Math.random() * (blockHeight - height - config.buildingMargin * 2);
            
            // Check if it fits and doesn't overlap with other buildings
            if (this.canPlaceBuilding(x, y, width, height, placedBuildings, config.buildingMargin)) {
                const building = new Building(this.game, x, y, width, height);
                building.buildingType = buildingType;
                building.colorScheme = template.colors;
                building.windowPattern = template.windowPatterns[Math.floor(Math.random() * template.windowPatterns.length)];
                
                this.buildings.push(building);
                placedBuildings.push({ x, y, width, height });
                
                // Stop if we've reached desired density
                if (placedBuildings.length >= maxAttempts * density) {
                    break;
                }
            }
        }
    }
    
    /**
     * Check if a building can be placed at the given position
     */
    canPlaceBuilding(x, y, width, height, existingBuildings, margin) {
        // Check bounds
        if (x < 0 || y < 0 || x + width > this.width || y + height > this.height) {
            return false;
        }
        
        // Check overlap with existing buildings
        for (const building of existingBuildings) {
            if (this.rectOverlap(
                x - margin, y - margin, width + margin * 2, height + margin * 2,
                building.x, building.y, building.width, building.height
            )) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Select building type based on district
     */
    selectBuildingTypeForDistrict(districtType) {
        const distributions = {
            downtown: {
                types: ['skyscraper', 'commercial', 'commercial'],
                weights: [0.6, 0.3, 0.1]
            },
            commercial: {
                types: ['commercial', 'residential', 'skyscraper'],
                weights: [0.6, 0.3, 0.1]
            },
            industrial: {
                types: ['industrial', 'industrial', 'commercial'],
                weights: [0.7, 0.2, 0.1]
            },
            residential: {
                types: ['residential', 'residential', 'commercial'],
                weights: [0.7, 0.2, 0.1]
            }
        };
        
        const dist = distributions[districtType] || distributions.residential;
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < dist.weights.length; i++) {
            cumulative += dist.weights[i];
            if (random <= cumulative) {
                return dist.types[i];
            }
        }
        
        return dist.types[0];
    }
    
    /**
     * Get building templates
     */
    getBuildingTemplates() {
        return {
            residential: {
                sizes: [
                    { width: 50, height: 50 },
                    { width: 60, height: 60 },
                    { width: 70, height: 50 }
                ],
                colors: ['#666666', '#777777', '#888888'],
                features: ['windows', 'doors', 'balconies'],
                windowPatterns: ['grid', 'vertical', 'horizontal']
            },
            commercial: {
                sizes: [
                    { width: 70, height: 70 },
                    { width: 80, height: 80 },
                    { width: 90, height: 70 }
                ],
                colors: ['#7FB3D3', '#A3C1DA', '#B8D0E0'],
                features: ['largeWindows', 'signs', 'entrances'],
                windowPatterns: ['glass', 'reflective', 'tinted']
            },
            industrial: {
                sizes: [
                    { width: 90, height: 70 },
                    { width: 100, height: 80 },
                    { width: 110, height: 90 }
                ],
                colors: ['#444444', '#555555', '#666666'],
                features: ['pipes', 'tanks', 'catwalks'],
                windowPatterns: ['sparse', 'utilitarian']
            },
            skyscraper: {
                sizes: [
                    { width: 60, height: 100 },
                    { width: 70, height: 120 },
                    { width: 80, height: 140 }
                ],
                colors: ['#222222', '#333333', '#444444'],
                features: ['gridPattern', 'antenna', 'ledges'],
                windowPatterns: ['grid', 'curtainWall']
            }
        };
    }
    
    generateWindows(width, height) {
        const windows = [];
        const windowSize = 8;
        const spacing = 15;
        
        for (let x = 5; x < width - windowSize; x += spacing) {
            for (let y = 5; y < height - windowSize; y += spacing) {
                if (Math.random() < 0.7) { // 70% chance of window
                    windows.push({
                        x: x,
                        y: y,
                        width: windowSize,
                        height: windowSize,
                        lit: Math.random() < 0.3 // 30% chance of being lit
                    });
                }
            }
        }
        
        return windows;
    }
    
    generateDecorations() {
        const decorations = [
            { type: 'tree', size: 15, color: '#228B22' },
            { type: 'lamp', size: 8, color: '#FFD700' },
            { type: 'bench', size: 20, color: '#8B4513' },
            { type: 'trash', size: 10, color: '#696969' }
        ];
        
        for (let i = 0; i < 100; i++) {
            const decoration = decorations[Math.floor(Math.random() * decorations.length)];
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            
            // Don't place decorations on roads
            let onRoad = false;
            for (const road of this.roads) {
                if (this.rectOverlap(
                    x - decoration.size/2, y - decoration.size/2, decoration.size, decoration.size,
                    road.x, road.y, road.width, road.height
                )) {
                    onRoad = true;
                    break;
                }
            }
            
            if (!onRoad) {
                this.decorations.push({
                    x: x,
                    y: y,
                    type: decoration.type,
                    size: decoration.size,
                    color: decoration.color
                });
            }
        }
    }
    
    rectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    
    update(deltaTime) {
        // Update any animated elements
        this.decorations.forEach(decoration => {
            if (decoration.type === 'lamp') {
                // Flickering lights
                decoration.flicker = Math.random() < 0.1;
            }
        });
        
        // Update buildings
        this.buildings.forEach(building => {
            building.update(deltaTime);
        });
    }
    
    render(ctx) {
        // Render background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Render roads
        this.roads.forEach(road => {
            ctx.save();
            
            // Road surface
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(road.x, road.y, road.width, road.height);
            
            // Sidewalks
            ctx.fillStyle = '#555555';
            if (road.type === 'horizontal' || road.type === 'boulevard') {
                // Top sidewalk
                ctx.fillRect(road.x, road.y, road.width, 4);
                // Bottom sidewalk
                ctx.fillRect(road.x, road.y + road.height - 4, road.width, 4);
            } else if (road.type === 'vertical') {
                // Left sidewalk
                ctx.fillRect(road.x, road.y, 4, road.height);
                // Right sidewalk
                ctx.fillRect(road.x + road.width - 4, road.y, 4, road.height);
            }
            
            // Road markings
            ctx.fillStyle = '#ffff00';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            
            if (road.type === 'horizontal' || road.type === 'boulevard') {
                // Center line (dashed)
                const dashLength = 20;
                const gapLength = 15;
                ctx.setLineDash([dashLength, gapLength]);
                ctx.beginPath();
                ctx.moveTo(road.x, road.y + road.height / 2);
                ctx.lineTo(road.x + road.width, road.y + road.height / 2);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Lane markers for boulevards
                if (road.type === 'boulevard') {
                    ctx.setLineDash([dashLength, gapLength]);
                    ctx.beginPath();
                    ctx.moveTo(road.x, road.y + road.height / 4);
                    ctx.lineTo(road.x + road.width, road.y + road.height / 4);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(road.x, road.y + road.height * 3/4);
                    ctx.lineTo(road.x + road.width, road.y + road.height * 3/4);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            } else if (road.type === 'vertical') {
                // Center line (dashed)
                const dashLength = 20;
                const gapLength = 15;
                ctx.setLineDash([dashLength, gapLength]);
                ctx.beginPath();
                ctx.moveTo(road.x + road.width / 2, road.y);
                ctx.lineTo(road.x + road.width / 2, road.y + road.height);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            
            ctx.restore();
        });
        
        // Render buildings using the new Building system
        this.buildings.forEach(building => {
            building.render(ctx);
        });
        
        // Render decorations
        this.decorations.forEach(decoration => {
            ctx.fillStyle = decoration.color;
            
            if (decoration.type === 'tree') {
                // Tree trunk
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(
                    decoration.x - 2,
                    decoration.y - decoration.size/2,
                    4,
                    decoration.size/2
                );
                // Tree foliage
                ctx.fillStyle = decoration.color;
                ctx.beginPath();
                ctx.arc(decoration.x, decoration.y - decoration.size/4, decoration.size/2, 0, Math.PI * 2);
                ctx.fill();
            } else if (decoration.type === 'lamp') {
                // Lamp post
                ctx.fillStyle = '#666';
                ctx.fillRect(decoration.x - 1, decoration.y - decoration.size, 2, decoration.size);
                // Light
                ctx.fillStyle = decoration.flicker ? '#FFD700' : '#FFFF99';
                ctx.beginPath();
                ctx.arc(decoration.x, decoration.y - decoration.size, decoration.size/2, 0, Math.PI * 2);
                ctx.fill();
            } else if (decoration.type === 'bench') {
                // Bench
                ctx.fillStyle = decoration.color;
                ctx.fillRect(decoration.x - decoration.size/2, decoration.y - 3, decoration.size, 6);
            } else if (decoration.type === 'trash') {
                // Trash can
                ctx.fillStyle = decoration.color;
                ctx.fillRect(decoration.x - decoration.size/2, decoration.y - decoration.size/2, decoration.size, decoration.size);
            }
        });
    }
    
    isOnRoad(x, y) {
        for (const road of this.roads) {
            if (x >= road.x && x <= road.x + road.width &&
                y >= road.y && y <= road.y + road.height) {
                return true;
            }
        }
        return false;
    }
    
    getRandomRoadPosition() {
        const road = this.roads[Math.floor(Math.random() * this.roads.length)];
        return {
            x: road.x + Math.random() * road.width,
            y: road.y + Math.random() * road.height
        };
    }
    
    /**
     * Debug visualization - shows city structure
     * Call with: game.city.renderDebug(game.ctx)
     */
    renderDebug(ctx) {
        ctx.save();
        
        // Draw block boundaries
        const config = this.config;
        const blocksX = Math.floor(this.width / (config.blockSize + config.roadWidth));
        const blocksY = Math.floor(this.height / (config.blockSize + config.roadWidth));
        
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        
        for (let row = 0; row < blocksY; row++) {
            for (let col = 0; col < blocksX; col++) {
                const blockX = col * (config.blockSize + config.roadWidth) + config.roadWidth;
                const blockY = row * (config.blockSize + config.roadWidth) + config.roadWidth;
                
                ctx.strokeRect(blockX, blockY, config.blockSize, config.blockSize);
                
                // Label district type
                const districtType = this.getDistrictTypeForBlock(col, row, blocksX, blocksY);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '12px Arial';
                ctx.fillText(districtType, blockX + 5, blockY + 15);
            }
        }
        
        // Draw building outlines
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        this.buildings.forEach(building => {
            ctx.strokeRect(building.x, building.y, building.width, building.height);
        });
        
        // Draw road centers
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        this.roads.forEach(road => {
            if (road.type === 'horizontal' || road.type === 'boulevard') {
                ctx.beginPath();
                ctx.moveTo(road.x, road.y + road.height / 2);
                ctx.lineTo(road.x + road.width, road.y + road.height / 2);
                ctx.stroke();
            } else if (road.type === 'vertical') {
                ctx.beginPath();
                ctx.moveTo(road.x + road.width / 2, road.y);
                ctx.lineTo(road.x + road.width / 2, road.y + road.height);
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }
    
    /**
     * Get city statistics
     */
    getStats() {
        const districtCounts = {};
        const buildingTypeCounts = {};
        
        this.buildings.forEach(building => {
            buildingTypeCounts[building.buildingType] = (buildingTypeCounts[building.buildingType] || 0) + 1;
        });
        
        return {
            size: `${this.width}x${this.height}`,
            roads: this.roads.length,
            buildings: this.buildings.length,
            buildingTypes: buildingTypeCounts,
            config: this.config
        };
    }
}