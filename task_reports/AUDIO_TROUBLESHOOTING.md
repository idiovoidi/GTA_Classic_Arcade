# 🔧 Audio Troubleshooting Guide

## Fixed: Weapon and Vehicle Sounds Not Playing

### What Was Wrong
The weapon system was calling sound names like `pistol_shot`, `shotgun_shot`, etc., but the audio system only recognized `pistol`, `shotgun`, etc.

### What Was Fixed
1. ✅ Added sound name aliases in `js/audio.js`
2. ✅ Added auto-resume for audio context in `js/audio-system.js`
3. ✅ Added user interaction handler in `js/main.js`
4. ✅ Added debug logging for weapon/vehicle sounds

### How to Test

1. **Open the game**
   ```
   index.html
   ```

2. **Click anywhere** (required for browser audio)

3. **Fire a weapon** (Click mouse)
   - You should hear gunshot sounds
   - Check console for: `[Audio] Playing sound: pistol_shot`

4. **Drive a car** (WASD keys)
   - You should hear engine sounds
   - Check console for: `[Audio] Playing sound: car_engine`

5. **Check console** (F12)
   - Look for: `[Audio] Audio context resumed`
   - Look for: `[Audio] Playing sound: ...`

## Common Issues

### No Sound At All

**Symptom:** Complete silence, no sounds play

**Solutions:**

1. **Click anywhere on the page**
   - Browsers require user interaction before playing audio
   - Click, press a key, or move the mouse

2. **Check browser console (F12)**
   ```
   Look for errors like:
   - "AudioContext was not allowed to start"
   - "The AudioContext was not allowed to start"
   ```

3. **Check volume**
   - System volume not muted
   - Browser tab not muted (check tab icon)
   - Game volume settings

4. **Try different browser**
   - Chrome/Edge (recommended)
   - Firefox
   - Safari

### Sounds Cut Off or Glitchy

**Symptom:** Sounds start but stop immediately or sound distorted

**Solutions:**

1. **Check performance**
   - Open console (F12)
   - Look for FPS counter
   - Should be 60 FPS

2. **Reduce audio load**
   - Fewer simultaneous sounds
   - Lower audio quality
   - See `AUDIO_PERFORMANCE.md`

3. **Check browser resources**
   - Close other tabs
   - Close other applications
   - Restart browser

### Specific Sounds Missing

**Symptom:** Some sounds work, others don't

**Solutions:**

1. **Check console for errors**
   ```
   [Audio] Playing sound: pistol_shot, volume: 0.8, enabled: true, context: running
   ```

2. **Verify sound is implemented**
   - Check `js/audio.js` for the sound type
   - Check weapon config in `js/weapons.js`

3. **Test with test-audio.html**
   - Open `test-audio.html`
   - Click buttons to test each sound
   - Identify which sounds work

### Audio Context Suspended

**Symptom:** Console shows "Audio context suspended"

**Solutions:**

1. **Click anywhere on the page**
   - This will auto-resume the context

2. **Manual resume**
   - Open console (F12)
   - Type: `game.audioManager.audioContext.resume()`
   - Press Enter

3. **Check for errors**
   - Look for permission errors
   - Check browser audio settings

## Debug Commands

### Check Audio Status
```javascript
// Open console (F12) and type:

// Check if audio manager exists
console.log('Audio Manager:', game.audioManager);

// Check audio context state
console.log('Audio Context State:', game.audioManager.audioContext.state);

// Check if audio is enabled
console.log('Audio Enabled:', game.audioManager.enabled);

// Check volumes
console.log('Master Volume:', game.audioManager.masterVolume);
console.log('SFX Volume:', game.audioManager.sfxVolume);
```

### Test Sounds Manually
```javascript
// Open console (F12) and type:

// Test pistol sound
game.audioManager.playSound('pistol_shot', 0.8);

// Test car engine
game.audioManager.playSound('car_engine', 0.8);

// Test explosion
game.audioManager.playSound('explosion', 0.8);

// Test with position
game.audioManager.playSound('explosion', game.player.x, game.player.y);
```

### Resume Audio Context
```javascript
// Open console (F12) and type:

// Resume audio context
game.audioManager.audioContext.resume().then(() => {
    console.log('Audio resumed!');
});

// Enable audio
game.audioManager.enabled = true;

// Set volumes
game.audioManager.masterVolume = 0.7;
game.audioManager.sfxVolume = 0.8;
```

## Sound Name Reference

### Weapons
- `pistol_shot` or `pistol` - Pistol fire
- `shotgun_shot` or `shotgun` - Shotgun blast
- `uzi_shot` or `uzi` - Uzi fire
- `rifle_shot` or `rifle` - Rifle fire
- `rocket_shot` - Rocket launch

### Vehicles
- `car_engine` - Engine running
- `car_horn` - Horn beep
- `car_damage` - Crash/damage
- `car_skid` - Tire skid
- `car_explosion` - Vehicle explosion

### Effects
- `explosion` - Generic explosion
- `impact` - Impact sound
- `pickup` - Item pickup
- `powerup_pickup` - Power-up collected

### Police
- `police_siren` - Police siren
- `wanted_increase` - Wanted level up

## Browser-Specific Issues

### Chrome/Edge
- Usually works best
- May require HTTPS for some features
- Check site permissions

### Firefox
- May have stricter audio policies
- Check `about:config` for audio settings
- Try disabling tracking protection

### Safari
- Most restrictive audio policies
- Requires explicit user interaction
- May not support all Web Audio features

## Performance Issues

If sounds cause lag or frame drops:

1. **Verify ZzFX is disabled**
   ```javascript
   console.log('ZzFX enabled:', game.audioManager.soundLibraryConfig?.useZzFX);
   // Should be false or undefined
   ```

2. **Check simultaneous sounds**
   - Too many sounds at once
   - Limit to 8-10 simultaneous sounds

3. **See AUDIO_PERFORMANCE.md**
   - Complete performance guide
   - Optimization tips
   - Sound pooling

## Still Not Working?

### Collect Debug Info

1. **Open console (F12)**

2. **Run these commands:**
   ```javascript
   console.log('Browser:', navigator.userAgent);
   console.log('Audio Context:', game.audioManager.audioContext);
   console.log('Audio State:', game.audioManager.audioContext.state);
   console.log('Audio Enabled:', game.audioManager.enabled);
   console.log('Sample Rate:', game.audioManager.audioContext.sampleRate);
   ```

3. **Try test page:**
   - Open `test-audio.html`
   - Click buttons
   - Note which sounds work

4. **Check for errors:**
   - Look for red errors in console
   - Note any warnings
   - Check Network tab for 404s

### Report Issue

Include this information:
- Browser and version
- Operating system
- Console errors
- Which sounds work/don't work
- Debug info from above

## Quick Fixes

### Reset Audio System
```javascript
// Reload the page
location.reload();
```

### Force Audio Resume
```javascript
// Click anywhere, then:
game.audioManager.audioContext.resume();
game.audioManager.enabled = true;
```

### Test Individual Sound
```javascript
// Test a specific sound
game.audioManager.playSound('pistol_shot', 0.8);
```

## Summary

✅ **Most common fix:** Click anywhere on the page  
✅ **Check console:** Look for audio-related messages  
✅ **Test sounds:** Use `test-audio.html`  
✅ **Manual test:** Use console commands above  

The audio system should now work properly with weapon and vehicle sounds!
