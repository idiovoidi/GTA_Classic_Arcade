# Code Standards - GTA Clone

## 📋 General Principles

### Code Quality
- **Readability**: Code should be self-documenting
- **Maintainability**: Easy to modify and extend
- **Performance**: Optimized for 60 FPS gameplay
- **Consistency**: Follow established patterns throughout

### JavaScript Standards
- **ES6+**: Use modern JavaScript features
- **Strict Mode**: Always use strict mode
- **No Global Variables**: Avoid polluting global scope
- **Type Safety**: Use consistent naming conventions

## 🏗️ File Organization

### Directory Structure
```
js/
├── game.js          # Core game engine
├── player.js        # Player car and controls
├── city.js          # City generation and rendering
├── pedestrians.js   # Pedestrian AI
├── police.js        # Police AI and wanted system
├── vehicles.js      # AI vehicle management
├── physics.js       # Physics and collision detection
├── ui.js           # User interface and HUD
└── main.js         # Game initialization
```

### File Naming
- **Lowercase**: Use lowercase with underscores
- **Descriptive**: File names should describe their purpose
- **Consistent**: Follow the same pattern throughout

## 🎯 Class Design

### Class Structure
```javascript
class ClassName {
    // Constructor
    constructor(parameters) {
        // Initialize properties
        this.property = value
    }
    
    // Public methods
    publicMethod() {
        // Implementation
    }
    
    // Private methods (prefix with _)
    _privateMethod() {
        // Implementation
    }
    
    // Static methods
    static staticMethod() {
        // Implementation
    }
}
```

### Naming Conventions
- **Classes**: PascalCase (e.g., `Player`, `GameEngine`)
- **Methods**: camelCase (e.g., `updatePlayer`, `renderCity`)
- **Properties**: camelCase (e.g., `playerHealth`, `wantedLevel`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_SPEED`, `FPS_TARGET`)
- **Private members**: Prefix with underscore (e.g., `_privateMethod`)

## 📝 Documentation Standards

### Function Documentation
```javascript
/**
 * Updates the player's position and state
 * @param {number} deltaTime - Time elapsed since last frame in milliseconds
 * @returns {void}
 */
updatePlayer(deltaTime) {
    // Implementation
}
```

### Class Documentation
```javascript
/**
 * Manages the player car and input controls
 * @class Player
 * @param {Game} game - Reference to the main game instance
 * @param {number} x - Initial x position
 * @param {number} y - Initial y position
 */
class Player {
    // Implementation
}
```

### Inline Comments
```javascript
// Update camera to follow player smoothly
this.camera.x = lerp(this.camera.x, this.player.x - this.width / 2, 0.1)

// Check for collisions with all entities
this.entities.forEach(entity => {
    if (this.checkCollision(this.player, entity)) {
        // Handle collision
    }
})
```

## 🎮 Game-Specific Standards

### Game Loop Pattern
```javascript
class Game {
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return
        
        this.deltaTime = currentTime - this.lastTime
        this.lastTime = currentTime
        
        if (this.deltaTime >= this.targetFrameTime) {
            this.update(this.deltaTime)
            this.render()
            this.deltaTime = 0
        }
        
        requestAnimationFrame((time) => this.gameLoop(time))
    }
}
```

### Entity Update Pattern
```javascript
class Entity {
    update(deltaTime) {
        // 1. Update AI/behavior
        this.updateAI(deltaTime)
        
        // 2. Update physics
        this.updatePhysics(deltaTime)
        
        // 3. Update position
        this.x += this.velocity.x
        this.y += this.velocity.y
        
        // 4. Check bounds
        this.checkBounds()
    }
}
```

### Rendering Pattern
```javascript
class Entity {
    render(ctx) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        
        // Render entity
        this.renderEntity(ctx)
        
        ctx.restore()
    }
}
```

## 🔧 Performance Standards

### Object Pooling
```javascript
class ParticlePool {
    constructor(size) {
        this.particles = new Array(size).fill(null).map(() => new Particle())
        this.available = [...this.particles]
        this.used = []
    }
    
    getParticle() {
        if (this.available.length === 0) {
            console.warn('Particle pool exhausted')
            return new Particle()
        }
        
        const particle = this.available.pop()
        this.used.push(particle)
        return particle
    }
    
    releaseParticle(particle) {
        const index = this.used.indexOf(particle)
        if (index > -1) {
            this.used.splice(index, 1)
            this.available.push(particle)
        }
    }
}
```

### Efficient Collision Detection
```javascript
class Physics {
    static checkCollision(obj1, obj2) {
        // Use squared distance to avoid expensive sqrt
        const dx = obj1.x - obj2.x
        const dy = obj1.y - obj2.y
        const distanceSquared = dx * dx + dy * dy
        const radiusSum = (obj1.radius || 10) + (obj2.radius || 10)
        
        return distanceSquared < radiusSum * radiusSum
    }
}
```

### Memory Management
```javascript
class Game {
    update(deltaTime) {
        // Update entities
        this.entities.forEach(entity => entity.update(deltaTime))
        
        // Remove dead entities
        this.entities = this.entities.filter(entity => entity.health > 0)
        
        // Clean up particles
        this.particles = this.particles.filter(particle => particle.life > 0)
    }
}
```

## 🎨 Rendering Standards

### Canvas State Management
```javascript
class Renderer {
    renderEntity(ctx, entity) {
        ctx.save()
        
        // Apply transformations
        ctx.translate(entity.x, entity.y)
        ctx.rotate(entity.angle)
        
        // Render
        this.drawEntity(ctx, entity)
        
        ctx.restore()
    }
    
    drawEntity(ctx, entity) {
        // Drawing code here
    }
}
```

### Color Management
```javascript
const Colors = {
    PLAYER: '#00ff00',
    POLICE: '#0000ff',
    PEDESTRIAN: '#ff6b6b',
    VEHICLE: '#ffff00',
    BUILDING: '#666666',
    ROAD: '#444444',
    BACKGROUND: '#2a2a2a'
}
```

### Layer Rendering
```javascript
class Game {
    render() {
        // Clear canvas
        this.ctx.fillStyle = Colors.BACKGROUND
        this.ctx.fillRect(0, 0, this.width, this.height)
        
        // Apply camera transform
        this.ctx.save()
        this.ctx.translate(-this.camera.x, -this.camera.y)
        
        // Render layers in order
        this.renderBackground()
        this.renderEntities()
        this.renderPlayer()
        this.renderEffects()
        
        this.ctx.restore()
        
        // Render UI (no camera transform)
        this.renderUI()
    }
}
```

## 🧪 Testing Standards

### Unit Test Structure
```javascript
describe('Player', () => {
    let game, player
    
    beforeEach(() => {
        game = new Game()
        player = new Player(game, 100, 100)
    })
    
    test('should move forward when W key is pressed', () => {
        game.keys['KeyW'] = true
        player.update(16) // 16ms delta time
        
        expect(player.speed).toBeGreaterThan(0)
    })
    
    test('should take damage when shot', () => {
        const initialHealth = player.health
        player.takeDamage(25)
        
        expect(player.health).toBe(initialHealth - 25)
    })
})
```

### Performance Testing
```javascript
describe('Performance', () => {
    test('should maintain 60 FPS', () => {
        const game = new Game()
        const startTime = performance.now()
        
        // Run 60 frames
        for (let i = 0; i < 60; i++) {
            game.update(16.67) // 60 FPS
            game.render()
        }
        
        const endTime = performance.now()
        const avgFrameTime = (endTime - startTime) / 60
        
        expect(avgFrameTime).toBeLessThan(16.67)
    })
})
```

## 🔍 Error Handling

### Error Handling Pattern
```javascript
class Game {
    update(deltaTime) {
        try {
            this.updateEntities(deltaTime)
            this.updatePhysics(deltaTime)
            this.updateAI(deltaTime)
        } catch (error) {
            console.error('Game update error:', error)
            this.handleError(error)
        }
    }
    
    handleError(error) {
        // Log error
        console.error('Game error:', error)
        
        // Attempt recovery
        this.recoverFromError()
        
        // Notify user if critical
        if (error.critical) {
            this.showErrorMessage('A critical error occurred. Please refresh the page.')
        }
    }
}
```

### Input Validation
```javascript
class Player {
    takeDamage(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            console.warn('Invalid damage amount:', amount)
            return
        }
        
        this.health = Math.max(0, this.health - amount)
    }
}
```

## 📊 Code Metrics

### Target Metrics
- **Cyclomatic Complexity**: < 10 per function
- **Function Length**: < 50 lines per function
- **Class Length**: < 500 lines per class
- **Comment Density**: 20-30% of code
- **Test Coverage**: > 80% for critical functions

### Code Review Checklist
- [ ] Follows naming conventions
- [ ] Has proper documentation
- [ ] Handles errors gracefully
- [ ] Is optimized for performance
- [ ] Has unit tests
- [ ] Follows established patterns
- [ ] Is readable and maintainable

## 🔄 Version Control

### Commit Standards
```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add or update tests
perf: performance improvements
```

### Branch Naming
- `feature/player-movement`
- `bugfix/collision-detection`
- `enhancement/city-generation`
- `hotfix/critical-bug`

### Code Review Process
1. Create feature branch
2. Implement changes following standards
3. Add tests for new functionality
4. Update documentation
5. Submit pull request
6. Code review by team member
7. Merge after approval

These code standards ensure consistency, maintainability, and quality throughout the GTA clone project development.
