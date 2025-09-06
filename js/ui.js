class UI {
    constructor(game) {
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
}
