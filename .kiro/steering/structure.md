# Project Structure & Organization

## Root Directory Layout

```
├── index.html                 # Main game entry point
├── js/                       # All JavaScript game code
├── test/                     # Unit tests
├── ProjectPlan/              # Comprehensive documentation
├── Notes/                    # Development notes
├── .kiro/                    # Kiro AI assistant configuration
├── .cursor/                  # Cursor IDE configuration
├── .vscode/                  # VS Code configuration
└── .git/                     # Git version control
```

## JavaScript Code Organization (`js/`)

### Core Engine (Load First)
```
js/
├── error-handler.js          # Global error management
├── error-wrappers.js         # Safe execution utilities
├── debug-console.js          # Debug interface
├── main.js                   # Game initialization
└── game.js                   # Core game loop & state
```

### System Architecture
```
js/
├── spatial-grid.js           # Performance optimization
├── object-pool.js            # Memory management
├── physics.js                # Collision & physics
├── audio.js                  # Sound management
└── ui.js                     # User interface
```

### Game World
```
js/
├── city.js                   # City generation
├── zones.js                  # Zone management
├── districts.js              # City districts
├── traffic-lights.js         # Traffic system
├── day-night-cycle.js        # Time system
└── weather.js                # Weather effects
```

### Building System
```
js/
├── building.js               # Building management
├── building-collider.js      # Building collision
├── destructible-wall.js      # Destructible walls
└── support-beam.js           # Structural elements
```

### Combat & Weapons
```
js/
├── weapons.js                # Weapon definitions
├── bullets.js                # Projectile physics
├── particles.js              # Visual effects
└── powerups.js               # Power-up system
```

### AI Entities
```
js/
├── player.js                 # Player vehicle
├── pedestrians.js            # Pedestrian AI
├── police.js                 # Police AI
├── vehicles.js               # AI vehicles
└── entities/
    ├── Tank.js               # Military tank
    └── SoldierTroop.js       # Military soldier
```

### Game Features
```
js/
├── missions.js               # Mission system
└── progression.js            # Player progression
```

## Documentation Structure (`ProjectPlan/`)

### Comprehensive Game Documentation
```
ProjectPlan/
├── README.md                 # Documentation overview
├── 01_Project_Overview.md    # High-level project vision
├── 02_Technical_Requirements.md # Technical specifications
├── 03_Game_Design_Document.md # Game mechanics & design
├── 04_Development_Roadmap.md # Timeline & milestones
├── 05_Technical_Architecture.md # System architecture
├── 06_Code_Standards.md      # Development standards
├── 07_Testing_Strategy.md    # Testing approach
├── 08_Deployment_Guide.md    # Deployment procedures
├── 09_Maintenance_Plan.md    # Ongoing maintenance
├── 10_Structured_Task_List.md # Development tasks
└── 11_Error_Handling_System.md # Error management
```

## Testing Structure (`test/`)

### Unit Test Organization
```
test/
├── building.test.js          # Building system tests
├── soldier.test.js           # Soldier AI tests
├── tank.test.js              # Tank entity tests
├── spawn.test.js             # Spawning system tests
└── soldier-spawn.test.js     # Soldier spawning tests
```

## Configuration Files

### IDE & Development Tools
```
.cursor/rules/                # Cursor IDE rules
.vscode/                      # VS Code settings
.kiro/                        # Kiro AI configuration
```

## Code Organization Principles

### Modular Architecture
- **Single Responsibility**: Each file handles one major system
- **Clear Dependencies**: Explicit loading order in index.html
- **Loose Coupling**: Systems communicate through well-defined interfaces
- **High Cohesion**: Related functionality grouped together

### Naming Conventions
- **Files**: kebab-case (e.g., `day-night-cycle.js`)
- **Classes**: PascalCase (e.g., `SoldierTroop`)
- **Methods**: camelCase (e.g., `updateAI`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_SPEED`)

### File Size Guidelines
- **Core files** (game.js): Can be large (2000+ lines) due to complexity
- **System files**: 200-800 lines typically
- **Entity files**: 100-500 lines per entity
- **Utility files**: 50-200 lines

## Development Workflow

### Adding New Features
1. **Identify system**: Determine which existing file or create new one
2. **Check dependencies**: Ensure proper loading order
3. **Follow patterns**: Use existing code patterns and conventions
4. **Add tests**: Create corresponding test file if needed
5. **Update docs**: Update relevant documentation

### File Creation Guidelines
- **New entities**: Add to `js/entities/` folder
- **New systems**: Add to root `js/` folder
- **New tests**: Add to `test/` folder with `.test.js` suffix
- **New docs**: Add to `ProjectPlan/` folder

### Integration Points
- **index.html**: Script loading order
- **game.js**: Central game state management
- **error-handler.js**: Global error handling
- **ui.js**: User interface integration

## Performance Considerations

### File Loading Strategy
- **Critical path**: Error handling → Core systems → Game logic
- **Lazy loading**: Not implemented (all files load at startup)
- **Minification**: Not used (development-focused)
- **Bundling**: Not used (vanilla JS approach)

### Memory Management
- **Object pooling**: Implemented in `object-pool.js`
- **Spatial optimization**: Implemented in `spatial-grid.js`
- **Garbage collection**: Managed through proper cleanup patterns

## Maintenance Guidelines

### Code Quality
- Follow established patterns in existing files
- Maintain consistent error handling
- Use the debug console for development
- Add comprehensive comments for complex logic

### Documentation Updates
- Update relevant ProjectPlan documents when making changes
- Keep README files current
- Document new features and systems
- Maintain test coverage for critical systems