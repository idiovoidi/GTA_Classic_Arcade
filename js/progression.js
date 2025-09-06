/**
 * Player Progression System for GTA Clone
 * Implements money, experience, levels, and upgrades
 */

class PlayerProgression {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        
        // Currency system
        this.money = 500; // Starting money
        this.totalEarned = 0;
        this.totalSpent = 0;
        
        // Experience system
        this.experience = 0;
        this.level = 1;
        this.skillPoints = 0;
        this.experienceToNextLevel = 100;
        this.baseExperienceRequired = 100;
        this.experienceMultiplier = 1.5;
        
        // Statistics tracking
        this.stats = {
            kills: {
                pedestrians: 0,
                police: 0,
                vehicles: 0,
                total: 0
            },
            distance: {
                driven: 0,
                walked: 0,
                total: 0
            },
            combat: {
                shotsFired: 0,
                shotsHit: 0,
                accuracy: 0,
                damageDealt: 0,
                damageTaken: 0
            },
            missions: {
                completed: 0,
                failed: 0,
                successRate: 0
            },
            time: {
                played: 0,
                lastSession: 0
            },
            zones: {
                visited: new Set(),
                services: {
                    hospital: 0,
                    garage: 0,
                    weaponShop: 0,
                    blackMarket: 0
                }
            }
        };
        
        // Skills system
        this.skills = {
            driving: {
                level: 1,
                experience: 0,
                maxLevel: 10,
                bonuses: {
                    speed: 0,
                    handling: 0,
                    durability: 0
                }
            },
            shooting: {
                level: 1,
                experience: 0,
                maxLevel: 10,
                bonuses: {
                    damage: 0,
                    accuracy: 0,
                    fireRate: 0
                }
            },
            health: {
                level: 1,
                experience: 0,
                maxLevel: 10,
                bonuses: {
                    maxHealth: 0,
                    regeneration: 0,
                    resistance: 0
                }
            },
            stealth: {
                level: 1,
                experience: 0,
                maxLevel: 10,
                bonuses: {
                    wantedDecay: 0,
                    detectionReduction: 0,
                    silentMovement: 0
                }
            }
        };
        
        // Achievements system
        this.achievements = new Map();
        this.setupAchievements();
        
        // Upgrade costs
        this.upgradeCosts = {
            skill: (level) => level * 100 + 50,
            weapon: {
                damage: 200,
                accuracy: 150,
                fireRate: 250,
                capacity: 100
            },
            vehicle: {
                speed: 300,
                handling: 200,
                armor: 400
            },
            health: {
                maxHealth: 150,
                regeneration: 300
            }
        };
        
        // Money sources and rewards
        this.rewards = {
            kills: {
                pedestrian: 10,
                police: 50,
                vehicle: 25
            },
            missions: {
                completion: 200,
                bonus: 100,
                perfect: 300
            },
            achievements: 500,
            zones: {
                firstVisit: 25,
                serviceUse: 10
            }
        };
        
        // Experience sources
        this.experienceRewards = {
            kills: {
                pedestrian: 5,
                police: 15,
                vehicle: 10
            },
            missions: {
                completion: 50,
                bonus: 25
            },
            skills: {
                driving: 2,
                shooting: 3,
                survival: 1
            },
            achievements: 100
        };
    }
    
    setupAchievements() {
        const achievements = [
            {
                id: 'first_kill',
                name: 'First Blood',
                description: 'Get your first kill',
                condition: () => this.stats.kills.total >= 1,
                reward: { money: 100, experience: 50 }
            },
            {
                id: 'money_maker',
                name: 'Money Maker',
                description: 'Earn $1000',
                condition: () => this.totalEarned >= 1000,
                reward: { money: 200, experience: 100 }
            },
            {
                id: 'level_5',
                name: 'Experienced',
                description: 'Reach level 5',
                condition: () => this.level >= 5,
                reward: { money: 500, skillPoints: 2 }
            },
            {
                id: 'sharpshooter',
                name: 'Sharpshooter',
                description: 'Achieve 80% accuracy',
                condition: () => this.stats.combat.accuracy >= 0.8,
                reward: { money: 300, experience: 150 }
            },
            {
                id: 'cop_killer',
                name: 'Cop Killer',
                description: 'Kill 10 police officers',
                condition: () => this.stats.kills.police >= 10,
                reward: { money: 400, experience: 200 }
            },
            {
                id: 'road_warrior',
                name: 'Road Warrior',
                description: 'Drive 10km',
                condition: () => this.stats.distance.driven >= 10000,
                reward: { money: 250, experience: 100 }
            },
            {
                id: 'mission_master',
                name: 'Mission Master',
                description: 'Complete 10 missions',
                condition: () => this.stats.missions.completed >= 10,
                reward: { money: 600, experience: 300 }
            },
            {
                id: 'zone_explorer',
                name: 'Zone Explorer',
                description: 'Visit all zone types',
                condition: () => {
                    // Ensure visited is a Set
                    if (!(this.stats.zones.visited instanceof Set)) {
                        this.stats.zones.visited = new Set(this.stats.zones.visited || []);
                    }
                    return this.stats.zones.visited.size >= 7;
                },
                reward: { money: 350, experience: 175 }
            }
        ];
        
        achievements.forEach(achievement => {
            this.achievements.set(achievement.id, {
                ...achievement,
                unlocked: false,
                unlockedAt: null
            });
        });
    }
    
    update(deltaTime) {
        // Update playtime
        this.stats.time.played += deltaTime;
        this.stats.time.lastSession += deltaTime;
        
        // Update distance tracking
        if (this.player.velocity) {
            const speed = Math.sqrt(
                this.player.velocity.x * this.player.velocity.x + 
                this.player.velocity.y * this.player.velocity.y
            );
            
            if (speed > 0) {
                const distance = speed * (deltaTime / 1000);
                
                if (speed > 1) {
                    this.stats.distance.driven += distance;
                    this.addSkillExperience('driving', distance * 0.1);
                } else {
                    this.stats.distance.walked += distance;
                }
                
                this.stats.distance.total += distance;
            }
        }
        
        // Update skill bonuses
        this.updateSkillBonuses();
        
        // Check achievements
        this.checkAchievements();
        
        // Update combat accuracy
        if (this.stats.combat.shotsFired > 0) {
            this.stats.combat.accuracy = this.stats.combat.shotsHit / this.stats.combat.shotsFired;
        }
        
        // Update mission success rate
        const totalMissions = this.stats.missions.completed + this.stats.missions.failed;
        if (totalMissions > 0) {
            this.stats.missions.successRate = this.stats.missions.completed / totalMissions;
        }
    }
    
    addMoney(amount, source = 'unknown') {
        this.money += amount;
        this.totalEarned += amount;
        
        // Show money gain effect
        if (this.game.addTextEffect) {
            this.game.addTextEffect(
                this.player.x, 
                this.player.y - 30, 
                `+$${amount}`, 
                '#00ff00', 
                2000
            );
        }
        
        console.log(`Earned $${amount} from ${source}. Total: $${this.money}`);
    }
    
    spendMoney(amount, item = 'unknown') {
        if (this.money >= amount) {
            this.money -= amount;
            this.totalSpent += amount;
            
            // Show money spent effect
            if (this.game.addTextEffect) {
                this.game.addTextEffect(
                    this.player.x, 
                    this.player.y - 30, 
                    `-$${amount}`, 
                    '#ff0000', 
                    2000
                );
            }
            
            console.log(`Spent $${amount} on ${item}. Remaining: $${this.money}`);
            return true;
        }
        
        // Show insufficient funds message
        if (this.game.addTextEffect) {
            this.game.addTextEffect(
                this.player.x, 
                this.player.y - 30, 
                'Insufficient funds!', 
                '#ff8800', 
                2000
            );
        }
        
        return false;
    }
    
    addExperience(amount, source = 'unknown') {
        this.experience += amount;
        
        // Check for level up
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
        
        // Show experience gain
        if (this.game.addTextEffect) {
            this.game.addTextEffect(
                this.player.x + 20, 
                this.player.y - 40, 
                `+${amount} XP`, 
                '#00ffff', 
                1500
            );
        }
        
        console.log(`Gained ${amount} XP from ${source}. Total: ${this.experience}`);
    }
    
    levelUp() {
        this.experience -= this.experienceToNextLevel;
        this.level++;
        this.skillPoints += 2; // Gain 2 skill points per level
        
        // Calculate next level requirement
        this.experienceToNextLevel = Math.floor(
            this.baseExperienceRequired * Math.pow(this.experienceMultiplier, this.level - 1)
        );
        
        // Level up bonuses
        this.money += this.level * 50; // Money bonus based on level
        
        // Show level up effect
        if (this.game.addTextEffect) {
            this.game.addTextEffect(
                this.player.x, 
                this.player.y - 50, 
                `LEVEL UP! ${this.level}`, 
                '#ffff00', 
                3000
            );
        }
        
        // Play level up sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('level_up', this.player.x, this.player.y);
        }
        
        console.log(`Level up! Now level ${this.level}. Skill points: ${this.skillPoints}`);
    }
    
    addSkillExperience(skillName, amount) {
        const skill = this.skills[skillName];
        if (!skill || skill.level >= skill.maxLevel) return;
        
        skill.experience += amount;
        const requiredXP = this.getSkillLevelRequirement(skill.level);
        
        if (skill.experience >= requiredXP) {
            skill.experience -= requiredXP;
            skill.level++;
            
            // Show skill level up
            if (this.game.addTextEffect) {
                this.game.addTextEffect(
                    this.player.x + 30, 
                    this.player.y - 20, 
                    `${skillName.toUpperCase()} UP!`, 
                    '#ff00ff', 
                    2000
                );
            }
            
            console.log(`${skillName} skill leveled up to ${skill.level}!`);
        }
    }
    
    getSkillLevelRequirement(level) {
        return level * 50 + 25;
    }
    
    updateSkillBonuses() {
        // Driving skill bonuses
        const driving = this.skills.driving;
        driving.bonuses.speed = (driving.level - 1) * 0.1;
        driving.bonuses.handling = (driving.level - 1) * 0.05;
        driving.bonuses.durability = (driving.level - 1) * 0.15;
        
        // Shooting skill bonuses
        const shooting = this.skills.shooting;
        shooting.bonuses.damage = (shooting.level - 1) * 0.1;
        shooting.bonuses.accuracy = (shooting.level - 1) * 0.05;
        shooting.bonuses.fireRate = (shooting.level - 1) * 0.08;
        
        // Health skill bonuses
        const health = this.skills.health;
        health.bonuses.maxHealth = (health.level - 1) * 10;
        health.bonuses.regeneration = (health.level - 1) * 0.5;
        health.bonuses.resistance = (health.level - 1) * 0.05;
        
        // Stealth skill bonuses
        const stealth = this.skills.stealth;
        stealth.bonuses.wantedDecay = (stealth.level - 1) * 0.2;
        stealth.bonuses.detectionReduction = (stealth.level - 1) * 0.1;
        stealth.bonuses.silentMovement = (stealth.level - 1) * 0.05;
        
        // Apply bonuses to player
        this.applySkillBonuses();
    }
    
    applySkillBonuses() {
        // Apply health bonuses
        const healthBonus = this.skills.health.bonuses.maxHealth;
        this.player.maxHealth = 100 + healthBonus;
        
        // Ensure current health doesn't exceed new max
        if (this.player.health > this.player.maxHealth) {
            this.player.health = this.player.maxHealth;
        }
        
        // Apply driving bonuses (these would be used by vehicle systems)
        this.player.drivingBonuses = this.skills.driving.bonuses;
        this.player.shootingBonuses = this.skills.shooting.bonuses;
        this.player.stealthBonuses = this.skills.stealth.bonuses;
    }
    
    recordKill(targetType) {
        this.stats.kills[targetType]++;
        this.stats.kills.total++;
        
        // Add money and experience rewards
        const moneyReward = this.rewards.kills[targetType] || 0;
        const xpReward = this.experienceRewards.kills[targetType] || 0;
        
        this.addMoney(moneyReward, `${targetType}_kill`);
        this.addExperience(xpReward, `${targetType}_kill`);
        
        // Add shooting skill experience
        this.addSkillExperience('shooting', xpReward);
    }
    
    recordShot(hit = false) {
        this.stats.combat.shotsFired++;
        if (hit) {
            this.stats.combat.shotsHit++;
        }
        
        // Add small shooting skill experience
        this.addSkillExperience('shooting', hit ? 1 : 0.2);
    }
    
    recordDamage(amount, type = 'dealt') {
        if (type === 'dealt') {
            this.stats.combat.damageDealt += amount;
            this.addSkillExperience('shooting', amount * 0.1);
        } else {
            this.stats.combat.damageTaken += amount;
            this.addSkillExperience('health', amount * 0.05);
        }
    }
    
    recordMissionResult(success, bonus = false) {
        if (success) {
            this.stats.missions.completed++;
            let reward = this.rewards.missions.completion;
            let xp = this.experienceRewards.missions.completion;
            
            if (bonus) {
                reward += this.rewards.missions.bonus;
                xp += this.experienceRewards.missions.bonus;
            }
            
            this.addMoney(reward, 'mission_completion');
            this.addExperience(xp, 'mission_completion');
        } else {
            this.stats.missions.failed++;
        }
    }
    
    recordZoneVisit(zoneType) {
        // Ensure visited is a Set (defensive programming)
        if (!(this.stats.zones.visited instanceof Set)) {
            console.warn('zones.visited was not a Set, reinitializing...');
            this.stats.zones.visited = new Set(this.stats.zones.visited || []);
        }
        
        const wasFirstVisit = !this.stats.zones.visited.has(zoneType);
        this.stats.zones.visited.add(zoneType);
        
        if (wasFirstVisit) {
            this.addMoney(this.rewards.zones.firstVisit, `first_${zoneType}_visit`);
        }
    }
    
    recordZoneService(serviceType) {
        this.stats.zones.services[serviceType]++;
        this.addMoney(this.rewards.zones.serviceUse, `${serviceType}_service`);
    }
    
    checkAchievements() {
        this.achievements.forEach((achievement, id) => {
            if (!achievement.unlocked && achievement.condition()) {
                this.unlockAchievement(id);
            }
        });
    }
    
    unlockAchievement(id) {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        
        // Apply rewards
        if (achievement.reward.money) {
            this.addMoney(achievement.reward.money, 'achievement');
        }
        if (achievement.reward.experience) {
            this.addExperience(achievement.reward.experience, 'achievement');
        }
        if (achievement.reward.skillPoints) {
            this.skillPoints += achievement.reward.skillPoints;
        }
        
        // Show achievement notification
        if (this.game.addTextEffect) {
            this.game.addTextEffect(
                this.player.x, 
                this.player.y - 60, 
                `ACHIEVEMENT: ${achievement.name}`, 
                '#ffd700', 
                4000
            );
        }
        
        // Play achievement sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('achievement', this.player.x, this.player.y);
        }
        
        console.log(`Achievement unlocked: ${achievement.name} - ${achievement.description}`);
    }
    
    upgradeSkill(skillName) {
        const skill = this.skills[skillName];
        if (!skill || skill.level >= skill.maxLevel || this.skillPoints < 1) {
            return false;
        }
        
        this.skillPoints--;
        skill.level++;
        
        // Show upgrade effect
        if (this.game.addTextEffect) {
            this.game.addTextEffect(
                this.player.x, 
                this.player.y - 40, 
                `${skillName.toUpperCase()} UPGRADED!`, 
                '#00ff88', 
                2500
            );
        }
        
        console.log(`Upgraded ${skillName} to level ${skill.level}. Remaining skill points: ${this.skillPoints}`);
        return true;
    }
    
    getProgressionInfo() {
        return {
            money: this.money,
            level: this.level,
            experience: this.experience,
            experienceToNext: this.experienceToNextLevel,
            skillPoints: this.skillPoints,
            stats: this.stats,
            skills: this.skills,
            achievements: Array.from(this.achievements.values()).filter(a => a.unlocked),
            totalPlayTime: this.stats.time.played
        };
    }
    
    save() {
        // Convert Set to Array for serialization
        const statsForSave = {
            ...this.stats,
            zones: {
                ...this.stats.zones,
                visited: Array.from(this.stats.zones.visited)
            }
        };
        
        const saveData = {
            money: this.money,
            totalEarned: this.totalEarned,
            totalSpent: this.totalSpent,
            experience: this.experience,
            level: this.level,
            skillPoints: this.skillPoints,
            stats: statsForSave,
            skills: this.skills,
            achievements: Array.from(this.achievements.entries())
        };
        
        try {
            localStorage.setItem('gta_clone_progression', JSON.stringify(saveData));
            console.log('Progression saved successfully');
        } catch (error) {
            console.error('Failed to save progression:', error);
        }
    }
    
    load() {
        try {
            const saveData = localStorage.getItem('gta_clone_progression');
            if (!saveData) return false;
            
            const data = JSON.parse(saveData);
            
            this.money = data.money || 500;
            this.totalEarned = data.totalEarned || 0;
            this.totalSpent = data.totalSpent || 0;
            this.experience = data.experience || 0;
            this.level = data.level || 1;
            this.skillPoints = data.skillPoints || 0;
            
            if (data.stats) {
                Object.assign(this.stats, data.stats);
                
                // Restore Set from Array if it was saved as an array
                if (data.stats.zones && data.stats.zones.visited) {
                    if (Array.isArray(data.stats.zones.visited)) {
                        this.stats.zones.visited = new Set(data.stats.zones.visited);
                    } else if (!(data.stats.zones.visited instanceof Set)) {
                        // Fallback if it's neither array nor set
                        this.stats.zones.visited = new Set();
                    }
                }
            }
            
            if (data.skills) {
                Object.assign(this.skills, data.skills);
            }
            
            if (data.achievements) {
                data.achievements.forEach(([id, achievement]) => {
                    if (this.achievements.has(id)) {
                        this.achievements.set(id, { ...this.achievements.get(id), ...achievement });
                    }
                });
            }
            
            console.log('Progression loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load progression:', error);
            return false;
        }
    }
}

// Export the class
window.PlayerProgression = PlayerProgression;