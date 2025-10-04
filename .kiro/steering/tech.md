# Technology Stack & Build System

## Core Technologies

### Frontend Stack
- **HTML5 Canvas** - Primary rendering engine for 2D graphics
- **Vanilla JavaScript (ES6+)** - No external frameworks or libraries
- **Web Audio API** - Sound effects and music management
- **CSS3** - UI styling and layout

### Architecture Pattern
- **Modular ES6 Classes** - Object-oriented game architecture
- **Component-based entities** - Reusable game object components
- **Event-driven systems** - Decoupled system communication
- **State machines** - AI behavior management

## File Structure & Dependencies

### Core Engine Files
```
js/
├── main.js              # Game initialization & window management
├── game.js              # Core game loop & state management
├── error-handler.js     # Error handling system (load first)
├── error-wrappers.js    # Safe execution wrappers
└── debug-console.js     # Debug utilities
```

### Game Systems
```
js/
├── player.js            # Player vehicle & controls
├── city.js              # City generation & rendering
├── physics.js           # Collision detection & physics
├── spatial-grid.js      # Performance optimization
├── object-pool.js       # Memory management
└── ui.js               # HUD & interface
```

### AI & Entities
```
js/
├── pedestrians.js       # Pedestrian AI
├── police.js           # Police AI & wanted system
├── vehicles.js         # AI vehicle management
├── entities/
│   ├── Tank.js         # Military tank entity
│   └── SoldierTroop.js # Military soldier entity
```

### Game Features
```
js/
├── weapons.js          # Weapon systems
├── bullets.js          # Projectile physics
├── particles.js        # Visual effects
├── powerups.js         # Power-up system
├── missions.js         # Mission framework
├── progression.js      # Player progression
├── zones.js           # Zone management
├── districts.js       # City districts
├── traffic-lights.js  # Traffic system
├── day-night-cycle.js # Time system
└── weather.js         # Weather effects
```

### Building Systems
```
js/
├── building.js          # Building management
├── building-collider.js # Building collision
├── destructible-wall.js # Destructible walls
└── support-beam.js     # Structural elements
```

## Script Loading Order

**Critical**: Scripts must be loaded in dependency order in `index.html`:

1. **Error handling** (first)
2. **Core systems** (spatial grid, object pool)
3. **Game mechanics** (zones, progression, missions)
4. **City systems** (traffic, districts, weather)
5. **Combat systems** (bullets, particles, weapons)
6. **Physics & buildings**
7. **Entities** (player, city, NPCs)
8. **Game engine** (ui, game, main - last)

## Development Commands

### Local Development
```bash
# Serve locally (any HTTP server)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

### Testing
```bash
# Run unit tests (Node.js required)
node test/building.test.js
node test/soldier.test.js
node test/tank.test.js
node test/spawn.test.js
```

### Debug Mode
```
# Enable debug mode
?debug=true

# Debug controls (F1-F11)
F1  - Show debug help
F2  - Add player health
F3  - Increase wanted level
F4  - Spawn police
F5  - Spawn random vehicle
F12 - Toggle debug console
```

## Performance Targets

- **60 FPS** consistent frame rate
- **< 100MB** memory usage
- **< 3 seconds** initial load time
- **Smooth gameplay** on mid-range devices

## Browser Compatibility

### Minimum Requirements
- **Chrome 60+** / **Firefox 55+** / **Safari 12+**
- **Canvas 2D API** support
- **ES6 classes** and modules
- **Web Audio API** for sound

### Recommended
- **Hardware acceleration** enabled
- **4GB+ RAM** for optimal performance
- **Modern GPU** for smooth rendering

## Build Considerations

### No Build Process Required
- Pure vanilla JavaScript - runs directly in browser
- No compilation, bundling, or transpilation needed
- Simple file serving is sufficient for deployment

### Deployment Options
- **Static hosting**: GitHub Pages, Netlify, Vercel
- **CDN deployment**: For global performance
- **Progressive Web App**: Add manifest.json for mobile

## Code Quality Tools

### Recommended Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Live Server** - Development server with hot reload
- **Browser DevTools** - Performance profiling and debugging

### Performance Monitoring
- Built-in FPS counter and performance metrics
- Memory usage tracking
- Automatic quality adjustment based on performance