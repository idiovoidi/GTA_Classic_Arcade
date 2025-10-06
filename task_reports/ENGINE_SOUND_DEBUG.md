# 🚗 Engine Sound Debugging Guide

## Quick Test

1. **Open the game** (`index.html`)
2. **Open browser console** (F12)
3. **Press 'E' key** - This will manually test the engine sound
4. **Drive with WASD** - Engine should play automatically

## What to Look For in Console

### When Game Loads
```
[Audio] Attempting to resume audio...
[Audio] Audio Manager enabled: true
[Audio] Audio Context state: suspended
[Audio] ✓ Audio context resumed successfully
[Audio] Sample rate: 44100
```

### When You Press 'E'
```
[Test] Playing engine sound manually
[Audio] Playing sound: car_engine, volume: 0.5, enabled: true, context: running
[Test] Engine sound result: [Object]
```

### When You Drive (WASD)
```
[Player] Starting engine sound, speed: 2.50, volume: 0.30, pitch: 1.00
[Audio] Playing sound: car_engine, volume: 0.3, enabled: true, context: running
```

## Common Issues

### Issue 1: "Audio Context state: suspended"

**Symptom:**
```
[Audio] Audio Context state: suspended
```

**Solution:**
- Click anywhere on the page
- Press any key
- The audio context should auto-resume

### Issue 2: "Audio Manager enabled: false"

**Symptom:**
```
[Audio] Audio Manager enabled: false
```

**Solution:**
Open console and type:
```javascript
game.audioManager.enabled = true;
```

### Issue 3: No console messages at all

**Symptom:**
- No audio-related messages in console
- No sound when driving

**Solution:**
1. Check if game loaded properly
2. Type in console:
   ```javascript
   console.log('Audio Manager:', game.audioManager);
   console.log('Player:', game.player);
   ```

### Issue 4: "Engine sound failed to play!"

**Symptom:**
```
[Player] Starting engine sound...
[Player] Engine sound failed to play!
```

**Solution:**
1. Check audio context state:
   ```javascript
   console.log(game.audioManager.audioContext.state);
   ```
2. Try resuming manually:
   ```javascript
   game.audioManager.audioContext.resume();
   ```

### Issue 5: Sound plays but stops immediately

**Symptom:**
- Brief sound then silence
- Console shows sound starting but not continuing

**Solution:**
- This is a looping issue
- Check if `loop` parameter is being passed correctly
- Try manual test with 'E' key

## Manual Tests

### Test 1: Check Audio Manager
```javascript
// Open console (F12) and type:
console.log('Audio Manager exists:', !!game.audioManager);
console.log('Audio enabled:', game.audioManager.enabled);
console.log('Audio context:', game.audioManager.audioContext);
console.log('Context state:', game.audioManager.audioContext.state);
```

### Test 2: Resume Audio
```javascript
// Force resume audio context
game.audioManager.audioContext.resume().then(() => {
    console.log('Audio resumed!');
});
```

### Test 3: Play Engine Sound Manually
```javascript
// Play engine sound (non-looping)
game.audioManager.playSound('car_engine', 0.5, 1.0, false);

// Play engine sound (looping)
const sound = game.audioManager.playSound('car_engine', 0.5, 1.0, true);
console.log('Sound object:', sound);
```

### Test 4: Check Player State
```javascript
// Check if player is moving
console.log('Player speed:', game.player.speed);
console.log('Player engine sound:', game.player.engineSound);
```

### Test 5: Force Engine Sound
```javascript
// Force play engine sound
game.player.engineSound = game.audioManager.playSound('car_engine', 0.5, 1.0, true);
```

## Step-by-Step Debugging

### Step 1: Verify Audio System
1. Open `test-audio-simple.html`
2. Click "Car Engine" button
3. If this works, audio system is fine

### Step 2: Check Game Audio
1. Open `index.html`
2. Open console (F12)
3. Look for audio initialization messages
4. Click anywhere to resume audio

### Step 3: Test Manual Engine Sound
1. Press 'E' key
2. Check console for messages
3. Should hear engine sound

### Step 4: Test Automatic Engine Sound
1. Press WASD to move
2. Check console for player messages
3. Should hear engine sound while moving

### Step 5: Check for Errors
1. Look for red errors in console
2. Check if any audio-related errors
3. Note the exact error message

## Expected Behavior

### When Working Correctly

**Console output:**
```
[Audio] Attempting to resume audio...
[Audio] Audio Manager enabled: true
[Audio] Audio Context state: running
[Audio] ✓ Audio context resumed successfully

[Player] Starting engine sound, speed: 2.50, volume: 0.30, pitch: 1.00
[Audio] Playing sound: car_engine, volume: 0.3, enabled: true, context: running
```

**What you hear:**
- Engine sound starts when you press WASD
- Engine pitch increases with speed
- Engine volume increases with speed
- Engine stops when you stop moving

### Sound Characteristics

**Idle (slow speed):**
- Lower pitch (0.8)
- Quieter volume (0.2)
- Deep rumble

**High speed:**
- Higher pitch (1.4)
- Louder volume (0.5)
- More aggressive sound

## Quick Fixes

### Fix 1: Force Audio Resume
```javascript
// In console
game.audioManager.audioContext.resume();
game.audioManager.enabled = true;
```

### Fix 2: Restart Audio Manager
```javascript
// In console
game.audioManager = new EnhancedAudioManager();
```

### Fix 3: Force Engine Sound
```javascript
// In console
game.player.engineSound = game.audioManager.playSound('car_engine', 0.5, 1.0, true);
```

### Fix 4: Reload Page
```
Ctrl+Shift+R (hard reload)
```

## Debug Checklist

- [ ] Audio context created
- [ ] Audio context state is "running"
- [ ] Audio manager enabled is true
- [ ] Player exists and has speed
- [ ] Engine sound function is being called
- [ ] No errors in console
- [ ] Clicked/pressed key to resume audio
- [ ] Test file (`test-audio-simple.html`) works

## Still Not Working?

### Collect This Info

1. **Browser and version:**
   ```javascript
   console.log(navigator.userAgent);
   ```

2. **Audio context info:**
   ```javascript
   console.log('State:', game.audioManager.audioContext.state);
   console.log('Sample rate:', game.audioManager.audioContext.sampleRate);
   console.log('Current time:', game.audioManager.audioContext.currentTime);
   ```

3. **Player info:**
   ```javascript
   console.log('Speed:', game.player.speed);
   console.log('Position:', game.player.x, game.player.y);
   console.log('Engine sound:', game.player.engineSound);
   ```

4. **Console errors:**
   - Copy any red error messages
   - Note when they appear

### Report Issue

Include:
- Browser and OS
- Console output
- What you tried
- What happened vs what should happen

---

**Quick Test:** Press 'E' key in game to manually test engine sound!
