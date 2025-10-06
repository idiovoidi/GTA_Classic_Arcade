# 🎵 Audio System - Quick Start

## 5-Minute Setup

### Step 1: Test Current System
```bash
# Open in browser
test-audio.html
```
Click buttons to hear the current procedural sounds.

### Step 2: Download Free Sounds (Optional)

**Easiest Option - OpenGameArt.org:**
1. Go to https://opengameart.org/
2. Search for "gun shot", "explosion", "car engine"
3. Download CC0 or CC-BY licensed sounds
4. Save to `sounds/` folder

**Quick Pack Recommendations:**
- [8-bit Sound Effects](https://opengameart.org/content/512-sound-effects-8-bit-style) - Retro style
- [Universal Sound FX](https://opengameart.org/content/universal-sound-fx) - Modern style
- [Vehicle Sounds](https://opengameart.org/content/car-engine-loop-96khz) - Car sounds

### Step 3: Add Your Sounds

Copy the example config:
```bash
copy js/sound-config.example.js js/sound-config.js
```

Edit `js/sound-config.js` and uncomment the sounds you added:
```javascript
externalSounds: {
    'pistol': 'sounds/weapons/pistol.mp3',
    'explosion': 'sounds/effects/explosion.mp3',
    // Add more...
}
```

### Step 4: Play!
Open `index.html` - your sounds will load automatically!

## No Files? No Problem!

The game works perfectly without any sound files using:
- **ZzFX** - High-quality procedural sounds
- **Fallback** - Original procedural system

## Quick API Reference

### Play a Sound
```javascript
// Simple
audioManager.playSound('explosion', 0.8);

// With position (3D audio)
audioManager.playSound('explosion', x, y);

// With options
audioManager.playExternalSound('explosion', {
    volume: 0.8,
    pitch: 1.0,
    loop: false,
    x: 100,
    y: 200
});
```

### Load Custom Sound
```javascript
await audioManager.loadSound('my_sound', 'sounds/my_sound.mp3');
audioManager.playSound('my_sound', 0.8);
```

### Play Music
```javascript
await audioManager.loadSound('music', 'sounds/music.mp3');
await audioManager.playMusic('music', 2000); // 2s fade
```

### Control Volume
```javascript
audioManager.masterVolume = 0.7;
audioManager.sfxVolume = 0.8;
audioManager.musicVolume = 0.6;
```

## Available Sounds

All these work out-of-the-box with ZzFX:

**Weapons:** pistol, shotgun, machinegun, rifle, rocket_shot
**Explosions:** explosion, car_explosion, tank_explosion
**Vehicles:** car_engine, car_horn, car_damage, car_skid
**UI:** pickup, powerup_pickup, weapon_pickup, heal, level_up
**Police:** police_siren, wanted_increase
**Environment:** thunder, rain, wind, zone_enter

## Free Sound Sources

1. **OpenGameArt.org** ⭐ - https://opengameart.org/
2. **Freesound.org** - https://freesound.org/
3. **Sonniss GDC** ⭐ - https://sonniss.com/gameaudiogdc
4. **jsfxr** (generator) - https://sfxr.me/

## Troubleshooting

**No sound?**
- Click anywhere first (browser requirement)
- Check console for errors
- Verify volume isn't at 0

**Sounds not loading?**
- Check file paths in sound-config.js
- Look for 404 errors in Network tab
- Verify files are MP3 or OGG format

## That's It!

The system is already working. Adding custom sounds is optional but makes it sound even better!

For more details, see `AUDIO_GUIDE.md`
