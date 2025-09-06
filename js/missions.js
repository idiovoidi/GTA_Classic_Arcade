/**
 * Mission System for GTA Clone
 * Manages mission creation, tracking, and completion
 */

class Mission {
    constructor(game, config) {
        this.game = game;
        this.id = config.id;
        this.type = config.type;
        this.title = config.title;
        this.description = config.description;
        this.objectives = config.objectives || [];
        this.timeLimit = config.timeLimit || 0;
        this.reward = config.reward || 100;
        
        this.active = false;
        this.completed = false;
        this.failed = false;
        this.startTime = 0;
        this.progress = {};
        
        // Initialize objectives
        this.objectives.forEach(obj => {
            this.progress[obj.id] = 0;
        });
    }
    
    /**
     * Start the mission
     */
    start() {
        this.active = true;
        this.startTime = Date.now();
        this.showNotification(`Mission Started: ${this.title}`);
        
        // Play mission start sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('zone_enter', 0.6);
        }
    }
    
    /**
     * Update mission progress
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Check time limit
        if (this.timeLimit > 0) {
            const elapsed = Date.now() - this.startTime;
            if (elapsed > this.timeLimit) {
                this.fail('Time limit exceeded');
                return;
            }
        }
        
        // Check mission completion
        this.checkCompletion();
    }
    
    /**
     * Check if mission is complete
     */
    checkCompletion() {
        // Check if all objectives are completed
        const allComplete = this.objectives.every(obj => {
            return this.progress[obj.id] >= obj.target;
        });
        
        if (allComplete) {
            this.complete();
        }
    }
    
    /**
     * Update objective progress
     * @param {string} objectiveId - Objective ID
     * @param {number} amount - Amount to add
     */
    updateProgress(objectiveId, amount = 1) {
        if (this.progress[objectiveId] !== undefined) {
            this.progress[objectiveId] += amount;
            
            // Show progress notification
            const objective = this.objectives.find(obj => obj.id === objectiveId);
            if (objective) {
                this.showNotification(
                    `${objective.description}: ${this.progress[objectiveId]}/${objective.target}`
                );
            }
        }
    }
    
    /**
     * Calculate mission reward
     * @returns {number} Total reward
     */
    calculateReward() {
        let totalReward = this.reward;
        
        // Time bonus
        if (this.hasTimeBonus()) {
            totalReward *= 1.5;
        }
        
        return Math.floor(totalReward);
    }
    
    /**
     * Show mission notification
     * @param {string} message - Message to show
     */
    showNotification(message) {
        // Use UI system if available
        if (this.game.ui && this.game.ui.showNotification) {
            this.game.ui.showNotification(message, 3000);
        } else {
            console.log(`Mission: ${message}`);
        }
    }
    
    /**
     * Clean up mission resources
     */
    cleanup() {
        this.active = false;
        
        // Remove mission-specific entities if any
        // This would be implemented based on mission type
    }
    
    /**
     * Complete the mission
     */
    complete() {
        this.completed = true;
        this.active = false;
        
        // Calculate reward
        const reward = this.calculateReward();
        this.game.score += reward;
        
        // Record mission completion in progression system
        if (this.game.progression) {
            const isBonus = this.hasTimeBonus();
            this.game.progression.recordMissionResult(true, isBonus);
        }
        
        this.showNotification(`Mission Complete! +${reward} points`);
        
        // Play success sound and trigger victory music
        if (this.game.audioManager) {
            this.game.audioManager.playSound('pickup', 1.0, 1.2); // Higher pitch for success
            this.game.audioManager.setMusicState('victory');
        }
        
        this.cleanup();
    }
    
    /**
     * Fail the mission
     * @param {string} reason - Failure reason
     */
    fail(reason) {
        this.failed = true;
        this.active = false;
        
        // Record mission failure in progression system
        if (this.game.progression) {
            this.game.progression.recordMissionResult(false, false);
        }
        
        this.showNotification(`Mission Failed: ${reason}`);
        
        // Play failure sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('impact', 0.8, 0.6); // Lower pitch for failure
        }
        
        this.cleanup();
    }

    /**
     * Check if mission deserves time bonus
     * @returns {boolean} Whether mission was completed with time bonus
     */
    hasTimeBonus() {
        if (this.timeLimit <= 0) return false;
        
        const elapsed = Date.now() - this.startTime;
        const timeRatio = elapsed / this.timeLimit;
        
        // Bonus if completed in less than 75% of time limit
        return timeRatio < 0.75;
    }
}

/**
 * Mission Manager
 * Handles multiple missions, mission generation, and progression
 */
class MissionManager {
    constructor(game) {
        this.game = game;
        this.missions = new Map();
        this.activeMission = null;
        this.completedMissions = [];
        this.missionTypes = {
            destroy: 'Destroy vehicles',
            eliminate: 'Eliminate targets',
            collect: 'Collect items',
            survive: 'Survive for time',
            escape: 'Escape police pursuit'
        };
    }
    
    /**
     * Generate a random mission
     * @returns {Mission} Generated mission
     */
    generateMission() {
        const types = Object.keys(this.missionTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        const id = `mission_${Date.now()}`;
        
        const config = this.generateMissionConfig(type, id);
        const mission = new Mission(this.game, config);
        
        this.missions.set(id, mission);
        return mission;
    }
    
    /**
     * Generate mission configuration
     * @param {string} type - Mission type
     * @param {string} id - Mission ID
     * @returns {Object} Mission configuration
     */
    generateMissionConfig(type, id) {
        const configs = {
            destroy: {
                id: id,
                type: 'destroy',
                title: 'Vehicle Destruction',
                description: 'Destroy enemy vehicles',
                objectives: [{ id: 'destroy_count', description: 'Vehicles destroyed', target: 5 }],
                timeLimit: 120000, // 2 minutes
                reward: 500
            },
            eliminate: {
                id: id,
                type: 'eliminate',
                title: 'Target Elimination',
                description: 'Eliminate hostile targets',
                objectives: [{ id: 'kill_count', description: 'Targets eliminated', target: 10 }],
                timeLimit: 180000, // 3 minutes
                reward: 750
            },
            collect: {
                id: id,
                type: 'collect',
                title: 'Item Collection',
                description: 'Collect power-ups',
                objectives: [{ id: 'collect_count', description: 'Items collected', target: 8 }],
                timeLimit: 150000, // 2.5 minutes
                reward: 400
            },
            survive: {
                id: id,
                type: 'survive',
                title: 'Survival Challenge',
                description: 'Survive police pursuit',
                objectives: [{ id: 'survive_time', description: 'Time survived', target: 60000 }], // 1 minute in ms
                timeLimit: 0, // No time limit, survival is the goal
                reward: 1000
            },
            escape: {
                id: id,
                type: 'escape',
                title: 'Police Escape',
                description: 'Escape police pursuit',
                objectives: [{ id: 'escape_time', description: 'Time without pursuit', target: 30000 }], // 30 seconds
                timeLimit: 300000, // 5 minutes
                reward: 600
            }
        };
        
        return configs[type];
    }
    
    /**
     * Start a mission
     * @param {string} missionId - Mission ID
     */
    startMission(missionId) {
        const mission = this.missions.get(missionId);
        if (mission && !this.activeMission) {
            this.activeMission = mission;
            mission.start();
        }
    }
    
    /**
     * Update missions
     * @param {number} deltaTime - Delta time
     */
    update(deltaTime) {
        if (this.activeMission) {
            this.activeMission.update(deltaTime);
            
            if (this.activeMission.completed || this.activeMission.failed) {
                this.completeMission();
            }
        }
    }
    
    /**
     * Complete the active mission
     */
    completeMission() {
        if (this.activeMission) {
            if (this.activeMission.completed) {
                this.completedMissions.push(this.activeMission.id);
            }
            this.activeMission = null;
        }
    }
    
    /**
     * Get mission progress info
     * @returns {Object} Mission progress
     */
    getMissionInfo() {
        if (!this.activeMission) return null;
        
        return {
            title: this.activeMission.title,
            description: this.activeMission.description,
            objectives: this.activeMission.objectives.map(obj => ({
                description: obj.description,
                progress: this.activeMission.progress[obj.id],
                target: obj.target,
                completed: this.activeMission.progress[obj.id] >= obj.target
            })),
            timeRemaining: this.activeMission.timeLimit > 0 ? 
                Math.max(0, this.activeMission.timeLimit - (Date.now() - this.activeMission.startTime)) : null
        };
    }
}

// Export classes
window.Mission = Mission;
window.MissionManager = MissionManager;