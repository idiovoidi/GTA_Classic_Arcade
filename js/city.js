class City {
    constructor(game) {
        this.game = game;
        this.width = 2000;
        this.height = 2000;
        this.tileSize = 50;
        
        // City layout
        this.roads = [];
        this.buildings = [];
        this.decorations = [];
        
        this.generateCity();
    }
    
    generateCity() {
        // Generate road grid
        this.generateRoads();
        
        // Generate buildings
        this.generateBuildings();
        
        // Generate decorations
        this.generateDecorations();
    }
    
    generateRoads() {
        // Horizontal roads
        for (let y = 100; y < this.height; y += 150) {
            this.roads.push({
                x: 0,
                y: y,
                width: this.width,
                height: 20,
                type: 'horizontal'
            });
        }
        
        // Vertical roads
        for (let x = 100; x < this.width; x += 150) {
            this.roads.push({
                x: x,
                y: 0,
                width: 20,
                height: this.height,
                type: 'vertical'
            });
        }
        
        // Add some diagonal roads for variety
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const angle = Math.random() * Math.PI * 2;
            const length = 200 + Math.random() * 300;
            
            this.roads.push({
                x: x,
                y: y,
                width: 15,
                height: length,
                angle: angle,
                type: 'diagonal'
            });
        }
    }
    
    generateBuildings() {
        const buildingTypes = [
            { width: 80, height: 60, color: '#666' },
            { width: 100, height: 80, color: '#555' },
            { width: 60, height: 100, color: '#777' },
            { width: 120, height: 70, color: '#444' }
        ];
        
        for (let i = 0; i < 50; i++) {
            const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
            const x = Math.random() * (this.width - type.width);
            const y = Math.random() * (this.height - type.height);
            
            // Check if building overlaps with roads
            let overlaps = false;
            for (const road of this.roads) {
                if (this.rectOverlap(
                    x, y, type.width, type.height,
                    road.x, road.y, road.width, road.height
                )) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                this.buildings.push({
                    x: x,
                    y: y,
                    width: type.width,
                    height: type.height,
                    color: type.color,
                    windows: this.generateWindows(type.width, type.height)
                });
            }
        }
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
    }
    
    render(ctx) {
        // Render background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Render roads
        this.roads.forEach(road => {
            ctx.save();
            ctx.translate(road.x, road.y);
            
            if (road.type === 'diagonal') {
                ctx.rotate(road.angle);
            }
            
            // Road surface
            ctx.fillStyle = '#444';
            ctx.fillRect(0, 0, road.width, road.height);
            
            // Road markings
            ctx.fillStyle = '#fff';
            if (road.type === 'horizontal') {
                // Center line
                ctx.fillRect(road.width / 2 - 1, 0, 2, road.height);
                // Lane dividers
                ctx.fillRect(road.width / 4 - 0.5, 0, 1, road.height);
                ctx.fillRect(road.width * 3/4 - 0.5, 0, 1, road.height);
            } else if (road.type === 'vertical') {
                // Center line
                ctx.fillRect(0, road.height / 2 - 1, road.width, 2);
                // Lane dividers
                ctx.fillRect(0, road.height / 4 - 0.5, road.width, 1);
                ctx.fillRect(0, road.height * 3/4 - 0.5, road.width, 1);
            }
            
            ctx.restore();
        });
        
        // Render buildings
        this.buildings.forEach(building => {
            ctx.fillStyle = building.color;
            ctx.fillRect(building.x, building.y, building.width, building.height);
            
            // Building outline
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(building.x, building.y, building.width, building.height);
            
            // Windows
            building.windows.forEach(window => {
                ctx.fillStyle = window.lit ? '#FFD700' : '#666';
                ctx.fillRect(
                    building.x + window.x,
                    building.y + window.y,
                    window.width,
                    window.height
                );
            });
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
}
