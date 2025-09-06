class Game {
    constructor() {
        try {
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Game canvas not found');
            }
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Failed to get 2D context from canvas');
            }
            
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        } catch (error) {
            window.errorHandler?.handleError('game_initialization_error', {
                message: error.message,
                stack: error.stack,
                critical: true
            });
            throw error;
        }
        
        // Game state
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.targetFrameTime = 1000 / this.fps;
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
        
        // Game objects
        this.player = null;
        this.city = null;
        this.pedestrians = [];
        this.police = [];
        this.vehicles = [];
        this.bullets = [];
        this.particles = [];
        
        // Game stats
        this.score = 0;
        this.wantedLevel = 0;
        this.wantedTimer = 0;
        
        // Input handling
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            clicked: false
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.clicked = true;
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.mouse.clicked = false;
        });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    init() {
        try {
            // Initialize game objects
            this.city = new City(this);
            this.player = new Player(this, this.width / 2, this.height / 2);
            
            // Spawn initial pedestrians
            for (let i = 0; i < 20; i++) {
                this.spawnPedestrian();
            }
            
            // Spawn some vehicles
            for (let i = 0; i < 5; i++) {
                this.spawnVehicle();
            }
            
            this.isRunning = true;
            this.gameLoop();
        } catch (error) {
            window.errorHandler?.handleError('game_init_error', {
                message: error.message,
                stack: error.stack,
                critical: true
            });
            throw error;
        }
    }
    
    spawnPedestrian() {
        const x = Math.random() * this.city.width;
        const y = Math.random() * this.city.height;
        this.pedestrians.push(new Pedestrian(this, x, y));
    }
    
    spawnVehicle() {
        const x = Math.random() * this.city.width;
        const y = Math.random() * this.city.height;
        this.vehicles.push(new Vehicle(this, x, y));
    }
    
    update(deltaTime) {
        try {
            // Validate deltaTime
            if (typeof deltaTime !== 'number' || deltaTime < 0 || !isFinite(deltaTime)) {
                throw new Error(`Invalid deltaTime: ${deltaTime}`);
            }
            
            // Update camera to follow player
            if (this.player) {
                this.camera.x = this.player.x - this.width / 2;
                this.camera.y = this.player.y - this.height / 2;
            }
            
            // Update game objects with error handling
            if (this.player) {
                window.ErrorWrappers?.safeAIUpdate(this.player, deltaTime, 'player');
            }
            
            if (this.city) {
                try {
                    this.city.update(deltaTime);
                } catch (error) {
                    window.errorHandler?.handleGameError('city_update_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update pedestrians with safe array operations
            this.pedestrians = window.ErrorWrappers?.safeArrayOperation(this.pedestrians, (peds) => {
                return peds.filter((ped, index) => {
                    try {
                        window.ErrorWrappers?.safeAIUpdate(ped, deltaTime, 'pedestrian');
                        if (ped.health <= 0) {
                            this.score += 10;
                            this.increaseWantedLevel(1);
                            return false; // Remove from array
                        }
                        return true; // Keep in array
                    } catch (error) {
                        window.errorHandler?.handleGameError('pedestrian_update_error', {
                            message: error.message,
                            index: index,
                            pedestrian: ped ? { x: ped.x, y: ped.y, health: ped.health } : null
                        });
                        return false; // Remove problematic pedestrian
                    }
                });
            }, 'pedestrian') || [];
            
            // Update vehicles with safe array operations
            this.vehicles = window.ErrorWrappers?.safeArrayOperation(this.vehicles, (vehs) => {
                return vehs.filter((vehicle, index) => {
                    try {
                        window.ErrorWrappers?.safeAIUpdate(vehicle, deltaTime, 'vehicle');
                        if (vehicle.health <= 0) {
                            this.score += 50;
                            this.increaseWantedLevel(2);
                            return false; // Remove from array
                        }
                        return true; // Keep in array
                    } catch (error) {
                        window.errorHandler?.handleGameError('vehicle_update_error', {
                            message: error.message,
                            index: index,
                            vehicle: vehicle ? { x: vehicle.x, y: vehicle.y, health: vehicle.health } : null
                        });
                        return false; // Remove problematic vehicle
                    }
                });
            }, 'vehicle') || [];
            
            // Update police with safe array operations
            this.police = window.ErrorWrappers?.safeArrayOperation(this.police, (cops) => {
                return cops.filter((cop, index) => {
                    try {
                        window.ErrorWrappers?.safeAIUpdate(cop, deltaTime, 'police');
                        if (cop.health <= 0) {
                            this.score += 100;
                            this.increaseWantedLevel(3);
                            return false; // Remove from array
                        }
                        return true; // Keep in array
                    } catch (error) {
                        window.errorHandler?.handleGameError('police_update_error', {
                            message: error.message,
                            index: index,
                            police: cop ? { x: cop.x, y: cop.y, health: cop.health } : null
                        });
                        return false; // Remove problematic police
                    }
                });
            }, 'police') || [];
            
            // Update bullets with safe array operations
            this.bullets = window.ErrorWrappers?.safeArrayOperation(this.bullets, (bullets) => {
                return bullets.filter((bullet, index) => {
                    try {
                        bullet.update(deltaTime);
                        return bullet.life > 0;
                    } catch (error) {
                        window.errorHandler?.handleGameError('bullet_update_error', {
                            message: error.message,
                            index: index
                        });
                        return false; // Remove problematic bullet
                    }
                });
            }, 'bullet') || [];
            
            // Update particles with safe array operations
            this.particles = window.ErrorWrappers?.safeArrayOperation(this.particles, (particles) => {
                return particles.filter((particle, index) => {
                    try {
                        particle.update(deltaTime);
                        return particle.life > 0;
                    } catch (error) {
                        window.errorHandler?.handleGameError('particle_update_error', {
                            message: error.message,
                            index: index
                        });
                        return false; // Remove problematic particle
                    }
                });
            }, 'particle') || [];
            
            // Spawn new pedestrians occasionally
            if (Math.random() < 0.01) {
                this.spawnPedestrian();
            }
            
            // Spawn police if wanted level is high
            if (this.wantedLevel > 0 && this.police.length < this.wantedLevel * 2 && Math.random() < 0.005) {
                this.spawnPolice();
            }
            
            // Decrease wanted level over time
            if (this.wantedLevel > 0) {
                this.wantedTimer += deltaTime;
                if (this.wantedTimer > 5000) { // 5 seconds
                    this.wantedLevel = Math.max(0, this.wantedLevel - 1);
                    this.wantedTimer = 0;
                }
            }
        } catch (error) {
            window.errorHandler?.handleGameError('game_update_error', {
                message: error.message,
                stack: error.stack,
                deltaTime: deltaTime,
                critical: true
            });
        }
    }
    
    spawnPolice() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 300;
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;
        this.police.push(new Police(this, x, y));
    }
    
    increaseWantedLevel(amount) {
        this.wantedLevel = Math.min(6, this.wantedLevel + amount);
        this.wantedTimer = 0;
    }
    
    render() {
        try {
            // Clear canvas
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Save context for camera transform
            this.ctx.save();
            this.ctx.translate(-this.camera.x, -this.camera.y);
            
            // Render game objects with error handling
            if (this.city) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.city.render(ctx);
                }, 'city');
            }
            
            // Render vehicles first (so they appear behind player)
            this.vehicles.forEach((vehicle, index) => {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    vehicle.render(ctx);
                }, `vehicle_${index}`);
            });
            
            // Render pedestrians
            this.pedestrians.forEach((ped, index) => {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    ped.render(ctx);
                }, `pedestrian_${index}`);
            });
            
            // Render police
            this.police.forEach((cop, index) => {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    cop.render(ctx);
                }, `police_${index}`);
            });
            
            // Render player
            if (this.player) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.player.render(ctx);
                }, 'player');
            }
            
            // Render bullets
            this.bullets.forEach((bullet, index) => {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    bullet.render(ctx);
                }, `bullet_${index}`);
            });
            
            // Render particles
            this.particles.forEach((particle, index) => {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    particle.render(ctx);
                }, `particle_${index}`);
            });
            
            // Restore context
            this.ctx.restore();
            
            // Render UI
            this.renderUI();
        } catch (error) {
            window.errorHandler?.handleGameError('render_error', {
                message: error.message,
                stack: error.stack,
                critical: true
            });
            
            // Attempt to render error screen
            try {
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Rendering Error - Attempting Recovery...', 
                    this.width / 2, this.height / 2);
            } catch (renderError) {
                console.error('Failed to render error screen:', renderError);
            }
        }
    }
    
    renderUI() {
        // Update UI elements
        document.getElementById('wantedLevel').textContent = `WANTED: ${this.wantedLevel}`;
        document.getElementById('score').textContent = `SCORE: ${this.score}`;
        
        // Render minimap
        this.renderMinimap();
    }
    
    renderMinimap() {
        const minimap = document.getElementById('minimap');
        const minimapCtx = minimap.getContext('2d');
        const scale = 0.1;
        
        minimapCtx.fillStyle = '#000';
        minimapCtx.fillRect(0, 0, 150, 150);
        
        // Draw city
        minimapCtx.fillStyle = '#333';
        minimapCtx.fillRect(0, 0, 150, 150);
        
        // Draw roads
        minimapCtx.fillStyle = '#666';
        for (let x = 0; x < this.city.width; x += 100) {
            minimapCtx.fillRect(x * scale, 0, 20 * scale, 150);
        }
        for (let y = 0; y < this.city.height; y += 100) {
            minimapCtx.fillRect(0, y * scale, 150, 20 * scale);
        }
        
        // Draw player
        minimapCtx.fillStyle = '#00ff00';
        minimapCtx.fillRect(
            this.player.x * scale - 2,
            this.player.y * scale - 2,
            4, 4
        );
        
        // Draw police
        minimapCtx.fillStyle = '#ff0000';
        this.police.forEach(cop => {
            minimapCtx.fillRect(
                cop.x * scale - 1,
                cop.y * scale - 1,
                2, 2
            );
        });
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        try {
            this.deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            if (this.deltaTime >= this.targetFrameTime) {
                this.update(this.deltaTime);
                this.render();
                this.deltaTime = 0;
            }
            
            requestAnimationFrame((time) => this.gameLoop(time));
        } catch (error) {
            window.errorHandler?.handleError('game_loop_error', {
                message: error.message,
                stack: error.stack,
                currentTime: currentTime,
                critical: true
            });
            
            // Attempt to recover game loop
            setTimeout(() => {
                try {
                    if (this.isRunning) {
                        this.gameLoop();
                    }
                } catch (recoveryError) {
                    console.error('Failed to recover game loop:', recoveryError);
                    this.isRunning = false;
                    window.errorHandler?.showErrorMessage('Game loop failed. Please refresh the page.');
                }
            }, 100);
        }
    }
    
    addBullet(bullet) {
        this.bullets.push(bullet);
    }
    
    addParticle(particle) {
        this.particles.push(particle);
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    checkCollision(obj1, obj2) {
        const distance = this.getDistance(obj1, obj2);
        return distance < (obj1.radius || 10) + (obj2.radius || 10);
    }
}
