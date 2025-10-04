# Automatic Garage Doors Feature

## Feature Added

All zone buildings now have **automatic garage doors** that open when the player approaches!

## How It Works

### Automatic Opening
- **Trigger distance**: 80 pixels from door
- **Opens automatically** when player approaches
- **Closes automatically** when player leaves
- **Smooth animation** - Slides up gradually

### Door Properties
- **Width**: 60% of building width (max 60px)
- **Height**: 12 pixels
- **Position**: Bottom wall (centered)
- **Animation speed**: 5% per frame
- **Color**: Matches zone type

## Visual Design

### Door States

**Closed (openProgress = 0):**
```
┌─────────────┐
│   BUILDING  │
│             │
│             │
│   ▓▓▓▓▓▓▓   │  ← Closed door
└─────────────┘
```

**Opening (openProgress = 0.5):**
```
┌─────────────┐
│   BUILDING  │
│             │
│   ░░░░░░░   │  ← Door sliding up
│   ▓▓▓▓▓▓▓   │  ← Half visible
└─────────────┘
```

**Open (openProgress = 1):**
```
┌─────────────┐
│   BUILDING  │
│             │
│   ░░░░░░░   │  ← Fully open
│             │  ← Can enter!
└─────────────┘
```

## Door Colors by Zone

| Zone | Door Color |
|------|-----------|
| Hospital | Dark Pink (#cc0066) |
| Police Station | Dark Blue (#0000cc) |
| Gun Shop | Dark Yellow (#cccc00) |
| Garage | Dark Orange (#cc6600) |
| Black Market | Dark Purple (#660066) |
| Safe House | Dark Green (#00cc00) |

## Door Features

### Visual Details
- **Panel lines** - 4 horizontal panels
- **Door handle** - Visible when mostly closed
- **Frame** - Dark border around door
- **Opening background** - Dark interior visible

### Animation
- **Smooth sliding** - Door slides up into building
- **Progressive reveal** - Interior gradually visible
- **Natural timing** - Takes ~20 frames to fully open
- **Responsive** - Reacts immediately to player

### Collision
- **Closed door** - Blocks entry (wall collision)
- **Open door** - Allows entry (no collision)
- **Partial open** - Proportional collision

## Configuration

### Adjust Trigger Distance
```javascript
// In zones.js, setupDoor()
this.door.triggerDistance = 100; // Open from further away
```

### Adjust Animation Speed
```javascript
// In zones.js, setupDoor()
this.door.openSpeed = 0.08; // Faster opening
```

### Adjust Door Size
```javascript
// In zones.js, setupDoor()
const doorWidth = this.width * 0.8; // Wider door (80% of building)
const doorHeight = 15; // Taller door
```

## Gameplay Benefits

1. **Automatic entry** - No button press needed to open
2. **Visual feedback** - See door opening = can enter
3. **Immersion** - Feels like real automatic doors
4. **Clear indication** - Know which buildings are accessible
5. **Smooth experience** - No jarring transitions

## Technical Details

### Door State Machine
```
Player far away → Door closed (0)
Player approaches → Door opening (0 → 1)
Player at door → Door open (1)
Player leaves → Door closing (1 → 0)
Player far away → Door closed (0)
```

### Update Logic
```javascript
1. Calculate distance to player
2. If distance < 80px → Start opening
3. If distance > 80px → Start closing
4. Animate openProgress (0 to 1)
5. Render door based on progress
```

### Rendering Order
1. Building (floor, walls, windows)
2. **Garage door** (on top of bottom wall)
3. Roof (transparent if inside)
4. Zone overlay
5. Zone icon

## Code Changes

**File:** `js/zones.js`

**New Properties:**
- `zone.door` - Door state object
  - `openProgress` - 0 to 1 animation
  - `isOpening` / `isClosing` - Animation flags
  - `triggerDistance` - Detection range
  - `width`, `height`, `x`, `y` - Door dimensions

**New Methods:**
- `setupDoor()` - Initialize door properties
- `updateDoor()` - Handle door animation
- `renderDoor()` - Draw the door
- `getDoorColor()` - Zone-specific colors

**Modified Methods:**
- `update()` - Calls `updateDoor()`
- `render()` - Calls `renderDoor()`

## Visual Examples

### Hospital Door (Pink)
```
Player far:          Player near:
┌─────────┐         ┌─────────┐
│ HOSPITAL│         │ HOSPITAL│
│    +    │         │    +    │
│  ▓▓▓▓▓  │         │  ░░░░░  │  ← Open!
└─────────┘         └─────────┘
```

### Garage Door (Orange)
```
Player far:          Player near:
┌─────────┐         ┌─────────┐
│  GARAGE │         │  GARAGE │
│   🔧    │         │   🔧    │
│  ▓▓▓▓▓  │         │  ░░░░░  │  ← Open!
└─────────┘         └─────────┘
```

### Police Station Door (Blue)
```
Player far:          Player near:
┌─────────┐         ┌─────────┐
│  POLICE │         │  POLICE │
│    ★    │         │    ★    │
│  ▓▓▓▓▓  │         │  ░░░░░  │  ← Open!
└─────────┘         └─────────┘
```

## Performance

- ✅ Minimal performance impact
- ✅ Only updates when player nearby
- ✅ Simple animation (linear interpolation)
- ✅ No physics calculations needed
- ✅ Efficient rendering

## Future Enhancements

- Add door opening sound effect
- Add door collision when partially open
- Add different door types (sliding, swinging)
- Add door damage/destruction
- Add manual door control (press E to open)
- Add locked doors (require key/money)

## Testing

1. **Approach zone building** - Door should start opening
2. **Watch animation** - Smooth sliding up
3. **Enter building** - Walk through open door
4. **Leave building** - Door should close behind you
5. **Check all zones** - Each has colored door

## Result

All zone buildings now have **automatic garage doors** that open when you approach! Makes entering buildings feel natural and provides clear visual feedback about which buildings are accessible. 🚪✨

The doors are color-coded to match each zone type and animate smoothly for a polished experience!
