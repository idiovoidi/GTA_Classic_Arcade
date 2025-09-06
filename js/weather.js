/**
 * Weather System for GTA Clone
 * Implements dynamic weather effects including rain, fog, and thunder
 */

class WeatherSystem {
    constructor(game) {
        this.game = game;
        this.currentWeather = 'clear';
        this.intensity = 0; // 0-1
        this.transitionTimer = 0;
        this.transitionDuration = 5000; // 5 seconds
        this.weatherTimer = 0;
        this.weatherDuration = 30000; // 30 seconds minimum
        
        // Weather effects
        this.rainParticles = [];
        this.maxRainParticles = 200;
        this.fogOpacity = 0;
        this.lightningTimer = 0;
        this.lightningFlash = false;
        this.thunderTimer = 0;
        
        // Weather types and their properties
        this.weatherTypes = {
            clear: {
                rainChance: 0,
                fogLevel: 0,
                lightningChance: 0,
                windSpeed: 0.1,
                visibility: 1.0
            },
            light_rain: {
                rainChance: 0.3,
                fogLevel: 0.1,
                lightningChance: 0.05,
                windSpeed: 0.3,
                visibility: 0.9
            },
            heavy_rain: {
                rainChance: 0.8,
                fogLevel: 0.3,
                lightningChance: 0.2,
                windSpeed: 0.6,
                visibility: 0.7
            },
            thunderstorm: {
                rainChance: 1.0,
                fogLevel: 0.4,
                lightningChance: 0.4,
                windSpeed: 0.8,
                visibility: 0.6
            },
            fog: {
                rainChance: 0.1,
                fogLevel: 0.6,
                lightningChance: 0,
                windSpeed: 0.2,
                visibility: 0.5
            }
        };
        
        console.log('WeatherSystem initialized');
    }
    
    /**
     * Update weather system
     * @param {number} deltaTime - Delta time in milliseconds
     */
    update(deltaTime) {
        this.weatherTimer += deltaTime;
        
        // Check for weather transitions
        if (this.weatherTimer > this.weatherDuration) {
            this.changeWeather();
            this.weatherTimer = 0;
        }
        
        // Update current weather effects
        this.updateWeatherEffects(deltaTime);
        
        // Update transitions
        if (this.transitionTimer > 0) {
            this.transitionTimer -= deltaTime;
        }
    }
    
    /**
     * Change to a new weather type
     */
    changeWeather() {
        const weatherTypes = Object.keys(this.weatherTypes);
        let newWeather;
        
        // Simple weather progression logic
        switch (this.currentWeather) {
            case 'clear':
                newWeather = Math.random() < 0.3 ? 'light_rain' : 
                           Math.random() < 0.6 ? 'fog' : 'clear';
                break;
            case 'light_rain':
                newWeather = Math.random() < 0.4 ? 'heavy_rain' : 
                           Math.random() < 0.7 ? 'clear' : 'light_rain';
                break;
            case 'heavy_rain':
                newWeather = Math.random() < 0.3 ? 'thunderstorm' : 
                           Math.random() < 0.6 ? 'light_rain' : 'heavy_rain';
                break;
            case 'thunderstorm':
                newWeather = Math.random() < 0.5 ? 'heavy_rain' : 'thunderstorm';
                break;
            case 'fog':
                newWeather = Math.random() < 0.5 ? 'clear' : 'fog';
                break;
            default:
                newWeather = 'clear';
        }
        
        if (newWeather !== this.currentWeather) {
            console.log(`Weather changing from ${this.currentWeather} to ${newWeather}`);
            this.currentWeather = newWeather;
            this.transitionTimer = this.transitionDuration;
            
            // Play weather transition sound
            if (this.game.audioManager) {
                if (newWeather.includes('rain') || newWeather === 'thunderstorm') {
                    this.game.audioManager.playSound('rain', 0.3);
                } else if (newWeather === 'thunderstorm') {
                    this.game.audioManager.playSound('thunder', 0.4);
                }
            }
        }
    }
    
    /**
     * Update weather effects
     * @param {number} deltaTime - Delta time
     */
    updateWeatherEffects(deltaTime) {
        const weather = this.weatherTypes[this.currentWeather];
        
        // Update rain particles
        this.updateRain(deltaTime, weather);
        
        // Update fog
        this.updateFog(deltaTime, weather);
        
        // Update lightning
        this.updateLightning(deltaTime, weather);
        
        // Update intensity based on transition
        const targetIntensity = this.getWeatherIntensity();
        if (this.transitionTimer > 0) {
            const transitionProgress = 1 - (this.transitionTimer / this.transitionDuration);
            this.intensity = this.intensity + (targetIntensity - this.intensity) * transitionProgress * 0.1;
        } else {
            this.intensity = targetIntensity;
        }
    }
    
    /**
     * Update rain effects
     * @param {number} deltaTime - Delta time
     * @param {Object} weather - Weather configuration
     */
    updateRain(deltaTime, weather) {
        // Create new rain particles
        if (Math.random() < weather.rainChance && this.rainParticles.length < this.maxRainParticles) {
            this.createRainParticle();
        }
        
        // Update existing rain particles
        for (let i = this.rainParticles.length - 1; i >= 0; i--) {
            const particle = this.rainParticles[i];
            particle.x += particle.velocity.x * (deltaTime / 16.67);
            particle.y += particle.velocity.y * (deltaTime / 16.67);
            particle.life -= deltaTime;
            
            // Remove dead particles or particles that hit the ground
            if (particle.life <= 0 || particle.y > this.game.canvas.height) {
                this.rainParticles.splice(i, 1);
            }
        }
    }
    
    /**
     * Create a rain particle
     */
    createRainParticle() {
        const particle = {
            x: Math.random() * (this.game.canvas.width + 200) - 100,
            y: -10,
            velocity: {
                x: -0.5 + Math.random() * 1, // Wind effect
                y: 8 + Math.random() * 4
            },
            life: 2000 + Math.random() * 1000,
            alpha: 0.3 + Math.random() * 0.4
        };
        
        this.rainParticles.push(particle);
    }
    
    /**
     * Update fog effects
     * @param {number} deltaTime - Delta time
     * @param {Object} weather - Weather configuration
     */
    updateFog(deltaTime, weather) {
        const targetFog = weather.fogLevel;
        const fogSpeed = 0.001 * (deltaTime / 16.67);
        
        if (this.fogOpacity < targetFog) {
            this.fogOpacity = Math.min(targetFog, this.fogOpacity + fogSpeed);
        } else if (this.fogOpacity > targetFog) {
            this.fogOpacity = Math.max(targetFog, this.fogOpacity - fogSpeed);
        }
    }
    
    /**
     * Update lightning effects
     * @param {number} deltaTime - Delta time
     * @param {Object} weather - Weather configuration
     */
    updateLightning(deltaTime, weather) {
        this.lightningTimer += deltaTime;
        this.thunderTimer += deltaTime;
        
        // Lightning flash
        if (this.lightningFlash) {
            this.lightningTimer = 0;
            this.lightningFlash = false;
        }
        
        // Trigger lightning
        if (Math.random() < weather.lightningChance * 0.001 && this.lightningTimer > 2000) {
            this.triggerLightning();
        }
    }
    
    /**
     * Trigger lightning effect
     */
    triggerLightning() {
        this.lightningFlash = true;
        this.lightningTimer = 0;
        
        // Play thunder sound after delay
        setTimeout(() => {
            if (this.game.audioManager) {
                this.game.audioManager.playSound('thunder', 0.6);
            }
        }, 500 + Math.random() * 2000); // Random delay for realism
        
        console.log('Lightning strike!');
    }
    
    /**
     * Get current weather intensity
     * @returns {number} Weather intensity (0-1)
     */
    getWeatherIntensity() {
        switch (this.currentWeather) {
            case 'clear': return 0;
            case 'light_rain': return 0.3;
            case 'heavy_rain': return 0.6;
            case 'thunderstorm': return 1.0;
            case 'fog': return 0.4;
            default: return 0;
        }
    }
    
    /**
     * Render weather effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Render rain
        this.renderRain(ctx);
        
        // Render fog
        this.renderFog(ctx);
        
        // Render lightning
        this.renderLightning(ctx);
    }
    
    /**
     * Render rain particles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderRain(ctx) {
        if (this.rainParticles.length === 0) return;
        
        ctx.save();
        ctx.strokeStyle = `rgba(200, 220, 255, ${0.6 * this.intensity})`;
        ctx.lineWidth = 1;
        
        for (const particle of this.rainParticles) {
            ctx.globalAlpha = particle.alpha * this.intensity;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x + particle.velocity.x * 3, particle.y + particle.velocity.y * 3);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * Render fog effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderFog(ctx) {
        if (this.fogOpacity <= 0) return;
        
        ctx.save();
        ctx.fillStyle = `rgba(200, 200, 200, ${this.fogOpacity})`;
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        ctx.restore();
    }
    
    /**
     * Render lightning flash
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderLightning(ctx) {
        if (!this.lightningFlash) return;
        
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        ctx.restore();
    }
    
    /**
     * Get weather info for UI
     * @returns {Object} Weather information
     */
    getWeatherInfo() {
        return {
            type: this.currentWeather,
            intensity: this.intensity,
            visibility: this.weatherTypes[this.currentWeather].visibility,
            isTransitioning: this.transitionTimer > 0
        };
    }
    
    /**
     * Force weather change (for testing)
     * @param {string} weatherType - Weather type to set
     */
    setWeather(weatherType) {
        if (this.weatherTypes[weatherType]) {
            this.currentWeather = weatherType;
            this.transitionTimer = this.transitionDuration;
            console.log(`Weather forced to: ${weatherType}`);
        }
    }
}

// Export WeatherSystem
window.WeatherSystem = WeatherSystem;