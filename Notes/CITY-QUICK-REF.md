# City Generation - Quick Reference Card

## Default City
```javascript
this.city = new City(this);
```
Result: 2000x2000, 30px roads, balanced density

---

## Common Tweaks

### Wider Roads (Easier Driving)
```javascript
this.city = new City(this, { roadWidth: 40 });
```

### Smaller City (Better Performance)
```javascript
this.city = new City(this, { width: 1500, height: 1500 });
```

### More Open (Less Buildings)
```javascript
this.city = new City(this, { density: 0.6 });
```

### More Dense (Urban Feel)
```javascript
this.city = new City(this, { density: 1.3 });
```

---

## All Options

```javascript
this.city = new City(this, {
    width: 2000,              // City width
    height: 2000,             // City height
    blockSize: 200,           // Block size
    roadWidth: 30,            // Road width
    sidewalkWidth: 8,         // Sidewalk width
    buildingMargin: 10,       // Space between buildings
    minBuildingSize: 40,      // Min building size
    maxBuildingSize: 120,     // Max building size
    density: 1.0              // Building density (0.5-2.0)
});
```

---

## Debug Commands

```javascript
// View stats
game.city.getStats()

// Visualize structure
game.city.renderDebug(game.ctx)

// Count roads
game.city.roads.length

// Count buildings
game.city.buildings.length
```

---

## Where to Edit

**File:** `js/game.js`
**Method:** `init()`
**Line:** `this.city = new City(this);`

---

## Tips

- Start with defaults
- Change ONE thing at a time
- Test drive around
- Adjust based on feel
- Keep it simple!

---

## That's It!

The city generates automatically. Just tweak the numbers if needed and focus on gameplay! 🎮
