# 🎵 Complete Sound Setup Guide

## Quick Start (5 Minutes)

### Step 1: Create Folders
```bash
# Run the setup script
setup-sounds.bat
```

Or manually create:
```
sounds/
├── weapons/
├── effects/
├── vehicles/
├── ui/
├── police/
├── ambient/
└── music/
```

### Step 2: Get Sounds

**Option A: Download Free Pack (Recommended)**
1. Go to: https://opengameart.org/content/512-sound-effects-8-bit-style
2. Click "Download"
3. Extract ZIP
4. Copy sounds to `sounds/` folders

**Option B: Generate Your Own**
1. Go to: https://sfxr.me/
2. Click preset buttons (Pickup, Explosion, Laser, etc.)
3. Click "Export WAV"
4. Save to `sounds/` folders

### Step 3: Configure

**For Downloaded Pack:**
```bash
copy js\sound-config-512pack.js js\sound-config.js
```

**For Generated Sounds:**
```bash
copy js\sound-config-jsfxr.js js\sound-config.js
```

**For Custom Setup:**
```bash
copy js\sound-config.example.js js\sound-config.js
# Then edit js/sound-config.js
```

### Step 4: Test
```bash
# Open in browser
test-audio.html
```

Click buttons to test each sound. Check console for any errors.

### Step 5: Play!
```bash
# Open in browser
index.html
```

Enjoy your game with professional audio!

---

## Detailed Instructions

### Method 1: 512 Sound Effects Pack (Easiest)

**Time:** 10 minutes  
**Quality:** Good  
**Size:** ~20MB  

1. **Download**
   - URL: https://opengameart.org/content/512-sound-effects-8-bit-style
   - License: CC0 (Public Domain)
   - Click "Download" button

2. **Extract**
   - Unzip the downloaded file
   - You'll see folders with numbered sounds

3. **Organize**
   - Listen to sounds and pick the best ones
   - Copy to appropriate folders:
     ```
     sounds/weapons/    - Laser/shoot sounds
     sounds/effects/    - Explosion sounds
     sounds/vehicles/   - Engine/movement sounds
     sounds/ui/         - Pickup/coin sounds
     sounds/police/     - Alarm sounds
     ```

4. **Configure**
   ```bash
   copy js\sound-config-512pack.js js\sound-config.js
   ```

5. **Edit Config**
   - Open `js/sound-config.js`
   - Update file names to match your chosen sounds
   - Example:
     ```javascript
     'pistol': 'sounds/weapons/laser_001.mp3',
     'explosion': 'sounds/effects/explosion_003.mp3',
     ```

6. **Test**
   - Open `test-audio.html`
   - Click buttons to verify sounds load

### Method 2: Generate with jsfxr (Custom)

**Time:** 20-30 minutes  
**Quality:** Good  
**Size:** ~5MB  

1. **Go to jsfxr**
   - URL: https://sfxr.me/
   - No download needed, works in browser

2. **Generate Sounds**
   
   **Weapons:**
   - Click "Laser/Shoot" button
   - Adjust pitch/duration
   - Export as WAV
   - Save as `pistol.wav`, `shotgun.wav`, etc.
   
   **Explosions:**
   - Click "Explosion" button
   - Adjust depth/length
   - Export as WAV
   - Save as `explosion.wav`, etc.
   
   **Pickups:**
   - Click "Pickup/Coin" button
   - Adjust tone
   - Export as WAV
   - Save as `pickup.wav`, etc.
   
   **UI:**
   - Click "Blip/Select" button
   - Export as WAV
   - Save as `zone_enter.wav`, etc.

3. **Convert to MP3** (Optional)
   - Go to: https://online-audio-converter.com/
   - Upload WAV files
   - Select MP3, 128 kbps
   - Download converted files

4. **Organize**
   - Place files in appropriate folders
   - Follow naming in `sound-config-jsfxr.js`

5. **Configure**
   ```bash
   copy js\sound-config-jsfxr.js js\sound-config.js
   ```

6. **Test**
   - Open `test-audio.html`
   - Verify all sounds work

### Method 3: Mix of Sources (Best Quality)

**Time:** 30-60 minutes  
**Quality:** Excellent  
**Size:** ~50MB  

Combine sounds from multiple sources:

1. **Weapons** - OpenGameArt
   - https://opengameart.org/content/gun-sounds
   
2. **Explosions** - Freesound
   - https://freesound.org/search/?q=explosion
   
3. **Vehicles** - Freesound
   - https://freesound.org/search/?q=car+engine
   
4. **UI** - jsfxr
   - Generate custom UI sounds
   
5. **Music** - Incompetech
   - https://incompetech.com/music/royalty-free/

Download, organize, and configure as above.

---

## Configuration Examples

### Minimal Config (10 Essential Sounds)

```javascript
const CustomSoundConfig = {
    externalSounds: {
        'pistol': 'sounds/weapons/pistol.mp3',
        'explosion': 'sounds/effects/explosion.mp3',
        'car_engine': 'sounds/vehicles/engine.mp3',
        'car_damage': 'sounds/vehicles/crash.mp3',
        'pickup': 'sounds/ui/pickup.mp3',
        'powerup_pickup': 'sounds/ui/powerup.mp3',
        'police_siren': 'sounds/police/siren.mp3',
        'impact': 'sounds/effects/impact.mp3',
        'heal': 'sounds/ui/heal.mp3',
        'level_up': 'sounds/ui/level_up.mp3',
    },
    volumes: {
        master: 0.7,
        sfx: 0.8,
        music: 0.6,
    }
};
```

### Complete Config (All Sounds)

See `js/sound-config.example.js` for full list.

### With Music

```javascript
const CustomSoundConfig = {
    externalSounds: {
        // ... your sound effects ...
        
        // Music
        'menu_music': 'sounds/music/menu.mp3',
        'gameplay_music': 'sounds/music/gameplay.mp3',
        'chase_music': 'sounds/music/chase.mp3',
    },
    music: {
        enabled: true,
        fadeTime: 2000,
    }
};
```

---

## File Naming Reference

### Weapons
- `pistol.mp3` - Pistol shot
- `shotgun.mp3` - Shotgun blast
- `machinegun.mp3` - Machine gun fire
- `rifle.mp3` - Rifle shot
- `rocket.mp3` - Rocket launch

### Explosions
- `explosion.mp3` - Generic explosion
- `car_explosion.mp3` - Vehicle explosion
- `tank_explosion.mp3` - Large explosion

### Vehicles
- `engine.mp3` - Engine running
- `horn.mp3` - Horn beep
- `crash.mp3` - Crash/damage
- `skid.mp3` - Tire skid

### UI
- `pickup.mp3` - Item pickup
- `powerup.mp3` - Power-up
- `weapon_pickup.mp3` - Weapon pickup
- `heal.mp3` - Health restore
- `level_up.mp3` - Level up
- `achievement.mp3` - Achievement

### Police
- `siren.mp3` - Police siren
- `alert.mp3` - Alert sound

### Effects
- `impact.mp3` - Generic impact
- `metal_hit.mp3` - Metal impact
- `glass_break.mp3` - Glass breaking

### Ambient
- `thunder.mp3` - Thunder
- `rain.mp3` - Rain
- `wind.mp3` - Wind

---

## Troubleshooting

### Sounds Not Loading

**Check file paths:**
```javascript
// Make sure paths match exactly
'pistol': 'sounds/weapons/pistol.mp3',  // ✓ Correct
'pistol': 'sounds/weapon/pistol.mp3',   // ✗ Wrong folder name
'pistol': 'sounds/weapons/Pistol.mp3',  // ✗ Wrong case
```

**Check browser console:**
- Press F12
- Look for 404 errors
- Verify file names match

**Check file format:**
- Use MP3 or OGG
- WAV works but is larger
- Avoid exotic formats

### Poor Sound Quality

**Use higher bitrate:**
- 128 kbps minimum
- 192 kbps recommended
- 320 kbps for music

**Check source quality:**
- Don't convert multiple times
- Use original high-quality sources
- Avoid over-compression

### Performance Issues

**Reduce file sizes:**
- Use mono for SFX
- Lower bitrate to 128 kbps
- Trim silence
- Use shorter loops

**Limit simultaneous sounds:**
- See `AUDIO_PERFORMANCE.md`
- Implement sound pooling
- Reduce audio range

---

## Testing Checklist

- [ ] All sound folders created
- [ ] Sound files downloaded/generated
- [ ] Files organized in correct folders
- [ ] Config file created (sound-config.js)
- [ ] File paths updated in config
- [ ] test-audio.html opens without errors
- [ ] All buttons in test page work
- [ ] No 404 errors in console
- [ ] Game plays with sounds
- [ ] Performance is good (60 FPS)

---

## Quick Reference

### Files You Need
```
js/sound-config.js          ← Your configuration
sounds/                     ← Your sound files
test-audio.html            ← Test page
```

### Commands
```bash
# Setup folders
setup-sounds.bat

# Copy config
copy js\sound-config-jsfxr.js js\sound-config.js

# Test
test-audio.html

# Play
index.html
```

### Resources
- Download sounds: `download-sounds.md`
- Performance tips: `AUDIO_PERFORMANCE.md`
- Complete guide: `AUDIO_GUIDE.md`
- Quick start: `AUDIO_QUICK_START.md`

---

## Summary

1. ✅ Run `setup-sounds.bat` to create folders
2. ✅ Download sounds or generate with jsfxr
3. ✅ Copy config: `copy js\sound-config-jsfxr.js js\sound-config.js`
4. ✅ Edit config to match your files
5. ✅ Test with `test-audio.html`
6. ✅ Play game!

**Total time:** 10-30 minutes depending on method  
**Result:** Professional game audio!

---

Need help? Check the other AUDIO_*.md files or open an issue!
