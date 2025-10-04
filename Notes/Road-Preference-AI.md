# Road Preference AI Implementation

## Overview
Updated vehicle and police AI to prefer staying on roads during normal driving, but allow off-road movement during chases, panic, or combat situations.

## Problem
Previously, vehicles and police would drive anywhere, including through buildings and off-road areas, making the game feel unrealistic and chaotic even during normal traffic.

## Solution

### 1. Civilian Vehicles (js/vehicles.js)

#### New `steerTowardsRoad()` Method
- Checks if vehicle is currently on a road
- If off-road, finds the nearest road within 100 units
- Gently steers vehicle back towards road (2% correction per frame)
- Only applies during normal driving state

#### Behavior States
- **Normal Driving**: Follows road paths + gentle road correction
- **Panicking**: Can go off-road to flee danger
- **After Panic**: Returns to road by finding new path

```javascript
// Called every frame during normal driving
this.steerTowardsRoad();

// After panic ends, return to road
if (this.panicTimer <= 0) {
    this.state = 'driving';
    this.findNewPath(); // Get back on road
}
```

### 2. Police Vehicles (js/police.js)

#### New `steerTowardsRoad()` Method
- More aggressive road correction than civilians (80 unit range vs 100)
- Blends road correction with current target (30% towards road)
- Only applies during patrolling state

#### Behavior States
- **Patrolling**: Stays on roads, corrects if off-road
- **Chasing**: Can go off-road to pursue player
- **Attacking**: Full off-road capability to engage player
- **When Shot**: Immediately switches to attacking (allows off-road)

```javascript
// Only steer to road when patrolling
if (this.state === 'patrolling') {
    this.steerTowardsRoad();
}

// When attacked, allow off-road pursuit
takeDamage(amount, fromAngle = null) {
    this.state = 'attacking'; // Allows off-road
}
```

## Technical Details

### Road Detection
Uses existing `City.isOnRoad(x, y)` method:
```javascript
isOnRoad(x, y) {
    for (const road of this.roads) {
        if (x >= road.x && x <= road.x + road.width &&
            y >= road.y && y <= road.y + road.height) {
            return true;
        }
    }
    return false;
}
```

### Steering Algorithm
1. Check if on road (if yes, skip correction)
2. Find nearest road **edge** (not center) - more accurate
3. Calculate closest point on any road rectangle
4. Apply steering correction based on distance
5. Direct target update (police) or angle adjustment (civilians)

### Correction Strengths
- **Civilian Vehicles**: 
  - 5-10% angle correction (stronger when further from road)
  - 150 unit detection range
  - Smooth angle-based steering
  
- **Police Vehicles**: 
  - Direct target override to nearest road point
  - 120 unit detection range
  - More aggressive correction

## Behavior Matrix

| Vehicle Type | Patrolling | Chasing | Panicking | Attacking |
|-------------|-----------|---------|-----------|-----------|
| Civilian    | On-road ✓ | N/A     | Off-road ✓| N/A       |
| Police      | On-road ✓ | Off-road ✓| N/A    | Off-road ✓|

## Benefits

1. **Realistic Traffic**: Vehicles stay on roads during normal gameplay
2. **Dynamic Chases**: Police can pursue player anywhere when needed
3. **Panic Response**: Civilians flee off-road when threatened
4. **Better Gameplay**: Clear distinction between normal and chase states
5. **Performance**: Minimal overhead (only checks when off-road)

## Testing

### Normal Traffic
- Spawn vehicles and observe - should stay on roads
- Vehicles should follow road grid naturally
- Gentle corrections when slightly off-road

### Police Behavior
- Police patrol on roads
- When player gets wanted level, police chase off-road
- After losing wanted level, police return to roads

### Panic Response
- Shoot near civilian vehicles
- They should flee (possibly off-road)
- After panic ends, they return to roads

## Implementation Details

### Key Improvements (v2)
1. **Edge Detection**: Find nearest point on road rectangle, not just center
2. **Stronger Correction**: Increased from 2% to 5-10% based on distance
3. **Larger Range**: Increased from 100 to 150 units for civilians
4. **Smart Pathfinding**: Vehicles off-road will path to nearest road first
5. **Distance-Based Strength**: Further from road = stronger correction

### Algorithm Changes
```javascript
// OLD: Find road center
const roadCenterX = road.x + road.width / 2;
const roadCenterY = road.y + road.height / 2;

// NEW: Find nearest edge point
closestX = Math.max(road.x, Math.min(this.x, road.x + road.width));
closestY = Math.max(road.y, Math.min(this.y, road.y + road.height));
```

## Future Enhancements

- Add lane preference (left/right side of road)
- Implement traffic rules (stop at intersections)
- Add road type awareness (highways vs streets)
- Pathfinding that prefers roads but allows shortcuts
- Different road preference by vehicle type (sports cars more aggressive)
