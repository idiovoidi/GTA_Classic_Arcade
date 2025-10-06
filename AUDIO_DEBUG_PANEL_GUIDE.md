# 🔊 Audio Debug Panel Guide

## What Is This?

A visual debug panel that shows audio logs directly in the game window - no need to open browser console!

## How to Use

### Step 1: Open the Game

```
index.html
```

### Step 2: Press F9

The debug panel will appear in the top-right corner showing all audio activity.

### Step 3: Do Something

- Fire a weapon (click mouse)
- Drive around (WASD)
- Hit something

### Step 4: Watch the Logs

The panel shows real-time audio logs with color coding:

- 🟢 Green (✓) = Success
- 🔵 Cyan (ℹ) = Info
- 🟡 Yellow (⚠) = Warning
- 🔴 Red (✗) = Error

## Panel Controls

**F9** - Toggle panel on/off  
**Clear** button - Clear all logs  
**Hide** button - Hide panel

## What You'll See

### Good Output (Working)

```
✓ playSound: pistol, vol: 0.80, enabled: true, context: running
ℹ Generating: pistol, pitch: 1
ℹ createBuffer: pistol, pitch: 1
ℹ Buffer: len=4410, dur=0.10s
ℹ Calling generator: pistol
✓ Buffer created ✓
✓ Generated OK: pistol_1.00
```

### Bad Output (Failing)

```
✗ Cannot play sound - enabled: false, context: true
```

OR

```
ℹ Generating: pistol, pitch: 1
ℹ createBuffer: pistol, pitch: 1
✗ createSoundBuffer returned NULL for: pistol
```

## Color Guide

| Color     | Icon | Meaning                          |
| --------- | ---- | -------------------------------- |
| 🟢 Green  | ✓    | Success - sound generated/played |
| 🔵 Cyan   | ℹ    | Info - normal operation          |
| 🟡 Yellow | ⚠    | Warning - potential issue        |
| 🔴 Red    | ✗    | Error - something failed         |

## Common Patterns

### Pattern 1: Sound Playing Successfully

```
ℹ playSound: car_engine, vol: 0.30, enabled: true, context: running
ℹ Using cached: car_engine_1.00
```

**Meaning:** Sound is cached and playing from cache (fast!)

### Pattern 2: First Time Sound

```
ℹ playSound: pistol, vol: 0.80, enabled: true, context: running
ℹ Generating: pistol, pitch: 1
ℹ createBuffer: pistol, pitch: 1
ℹ Buffer: len=4410, dur=0.10s
ℹ Calling generator: pistol
✓ Buffer created ✓
✓ Generated OK: pistol_1.00
```

**Meaning:** Sound generated for first time, now cached

### Pattern 3: Audio Context Suspended

```
✗ Cannot play sound - enabled: true, context: false
```

**Meaning:** Audio context not initialized or suspended

### Pattern 4: Audio Disabled

```
✗ Cannot play sound - enabled: false, context: true
```

**Meaning:** Audio manager is disabled

## Troubleshooting

### No Panel Appears

- Press F9 to toggle
- Check if `js/debug-audio.js` is loaded
- Look for "[AudioDebug] Debug panel loaded" in console

### Panel Shows No Logs

- Make sure sounds are being triggered
- Fire weapon or drive car
- Check if audio manager exists: `game.audioManager`

### Too Many Logs

- Click "Clear" button to reset
- Panel keeps last 50 logs only

### Panel Blocks View

- Click "Hide" button
- Or press F9 to toggle off
- Drag it if needed (not implemented yet)

## What to Look For

### When Sounds Work

You should see:

1. `playSound` called
2. Either "Using cached" OR "Generating"
3. If generating: "Buffer created ✓"
4. "Generated OK" with cache key

### When Sounds Fail

Look for:

1. Red error messages (✗)
2. "returned NULL" messages
3. Missing steps in the sequence
4. "enabled: false" or "context: false"

## Keyboard Shortcuts

| Key | Action                                  |
| --- | --------------------------------------- |
| F9  | Toggle debug panel                      |
| F12 | Open browser console (for more details) |
| E   | Test engine sound manually              |

## Tips

1. **Keep panel open** while testing
2. **Watch for patterns** - do some sounds work but not others?
3. **Check timestamps** - are sounds being called too frequently?
4. **Look for errors** - red messages show what's failing
5. **Compare with test file** - does test-audio-simple.html show same logs?

## Example Debug Session

### Test 1: Fire Weapon

1. Open game
2. Press F9 to show panel
3. Click mouse to fire
4. Watch panel for pistol_shot logs

**Expected:**

```
ℹ playSound: pistol_shot, vol: 0.80
ℹ Generating: pistol_shot, pitch: 1
✓ Generated OK: pistol_shot_1.00
```

### Test 2: Drive Car

1. Press WASD to move
2. Watch panel for car_engine logs

**Expected:**

```
ℹ playSound: car_engine, vol: 0.30, enabled: true
ℹ Generating: car_engine, pitch: 1.00
✓ Generated OK: car_engine_1.00
```

### Test 3: Check Cache

1. Fire weapon again
2. Should see "Using cached" instead of "Generating"

**Expected:**

```
ℹ playSound: pistol_shot, vol: 0.80
ℹ Using cached: pistol_shot_1.00
```

## Sharing Debug Info

When reporting issues, share:

1. Screenshot of debug panel
2. Or copy/paste the log messages
3. Note what action triggered the logs
4. Mention if sounds work or not

## Advanced

### Manual Logging

You can add your own logs:

```javascript
// In browser console
logAudio("Testing custom message", "info");
logAudio("This is a warning", "warn");
logAudio("This is an error", "error");
logAudio("This is success", "success");
```

### Access Panel Programmatically

```javascript
// Show panel
audioDebug.show();

// Hide panel
audioDebug.hide();

// Clear logs
audioDebug.clear();

// Add log
audioDebug.log("Custom message", "info");
```

## Summary

✅ **F9** to toggle panel  
✅ **Real-time** audio logs  
✅ **Color-coded** for easy reading  
✅ **No console needed** - everything in-game  
✅ **Auto-shows** on first audio event

This makes debugging audio issues much easier! 🎯

---

**Try it now:** Open game, press F9, fire weapon, watch the logs!
