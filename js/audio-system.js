// ============================================================================
// Enhanced Audio System
// Combines ZzFX, Enhanced Audio Manager, and Sound Library
// ============================================================================

// ============================================================================
// ZzFX - DISABLED for stability
// Using original procedural audio system instead
// ============================================================================

// ZzFX globals - kept for compatibility but not used
let zzfxV = 0.3;
let zzfxR = 44100;
let zzfxX = null;

// ZzFX function - disabled, returns null
const zzfx = (...t) => {
    console.warn('[Audio] ZzFX is disabled - using procedural audio instead');
    return null;
};

// ZzFX Sound Presets - Enhanced quality game sounds
const ZzFXSounds = {
    // Weapons
    pistol: [1.5,,129,.01,.01,.15,,.2,,,-184,.05,.02,,,,.04,.5],
    shotgun: [2,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
    machinegun: [1.2,,1e3,.01,.01,.09,,.2,,,-184,.05,.02,,,,.04,.5],
    rifle: [1.8,,1675,.01,.01,.2,,.2,,,-184,.05,.02,,,,.04,.5],
    rocket_shot: [2,,20,.04,.4,.6,1,.3,,6.27,-184,.09,.17],
    
    // Explosions
    explosion: [3,,1e3,.02,.2,.3,4,1.9,,,-184,.1,.01],
    car_explosion: [3.5,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
    tank_explosion: [4,,20,.04,.4,.6,1,.3,,6.27,-184,.09,.17],
    truck_explosion: [3.5,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
    motorcycle_explosion: [3,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
    
    // Vehicles
    car_engine: [.8,.5,270,,.04,.3,1,1.9,,,,,,,,.1,.01],
    car_horn: [1.2,,539,,.04,.29,1,1.88,,,,,,,,.1,.01],
    car_damage: [1.5,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
    car_skid: [1,,1e3,.02,.2,.3,4,1.9,,,-184,.1,.01],
    
    // UI & Pickups
    pickup: [1,,1046,.04,.09,.17,,.46,,,,,,,,.1],
    powerup_pickup: [1.5,,261.6,.02,.05,.15,1,.5,,,,,,,,.1],
    weapon_pickup: [1.2,,523.3,.04,.1,.2,,.5,,,,,,,,.1],
    heal: [1.5,,659.3,.02,.1,.2,,.5,,,,,,,,.1],
    level_up: [2,,523.3,.04,.1,.2,,.5,,,,,,,,.1],
    achievement: [2,,659.3,.02,.1,.2,,.5,,,,,,,,.1],
    
    // Police & Alerts
    police_siren: [1.5,.5,270,,.04,.3,1,1.9,,,,,,,,.1,.01],
    wanted_increase: [1.8,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
    
    // Impacts
    impact: [1,,1e3,.02,.2,.3,4,1.9,,,-184,.1,.01],
    metal_hit: [1.5,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
    
    // Environment
    thunder: [2.5,,20,.04,.4,.6,1,.3,,6.27,-184,.09,.17],
    rain: [.5,,1e3,.02,.2,.3,4,1.9,,,-184,.1,.01,.5],
    wind: [.4,,100,.02,.2,.3,4,1.9,,,-184,.1,.01,.3],
    
    // Tank sounds
    tank_cannon: [3,,100,.04,.4,.6,1,.3,,6.27,-184,.09,.17],
    tank_machinegun: [1.5,,1e3,.01,.01,.09,,.2,,,-184,.05,.02,,,,.04,.5],
    tank_spawn: [2,,270,,.04,.3,1,1.9,,,,,,,,.1,.01],
    tank_damage: [2,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
    
    // Zone & Traffic
    zone_enter: [1,,1046,.04,.09,.17,,.46,,,,,,,,.1],
    traffic_light: [.8,,880,.01,.05,.1,,.3,,,,,,,,.1],
    
    // Additional
    vehicle_spawn: [2,,270,,.04,.3,1,1.9,,,,,,,,.1,.01],
    glass_break: [1.2,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
    pedestrian_death: [1,,1e3,.02,.2,.3,4,1.9,,,-184,.1,.01],
};

// Helper function to play ZzFX sounds with volume control
function playZzFX(soundName, volume = 1) {
    const sound = ZzFXSounds[soundName];
    if (!sound) {
        console.warn(`ZzFX sound not found: ${soundName}`);
        return;
    }
    
    const adjustedSound = [...sound];
    adjustedSound[0] = (adjustedSound[0] || zzfxV) * volume;
    
    return zzfx(...adjustedSound);
}

// ============================================================================
// Enhanced Audio Manager
// ============================================================================

class EnhancedAudioManager extends AudioManager {
    constructor() {
        super();
        
        // ZzFX is disabled for stability - using original procedural audio
        // Do not initialize zzfxX to prevent conflicts
        
        // External sound files support
        this.externalSounds = new Map();
        this.loadingSounds = new Set();
        
        // Sound sprite support
        this.soundSprites = new Map();
        
        // Music tracks
        this.musicTracks = new Map();
        this.currentMusic = null;
        this.musicFadeTime = 2000;
        
        // Enhanced 3D audio
        this.environmentPresets = {
            outdoor: { reverb: 0.2, echo: 0.1 },
            indoor: { reverb: 0.6, echo: 0.3 },
            tunnel: { reverb: 0.9, echo: 0.5 },
            city: { reverb: 0.4, echo: 0.2 }
        };
        this.currentEnvironment = 'outdoor';
        
        // Sound library configuration
        this.soundLibraryConfig = {
            externalSounds: {},
            volumes: {
                master: 0.7,
                sfx: 0.8,
                music: 0.6
            },
            spatialAudio: {
                maxDistance: 800,
                referenceDistance: 100,
                rolloffFactor: 1
            },
            useZzFX: false // Disabled by default for performance
        };
        
        console.log('EnhancedAudioManager initialized (ZzFX disabled for performance)');
    }
    
    /**
     * Initialize sound library with configuration
     */
    async initSoundLibrary(config = {}) {
        console.log('Initializing Sound Library...');
        
        // Merge configuration
        if (config.externalSounds) {
            Object.assign(this.soundLibraryConfig.externalSounds, config.externalSounds);
        }
        if (config.volumes) {
            Object.assign(this.soundLibraryConfig.volumes, config.volumes);
        }
        if (config.spatialAudio) {
            Object.assign(this.soundLibraryConfig.spatialAudio, config.spatialAudio);
        }
        
        // Apply volume settings
        this.masterVolume = this.soundLibraryConfig.volumes.master;
        this.sfxVolume = this.soundLibraryConfig.volumes.sfx;
        this.musicVolume = this.soundLibraryConfig.volumes.music;
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
            this.sfxGain.gain.value = this.sfxVolume;
            this.musicGain.gain.value = this.musicVolume;
        }
        
        // Apply spatial audio settings
        this.maxAudioDistance = this.soundLibraryConfig.spatialAudio.maxDistance;
        this.referenceDistance = this.soundLibraryConfig.spatialAudio.referenceDistance;
        this.rolloffFactor = this.soundLibraryConfig.spatialAudio.rolloffFactor;
        
        // Load external sounds if any
        const soundsToLoad = Object.keys(this.soundLibraryConfig.externalSounds).length;
        if (soundsToLoad > 0) {
            console.log(`Loading ${soundsToLoad} external sounds...`);
            try {
                await this.loadSounds(this.soundLibraryConfig.externalSounds);
                console.log('External sounds loaded successfully');
            } catch (error) {
                console.warn('Some external sounds failed to load:', error);
            }
        }
        
        console.log('Sound Library initialized');
    }
    
    /**
     * Load external sound file
     */
    async loadSound(name, url) {
        if (this.externalSounds.has(name)) {
            return this.externalSounds.get(name);
        }
        
        if (this.loadingSounds.has(name)) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.externalSounds.has(name)) {
                        clearInterval(checkInterval);
                        resolve(this.externalSounds.get(name));
                    }
                }, 100);
            });
        }
        
        this.loadingSounds.add(name);
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.externalSounds.set(name, audioBuffer);
            this.loadingSounds.delete(name);
            
            console.log(`Loaded sound: ${name}`);
            return audioBuffer;
            
        } catch (error) {
            console.error(`Failed to load sound ${name}:`, error);
            this.loadingSounds.delete(name);
            return null;
        }
    }
    
    /**
     * Load multiple sounds at once
     */
    async loadSounds(soundMap) {
        const promises = Object.entries(soundMap).map(([name, url]) => 
            this.loadSound(name, url)
        );
        return Promise.all(promises);
    }
    
    /**
     * Play external sound
     */
    playExternalSound(name, options = {}) {
        const {
            volume = 1.0,
            pitch = 1.0,
            loop = false,
            x = null,
            y = null,
            fadeIn = 0,
            fadeOut = 0
        } = options;
        
        if (!this.enabled || !this.audioContext) return null;
        
        const buffer = this.externalSounds.get(name);
        if (!buffer) {
            console.warn(`External sound not loaded: ${name}`);
            return this.playSound(name, volume, pitch, loop, x, y);
        }
        
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            let pannerNode = null;
            
            source.buffer = buffer;
            source.loop = loop;
            source.playbackRate.value = pitch;
            
            if (fadeIn > 0) {
                gainNode.gain.value = 0;
                gainNode.gain.linearRampToValueAtTime(
                    volume,
                    this.audioContext.currentTime + fadeIn / 1000
                );
            } else {
                gainNode.gain.value = volume;
            }
            
            if (x !== null && y !== null) {
                pannerNode = this.create3DPanner(x, y);
                source.connect(gainNode);
                gainNode.connect(pannerNode);
                pannerNode.connect(this.sfxGain);
            } else {
                source.connect(gainNode);
                gainNode.connect(this.sfxGain);
            }
            
            if (fadeOut > 0 && !loop) {
                const fadeOutStart = buffer.duration - (fadeOut / 1000);
                if (fadeOutStart > 0) {
                    gainNode.gain.setValueAtTime(
                        volume,
                        this.audioContext.currentTime + fadeOutStart
                    );
                    gainNode.gain.linearRampToValueAtTime(
                        0,
                        this.audioContext.currentTime + buffer.duration
                    );
                }
            }
            
            source.start();
            
            return {
                source,
                gainNode,
                pannerNode,
                stop: (fadeTime = 0) => {
                    if (fadeTime > 0) {
                        gainNode.gain.linearRampToValueAtTime(
                            0,
                            this.audioContext.currentTime + fadeTime / 1000
                        );
                        setTimeout(() => {
                            try { source.stop(); } catch (e) {}
                        }, fadeTime);
                    } else {
                        try { source.stop(); } catch (e) {}
                    }
                },
                setVolume: (newVolume) => {
                    gainNode.gain.value = Math.max(0, Math.min(1, newVolume));
                },
                updatePosition: (newX, newY) => {
                    if (pannerNode) {
                        this.updatePannerPosition(pannerNode, newX, newY);
                    }
                }
            };
            
        } catch (error) {
            console.warn('Failed to play external sound:', name, error);
            return null;
        }
    }
    
    /**
     * Play music track with crossfade
     */
    async playMusic(name, fadeTime = null) {
        fadeTime = fadeTime || this.musicFadeTime;
        
        if (this.currentMusic) {
            this.currentMusic.stop(fadeTime);
        }
        
        this.currentMusic = this.playExternalSound(name, {
            volume: this.musicVolume,
            loop: true,
            fadeIn: fadeTime
        });
    }
    
    /**
     * Stop music
     */
    stopMusic(fadeTime = null) {
        fadeTime = fadeTime || this.musicFadeTime;
        
        if (this.currentMusic) {
            this.currentMusic.stop(fadeTime);
            this.currentMusic = null;
        }
    }
    
    /**
     * Set environment preset for reverb/echo
     */
    setEnvironment(preset) {
        if (this.environmentPresets[preset]) {
            this.currentEnvironment = preset;
            console.log(`Environment set to: ${preset}`);
        }
    }
    
    /**
     * Override playSound to use smart fallback
     * This maintains backward compatibility with existing code
     */
    playSound(type, volumeOrX = 0.5, pitchOrY = 1.0, loop = false, x = null, y = null) {
        // Auto-resume audio context if suspended (browser requirement)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('[Audio] Audio context resumed');
            });
        }
        
        // Debug logging
        if (type && (type.includes('pistol') || type.includes('shotgun') || type.includes('car') || type.includes('engine'))) {
            console.log(`[Audio] Playing sound: ${type}, volume: ${volumeOrX}, enabled: ${this.enabled}, context: ${this.audioContext?.state}`);
        }
        
        // Check if we should use external sounds
        if (this.externalSounds.has(type)) {
            const isPositional = (typeof volumeOrX === 'number' && typeof pitchOrY === 'number' && 
                                (arguments.length >= 5 || (volumeOrX > 10 || pitchOrY > 10)));
            
            if (isPositional) {
                return this.playExternalSound(type, {
                    x: volumeOrX,
                    y: pitchOrY,
                    loop: loop
                });
            } else {
                return this.playExternalSound(type, {
                    volume: volumeOrX,
                    pitch: pitchOrY,
                    loop: loop,
                    x: x,
                    y: y
                });
            }
        }
        
        // ZzFX is completely disabled - always use original procedural audio
        // This ensures consistent, reliable sound generation
        console.log(`[EnhancedAudio] Calling parent playSound for: ${type}`);
        const result = super.playSound(type, volumeOrX, pitchOrY, loop, x, y);
        console.log(`[EnhancedAudio] Parent playSound returned:`, result ? 'object' : 'null');
        return result;
    }
    
    /**
     * Add external sound to library
     */
    addSound(name, url) {
        this.soundLibraryConfig.externalSounds[name] = url;
    }
    
    /**
     * Add multiple sounds to library
     */
    addSounds(sounds) {
        Object.assign(this.soundLibraryConfig.externalSounds, sounds);
    }
}

// ============================================================================
// Free Sound Resources Reference
// ============================================================================

const FreeSoundResources = {
    websites: [
        {
            name: 'OpenGameArt.org',
            url: 'https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=13',
            license: 'CC0, CC-BY, GPL',
            description: 'Large collection of game sounds'
        },
        {
            name: 'Freesound.org',
            url: 'https://freesound.org/',
            license: 'CC0, CC-BY',
            description: 'Collaborative database of sounds'
        },
        {
            name: 'Sonniss Game Audio',
            url: 'https://sonniss.com/gameaudiogdc',
            license: 'Royalty-free',
            description: 'Annual GDC sound library bundle'
        },
        {
            name: 'ZapSplat',
            url: 'https://www.zapsplat.com/',
            license: 'Free with attribution',
            description: 'Sound effects library'
        }
    ],
    tools: [
        {
            name: 'jsfxr',
            url: 'https://sfxr.me/',
            description: 'Browser-based sound effect generator'
        },
        {
            name: 'ChipTone',
            url: 'https://sfbgames.itch.io/chiptone',
            description: 'Retro sound effect generator'
        },
        {
            name: 'Bfxr',
            url: 'https://www.bfxr.net/',
            description: 'Sound effect synthesizer'
        }
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedAudioManager, ZzFXSounds, playZzFX, FreeSoundResources };
}
