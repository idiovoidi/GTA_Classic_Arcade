class District {
    constructor(game, x, y, width, height, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'industrial', 'residential', 'commercial', 'downtown'
        
        // District properties
        this.properties = this.getDistrictProperties(type);
        this.color = this.properties.color;
        this.crimeRate = this.properties.crimeRate;
        this.policeResponse = this.properties.policeResponse;
        this.trafficDensity = this.properties.trafficDensity;
        
        // Visual effects
        this.alpha = 0.3;
        this.pulseTimer = 0;
        this.showLabel = false;
        
        console.log(`District created: ${type} at (${x}, ${y})`);
    }
    
    getDistrictProperties(type) {
        const properties = {
            industrial: {
                color: '#8B4513',
                crimeRate: 0.7,
                policeResponse: 0.8,
                trafficDensity: 0.6,
                description: 'Industrial Zone',
                spawnTypes: ['trucks', 'workers'],
                ambientSound: 'industrial'
            },
            residential: {
                color: '#228B22',
                crimeRate: 0.3,
                policeResponse: 1.2,
                trafficDensity: 0.4,
                description: 'Residential Area',
                spawnTypes: ['civilians', 'family_cars'],
                ambientSound: 'suburban'
            },
            commercial: {
                color: '#4169E1',
                crimeRate: 0.5,
                policeResponse: 1.0,
                trafficDensity: 0.8,
                description: 'Commercial District',
                spawnTypes: ['shoppers', 'delivery_vehicles'],
                ambientSound: 'busy_street'
            },
            downtown: {
                color: '#DC143C',
                crimeRate: 0.8,
                policeResponse: 0.6,
                trafficDensity: 1.0,
                description: 'Downtown Core',
                spawnTypes: ['business_people', 'taxis'],
                ambientSound: 'city_center'
            }
        };
        
        return properties[type] || properties.residential;
    }
    
    update(deltaTime) {
        this.pulseTimer += deltaTime * 0.001;
        this.alpha = 0.2 + Math.sin(this.pulseTimer) * 0.1;
        
        // Check if player is in district
        this.checkPlayerPresence();
        
        // Influence spawning and behavior
        this.influenceGameplay();
    }
    
    checkPlayerPresence() {
        if (!this.game.player) return;
        
        const wasInside = this.playerInside;
        this.playerInside = this.containsPoint(this.game.player.x, this.game.player.y);
        
        if (this.playerInside && !wasInside) {
            this.onPlayerEnter();
        } else if (!this.playerInside && wasInside) {
            this.onPlayerExit();
        }
    }
    
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    onPlayerEnter() {
        this.showLabel = true;
        
        // Show district notification
        if (this.game.addTextEffect) {
            this.game.addTextEffect(
                this.game.player.x,
                this.game.player.y - 30,
                this.properties.description,
                this.color,
                2000
            );
        }
        
        // Play district ambient sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('zone_enter', this.x + this.width/2, this.y + this.height/2);
        }
    }
    
    onPlayerExit() {
        this.showLabel = false;
    }
    
    influenceGameplay() {
        // Influence police response in this district
        if (this.playerInside && this.game.wantedSystem) {
            const modifier = this.policeResponse;
            // Apply district-specific wanted level modifiers
        }
        
        // Influence vehicle spawning
        this.influenceVehicleSpawning();
        
        // Influence pedestrian behavior
        this.influencePedestrianBehavior();
    }
    
    influenceVehicleSpawning() {
        if (!this.game.vehicles) return;
        
        // Modify traffic density in this district
        if (Math.random() < 0.001 * this.trafficDensity) {
            // Spawn district-appropriate vehicles
            this.spawnDistrictVehicle();
        }
    }
    
    spawnDistrictVehicle() {
        const spawnX = this.x + Math.random() * this.width;
        const spawnY = this.y + Math.random() * this.height;
        
        let vehicleType = 'SEDAN'; // Default
        
        switch (this.type) {
            case 'industrial':
                vehicleType = Math.random() > 0.6 ? 'TRUCK' : 'SEDAN';
                break;
            case 'commercial':
                vehicleType = Math.random() > 0.7 ? 'SPORTS_CAR' : 'SEDAN';
                break;
            case 'downtown':
                vehicleType = Math.random() > 0.8 ? 'SPORTS_CAR' : 'SEDAN';
                break;
        }
        
        if (this.game.spawnSpecificVehicle) {
            this.game.spawnSpecificVehicle(vehicleType, spawnX, spawnY);
        }
    }
    
    influencePedestrianBehavior() {
        if (!this.game.pedestrians) return;
        
        // Modify pedestrian behavior in this district
        this.game.pedestrians.forEach(ped => {
            if (this.containsPoint(ped.x, ped.y)) {
                // Apply district-specific behavior modifiers
                switch (this.type) {
                    case 'industrial':
                        ped.alertness = Math.min(1.0, ped.alertness * 1.2);
                        break;
                    case 'residential':
                        ped.panicThreshold = Math.max(0.3, ped.panicThreshold * 0.8);
                        break;
                    case 'commercial':
                        ped.crowdBehavior = true;
                        break;
                }
            }
        });
    }
    
    render(ctx, lodLevel = 'high') {
        if (lodLevel === 'skip') return;
        
        ctx.save();
        
        // Draw district background
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw district border
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        if (lodLevel === 'high' && (this.showLabel || this.playerInside)) {
            // Draw district label
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                this.properties.description,
                this.x + this.width / 2,
                this.y + 20
            );
            ctx.textAlign = 'left';
        }
        
        ctx.restore();
    }
    
    getInfo() {
        return {
            type: this.type,
            position: { x: this.x, y: this.y },
            size: { width: this.width, height: this.height },
            properties: this.properties,
            playerInside: this.playerInside
        };
    }
}

class DistrictManager {
    constructor(game) {
        this.game = game;
        this.districts = [];
        this.enabled = true;
        
        console.log('DistrictManager initialized');
    }
    
    init() {
        this.districts = [];
        this.generateDistricts();
        console.log(`Generated ${this.districts.length} districts`);
    }
    
    generateDistricts() {
        const cityWidth = this.game.city?.width || 2000;
        const cityHeight = this.game.city?.height || 2000;
        
        // Create a grid of districts
        const districtSize = 400;
        const types = ['industrial', 'residential', 'commercial', 'downtown'];
        
        for (let x = 0; x < cityWidth; x += districtSize) {
            for (let y = 0; y < cityHeight; y += districtSize) {
                const type = types[Math.floor(Math.random() * types.length)];
                const width = Math.min(districtSize, cityWidth - x);
                const height = Math.min(districtSize, cityHeight - y);
                
                const district = new District(this.game, x, y, width, height, type);
                this.districts.push(district);
            }
        }
    }
    
    update(deltaTime) {
        if (!this.enabled) return;
        
        for (const district of this.districts) {
            district.update(deltaTime);
        }
    }
    
    render(ctx, lodLevel = 'high') {
        if (!this.enabled) return;
        
        for (const district of this.districts) {
            if (!this.game.isInViewport || this.game.isInViewport(district)) {
                district.render(ctx, lodLevel);
            }
        }
    }
    
    getDistrictAt(x, y) {
        return this.districts.find(district => district.containsPoint(x, y));
    }
    
    getCurrentPlayerDistrict() {
        if (!this.game.player) return null;
        return this.getDistrictAt(this.game.player.x, this.game.player.y);
    }
    
    getInfo() {
        return {
            enabled: this.enabled,
            districtCount: this.districts.length,
            currentPlayerDistrict: this.getCurrentPlayerDistrict()?.type || 'none'
        };
    }
}