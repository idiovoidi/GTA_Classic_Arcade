/**
 * Spawn Zones and Safe Areas System for GTA Clone
 * Implements strategic gameplay areas with special properties
 */

// Zone type definitions
const ZONE_TYPES = {
    SAFE_HOUSE: {
        name: 'Safe House',
        color: '#00ff00',
        effect: 'refuge',
        description: 'Police-free zone for recovery',
        size: { width: 80, height: 80 },
        spawnWeight: 5
    },
    HOSPITAL: {
        name: 'Hospital',
        color: '#ff0080',
        effect: 'health',
        description: 'Restores player health',
        size: { width: 100, height: 120 },
        spawnWeight: 3
    },
    POLICE_STATION: {
        name: 'Police Station',
        color: '#0000ff',
        effect: 'danger',
        description: 'High police presence area',
        size: { width: 120, height: 100 },
        spawnWeight: 4
    },
    WEAPON_SHOP: {
        name: 'Gun Shop',
        color: '#ffff00',
        effect: 'weapons',
        description: 'Purchase weapons and ammo',
        size: { width: 60, height: 80 },
        spawnWeight: 6
    },
    GARAGE: {
        name: 'Garage',
        color: '#ff8800',
        effect: 'vehicles',
        description: 'Spawn and repair vehicles',
        size: { width: 100, height: 80 },
        spawnWeight: 7
    },
    BLACK_MARKET: {
        name: 'Black Market',
        color: '#800080',
        effect: 'items',
        description: 'Special items and power-ups',
        size: { width: 70, height: 70 },
        spawnWeight: 2
    },
    SPAWN_POINT: {
        name: 'Spawn Point',
        color: '#00ffff',
        effect: 'spawn',
        description: 'Player respawn location',
        size: { width: 40, height: 40 },
        spawnWeight: 8
    }
};

class Zone {
    constructor(game, x, y, type, level = 1) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = level;
        this.config = ZONE_TYPES[type];

        // Zone properties
        this.width = this.config.size.width + (level * 10);
        this.height = this.config.size.height + (level * 10);
        this.color = this.config.color;
        this.name = this.config.name;
        this.effect = this.config.effect;
        this.description = this.config.description;

        // State management
        this.active = true;
        this.playerInside = false;
        this.cooldownTimer = 0;
        this.cooldownDuration = 5000; // 5 seconds between uses

        // Visual effects
        this.pulseTimer = 0;
        this.pulseIntensity = 0;
        this.showLabel = false;
        this.labelTimer = 0;

        // Create actual building for this zone (except spawn points)
        this.building = null;
        if (type !== 'SPAWN_POINT') {
            this.createZoneBuilding();
        }

        // Zone-specific properties
        this.setupZoneSpecifics();
    }

    /**
     * Create an actual building for this zone
     */
    createZoneBuilding() {
        // Create a Building instance for this zone
        this.building = new Building(this.game, this.x, this.y, this.width, this.height);

        // Set building type based on zone
        switch (this.type) {
            case 'HOSPITAL':
                this.building.buildingType = 'commercial';
                this.building.colorScheme = ['#ff0080', '#ff4da6', '#ff80bf'];
                break;
            case 'POLICE_STATION':
                this.building.buildingType = 'commercial';
                this.building.colorScheme = ['#0000ff', '#3333ff', '#6666ff'];
                break;
            case 'WEAPON_SHOP':
                this.building.buildingType = 'commercial';
                this.building.colorScheme = ['#ffff00', '#ffff66', '#ffff99'];
                break;
            case 'GARAGE':
                this.building.buildingType = 'industrial';
                this.building.colorScheme = ['#ff8800', '#ffaa33', '#ffcc66'];
                break;
            case 'BLACK_MARKET':
                this.building.buildingType = 'commercial';
                this.building.colorScheme = ['#800080', '#9933cc', '#b366ff'];
                break;
            case 'SAFE_HOUSE':
                this.building.buildingType = 'residential';
                this.building.colorScheme = ['#00ff00', '#33ff33', '#66ff66'];
                break;
        }

        // Regenerate features with new color scheme
        this.building.generateFeatures();

        // Add building to city's building list for collision detection
        if (this.game.city && this.game.city.buildings) {
            this.game.city.buildings.push(this.building);
        }
    }

    setupZoneSpecifics() {
        switch (this.type) {
            case 'SAFE_HOUSE':
                this.healRate = 2 * this.level; // Health per second
                this.wantedDecayRate = 0.5 * this.level; // Heat reduction per second
                break;
            case 'HOSPITAL':
                this.healAmount = 50 + (this.level * 25);
                this.cost = 100 * this.level;
                break;
            case 'POLICE_STATION':
                this.alertRadius = 200 + (this.level * 50);
                this.spawnChance = 0.02 + (this.level * 0.01);
                break;
            case 'WEAPON_SHOP':
                this.weaponTypes = ['pistol', 'shotgun', 'uzi'];
                if (this.level >= 2) this.weaponTypes.push('rifle');
                if (this.level >= 3) this.weaponTypes.push('rocket');
                break;
            case 'GARAGE':
                this.vehicleTypes = ['SEDAN'];
                if (this.level >= 2) this.vehicleTypes.push('SPORTS_CAR', 'TRUCK');
                if (this.level >= 3) this.vehicleTypes.push('MOTORCYCLE');
                this.repairCost = 50 * this.level;
                break;
            case 'BLACK_MARKET':
                this.powerUpTypes = ['health', 'speed', 'damage'];
                if (this.level >= 2) this.powerUpTypes.push('rapid_fire', 'multi_shot');
                if (this.level >= 3) this.powerUpTypes.push('invincibility', 'explosive_ammo');
                break;
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        // Update cooldown
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= deltaTime;
        }

        // Update visual effects
        this.pulseTimer += deltaTime * 0.003;
        this.pulseIntensity = Math.sin(this.pulseTimer) * 0.3 + 0.7;

        // Check player interaction
        const wasInside = this.playerInside;
        this.playerInside = this.checkPlayerInside();

        if (this.playerInside && !wasInside) {
            this.onPlayerEnter();
        } else if (!this.playerInside && wasInside) {
            this.onPlayerExit();
        }

        if (this.playerInside) {
            this.onPlayerStay(deltaTime);
        }

        // Zone-specific updates
        this.updateZoneSpecifics(deltaTime);

        // Update label display
        if (this.showLabel) {
            this.labelTimer += deltaTime;
            if (this.labelTimer > 3000) { // Show for 3 seconds
                this.showLabel = false;
                this.labelTimer = 0;
            }
        }
    }

    updateZoneSpecifics(deltaTime) {
        switch (this.type) {
            case 'POLICE_STATION':
                // Spawn police occasionally
                if (Math.random() < this.spawnChance * (deltaTime / 1000)) {
                    this.spawnPolicePatrol();
                }
                break;

            case 'SAFE_HOUSE':
                // Continuous healing and wanted level reduction
                if (this.playerInside && this.cooldownTimer <= 0) {
                    this.applyRefugeEffects(deltaTime);
                }
                break;
        }
    }

    checkPlayerInside() {
        const player = this.game.player;
        return player.x >= this.x &&
            player.x <= this.x + this.width &&
            player.y >= this.y &&
            player.y <= this.y + this.height;
    }

    onPlayerEnter() {
        this.showLabel = true;
        this.labelTimer = 0;

        // Record zone visit in progression system
        if (this.game.progression) {
            this.game.progression.recordZoneVisit(this.type);
        }

        // Zone-specific enter effects
        switch (this.type) {
            case 'SAFE_HOUSE':
                this.game.addTextEffect(this.x + this.width / 2, this.y - 20,
                    'SAFE ZONE', '#00ff00', 2000);
                break;
            case 'POLICE_STATION':
                this.game.addTextEffect(this.x + this.width / 2, this.y - 20,
                    'DANGER ZONE', '#ff0000', 2000);
                // Immediate wanted level increase
                if (this.game.wantedSystem.level > 0) {
                    this.game.addHeat(20, 'police_station_trespass');
                }
                break;
            case 'HOSPITAL':
                this.game.addTextEffect(this.x + this.width / 2, this.y - 20,
                    'HOSPITAL', '#ff0080', 2000);
                break;
        }

        // Play zone enter sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('zone_enter', this.x, this.y);
        }
    }

    onPlayerExit() {
        // Zone-specific exit effects
        if (this.type === 'SAFE_HOUSE' && this.cooldownTimer <= 0) {
            this.cooldownTimer = this.cooldownDuration;
        }
    }

    onPlayerStay(deltaTime) {
        // Zone-specific stay effects
        switch (this.type) {
            case 'HOSPITAL':
                if (this.game.keys['KeyE'] && this.cooldownTimer <= 0) {
                    this.useHospital();
                }
                break;
            case 'WEAPON_SHOP':
                if (this.game.keys['KeyE'] && this.cooldownTimer <= 0) {
                    this.openWeaponShop();
                }
                break;
            case 'GARAGE':
                if (this.game.keys['KeyE'] && this.cooldownTimer <= 0) {
                    this.openGarage();
                }
                break;
            case 'BLACK_MARKET':
                if (this.game.keys['KeyE'] && this.cooldownTimer <= 0) {
                    this.openBlackMarket();
                }
                break;
        }
    }

    applyRefugeEffects(deltaTime) {
        const player = this.game.player;

        // Heal player
        if (player.health < player.maxHealth) {
            player.health = Math.min(player.maxHealth,
                player.health + this.healRate * (deltaTime / 1000));
        }

        // Reduce wanted level
        if (this.game.wantedSystem.level > 0) {
            this.game.wantedSystem.heatPoints = Math.max(0,
                this.game.wantedSystem.heatPoints - this.wantedDecayRate * (deltaTime / 1000));
        }
    }

    useHospital() {
        const player = this.game.player;

        if (player.health >= player.maxHealth) {
            this.game.addTextEffect(this.x + this.width / 2, this.y + this.height + 10,
                'Already at full health!', '#ffff00', 1500);
            return;
        }

        // Record service use in progression
        if (this.game.progression) {
            this.game.progression.recordZoneService('hospital');
        }

        // Heal player
        player.health = Math.min(player.maxHealth, player.health + this.healAmount);
        this.cooldownTimer = this.cooldownDuration;

        // Visual effect
        this.game.addTextEffect(this.x + this.width / 2, this.y + this.height + 10,
            `+${this.healAmount} Health`, '#00ff00', 2000);

        // Play healing sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('heal', this.x, this.y);
        }
    }

    openWeaponShop() {
        // Simple weapon upgrade
        const player = this.game.player;
        const nextWeaponIndex = (player.currentWeaponIndex + 1) % this.weaponTypes.length;

        if (nextWeaponIndex < this.weaponTypes.length) {
            player.switchWeapon(nextWeaponIndex);
            this.cooldownTimer = this.cooldownDuration;

            this.game.addTextEffect(this.x + this.width / 2, this.y + this.height + 10,
                `Weapon Upgraded!`, '#ffff00', 2000);

            if (this.game.audioManager) {
                this.game.audioManager.playSound('weapon_pickup', this.x, this.y);
            }
        }
    }

    openGarage() {
        // Spawn a vehicle nearby
        const spawnX = this.x + this.width + 20;
        const spawnY = this.y + this.height / 2;

        const vehicleType = this.vehicleTypes[Math.floor(Math.random() * this.vehicleTypes.length)];
        this.game.spawnSpecificVehicle(vehicleType, spawnX, spawnY);

        this.cooldownTimer = this.cooldownDuration;

        this.game.addTextEffect(this.x + this.width / 2, this.y + this.height + 10,
            `${vehicleType} spawned!`, '#ff8800', 2000);

        if (this.game.audioManager) {
            this.game.audioManager.playSound('vehicle_spawn', this.x, this.y);
        }
    }

    openBlackMarket() {
        // Show black market shop UI instead of giving random power-up
        if (this.game.ui) {
            this.game.ui.showBlackMarketShop(this);
        } else {
            // Fallback to original behavior
            if (this.game.powerUpManager) {
                const powerUpType = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
                this.game.powerUpManager.givePlayerPowerUp(powerUpType);

                this.cooldownTimer = this.cooldownDuration;

                this.game.addTextEffect(this.x + this.width / 2, this.y + this.height + 10,
                    `Power-up acquired!`, '#800080', 2000);

                if (this.game.audioManager) {
                    this.game.audioManager.playSound('powerup_pickup', this.x, this.y);
                }
            }
        }
    }

    spawnPolicePatrol() {
        const spawnX = this.x + Math.random() * this.width;
        const spawnY = this.y + Math.random() * this.height;

        const cop = new Police(this.game, spawnX, spawnY);
        cop.state = 'patrolling';
        cop.alertLevel = 20; // Slightly alert

        this.game.police.push(cop);
    }

    render(ctx, lodLevel = 'high') {
        if (lodLevel === 'skip') return;

        // Render the actual building first (if it exists)
        if (this.building) {
            this.building.render(ctx);
        }

        ctx.save();

        // Draw zone highlight overlay (subtle)
        ctx.globalAlpha = 0.15 * this.pulseIntensity;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw zone border (more visible)
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]); // Dashed line
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.setLineDash([]); // Reset dash

        if (lodLevel === 'high') {
            // Draw zone icon/symbol on the roof
            this.renderZoneIcon(ctx);

            // Draw zone label if visible
            if (this.showLabel || this.playerInside) {
                this.renderZoneLabel(ctx);
            }

            // Draw interaction prompt
            if (this.playerInside && this.canInteract()) {
                this.renderInteractionPrompt(ctx);
            }
        }

        ctx.restore();
    }

    renderZoneIcon(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const iconSize = Math.min(this.width, this.height) * 0.25;

        // Draw icon with background for visibility
        ctx.save();
        ctx.globalAlpha = 1.0;

        // Background circle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, iconSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.fillStyle = this.color;
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let icon = '?';
        switch (this.type) {
            case 'SAFE_HOUSE': icon = '🏠'; break;
            case 'HOSPITAL': icon = '🏥'; break;
            case 'POLICE_STATION': icon = '🚔'; break;
            case 'WEAPON_SHOP': icon = '🔫'; break;
            case 'GARAGE': icon = '🔧'; break;
            case 'BLACK_MARKET': icon = '🛒'; break;
            case 'SPAWN_POINT': icon = '📍'; break;
        }

        ctx.fillText(icon, centerX, centerY);
        ctx.restore();
    }

    renderZoneLabel(ctx) {
        const centerX = this.x + this.width / 2;
        const labelY = this.y - 10;

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // Draw background
        const textWidth = ctx.measureText(this.name).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(centerX - textWidth / 2 - 5, labelY - 20, textWidth + 10, 20);

        // Draw text
        ctx.fillStyle = this.color;
        ctx.fillText(this.name, centerX, labelY);
    }

    renderInteractionPrompt(ctx) {
        const centerX = this.x + this.width / 2;
        const promptY = this.y + this.height + 30;

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const prompt = 'Press E to interact';
        const textWidth = ctx.measureText(prompt).width;

        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(centerX - textWidth / 2 - 5, promptY, textWidth + 10, 16);

        // Draw text
        ctx.fillStyle = '#ffff00';
        ctx.fillText(prompt, centerX, promptY + 2);
    }

    canInteract() {
        return this.cooldownTimer <= 0 &&
            ['HOSPITAL', 'WEAPON_SHOP', 'GARAGE', 'BLACK_MARKET'].includes(this.type);
    }

    getInfo() {
        return {
            name: this.name,
            type: this.type,
            description: this.description,
            level: this.level,
            cooldown: Math.max(0, this.cooldownTimer),
            canInteract: this.canInteract()
        };
    }
}

class ZoneManager {
    constructor(game) {
        this.game = game;
        this.zones = [];
        this.maxZones = 20;
        this.spawnTimer = 0;
        this.spawnInterval = 10000; // 10 seconds between zone spawns
    }

    init() {
        // Create initial spawn points
        this.createSpawnPoints();

        // Create some initial zones
        this.createInitialZones();
    }

    createSpawnPoints() {
        const spawnLocations = [
            { x: 100, y: 100 },
            { x: this.game.city.width - 200, y: 100 },
            { x: 100, y: this.game.city.height - 200 },
            { x: this.game.city.width - 200, y: this.game.city.height - 200 },
            { x: this.game.city.width / 2, y: this.game.city.height / 2 }
        ];

        spawnLocations.forEach(location => {
            this.createZone(location.x, location.y, 'SPAWN_POINT');
        });
    }

    createInitialZones() {
        const initialZones = [
            { type: 'SAFE_HOUSE', count: 2 },
            { type: 'HOSPITAL', count: 2 },
            { type: 'POLICE_STATION', count: 3 },
            { type: 'WEAPON_SHOP', count: 3 },
            { type: 'GARAGE', count: 4 },
            { type: 'BLACK_MARKET', count: 1 }
        ];

        initialZones.forEach(zoneGroup => {
            for (let i = 0; i < zoneGroup.count; i++) {
                this.createRandomZone(zoneGroup.type);
            }
        });
    }

    createRandomZone(type = null) {
        if (this.zones.length >= this.maxZones) return;

        // Select random zone type if not specified
        if (!type) {
            const types = Object.keys(ZONE_TYPES);
            const weights = types.map(t => ZONE_TYPES[t].spawnWeight);
            type = this.selectWeightedRandom(types, weights);
        }

        // Find suitable spawn location
        const location = this.findSuitableLocation(type);
        if (location) {
            this.createZone(location.x, location.y, type);
        }
    }

    createZone(x, y, type, level = 1) {
        const zone = new Zone(this.game, x, y, type, level);
        this.zones.push(zone);
        return zone;
    }

    findSuitableLocation(type) {
        const config = ZONE_TYPES[type];
        const attempts = 50;

        for (let i = 0; i < attempts; i++) {
            const x = Math.random() * (this.game.city.width - config.size.width);
            const y = Math.random() * (this.game.city.height - config.size.height);

            // Check if location is suitable
            if (this.isLocationSuitable(x, y, config.size)) {
                return { x, y };
            }
        }

        return null; // No suitable location found
    }

    isLocationSuitable(x, y, size) {
        // Check if overlaps with roads
        if (this.game.city && this.game.city.roads) {
            for (const road of this.game.city.roads) {
                if (this.rectOverlap(
                    x, y, size.width, size.height,
                    road.x, road.y, road.width, road.height
                )) {
                    return false; // Overlaps with road
                }
            }
        }

        // Check if overlaps with existing buildings
        if (this.game.city && this.game.city.buildings) {
            for (const building of this.game.city.buildings) {
                if (this.rectOverlap(
                    x, y, size.width, size.height,
                    building.x, building.y, building.width, building.height
                )) {
                    return false; // Overlaps with building
                }
            }
        }

        // Check minimum distance from other zones
        const minDistance = 150;

        for (const zone of this.zones) {
            const dx = Math.abs((x + size.width / 2) - (zone.x + zone.width / 2));
            const dy = Math.abs((y + size.height / 2) - (zone.y + zone.height / 2));
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                return false;
            }
        }

        // Check for nearby road access (must be close but not on road)
        let hasRoadAccess = false;
        if (this.game.city && this.game.city.roads) {
            for (const road of this.game.city.roads) {
                const centerX = x + size.width / 2;
                const centerY = y + size.height / 2;
                const roadCenterX = road.x + road.width / 2;
                const roadCenterY = road.y + road.height / 2;

                const distanceToRoad = Math.sqrt(
                    Math.pow(centerX - roadCenterX, 2) +
                    Math.pow(centerY - roadCenterY, 2)
                );

                // Must be within 100 units of a road (but not on it)
                if (distanceToRoad < 100) {
                    hasRoadAccess = true;
                    break;
                }
            }
        }

        return hasRoadAccess;
    }

    /**
     * Check if two rectangles overlap
     */
    rectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    selectWeightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }

        return items[0]; // Fallback
    }

    update(deltaTime) {
        // Update existing zones
        this.zones.forEach(zone => zone.update(deltaTime));

        // Spawn new zones occasionally
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval && this.zones.length < this.maxZones) {
            this.createRandomZone();
            this.spawnTimer = 0;
        }

        // Remove inactive zones
        this.zones = this.zones.filter(zone => zone.active);
    }

    render(ctx, lodLevel = 'high') {
        this.zones.forEach(zone => zone.render(ctx, lodLevel));
    }

    getZoneAt(x, y) {
        return this.zones.find(zone =>
            x >= zone.x && x <= zone.x + zone.width &&
            y >= zone.y && y <= zone.y + zone.height
        );
    }

    getActiveZones() {
        return this.zones.filter(zone => zone.active);
    }

    getZoneStats() {
        const stats = {};
        this.zones.forEach(zone => {
            if (!stats[zone.type]) {
                stats[zone.type] = 0;
            }
            stats[zone.type]++;
        });
        return stats;
    }
}