# City Customization Examples

## Quick Start

The city generation is now fully configurable! Just pass options when creating the city.

## Basic Examples

### Default City (Current)
```javascript
this.city = new City(this);
```
Result: 2000x2000 city with standard settings

### Smaller City (Faster Performance)
```javascript
this.city = new City(this, {
    width: 1500,
    height: 1500
});
```
Result: Smaller, more compact city

### Larger City (More Exploration)
```javascript
this.city = new City(this, {
    width: 3000,
    height: 3000
});
```
Result: Massive city to explore

### More Open City (Easy Driving)
```javascript
this.city = new City(this, {
    blockSize: 250,      // Bigger blocks
    roadWidth: 40,       // Wider roads
    buildingMargin: 15   // More space between buildings
});
```
Result: Spacious city, easy to navigate

### Dense City (Urban Feel)
```javascript
this.city = new City(this, {
    blockSize: 150,      // Smaller blocks
    roadWidth: 25,       // Narrower roads
    density: 1.2         // 20% more buildings
});
```
Result: Tight, crowded city streets

### Sparse City (Suburban Feel)
```javascript
this.city = new City(this, {
    blockSize: 300,      // Large blocks
    density: 0.5,        // 50% fewer buildings
    buildingMargin: 20   // Lots of space
});
```
Result: Spread out, suburban layout

## Advanced Examples

### Racing City (Wide Roads, Few Buildings)
```javascript
this.city = new City(this, {
    roadWidth: 50,           // Extra wide roads
    density: 0.4,            // Fewer obstacles
    addBoulevards: true,     // Main racing streets
    buildingMargin: 25       // Clear sightlines
});
```
Perfect for: Street racing, high-speed chases

### Combat City (Lots of Cover)
```javascript
this.city = new City(this, {
    density: 1.3,            // Lots of buildings
    buildingMargin: 8,       // Tight spaces
    blockSize: 180           // Smaller blocks
});
```
Perfect for: Tactical combat, hiding from police

### Downtown Only (Skyscraper City)
```javascript
this.city = new City(this, {
    blockSize: 200,
    density: 0.9
});
// Then modify getDistrictTypeForBlock to always return 'downtown'
```
Result: Manhattan-style skyscraper city

### Industrial Zone (Warehouses)
```javascript
this.city = new City(this, {
    blockSize: 250,
    density: 0.6
});
// Then modify getDistrictTypeForBlock to always return 'industrial'
```
Result: Industrial district with large warehouses

## Configuration Reference

### All Available Options

```javascript
this.city = new City(this, {
    // City size
    width: 2000,              // Total city width in pixels
    height: 2000,             // Total city height in pixels
    
    // Block layout
    blockSize: 200,           // Size of each city block (200x200)
    roadWidth: 30,            // Width of roads between blocks
    
    // Building placement
    buildingMargin: 10,       // Minimum space between buildings
    minBuildingSize: 40,      // Smallest building dimension
    maxBuildingSize: 120,     // Largest building dimension
    
    // Visual details
    sidewalkWidth: 8,         // Width of sidewalks on roads
    
    // Special features
    addBoulevards: true,      // Add wide main streets
    
    // Density control
    density: 1.0              // Building density multiplier (0.5 = half, 2.0 = double)
});
```

## Where to Change It

In `js/game.js`, find the `init()` method:

```javascript
init() {
    try {
        // ... other initialization ...
        
        // CHANGE THIS LINE:
        this.city = new City(this);
        
        // TO THIS (with your config):
        this.city = new City(this, {
            roadWidth: 40,
            density: 0.7
        });
        
        // ... rest of initialization ...
    }
}
```

## Tips

### For Better Performance
- Smaller city size (1500x1500)
- Lower density (0.6-0.8)
- Larger blocks (250+)

### For More Challenge
- Higher density (1.2-1.5)
- Narrower roads (25)
- Smaller blocks (150-180)

### For Exploration
- Larger city (3000x3000)
- Medium density (0.8-1.0)
- Varied block sizes

### For Testing
- Small city (1000x1000)
- Low density (0.3)
- Wide roads (50)

## Visual Comparison

### Default Settings
```
Block: 200x200
Road: 30px
Density: 1.0

Result: Balanced city, good for all gameplay
```

### Racing Settings
```
Block: 250x250
Road: 50px
Density: 0.4

Result: Open streets, perfect for high-speed driving
```

### Combat Settings
```
Block: 180x180
Road: 25px
Density: 1.3

Result: Tight alleys, lots of cover, tactical gameplay
```

## Common Issues & Solutions

### "Roads are too narrow!"
```javascript
roadWidth: 40  // or higher
```

### "Too many buildings, can't see!"
```javascript
density: 0.6  // reduce density
```

### "City feels empty"
```javascript
density: 1.2,  // more buildings
blockSize: 180 // smaller blocks
```

### "Performance is slow"
```javascript
width: 1500,   // smaller city
height: 1500,
density: 0.7   // fewer buildings
```

### "Want more variety"
```javascript
blockSize: 200,        // standard blocks
addBoulevards: true,   // add main streets
density: 1.0           // normal density
// Then add custom district logic
```

## Next Steps

1. Try different configurations
2. Find what works for your gameplay
3. Adjust based on player feedback
4. Consider adding custom district types
5. Add special landmarks (stadium, airport, etc.)

## Pro Tips

- Start with default settings
- Change ONE parameter at a time
- Test drive around the city
- Adjust based on feel
- Save your favorite configs

Happy city building! 🏙️
