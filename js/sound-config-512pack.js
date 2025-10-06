// Sound Configuration for "512 Sound Effects" Pack
// Download from: https://opengameart.org/content/512-sound-effects-8-bit-style
// 
// After downloading:
// 1. Extract the ZIP file
// 2. Copy sounds to sounds/ folder following the structure below
// 3. Rename this file to sound-config.js (or copy contents to sound-config.js)
// 4. Reload the game

const CustomSoundConfig = {
    externalSounds: {
        // Weapons - Map to appropriate sounds from the pack
        // You'll need to listen to the pack and pick the best matches
        // Example mappings (adjust numbers based on what sounds good):
        
        'pistol': 'sounds/weapons/sfx_wpn_laser1.mp3',
        'shotgun': 'sounds/weapons/sfx_wpn_laser2.mp3',
        'machinegun': 'sounds/weapons/sfx_wpn_laser3.mp3',
        'rifle': 'sounds/weapons/sfx_wpn_laser4.mp3',
        'rocket_shot': 'sounds/weapons/sfx_wpn_laser5.mp3',
        
        // Explosions
        'explosion': 'sounds/effects/sfx_exp_short_hard1.mp3',
        'car_explosion': 'sounds/effects/sfx_exp_short_hard2.mp3',
        'tank_explosion': 'sounds/effects/sfx_exp_long1.mp3',
        
        // Vehicles
        'car_engine': 'sounds/vehicles/sfx_vehicle_engine.mp3',
        'car_horn': 'sounds/vehicles/sfx_sound_mechanicalnoise1.mp3',
        'car_damage': 'sounds/effects/sfx_damage_hit1.mp3',
        'car_skid': 'sounds/vehicles/sfx_movement_slide1.mp3',
        
        // UI & Pickups
        'pickup': 'sounds/ui/sfx_coin_single1.mp3',
        'powerup_pickup': 'sounds/ui/sfx_coin_double1.mp3',
        'weapon_pickup': 'sounds/ui/sfx_sounds_powerup1.mp3',
        'heal': 'sounds/ui/sfx_sounds_powerup2.mp3',
        'level_up': 'sounds/ui/sfx_sounds_fanfare1.mp3',
        'achievement': 'sounds/ui/sfx_sounds_fanfare2.mp3',
        
        // Police & Alerts
        'police_siren': 'sounds/police/sfx_alarm_loop1.mp3',
        'wanted_increase': 'sounds/police/sfx_sound_neutral1.mp3',
        
        // Impacts
        'impact': 'sounds/effects/sfx_damage_hit2.mp3',
        'metal_hit': 'sounds/effects/sfx_damage_hit3.mp3',
        
        // Environment
        'thunder': 'sounds/ambient/sfx_exp_long2.mp3',
        'rain': 'sounds/ambient/sfx_ambient_loop1.mp3',
        
        // Zone & Traffic
        'zone_enter': 'sounds/ui/sfx_menu_select1.mp3',
        'traffic_light': 'sounds/ui/sfx_menu_select2.mp3',
        
        // Additional
        'vehicle_spawn': 'sounds/vehicles/sfx_vehicle_start.mp3',
        'glass_break': 'sounds/effects/sfx_damage_hit4.mp3',
    },
    
    volumes: {
        master: 0.7,
        sfx: 0.8,
        music: 0.6,
    },
    
    spatialAudio: {
        maxDistance: 800,
        referenceDistance: 100,
        rolloffFactor: 1,
    },
    
    // Keep ZzFX disabled for performance
    useZzFX: false,
};

// Apply configuration
if (typeof audioManager !== 'undefined' && audioManager && audioManager.initSoundLibrary) {
    audioManager.initSoundLibrary(CustomSoundConfig).then(() => {
        console.log('512 Sound Effects pack loaded successfully!');
    }).catch(error => {
        console.warn('Failed to load some sounds:', error);
        console.log('Make sure you downloaded the pack and placed files in sounds/ folder');
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomSoundConfig;
}
