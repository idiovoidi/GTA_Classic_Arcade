class UI {
    constructor(game) {
        console.log('UI initialized successfully!');
        this.game = game;
        this.minimap = document.getElementById('minimap');
        this.minimapCtx = this.minimap.getContext('2d');
        this.wantedLevel = document.getElementById('wantedLevel');
        this.score = document.getElementById('score');
        this.instructions = document.getElementById('instructions');
        
        // UI state
        this.showInstructions = true;
        this.instructionTimer = 5000; // Show for 5 seconds
    }
    
    update(deltaTime) {
        // Update instruction visibility
        if (this.showInstructions) {
            this.instructionTimer -= deltaTime;
            if (this.instructionTimer <= 0) {
                this.showInstructions = false;
                this.instructions.style.opacity = '0.3';
            }
        }
        
        // Update UI text
        this.wantedLevel.textContent = `WANTED: ${this.game.wantedLevel}`;
        this.score.textContent = `SCORE: ${this.game.score}`;
        
        // Update time display
        this.updateTimeDisplay();
        
        // Update progression display
        this.updateProgressionUI();
        
        // Update wanted level color based on level
        if (this.game.wantedLevel === 0) {
            this.wantedLevel.style.color = '#00ff00';
        } else if (this.game.wantedLevel <= 2) {
            this.wantedLevel.style.color = '#ffff00';
        } else if (this.game.wantedLevel <= 4) {
            this.wantedLevel.style.color = '#ff8800';
        } else {
            this.wantedLevel.style.color = '#ff0000';
        }
        
        // Update weapon and power-up UI
        this.updateWeaponUI();
        this.updatePowerUpUI();
        
        // Update compact HUD
        this.updateCompactHUD();
    }
    
    renderMinimap() {
        const scale = 0.1;
        const minimapWidth = 150;
        const minimapHeight = 150;
        
        // Clear minimap
        this.minimapCtx.fillStyle = '#000';
        this.minimapCtx.fillRect(0, 0, minimapWidth, minimapHeight);
        
        // Draw city background
        this.minimapCtx.fillStyle = '#333';
        this.minimapCtx.fillRect(0, 0, minimapWidth, minimapHeight);
        
        // Draw roads
        this.minimapCtx.fillStyle = '#666';
        for (const road of this.game.city.roads) {
            const x = road.x * scale;
            const y = road.y * scale;
            const width = road.width * scale;
            const height = road.height * scale;
            
            this.minimapCtx.fillRect(x, y, width, height);
        }
        
        // Draw buildings
        this.minimapCtx.fillStyle = '#555';
        for (const building of this.game.city.buildings) {
            const x = building.x * scale;
            const y = building.y * scale;
            const width = building.width * scale;
            const height = building.height * scale;
            
            this.minimapCtx.fillRect(x, y, width, height);
        }
        
        // Draw player
        this.minimapCtx.fillStyle = '#00ff00';
        const playerX = this.game.player.x * scale;
        const playerY = this.game.player.y * scale;
        this.minimapCtx.fillRect(playerX - 2, playerY - 2, 4, 4);
        
        // Draw police
        this.minimapCtx.fillStyle = '#ff0000';
        for (const cop of this.game.police) {
            const copX = cop.x * scale;
            const copY = cop.y * scale;
            this.minimapCtx.fillRect(copX - 1, copY - 1, 2, 2);
        }
        
        // Draw vehicles
        this.minimapCtx.fillStyle = '#ffff00';
        for (const vehicle of this.game.vehicles) {
            const vehicleX = vehicle.x * scale;
            const vehicleY = vehicle.y * scale;
            this.minimapCtx.fillRect(vehicleX - 1, vehicleY - 1, 2, 2);
        }
        
        // Draw pedestrians
        this.minimapCtx.fillStyle = '#ff69b4';
        for (const ped of this.game.pedestrians) {
            const pedX = ped.x * scale;
            const pedY = ped.y * scale;
            this.minimapCtx.fillRect(pedX - 0.5, pedY - 0.5, 1, 1);
        }
    }
    
    renderHealthBar(ctx, x, y, width, height, current, max, color = '#00ff00') {
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);
        
        // Health
        const healthPercent = current / max;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * healthPercent, height);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }
    
    renderCrosshair(ctx, x, y, size = 10) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.stroke();
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();
    }
    
    renderMessage(ctx, message, x, y, color = '#fff', fontSize = 16) {
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(message, x, y);
        ctx.textAlign = 'left';
    }
    
    renderDamageIndicator(ctx, x, y, damage) {
        ctx.fillStyle = '#ff0000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`-${damage}`, x, y);
        ctx.textAlign = 'left';
    }
    
    renderWantedStars(ctx, x, y, level) {
        const starSize = 8;
        const spacing = 12;
        const totalWidth = (level * spacing) - spacing;
        const startX = x - totalWidth / 2;
        
        for (let i = 0; i < level; i++) {
            this.renderStar(ctx, startX + i * spacing, y, starSize, '#ff0000');
        }
    }
    
    renderStar(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    showGameOver() {
        // Create game over overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = '#fff';
        overlay.style.fontSize = '24px';
        overlay.style.zIndex = '1000';
        
        overlay.innerHTML = `
            <h1>GAME OVER</h1>
            <p>Final Score: ${this.game.score}</p>
            <p>Press F5 to restart</p>
        `;
        
        document.body.appendChild(overlay);
    }
    
    showPauseMenu() {
        // Create pause menu overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = '#fff';
        overlay.style.fontSize = '20px';
        overlay.style.zIndex = '1000';
        
        overlay.innerHTML = `
            <h1>PAUSED</h1>
            <p>WASD - Move | SHIFT - Boost</p>
            <p>SPACE - Handbrake | Click - Shoot</p>
            <p>1-5 - Switch Weapons | R - Reload</p>
            <p>Press ESC to resume</p>
        `;
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    /**
     * Update weapon UI
     */
    updateWeaponUI() {
        if (!this.game.player || !this.game.player.weapon) return;
        
        const weaponInfo = this.game.player.weapon.getInfo();
        
        // Create or update weapon display
        let weaponDisplay = document.getElementById('weapon-display');
        if (!weaponDisplay) {
            weaponDisplay = document.createElement('div');
            weaponDisplay.id = 'weapon-display';
            weaponDisplay.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 1000;
            `;
            document.body.appendChild(weaponDisplay);
        }
        
        const ammoColor = weaponInfo.ammo > 0 ? '#00ff00' : '#ff0000';
        const reloadText = weaponInfo.isReloading ? 
            ` (Reloading: ${Math.round(weaponInfo.reloadProgress * 100)}%)` : '';
        
        weaponDisplay.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${weaponInfo.name}</div>
            <div style="color: ${ammoColor};">Ammo: ${weaponInfo.ammo}/${weaponInfo.maxAmmo}${reloadText}</div>
        `;
    }
    
    /**
     * Update power-up UI
     */
    updatePowerUpUI() {
        if (!this.game.player) return;
        
        const playerInfo = this.game.player.getInfo();
        const activePowerUps = playerInfo.powerUps;
        
        // Create or update power-up display
        let powerUpDisplay = document.getElementById('powerup-display');
        if (!powerUpDisplay) {
            powerUpDisplay = document.createElement('div');
            powerUpDisplay.id = 'powerup-display';
            powerUpDisplay.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 12px;
                z-index: 1000;
                max-width: 200px;
            `;
            document.body.appendChild(powerUpDisplay);
        }
        
        if (activePowerUps.length === 0) {
            powerUpDisplay.innerHTML = '<div>No Power-ups Active</div>';
            return;
        }
        
        let powerUpHTML = '<div style="font-weight: bold; margin-bottom: 5px;">Active Power-ups:</div>';
        activePowerUps.forEach(powerUp => {
            const progress = (powerUp.duration / powerUp.maxDuration) * 100;
            const color = this.getPowerUpColor(powerUp.type);
            powerUpHTML += `
                <div style="margin-bottom: 3px; color: ${color};">
                    ${this.getPowerUpIcon(powerUp.type)} ${this.getPowerUpName(powerUp.type)}
                    <div style="background: #333; height: 3px; border-radius: 2px; margin-top: 2px;">
                        <div style="background: ${color}; height: 100%; width: ${progress}%; border-radius: 2px;"></div>
                    </div>
                </div>
            `;
        });
        
        powerUpDisplay.innerHTML = powerUpHTML;
    }
    
    /**
     * Update time display from day/night cycle
     */
    updateTimeDisplay() {
        if (!this.game.dayNightCycle) return;
        
        const timeInfo = this.game.dayNightCycle.getTimeInfo();
        
        // Create or update time display
        let timeDisplay = document.getElementById('time-display');
        if (!timeDisplay) {
            timeDisplay = document.createElement('div');
            timeDisplay.id = 'time-display';
            timeDisplay.style.cssText = `
                position: fixed;
                top: 40px;
                left: 10px;
                color: ${timeInfo.isDay ? '#ffff00' : '#add8e6'};
                font-size: 16px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                z-index: 1000;
            `;
            document.body.appendChild(timeDisplay);
        }
        
        // Update time color based on day/night
        timeDisplay.style.color = timeInfo.isDay ? '#ffff00' : '#add8e6';
        
        const period = timeInfo.isDay ? '☀️' : '🌙';
        timeDisplay.textContent = `${period} ${timeInfo.timeString}`;
    }
    
    /**
     * Update progression UI display
     */
    updateProgressionUI() {
        if (!this.game.progression) return;
        
        const progression = this.game.progression;
        
        // Create or update progression display
        let progressionDisplay = document.getElementById('progression-display');
        if (!progressionDisplay) {
            progressionDisplay = document.createElement('div');
            progressionDisplay.id = 'progression-display';
            progressionDisplay.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 12px;
                z-index: 1000;
                min-width: 180px;
            `;
            document.body.appendChild(progressionDisplay);
        }
        
        const expPercent = Math.floor((progression.experience / progression.experienceToNextLevel) * 100);
        const accuracyPercent = Math.floor(progression.stats.combat.accuracy * 100);
        
        progressionDisplay.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #00ff00;">Player Progress</div>
            
            <div style="margin-bottom: 5px;">
                <div style="color: #ffff00;">💰 Money: $${progression.money}</div>
            </div>
            
            <div style="margin-bottom: 5px;">
                <div style="color: #00ffff;">🎯 Level: ${progression.level}</div>
                <div style="color: #888; font-size: 10px;">XP: ${progression.experience}/${progression.experienceToNextLevel} (${expPercent}%)</div>
                <div style="background: #333; height: 3px; border-radius: 2px; margin-top: 1px;">
                    <div style="background: #00ffff; height: 100%; width: ${expPercent}%; border-radius: 2px;"></div>
                </div>
            </div>
            
            <div style="margin-bottom: 5px;">
                <div style="color: #ff00ff;">⭐ Skill Points: ${progression.skillPoints}</div>
            </div>
            
            <div style="margin-bottom: 5px; font-size: 11px; color: #ccc;">
                <div>💀 Kills: ${progression.stats.kills.total}</div>
                <div>🎯 Accuracy: ${accuracyPercent}%</div>
                <div>🚗 Distance: ${Math.floor(progression.stats.distance.total)}m</div>
                <div>✅ Missions: ${progression.stats.missions.completed}</div>
            </div>
        `;
    }
    
    /**
     * Update compact HUD displaying money, weapon, and boost meter
     */
    updateCompactHUD() {
        if (!this.game.player) return;
        
        // Get current money from progression system
        const money = this.game.progression ? this.game.progression.money : 0;
        
        // Get current weapon info
        const weaponInfo = this.game.player.weapon ? this.game.player.weapon.getInfo() : null;
        
        // Get boost info
        const boostPercent = Math.floor((this.game.player.boost / this.game.player.maxBoost) * 100);
        const boostColor = this.game.player.boostActive ? '#00ff00' : 
                          this.game.player.boost < this.game.player.boostMinimum ? '#ff6666' : '#00ccff';
        
        // Create or update compact HUD display
        let compactHUD = document.getElementById('compact-hud');
        if (!compactHUD) {
            compactHUD = document.createElement('div');
            compactHUD.id = 'compact-hud';
            compactHUD.style.cssText = `
                position: fixed;
                top: 80px;
                left: 10px;
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-family: Arial, sans-serif;
                font-size: 13px;
                z-index: 1000;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
                min-width: 140px;
            `;
            document.body.appendChild(compactHUD);
        }
        
        // Build HUD content
        let hudContent = `
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="color: #00ff00; font-weight: bold; margin-right: 6px;">💰</span>
                <span style="color: #00ff00; font-weight: bold;">$${money}</span>
            </div>
        `;
        
        // Add boost meter
        hudContent += `
            <div style="margin-bottom: 6px;">
                <div style="display: flex; align-items: center; margin-bottom: 2px;">
                    <span style="color: ${boostColor}; margin-right: 4px; font-size: 12px;">🚀</span>
                    <span style="color: ${boostColor}; font-size: 11px; font-weight: bold;">BOOST ${boostPercent}%</span>
                    ${this.game.player.boostActive ? '<span style="color: #00ff00; font-size: 10px; margin-left: 4px;">ACTIVE</span>' : ''}
                </div>
                <div style="background: #333; height: 4px; border-radius: 2px; width: 120px;">
                    <div style="background: ${boostColor}; height: 100%; width: ${boostPercent}%; border-radius: 2px; transition: width 0.1s;"></div>
                </div>
                <div style="color: #999; font-size: 9px; margin-top: 1px;">Hold SHIFT to boost • Collect 🚀 to refill</div>
            </div>
        `;
        
        if (weaponInfo) {
            const ammoColor = weaponInfo.ammo > 0 ? '#ffff00' : '#ff6666';
            const weaponIcon = this.getWeaponIcon(weaponInfo.name);
            
            hudContent += `
                <div style="display: flex; align-items: center;">
                    <span style="margin-right: 6px;">${weaponIcon}</span>
                    <div style="flex: 1;">
                        <div style="color: #ffffff; font-size: 11px; font-weight: bold;">${weaponInfo.name}</div>
                        <div style="color: ${ammoColor}; font-size: 10px;">
                            ${weaponInfo.ammo}/${weaponInfo.maxAmmo}
                            ${weaponInfo.isReloading ? ' (Reloading...)' : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            hudContent += `
                <div style="display: flex; align-items: center;">
                    <span style="margin-right: 6px;">❌</span>
                    <span style="color: #ff6666; font-size: 11px;">No Weapon</span>
                </div>
            `;
        }
        
        compactHUD.innerHTML = hudContent;
    }
    
    /**
     * Get weapon icon based on weapon name
     * @param {string} weaponName - Name of the weapon
     * @returns {string} Weapon icon
     */
    getWeaponIcon(weaponName) {
        const icons = {
            'Pistol': '🔫',
            'Shotgun': '🔫',
            'Uzi': '🔫',
            'Rifle': '🔫',
            'Rocket Launcher': '🚀',
            // Add fallbacks for different naming conventions
            'pistol': '🔫',
            'shotgun': '🔫', 
            'uzi': '🔫',
            'rifle': '🔫',
            'rocket': '🚀'
        };
        return icons[weaponName] || '🔫';
    }

    /**
     * Get power-up color
     * @param {string} type - Power-up type
     * @returns {string} Color
     */
    getPowerUpColor(type) {
        const colors = {
            health: '#00ff00',
            ammo: '#ffff00',
            speed: '#00ffff',
            damage: '#ff0000',
            invincibility: '#ff00ff',
            rapid_fire: '#ff6600',
            multi_shot: '#6600ff',
            explosive_ammo: '#ff0066'
        };
        return colors[type] || '#ffffff';
    }
    
    /**
     * Get power-up icon
     * @param {string} type - Power-up type
     * @returns {string} Icon
     */
    getPowerUpIcon(type) {
        const icons = {
            health: '❤️',
            ammo: '🔫',
            speed: '⚡',
            damage: '💥',
            invincibility: '🛡️',
            rapid_fire: '🔥',
            multi_shot: '🎯',
            explosive_ammo: '💣'
        };
        return icons[type] || '❓';
    }
    
    /**
     * Get power-up name
     * @param {string} type - Power-up type
     * @returns {string} Name
     */
    getPowerUpName(type) {
        const names = {
            health: 'Health',
            ammo: 'Ammo',
            speed: 'Speed Boost',
            damage: 'Damage Boost',
            invincibility: 'Invincibility',
            rapid_fire: 'Rapid Fire',
            multi_shot: 'Multi Shot',
            explosive_ammo: 'Explosive Ammo'
        };
        return names[type] || 'Unknown';
    }
    
    /**
     * Show black market shop interface
     * @param {Zone} zone - Black market zone
     */
    showBlackMarketShop(zone) {
        // Create shop overlay
        const overlay = document.createElement('div');
        overlay.id = 'black-market-shop';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        // Create shop window
        const shopWindow = document.createElement('div');
        shopWindow.style.cssText = `
            background: #2a0a2a;
            border: 2px solid #800080;
            border-radius: 10px;
            width: 600px;
            max-width: 90%;
            max-height: 80%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;
        
        // Shop header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #4b0082;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
        `;
        
        const title = document.createElement('h2');
        title.textContent = 'BLACK MARKET';
        title.style.cssText = `
            margin: 0;
            color: #fff;
            font-size: 24px;
        `;
        
        const moneyDisplay = document.createElement('div');
        moneyDisplay.id = 'shop-money';
        moneyDisplay.style.cssText = `
            color: #00ff00;
            font-size: 18px;
            font-weight: bold;
        `;
        moneyDisplay.textContent = `💰 $${this.game.progression.money}`;
        
        header.appendChild(title);
        header.appendChild(moneyDisplay);
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff0000;
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 2001;
        `;
        closeButton.onclick = () => {
            document.body.removeChild(overlay);
        };
        
        // Shop content
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        `;
        
        // Generate item list
        const itemList = document.createElement('div');
        itemList.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 15px;
        `;
        
        // Available power-ups based on zone level
        const availablePowerUps = this.getAvailablePowerUps(zone);
        
        availablePowerUps.forEach(item => {
            const itemCard = this.createItemCard(item, zone);
            itemList.appendChild(itemCard);
        });
        
        content.appendChild(itemList);
        
        shopWindow.appendChild(header);
        shopWindow.appendChild(content);
        overlay.appendChild(shopWindow);
        overlay.appendChild(closeButton);
        
        document.body.appendChild(overlay);
    }
    
    /**
     * Get available power-ups for black market based on zone level
     * @param {Zone} zone - Black market zone
     * @returns {Array} Available power-ups
     */
    getAvailablePowerUps(zone) {
        // Define shop inventory
        const shopInventory = {
            health: {
                id: 'health',
                name: 'Health Pack',
                description: 'Restores 50 health points',
                price: 100,
                icon: '❤️',
                type: 'health',
                value: 50,
                duration: 0
            },
            ammo: {
                id: 'ammo',
                name: 'Ammo Pack',
                description: 'Refills current weapon ammo',
                price: 150,
                icon: '🔫',
                type: 'ammo',
                value: 0,
                duration: 0
            },
            speed: {
                id: 'speed',
                name: 'Speed Boost',
                description: 'Increases speed by 50% for 10 seconds',
                price: 200,
                icon: '⚡',
                type: 'speed',
                value: 1.5,
                duration: 10000
            },
            damage: {
                id: 'damage',
                name: 'Damage Boost',
                description: 'Doubles weapon damage for 15 seconds',
                price: 250,
                icon: '💥',
                type: 'damage',
                value: 2.0,
                duration: 15000
            },
            rapid_fire: {
                id: 'rapid_fire',
                name: 'Rapid Fire',
                description: 'Increases fire rate by 70% for 12 seconds',
                price: 300,
                icon: '🔥',
                type: 'rapid_fire',
                value: 0.3,
                duration: 12000
            },
            multi_shot: {
                id: 'multi_shot',
                name: 'Multi Shot',
                description: 'Fires 3 bullets per shot for 10 seconds',
                price: 350,
                icon: '🎯',
                type: 'multi_shot',
                value: 3,
                duration: 10000
            },
            invincibility: {
                id: 'invincibility',
                name: 'Invincibility',
                description: 'Become invincible for 8 seconds',
                price: 500,
                icon: '🛡️',
                type: 'invincibility',
                value: 1,
                duration: 8000
            },
            explosive_ammo: {
                id: 'explosive_ammo',
                name: 'Explosive Ammo',
                description: 'All bullets explode on impact for 20 seconds',
                price: 450,
                icon: '💣',
                type: 'explosive_ammo',
                value: 1,
                duration: 20000
            },
            boost_refill: {
                id: 'boost_refill',
                name: 'Boost Refill',
                description: 'Refills vehicle boost by 50 points',
                price: 120,
                icon: '🚀',
                type: 'boost_refill',
                value: 50,
                duration: 0
            }
        };
        
        // Filter available items based on zone level
        let availableItems = [
            shopInventory.health,
            shopInventory.ammo,
            shopInventory.speed,
            shopInventory.damage
        ];
        
        if (zone.level >= 2) {
            availableItems.push(
                shopInventory.rapid_fire,
                shopInventory.multi_shot
            );
        }
        
        if (zone.level >= 3) {
            availableItems.push(
                shopInventory.invincibility,
                shopInventory.explosive_ammo
            );
        }
        
        // Always include boost refill
        availableItems.push(shopInventory.boost_refill);
        
        return availableItems;
    }
    
    /**
     * Create item card for shop
     * @param {Object} item - Item data
     * @param {Zone} zone - Black market zone
     * @returns {HTMLElement} Item card element
     */
    createItemCard(item, zone) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(128, 0, 128, 0.3);
            border: 1px solid #800080;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        card.onmouseover = () => {
            card.style.background = 'rgba(128, 0, 128, 0.5)';
            card.style.transform = 'translateY(-2px)';
        };
        
        card.onmouseout = () => {
            card.style.background = 'rgba(128, 0, 128, 0.3)';
            card.style.transform = 'translateY(0)';
        };
        
        // Item icon and name
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        `;
        
        const icon = document.createElement('span');
        icon.style.cssText = `
            font-size: 24px;
            margin-right: 10px;
        `;
        icon.textContent = item.icon;
        
        const name = document.createElement('h3');
        name.style.cssText = `
            margin: 0;
            color: #fff;
            font-size: 16px;
        `;
        name.textContent = item.name;
        
        header.appendChild(icon);
        header.appendChild(name);
        
        // Item description
        const description = document.createElement('p');
        description.style.cssText = `
            color: #ccc;
            font-size: 12px;
            margin: 0 0 15px 0;
            flex: 1;
        `;
        description.textContent = item.description;
        
        // Price and purchase button
        const footer = document.createElement('div');
        footer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const price = document.createElement('div');
        price.style.cssText = `
            color: #00ff00;
            font-weight: bold;
        `;
        price.textContent = `$${item.price}`;
        
        const purchaseButton = document.createElement('button');
        purchaseButton.textContent = 'Buy';
        purchaseButton.style.cssText = `
            background: #800080;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        // Check if player can afford item
        if (this.game.progression.money < item.price) {
            purchaseButton.disabled = true;
            purchaseButton.style.background = '#666';
            purchaseButton.title = 'Insufficient funds';
        } else {
            purchaseButton.onclick = () => {
                this.purchaseItem(item, zone);
            };
        }
        
        footer.appendChild(price);
        footer.appendChild(purchaseButton);
        
        card.appendChild(header);
        card.appendChild(description);
        card.appendChild(footer);
        
        return card;
    }
    
    /**
     * Purchase item from black market
     * @param {Object} item - Item to purchase
     * @param {Zone} zone - Black market zone
     */
    purchaseItem(item, zone) {
        // Check if player has enough money
        if (this.game.progression.money < item.price) {
            this.showShopMessage('Insufficient funds!', '#ff0000');
            return;
        }
        
        // Deduct money
        this.game.progression.spendMoney(item.price, `black_market_${item.id}`);
        
        // Update money display
        const moneyDisplay = document.getElementById('shop-money');
        if (moneyDisplay) {
            moneyDisplay.textContent = `💰 $${this.game.progression.money}`;
        }
        
        // Give player the power-up
        if (this.game.powerUpManager) {
            this.game.powerUpManager.givePlayerPowerUp(item.type);
        }
        
        // Show success message
        this.showShopMessage(`Purchased ${item.name}!`, '#00ff00');
        
        // Update purchase button states
        this.updatePurchaseButtons();
        
        // Set cooldown on zone
        zone.cooldownTimer = zone.cooldownDuration;
    }
    
    /**
     * Show shop message
     * @param {string} message - Message to display
     * @param {string} color - Color of the message
     */
    showShopMessage(message, color) {
        // Remove any existing messages
        const existingMessage = document.getElementById('shop-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.id = 'shop-message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: ${color};
            padding: 15px 25px;
            border-radius: 5px;
            font-size: 18px;
            font-weight: bold;
            z-index: 2002;
            pointer-events: none;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageElement);
        
        // Remove message after animation
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }
        }, 2000);
    }
    
    /**
     * Update purchase buttons based on current money
     */
    updatePurchaseButtons() {
        // This would be called if we had a way to update all buttons dynamically
        // For now, we'll rely on page refresh when shop is reopened
    }
}
