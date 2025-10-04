# Building System - Quick Reference

## What You Get

✅ **Proper roofs** - Not windows on top
✅ **Transparent roofs** - See inside when player enters
✅ **Breakable windows** - On all 4 edges
✅ **Glass shatter** - Particles + sound
✅ **Building variety** - 4 types with unique looks

---

## Building Types

### Residential
- 🏠 Brown shingle roof
- 🧱 Wood floors
- 🔥 Chimney on roof

### Commercial  
- 🏢 Dark gray roof
- ⬜ Tile floors
- ❄️ AC units on roof

### Industrial
- 🏭 Dark slate roof
- ⬛ Concrete floors
- 🔧 Vents & pipes on roof

### Skyscraper
- 🏙️ Black roof
- ✨ Polished floors
- 🚁 Helipad with "H"

---

## Features

### Roof Transparency
```
Player outside: Solid roof (100% opacity)
Player inside:  See-through roof (30% opacity)
```

### Breakable Windows
```
Location: All 4 edges of building
Health: 10 HP per window
Break: Shoot to shatter
Effect: Glass particles + sound
Score: +5 points per window
```

### Interior Floors
```
Visible when roof is transparent
Different color per building type
Adds depth and realism
```

---

## Rendering Order

1. Floor (interior)
2. Walls (destructible)
3. Support beams (indestructible)
4. Edge windows (breakable)
5. Roof (transparent if inside)
6. Roof details (chimneys, etc.)

---

## Debug

```javascript
// Check building type
game.city.buildings[0].buildingType

// Check window count
game.city.buildings[0].features.filter(f => f.type === 'window').length

// Check broken windows
game.city.buildings[0].features.filter(f => f.type === 'window' && f.broken).length
```

---

## Tips

- **Enter buildings** to see roof transparency
- **Shoot windows** for glass shatter effect
- **Look for roof details** to identify building types
- **Use windows** for tactical cover
- **Break windows** before entering for visibility

---

## That's It!

Buildings now look realistic from top-down view with proper roofs and breakable edge windows! 🏢
