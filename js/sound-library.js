// Sound Library - Free royalty-free sound definitions
// Uses jsfxr.com style sound generation and external sources

const SoundLibrary = {
  // Free sound sources you can use:
  // 1. OpenGameArt.org - CC0/CC-BY licensed game sounds
  // 2. Freesound.org - Creative Commons sounds
  // 3. ZzFX - Procedural generation (already included)
  // 4. jsfxr - Sound effect generator

  // Sound file mappings (add your own sound files here)
  externalSounds: {
    // Example structure - uncomment and add your own files:
    // 'pistol_shot': 'sounds/weapons/pistol.mp3',
    // 'car_engine': 'sounds/vehicles/engine.mp3',
    // 'explosion_big': 'sounds/effects/explosion.mp3',
  },

  // Enhanced ZzFX presets with better quality
  zzfxPresets: {
    // Weapons
    pistol: [
      1.5,
      ,
      129,
      0.01,
      0.01,
      0.15,
      ,
      0.2,
      ,
      ,
      -184,
      0.05,
      0.02,
      ,
      ,
      ,
      0.04,
      0.5,
    ],
    shotgun: [2, , 925, 0.04, 0.3, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],
    machinegun: [
      1.2,
      ,
      1e3,
      0.01,
      0.01,
      0.09,
      ,
      0.2,
      ,
      ,
      -184,
      0.05,
      0.02,
      ,
      ,
      ,
      0.04,
      0.5,
    ],
    rifle: [
      1.8,
      ,
      1675,
      0.01,
      0.01,
      0.2,
      ,
      0.2,
      ,
      ,
      -184,
      0.05,
      0.02,
      ,
      ,
      ,
      0.04,
      0.5,
    ],
    rocket_shot: [2, , 20, 0.04, 0.4, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],

    // Explosions
    explosion: [3, , 1e3, 0.02, 0.2, 0.3, 4, 1.9, , , -184, 0.1, 0.01],
    car_explosion: [
      3.5,
      ,
      925,
      0.04,
      0.3,
      0.6,
      1,
      0.3,
      ,
      6.27,
      -184,
      0.09,
      0.17,
    ],
    tank_explosion: [4, , 20, 0.04, 0.4, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],

    // Vehicles
    car_engine: [0.8, 0.5, 270, , 0.04, 0.3, 1, 1.9, , , , , , , , 0.1, 0.01],
    car_horn: [1.2, , 539, , 0.04, 0.29, 1, 1.88, , , , , , , , 0.1, 0.01],
    car_damage: [1.5, , 925, 0.04, 0.3, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],
    car_skid: [1, , 1e3, 0.02, 0.2, 0.3, 4, 1.9, , , -184, 0.1, 0.01],

    // UI & Pickups
    pickup: [1, , 1046, 0.04, 0.09, 0.17, , 0.46, , , , , , , , 0.1],
    powerup_pickup: [1.5, , 261.6, 0.02, 0.05, 0.15, 1, 0.5, , , , , , , , 0.1],
    weapon_pickup: [1.2, , 523.3, 0.04, 0.1, 0.2, , 0.5, , , , , , , , 0.1],
    heal: [1.5, , 659.3, 0.02, 0.1, 0.2, , 0.5, , , , , , , , 0.1],
    level_up: [2, , 523.3, 0.04, 0.1, 0.2, , 0.5, , , , , , , , 0.1],
    achievement: [2, , 659.3, 0.02, 0.1, 0.2, , 0.5, , , , , , , , 0.1],

    // Police & Alerts
    police_siren: [1.5, 0.5, 270, , 0.04, 0.3, 1, 1.9, , , , , , , , 0.1, 0.01],
    wanted_increase: [
      1.8,
      ,
      925,
      0.04,
      0.3,
      0.6,
      1,
      0.3,
      ,
      6.27,
      -184,
      0.09,
      0.17,
    ],

    // Impacts
    impact: [1, , 1e3, 0.02, 0.2, 0.3, 4, 1.9, , , -184, 0.1, 0.01],
    metal_hit: [1.5, , 925, 0.04, 0.3, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],

    // Environment
    thunder: [2.5, , 20, 0.04, 0.4, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],
    rain: [0.5, , 1e3, 0.02, 0.2, 0.3, 4, 1.9, , , -184, 0.1, 0.01, 0.5],
    wind: [0.4, , 100, 0.02, 0.2, 0.3, 4, 1.9, , , -184, 0.1, 0.01, 0.3],

    // Tank sounds
    tank_cannon: [3, , 100, 0.04, 0.4, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],
    tank_machinegun: [
      1.5,
      ,
      1e3,
      0.01,
      0.01,
      0.09,
      ,
      0.2,
      ,
      ,
      -184,
      0.05,
      0.02,
      ,
      ,
      ,
      0.04,
      0.5,
    ],
    tank_spawn: [2, , 270, , 0.04, 0.3, 1, 1.9, , , , , , , , 0.1, 0.01],
    tank_damage: [2, , 925, 0.04, 0.3, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],

    // Zone & Traffic
    zone_enter: [1, , 1046, 0.04, 0.09, 0.17, , 0.46, , , , , , , , 0.1],
    traffic_light: [0.8, , 880, 0.01, 0.05, 0.1, , 0.3, , , , , , , , 0.1],
  },

  /**
   * Initialize sound library
   * @param {EnhancedAudioManager} audioManager - Audio manager instance
   */
  async init(audioManager) {
    console.log("Initializing Sound Library...");

    // Load external sounds if any are defined
    const soundsToLoad = Object.keys(this.externalSounds).length;
    if (soundsToLoad > 0) {
      console.log(`Loading ${soundsToLoad} external sounds...`);
      try {
        await audioManager.loadSounds(this.externalSounds);
        console.log("External sounds loaded successfully");
      } catch (error) {
        console.warn("Some external sounds failed to load:", error);
      }
    }

    // Update ZzFXSounds with our enhanced presets
    if (typeof ZzFXSounds !== "undefined") {
      Object.assign(ZzFXSounds, this.zzfxPresets);
      console.log("ZzFX presets updated");
    }

    console.log("Sound Library initialized");
  },

  /**
   * Add external sound file
   * @param {string} name - Sound identifier
   * @param {string} url - URL to sound file
   */
  addSound(name, url) {
    this.externalSounds[name] = url;
  },

  /**
   * Add multiple sound files
   * @param {Object} sounds - Map of name: url pairs
   */
  addSounds(sounds) {
    Object.assign(this.externalSounds, sounds);
  },

  /**
   * Get recommended free sound sources
   */
  getFreeSoundSources() {
    return {
      websites: [
        {
          name: "OpenGameArt.org",
          url: "https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=13",
          license: "CC0, CC-BY, GPL",
          description: "Large collection of game sounds",
        },
        {
          name: "Freesound.org",
          url: "https://freesound.org/",
          license: "CC0, CC-BY",
          description: "Collaborative database of sounds",
        },
        {
          name: "Sonniss Game Audio",
          url: "https://sonniss.com/gameaudiogdc",
          license: "Royalty-free",
          description: "Annual GDC sound library bundle",
        },
        {
          name: "ZapSplat",
          url: "https://www.zapsplat.com/",
          license: "Free with attribution",
          description: "Sound effects library",
        },
        {
          name: "BBC Sound Effects",
          url: "https://sound-effects.bbcrewind.co.uk/",
          license: "RemArc License",
          description: "BBC archive sounds",
        },
      ],
      tools: [
        {
          name: "jsfxr",
          url: "https://sfxr.me/",
          description: "Browser-based sound effect generator",
        },
        {
          name: "ChipTone",
          url: "https://sfbgames.itch.io/chiptone",
          description: "Retro sound effect generator",
        },
        {
          name: "Bfxr",
          url: "https://www.bfxr.net/",
          description: "Sound effect synthesizer",
        },
      ],
    };
  },
};

// Auto-initialize when audio manager is ready
if (typeof audioManager !== "undefined") {
  SoundLibrary.init(audioManager).catch(console.error);
}
