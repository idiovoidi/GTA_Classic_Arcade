class DayNightCycle {
    constructor(game) {
        this.game = game;
        
        // Time system - 24 hour cycle
        this.timeOfDay = 12; // Start at noon (12:00)
        this.timeSpeed = 0.5; // Game minutes per real second
        this.cycleDuration = 24 * 60; // 24 hours in game minutes
        
        // Lighting system
        this.ambientLight = 1.0; // 0.0 to 1.0
        this.lightColor = { r: 255, g: 255, b: 255 };
        this.shadowIntensity = 0.0; // 0.0 to 1.0
        
        // Sky system
        this.skyColor = { r: 135, g: 206, b: 235 }; // Day sky blue
        this.cloudCoverage = 0.3; // 0.0 to 1.0
        this.cloudSpeed = 0.5;
        this.cloudOffset = 0;
        
        // Dynamic lighting zones
        this.streetLights = [];
        this.buildingLights = [];
        this.vehicleLights = [];
        
        // Visual effects
        this.stars = [];
        this.sun = { x: 0, y: 0, visible: true };
        this.moon = { x: 0, y: 0, visible: false };
        
        // Performance settings
        this.lightingUpdateInterval = 100; // Update every 100ms
        this.lastLightingUpdate = 0;
        this.enableDynamicShadows = true;
        this.maxStreetLights = 50;
        
        this.initializeSystem();
        console.log('DayNightCycle initialized');
    }
    
    /**
     * Initialize the day/night system
     */
    initializeSystem() {
        this.generateStars();
        this.generateStreetLights();
        this.updateLighting();
    }
    
    /**
     * Generate stars for nighttime
     */
    generateStars() {
        this.stars = [];
        const starCount = 200;
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * 2000, // Spread across game world
                y: Math.random() * 2000,
                brightness: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.5 + Math.random() * 2,
                twinklePhase: Math.random() * Math.PI * 2,
                size: 1 + Math.random() * 2
            });
        }
    }
    
    /**
     * Generate street lights throughout the city
     */
    generateStreetLights() {
        this.streetLights = [];
        
        if (!this.game.city) return;
        
        // Place street lights along roads
        const spacing = 120; // Distance between street lights
        const cityWidth = this.game.city.width || 2000;
        const cityHeight = this.game.city.height || 2000;
        
        for (let x = spacing; x < cityWidth; x += spacing) {
            for (let y = spacing; y < cityHeight; y += spacing) {
                // Add some randomness to placement
                const offsetX = (Math.random() - 0.5) * 30;
                const offsetY = (Math.random() - 0.5) * 30;
                
                const light = {
                    x: x + offsetX,
                    y: y + offsetY,
                    radius: 80 + Math.random() * 40, // Light radius
                    intensity: 0.8 + Math.random() * 0.2,
                    color: { r: 255, g: 240, b: 200 }, // Warm white
                    flickerChance: 0.02, // 2% chance to flicker
                    isOn: false,
                    height: 15 + Math.random() * 10
                };
                
                this.streetLights.push(light);
                
                if (this.streetLights.length >= this.maxStreetLights) {
                    return;
                }
            }
        }
    }
    
    /**
     * Update the day/night cycle
     * @param {number} deltaTime - Delta time in milliseconds
     */
    update(deltaTime) {
        // Update time of day
        this.timeOfDay += (this.timeSpeed * deltaTime) / 1000 / 60; // Convert to game minutes
        
        if (this.timeOfDay >= 24) {
            this.timeOfDay -= 24; // Reset to 0 at midnight
        }
        
        // Update cloud movement
        this.cloudOffset += this.cloudSpeed * deltaTime * 0.001;
        
        // Update lighting periodically for performance
        this.lastLightingUpdate += deltaTime;
        if (this.lastLightingUpdate >= this.lightingUpdateInterval) {
            this.updateLighting();
            this.updateCelestialBodies();
            this.updateStreetLights();
            this.lastLightingUpdate = 0;
        }
        
        // Update stars twinkle effect
        this.updateStars(deltaTime);
    }
    
    /**
     * Update lighting based on time of day
     */
    updateLighting() {
        const hour = this.timeOfDay;
        
        // Calculate ambient light based on time
        if (hour >= 6 && hour <= 18) {
            // Daytime (6 AM to 6 PM)
            const dayProgress = (hour - 6) / 12;
            const lightCurve = Math.sin(dayProgress * Math.PI);
            this.ambientLight = 0.3 + lightCurve * 0.7;
            
            // Day colors - warm during sunrise/sunset, cool during midday
            if (hour < 8 || hour > 16) {
                // Sunrise/sunset
                const sunsetFactor = hour < 8 ? (8 - hour) / 2 : (hour - 16) / 2;
                this.lightColor = {
                    r: 255,
                    g: 200 - sunsetFactor * 50,
                    b: 150 - sunsetFactor * 50
                };
                this.skyColor = {
                    r: 255,
                    g: 140 + sunsetFactor * 50,
                    b: 100 + sunsetFactor * 100
                };
            } else {
                // Midday
                this.lightColor = { r: 255, g: 255, b: 255 };
                this.skyColor = { r: 135, g: 206, b: 235 };
            }
            
            this.shadowIntensity = 0.6 * lightCurve;
        } else {
            // Nighttime
            this.ambientLight = 0.15 + Math.random() * 0.05; // Slight flicker
            this.lightColor = { r: 150, g: 150, b: 200 }; // Cool moonlight
            this.skyColor = { r: 20, g: 24, b: 40 }; // Dark night sky
            this.shadowIntensity = 0.8;
        }
    }
    
    /**
     * Update sun and moon positions
     */
    updateCelestialBodies() {
        const hour = this.timeOfDay;
        const dayAngle = (hour / 24) * Math.PI * 2 - Math.PI / 2; // Start at sunrise
        
        // Sun position (visible during day)
        this.sun.x = Math.cos(dayAngle) * 300;
        this.sun.y = -Math.abs(Math.sin(dayAngle)) * 200 - 50;
        this.sun.visible = hour >= 5 && hour <= 19;
        
        // Moon position (visible during night)
        const nightAngle = dayAngle + Math.PI;
        this.moon.x = Math.cos(nightAngle) * 280;
        this.moon.y = -Math.abs(Math.sin(nightAngle)) * 180 - 40;
        this.moon.visible = hour <= 6 || hour >= 18;
    }
    
    /**
     * Update street light states
     */
    updateStreetLights() {
        const isNight = this.timeOfDay <= 6 || this.timeOfDay >= 18;
        
        for (const light of this.streetLights) {
            light.isOn = isNight;
            
            // Random flickering
            if (light.isOn && Math.random() < light.flickerChance) {
                light.intensity = 0.3 + Math.random() * 0.5;
            } else {
                light.intensity = 0.8 + Math.random() * 0.2;
            }
        }
    }
    
    /**
     * Update star twinkling animation
     * @param {number} deltaTime - Delta time
     */
    updateStars(deltaTime) {
        if (this.timeOfDay > 6 && this.timeOfDay < 18) return; // No stars during day
        
        for (const star of this.stars) {
            star.twinklePhase += star.twinkleSpeed * deltaTime * 0.001;
            star.currentBrightness = star.brightness * (0.7 + 0.3 * Math.sin(star.twinklePhase));
        }
    }
    
    /**
     * Apply lighting effects to the game canvas
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    applyLighting(ctx) {
        const canvas = ctx.canvas;
        
        // Save current state
        ctx.save();
        
        // Apply ambient lighting overlay
        this.applyAmbientLighting(ctx, canvas.width, canvas.height);
        
        // Render street lights
        if (this.timeOfDay <= 6 || this.timeOfDay >= 18) {
            this.renderStreetLightGlow(ctx);
        }
        
        // Apply shadow effects
        if (this.enableDynamicShadows && this.shadowIntensity > 0) {
            this.applyShadowEffects(ctx);
        }
        
        ctx.restore();
    }
    
    /**
     * Apply ambient lighting overlay
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    applyAmbientLighting(ctx, width, height) {
        // Create lighting overlay
        const alpha = 1 - this.ambientLight;
        
        if (alpha > 0) {
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = `rgba(${this.lightColor.r}, ${this.lightColor.g}, ${this.lightColor.b}, ${alpha})`;
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    /**
     * Render street light glow effects
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderStreetLightGlow(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        for (const light of this.streetLights) {
            if (!light.isOn) continue;
            
            // Check if light is in viewport
            if (!this.game.isInViewport || this.game.isInViewport(light)) {
                const gradient = ctx.createRadialGradient(
                    light.x, light.y, 0,
                    light.x, light.y, light.radius
                );
                
                const alpha = light.intensity * 0.3;
                gradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${alpha * 0.5})`);
                gradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    /**
     * Apply shadow effects (simplified)
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    applyShadowEffects(ctx) {
        // This is a simplified shadow system
        // In a full implementation, this would calculate shadows from objects
        if (this.shadowIntensity > 0.3) {
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = `rgba(0, 0, 0, ${this.shadowIntensity * 0.2})`;
            
            // Simple directional shadows based on sun position
            const shadowOffsetX = this.sun.x * 0.01;
            const shadowOffsetY = this.sun.y * 0.01;
            
            ctx.fillRect(shadowOffsetX, shadowOffsetY, ctx.canvas.width, ctx.canvas.height);
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    /**
     * Render sky and celestial bodies
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderSky(ctx) {
        const canvas = ctx.canvas;
        
        // Render sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        
        if (this.timeOfDay >= 6 && this.timeOfDay <= 18) {
            // Day sky
            gradient.addColorStop(0, `rgb(${this.skyColor.r}, ${this.skyColor.g}, ${this.skyColor.b})`);
            gradient.addColorStop(1, `rgb(${Math.floor(this.skyColor.r * 0.8)}, ${Math.floor(this.skyColor.g * 0.9)}, ${Math.floor(this.skyColor.b * 0.7)})`);
        } else {
            // Night sky
            gradient.addColorStop(0, `rgb(${this.skyColor.r}, ${this.skyColor.g}, ${this.skyColor.b})`);
            gradient.addColorStop(1, `rgb(${Math.floor(this.skyColor.r * 0.5)}, ${Math.floor(this.skyColor.g * 0.5)}, ${Math.floor(this.skyColor.b * 0.8)})`);
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render clouds
        this.renderClouds(ctx);
        
        // Render celestial bodies
        this.renderCelestialBodies(ctx);
        
        // Render stars at night
        if (this.timeOfDay <= 6 || this.timeOfDay >= 18) {
            this.renderStars(ctx);
        }
    }
    
    /**
     * Render clouds
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderClouds(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        
        const cloudCount = Math.floor(this.cloudCoverage * 10);
        
        for (let i = 0; i < cloudCount; i++) {
            const x = (i * 200 + this.cloudOffset * 50) % (ctx.canvas.width + 100) - 50;
            const y = 50 + (i % 3) * 40;
            const size = 60 + (i % 4) * 20;
            
            ctx.fillStyle = this.timeOfDay >= 6 && this.timeOfDay <= 18 ? 
                'rgba(255, 255, 255, 0.8)' : 'rgba(100, 100, 120, 0.6)';
            
            // Simple cloud shape
            ctx.beginPath();
            ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
            ctx.arc(x + size * 0.4, y, size * 0.4, 0, Math.PI * 2);
            ctx.arc(x - size * 0.4, y, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Render sun and moon
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderCelestialBodies(ctx) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 3;
        
        // Render sun
        if (this.sun.visible) {
            const sunX = centerX + this.sun.x;
            const sunY = centerY + this.sun.y;
            
            // Sun glow
            const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 40);
            sunGradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
            sunGradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.4)');
            sunGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
            
            ctx.fillStyle = sunGradient;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
            ctx.fill();
            
            // Sun core
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(sunX, sunY, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Render moon
        if (this.moon.visible) {
            const moonX = centerX + this.moon.x;
            const moonY = centerY + this.moon.y;
            
            // Moon glow
            const moonGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 30);
            moonGradient.addColorStop(0, 'rgba(200, 200, 255, 0.6)');
            moonGradient.addColorStop(0.5, 'rgba(150, 150, 200, 0.3)');
            moonGradient.addColorStop(1, 'rgba(100, 100, 150, 0)');
            
            ctx.fillStyle = moonGradient;
            ctx.beginPath();
            ctx.arc(moonX, moonY, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Moon core
            ctx.fillStyle = '#E6E6FA';
            ctx.beginPath();
            ctx.arc(moonX, moonY, 12, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Render stars
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderStars(ctx) {
        ctx.save();
        
        for (const star of this.stars) {
            // Check if star is in viewport
            if (this.game.isInViewport && !this.game.isInViewport(star)) continue;
            
            ctx.globalAlpha = star.currentBrightness || star.brightness;
            ctx.fillStyle = '#FFFFFF';
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Get current time information
     * @returns {Object} Time info
     */
    getTimeInfo() {
        const hours = Math.floor(this.timeOfDay);
        const minutes = Math.floor((this.timeOfDay - hours) * 60);
        
        return {
            hours: hours,
            minutes: minutes,
            timeString: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
            period: hours < 12 ? 'AM' : 'PM',
            isDay: this.timeOfDay >= 6 && this.timeOfDay <= 18,
            isNight: this.timeOfDay <= 6 || this.timeOfDay >= 18,
            ambientLight: this.ambientLight,
            skyColor: this.skyColor
        };
    }
    
    /**
     * Set time of day manually
     * @param {number} hour - Hour (0-24)
     */
    setTime(hour) {
        this.timeOfDay = Math.max(0, Math.min(24, hour));
        this.updateLighting();
        this.updateCelestialBodies();
        this.updateStreetLights();
    }
    
    /**
     * Get system information
     * @returns {Object} System info
     */
    getInfo() {
        return {
            timeOfDay: this.timeOfDay,
            timeSpeed: this.timeSpeed,
            ambientLight: this.ambientLight,
            shadowIntensity: this.shadowIntensity,
            streetLightCount: this.streetLights.length,
            starCount: this.stars.length,
            cloudCoverage: this.cloudCoverage,
            enableDynamicShadows: this.enableDynamicShadows
        };
    }
    
    /**
     * Toggle dynamic shadows
     */
    toggleShadows() {
        this.enableDynamicShadows = !this.enableDynamicShadows;
        console.log(`Dynamic shadows: ${this.enableDynamicShadows}`);
    }
    
    /**
     * Set time speed
     * @param {number} speed - Time speed multiplier
     */
    setTimeSpeed(speed) {
        this.timeSpeed = Math.max(0, speed);
        console.log(`Time speed set to: ${this.timeSpeed}`);
    }
}