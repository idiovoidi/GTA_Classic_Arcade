# Enemy Tank Implementation Design

## Overview

This document outlines the design for implementing a new enemy tank class that appears when the player's wanted level reaches 6. The tank will be a devastating enemy that poses a significant threat to the player, requiring careful design to balance gameplay.

## Architecture

The tank will be implemented as a new class that extends the existing vehicle system. The implementation will follow the same patterns used by other vehicles in the game while adding unique behaviors and characteristics specific to a military tank.

### Class Structure

```
src/
└── entities/
    └── vehicles/
        └── Tank.js
```

The Tank class will inherit from the base Vehicle class to leverage existing functionality while overriding specific methods for tank-specific behavior.

## Data Models

### Tank Vehicle Type Definition

The tank will be defined as a new entry in the VEHICLE_TYPES constant:

```javascript
TANK: {
    name: 'Tank',
    width: 60, // Length of the tank (front to back)
    height: 30, // Width of the tank (side to side)
    radius: 25,
    health: 300, // Much higher than regular vehicles
    mass: 8.0, // Very heavy
    maxSpeed: 0.8, // Slow but powerful
    acceleration: 0.03,
    turnSpeed: 0.01, // Turns very slowly
    colors: ['#4a4a4a', '#333333', '#555555'], // Military colors
    spawnWeight: 0 // Never spawns randomly, only at wanted level 6
}
```

### Tank Class Properties

The Tank class will have the following additional properties beyond the standard Vehicle:

| Property | Type | Description |
|----------|------|-------------|
| `weaponCooldown` | number | Time until next shot can be fired |
| `lastShot` | number | Timestamp of last shot |
| `turretAngle` | number | Angle of the tank turret |
| `primaryWeaponRange` | number | Maximum range of primary weapon |
| `armorThickness` | number | Additional damage reduction |

## Business Logic Layer

### Spawning Logic

The tank will be spawned through the existing police response system when the wanted level reaches 6:

1. In the `spawnPoliceWithResponse` method in `game.js`, add logic to spawn tanks when `wantedLevel === 6`
2. Tanks will spawn using the 'roadblock' method to create ambush scenarios
3. Limit to 2-3 tanks maximum on screen at once to prevent performance issues

### AI Behavior

The tank AI will have unique behaviors:

1. **Movement**: 
   - Moves slowly but deliberately
   - Prioritizes positioning for optimal firing angles
   - Avoids tight spaces where maneuverability is limited

2. **Combat**:
   - Equipped with a powerful cannon with long range
   - Fires explosive shells that deal area damage
   - Has a secondary machine gun for close-range defense
   - Extremely accurate targeting system

3. **Defensive**:
   - Heavy armor reduces damage from most weapons
   - Nearly immune to small arms fire
   - Vulnerable to specific attack vectors (top, rear)

### Combat Mechanics

1. **Primary Weapon**: High-caliber cannon
   - Damage: 100-150 per shot
   - Range: 500 pixels
   - Cooldown: 3-5 seconds
   - Creates explosion effect on impact

2. **Secondary Weapon**: Machine gun
   - Damage: 15-25 per shot
   - Range: 200 pixels
   - Cooldown: 0.2 seconds
   - Effective against infantry and light vehicles

3. **Armor System**:
   - Front armor: 80% damage reduction
   - Side armor: 60% damage reduction
   - Rear armor: 40% damage reduction
   - Top: 10% damage reduction (weak point)

## API Endpoints Reference

Not applicable for this client-side game feature.

## Middleware & Interceptors

Not applicable for this client-side game feature.

## Testing

### Unit Tests

1. **Tank Creation Test**
   - Verify tank is properly instantiated with correct properties
   - Confirm tank inherits from Vehicle class
   - Validate tank-specific properties are set correctly

2. **Movement Tests**
   - Test tank movement speed is slower than other vehicles
   - Verify tank turning mechanics work correctly
   - Confirm tank stays within game boundaries

3. **Combat Tests**
   - Test primary weapon damage and range
   - Verify secondary weapon functionality
   - Confirm armor system reduces damage appropriately
   - Test explosion effects on impact

4. **AI Behavior Tests**
   - Verify tank targets player correctly
   - Test tank positioning behavior
   - Confirm tank switches between weapons appropriately
   - Validate tank spawning at wanted level 6

### Integration Tests

1. **Spawning Integration**
   - Test that tanks spawn correctly when wanted level reaches 6
   - Verify tanks don't spawn at lower wanted levels
   - Confirm maximum tank limit is enforced

2. **Game Balance Tests**
   - Test that tanks provide appropriate challenge at wanted level 6
   - Verify tanks can be defeated with proper strategy
   - Confirm tanks don't break game performance

## Visual Design

### Rendering

The tank will have a distinctive military appearance:

1. **Base Structure**:
   - Rectangular main body with sloped armor
   - Rotating turret with main cannon
   - Caterpillar tracks on both sides
   - Military green/dark gray color scheme

2. **Visual Effects**:
   - Muzzle flash when firing
   - Smoke trails from exhaust
   - Damage indicators (scorch marks, damaged tracks)
   - Explosion effects for destroyed tanks

3. **Animations**:
   - Turret rotation to track targets
   - Caterpillar movement animation
   - Damage state transitions

### Level of Detail (LOD)

To maintain performance with the heavy tank model:

1. **High Detail** (0-200px): Full tank with all visual elements
2. **Medium Detail** (200-400px): Simplified tank model
3. **Low Detail** (400-600px): Basic rectangular shape
4. **Skip** (600px+): Not rendered

## Audio Design

### Sound Effects

1. **Movement Sounds**:
   - Deep engine rumble
   - Caterpillar track sounds
   - Mechanical grinding when turning

2. **Combat Sounds**:
   - Cannon firing with distinctive boom
   - Shell whistling through air
   - Explosion on impact
   - Machine gun rapid fire

3. **State Sounds**:
   - Alarm when targeting player
   - Damage sounds when hit
   - Destruction sounds when killed

## Performance Considerations

1. **Object Pooling**: 
   - Use object pooling for tank shells and explosion effects
   - Reuse tank instances when possible

2. **Collision Optimization**:
   - Use spatial grid for efficient collision detection
   - Simplified collision shapes for performance

3. **Rendering Optimization**:
   - Implement LOD system as described above
   - Cull off-screen tanks

## Implementation Plan

### Phase 1: Core Implementation
1. Create Tank.js class extending Vehicle
2. Implement tank-specific properties and methods
3. Add tank to VEHICLE_TYPES
4. Implement basic rendering

### Phase 2: AI and Combat
1. Implement tank AI behavior
2. Add primary and secondary weapons
3. Implement armor system
4. Add combat sound effects

### Phase 3: Polish and Balance
1. Fine-tune tank stats for balanced gameplay
2. Add visual effects and animations
3. Implement LOD system
4. Optimize performance

### Phase 4: Testing
1. Unit testing of all tank functionality
2. Integration testing with game systems
3. Balance testing and adjustments
4. Performance testing

## Dependencies

1. **Existing Systems**:
   - Vehicle system (inheritance)
   - Police spawning system (integration)
   - Audio system (sound effects)
   - Particle system (explosions, effects)
   - Spatial grid (collision detection)

2. **New Assets**:
   - Tank sprites/visuals
   - Sound effects for tank movement and weapons
   - Explosion particle effects

## Risk Assessment

1. **Performance Impact**: Tanks are computationally expensive; mitigation through LOD and object pooling
2. **Game Balance**: Tanks could make wanted level 6 unbeatable; mitigation through careful stat tuning
3. **Integration Issues**: Spawning system integration could conflict with existing police; mitigation through thorough testing

## Success Metrics

1. Tanks spawn correctly at wanted level 6
2. Tanks provide appropriate challenge without being unbeatable
3. Game performance remains stable with tanks present
4. Players can develop strategies to defeat tanks
5. Audio and visual feedback is clear and satisfying