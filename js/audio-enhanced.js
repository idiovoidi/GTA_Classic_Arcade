// Enhanced Audio Manager with external sound support
class EnhancedAudioManager extends AudioManager {
  constructor() {
    super();

    // External sound files support
    this.externalSounds = new Map();
    this.loadingSounds = new Set();

    // Sound sprite support (multiple sounds in one file)
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
      city: { reverb: 0.4, echo: 0.2 },
    };
    this.currentEnvironment = "outdoor";

    console.log("EnhancedAudioManager initialized");
  }

  /**
   * Load external sound file
   * @param {string} name - Sound identifier
   * @param {string} url - URL to sound file
   * @returns {Promise} Promise that resolves when loaded
   */
  async loadSound(name, url) {
    if (this.externalSounds.has(name)) {
      return this.externalSounds.get(name);
    }

    if (this.loadingSounds.has(name)) {
      // Wait for existing load
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
   * @param {Object} soundMap - Map of name: url pairs
   * @returns {Promise} Promise that resolves when all loaded
   */
  async loadSounds(soundMap) {
    const promises = Object.entries(soundMap).map(([name, url]) =>
      this.loadSound(name, url)
    );
    return Promise.all(promises);
  }

  /**
   * Play external sound
   * @param {string} name - Sound name
   * @param {Object} options - Playback options
   * @returns {Object} Sound control object
   */
  playExternalSound(name, options = {}) {
    const {
      volume = 1.0,
      pitch = 1.0,
      loop = false,
      x = null,
      y = null,
      fadeIn = 0,
      fadeOut = 0,
    } = options;

    if (!this.enabled || !this.audioContext) return null;

    const buffer = this.externalSounds.get(name);
    if (!buffer) {
      console.warn(`External sound not loaded: ${name}`);
      // Fallback to procedural sound
      return this.playSound(name, volume, pitch, loop, x, y);
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      let pannerNode = null;

      source.buffer = buffer;
      source.loop = loop;
      source.playbackRate.value = pitch;

      // Set up gain with fade in
      if (fadeIn > 0) {
        gainNode.gain.value = 0;
        gainNode.gain.linearRampToValueAtTime(
          volume,
          this.audioContext.currentTime + fadeIn / 1000
        );
      } else {
        gainNode.gain.value = volume;
      }

      // Set up 3D positioning if coordinates provided
      if (x !== null && y !== null) {
        pannerNode = this.create3DPanner(x, y);
        source.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(this.sfxGain);
      } else {
        source.connect(gainNode);
        gainNode.connect(this.sfxGain);
      }

      // Schedule fade out if specified
      if (fadeOut > 0 && !loop) {
        const fadeOutStart = buffer.duration - fadeOut / 1000;
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
              try {
                source.stop();
              } catch (e) {}
            }, fadeTime);
          } else {
            try {
              source.stop();
            } catch (e) {}
          }
        },
        setVolume: (newVolume) => {
          gainNode.gain.value = Math.max(0, Math.min(1, newVolume));
        },
        updatePosition: (newX, newY) => {
          if (pannerNode) {
            this.updatePannerPosition(pannerNode, newX, newY);
          }
        },
      };
    } catch (error) {
      console.warn("Failed to play external sound:", name, error);
      return null;
    }
  }

  /**
   * Play music track with crossfade
   * @param {string} name - Music track name
   * @param {number} fadeTime - Fade time in ms
   */
  async playMusic(name, fadeTime = null) {
    fadeTime = fadeTime || this.musicFadeTime;

    // Stop current music with fade
    if (this.currentMusic) {
      this.currentMusic.stop(fadeTime);
    }

    // Start new music with fade
    this.currentMusic = this.playExternalSound(name, {
      volume: this.musicVolume,
      loop: true,
      fadeIn: fadeTime,
    });
  }

  /**
   * Stop music
   * @param {number} fadeTime - Fade time in ms
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
   * @param {string} preset - Environment preset name
   */
  setEnvironment(preset) {
    if (this.environmentPresets[preset]) {
      this.currentEnvironment = preset;
      // Apply environment settings to reverb
      // This is a simplified version - full implementation would adjust reverb parameters
      console.log(`Environment set to: ${preset}`);
    }
  }

  /**
   * Play sound with automatic fallback
   * Enhanced version that tries external sound first, then procedural
   */
  playSoundSmart(type, options = {}) {
    // Try external sound first
    if (this.externalSounds.has(type)) {
      return this.playExternalSound(type, options);
    }

    // Try ZzFX if available
    if (typeof playZzFX !== "undefined" && ZzFXSounds[type]) {
      playZzFX(type, options.volume || 1.0);
      return null; // ZzFX doesn't return control object
    }

    // Fallback to procedural
    const {
      volume = 1.0,
      pitch = 1.0,
      loop = false,
      x = null,
      y = null,
    } = options;
    return this.playSound(type, volume, pitch, loop, x, y);
  }

  /**
   * Override playSound to use smart fallback
   * This maintains backward compatibility with existing code
   */
  playSound(
    type,
    volumeOrX = 0.5,
    pitchOrY = 1.0,
    loop = false,
    x = null,
    y = null
  ) {
    // Check if we should use external/ZzFX sounds
    if (this.externalSounds.has(type)) {
      // Convert parameters to options format
      const isPositional =
        typeof volumeOrX === "number" &&
        typeof pitchOrY === "number" &&
        (arguments.length >= 5 || volumeOrX > 10 || pitchOrY > 10);

      if (isPositional) {
        return this.playExternalSound(type, {
          x: volumeOrX,
          y: pitchOrY,
          loop: loop,
        });
      } else {
        return this.playExternalSound(type, {
          volume: volumeOrX,
          pitch: pitchOrY,
          loop: loop,
          x: x,
          y: y,
        });
      }
    }

    // Try ZzFX for better quality procedural sounds
    if (typeof playZzFX !== "undefined" && ZzFXSounds[type]) {
      const volume =
        typeof volumeOrX === "number" && volumeOrX <= 10 ? volumeOrX : 0.5;
      playZzFX(type, volume);
      return null;
    }

    // Fallback to original procedural implementation
    return super.playSound(type, volumeOrX, pitchOrY, loop, x, y);
  }
}

// Replace the global audioManager if it exists
if (typeof audioManager !== "undefined") {
  const oldManager = audioManager;
  audioManager = new EnhancedAudioManager();

  // Copy over any important state
  if (oldManager) {
    audioManager.enabled = oldManager.enabled;
    audioManager.masterVolume = oldManager.masterVolume;
    audioManager.sfxVolume = oldManager.sfxVolume;
    audioManager.musicVolume = oldManager.musicVolume;
  }
}
