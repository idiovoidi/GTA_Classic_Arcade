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
            zoom: 1,
            shake: 0,
            shakeTimer: 0,
            shakeX: 0,
            shakeY: 0
        };
        
        // Game objects
        this.player = null;
        this.city = null;
        this.pedestrians = [];
        this.police = [];
        this.vehicles = [];
        this.bullets = [];
        this.particles = [];
        this.textEffects = [];
        
        // Power-up system
        this.powerUpManager = null;
        
        // Audio system
        this.audioManager = null;
        
        // Traffic light system
        this.trafficLightManager = null;
        
        // Day/night cycle system
        this.dayNightCycle = null;
        
        // District system
        this.districtManager = null;
        
        // Weather system
        this.weatherSystem = null;
        
        // Spatial partitioning for collision optimization
        this.spatialGrid = null;
        this.showSpatialGrid = false; // Debug option
        
        // Object pooling for performance
        this.poolManager = null;
        
        // Vehicle variety manager
        this.vehicleManager = {
            spawnTimer: 0,
            spawnInterval: 3000, // 3 seconds
            maxVehicles: 25,
            typeDistribution: {
                'SEDAN': 0.5,
                'SPORTS_CAR': 0.15,
                'TRUCK': 0.2,
                'MOTORCYCLE': 0.15
            }
        };
        
        // Viewport culling for rendering optimization
        this.viewport = {
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            margin: 100 // Extra margin for smooth transitions
        };
        
        // Memory management
        this.memoryManager = {
            lastCleanup: 0,
            cleanupInterval: 5000, // 5 seconds
            maxEntities: {
                pedestrians: 50,
                vehicles: 20,
                police: 10,
                bullets: 100,
                particles: 200
            }
        };
        
        // Enhanced wanted level system
        this.wantedSystem = {
            level: 0,
            maxLevel: 6,
            timer: 0,
            decayTime: 8000, // 8 seconds to decay one level
            heatPoints: 0, // Accumulated heat that leads to wanted level increases
            heatDecayRate: 0.5, // Heat points lost per second
            
            // Police response configuration
            policeResponse: {
                1: { maxPolice: 2, spawnChance: 0.003, spawnRadius: 400, aggressiveness: 0.3 },
                2: { maxPolice: 4, spawnChance: 0.005, spawnRadius: 350, aggressiveness: 0.5 },
                3: { maxPolice: 6, spawnChance: 0.007, spawnRadius: 300, aggressiveness: 0.7 },
                4: { maxPolice: 8, spawnChance: 0.009, spawnRadius: 250, aggressiveness: 0.8 },
                5: { maxPolice: 10, spawnChance: 0.012, spawnRadius: 200, aggressiveness: 0.9 },
                6: { maxPolice: 12, spawnChance: 0.015, spawnRadius: 150, aggressiveness: 1.0 }
            },
            
            // Heat values for different crimes
            crimeHeat: {
                killPedestrian: 15,
                killPolice: 50,
                destroyVehicle: 25,
                shooting: 5,
                collision: 3,
                speeding: 1
            }
        };
        
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
            // Resume audio context on first user interaction
            if (this.audioManager) {
                this.audioManager.resumeAudio();
            }
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
            // Resume audio context on first user interaction
            if (this.audioManager) {
                this.audioManager.resumeAudio();
            }
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
            this.audioManager = new AudioManager();
            this.spatialGrid = new SpatialGrid(2000, 2000, 100); // Match city size
            this.poolManager = new PoolManager(this);
            this.missionManager = new MissionManager(this);
            this.zoneManager = new ZoneManager(this);
            this.trafficLightManager = new TrafficLightManager(this);
            this.dayNightCycle = new DayNightCycle(this);
            this.districtManager = new DistrictManager(this);
            this.weatherSystem = new WeatherSystem(this);
            this.city = new City(this);
            this.player = new Player(this, this.width / 2, this.height / 2);
            this.powerUpManager = new PowerUpManager(this);
            
            // Initialize progression system
            this.progression = new PlayerProgression(this, this.player);
            this.progression.load(); // Load saved progression
            
            // Initialize UI system
            this.ui = new UI(this);
            
            // Initialize zone system
            this.zoneManager.init();
            
            // Initialize traffic light system
            this.trafficLightManager.init();
            
            // Initialize district system
            this.districtManager.init();
            
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
    
    spawnVehicle(vehicleType = null) {
        const x = Math.random() * this.city.width;
        const y = Math.random() * this.city.height;
        this.vehicles.push(new Vehicle(this, x, y, vehicleType));
    }
    
    updateVehicleSpawning(deltaTime) {
        this.vehicleManager.spawnTimer += deltaTime;
        
        // Check if we should spawn a new vehicle
        if (this.vehicleManager.spawnTimer >= this.vehicleManager.spawnInterval && 
            this.vehicles.length < this.vehicleManager.maxVehicles) {
            
            // Select vehicle type based on distribution
            const vehicleType = this.selectVehicleTypeToSpawn();
            
            // Spawn the vehicle
            this.spawnVehicle(vehicleType);
            
            // Reset timer with some randomness
            this.vehicleManager.spawnTimer = 0;
            this.vehicleManager.spawnInterval = 2000 + Math.random() * 4000; // 2-6 seconds
        }
    }
    
    getVehicleTypeStats() {
        const stats = {};
        
        this.vehicles.forEach(vehicle => {
            if (!stats[vehicle.vehicleType]) {
                stats[vehicle.vehicleType] = 0;
            }
            stats[vehicle.vehicleType]++;
        });
        
        return stats;
    }
    
    selectVehicleTypeToSpawn() {
        const rand = Math.random();
        let cumulativeProb = 0;
        
        for (const [type, probability] of Object.entries(this.vehicleManager.typeDistribution)) {
            cumulativeProb += probability;
            if (rand <= cumulativeProb) {
                return type;
            }
        }
        
        return 'SEDAN'; // Fallback
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
            
            // Update viewport for culling
            this.updateViewport();
            
            // Update camera shake
            this.updateCameraShake(deltaTime);
            
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
                            this.addHeat(this.wantedSystem.crimeHeat.killPedestrian, 'pedestrian_kill');
                            
                            // Record kill in progression system
                            if (this.progression) {
                                this.progression.recordKill('pedestrian');
                            }
                            
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
                            this.addHeat(this.wantedSystem.crimeHeat.destroyVehicle, 'vehicle_destruction');
                            
                            // Record kill in progression system
                            if (this.progression) {
                                this.progression.recordKill('vehicle');
                            }
                            
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
                            this.addHeat(this.wantedSystem.crimeHeat.killPolice, 'police_kill');
                            
                            // Record kill in progression system
                            if (this.progression) {
                                this.progression.recordKill('police');
                            }
                            
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
            
            // Update bullets with object pooling
            if (this.poolManager) {
                const poolResults = this.poolManager.update(deltaTime);
                this.bullets = poolResults.bullets;
                this.particles = poolResults.particles;
            } else {
                // Fallback to original bullet/particle management
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
            }
            
            // Particles are now managed by poolManager above
            
            // Update power-up manager
            if (this.powerUpManager) {
                try {
                    this.powerUpManager.update(deltaTime);
                } catch (error) {
                    window.errorHandler?.handleGameError('powerup_manager_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update mission manager
            if (this.missionManager) {
                try {
                    this.missionManager.update(deltaTime);
                } catch (error) {
                    window.errorHandler?.handleGameError('mission_manager_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update zone manager
            if (this.zoneManager) {
                try {
                    this.zoneManager.update(deltaTime);
                } catch (error) {
                    window.errorHandler?.handleGameError('zone_manager_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update traffic light manager
            if (this.trafficLightManager) {
                try {
                    this.trafficLightManager.update(deltaTime);
                } catch (error) {
                    window.errorHandler?.handleGameError('traffic_light_manager_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update day/night cycle
            if (this.dayNightCycle) {
                try {
                    this.dayNightCycle.update(deltaTime);
                } catch (error) {
                    window.errorHandler?.handleGameError('day_night_cycle_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update district manager
            if (this.districtManager) {
                try {
                    this.districtManager.update(deltaTime);
                } catch (error) {
                    window.errorHandler?.handleGameError('district_manager_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update weather system
            if (this.weatherSystem) {
                try {
                    this.weatherSystem.update(deltaTime);
                } catch (error) {
                    window.errorHandler?.handleGameError('weather_system_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update progression system
            if (this.progression) {
                try {
                    this.progression.update(deltaTime);
                    
                    // Auto-save progression every 30 seconds
                    if (!this.lastProgressionSave) {
                        this.lastProgressionSave = 0;
                    }
                    this.lastProgressionSave += deltaTime;
                    if (this.lastProgressionSave >= 30000) { // 30 seconds
                        this.progression.save();
                        this.lastProgressionSave = 0;
                    }
                } catch (error) {
                    window.errorHandler?.handleGameError('progression_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update UI system
            if (this.ui) {
                try {
                    this.ui.update(deltaTime);
                } catch (error) {
                    window.errorHandler?.handleGameError('ui_update_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update dynamic music system
            if (this.audioManager) {
                try {
                    // Update 3D audio listener position to follow player
                    if (this.player) {
                        this.audioManager.updateListenerPosition(this.player.x, this.player.y);
                    }
                    
                    const gameState = {
                        playerHealth: this.player ? this.player.health : 0,
                        wantedLevel: this.wantedSystem.level,
                        playerSpeed: this.player ? Math.abs(this.player.speed) : 0,
                        nearbyEnemies: this.police.length,
                        recentCombat: this.wantedSystem.level > 0,
                        inDanger: this.player && this.player.health < 30,
                        missionJustCompleted: this.missionManager && 
                            this.missionManager.currentMission && 
                            this.missionManager.currentMission.completed
                    };
                    
                    this.audioManager.updateDynamicMusic(deltaTime, gameState);
                } catch (error) {
                    window.errorHandler?.handleGameError('dynamic_music_error', {
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
            
            // Update text effects
            this.textEffects = window.ErrorWrappers?.safeArrayOperation(this.textEffects, (effects) => {
                return effects.filter((effect, index) => {
                    try {
                        effect.update(deltaTime);
                        return effect.active;
                    } catch (error) {
                        window.errorHandler?.handleGameError('text_effect_error', {
                            message: error.message,
                            index: index
                        });
                        return false;
                    }
                });
            }, 'text_effect') || [];
            
            // Spawn new pedestrians occasionally
            if (Math.random() < 0.01) {
                this.spawnPedestrian();
            }
            
            // Enhanced vehicle spawning system
            this.updateVehicleSpawning(deltaTime);
            
            // Enhanced wanted level and police response system
            this.updateWantedSystem(deltaTime);
            this.updatePoliceResponse(deltaTime);
            
            // Update spatial grid
            this.updateSpatialGrid();
            
            // Update collision systems
            this.updateCollisions();
            
            // Memory management and cleanup
            this.performMemoryManagement(deltaTime);
        } catch (error) {
            window.errorHandler?.handleGameError('game_update_error', {
                message: error.message,
                stack: error.stack,
                deltaTime: deltaTime,
                critical: true
            });
        }
    }
    
    updateSpatialGrid() {
        if (!this.spatialGrid) return;
        
        // Collect all dynamic objects
        const dynamicObjects = [
            this.player,
            ...this.pedestrians,
            ...this.vehicles,
            ...this.police,
            ...this.bullets,
            ...(this.powerUpManager ? this.powerUpManager.powerUps : [])
        ].filter(obj => obj && obj.health > 0 && obj.active !== false);
        
        // Update spatial grid
        this.spatialGrid.update(dynamicObjects);
    }
    
    updateCollisions() {
        if (!this.spatialGrid) {
            // Fallback to brute force collision detection
            this.updateCollisionsBruteForce();
            return;
        }
        
        // Optimized collision detection using spatial grid
        
        // Player vs nearby objects
        const nearbyObjects = this.spatialGrid.getNearbyObjects(this.player);
        
        nearbyObjects.forEach(obj => {
            if (obj.health > 0 && this.checkCollision(this.player, obj)) {
                if (obj.constructor.name === 'Vehicle' || obj.constructor.name === 'Police') {
                    this.handleVehicleCollision(this.player, obj);
                }
            }
        });
        
        // Vehicle vs vehicle collisions (only check nearby vehicles)
        this.vehicles.forEach(vehicle => {
            if (vehicle.health <= 0) return;
            
            const nearby = this.spatialGrid.getNearbyObjects(vehicle);
            nearby.forEach(other => {
                if (other !== vehicle && 
                    (other.constructor.name === 'Vehicle' || other.constructor.name === 'Police') &&
                    other.health > 0 && 
                    this.checkCollision(vehicle, other)) {
                    this.handleVehicleCollision(vehicle, other);
                }
            });
        });
    }
    
    updateCollisionsBruteForce() {
        // Player vs vehicles
        this.vehicles.forEach(vehicle => {
            if (vehicle.health > 0 && this.checkCollision(this.player, vehicle)) {
                this.handleVehicleCollision(this.player, vehicle);
            }
        });
        
        // Player vs police
        this.police.forEach(cop => {
            if (cop.health > 0 && this.checkCollision(this.player, cop)) {
                this.handleVehicleCollision(this.player, cop);
            }
        });
        
        // Vehicle vs vehicle collisions
        for (let i = 0; i < this.vehicles.length; i++) {
            for (let j = i + 1; j < this.vehicles.length; j++) {
                const vehicle1 = this.vehicles[i];
                const vehicle2 = this.vehicles[j];
                
                if (vehicle1.health > 0 && vehicle2.health > 0 && 
                    this.checkCollision(vehicle1, vehicle2)) {
                    this.handleVehicleCollision(vehicle1, vehicle2);
                }
            }
        }
        
        // Vehicle vs police collisions
        this.vehicles.forEach(vehicle => {
            this.police.forEach(cop => {
                if (vehicle.health > 0 && cop.health > 0 && 
                    this.checkCollision(vehicle, cop)) {
                    this.handleVehicleCollision(vehicle, cop);
                }
            });
        });
    }
    
    updateCollisionsBruteForce() {
        // Original collision detection code as fallback
        // Player vs vehicles
        this.vehicles.forEach(vehicle => {
            if (vehicle.health > 0 && this.checkCollision(this.player, vehicle)) {
                this.handleVehicleCollision(this.player, vehicle);
            }
        });
        
        // Player vs police
        this.police.forEach(cop => {
            if (cop.health > 0 && this.checkCollision(this.player, cop)) {
                this.handleVehicleCollision(this.player, cop);
            }
        });
        
        // Vehicle vs vehicle collisions
        for (let i = 0; i < this.vehicles.length; i++) {
            for (let j = i + 1; j < this.vehicles.length; j++) {
                const vehicle1 = this.vehicles[i];
                const vehicle2 = this.vehicles[j];
                
                if (vehicle1.health > 0 && vehicle2.health > 0 && 
                    this.checkCollision(vehicle1, vehicle2)) {
                    this.handleVehicleCollision(vehicle1, vehicle2);
                }
            }
        }
        
        // Vehicle vs police collisions
        this.vehicles.forEach(vehicle => {
            this.police.forEach(cop => {
                if (vehicle.health > 0 && cop.health > 0 && 
                    this.checkCollision(vehicle, cop)) {
                    this.handleVehicleCollision(vehicle, cop);
                }
            });
        });
    }
    
    handleVehicleCollision(obj1, obj2) {
        // Calculate collision response
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return; // Avoid division by zero
        
        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate relative velocity
        const obj1Vel = obj1.velocity || { x: 0, y: 0 };
        const obj2Vel = obj2.velocity || { x: 0, y: 0 };
        const relativeVel = {
            x: obj2Vel.x - obj1Vel.x,
            y: obj2Vel.y - obj1Vel.y
        };
        
        // Calculate relative velocity in collision normal direction
        const velAlongNormal = relativeVel.x * nx + relativeVel.y * ny;
        
        // Do not resolve if velocities are separating
        if (velAlongNormal > 0) return;
        
        // Calculate restitution (bounciness)
        const restitution = 0.3;
        
        // Calculate impulse scalar
        const impulse = -(1 + restitution) * velAlongNormal;
        
        // Apply impulse
        const mass1 = obj1.mass || 1;
        const mass2 = obj2.mass || 1;
        const totalMass = mass1 + mass2;
        
        const impulse1 = impulse * mass2 / totalMass;
        const impulse2 = impulse * mass1 / totalMass;
        
        // Update velocities
        if (obj1.velocity) {
            obj1.velocity.x -= impulse1 * nx;
            obj1.velocity.y -= impulse1 * ny;
        }
        
        if (obj2.velocity) {
            obj2.velocity.x += impulse2 * nx;
            obj2.velocity.y += impulse2 * ny;
        }
        
        // Separate objects to avoid overlap
        const overlap = (obj1.radius || 15) + (obj2.radius || 15) - distance;
        if (overlap > 0) {
            const separationDistance = overlap / 2;
            obj1.x -= nx * separationDistance;
            obj1.y -= ny * separationDistance;
            obj2.x += nx * separationDistance;
            obj2.y += ny * separationDistance;
        }
        
        // Apply collision damage based on speed
        const collisionSpeed = Math.sqrt(relativeVel.x * relativeVel.x + relativeVel.y * relativeVel.y);
        const damage = Math.floor(collisionSpeed * 2);
        
        if (damage > 5) {
            if (obj1.takeDamage) obj1.takeDamage(damage);
            if (obj2.takeDamage) obj2.takeDamage(damage);
            
            // Play collision sound
            if (this.audioManager) {
                this.audioManager.playSound('impact', Math.min(damage / 20, 1));
            }
            
            // Create collision particles
            this.createCollisionEffect(obj1.x, obj1.y, collisionSpeed);
            
            // Add camera shake for player collisions
            if (obj1 === this.player || obj2 === this.player) {
                this.addCameraShake(Math.min(damage, 10), 200);
                
                // Add heat for player collisions
                if (this.addHeat && damage > 8) {
                    this.addHeat(this.wantedSystem.crimeHeat.collision, 'vehicle_collision');
                }
            }
        }
    }
    
    createCollisionEffect(x, y, intensity) {
        const particleCount = Math.min(Math.floor(intensity), 10);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * intensity * 0.3;
            
            this.addParticle(new SparkParticle(this, x, y));
        }
    }

    updateViewport() {
        this.viewport.x = this.camera.x - this.viewport.margin;
        this.viewport.y = this.camera.y - this.viewport.margin;
        this.viewport.width = this.width + (this.viewport.margin * 2);
        this.viewport.height = this.height + (this.viewport.margin * 2);
    }
    
    /**
     * Check if an object is within the viewport for rendering
     * @param {Object} obj - Object to check
     * @returns {boolean} Whether object is visible
     */
    isInViewport(obj) {
        if (!obj) return false;
        
        const radius = obj.radius || obj.size || 20;
        return obj.x + radius >= this.viewport.x &&
               obj.x - radius <= this.viewport.x + this.viewport.width &&
               obj.y + radius >= this.viewport.y &&
               obj.y - radius <= this.viewport.y + this.viewport.height;
    }
    
    /**
     * Get the distance from camera center to an object
     * @param {Object} obj - Object to check distance to
     * @returns {number} Distance from camera center
     */
    getDistanceFromCamera(obj) {
        const cameraCenterX = this.camera.x + this.width / 2;
        const cameraCenterY = this.camera.y + this.height / 2;
        return Math.sqrt(
            Math.pow(obj.x - cameraCenterX, 2) + 
            Math.pow(obj.y - cameraCenterY, 2)
        );
    }
    
    /**
     * Get the level of detail for an object based on distance
     * @param {Object} obj - Object to check
     * @returns {string} LOD level: 'high', 'medium', 'low', 'skip'
     */
    getLODLevel(obj) {
        const distance = this.getDistanceFromCamera(obj);
        
        if (distance < 200) return 'high';
        if (distance < 400) return 'medium';
        if (distance < 600) return 'low';
        return 'skip';
    }
    
    performMemoryManagement(deltaTime) {
        this.memoryManager.lastCleanup += deltaTime;
        
        // Perform cleanup every 5 seconds
        if (this.memoryManager.lastCleanup >= this.memoryManager.cleanupInterval) {
            this.cleanupEntities();
            this.memoryManager.lastCleanup = 0;
        }
    }
    
    cleanupEntities() {
        // Remove excess pedestrians (keep the closest ones to player)
        if (this.pedestrians.length > this.memoryManager.maxEntities.pedestrians) {
            this.pedestrians.sort((a, b) => {
                const distA = this.getDistance(a, this.player);
                const distB = this.getDistance(b, this.player);
                return distA - distB;
            });
            this.pedestrians = this.pedestrians.slice(0, this.memoryManager.maxEntities.pedestrians);
        }
        
        // Remove excess vehicles
        if (this.vehicles.length > this.memoryManager.maxEntities.vehicles) {
            this.vehicles.sort((a, b) => {
                const distA = this.getDistance(a, this.player);
                const distB = this.getDistance(b, this.player);
                return distA - distB;
            });
            this.vehicles = this.vehicles.slice(0, this.memoryManager.maxEntities.vehicles);
        }
        
        // Remove excess police (but keep active pursuers)
        if (this.police.length > this.memoryManager.maxEntities.police) {
            this.police.sort((a, b) => {
                // Prioritize active police over distance
                if (a.state === 'attacking' && b.state !== 'attacking') return -1;
                if (b.state === 'attacking' && a.state !== 'attacking') return 1;
                
                const distA = this.getDistance(a, this.player);
                const distB = this.getDistance(b, this.player);
                return distA - distB;
            });
            this.police = this.police.slice(0, this.memoryManager.maxEntities.police);
        }
        
        // Clean up dead entities
        this.pedestrians = this.pedestrians.filter(ped => ped.health > 0);
        this.vehicles = this.vehicles.filter(vehicle => vehicle.health > 0);
        this.police = this.police.filter(cop => cop.health > 0);
        
        // Force garbage collection hint (if available)
        if (window.gc) {
            window.gc();
        }
    }
    
    /**
     * Get memory usage statistics
     * @returns {Object} Memory usage info
     */
    getMemoryStats() {
        const stats = {
            entities: {
                pedestrians: this.pedestrians.length,
                vehicles: this.vehicles.length,
                police: this.police.length,
                bullets: this.bullets.length,
                particles: this.particles.length
            },
            limits: this.memoryManager.maxEntities,
            poolStats: this.poolManager ? this.poolManager.getStats() : null,
            spatialGridStats: this.spatialGrid ? this.spatialGrid.getStats() : null
        };
        
        // Calculate memory pressure
        stats.memoryPressure = {
            pedestrians: stats.entities.pedestrians / stats.limits.pedestrians,
            vehicles: stats.entities.vehicles / stats.limits.vehicles,
            police: stats.entities.police / stats.limits.police,
            overall: (stats.entities.pedestrians + stats.entities.vehicles + stats.entities.police) / 
                    (stats.limits.pedestrians + stats.limits.vehicles + stats.limits.police)
        };
        
        return stats;
    }

    updateCameraShake(deltaTime) {
        if (this.camera.shakeTimer > 0) {
            this.camera.shakeTimer -= deltaTime;
            const intensity = this.camera.shake * (this.camera.shakeTimer / 300);
            this.camera.shakeX = (Math.random() - 0.5) * intensity;
            this.camera.shakeY = (Math.random() - 0.5) * intensity;
        } else {
            this.camera.shakeX = 0;
            this.camera.shakeY = 0;
        }
    }

    addCameraShake(intensity, duration = 300) {
        this.camera.shake = intensity;
        this.camera.shakeTimer = duration;
    }

    updatePoliceResponse(deltaTime) {
        const currentLevel = this.wantedSystem.level;
        
        if (currentLevel === 0) {
            return; // No police response at wanted level 0
        }
        
        const response = this.wantedSystem.policeResponse[currentLevel];
        const currentPoliceCount = this.police.length;
        
        // Spawn police if below maximum and chance allows
        if (currentPoliceCount < response.maxPolice && Math.random() < response.spawnChance) {
            this.spawnPoliceWithResponse(response);
        }
        
        // Enhance existing police based on wanted level
        this.police.forEach(cop => {
            if (cop.aggressiveness !== undefined) {
                cop.aggressiveness = response.aggressiveness;
                cop.alertLevel = Math.min(100, cop.alertLevel + (currentLevel * 5));
            }
        });
    }
    
    spawnPoliceWithResponse(response) {
        // Choose spawn location based on response level
        const spawnMethod = this.wantedSystem.level >= 4 ? 'roadblock' : 
                           this.wantedSystem.level >= 2 ? 'chase' : 'patrol';
        
        let spawnX, spawnY;
        
        switch (spawnMethod) {
            case 'roadblock':
                // Spawn ahead of player on roads
                const playerDirection = Math.atan2(this.player.velocity.y, this.player.velocity.x);
                const roadblockDistance = 200;
                spawnX = this.player.x + Math.cos(playerDirection) * roadblockDistance;
                spawnY = this.player.y + Math.sin(playerDirection) * roadblockDistance;
                break;
                
            case 'chase':
                // Spawn behind player for chase
                const chaseAngle = Math.atan2(this.player.y - (this.player.y + this.player.velocity.y * 5), 
                                             this.player.x - (this.player.x + this.player.velocity.x * 5));
                spawnX = this.player.x + Math.cos(chaseAngle) * response.spawnRadius;
                spawnY = this.player.y + Math.sin(chaseAngle) * response.spawnRadius;
                break;
                
            default: // patrol
                // Spawn randomly around player
                const angle = Math.random() * Math.PI * 2;
                spawnX = this.player.x + Math.cos(angle) * response.spawnRadius;
                spawnY = this.player.y + Math.sin(angle) * response.spawnRadius;
                break;
        }
        
        // Ensure spawn position is within bounds
        spawnX = Math.max(0, Math.min(this.city.width, spawnX));
        spawnY = Math.max(0, Math.min(this.city.height, spawnY));
        
        // Create enhanced police officer
        const cop = new Police(this, spawnX, spawnY);
        cop.aggressiveness = response.aggressiveness;
        cop.spawnMethod = spawnMethod;
        cop.alertLevel = Math.min(100, 30 + (this.wantedSystem.level * 10));
        
        // Enhance stats based on wanted level
        if (this.wantedSystem.level >= 3) {
            cop.health = Math.floor(cop.health * 1.2); // 20% more health
            cop.maxHealth = cop.health;
            cop.speed *= 1.1; // 10% faster
        }
        
        if (this.wantedSystem.level >= 5) {
            cop.shootCooldown = Math.floor(cop.shootCooldown * 0.8); // 20% faster shooting
            cop.weaponRange *= 1.2; // 20% longer range
        }
        
        this.police.push(cop);
        
        // Play spawn sound
        if (this.audioManager) {
            this.audioManager.playSound('police_siren', spawnX, spawnY);
        }
        
        console.log(`Police spawned using ${spawnMethod} method at wanted level ${this.wantedSystem.level}`);
    }
    
    spawnPolice() {
        // Legacy method - use enhanced spawning if available
        if (this.wantedSystem.level > 0) {
            const response = this.wantedSystem.policeResponse[this.wantedSystem.level];
            this.spawnPoliceWithResponse(response);
        } else {
            // Fallback to original spawning
            const angle = Math.random() * Math.PI * 2;
            const distance = 300;
            const x = this.player.x + Math.cos(angle) * distance;
            const y = this.player.y + Math.sin(angle) * distance;
            this.police.push(new Police(this, x, y));
        }
    }
    
    addHeat(amount, crimeType) {
        this.wantedSystem.heatPoints += amount;
        
        // Calculate wanted level based on heat points
        const newLevel = Math.min(this.wantedSystem.maxLevel, 
            Math.floor(this.wantedSystem.heatPoints / 100));
        
        if (newLevel > this.wantedSystem.level) {
            this.wantedSystem.level = newLevel;
            this.wantedSystem.timer = 0; // Reset decay timer
            
            // Play wanted level increase sound
            if (this.audioManager) {
                this.audioManager.playSound('wanted_increase', this.player.x, this.player.y);
            }
            
            // Screen flash effect
            this.addCameraShake(5, 200);
            
            console.log(`Wanted Level increased to ${newLevel} due to ${crimeType}`);
        }
    }
    
    increaseWantedLevel(amount, crimeType = 'unknown') {
        // Legacy method - convert to heat system
        const heatAmount = amount * 50; // Convert old system to heat points
        this.addHeat(heatAmount, crimeType);
    }
    
    updateWantedSystem(deltaTime) {
        // Decay heat over time
        if (this.wantedSystem.heatPoints > 0) {
            this.wantedSystem.heatPoints = Math.max(0, 
                this.wantedSystem.heatPoints - this.wantedSystem.heatDecayRate * (deltaTime / 1000));
        }
        
        // Update wanted level decay
        if (this.wantedSystem.level > 0) {
            this.wantedSystem.timer += deltaTime;
            
            // Decay wanted level based on timer
            if (this.wantedSystem.timer >= this.wantedSystem.decayTime) {
                this.wantedSystem.level = Math.max(0, this.wantedSystem.level - 1);
                this.wantedSystem.timer = 0;
                
                if (this.wantedSystem.level === 0) {
                    this.wantedSystem.heatPoints = 0; // Clear heat when level reaches 0
                }
                
                console.log(`Wanted Level decreased to ${this.wantedSystem.level}`);
            }
        }
        
        // Update legacy wantedLevel for UI compatibility
        this.wantedLevel = this.wantedSystem.level;
    }
    
    render() {
        try {
            // Clear canvas
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Render sky background (day/night cycle)
            if (this.dayNightCycle) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.dayNightCycle.renderSky(ctx);
                }, 'day_night_sky');
            }
            
            // Save context for camera transform
            this.ctx.save();
            this.ctx.translate(
                -this.camera.x + this.camera.shakeX, 
                -this.camera.y + this.camera.shakeY
            );
            
            // Render game objects with error handling
            if (this.city) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.city.render(ctx);
                }, 'city');
            }
            
            // Render zones (before other objects)
            if (this.zoneManager) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.zoneManager.render(ctx, 'high');
                }, 'zone_manager');
            }
            
            // Render districts (background layer)
            if (this.districtManager) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.districtManager.render(ctx, 'medium');
                }, 'district_manager');
            }
            
            // Render traffic lights (infrastructure)
            if (this.trafficLightManager) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.trafficLightManager.render(ctx, 'high');
                }, 'traffic_light_manager');
            }
            
            // Render vehicles first (so they appear behind player) - with culling and LOD
            this.vehicles.forEach((vehicle, index) => {
                if (this.isInViewport(vehicle)) {
                    const lodLevel = this.getLODLevel(vehicle);
                    if (lodLevel !== 'skip') {
                        window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                            vehicle.render(ctx, lodLevel);
                        }, `vehicle_${index}`);
                    }
                }
            });
            
            // Render pedestrians - with culling and LOD
            this.pedestrians.forEach((ped, index) => {
                if (this.isInViewport(ped)) {
                    const lodLevel = this.getLODLevel(ped);
                    if (lodLevel !== 'skip') {
                        window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                            ped.render(ctx, lodLevel);
                        }, `pedestrian_${index}`);
                    }
                }
            });
            
            // Render police - with culling and LOD
            this.police.forEach((cop, index) => {
                if (this.isInViewport(cop)) {
                    const lodLevel = this.getLODLevel(cop);
                    if (lodLevel !== 'skip') {
                        window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                            cop.render(ctx, lodLevel);
                        }, `police_${index}`);
                    }
                }
            });
            
            // Render player
            if (this.player) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.player.render(ctx);
                }, 'player');
            }
            
            // Render bullets - with culling
            this.bullets.forEach((bullet, index) => {
                if (this.isInViewport(bullet)) {
                    window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                        bullet.render(ctx);
                    }, `bullet_${index}`);
                }
            });
            
            // Render particles - with culling
            this.particles.forEach((particle, index) => {
                if (this.isInViewport(particle)) {
                    window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                        particle.render(ctx);
                    }, `particle_${index}`);
                }
            });
            
            // Render power-ups - with culling
            if (this.powerUpManager) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.powerUpManager.powerUps.forEach(powerUp => {
                        if (this.isInViewport(powerUp)) {
                            powerUp.render(ctx);
                        }
                    });
                }, 'powerup_manager');
            }
            
            // Apply day/night lighting effects
            if (this.dayNightCycle) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.dayNightCycle.applyLighting(ctx);
                }, 'day_night_lighting');
            }
            
            // Apply weather effects (last layer)
            if (this.weatherSystem) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.weatherSystem.render(ctx);
                }, 'weather_effects');
            }
            
            // Restore context
            this.ctx.restore();
            
            // Render text effects (not affected by camera)
            this.textEffects.forEach((effect, index) => {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    effect.render(ctx);
                }, `text_effect_${index}`);
            });
            
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
        // Update UI elements (fallback for basic display)
        document.getElementById('wantedLevel').textContent = `WANTED: ${this.wantedLevel}`;
        document.getElementById('score').textContent = `SCORE: ${this.score}`;
        
        // Use UI class minimap if available, otherwise fallback
        if (this.ui && this.ui.renderMinimap) {
            this.ui.renderMinimap();
        } else {
            this.renderMinimap();
        }
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
        // Bullets are now managed by poolManager
        // This method is kept for compatibility but bullets should be created via poolManager
        if (!this.poolManager) {
            this.bullets.push(bullet);
        }
    }
    
    addParticle(particle) {
        // Particles are now managed by poolManager
        // This method is kept for compatibility but particles should be created via poolManager
        if (!this.poolManager) {
            this.particles.push(particle);
        }
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    checkCollision(obj1, obj2) {
        if (!obj1 || !obj2) return false;
        
        // Handle different collision shapes
        const obj1Radius = obj1.radius || obj1.size || 5;
        const obj2Radius = obj2.radius || obj2.size || 5;
        
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (obj1Radius + obj2Radius);
    }
    
    addTextEffect(x, y, text, color = '#ffffff', duration = 2000) {
        const textEffect = {
            x: x,
            y: y,
            text: text,
            color: color,
            duration: duration,
            maxDuration: duration,
            active: true,
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: -2
            },
            update: function(deltaTime) {
                if (!this.active) return;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.duration -= deltaTime;
                if (this.duration <= 0) {
                    this.active = false;
                }
            },
            render: function(ctx) {
                if (!this.active) return;
                const alpha = this.duration / this.maxDuration;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.text, this.x, this.y);
                ctx.restore();
            }
        };
        
        this.textEffects.push(textEffect);
    }
}
