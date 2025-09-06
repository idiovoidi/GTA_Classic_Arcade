# Technical Architecture - GTA Clone

## 🏗️ System Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Browser Layer                        │
├─────────────────────────────────────────────────────────┤
│  HTML5 Canvas  │  Input Events  │  Audio Context       │
├─────────────────────────────────────────────────────────┤
│                    Game Engine Layer                    │
├─────────────────────────────────────────────────────────┤
│  Game Loop  │  Renderer  │  Physics  │  AI Manager     │
├─────────────────────────────────────────────────────────┤
│                    Game Systems Layer                   │
├─────────────────────────────────────────────────────────┤
│  Player  │  City  │  Pedestrians  │  Police  │  UI     │
├─────────────────────────────────────────────────────────┤
│                    Data Layer                           │
├─────────────────────────────────────────────────────────┤
│  Game State  │  Configuration  │  Assets  │  Save Data │
└─────────────────────────────────────────────────────────┘
```

## 🎮 Core Game Engine

### Game Class (game.js)
```javascript
class Game {
    // Core properties
    canvas, ctx, width, height
    camera, deltaTime, fps
    
    // Game objects
    player, city, pedestrians, police, vehicles
    bullets, particles
    
    // Game state
    score, wantedLevel, isRunning
    
    // Methods
    init(), update(), render(), gameLoop()
}
```

**Responsibilities:**
- Main game loop and timing
- Object management and updates
- Camera system and rendering coordination
- Game state management
- Input event handling

### Rendering System
```javascript
// Rendering pipeline
1. Clear canvas
2. Apply camera transform
3. Render background (city)
4. Render game objects (vehicles, pedestrians, police)
5. Render player
6. Render effects (bullets, particles)
7. Restore transform
8. Render UI overlay
```

**Optimization Strategies:**
- Dirty rectangle updates for static elements
- Object culling (only render visible objects)
- Layer-based rendering for efficiency
- Canvas state management

## 🗺️ City System Architecture

### City Class (city.js)
```javascript
class City {
    // City layout
    roads[], buildings[], decorations[]
    intersections[], trafficLights[]
    
    // Districts
    districts: {
        residential, commercial, industrial, downtown
    }
    
    // Methods
    generateCity(), render(), update()
    isOnRoad(), getRandomRoadPosition()
}
```

### District System
```javascript
// District configuration
const districtConfig = {
    residential: {
        buildingTypes: ['house', 'apartment'],
        roadDensity: 'low',
        decorationTypes: ['tree', 'bench'],
        trafficPattern: 'light'
    },
    commercial: {
        buildingTypes: ['shop', 'office', 'mall'],
        roadDensity: 'medium',
        decorationTypes: ['lamp', 'sign'],
        trafficPattern: 'moderate'
    }
    // ... other districts
}
```

## 🤖 AI System Architecture

### AI Base Class
```javascript
class AIEntity {
    // Common properties
    x, y, health, state, behavior
    
    // AI methods
    update(), render(), takeDamage()
    checkForDanger(), findPath()
}
```

### Pedestrian AI (pedestrians.js)
```javascript
class Pedestrian extends AIEntity {
    // States: walking, running, panicking, dead
    // Behavior triggers
    checkForDanger() // Player, police, gunshots
    fleeFromDanger() // Panic response
    walkToTarget() // Normal movement
}
```

### Police AI (police.js)
```javascript
class Police extends AIEntity {
    // States: patrolling, chasing, attacking
    // Detection system
    canSeePlayer() // Line of sight with occlusion
    updateAI() // State machine logic
    shootAtPlayer() // Combat behavior
}
```

### AI State Machine
```javascript
// State transition logic
if (dangerDetected) {
    state = 'panicking'
    behavior = fleeBehavior
} else if (alertLevel > threshold) {
    state = 'chasing'
    behavior = chaseBehavior
} else {
    state = 'patrolling'
    behavior = patrolBehavior
}
```

## 🎯 Physics System

### Physics Class (physics.js)
```javascript
class Physics {
    // Collision detection
    static checkCollision(obj1, obj2)
    static checkRectCollision(rect1, rect2)
    static lineIntersectsRect(x1, y1, x2, y2, rect)
    
    // Movement and forces
    static applyForce(obj, forceX, forceY)
    static limitVelocity(obj, maxSpeed)
    static bounceOffWall(obj, wall)
}
```

### Collision Detection Strategy
1. **Broad Phase**: Spatial partitioning for efficiency
2. **Narrow Phase**: Precise collision detection
3. **Response**: Damage, bounce, or destruction

### Physics Integration
```javascript
// In game update loop
entities.forEach(entity => {
    // Apply forces
    Physics.applyForce(entity, entity.forceX, entity.forceY)
    
    // Update position
    entity.x += entity.velocity.x
    entity.y += entity.velocity.y
    
    // Check collisions
    checkCollisions(entity)
})
```

## 🎮 Input System

### Input Management
```javascript
class InputManager {
    constructor() {
        this.keys = {}
        this.mouse = { x: 0, y: 0, clicked: false }
        this.setupEventListeners()
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown)
        document.addEventListener('keyup', this.handleKeyUp)
        
        // Mouse events
        canvas.addEventListener('mousemove', this.handleMouseMove)
        canvas.addEventListener('mousedown', this.handleMouseDown)
    }
}
```

### Control Mapping
```javascript
const controls = {
    movement: ['KeyW', 'KeyA', 'KeyS', 'KeyD'],
    handbrake: 'Space',
    shoot: 'mouseclick',
    pause: 'Escape',
    fullscreen: 'F11'
}
```

## 🎨 Rendering Pipeline

### Render Order
1. **Background**: City, roads, buildings
2. **Entities**: Vehicles, pedestrians, police
3. **Player**: Player car (always on top)
4. **Effects**: Bullets, particles, explosions
5. **UI**: Minimap, HUD, menus

### Camera System
```javascript
class Camera {
    constructor() {
        this.x = 0
        this.y = 0
        this.zoom = 1
        this.target = null // Player to follow
    }
    
    update() {
        // Smooth following
        this.x = lerp(this.x, target.x - width/2, 0.1)
        this.y = lerp(this.y, target.y - height/2, 0.1)
    }
}
```

### Rendering Optimization
- **Frustum Culling**: Only render visible objects
- **Level of Detail**: Simpler rendering for distant objects
- **Batch Rendering**: Group similar objects
- **Canvas State Management**: Minimize state changes

## 🔧 Performance Architecture

### Game Loop Optimization
```javascript
gameLoop(currentTime) {
    this.deltaTime = currentTime - this.lastTime
    
    if (this.deltaTime >= this.targetFrameTime) {
        this.update(this.deltaTime)
        this.render()
        this.deltaTime = 0
    }
    
    requestAnimationFrame(this.gameLoop.bind(this))
}
```

### Memory Management
```javascript
// Object pooling for particles
class ParticlePool {
    constructor(size) {
        this.particles = new Array(size)
        this.available = []
        this.used = []
    }
    
    getParticle() {
        if (this.available.length > 0) {
            return this.available.pop()
        }
        return new Particle()
    }
    
    releaseParticle(particle) {
        this.available.push(particle)
    }
}
```

### Performance Monitoring
```javascript
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0
        this.lastFpsTime = 0
        this.fps = 0
    }
    
    update() {
        this.frameCount++
        const now = performance.now()
        
        if (now - this.lastFpsTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime))
            this.frameCount = 0
            this.lastFpsTime = now
        }
    }
}
```

## 🗄️ Data Management

### Game State
```javascript
class GameState {
    constructor() {
        this.score = 0
        this.wantedLevel = 0
        this.playerHealth = 100
        this.gameTime = 0
        this.entities = []
    }
    
    save() {
        return JSON.stringify({
            score: this.score,
            wantedLevel: this.wantedLevel,
            playerHealth: this.playerHealth,
            gameTime: this.gameTime
        })
    }
    
    load(data) {
        const state = JSON.parse(data)
        Object.assign(this, state)
    }
}
```

### Configuration System
```javascript
const config = {
    game: {
        width: 800,
        height: 600,
        fps: 60,
        targetFrameTime: 1000 / 60
    },
    player: {
        maxSpeed: 4,
        acceleration: 0.2,
        friction: 0.95,
        turnSpeed: 0.05
    },
    city: {
        width: 2000,
        height: 2000,
        tileSize: 50
    }
}
```

## 🔌 Modular Design

### Module Dependencies
```
main.js
├── game.js (core engine)
├── player.js (player system)
├── city.js (city generation)
├── pedestrians.js (pedestrian AI)
├── police.js (police AI)
├── vehicles.js (vehicle AI)
├── physics.js (physics system)
└── ui.js (user interface)
```

### Interface Contracts
```javascript
// All AI entities must implement
interface AIEntity {
    update(deltaTime)
    render(ctx)
    takeDamage(amount)
    checkForDanger()
}

// All renderable objects must implement
interface Renderable {
    render(ctx)
    x, y, width, height
}
```

## 🧪 Testing Architecture

### Unit Testing Structure
```javascript
// Example test structure
describe('Physics', () => {
    test('collision detection', () => {
        const obj1 = { x: 0, y: 0, radius: 10 }
        const obj2 = { x: 5, y: 5, radius: 10 }
        expect(Physics.checkCollision(obj1, obj2)).toBe(true)
    })
})

describe('AI', () => {
    test('pedestrian panic behavior', () => {
        const pedestrian = new Pedestrian(game, 100, 100)
        const danger = { x: 110, y: 110, type: 'player' }
        pedestrian.fleeFromDanger(danger)
        expect(pedestrian.state).toBe('panicking')
    })
})
```

### Performance Testing
```javascript
// Performance benchmarks
const benchmarks = {
    frameRate: 60, // Target FPS
    memoryUsage: 100, // Max MB
    loadTime: 3000, // Max ms
    collisionChecks: 1000 // Per frame
}
```

This technical architecture provides a solid foundation for the GTA clone project, ensuring scalability, maintainability, and performance while keeping the codebase organized and modular.
