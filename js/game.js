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

        // Quality settings
        this.qualitySettings = {
            particleQuality: 'high', // 'low', 'medium', 'high'
            maxParticles: 300, // Maximum particles allowed
            particleDistanceCulling: true
        };

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
        // Game objects
        this.player = null;
        this.city = null;
        this.pedestrians = [];
        this.police = [];
        this.tanks = [];
        this.soldiers = []; // Add soldiers array
        this.vehicles = [];
        this.bullets = [];
        this.particles = [];
        this.textEffects = [];
        this.corpses = []; // Persistent corpse system
        this.corpses = []; // Persistent corpse system

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
                particles: 200,
                corpses: 30  // Maximum corpses to keep
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
                destroyTank: 75,
                killSoldier: 60, // Add soldier kill heat
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

        // Performance monitoring
        this.performanceMonitor = {
            lastFPSUpdate: 0,
            frameCount: 0,
            currentFPS: 60,
            particleCount: 0,
            lastParticleAdjustment: 0,
            autoAdjustQuality: true
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
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

            // Create city but don't generate buildings yet
            this.city = new City(this, { skipBuildingGeneration: true });

            // Initialize zone system BEFORE generating city buildings
            // This ensures zone buildings are placed first
            this.zoneManager.init();

            // Now generate city buildings (they will avoid zone buildings)
            this.city.generateBuildingsAfterZones();

            this.player = new Player(this, this.width / 2, this.height / 2);
            this.powerUpManager = new PowerUpManager(this);

            // Initialize progression system
            this.progression = new PlayerProgression(this, this.player);
            this.progression.load(); // Load saved progression

            // Initialize UI system
            this.ui = new UI(this);

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

            // Update tanks with safe array operations
            this.tanks = window.ErrorWrappers?.safeArrayOperation(this.tanks, (tanks) => {
                return tanks.filter((tank, index) => {
                    try {
                        window.ErrorWrappers?.safeAIUpdate(tank, deltaTime, 'tank');
                        if (tank.health <= 0) {
                            this.score += 500;
                            this.addHeat(this.wantedSystem.crimeHeat.destroyVehicle, 'tank_destruction');

                            // Record kill in progression system
                            if (this.progression) {
                                this.progression.recordKill('tank');
                            }

                            return false; // Remove from array
                        }
                        return true; // Keep in array
                    } catch (error) {
                        window.errorHandler?.handleGameError('tank_update_error', {
                            message: error.message,
                            index: index,
                            tank: tank ? { x: tank.x, y: tank.y, health: tank.health } : null
                        });
                        return false; // Remove problematic tank
                    }
                });
            }, 'tank') || [];

            // Update soldiers with safe array operations
            if (this.soldiers) {
                this.soldiers = window.ErrorWrappers?.safeArrayOperation(this.soldiers, (soldiers) => {
                    return soldiers.filter((soldier, index) => {
                        try {
                            window.ErrorWrappers?.safeAIUpdate(soldier, deltaTime, 'soldier');
                            if (soldier.health <= 0) {
                                this.score += 200;
                                this.addHeat(this.wantedSystem.crimeHeat.killSoldier, 'soldier_kill');

                                // Record kill in progression system
                                if (this.progression) {
                                    this.progression.recordKill('soldier');
                                }

                                return false; // Remove from array
                            }
                            return true; // Keep in array
                        } catch (error) {
                            window.errorHandler?.handleGameError('soldier_update_error', {
                                message: error.message,
                                index: index,
                                soldier: soldier ? { x: soldier.x, y: soldier.y, health: soldier.health } : null
                            });
                            return false; // Remove problematic soldier
                        }
                    });
                }, 'soldier') || [];
            }

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

            // Update performance monitoring
            this.updatePerformanceMonitoring(deltaTime);
        } catch (error) {
            window.errorHandler?.handleGameError('game_update_error', {
                message: error.message,
                stack: error.stack,
                deltaTime: deltaTime,
                critical: true
            });
        }
    }

    /**
     * Update performance monitoring and adjust settings if needed
     * @param {number} deltaTime - Delta time
     */
    updatePerformanceMonitoring(deltaTime) {
        this.performanceMonitor.frameCount++;
        this.performanceMonitor.lastFPSUpdate += deltaTime;

        // Update FPS calculation every second
        if (this.performanceMonitor.lastFPSUpdate >= 1000) {
            this.performanceMonitor.currentFPS = this.performanceMonitor.frameCount;
            this.performanceMonitor.frameCount = 0;
            this.performanceMonitor.lastFPSUpdate = 0;

            // Update particle count
            this.performanceMonitor.particleCount = this.particles ? this.particles.length : 0;

            // Auto-adjust quality settings if enabled
            if (this.performanceMonitor.autoAdjustQuality) {
                this.adjustQualitySettings();
            }
        }
    }

    /**
     * Adjust quality settings based on performance
     */
    adjustQualitySettings() {
        const currentFPS = this.performanceMonitor.currentFPS;
        const targetFPS = 50; // Target FPS for good performance

        // Adjust particle quality based on FPS
        if (currentFPS < targetFPS * 0.7) { // Very poor performance
            this.qualitySettings.particleQuality = 'low';
            this.qualitySettings.maxParticles = 150;
        } else if (currentFPS < targetFPS * 0.9) { // Poor performance
            this.qualitySettings.particleQuality = 'medium';
            this.qualitySettings.maxParticles = 200;
        } else { // Good performance
            this.qualitySettings.particleQuality = 'high';
            this.qualitySettings.maxParticles = 300;
        }
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getPerformanceStats() {
        return {
            fps: this.performanceMonitor.currentFPS,
            particleCount: this.performanceMonitor.particleCount,
            qualitySettings: this.qualitySettings,
            memoryUsage: this.getMemoryStats()
        };
    }

    updateSpatialGrid() {
        if (!this.spatialGrid) return;

        // Collect all dynamic objects
        const dynamicObjects = [
            this.player,
            ...this.pedestrians,
            ...this.vehicles,
            ...this.police,
            ...this.tanks,
            ...(this.soldiers || []), // Add soldiers to spatial grid
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
                if (obj.constructor.name === 'Vehicle' || obj.constructor.name === 'Police' || obj.constructor.name === 'Tank') {
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
                    (other.constructor.name === 'Vehicle' || other.constructor.name === 'Police' || other.constructor.name === 'Tank') &&
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

        // Player vs tanks
        this.tanks.forEach(tank => {
            if (tank.health > 0 && this.checkCollision(this.player, tank)) {
                this.handleVehicleCollision(this.player, tank);
            }
        });

        // Player vs soldiers
        if (this.soldiers) {
            this.soldiers.forEach(soldier => {
                if (soldier.health > 0 && this.checkCollision(this.player, soldier)) {
                    // Handle soldier collision (different from vehicle collision)
                    this.handlePedestrianCollision(this.player, soldier);
                }
            });
        }

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

            // Vehicle vs tank collisions
            this.tanks.forEach(tank => {
                if (vehicle.health > 0 && tank.health > 0 &&
                    this.checkCollision(vehicle, tank)) {
                    this.handleVehicleCollision(vehicle, tank);
                }
            });

            // Vehicle vs soldier collisions
            if (this.soldiers) {
                this.soldiers.forEach(soldier => {
                    if (vehicle.health > 0 && soldier.health > 0 &&
                        this.checkCollision(vehicle, soldier)) {
                        // Handle soldier collision (similar to pedestrian collision)
                        this.handlePedestrianCollision(vehicle, soldier);
                    }
                });
            }
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

    /**
     * Handle collision between player and pedestrian/soldier
     * @param {Object} player - Player object
     * @param {Object} pedestrian - Pedestrian or soldier object
     */
    handlePedestrianCollision(player, pedestrian) {
        // Apply damage to pedestrian/soldier
        if (pedestrian.takeDamage) {
            // Damage based on player speed
            const playerSpeed = Math.sqrt(
                player.velocity.x * player.velocity.x +
                player.velocity.y * player.velocity.y
            );
            const damage = Math.max(10, Math.floor(playerSpeed * 5));
            pedestrian.takeDamage(damage);

            // Add heat for killing pedestrians/soldiers
            if (pedestrian.health <= 0) {
                if (pedestrian.constructor.name === 'SoldierTroop') {
                    this.addHeat(this.wantedSystem.crimeHeat.killSoldier, 'kill_soldier');
                } else {
                    this.addHeat(this.wantedSystem.crimeHeat.killPedestrian, 'kill_pedestrian');
                }
            }
        }

        // Apply minor damage to player
        if (player.takeDamage) {
            player.takeDamage(5);
        }

        // Play collision sound
        if (this.audioManager) {
            this.audioManager.playSound('impact', 0.3);
        }

        // Add camera shake
        this.addCameraShake(3, 100);
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

    /**
     * Check if particle should be rendered based on distance and LOD settings
     * @param {Particle} particle - Particle to check
     * @returns {boolean} Whether particle should be rendered
     */
    shouldRenderParticle(particle) {
        // Always render close particles
        const distance = this.getDistanceFromCamera(particle);

        // Apply quality settings
        switch (this.qualitySettings.particleQuality) {
            case 'low':
                // Reduce particle count significantly
                if (distance > 200) return Math.random() < 0.3;
                if (distance > 400) return Math.random() < 0.1;
                break;
            case 'medium':
                // Reduce particle count moderately
                if (distance > 300) return Math.random() < 0.5;
                if (distance > 500) return Math.random() < 0.2;
                break;
            case 'high':
            default:
                // Full particle effects
                if (distance < 200) return true;
                if (distance < 400) return Math.random() < 0.7;
                if (distance < 600) return Math.random() < 0.4;
                return Math.random() < 0.2;
        }

        return true;
    }

    /**
     * Check if we've exceeded maximum particles
     * @returns {boolean} Whether we should limit particle creation
     */
    shouldLimitParticles() {
        return this.particles && this.particles.length >= this.qualitySettings.maxParticles;
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

        // Remove excess soldiers (but keep active attackers)
        if (this.soldiers && this.soldiers.length > this.memoryManager.maxEntities.pedestrians) {
            this.soldiers.sort((a, b) => {
                // Prioritize active soldiers over distance
                if (a.state === 'attacking' && b.state !== 'attacking') return -1;
                if (b.state === 'attacking' && a.state !== 'attacking') return 1;

                const distA = this.getDistance(a, this.player);
                const distB = this.getDistance(b, this.player);
                return distA - distB;
            });
            this.soldiers = this.soldiers.slice(0, this.memoryManager.maxEntities.pedestrians);
        }

        // Clean up dead entities
        this.pedestrians = this.pedestrians.filter(ped => ped.health > 0);
        this.vehicles = this.vehicles.filter(vehicle => vehicle.health > 0);
        this.police = this.police.filter(cop => cop.health > 0);
        if (this.soldiers) {
            this.soldiers = this.soldiers.filter(soldier => soldier.health > 0);
        }

        // Clean up excess corpses based on performance
        this.cleanupCorpses();

        // Force garbage collection hint (if available)
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * Add corpse to the game
     * @param {Object} corpse - Corpse object to add
     */
    addCorpse(corpse) {
        if (!this.corpses) {
            this.corpses = [];
        }
        this.corpses.push(corpse);
    }

    /**
     * Clean up excess corpses based on performance and memory pressure
     */
    cleanupCorpses() {
        if (!this.corpses || this.corpses.length === 0) return;

        const maxCorpses = this.memoryManager.maxEntities.corpses;

        // Check if we need cleanup
        if (this.corpses.length <= maxCorpses) {
            // Fade old corpses
            this.corpses.forEach(corpse => {
                const age = Date.now() - corpse.creationTime;
                const maxAge = 120000; // 2 minutes

                if (age > maxAge) {
                    corpse.alpha = Math.max(0, 1 - (age - maxAge) / 60000); // Fade over 1 minute
                }
            });

            // Remove completely faded corpses
            this.corpses = this.corpses.filter(corpse => corpse.alpha > 0);
            return;
        }

        // Performance-based cleanup when we have too many corpses
        const currentFPS = this.fps || 60;
        const targetFPS = 50;

        let corpsesToRemove = this.corpses.length - maxCorpses;

        // Remove more corpses if performance is poor
        if (currentFPS < targetFPS) {
            const performanceRatio = currentFPS / targetFPS;
            corpsesToRemove = Math.floor(this.corpses.length * (1 - performanceRatio));
        }

        // Sort corpses by priority (lower priority = remove first)
        this.corpses.sort((a, b) => {
            // Update priorities based on current game state
            a.priority = this.calculateCorpsePriority(a);
            b.priority = this.calculateCorpsePriority(b);

            // Secondary sort by age (older corpses removed first if same priority)
            if (a.priority === b.priority) {
                return a.creationTime - b.creationTime;
            }

            return a.priority - b.priority;
        });

        // Remove the lowest priority corpses
        this.corpses = this.corpses.slice(corpsesToRemove);

        console.log(`Cleaned up ${corpsesToRemove} corpses. Remaining: ${this.corpses.length}`);
    }

    /**
     * Calculate current priority for a corpse (higher = keep longer)
     * @param {Object} corpse - Corpse to calculate priority for
     * @returns {number} Priority score
     */
    calculateCorpsePriority(corpse) {
        let priority = 1;

        // Higher priority for vehicle wrecks (more noticeable)
        if (corpse.vehicleType) {
            priority += 1;
            if (corpse.vehicleType === 'TRUCK') priority += 2;
            else if (corpse.vehicleType === 'SPORTS_CAR') priority += 1;
        }

        // Higher priority if closer to player
        const distanceToPlayer = Math.sqrt(
            Math.pow(corpse.x - this.player.x, 2) +
            Math.pow(corpse.y - this.player.y, 2)
        );

        if (distanceToPlayer < 200) priority += 3;
        else if (distanceToPlayer < 400) priority += 2;
        else if (distanceToPlayer < 600) priority += 1;

        // Higher priority if visible on screen
        if (this.isInViewport(corpse)) {
            priority += 2;
        }

        // Lower priority for very old corpses
        const age = Date.now() - corpse.creationTime;
        if (age > 90000) priority -= 2; // Older than 1.5 minutes
        if (age > 180000) priority -= 4; // Older than 3 minutes

        return Math.max(0, priority);
    }

    /**
     * Render all corpses
     */
    renderCorpses() {
        if (!this.corpses || this.corpses.length === 0) return;

        this.corpses.forEach((corpse, index) => {
            if (this.isInViewport(corpse)) {
                window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                    this.renderCorpse(ctx, corpse);
                }, `corpse_${index}`);
            }
        });
    }

    /**
     * Render individual corpse with blood stains or vehicle wreckage
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} corpse - Corpse object to render
     */
    renderCorpse(ctx, corpse) {
        ctx.save();
        ctx.globalAlpha = corpse.alpha;

        if (corpse.vehicleType) {
            // Render vehicle wreckage
            this.renderVehicleWreckage(ctx, corpse);
        } else {
            // Render pedestrian corpse
            this.renderPedestrianCorpse(ctx, corpse);
        }

        ctx.restore();
    }

    /**
     * Render pedestrian corpse with blood stains
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} corpse - Pedestrian corpse object
     */
    renderPedestrianCorpse(ctx, corpse) {
        // Render blood stains first (underneath corpse)
        if (corpse.bloodStains) {
            corpse.bloodStains.forEach(stain => {
                ctx.save();
                ctx.globalAlpha = corpse.alpha * stain.alpha;
                ctx.fillStyle = stain.color;
                ctx.beginPath();
                ctx.arc(stain.x, stain.y, stain.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }

        // Render corpse body
        ctx.translate(corpse.x, corpse.y);
        ctx.rotate(corpse.angle);

        // Body (darker/grayer version of original color)
        const bodyColor = this.adjustColorBrightness(corpse.color, 0.3);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-corpse.width / 2, -corpse.height / 2, corpse.width, corpse.height);

        // Head (pale)
        ctx.fillStyle = '#d4a574'; // Pale flesh tone
        ctx.beginPath();
        ctx.arc(0, -corpse.height / 2 - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Blood pool around corpse
        ctx.globalAlpha = corpse.alpha * 0.4;
        ctx.fillStyle = '#4a0000';
        ctx.beginPath();
        ctx.ellipse(0, 0, corpse.width * 0.8, corpse.height * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render vehicle wreckage with burn marks and debris
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} wreckage - Vehicle wreckage object
     */
    renderVehicleWreckage(ctx, wreckage) {
        // Render burn marks first (ground layer)
        if (wreckage.burnMarks) {
            wreckage.burnMarks.forEach(mark => {
                ctx.save();
                ctx.globalAlpha = wreckage.alpha * mark.alpha;
                ctx.fillStyle = mark.color;

                if (mark.type === 'main') {
                    // Main burn area - elliptical
                    ctx.beginPath();
                    ctx.ellipse(mark.x, mark.y, mark.size * 0.8, mark.size * 0.6, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Scattered burn patches - circular
                    ctx.beginPath();
                    ctx.arc(mark.x, mark.y, mark.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });
        }

        // Render debris field
        if (wreckage.debrisField) {
            wreckage.debrisField.forEach(debris => {
                ctx.save();
                ctx.globalAlpha = wreckage.alpha * debris.alpha;
                ctx.translate(debris.x, debris.y);
                ctx.rotate(debris.angle);
                ctx.fillStyle = debris.color;
                ctx.fillRect(-debris.size / 2, -debris.size / 2, debris.size, debris.size);
                ctx.restore();
            });
        }

        // Render destroyed vehicle shell (if any remains)
        ctx.translate(wreckage.x, wreckage.y);
        ctx.rotate(wreckage.angle);

        // Charred vehicle frame (very dark version of original)
        const charredColor = this.adjustColorBrightness(wreckage.originalColor, 0.1);
        ctx.globalAlpha = wreckage.alpha * 0.6;
        ctx.fillStyle = charredColor;

        // Draw basic vehicle outline based on type
        switch (wreckage.vehicleType) {
            case 'TRUCK':
                // Collapsed truck frame
                ctx.fillRect(-wreckage.width / 2, -wreckage.height / 2, wreckage.width * 0.8, wreckage.height * 0.7);
                break;
            case 'MOTORCYCLE':
                // Twisted motorcycle remains
                ctx.fillRect(-wreckage.width / 3, -wreckage.height / 3, wreckage.width * 0.6, wreckage.height * 0.6);
                break;
            default:
                // Collapsed car frame
                ctx.fillRect(-wreckage.width / 2, -wreckage.height / 2, wreckage.width * 0.7, wreckage.height * 0.8);
                break;
        }

        // Add some metal debris on top
        ctx.globalAlpha = wreckage.alpha * 0.8;
        ctx.fillStyle = '#333333';
        ctx.fillRect(-wreckage.width / 4, -wreckage.height / 4, wreckage.width / 2, wreckage.height / 2);
    }

    /**
     * Adjust color brightness
     * @param {string} color - Hex color string
     * @param {number} factor - Brightness factor (0-1)
     * @returns {string} Adjusted color
     */
    adjustColorBrightness(color, factor) {
        // Simple brightness adjustment for corpse rendering
        if (!color || !color.startsWith('#')) return '#666666';

        const hex = color.substring(1);
        const r = Math.floor(parseInt(hex.substring(0, 2), 16) * factor);
        const g = Math.floor(parseInt(hex.substring(2, 4), 16) * factor);
        const b = Math.floor(parseInt(hex.substring(4, 6), 16) * factor);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
                particles: this.particles.length,
                corpses: this.corpses ? this.corpses.length : 0,
                soldiers: this.soldiers ? this.soldiers.length : 0
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
            corpses: stats.entities.corpses / stats.limits.corpses,
            overall: (stats.entities.pedestrians + stats.entities.vehicles + stats.entities.police + stats.entities.corpses) /
                (stats.limits.pedestrians + stats.limits.vehicles + stats.limits.police + stats.limits.corpses)
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

        // Spawn tanks when wanted level reaches 6
        if (currentLevel === 6) {
            this.updateTankSpawning(deltaTime);
        }

        // Spawn soldiers when wanted level reaches 5
        if (currentLevel >= 5) {
            this.updateSoldierSpawning(deltaTime);
        }
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

    updateTankSpawning(deltaTime) {
        // Limit to 2-3 tanks maximum on screen at once
        if (this.tanks.length >= 3) return;

        // Spawn tanks using the 'roadblock' method to create ambush scenarios
        if (Math.random() < 0.005) { // Low spawn chance
            this.spawnTank();
        }

        // Update existing tanks
        this.tanks = this.tanks.filter(tank => {
            if (tank.health <= 0) {
                this.score += 500; // Higher score for destroying tanks
                this.addHeat(this.wantedSystem.crimeHeat.destroyVehicle, 'tank_destruction');
                return false; // Remove destroyed tanks
            }
            return true; // Keep active tanks
        });
    }

    // Soldier spawning system
    updateSoldierSpawning(deltaTime) {
        // Limit to 3-5 soldiers maximum on screen at once
        if (this.soldiers && this.soldiers.length >= 5) return;

        // Spawn soldiers with a reasonable chance
        if (Math.random() < 0.008) { // Moderate spawn chance
            this.spawnSoldier();
        }

        // Update existing soldiers and remove dead ones
        if (this.soldiers) {
            this.soldiers = this.soldiers.filter(soldier => {
                if (soldier.health <= 0) {
                    this.score += 200; // Score for killing soldiers
                    this.addHeat(this.wantedSystem.crimeHeat.killSoldier, 'soldier_kill');
                    return false; // Remove dead soldiers
                }
                return true; // Keep alive soldiers
            });
        } else {
            this.soldiers = []; // Initialize soldiers array if it doesn't exist
        }
    }

    spawnSoldier() {
        // Spawn ahead of player on roads for ambush
        const playerDirection = Math.atan2(this.player.velocity.y, this.player.velocity.x);
        const ambushDistance = 250; // Between police roadblocks and tank ambushes
        const spawnX = this.player.x + Math.cos(playerDirection) * ambushDistance;
        const spawnY = this.player.y + Math.sin(playerDirection) * ambushDistance;

        // Ensure spawn position is within bounds
        const boundedX = Math.max(0, Math.min(this.city.width, spawnX));
        const boundedY = Math.max(0, Math.min(this.city.height, spawnY));

        // Create soldier
        const soldier = new SoldierTroop(this, boundedX, boundedY);
        if (!this.soldiers) {
            this.soldiers = [];
        }
        this.soldiers.push(soldier);

        // Play soldier spawn sound
        if (this.audioManager) {
            this.audioManager.playSound('pedestrian_death', boundedX, boundedY); // TODO: Add proper soldier spawn sound
        }

        console.log(`Soldier spawned at wanted level ${this.wantedSystem.level}`);
    }

    spawnTank() {
        // Spawn ahead of player on roads for ambush
        const playerDirection = Math.atan2(this.player.velocity.y, this.player.velocity.x);
        const roadblockDistance = 300; // Further than police roadblocks
        const spawnX = this.player.x + Math.cos(playerDirection) * roadblockDistance;
        const spawnY = this.player.y + Math.sin(playerDirection) * roadblockDistance;

        // Ensure spawn position is within bounds
        const boundedX = Math.max(0, Math.min(this.city.width, spawnX));
        const boundedY = Math.max(0, Math.min(this.city.height, spawnY));

        // Create tank
        const tank = new Tank(this, boundedX, boundedY);
        this.tanks.push(tank);

        // Play tank spawn sound
        if (this.audioManager) {
            this.audioManager.playSound('tank_spawn', boundedX, boundedY);
        }

        console.log(`Tank spawned at wanted level ${this.wantedSystem.level}`);
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

            // Render tanks - with culling and LOD
            this.tanks.forEach((tank, index) => {
                if (this.isInViewport(tank)) {
                    const lodLevel = this.getLODLevel(tank);
                    if (lodLevel !== 'skip') {
                        window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                            tank.render(ctx, lodLevel);
                        }, `tank_${index}`);
                    }
                }
            });

            // Render soldiers - with culling and LOD
            if (this.soldiers) {
                this.soldiers.forEach((soldier, index) => {
                    if (this.isInViewport(soldier)) {
                        const lodLevel = this.getLODLevel(soldier);
                        if (lodLevel !== 'skip') {
                            window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                                soldier.render(ctx, lodLevel);
                            }, `soldier_${index}`);
                        }
                    }
                });
            }

            // Render corpses (ground layer after entities)
            this.renderCorpses();

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

            // Render particles with batching optimization
            this.renderParticlesWithBatching();

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

    /**
     * Render particles with batching optimization
     */
    renderParticlesWithBatching() {
        // Group particles by type for more efficient rendering
        const particleGroups = {};

        this.particles.forEach(particle => {
            if (this.isInViewport(particle) && this.shouldRenderParticle(particle)) {
                const type = particle.particleType || 'generic';
                if (!particleGroups[type]) {
                    particleGroups[type] = [];
                }
                particleGroups[type].push(particle);
            }
        });

        // Render each group
        for (const [type, particles] of Object.entries(particleGroups)) {
            // For simple particles, we can optimize by setting context properties once
            if (type === 'generic' || type === 'spark') {
                this.ctx.save();
                // Set common properties once for the group
                // Then render all particles in the group
                particles.forEach((particle, index) => {
                    window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                        particle.render(ctx);
                    }, `particle_${type}_${index}`);
                });
                this.ctx.restore();
            } else {
                // For complex particles, render individually
                particles.forEach((particle, index) => {
                    window.ErrorWrappers?.safeRenderOperation(this.ctx, (ctx) => {
                        particle.render(ctx);
                    }, `particle_${type}_${index}`);
                });
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
            update: function (deltaTime) {
                if (!this.active) return;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.duration -= deltaTime;
                if (this.duration <= 0) {
                    this.active = false;
                }
            },
            render: function (ctx) {
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

// Export the Game class for use in other modules
window.Game = Game;
