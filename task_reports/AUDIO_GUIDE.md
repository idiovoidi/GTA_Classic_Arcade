# 🔊 Enhanced Audio System Guide

## Overview

The game now features a hybrid audio system that combines:
- **ZzFX** - Lightweight procedural sound generation (no files needed)
- **External Sound Files** - High-quality pre-recorded sounds
- **Fallback System** - Automatic degradation if sounds aren't available

## Quick Start

### Testing the Audio System

1. Open `test-audio.html` in your browser
2. Click any button to test different sounds
3. Adjust volume controls to test mixing

### Adding Your Own Sounds

#### Option 1: Quick Setup (Recommended)

1. Download sounds from free sources (see below)
2. Place them in the `sounds/` directory
3. Edit `js/sound-library.js`:

```javascript
externalSounds: {
    'pistol': 'sounds/weapons/pistol.mp3',
    'explosion': 'sounds/effects/explosion.mp3',
    'car_engine': 'sounds/vehicles/engine.mp3',
}
```

4. Reload the game - sounds will load automatically!

#### Option 2: Dynamic Loading

Load sounds at runtime:

```javascript
// In your game code
await audioManager.loadSound('custom_sound', 'sounds/custom.mp3');

// Play it
audioManager.playSound('custom_sound', 0.8);
```

## Free Sound Resources

### Best Sources for Game Audio

1. **OpenGameArt.org** ⭐ Recommended
   - URL: https://opengameart.org/
   - License: CC0, CC-BY, GPL
   - Perfect for game-specific sounds

2. **Freesound.org**
   - URL: https://freesound.org/
   - License: CC0, CC-BY
   - Huge library of general sounds

3. **Sonniss GDC Bundle** ⭐ Professional Quality
   - URL: https://sonniss.com/gameaudiogdc
   - License: Royalty-free
   - Released annually, 30GB+ of pro sounds

4. **ZapSplat**
   - URL: https://www.zapsplat.com/
   - License: Free with attribution
   - Wide variety

5. **BBC Sound Effects**
   - URL: https://sound-effects.bbcrewind.co.uk/
   - License: RemArc (personal/educational)
   - Unique historical sounds

### Sound Generation Tools

Create your own retro game sounds:

1. **jsfxr** - https://sfxr.me/
   - Browser-based, instant results
   - Export as .wav

2. **ChipTone** - https://sfbgames.itch.io/chiptone
   - Advanced 8-bit/16-bit sounds
   - Great for retro games

3. **Bfxr** - https://www.bfxr.net/
   - Classic sound effect generator
   - Easy to use

## Sound Categories

### Weapons
- `pistol` - Pistol shot
- `shotgun` - Shotgun blast
- `machinegun` - Machine gun fire
- `rifle` - Rifle shot
- `rocket_shot` - Rocket launcher

### Explosions
- `explosion` - Generic explosion
- `car_explosion` - Vehicle explosion
- `tank_explosion` - Tank explosion

### Vehicles
- `car_engine` - Engine running
- `car_horn` - Horn beep
- `car_damage` - Impact/damage
- `car_skid` - Tire skid

### UI & Pickups
- `pickup` - Item pickup
- `powerup_pickup` - Power-up collected
- `weapon_pickup` - Weapon collected
- `heal` - Health restored
- `level_up` - Level up
- `achievement` - Achievement unlocked

### Police & Alerts
- `police_siren` - Police siren
- `wanted_increase` - Wanted level up

### Environment
- `thunder` - Thunder clap
- `rain` - Rain ambient
- `wind` - Wind ambient
- `zone_enter` - Zone transition
- `traffic_light` - Traffic light change

### Military
- `tank_cannon` - Tank cannon fire
- `tank_machinegun` - Tank MG
- `tank_spawn` - Tank appears
- `tank_damage` - Tank hit

## Advanced Usage

### 3D Positional Audio

Sounds automatically pan based on position:

```javascript
// Play sound at specific position
audioManager.playSound('explosion', x, y);

// Or with options
audioManager.playExternalSound('explosion', {
    x: 100,
    y: 200,
    volume: 0.8
});
```

### Music System

Play background music with crossfade:

```javascript
// Load music
await audioManager.loadSound('menu_music', 'sounds/music/menu.mp3');
await audioManager.loadSound('game_music', 'sounds/music/gameplay.mp3');

// Play with crossfade
await audioManager.playMusic('menu_music', 2000); // 2 second fade

// Switch tracks
await audioManager.playMusic('game_music', 2000);

// Stop music
audioManager.stopMusic(2000);
```

### Volume Control

```javascript
// Set master volume
audioManager.masterVolume = 0.7;
audioManager.masterGain.gain.value = 0.7;

// Set SFX volume
audioManager.sfxVolume = 0.8;
audioManager.sfxGain.gain.value = 0.8;

// Set music volume
audioManager.musicVolume = 0.6;
audioManager.musicGain.gain.value = 0.6;
```

### Sound Control

Get control over playing sounds:

```javascript
const sound = audioManager.playExternalSound('car_engine', {
    volume: 0.5,
    loop: true
});

// Later...
sound.setVolume(0.8);
sound.updatePosition(newX, newY);
sound.stop(1000); // Fade out over 1 second
```

## File Format Recommendations

- **Format**: MP3 or OGG (best browser support)
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192 kbps (good balance)
- **Channels**: Mono for SFX, Stereo for music
- **Length**: Keep SFX under 2 seconds

## Performance Tips

1. **Preload Important Sounds** - Load frequently used sounds at startup
2. **Use Mono for SFX** - Smaller files, 3D positioning works better
3. **Compress Music** - Use lower bitrate for background music
4. **Limit Simultaneous Sounds** - Browser limit is ~32 sounds
5. **Use Sound Pooling** - Reuse sound instances when possible

## License Compliance

When using external sounds:

1. ✅ Check the license
2. ✅ Provide attribution if required
3. ✅ Keep license info with files
4. ✅ Create a CREDITS.txt file

Example credits:

```
Sound Effects Credits:

Pistol Shot - by John Doe (CC-BY 3.0)
Source: https://freesound.org/people/johndoe/sounds/12345/

Car Engine - by Jane Smith (CC0)
Source: https://opengameart.org/content/car-engine

Music - "Action Theme" by Composer Name (CC-BY 4.0)
Source: https://...
```

## Troubleshooting

### No Sound Playing

1. Check browser console for errors
2. Ensure audio context is resumed (requires user interaction)
3. Check volume levels aren't at 0
4. Verify sound files are loading (check Network tab)

### Sounds Cut Off

- Browser limit reached (max ~32 simultaneous sounds)
- Reduce number of concurrent sounds
- Use sound pooling

### Poor Performance

- Too many sounds loading at once
- Use lazy loading for non-critical sounds
- Reduce file sizes
- Use procedural sounds for less important effects

### Sounds Not Loading

- Check file paths are correct
- Verify CORS settings if loading from CDN
- Check browser console for 404 errors
- Ensure files are in correct format

## Current Implementation Status

✅ ZzFX integration (procedural sounds)
✅ Enhanced audio manager with external file support
✅ 3D positional audio
✅ Music system with crossfade
✅ Volume controls
✅ Sound library system
✅ Automatic fallback system
✅ Test page for audio system

## Next Steps

1. Download sounds from free sources
2. Add them to `sounds/` directory
3. Update `js/sound-library.js` with file paths
4. Test with `test-audio.html`
5. Play the game and enjoy better audio!

## Example Sound Pack Structure

```
sounds/
├── weapons/
│   ├── pistol.mp3 (from OpenGameArt)
│   ├── shotgun.mp3 (from Freesound)
│   └── explosion.mp3 (from Sonniss)
├── vehicles/
│   ├── engine-idle.mp3
│   ├── engine-rev.mp3
│   └── crash.mp3
├── ui/
│   ├── pickup.mp3
│   └── menu-click.mp3
└── music/
    ├── menu.mp3
    └── gameplay.mp3
```

Total size: ~5-10MB for complete sound pack

---

**Need Help?** Check `sounds/README.md` for more details or open `test-audio.html` to test the system.
