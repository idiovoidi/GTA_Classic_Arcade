# Design Document

## Overview

The grenade weapon feature adds a throwable explosive weapon to the game that integrates seamlessly with the existing weapon system. The design leverages the current architecture including the Weapon class, PowerUp system for purchasing, and the game's physics and collision systems. The grenade will be a strategic weapon with limited ammunition that requires careful positioning and timing.

## Architecture

### Integration Points

The grenade system integrates with several existing game systems:

1. **Weapon System**: Extends the existing `Weapon` class configuration in `weapons.js`
2. **Player System**: Adds grenade throwing mechanics to the `Player` class
3. **PowerUp System**: Uses the existing `PowerUpManager` for purchasing grenades
4. **Game Loop**: Integrates with the main game update and render cycles
5. **Physics System**: Leverages existing collision detection and particle systems
6. **Audio System**: Uses the existing `AudioManager` for sound effects

### Core Components

#### 1. Grenade Weapon Configuration
- Extends the existing weapon configuration system
- Integrates with the current weapon switching mechanism
- Uses the established weapon properties pattern

#### 2. Grenade Projectile Class
- New `Grenade` class for handling physics and explosion mechanics
- Follows the same pattern as existing `Bullet` class
- Integrates with the game's collision detection system

#### 3. Purchase System Integration
- Extends the existing `PowerUp` system for grenade purchases
- Uses the established power-up configuration pattern
- Integrates with the current UI system for display

## Components and Interfaces

### Grenade Weapon Configuration

```javascript
// Addition to weapons.js getWeaponConfig method
grenade: {
    name: 'Grenade',
    damage: 80,
    explosionRadius: 100,
    fireRate: 1000, // 1 second between throws
    maxAmmo: 3, // Maximum 3 grenades
    reloadTime: 0, // No reload needed
    accuracy: 1.0,
    throwSpeed: 6,
    color: '#ff4500',
    sound: 'grenade_throw',
    explosionSound: 'grenade_explode',
    fuseTime: 2000, // 2 seconds fuse
    isThrowable: true // Flag to identify throwable weapons
}
```

### Grenade Class Interface

```javascript
class Grenade {
    constructor(game, x, y, targetX, targetY, config)
    
    // Physics methods
    calculateTrajectory(targetX, targetY)
    update(deltaTime)
    checkCollisions()
    land()
    
    // Explosion methods
    explode()
    createExplosion()
    applyDamage()
    
    // Rendering
    render(ctx)
}
```

### Player Integration Interface

```javascript
// Extensions to Player class
throwGrenade()           // New method for throwing grenades
handleGrenadeInput()     // Input handling for G key
updateGrenades(deltaTime) // Update active grenades
```

### PowerUp Integration

```javascript
// Addition to PowerUp getPowerUpConfig method
grenade: {
    name: 'Grenade',
    color: '#ff4500',
    icon: '💣',
    effect: 'grenade',
    value: 1, // 1 grenade per purchase
    duration: 0, // Instant effect
    sound: 'grenade_pickup',
    cost: 500 // Purchase cost
}
```

## Data Models

### Grenade State Model

```javascript
{
    // Position and physics
    x: number,
    y: number,
    velocity: { x: number, y: number },
    rotation: number,
    
    // State flags
    thrown: boolean,
    landed: boolean,
    active: boolean,
    
    // Timing
    fuseTimer: number,
    
    // Configuration reference
    config: WeaponConfig
}
```

### Game State Extensions

```javascript
// Addition to Game class
{
    grenades: Array<Grenade>, // Active grenades array
    
    // Existing arrays that grenades will interact with
    bullets: Array<Bullet>,
    particles: Array<Particle>,
    pedestrians: Array<Pedestrian>,
    police: Array<Police>,
    vehicles: Array<Vehicle>
}
```

## Error Handling

### Grenade-Specific Error Handling

1. **Invalid Throw Targets**: Validate mouse position and calculate safe trajectories
2. **Collision Edge Cases**: Handle grenades landing on building edges or invalid positions
3. **Explosion Radius Calculations**: Ensure damage calculations don't cause performance issues
4. **Memory Management**: Properly clean up exploded grenades and their effects

### Integration with Existing Error System

The grenade system will use the existing `ErrorWrappers` and `errorHandler` systems:

```javascript
// Grenade update with error handling
window.ErrorWrappers?.safeArrayOperation(this.grenades, (grenades) => {
    return grenades.filter((grenade, index) => {
        try {
            grenade.update(deltaTime);
            return grenade.active;
        } catch (error) {
            window.errorHandler?.handleGameError('grenade_update_error', {
                message: error.message,
                index: index
            });
            return false; // Remove problematic grenade
        }
    });
}, 'grenade') || [];
```

## Testing Strategy

### Unit Testing

1. **Grenade Physics Tests**
   - Trajectory calculation accuracy
   - Collision detection with buildings and ground
   - Fuse timer functionality
   - Explosion damage calculations

2. **Weapon Integration Tests**
   - Weapon switching to/from grenades
   - Ammo management and limits
   - Input handling for throwing

3. **Purchase System Tests**
   - Grenade purchasing mechanics
   - Inventory limits enforcement
   - Cost deduction verification

### Integration Testing

1. **Game Loop Integration**
   - Grenade updates in main game loop
   - Rendering integration
   - Performance impact assessment

2. **Audio Integration**
   - Throw sound effects
   - Explosion sound effects
   - 3D audio positioning

3. **UI Integration**
   - Grenade count display
   - Weapon switching UI updates
   - Purchase interface integration

### Performance Testing

1. **Multiple Grenades**: Test performance with maximum grenades active
2. **Explosion Effects**: Verify particle system performance during explosions
3. **Memory Usage**: Monitor memory usage with grenade objects and effects

## Implementation Considerations

### Physics Implementation

The grenade will use a simplified physics model:
- Parabolic trajectory calculation based on target position
- Gravity application for realistic arc
- Simple collision detection with buildings and ground
- Bounce mechanics for realistic behavior

### Visual Effects

1. **Grenade Rendering**: Simple circular sprite with rotation animation
2. **Fuse Warning**: Visual indicator when grenade is about to explode
3. **Explosion Effects**: Particle burst using existing particle system
4. **Trajectory Preview**: Optional visual aid showing throw arc

### Audio Integration

1. **Throw Sound**: Quick throwing sound when grenade is launched
2. **Explosion Sound**: Powerful explosion sound with 3D positioning
3. **Fuse Sound**: Optional ticking sound during fuse countdown

### Balance Considerations

1. **Damage**: 80 base damage with distance falloff for balance
2. **Radius**: 100-pixel explosion radius for strategic area coverage
3. **Cost**: 500 currency units to make grenades a strategic purchase
4. **Cooldown**: 1-second throw cooldown to prevent spam
5. **Self-Damage**: Player takes damage if too close to own explosion

### Performance Optimizations

1. **Object Pooling**: Reuse grenade objects to reduce garbage collection
2. **Culling**: Don't update grenades outside viewport
3. **Effect Limits**: Cap explosion particle count based on performance settings
4. **Collision Optimization**: Use spatial grid for efficient collision detection

## Future Enhancements

### Potential Extensions

1. **Grenade Types**: Different grenade variants (smoke, flash, incendiary)
2. **Cooking Mechanism**: Hold G key to reduce fuse time before throwing
3. **Trajectory Preview**: Visual arc showing where grenade will land
4. **Ricochet Physics**: More complex bounce mechanics off walls
5. **Environmental Destruction**: Grenades damage buildings or create craters

### Upgrade System Integration

The grenade system is designed to easily integrate with future upgrade systems:
- Increased carrying capacity
- Larger explosion radius
- Reduced fuse time
- Multiple grenade types
- Improved throwing distance