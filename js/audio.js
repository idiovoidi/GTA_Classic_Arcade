class AudioManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.6;
        
        // Initialize audio context
        this.initializeAudioContext();
        
        // Procedural sound generation settings
        this.soundCache = new Map();
        this.maxCacheSize = 50;
        
        // 3D positional audio settings
        this.listenerPosition = { x: 0, y: 0 };
        this.maxAudioDistance = 800;
        this.referenceDistance = 100;
        this.rolloffFactor = 1;
        
        // Dynamic music system
        this.musicState = 'idle';
        this.intensity = 0;
        this.tension = 0;
        this.musicTracks = {};
        this.currentMusicTrack = null;
        this.musicTransitionTimer = 0;
        this.musicTransitionDuration = 2000;
        this.musicCooldown = 1000;
        this.lastMusicChange = 0;
        
        // Audio nodes for processing
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.compressor = null;
        this.reverb = null;
        
        // Initialize the complete system
        this.initializeAudioNodes();
        this.initializeMusicTracks();
        
        console.log('AudioManager initialized with 3D positional audio support');
    }
    
    /**
     * Initialize Web Audio Context
     */
    initializeAudioContext() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Set up listener (3D audio)
            if (this.audioContext.listener.positionX) {
                // Use modern API if available
                this.audioContext.listener.positionX.value = 0;
                this.audioContext.listener.positionY.value = 0;
                this.audioContext.listener.positionZ.value = 0;
                this.audioContext.listener.forwardX.value = 0;
                this.audioContext.listener.forwardY.value = -1;
                this.audioContext.listener.forwardZ.value = 0;
                this.audioContext.listener.upX.value = 0;
                this.audioContext.listener.upY.value = 0;
                this.audioContext.listener.upZ.value = 1;
            } else {
                // Fallback for older browsers
                this.audioContext.listener.setPosition(0, 0, 0);
                this.audioContext.listener.setOrientation(0, -1, 0, 0, 0, 1);
            }
            
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }
    
    /**
     * Initialize audio processing nodes
     */
    initializeAudioNodes() {
        if (!this.audioContext) return;
        
        try {
            // Master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            // SFX gain node
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            
            // Music gain node
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.musicVolume;
            
            // Compressor for dynamic range
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -24;
            this.compressor.knee.value = 30;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0.003;
            this.compressor.release.value = 0.25;
            
            // Create reverb
            this.createReverb();
            
            // Connect audio chain
            this.sfxGain.connect(this.compressor);
            this.musicGain.connect(this.compressor);
            this.compressor.connect(this.reverb);
            this.reverb.connect(this.masterGain);
            
        } catch (error) {
            console.warn('Failed to initialize audio nodes:', error);
        }
    }
    
    /**
     * Create reverb effect
     */
    createReverb() {
        if (!this.audioContext) return;
        
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 second reverb
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay * 0.1;
            }
        }
        
        this.reverb = this.audioContext.createConvolver();
        this.reverb.buffer = impulse;
    }
    
    /**
     * Resume audio context (required for user interaction)
     */
    resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    /**
     * Update listener position for 3D audio
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    updateListenerPosition(x, y) {
        this.listenerPosition.x = x;
        this.listenerPosition.y = y;
        
        if (!this.audioContext || !this.audioContext.listener) return;
        
        try {
            if (this.audioContext.listener.positionX) {
                // Modern API
                this.audioContext.listener.positionX.value = x;
                this.audioContext.listener.positionY.value = y;
                this.audioContext.listener.positionZ.value = 0;
            } else {
                // Legacy API
                this.audioContext.listener.setPosition(x, y, 0);
            }
        } catch (error) {
            console.warn('Failed to update listener position:', error);
        }
    }

    /**
     * Play a sound with optional 3D positioning
     * @param {string} type - Sound type
     * @param {number} volumeOrX - Volume (0-1) or X position for positional audio
     * @param {number} pitchOrY - Pitch multiplier or Y position for positional audio
     * @param {boolean} loop - Whether to loop the sound
     * @param {number} x - X position (if using volume/pitch parameters)
     * @param {number} y - Y position (if using volume/pitch parameters)
     * @returns {Object} Sound control object
     */
    playSound(type, volumeOrX = 0.5, pitchOrY = 1.0, loop = false, x = null, y = null) {
        if (!this.enabled || !this.audioContext) return null;
        
        // Determine if this is positional audio
        const isPositional = (typeof volumeOrX === 'number' && typeof pitchOrY === 'number' && 
                            (arguments.length >= 5 || (volumeOrX > 10 || pitchOrY > 10)));
        
        let volume, pitch, soundX, soundY;
        
        if (isPositional) {
            // Positional audio mode
            soundX = volumeOrX;
            soundY = pitchOrY;
            
            // Calculate distance-based volume
            const distance = Math.sqrt(
                Math.pow(soundX - this.listenerPosition.x, 2) + 
                Math.pow(soundY - this.listenerPosition.y, 2)
            );
            
            // Apply distance attenuation
            volume = Math.max(0, Math.min(1, 
                1 - (distance - this.referenceDistance) / (this.maxAudioDistance - this.referenceDistance)
            ));
            
            // Default pitch for positional audio
            pitch = 1.0;
        } else {
            // Regular audio mode
            volume = Math.max(0, Math.min(1, volumeOrX));
            pitch = Math.max(0.1, Math.min(3.0, pitchOrY));
            soundX = x;
            soundY = y;
        }
        
        // Skip if volume too low
        if (volume < 0.01) return null;
        
        try {
            // Generate or get cached sound
            const soundBuffer = this.generateProceduralSound(type, pitch);
            if (!soundBuffer) return null;
            
            // Create audio nodes
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            let pannerNode = null;
            
            source.buffer = soundBuffer;
            source.loop = loop;
            gainNode.gain.value = volume;
            
            // Set up 3D positioning if coordinates provided
            if (soundX !== null && soundY !== null) {
                pannerNode = this.create3DPanner(soundX, soundY);
                source.connect(gainNode);
                gainNode.connect(pannerNode);
                pannerNode.connect(this.sfxGain);
            } else {
                source.connect(gainNode);
                gainNode.connect(this.sfxGain);
            }
            
            // Start playing
            source.start();
            
            // Return control object
            return {
                source: source,
                gainNode: gainNode,
                pannerNode: pannerNode,
                stop: () => {
                    try {
                        source.stop();
                    } catch (e) {
                        // Ignore errors if already stopped
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
            console.warn('Failed to play sound:', type, error);
            return null;
        }
    }
    
    /**
     * Create 3D panner node for positional audio
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {PannerNode} The panner node
     */
    create3DPanner(x, y) {
        const panner = this.audioContext.createPanner();
        
        // Configure 3D audio parameters
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = this.referenceDistance;
        panner.maxDistance = this.maxAudioDistance;
        panner.rolloffFactor = this.rolloffFactor;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        
        // Set position
        this.updatePannerPosition(panner, x, y);
        
        return panner;
    }
    
    /**
     * Update panner node position
     * @param {PannerNode} panner - The panner node
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    updatePannerPosition(panner, x, y) {
        try {
            if (panner.positionX) {
                // Modern API
                panner.positionX.value = x;
                panner.positionY.value = y;
                panner.positionZ.value = 0;
            } else {
                // Legacy API
                panner.setPosition(x, y, 0);
            }
        } catch (error) {
            console.warn('Failed to update panner position:', error);
        }
    }
    
    /**
     * Generate procedural sound
     * @param {string} type - Sound type
     * @param {number} pitch - Pitch multiplier
     * @returns {AudioBuffer} Generated sound buffer
     */
    generateProceduralSound(type, pitch = 1.0) {
        const cacheKey = `${type}_${pitch.toFixed(2)}`;
        
        // Check cache first
        if (this.soundCache.has(cacheKey)) {
            return this.soundCache.get(cacheKey);
        }
        
        // Generate new sound
        const buffer = this.createSoundBuffer(type, pitch);
        
        // Cache management
        if (this.soundCache.size >= this.maxCacheSize) {
            const firstKey = this.soundCache.keys().next().value;
            this.soundCache.delete(firstKey);
        }
        
        this.soundCache.set(cacheKey, buffer);
        return buffer;
    }
    
    /**
     * Create sound buffer for specific sound type
     * @param {string} type - Sound type
     * @param {number} pitch - Pitch multiplier
     * @returns {AudioBuffer} Generated sound buffer
     */
    createSoundBuffer(type, pitch) {
        const sampleRate = this.audioContext.sampleRate;
        let duration, generator;
        
        // Define sound parameters based on type
        switch (type) {
            case 'pistol':
            case 'gunshot':
                duration = 0.1;
                generator = this.generateGunshot.bind(this);
                break;
            case 'shotgun':
                duration = 0.15;
                generator = this.generateShotgun.bind(this);
                break;
            case 'uzi':
            case 'machinegun':
                duration = 0.08;
                generator = this.generateMachineGun.bind(this);
                break;
            case 'rifle':
                duration = 0.12;
                generator = this.generateRifle.bind(this);
                break;
            case 'rocket_shot':
                duration = 0.2;
                generator = this.generateRocket.bind(this);
                break;
            case 'explosion':
                duration = 0.8;
                generator = this.generateExplosion.bind(this);
                break;
            case 'car_engine':
                duration = 1.0;
                generator = this.generateEngine.bind(this);
                break;
            case 'car_damage':
                duration = 0.3;
                generator = this.generateMetalImpact.bind(this);
                break;
            case 'car_explosion':
            case 'truck_explosion':
            case 'motorcycle_explosion':
                duration = 1.2;
                generator = this.generateVehicleExplosion.bind(this);
                break;
            case 'impact':
                duration = 0.15;
                generator = this.generateImpact.bind(this);
                break;
            case 'pickup':
            case 'powerup_pickup':
                duration = 0.3;
                generator = this.generatePickup.bind(this);
                break;
            case 'heal':
                duration = 0.5;
                generator = this.generateHeal.bind(this);
                break;
            case 'weapon_pickup':
                duration = 0.4;
                generator = this.generateWeaponPickup.bind(this);
                break;
            case 'police_siren':
                duration = 2.0;
                generator = this.generateSiren.bind(this);
                break;
            case 'wanted_increase':
                duration = 0.6;
                generator = this.generateAlert.bind(this);
                break;
            case 'level_up':
                duration = 1.2;
                generator = this.generateLevelUp.bind(this);
                break;
            case 'achievement':
                duration = 1.0;
                generator = this.generateAchievement.bind(this);
                break;
            case 'zone_enter':
                duration = 0.4;
                generator = this.generateZoneEnter.bind(this);
                break;
            case 'vehicle_spawn':
                duration = 0.6;
                generator = this.generateVehicleSpawn.bind(this);
                break;
            case 'traffic_light':
                duration = 0.2;
                generator = this.generateTrafficLight.bind(this);
                break;
            case 'rain':
                duration = 2.0;
                generator = this.generateRain.bind(this);
                break;
            case 'thunder':
                duration = 1.5;
                generator = this.generateThunder.bind(this);
                break;
            case 'wind':
                duration = 3.0;
                generator = this.generateWind.bind(this);
                break;
            case 'birds':
                duration = 1.0;
                generator = this.generateBirds.bind(this);
                break;
            default:
                duration = 0.2;
                generator = this.generateDefault.bind(this);
        }
        
        const length = Math.floor(sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        generator(data, sampleRate, pitch);
        
        return buffer;
    }

    // Sound generation methods
    generateGunshot(data, sampleRate, pitch) {
        const baseFreq = 150 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 20);
            const noise = (Math.random() * 2 - 1) * 0.8;
            const tone = Math.sin(2 * Math.PI * baseFreq * t) * 0.3;
            data[i] = (noise + tone) * envelope;
        }
    }
    
    generateShotgun(data, sampleRate, pitch) {
        const baseFreq = 120 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 15);
            const noise = (Math.random() * 2 - 1) * 0.9;
            const lowTone = Math.sin(2 * Math.PI * baseFreq * t) * 0.4;
            data[i] = (noise + lowTone) * envelope;
        }
    }
    
    generateMachineGun(data, sampleRate, pitch) {
        const baseFreq = 180 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 25);
            const noise = (Math.random() * 2 - 1) * 0.7;
            const tone = Math.sin(2 * Math.PI * baseFreq * t) * 0.2;
            data[i] = (noise + tone) * envelope;
        }
    }
    
    generateRifle(data, sampleRate, pitch) {
        const baseFreq = 200 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 18);
            const noise = (Math.random() * 2 - 1) * 0.8;
            const tone = Math.sin(2 * Math.PI * baseFreq * t) * 0.3;
            const highTone = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.1;
            data[i] = (noise + tone + highTone) * envelope;
        }
    }
    
    generateRocket(data, sampleRate, pitch) {
        const baseFreq = 80 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 10);
            const noise = (Math.random() * 2 - 1) * 0.6;
            const lowTone = Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
            const wobble = Math.sin(2 * Math.PI * 5 * t) * 0.2;
            data[i] = (noise + lowTone + wobble) * envelope;
        }
    }
    
    generateExplosion(data, sampleRate, pitch) {
        const baseFreq = 60 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 3);
            const noise = (Math.random() * 2 - 1) * 0.9;
            const rumble = Math.sin(2 * Math.PI * baseFreq * t) * 0.6;
            const crackle = Math.sin(2 * Math.PI * 400 * t) * 0.2 * Math.exp(-t * 8);
            data[i] = (noise + rumble + crackle) * envelope;
        }
    }
    
    generateEngine(data, sampleRate, pitch) {
        const baseFreq = 100 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = 0.5;
            const engine = Math.sin(2 * Math.PI * baseFreq * t) * 0.4;
            const rumble = Math.sin(2 * Math.PI * baseFreq * 0.5 * t) * 0.3;
            const noise = (Math.random() * 2 - 1) * 0.2;
            data[i] = (engine + rumble + noise) * envelope;
        }
    }
    
    generateMetalImpact(data, sampleRate, pitch) {
        const baseFreq = 300 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 12);
            const noise = (Math.random() * 2 - 1) * 0.7;
            const clang = Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
            const ring = Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.3 * Math.exp(-t * 8);
            data[i] = (noise + clang + ring) * envelope;
        }
    }
    
    generateImpact(data, sampleRate, pitch) {
        const baseFreq = 200 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 15);
            const noise = (Math.random() * 2 - 1) * 0.8;
            const thud = Math.sin(2 * Math.PI * baseFreq * t) * 0.4;
            data[i] = (noise + thud) * envelope;
        }
    }
    
    generatePickup(data, sampleRate, pitch) {
        const baseFreq = 440 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5);
            const tone1 = Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
            const tone2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.3;
            const sparkle = Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.2;
            data[i] = (tone1 + tone2 + sparkle) * envelope;
        }
    }
    
    generateHeal(data, sampleRate, pitch) {
        const baseFreq = 523 * pitch; // C5
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2);
            const main = Math.sin(2 * Math.PI * baseFreq * t) * 0.4;
            const harmony = Math.sin(2 * Math.PI * baseFreq * 1.25 * t) * 0.3;
            const shimmer = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.2 * Math.sin(t * 10);
            data[i] = (main + harmony + shimmer) * envelope;
        }
    }
    
    generateWeaponPickup(data, sampleRate, pitch) {
        const baseFreq = 349 * pitch; // F4
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 4);
            const tone = Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
            const metallic = Math.sin(2 * Math.PI * baseFreq * 2.5 * t) * 0.3;
            const click = (Math.random() * 2 - 1) * 0.1 * Math.exp(-t * 10);
            data[i] = (tone + metallic + click) * envelope;
        }
    }
    
    generateSiren(data, sampleRate, pitch) {
        const baseFreq = 400 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = 0.6;
            const freq = baseFreq + Math.sin(2 * Math.PI * 1.5 * t) * 200;
            const siren = Math.sin(2 * Math.PI * freq * t);
            data[i] = siren * envelope;
        }
    }
    
    generateAlert(data, sampleRate, pitch) {
        const baseFreq = 800 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 3);
            const alarm = Math.sin(2 * Math.PI * baseFreq * t) * Math.sin(t * 20);
            const urgency = Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.5;
            data[i] = (alarm + urgency) * envelope;
        }
    }
    
    generateLevelUp(data, sampleRate, pitch) {
        const baseFreq = 440 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2);
            const progression = 1 + t * 2; // Rising pitch
            const c = Math.sin(2 * Math.PI * baseFreq * progression * t) * 0.4;
            const e = Math.sin(2 * Math.PI * baseFreq * 1.25 * progression * t) * 0.3;
            const g = Math.sin(2 * Math.PI * baseFreq * 1.5 * progression * t) * 0.3;
            data[i] = (c + e + g) * envelope;
        }
    }
    
    generateAchievement(data, sampleRate, pitch) {
        const baseFreq = 523 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 1.5);
            const fanfare1 = Math.sin(2 * Math.PI * baseFreq * t) * 0.4;
            const fanfare2 = Math.sin(2 * Math.PI * baseFreq * 1.33 * t) * 0.3;
            const fanfare3 = Math.sin(2 * Math.PI * baseFreq * 1.67 * t) * 0.3;
            const sparkle = Math.sin(2 * Math.PI * baseFreq * 4 * t) * 0.2 * Math.sin(t * 8);
            data[i] = (fanfare1 + fanfare2 + fanfare3 + sparkle) * envelope;
        }
    }
    
    generateZoneEnter(data, sampleRate, pitch) {
        const baseFreq = 330 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 6);
            const chime = Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
            const echo = Math.sin(2 * Math.PI * baseFreq * t * 0.8) * 0.3;
            data[i] = (chime + echo) * envelope;
        }
    }
    
    generateVehicleSpawn(data, sampleRate, pitch) {
        const baseFreq = 150 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 4);
            const engine = Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
            const startup = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.3 * Math.exp(-t * 8);
            data[i] = (engine + startup) * envelope;
        }
    }
    
    generateVehicleExplosion(data, sampleRate, pitch) {
        const baseFreq = 40 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2);
            const bigBoom = Math.sin(2 * Math.PI * baseFreq * t) * 0.8;
            const metalTwist = Math.sin(2 * Math.PI * 200 * t) * 0.4 * Math.exp(-t * 4);
            const debris = (Math.random() * 2 - 1) * 0.6 * Math.exp(-t * 3);
            const echo = Math.sin(2 * Math.PI * baseFreq * 0.7 * t) * 0.3;
            data[i] = (bigBoom + metalTwist + debris + echo) * envelope;
        }
    }
    
    generateDefault(data, sampleRate, pitch) {
        const baseFreq = 440 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8);
            const tone = Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
            data[i] = tone * envelope;
        }
    }
    
    generateTrafficLight(data, sampleRate, pitch) {
        const baseFreq = 880 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 12);
            const beep = Math.sin(2 * Math.PI * baseFreq * t) * 0.3;
            const click = (Math.random() * 2 - 1) * 0.1 * Math.exp(-t * 20);
            data[i] = (beep + click) * envelope;
        }
    }
    
    generateRain(data, sampleRate, pitch) {
        const baseFreq = 200 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = 0.4;
            const noise = (Math.random() * 2 - 1) * 0.6;
            const filtered = Math.sin(2 * Math.PI * baseFreq * t) * 0.1;
            data[i] = (noise + filtered) * envelope;
        }
    }
    
    generateThunder(data, sampleRate, pitch) {
        const baseFreq = 60 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2);
            const rumble = Math.sin(2 * Math.PI * baseFreq * t) * 0.8;
            const crack = (Math.random() * 2 - 1) * 0.9 * Math.exp(-t * 10);
            const echo = Math.sin(2 * Math.PI * baseFreq * 0.5 * t) * 0.4;
            data[i] = (rumble + crack + echo) * envelope;
        }
    }
    
    generateWind(data, sampleRate, pitch) {
        const baseFreq = 100 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = 0.5;
            const noise = (Math.random() * 2 - 1) * 0.7;
            const whoosh = Math.sin(2 * Math.PI * baseFreq * t * (1 + Math.sin(t * 3))) * 0.3;
            data[i] = (noise + whoosh) * envelope;
        }
    }
    
    generateBirds(data, sampleRate, pitch) {
        const baseFreq = 800 * pitch;
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 3);
            const chirp1 = Math.sin(2 * Math.PI * baseFreq * t * (1 + Math.sin(t * 20))) * 0.4;
            const chirp2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * t * (1 + Math.sin(t * 15))) * 0.3;
            data[i] = (chirp1 + chirp2) * envelope;
        }
    }

    /**
     * Get audio system info
     */
    getInfo() {
        return {
            enabled: this.enabled,
            state: this.audioContext ? this.audioContext.state : 'uninitialized',
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume
        };
    }
    
    /**
     * Initialize procedural music tracks
     */
    initializeMusicTracks() {
        // Define procedural music parameters for different game states
        this.musicTracks = {
            idle: {
                name: 'Ambient City',
                baseFreq: 60,
                tempo: 90,
                volume: 0.3,
                layers: [
                    { freq: 60, wave: 'sine', volume: 0.8 },
                    { freq: 120, wave: 'triangle', volume: 0.4 },
                    { freq: 180, wave: 'sine', volume: 0.2 }
                ],
                effects: { reverb: 0.3, lowpass: 800 }
            },
            combat: {
                name: 'Combat Theme',
                baseFreq: 80,
                tempo: 130,
                volume: 0.6,
                layers: [
                    { freq: 80, wave: 'sawtooth', volume: 0.9 },
                    { freq: 160, wave: 'square', volume: 0.6 },
                    { freq: 240, wave: 'triangle', volume: 0.4 },
                    { freq: 320, wave: 'sine', volume: 0.3 }
                ],
                effects: { distortion: 0.2, highpass: 200 }
            },
            chase: {
                name: 'High Speed Chase',
                baseFreq: 100,
                tempo: 160,
                volume: 0.7,
                layers: [
                    { freq: 100, wave: 'sawtooth', volume: 1.0 },
                    { freq: 200, wave: 'square', volume: 0.8 },
                    { freq: 300, wave: 'triangle', volume: 0.6 },
                    { freq: 400, wave: 'sine', volume: 0.4 },
                    { freq: 150, wave: 'sawtooth', volume: 0.5 }
                ],
                effects: { distortion: 0.4, delay: 0.2 }
            },
            victory: {
                name: 'Mission Complete',
                baseFreq: 440,
                tempo: 120,
                volume: 0.5,
                layers: [
                    { freq: 440, wave: 'sine', volume: 0.8 },
                    { freq: 554, wave: 'sine', volume: 0.6 },
                    { freq: 659, wave: 'sine', volume: 0.5 },
                    { freq: 880, wave: 'triangle', volume: 0.3 }
                ],
                effects: { reverb: 0.5, chorus: 0.3 }
            },
            death: {
                name: 'Game Over',
                baseFreq: 40,
                tempo: 60,
                volume: 0.4,
                layers: [
                    { freq: 40, wave: 'sine', volume: 0.9 },
                    { freq: 60, wave: 'triangle', volume: 0.6 },
                    { freq: 80, wave: 'sawtooth', volume: 0.4 }
                ],
                effects: { reverb: 0.8, lowpass: 400 }
            }
        };
    }
    
    /**
     * Update dynamic music system
     * @param {number} deltaTime - Delta time
     * @param {Object} gameState - Current game state
     */
    updateDynamicMusic(deltaTime, gameState) {
        if (!this.enabled || !this.audioContext) return;
        
        // Update music transition timer
        if (this.musicTransitionTimer > 0) {
            this.musicTransitionTimer -= deltaTime;
        }
        
        // Calculate new music state based on game conditions
        const newMusicState = this.calculateMusicState(gameState);
        
        // Check if we should change music
        const now = Date.now();
        if (newMusicState !== this.musicState && 
            now - this.lastMusicChange > this.musicCooldown) {
            this.transitionToMusicState(newMusicState);
            this.lastMusicChange = now;
        }
        
        // Update music parameters based on game intensity
        this.updateMusicIntensity(gameState);
    }
    
    /**
     * Calculate appropriate music state based on game conditions
     * @param {Object} gameState - Current game state
     * @returns {string} Music state
     */
    calculateMusicState(gameState) {
        // Check for death state
        if (gameState.playerHealth <= 0) {
            return 'death';
        }
        
        // Check for victory/mission complete
        if (gameState.missionJustCompleted) {
            return 'victory';
        }
        
        // Check for high-speed chase
        if (gameState.wantedLevel >= 3 && gameState.playerSpeed > 2) {
            return 'chase';
        }
        
        // Check for combat situations
        if (gameState.wantedLevel >= 2 || gameState.recentCombat) {
            return 'combat';
        }
        
        // Default to idle
        return 'idle';
    }
    
    /**
     * Update music intensity based on game state
     * @param {Object} gameState - Current game state
     */
    updateMusicIntensity(gameState) {
        // Calculate intensity (0-1) based on various factors
        this.intensity = Math.min(1, 
            (gameState.wantedLevel * 0.2) + 
            (gameState.playerSpeed * 0.1) + 
            (gameState.nearbyEnemies * 0.05)
        );
        
        // Calculate tension based on health and danger
        this.tension = Math.min(1,
            (1 - gameState.playerHealth / 100) * 0.5 +
            (gameState.wantedLevel * 0.15) +
            (gameState.inDanger ? 0.3 : 0)
        );
        
        // Update current track parameters if playing
        if (this.currentMusicTrack) {
            this.modulateMusicTrack();
        }
    }
    
    /**
     * Transition to a new music state
     * @param {string} newState - Target music state
     */
    transitionToMusicState(newState) {
        if (!this.musicTracks[newState]) return;
        
        console.log(`Transitioning music from ${this.musicState} to ${newState}`);
        
        // Stop current music
        this.stopCurrentMusic();
        
        // Start new music after a brief pause
        setTimeout(() => {
            this.startMusicTrack(newState);
        }, 500);
        
        this.musicState = newState;
        this.musicTransitionTimer = this.musicTransitionDuration;
    }
    
    /**
     * Start playing a music track
     * @param {string} trackName - Name of the track
     */
    startMusicTrack(trackName) {
        const track = this.musicTracks[trackName];
        if (!track || !this.audioContext) return;
        
        // Create oscillators for each layer
        this.currentMusicTrack = {
            name: trackName,
            oscillators: [],
            gainNodes: [],
            masterGain: this.audioContext.createGain()
        };
        
        // Connect master gain to music gain
        this.currentMusicTrack.masterGain.connect(this.musicGain);
        this.currentMusicTrack.masterGain.gain.value = track.volume;
        
        // Create each layer
        track.layers.forEach((layer, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = layer.wave;
            oscillator.frequency.value = layer.freq;
            gainNode.gain.value = layer.volume;
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(this.currentMusicTrack.masterGain);
            
            // Store references
            this.currentMusicTrack.oscillators.push(oscillator);
            this.currentMusicTrack.gainNodes.push(gainNode);
            
            // Start with slight randomization to avoid phase alignment
            oscillator.start(this.audioContext.currentTime + index * 0.1);
        });
        
        console.log(`Started music track: ${track.name}`);
    }
    
    /**
     * Stop current music track
     */
    stopCurrentMusic() {
        if (!this.currentMusicTrack) return;
        
        // Fade out and stop all oscillators
        this.currentMusicTrack.oscillators.forEach((oscillator, index) => {
            try {
                const gainNode = this.currentMusicTrack.gainNodes[index];
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
                oscillator.stop(this.audioContext.currentTime + 0.5);
            } catch (e) {
                // Ignore errors for already stopped oscillators
            }
        });
        
        this.currentMusicTrack = null;
    }
    
    /**
     * Modulate current music track based on intensity and tension
     */
    modulateMusicTrack() {
        if (!this.currentMusicTrack) return;
        
        const track = this.musicTracks[this.musicState];
        if (!track) return;
        
        // Modulate each layer
        this.currentMusicTrack.oscillators.forEach((oscillator, index) => {
            const layer = track.layers[index];
            const gainNode = this.currentMusicTrack.gainNodes[index];
            
            if (oscillator && gainNode && layer) {
                // Adjust frequency based on intensity
                const freqMod = 1 + (this.intensity * 0.1);
                oscillator.frequency.value = layer.freq * freqMod;
                
                // Adjust volume based on tension
                const volumeMod = 1 + (this.tension * 0.3);
                gainNode.gain.value = layer.volume * volumeMod;
            }
        });
        
        // Adjust master volume based on overall intensity
        const masterVolumeMod = 1 + (this.intensity * 0.2);
        this.currentMusicTrack.masterGain.gain.value = track.volume * masterVolumeMod;
    }
    
    /**
     * Set music state manually
     * @param {string} state - Music state to set
     */
    setMusicState(state) {
        if (this.musicTracks[state]) {
            this.transitionToMusicState(state);
        }
    }
    
    /**
     * Get current music information
     * @returns {Object} Music info
     */
    getMusicInfo() {
        return {
            state: this.musicState,
            track: this.currentMusicTrack ? this.currentMusicTrack.name : null,
            intensity: this.intensity,
            tension: this.tension,
            transitioning: this.musicTransitionTimer > 0
        };
    }
}

// Export AudioManager
window.AudioManager = AudioManager;