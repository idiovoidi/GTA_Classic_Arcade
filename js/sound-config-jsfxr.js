// Sound Configuration for jsfxr Generated Sounds
// Generate sounds at: https://sfxr.me/
// 
// Quick generation guide:
// 1. Go to https://sfxr.me/
// 2. Click preset buttons (Pickup, Explosion, Laser, etc.)
// 3. Tweak if desired
// 4. Click "Export WAV"
// 5. Convert to MP3 if needed
// 6. Save to sounds/ folder with names below
// 7. Rename this file to sound-config.js
// 8. Reload game

const CustomSoundConfig = {
    externalSounds: {
        // === WEAPONS ===
        // jsfxr preset: "Laser/Shoot" button
        'pistol': 'sounds/weapons/pistol.mp3',           // Laser preset, short
        'shotgun': 'sounds/weapons/shotgun.mp3',         // Laser preset, lower pitch
        'machinegun': 'sounds/weapons/machinegun.mp3',   // Laser preset, very short
        'rifle': 'sounds/weapons/rifle.mp3',             // Laser preset, sharp
        'rocket_shot': 'sounds/weapons/rocket.mp3',      // Explosion preset, modified
        
        // === EXPLOSIONS ===
        // jsfxr preset: "Explosion" button
        'explosion': 'sounds/effects/explosion.mp3',           // Explosion preset
        'car_explosion': 'sounds/effects/car_explosion.mp3',   // Explosion preset, longer
        'tank_explosion': 'sounds/effects/tank_explosion.mp3', // Explosion preset, deeper
        
        // === VEHICLES ===
        // jsfxr preset: "Random" or custom
        'car_engine': 'sounds/vehicles/engine.mp3',      // Low rumble, looping
        'car_horn': 'sounds/vehicles/horn.mp3',          // Blip/Select preset
        'car_damage': 'sounds/vehicles/crash.mp3',       // Hit/Hurt preset
        'car_skid': 'sounds/vehicles/skid.mp3',          // Random, noisy
        
        // === UI & PICKUPS ===
        // jsfxr preset: "Pickup/Coin" button
        'pickup': 'sounds/ui/pickup.mp3',                // Pickup preset
        'powerup_pickup': 'sounds/ui/powerup.mp3',       // Pickup preset, higher
        'weapon_pickup': 'sounds/ui/weapon_pickup.mp3',  // Pickup preset, lower
        'heal': 'sounds/ui/heal.mp3',                    // Pickup preset, ascending
        'level_up': 'sounds/ui/level_up.mp3',            // Powerup preset
        'achievement': 'sounds/ui/achievement.mp3',      // Powerup preset, longer
        
        // === POLICE & ALERTS ===
        // jsfxr preset: "Blip/Select" or "Alarm"
        'police_siren': 'sounds/police/siren.mp3',       // Alarm preset
        'wanted_increase': 'sounds/police/alert.mp3',    // Blip preset, urgent
        
        // === IMPACTS ===
        // jsfxr preset: "Hit/Hurt" button
        'impact': 'sounds/effects/impact.mp3',           // Hit preset
        'metal_hit': 'sounds/effects/metal_hit.mp3',     // Hit preset, metallic
        
        // === ENVIRONMENT ===
        // jsfxr preset: "Random" with modifications
        'thunder': 'sounds/ambient/thunder.mp3',         // Explosion preset, rumbling
        'rain': 'sounds/ambient/rain.mp3',               // Random, static-like
        
        // === ZONE & TRAFFIC ===
        // jsfxr preset: "Blip/Select" button
        'zone_enter': 'sounds/ui/zone_enter.mp3',        // Blip preset
        'traffic_light': 'sounds/ui/traffic_light.mp3',  // Blip preset, short
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
        console.log('jsfxr sounds loaded successfully!');
    }).catch(error => {
        console.warn('Failed to load some sounds:', error);
        console.log('Generate sounds at https://sfxr.me/ and place in sounds/ folder');
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomSoundConfig;
}
