# Building System Documentation

## Overview

This document describes the implementation of the destructible building system for the GTA-inspired game. The system implements destructible building walls with invincible support beams, following a component-based architecture.

## Architecture

The building system follows a modular component-based architecture:

```
src/
├── entities/
│   └── world/
│       └── Building.js             <-- Main building entity definition
├── components/
│   ├── base/
│   │   └── BuildingCollider.js     <-- Physics collision component
│   └── behavior/
│       ├── DestructibleWall.js     <-- Destructible wall behavior component
│       └── SupportBeam.js          <-- Invincible support beam behavior component
```

## Components

### Building.js (Main Building Entity)

The main building entity serves as a container for all building components and manages the overall structure.

**Properties:**
- `x`, `y`: Position of the building
- `width`, `height`: Dimensions of the building
- `walls`: Array of DestructibleWall components
- `beams`: Array of SupportBeam components
- `collider`: BuildingCollider component for physics interactions
- `isDestroyed`: Flag indicating if the building has collapsed
- `structuralIntegrity`: Current structural integrity (0-100)

**Methods:**
- `initialize()`: Sets up the building structure with walls and beams
- `update(deltaTime)`: Updates all building components
- `render(ctx)`: Renders the building and all its components
- `takeDamage(damage, point)`: Distributes damage to appropriate components
- `checkIntegrity()`: Checks if building should collapse
- `collapse()`: Handles building collapse
- `createImpactEffect(x, y)`: Creates visual effects for beam impacts
- `createCollapseEffect()`: Creates visual effects for building collapse

### BuildingCollider.js (Physics Collision Component)

Handles all physics interactions for the building.

**Properties:**
- `entity`: Reference to the parent building

**Methods:**
- `update(deltaTime)`: Updates collider state
- `checkCollision(other)`: Checks for collisions with other entities
- `resolveCollision(other)`: Resolves collision responses

### DestructibleWall.js (Destructible Wall Component)

Represents destructible wall segments of the building.

**Properties:**
- `x`, `y`: Position of the wall segment
- `width`, `height`: Dimensions of the wall segment
- `health`: Current health of the wall
- `maxHealth`: Maximum health of the wall
- `isDestroyed`: Flag indicating if the wall is destroyed
- `color`: Current color based on health
- `destroyedColor`: Color when destroyed
- `destructionEffect`: Visual effect for destruction

**Methods:**
- `takeDamage(damage)`: Reduces wall health and handles destruction
- `destroy()`: Marks wall as destroyed
- `update(deltaTime)`: Updates wall state
- `render(ctx)`: Renders the wall segment

### SupportBeam.js (Invincible Support Beam Component)

Represents invincible structural support elements that maintain building integrity.

**Properties:**
- `x`, `y`: Position of the beam
- `width`, `height`: Dimensions of the beam
- `isInvincible`: Always true for support beams
- `structuralIntegrity`: Strength of the beam (affects building stability)
- `color`: Color of the beam
- `glowColor`: Color for glow effect
- `isGlowing`: Flag for glow effect
- `glowTimer`: Timer for glow effect

**Methods:**
- `update(deltaTime)`: Updates beam state
- `render(ctx)`: Renders the beam
- `triggerGlow()`: Triggers glow effect when hit

## Integration

### Physics Integration

Buildings integrate with the existing physics system through:
1. The `BuildingCollider` component that uses existing collision detection methods
2. Implementation of `checkRectCollision` from the `Physics` class
3. Collision response handling for bullets, vehicles, and player interactions

### Rendering Integration

Buildings are rendered as part of the city rendering system:
1. Buildings are rendered after roads but before entities
2. Use existing camera and viewport culling systems
3. Implement level-of-detail rendering for distant buildings

### Particle Effects Integration

Destruction effects utilize the existing particle system:
1. Wall destruction triggers particle effects
2. Support beam damage (if any visual feedback) uses particle effects
3. Building collapse creates large-scale particle effects

## Damage System

The damage system distributes damage to building components based on hit location:

1. When a building takes damage at a specific point:
   - Determine which component is hit (wall or beam)
   - Apply damage to the appropriate component
   - For walls: reduce health and check for destruction
   - For beams: damage is ignored due to invincibility

2. Wall destruction logic:
   - When wall health reaches zero, mark as destroyed
   - Trigger destruction effects (particles, sound)
   - Update building structure integrity
   - Check if building collapse should occur

3. Building collapse conditions:
   - If critical support beams are adjacent to destroyed walls
   - If more than 50% of walls are destroyed
   - If key structural integrity points are compromised

## Testing

Unit tests are provided in the `test/building.test.js` file. To run the tests, open the file in a browser or Node.js environment.

## Usage

The building system is automatically integrated into the game through the City class. Buildings are generated as part of the city generation process and are fully interactive with the player, vehicles, and bullets.