# City Generation System

## Overview
The city uses a **block-based grid system** similar to real cities like New York or Chicago. This creates a natural, drivable city layout without manual placement.

## How It Works

### 1. Grid Layout
```
┌─────────┬─────────┬─────────┬─────────┐
│ Block 1 │ Block 2 │ Block 3 │ Block 4 │
│  (Res)  │  (Com)  │  (Com)  │  (Res)  │
├─────────┼─────────┼─────────┼─────────┤
│ Block 5 │ Block 6 │ Block 7 │ Block 8 │
│  (Com)  │ (Down)  │ (Down)  │  (Com)  │
├─────────┼─────────┼─────────┼─────────┤
│ Block 9 │ Block10 │ Block11 │ Block12 │
│  (Ind)  │  (Com)  │  (Com)  │  (Ind)  │
└─────────┴─────────┴─────────┴─────────┘
```

### 2. Configuration Parameters

```javascript
{
    blockSize: 200,        // Size of each city block (200x200)
    roadWidth: 30,         // Width of roads (plenty of room for cars)
    sidewalkWidth: 8,      // Sidewalks on each side
    buildingMargin: 10,    // Space between buildings
    minBuildingSize: 40,   // Smallest building
    maxBuildingSize: 120   // Largest building
}
```

### 3. District Types

**Downtown** (Center blocks)
- 60% Skyscrapers
- 30% Commercial
- 10% Residential
- High density (80%)

**Commercial** (Near center)
- 60% Commercial buildings
- 30% Residential
- 10% Skyscrapers
- Medium-high density (70%)

**Industrial** (Random outer blocks)
- 70% Industrial buildings
- 20% Industrial (warehouses)
- 10% Commercial
- Medium density (60%)

**Residential** (Outer blocks)
- 70% Residential buildings
- 20% Residential (houses)
- 10% Commercial
- Lower density (50%)

### 4. Building Placement

Within each block:
1. Calculate block boundaries (excluding roads)
2. Randomly place buildings with proper spacing
3. Ensure no overlaps (10px minimum margin)
4. Fill to target density for district type

Example block layout:
```
┌─────────────────────────────┐
│ ┌────┐      ┌──────┐       │
│ │ B1 │      │  B2  │       │
│ └────┘      └──────┘       │
│                             │
│    ┌──────┐    ┌────┐      │
│    │  B3  │    │ B4 │      │
│    └──────┘    └────┘      │
│                             │
│ ┌────────┐                 │
│ │   B5   │     ┌────┐      │
│ └────────┘     │ B6 │      │
└─────────────────────────────┘
```

## Advantages

✅ **Automatic** - No manual placement needed
✅ **Drivable** - Roads are wide and properly spaced
✅ **Realistic** - Mimics real city layouts
✅ **Varied** - Different districts create variety
✅ **Scalable** - Easy to adjust city size
✅ **Performance** - Efficient collision detection with grid

## Customization

### Easy Tweaks

**Make roads wider:**
```javascript
roadWidth: 40  // More space for vehicles
```

**Bigger blocks (more open):**
```javascript
blockSize: 250  // Larger blocks = more space
```

**More buildings per block:**
```javascript
density: 0.9  // Pack more buildings in
```

**Fewer blocks (smaller city):**
```javascript
// Adjust city size in constructor
this.width = 1500;  // Smaller city
this.height = 1500;
```

### Advanced Customization

**Add parks:**
```javascript
// In generateBuildingsInBlock, randomly skip some blocks
if (Math.random() < 0.1) {
    // Leave this block empty (park)
    return;
}
```

**Add main streets:**
```javascript
// In addSpecialRoads
this.roads.push({
    x: centerX - 40,
    y: 0,
    width: 80,  // Extra wide main street
    height: this.height,
    type: 'main_street',
    lanes: 6
});
```

**Add roundabouts:**
```javascript
// At major intersections
this.addRoundabout(x, y, radius);
```

## Visual Result

The system creates a city that looks like this:

```
═══════════════════════════════════════
║ ▓▓  ▓▓▓    ║  ▓▓▓  ▓▓  ║    ▓▓  ▓▓ ║
║ ▓▓  ▓▓▓    ║  ▓▓▓  ▓▓  ║    ▓▓  ▓▓ ║
║    ▓▓▓▓    ║    ▓▓▓▓   ║  ▓▓▓▓▓▓  ║
═══════════════════════════════════════
║  ▓▓▓  ▓▓   ║  ████████  ║  ▓▓  ▓▓▓ ║
║  ▓▓▓  ▓▓   ║  ████████  ║  ▓▓  ▓▓▓ ║
║    ▓▓▓▓▓   ║  ████████  ║    ▓▓▓▓  ║
═══════════════════════════════════════
║ ▓▓▓▓  ▓▓   ║  ████████  ║  ▓▓▓▓▓▓  ║
║ ▓▓▓▓  ▓▓   ║  ████████  ║  ▓▓▓▓▓▓  ║
║   ▓▓▓▓▓    ║  ████████  ║    ▓▓▓▓  ║
═══════════════════════════════════════

Legend:
═ Roads (30px wide)
▓ Buildings (various sizes)
█ Skyscrapers (downtown)
```

## Performance

- **Grid-based collision**: O(1) lookup for nearby buildings
- **Spatial partitioning**: Only check collisions in relevant blocks
- **Efficient rendering**: Viewport culling skips off-screen blocks

## Future Enhancements

1. **Curved roads** - Add bezier curves for organic feel
2. **Plazas** - Open spaces in downtown
3. **Waterfront** - Rivers/lakes with bridges
4. **Highways** - Elevated roads connecting districts
5. **Tunnels** - Underground passages
6. **Landmarks** - Special buildings (stadium, airport)

## Testing

To visualize the city generation:
1. Open browser console (F12)
2. Type: `game.city.roads.length` - See number of roads
3. Type: `game.city.buildings.length` - See number of buildings
4. Enable debug mode: Add `?debug=true` to URL
5. Press F2 to see building outlines
