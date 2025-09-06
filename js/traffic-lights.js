class TrafficLight {
    constructor(game, x, y, orientation = 'vertical') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 40;
        this.orientation = orientation; // 'vertical' or 'horizontal'
        
        // Traffic light state
        this.state = 'green'; // 'green', 'yellow', 'red'
        this.timer = 0;
        this.cycleTime = {
            green: 8000,   // 8 seconds
            yellow: 2000,  // 2 seconds  
            red: 6000      // 6 seconds
        };
        
        // Visual properties
        this.lightRadius = 6;
        this.lightSpacing = 12;
        
        // AI influence radius
        this.influenceRadius = 150;
        this.complianceZone = 80; // Distance where vehicles should start stopping
        
        // Performance optimization
        this.lastUpdate = 0;
        this.updateInterval = 100; // Update every 100ms
        
        console.log(`Traffic light created at (${x}, ${y}) with ${orientation} orientation`);
    }
    
    /**
     * Update traffic light logic
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        this.lastUpdate += deltaTime;
        
        if (this.lastUpdate < this.updateInterval) return;
        
        this.timer += this.lastUpdate;
        this.lastUpdate = 0;
        
        // Cycle through states
        const currentCycleTime = this.cycleTime[this.state];
        
        if (this.timer >= currentCycleTime) {
            this.timer = 0;
            this.switchState();
        }
        
        // Influence nearby vehicles
        this.influenceVehicles();
    }
    
    /**
     * Switch to next traffic light state
     */
    switchState() {
        switch (this.state) {
            case 'green':
                this.state = 'yellow';
                break;
            case 'yellow':
                this.state = 'red';
                break;
            case 'red':
                this.state = 'green';
                break;
        }
        
        // Play traffic light sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('traffic_light', this.x, this.y);
        }
        
        console.log(`Traffic light at (${this.x}, ${this.y}) switched to ${this.state}`);
    }
    
    /**
     * Influence nearby vehicles based on traffic light state
     */
    influenceVehicles() {
        if (!this.game.vehicles) return;
        
        for (const vehicle of this.game.vehicles) {
            if (vehicle.state === 'dead') continue;
            
            const distance = Math.sqrt(
                Math.pow(vehicle.x - this.x, 2) + 
                Math.pow(vehicle.y - this.y, 2)
            );
            
            if (distance <= this.influenceRadius) {
                this.influenceVehicle(vehicle, distance);
            }
        }
        
        // Also influence player if they're a law-abiding citizen
        if (this.game.player && this.game.wantedSystem.level === 0) {
            const playerDistance = Math.sqrt(
                Math.pow(this.game.player.x - this.x, 2) + 
                Math.pow(this.game.player.y - this.y, 2)
            );
            
            if (playerDistance <= this.influenceRadius) {
                // Add minor heat for running red lights
                if (this.state === 'red' && playerDistance < this.complianceZone && 
                    Math.abs(this.game.player.speed) > 1) {
                    this.game.addHeat(2, 'traffic_violation');
                }
            }
        }
    }
    
    /**
     * Influence a specific vehicle
     * @param {Object} vehicle - Vehicle to influence
     * @param {number} distance - Distance to traffic light
     */
    influenceVehicle(vehicle, distance) {
        // Skip if vehicle doesn't care about traffic laws
        const lawAbiding = vehicle.riskTolerance < 0.7;
        if (!lawAbiding) return;
        
        // Determine if vehicle should stop
        const shouldStop = this.shouldVehicleStop(vehicle, distance);
        
        if (shouldStop) {
            // Apply braking force
            const brakingForce = this.calculateBrakingForce(distance);
            vehicle.speed *= (1 - brakingForce);
            
            // Mark vehicle as stopping for traffic light
            vehicle.stoppingForLight = true;
            vehicle.targetSpeed = 0;
        } else if (vehicle.stoppingForLight && this.state === 'green') {
            // Resume normal movement
            vehicle.stoppingForLight = false;
            vehicle.targetSpeed = vehicle.maxSpeed * (0.7 + Math.random() * 0.3);
        }
    }
    
    /**
     * Determine if vehicle should stop
     * @param {Object} vehicle - Vehicle to check
     * @param {number} distance - Distance to traffic light
     * @returns {boolean} Whether vehicle should stop
     */
    shouldVehicleStop(vehicle, distance) {
        if (this.state === 'green') return false;
        
        // Stop if red light and within compliance zone
        if (this.state === 'red' && distance < this.complianceZone) {
            return true;
        }
        
        // Stop if yellow light and close enough to brake safely
        if (this.state === 'yellow') {
            const stoppingDistance = Math.pow(vehicle.speed, 2) / (2 * vehicle.maxSpeed * 0.1);
            return distance < stoppingDistance + 20;
        }
        
        return false;
    }
    
    /**
     * Calculate braking force based on distance to light
     * @param {number} distance - Distance to traffic light
     * @returns {number} Braking force (0-1)
     */
    calculateBrakingForce(distance) {
        const normalizedDistance = distance / this.complianceZone;
        const urgency = Math.max(0, 1 - normalizedDistance);
        
        // More aggressive braking when closer
        return urgency * 0.15; // Max 15% speed reduction per frame
    }
    
    /**
     * Get traffic light info for debugging
     * @returns {Object} Traffic light information
     */
    getInfo() {
        return {
            position: { x: this.x, y: this.y },
            state: this.state,
            timer: this.timer,
            cycleTime: this.cycleTime[this.state],
            orientation: this.orientation,
            influenceRadius: this.influenceRadius
        };
    }
    
    /**
     * Render traffic light
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {string} lodLevel - Level of detail
     */
    render(ctx, lodLevel = 'high') {
        if (lodLevel === 'skip') return;
        
        ctx.save();
        
        // Draw traffic light post
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 2, this.y, 4, this.height + 10);
        
        // Draw traffic light box
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
        
        // Draw light border
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width/2, this.y, this.width, this.height);
        
        if (lodLevel === 'high') {
            // Draw individual lights
            this.renderLights(ctx);
            
            // Draw influence radius in debug mode
            if (this.game.showTrafficDebug) {
                this.renderDebugInfo(ctx);
            }
        }
        
        ctx.restore();
    }
    
    /**
     * Render traffic light bulbs
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderLights(ctx) {
        const centerX = this.x;
        const centerY = this.y + this.height / 2;
        
        // Light positions
        const lights = [
            { state: 'red', y: centerY - this.lightSpacing },
            { state: 'yellow', y: centerY },
            { state: 'green', y: centerY + this.lightSpacing }
        ];
        
        for (const light of lights) {
            // Draw light background
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(centerX, light.y, this.lightRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw active light
            if (light.state === this.state) {
                const colors = {
                    red: '#ff0000',
                    yellow: '#ffff00', 
                    green: '#00ff00'
                };
                
                ctx.fillStyle = colors[light.state];
                ctx.beginPath();
                ctx.arc(centerX, light.y, this.lightRadius - 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = colors[light.state];
                ctx.beginPath();
                ctx.arc(centerX, light.y, this.lightRadius - 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }
    
    /**
     * Render debug information
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderDebugInfo(ctx) {
        // Influence radius
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.height/2, this.influenceRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Compliance zone
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.height/2, this.complianceZone, 0, Math.PI * 2);
        ctx.stroke();
        
        // State text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.state.toUpperCase(), this.x, this.y - 10);
        ctx.textAlign = 'left';
    }
}

class TrafficLightManager {
    constructor(game) {
        this.game = game;
        this.trafficLights = [];
        
        // System settings
        this.enabled = true;
        this.maxLights = 20;
        this.placementDistance = 300; // Minimum distance between lights
        
        // Debug mode
        this.game.showTrafficDebug = false;
        
        console.log('TrafficLightManager initialized');
    }
    
    /**
     * Initialize traffic light system
     */
    init() {
        // Clear existing lights
        this.trafficLights = [];
        
        // Generate traffic lights at strategic locations
        this.generateTrafficLights();
        
        console.log(`Generated ${this.trafficLights.length} traffic lights`);
    }
    
    /**
     * Generate traffic lights throughout the city
     */
    generateTrafficLights() {
        if (!this.game.city || !this.game.city.roads) return;
        
        const gridSize = 200;
        const cityWidth = this.game.city.width || 2000;
        const cityHeight = this.game.city.height || 2000;
        
        // Generate lights on a grid pattern
        for (let x = gridSize; x < cityWidth; x += gridSize) {
            for (let y = gridSize; y < cityHeight; y += gridSize) {
                // Add some randomness to placement
                const offsetX = (Math.random() - 0.5) * 50;
                const offsetY = (Math.random() - 0.5) * 50;
                
                const lightX = x + offsetX;
                const lightY = y + offsetY;
                
                // Check if location is suitable (near roads)
                if (this.isValidLightLocation(lightX, lightY)) {
                    const orientation = Math.random() > 0.5 ? 'vertical' : 'horizontal';
                    const light = new TrafficLight(this.game, lightX, lightY, orientation);
                    
                    // Stagger the timing so not all lights change at once
                    light.timer = Math.random() * light.cycleTime[light.state];
                    
                    this.trafficLights.push(light);
                    
                    if (this.trafficLights.length >= this.maxLights) {
                        return;
                    }
                }
            }
        }
    }
    
    /**
     * Check if location is valid for traffic light
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean} Whether location is valid
     */
    isValidLightLocation(x, y) {
        // Check minimum distance from other lights
        for (const light of this.trafficLights) {
            const distance = Math.sqrt(
                Math.pow(x - light.x, 2) + 
                Math.pow(y - light.y, 2)
            );
            
            if (distance < this.placementDistance) {
                return false;
            }
        }
        
        // Check if near a road (simplified check)
        if (this.game.city.roads) {
            for (const road of this.game.city.roads) {
                const roadCenterX = road.x + road.width / 2;
                const roadCenterY = road.y + road.height / 2;
                const distance = Math.sqrt(
                    Math.pow(x - roadCenterX, 2) + 
                    Math.pow(y - roadCenterY, 2)
                );
                
                if (distance < 100) {
                    return true;
                }
            }
        }
        
        // Default to true if no road data available
        return this.game.city.roads ? false : true;
    }
    
    /**
     * Update all traffic lights
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        if (!this.enabled) return;
        
        for (const light of this.trafficLights) {
            light.update(deltaTime);
        }
    }
    
    /**
     * Render all traffic lights
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {string} lodLevel - Level of detail
     */
    render(ctx, lodLevel = 'high') {
        if (!this.enabled) return;
        
        for (const light of this.trafficLights) {
            light.render(ctx, lodLevel);
        }
    }
    
    /**
     * Toggle debug mode
     */
    toggleDebug() {
        this.game.showTrafficDebug = !this.game.showTrafficDebug;
        console.log(`Traffic debug mode: ${this.game.showTrafficDebug}`);
    }
    
    /**
     * Get traffic light system info
     * @returns {Object} System information
     */
    getInfo() {
        return {
            enabled: this.enabled,
            lightCount: this.trafficLights.length,
            maxLights: this.maxLights,
            debugMode: this.game.showTrafficDebug,
            placementDistance: this.placementDistance
        };
    }
    
    /**
     * Add a new traffic light at specified location
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} orientation - Light orientation
     * @returns {TrafficLight} Created traffic light
     */
    addTrafficLight(x, y, orientation = 'vertical') {
        if (this.trafficLights.length >= this.maxLights) {
            console.warn('Maximum traffic lights reached');
            return null;
        }
        
        if (!this.isValidLightLocation(x, y)) {
            console.warn('Invalid location for traffic light');
            return null;
        }
        
        const light = new TrafficLight(this.game, x, y, orientation);
        this.trafficLights.push(light);
        
        return light;
    }
    
    /**
     * Remove traffic light by index
     * @param {number} index - Index of light to remove
     */
    removeTrafficLight(index) {
        if (index >= 0 && index < this.trafficLights.length) {
            this.trafficLights.splice(index, 1);
        }
    }
    
    /**
     * Clear all traffic lights
     */
    clearAll() {
        this.trafficLights = [];
        console.log('All traffic lights cleared');
    }
}