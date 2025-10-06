# Sound Assets Directory

This directory is for storing external sound files to enhance the game's audio.

## Recommended Structure

```
sounds/
├── weapons/
│   ├── pistol.mp3
│   ├── shotgun.mp3
│   ├── rifle.mp3
│   └── explosion.mp3
├── vehicles/
│   ├── engine.mp3
│   ├── horn.mp3
│   ├── crash.mp3
│   └── skid.mp3
├── ui/
│   ├── pickup.mp3
│   ├── powerup.mp3
│   └── menu.mp3
├── ambient/
│   ├── rain.mp3
│   ├── thunder.mp3
│   └── wind.mp3
└── music/
    ├── menu.mp3
    ├── gameplay.mp3
    └── chase.mp3
```

## Free Sound Resources

### Websites for Royalty-Free Sounds

1. **OpenGameArt.org**
   - URL: https://opengameart.org/
   - License: CC0, CC-BY, GPL
   - Best for: Game-specific sounds

2. **Freesound.org**
   - URL: https://freesound.org/
   - License: CC0, CC-BY
   - Best for: General sound effects

3. **Sonniss Game Audio GDC Bundle**
   - URL: https://sonniss.com/gameaudiogdc
   - License: Royalty-free
   - Best for: Professional quality sounds (annual bundle)

4. **ZapSplat**
   - URL: https://www.zapsplat.com/
   - License: Free with attribution
   - Best for: Wide variety of effects

5. **BBC Sound Effects**
   - URL: https://sound-effects.bbcrewind.co.uk/
   - License: RemArc License (personal/educational use)
   - Best for: Unique historical sounds

### Sound Generation Tools

1. **jsfxr** - https://sfxr.me/
   - Browser-based retro sound generator
   - Export as .wav files

2. **ChipTone** - https://sfbgames.itch.io/chiptone
   - Advanced retro sound synthesizer
   - Great for 8-bit/16-bit style sounds

3. **Bfxr** - https://www.bfxr.net/
   - Classic sound effect generator
   - Easy to use, instant results

## How to Add Sounds

### Method 1: Using the Sound Library (Recommended)

1. Download your sound files and place them in this directory
2. Open `js/sound-library.js`
3. Add your sounds to the `externalSounds` object:

```javascript
externalSounds: {
    'pistol_shot': 'sounds/weapons/pistol.mp3',
    'car_engine': 'sounds/vehicles/engine.mp3',
    'explosion_big': 'sounds/effects/explosion.mp3',
}
```

4. The sounds will automatically load when the game starts

### Method 2: Dynamic Loading

Load sounds at runtime:

```javascript
// Add a single sound
SoundLibrary.addSound('custom_sound', 'sounds/custom.mp3');

// Add multiple sounds
SoundLibrary.addSounds({
    'sound1': 'sounds/sound1.mp3',
    'sound2': 'sounds/sound2.mp3'
});

// Reload the library
await SoundLibrary.init(audioManager);
```

### Method 3: Direct Audio Manager

```javascript
// Load a sound
await audioManager.loadSound('my_sound', 'sounds/my_sound.mp3');

// Play it
audioManager.playExternalSound('my_sound', {
    volume: 0.8,
    pitch: 1.0,
    loop: false
});
```

## File Format Recommendations

- **Format**: MP3 or OGG (best browser compatibility)
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192 kbps (good quality/size balance)
- **Channels**: Mono for SFX, Stereo for music
- **Length**: Keep SFX under 2 seconds for best performance

## License Compliance

When using sounds from external sources:

1. **Check the license** - Ensure it allows use in your project
2. **Provide attribution** - If required, add credits to your game
3. **Keep records** - Save license info with each sound file
4. **Respect restrictions** - Some licenses prohibit commercial use

## Example Credits File

Create a `CREDITS.txt` file:

```
Sound Effects Credits:

Pistol Shot - by Author Name (CC-BY 3.0)
Source: https://freesound.org/...

Car Engine - by Author Name (CC0)
Source: https://opengameart.org/...

Music - by Composer Name (CC-BY 4.0)
Source: https://...
```

## Current Sound System

The game uses a hybrid approach:

1. **ZzFX** - Procedural sounds (no files needed, instant)
2. **External Files** - High-quality pre-recorded sounds
3. **Fallback** - Procedural generation if files aren't loaded

This means the game works without any sound files, but sounds better with them!
