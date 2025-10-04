# City Generation - Quick Start Guide

## What You Get

✅ **Automatic city generation** - No manual placement needed
✅ **Grid-based layout** - Like real cities (NYC, Chicago style)
✅ **Drivable roads** - 30px wide roads with proper spacing
✅ **Varied districts** - Downtown, commercial, residential, industrial
✅ **Realistic building placement** - No overlaps, proper spacing
✅ **Easy customization** - Simple config options

## How It Works (Simple Explanation)

1. **Creates a grid** - Divides city into blocks (like a checkerboard)
2. **Adds roads** - Between all blocks (horizontal and vertical)
3. **Places buildings** - Randomly in each block with proper spacing
4. **Varies districts** - Center = downtown, edges = residential

## Default Result

```
City Size: 2000x2000 pixels
Blocks: ~8x8 grid
Roads: 30px wide (plenty of room for cars)
Buildings: ~150-200 buildings
Districts: Mixed (downtown center, residential edges)
```

## Quick Customization

### Want Wider Roads?
```javascript
// In js/game.js, init() method:
this.city = new City(this, {
    roadWidth: 40  // Default is 30
});
```



### Want Smaller City?
```javascript
this.city = new City(this, {
    width: 1500,
    height: 1500
});
```

### Want More Open Space?
```javascript
this.city = new City(this, {
    density: 0.6  // Default is 1.0 (60% of normal buildings)
});
```

### Want Bigger Blocks?
```javascript
this.city = new City(this, {
    blockSize: 250  // Default is 200
});
```

## Testing Your Changes

1. **Open browser console** (F12)
2. **Type:** `game.city.getStats()`
3. **See:** City statistics and configuration

### Debug Visualization

To see the city structure:
1. **Open console** (F12)
2. **Type:** `game.city.renderDebug(game.ctx)`
3. **See:** Red block boundaries, green building outlines, district labels

## Common Scenarios

### "I want easy driving for beginners"
```javascript
this.city = new City(this, {
    roadWidth: 45,
    blockSize: 250,
    density: 0.5
});
```

### "I want challenging tight streets"
```javascript
this.city = new City(this, {
    roadWidth: 25,
    blockSize: 180,
    density: 1.2
});
```

### "I want better performance"
```javascript
this.city = new City(this, {
    width: 1500,
    height: 1500,
    density: 0.7
});
```

### "I want more exploration"
```javascript
this.city = new City(this, {
    width: 3000,
    height: 3000
});
```

## Where to Make Changes

**File:** `js/game.js`
**Method:** `init()`
**Line:** Look for `this.city = new City(this);`

```javascript
init() {
    try {
        // ... other code ...
        
        // CHANGE THIS:
        this.city = new City(this);
        
        // TO THIS:
        this.city = new City(this, {
            roadWidth: 40,
            density: 0.8
        });
        
        // ... rest of code ...
    }
}
```

## All Options (Reference)

```javascript
{
    width: 2000,           // City width
    height: 2000,          // City height
    blockSize: 200,        // Block size (200x200)
    roadWidth: 30,         // Road width
    sidewalkWidth: 8,      // Sidewalk width
    buildingMargin: 10,    // Space between buildings
    minBuildingSize: 40,   // Smallest building
    maxBuildingSize: 120,  // Largest building

    density: 1.0           // Building density (0.5 = half, 2.0 = double)
}
```

## Tips

1. **Start with defaults** - See how it feels
2. **Change one thing** - Don't change everything at once
3. **Test drive** - Actually drive around the city
4. **Adjust gradually** - Small changes make big differences
5. **Use debug mode** - Visualize the structure

## What Makes It Work

- **Grid system** ensures roads are always accessible
- **Block-based** placement prevents building overlaps
- **District types** create variety (downtown vs residential)
- **Configurable** so you can tune it to your gameplay
- **Automatic** so you can focus on game mechanics

## Next Steps

1. Try the default city
2. Experiment with `roadWidth` and `density`
3. Find your preferred settings
4. Focus on gameplay features
5. Come back later for advanced customization

## Need Help?

- Check `Notes/City-Customization-Examples.md` for more examples
- Check `Notes/City-Generation-System.md` for technical details
- Use `game.city.getStats()` to see current settings
- Use `game.city.renderDebug(game.ctx)` to visualize structure

## The Bottom Line

**You don't need to manually place anything!** The system creates a realistic, drivable city automatically. Just tweak a few numbers if you want it more open or more dense. That's it! 🎮
