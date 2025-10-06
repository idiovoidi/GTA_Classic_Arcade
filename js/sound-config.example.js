// Example Sound Configuration
// Copy this to sound-config.js and customize with your own sound files

const CustomSoundConfig = {
    // Add your external sound files here
    // Format: 'sound_name': 'path/to/file.mp3'
    
    externalSounds: {
        // Weapons - Download from OpenGameArt.org or Freesound.org
        // 'pistol': 'sounds/weapons/pistol.mp3',
        // 'shotgun': 'sounds/weapons/shotgun.mp3',
        // 'machinegun': 'sounds/weapons/machinegun.mp3',
        // 'rifle': 'sounds/weapons/rifle.mp3',
        // 'rocket_shot': 'sounds/weapons/rocket.mp3',
        
        // Explosions
        // 'explosion': 'sounds/effects/explosion.mp3',
        // 'car_explosion': 'sounds/effects/car_explosion.mp3',
        // 'tank_explosion': 'sounds/effects/tank_explosion.mp3',
        
        // Vehicles
        // 'car_engine': 'sounds/vehicles/engine.mp3',
        // 'car_horn': 'sounds/vehicles/horn.mp3',
        // 'car_damage': 'sounds/vehicles/crash.mp3',
        // 'car_skid': 'sounds/vehicles/skid.mp3',
        
        // UI & Pickups
        // 'pickup': 'sounds/ui/pickup.mp3',
        // 'powerup_pickup': 'sounds/ui/powerup.mp3',
        // 'weapon_pickup': 'sounds/ui/weapon_pickup.mp3',
        // 'heal': 'sounds/ui/heal.mp3',
        // 'level_up': 'sounds/ui/level_up.mp3',
        // 'achievement': 'sounds/ui/achievement.mp3',
        
        // Police & Alerts
        // 'police_siren': 'sounds/police/siren.mp3',
        // 'wanted_increase': 'sounds/police/alert.mp3',
        
        // Environment
        // 'thunder': 'sounds/ambient/thunder.mp3',
        // 'rain': 'sounds/ambient/rain.mp3',
        // 'wind': 'sounds/ambient/wind.mp3',
        
        // Music (optional)
        // 'menu_music': 'sounds/music/menu.mp3',
        // 'gameplay_music': 'sounds/music/gameplay.mp3',
        // 'chase_music': 'sounds/music/chase.mp3',
    },
    
    // Music tracks configuration
    music: {
        // enabled: true,
        // tracks: {
        //     menu: 'sounds/music/menu.mp3',
        //     gameplay: 'sounds/music/gameplay.mp3',
        //     chase: 'sounds/music/chase.mp3',
        //     victory: 'sounds/music/victory.mp3',
        // },
        // fadeTime: 2000, // Crossfade duration in ms
    },
    
    // Volume settings
    volumes: {
        master: 0.7,
        sfx: 0.8,
        music: 0.6,
    },
    
    // ZzFX settings (disabled by default for performance)
    // Only enable if you want ZzFX sounds and can handle the performance cost
    // useZzFX: false,
    
    // 3D Audio settings
    spatialAudio: {
        maxDistance: 800,      // Maximum hearing distance
        referenceDistance: 100, // Distance where volume is 100%
        rolloffFactor: 1,      // How quickly sound fades with distance
    }
};

// Apply configuration if audio manager exists
if (typeof audioManager !== 'undefined' && audioManager && audioManager.initSoundLibrary) {
    // Initialize sound library with custom configuration
    audioManager.initSoundLibrary(CustomSoundConfig).then(() => {
        console.log('Custom sound configuration loaded successfully');
    }).catch(error => {
        console.warn('Failed to load custom sound configuration:', error);
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomSoundConfig;
}
