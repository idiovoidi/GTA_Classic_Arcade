# Grenade/Molotov Weapon Design Document

## Overview

This document outlines the design for adding a new throwable weapon to the game - a grenade/molotov. This weapon will be a powerful explosive that players can purchase and use strategically. The weapon will be activated with the G key, have a limited carrying capacity (max 3), and must be purchased/restocked like other power-ups.

## Architecture

The grenade weapon will be implemented as a new weapon type within the existing weapon system. The design will follow these key architectural principles:

1. **Integration with Existing Weapon System**: The grenade will be added as a new weapon type in the Weapon class configuration
2. **Throwable Mechanics**: Unlike other weapons that fire bullets, the grenade will be thrown in an arc toward the target
3. **Physics-based Trajectory**: The grenade will follow a realistic parabolic trajectory
4. **Timed Explosion**: The grenade will explode after a short delay upon landing or hitting a target
5. **Purchase System Integration**: Players must purchase grenades from the black market shop
6. **Limited Inventory**: Players can carry a maximum of 3 grenades at a time

## Weapon Implementation

### Weapon Configuration

The grenade will be added as a new weapon type in the `weapons.js` file with the following configuration:

```javascript
grenade: {
    name: 'Grenade',
    damage: 80,
    explosionRadius: 100,
    fireRate: 1000, // ms between throws
    maxAmmo: 3, // Max 3 grenades carried
    reloadTime: 0, // No reload needed
    accuracy: 1.0,
    throwSpeed: 6,
    color: '#ff4500',
    sound: 'grenade_throw',
    explosionSound: 'grenade_explode',
    fuseTime: 2000 // ms before explosion
}
```

### Grenade Class

A new `Grenade` class will be created to handle the throwable behavior:

```javascript
class Grenade {
    constructor(game, x, y, targetX, targetY, config) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.config = config;
        
        // Calculate trajectory
        this.calculateTrajectory(targetX, targetY);
        
        // Physics properties
        this.velocity = { x: 0, y: 0 };
        this.gravity = 0.2;
        this.bounce = 0.4;
        
        // State
        this.thrown = false;
        this.landed = false;
        this.fuseTimer = config.fuseTime;
        this.active = true;
        
        // Visuals
        this.rotation = 0;
        this.rotationSpeed = 0.1;
    }
    
    // Calculate throw trajectory
    calculateTrajectory(targetX, targetY) {
        // Calculate direction and distance
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Set initial velocity with arc
        this.velocity.x = nx * this.config.throwSpeed;
        this.velocity.y = ny * this.config.throwSpeed - 2; // Arc upward
    }
    
    // Update grenade physics
    update(deltaTime) {
        if (!this.active) return;
        
        if (!this.landed) {
            // Apply gravity
            this.velocity.y += this.gravity;
            
            // Update position
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Update rotation
            this.rotation += this.rotationSpeed;
            
            // Check for collisions
            this.checkCollisions();
        } else {
            // Update fuse timer
            this.fuseTimer -= deltaTime;
            if (this.fuseTimer <= 0) {
                this.explode();
            }
        }
    }
    
    // Check for collisions with ground/buildings
    checkCollisions() {
        // Simple ground collision
        if (this.y > this.game.city.height - 20) {
            this.land();
            return;
        }
        
        // Check building collisions
        for (const building of this.game.city.buildings) {
            if (this.x >= building.x && this.x <= building.x + building.width &&
                this.y >= building.y && this.y <= building.y + building.height) {
                this.land();
                return;
            }
        }
    }
    
    // Handle grenade landing
    land() {
        this.landed = true;
        this.velocity = { x: 0, y: 0 };
    }
    
    // Explode and deal damage
    explode() {
        this.active = false;
        
        // Create explosion effect
        this.createExplosion();
        
        // Deal damage to nearby entities
        this.applyDamage();
        
        // Play explosion sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound(this.config.explosionSound);
        }
    }
    
    // Create visual explosion effect
    createExplosion() {
        // Create explosion particles
        if (this.game.poolManager) {
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                const particle = this.game.poolManager.createSpecializedParticle(
                    'explosion',
                    this.x,
                    this.y
                );
                if (particle) {
                    this.game.particles.push(particle);
                }
            }
        }
    }
    
    // Apply damage to nearby entities
    applyDamage() {
        // Damage player if too close (self-damage)
        const playerDist = Math.sqrt(
            Math.pow(this.x - this.game.player.x, 2) + 
            Math.pow(this.y - this.game.player.y, 2)
        );
        if (playerDist < this.config.explosionRadius) {
            const damage = this.config.damage * (1 - playerDist / this.config.explosionRadius);
            this.game.player.takeDamage(damage);
        }
        
        // Damage pedestrians
        for (const pedestrian of this.game.pedestrians) {
            const dist = Math.sqrt(
                Math.pow(this.x - pedestrian.x, 2) + 
                Math.pow(this.y - pedestrian.y, 2)
            );
            if (dist < this.config.explosionRadius) {
                const damage = this.config.damage * (1 - dist / this.config.explosionRadius);
                pedestrian.takeDamage(damage);
            }
        }
        
        // Damage police
        for (const cop of this.game.police) {
            const dist = Math.sqrt(
                Math.pow(this.x - cop.x, 2) + 
                Math.pow(this.y - cop.y, 2)
            );
            if (dist < this.config.explosionRadius) {
                const damage = this.config.damage * (1 - dist / this.config.explosionRadius);
                cop.takeDamage(damage);
            }
        }
    }
}
```

## Integration with Player System

### Weapon Switching

The grenade will be added to the player's weapon list:

```javascript
// In Player constructor
this.weapons = ['pistol', 'shotgun', 'uzi', 'rifle', 'rocket', 'grenade'];
```

### Grenade Throwing

A new method will be added to the Player class to handle grenade throwing:

```javascript
throwGrenade() {
    if (!this.weapon || this.weapon.type !== 'grenade') return;
    
    // Check if player has grenades
    if (this.weapon.ammo <= 0) return;
    
    // Consume grenade
    this.weapon.ammo--;
    
    // Calculate target position
    const targetX = this.game.mouse.x + this.game.camera.x;
    const targetY = this.game.mouse.y + this.game.camera.y;
    
    // Create grenade
    const grenade = new Grenade(
        this.game,
        this.x,
        this.y,
        targetX,
        targetY,
        this.weapon.config
    );
    
    // Add to game grenades array
    this.game.grenades.push(grenade);
    
    // Play throw sound
    if (this.game.audioManager) {
        this.game.audioManager.playSound(this.weapon.config.sound);
    }
}
```

### Input Handling

The G key will be mapped to throw grenades in the player's input handling:

```javascript
// In Player.handleInput()
if (keys['KeyG'] && this.weapon.type === 'grenade') {
    this.throwGrenade();
}
```

## Game Integration

### Game State Management

A new array will be added to track active grenades:

```javascript
// In Game constructor
this.grenades = [];
```

### Game Update Loop

The game update loop will be modified to update grenades:

```javascript
// In Game.update()
updateGrenades(deltaTime) {
    this.grenades = this.grenades.filter(grenade => {
        grenade.update(deltaTime);
        return grenade.active;
    });
}
```

### Game Render Loop

The game render loop will be modified to render grenades:

```javascript
// In Game.render()
renderGrenades(ctx) {
    this.grenades.forEach(grenade => {
        ctx.save();
        ctx.translate(grenade.x, grenade.y);
        ctx.rotate(grenade.rotation);
        
        // Draw grenade body
        ctx.fillStyle = grenade.config.color;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw grenade pin
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-2, -10, 4, 8);
        
        // Draw fuse if about to explode
        if (grenade.landed && grenade.fuseTimer < 500) {
            ctx.fillStyle = '#ff0000';
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
}
```

## Shop Integration

### Power-up Configuration

A new power-up will be added for purchasing grenades:

```javascript
// In PowerUp.getPowerUpConfig()
grenade: {
    name: 'Grenade',
    color: '#ff4500',
    icon: '💣',
    effect: 'grenade',
    value: 1, // 1 grenade per purchase
    duration: 0,
    sound: 'grenade_pickup',
    cost: 500 // Cost in game currency
}
```

### Purchase System

The power-up system will be extended to handle grenade purchases:

```javascript
// In PowerUp.applyEffect()
case 'grenade':
    if (player.weapon && player.weapon.type === 'grenade') {
        // Add to existing grenade weapon
        player.weapon.ammo = Math.min(
            player.weapon.config.maxAmmo,
            player.weapon.ammo + this.config.value
        );
    } else {
        // Switch to grenade weapon
        player.switchWeapon(player.weapons.indexOf('grenade'));
    }
    break;
```

## UI Integration

### Weapon Display

The UI system will be updated to show grenade information:

```javascript
// In UI.getWeaponIcon()
'Grenade': '💣',
'grenade': '💣'
```

### Grenade Counter

A new UI element will display the number of grenades:

```javascript
// In UI.updateCompactHUD()
if (weaponInfo && weaponInfo.name === 'Grenade') {
    hudContent += `
        <div style="display: flex; align-items: center; margin-top: 4px;">
            <span style="margin-right: 6px;">💣</span>
            <div style="flex: 1;">
                <div style="color: #ffffff; font-size: 11px; font-weight: bold;">GRENADES</div>
                <div style="color: ${ammoColor}; font-size: 10px;">
                    ${weaponInfo.ammo}/${weaponInfo.maxAmmo} available
                </div>
            </div>
        </div>
    `;
}
```

## Testing

### Unit Tests

Unit tests will be created to verify grenade functionality:

1. **Trajectory Testing**: Verify grenades follow correct parabolic paths
2. **Collision Detection**: Test collision with buildings and ground
3. **Damage Application**: Verify damage is correctly applied to entities within radius
4. **Fuse Timing**: Confirm grenades explode after correct delay
5. **Inventory Management**: Test grenade purchasing and carrying limits

### Integration Tests

Integration tests will verify:

1. **Weapon Switching**: Confirm player can switch to grenade weapon
2. **Throwing Mechanics**: Test that G key throws grenades correctly
3. **Shop Integration**: Verify grenades can be purchased from black market
4. **UI Updates**: Confirm grenade count displays correctly
5. **Audio Integration**: Test throw and explosion sounds play correctly

## Implementation Plan

1. **Create Grenade Class**: Implement the grenade physics and explosion mechanics
2. **Add Weapon Configuration**: Add grenade to weapon configurations
3. **Integrate with Player**: Add grenade throwing functionality to player
4. **Game Integration**: Add grenade tracking to game state
5. **Shop Integration**: Add grenade purchase option to black market
6. **UI Updates**: Add grenade display to HUD
7. **Audio Integration**: Add throw and explosion sounds
8. **Testing**: Create unit and integration tests
9. **Balancing**: Adjust damage, explosion radius, and cost for gameplay balance