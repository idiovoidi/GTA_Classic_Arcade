# Window Size Update

## Changes Made

Made windows **wider and more prominent** on building edges.

## Before vs After

### Before
```
Window size: 8x6 pixels (small)
Spacing: 15 pixels
Coverage: ~70% of walls
Edge offset: 12 pixels
```

### After
```
Window size: 12x8 pixels (50% larger!)
Spacing: 16 pixels
Coverage: ~80% of walls
Edge offset: 14 pixels
Position: Closer to edges (1px from edge)
```

## Visual Comparison

### Before (Small Windows)
```
┌─────────────────┐
│ ▪  ▪  ▪  ▪  ▪  │  Small, sparse
│ ┌─────────────┐ │
│▪│   ROOF      │▪│
│▪│             │▪│
│ └─────────────┘ │
│ ▪  ▪  ▪  ▪  ▪  │
└─────────────────┘
```

### After (Wider Windows)
```
┌─────────────────┐
│▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪│  Wider, more coverage
│▪┌─────────────┐▪│
│▪│   ROOF      │▪│
│▪│             │▪│
│▪└─────────────┘▪│
│▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪│
└─────────────────┘
```

## Specific Changes

### Window Dimensions
- **Horizontal windows** (top/bottom): 12px wide × 8px tall
- **Vertical windows** (left/right): 8px wide × 12px tall
- **50% larger** than before!

### Window Placement
- **Closer to edges**: 1px from edge (was 2px)
- **Better coverage**: 80% spawn chance (was 70%)
- **More visible**: Takes up more wall space

### Spacing
- **Slightly increased**: 16px spacing (was 15px)
- **Better distribution**: More even coverage
- **Corner offset**: 14px from corners (was 12px)

## Benefits

1. **More visible** - Easier to see and target
2. **Better coverage** - More of the wall is windows
3. **More satisfying** - Bigger targets to break
4. **More realistic** - Buildings look more windowed
5. **Better gameplay** - Easier to shoot through

## Visual Impact

### Small Buildings (50x50)
- Before: ~6-8 windows per side
- After: ~6-8 windows per side (but wider!)

### Medium Buildings (70x70)
- Before: ~8-10 windows per side
- After: ~8-10 windows per side (but wider!)

### Large Buildings (100x100)
- Before: ~12-15 windows per side
- After: ~12-15 windows per side (but wider!)

## Code Changes

**File**: `js/building.js`
**Method**: `generateWindows()`

```javascript
// Old
const windowSize = 8;
const spacing = 15;

// New
const windowWidth = 12;   // 50% wider!
const windowHeight = 8;   // 33% taller!
const spacing = 16;
```

## Result

Windows are now **much more prominent** and take up more of the wall space, making buildings look more realistic and providing better targets for shooting! 🪟✨

The windows are:
- ✅ 50% wider (12px vs 8px)
- ✅ 33% taller (8px vs 6px)
- ✅ Closer to edges (1px vs 2px)
- ✅ More coverage (80% vs 70%)
- ✅ Better distributed

Perfect for tactical gameplay and visual appeal!
