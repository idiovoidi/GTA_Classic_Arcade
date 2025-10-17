// Main game initialization
let game;

// Initialize the game when the page loads
window.addEventListener('load', () => {
    game = new Game();
    // Expose for error handler/tooling
    try { window.game = game; } catch (e) {}
    game.init();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (game) {
        // Adjust canvas size if needed
        const canvas = game.canvas;
        const container = canvas.parentElement;
        const maxWidth = Math.min(800, window.innerWidth - 20);
        const maxHeight = Math.min(600, window.innerHeight - 20);
        
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        game.width = maxWidth;
        game.height = maxHeight;
    }
});

// Handle visibility change (pause when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            // Pause game
            game.isRunning = false;
        } else {
            // Resume game
            game.isRunning = true;
            game.gameLoop();
        }
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        // Toggle pause
        if (game) {
            game.isRunning = !game.isRunning;
            if (game.isRunning) {
                game.gameLoop();
            }
        }
    }
    
    if (e.code === 'KeyR' && e.ctrlKey) {
        // Restart game
        e.preventDefault();
        if (game) {
            location.reload();
        }
    }
    
    // Test engine sound with 'E' key
    if (e.code === 'KeyE' && game && game.audioManager) {
        console.log('[Test] Playing engine sound manually');
        const sound = game.audioManager.playSound('car_engine', 0.5, 1.0, true);
        console.log('[Test] Engine sound result:', sound);
    }
});

// Prevent right-click context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Lazy-load audio modules and resume audio on first user interaction
let audioResumed = false;
let audioLibLoaded = false;
let audioLibLoadingPromise = null;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(s);
    });
}

async function ensureAudioLibLoaded() {
    if (audioLibLoaded) return;
    if (!audioLibLoadingPromise) {
        audioLibLoadingPromise = (async () => {
            await loadScript('js/audio.js');
            await loadScript('js/audio-system.js');
            // Optional configs/resources; ignore failures
            try { await loadScript('js/sound-config.js'); } catch (e) {}
            try { await loadScript('js/sound-library.js'); } catch (e) {}
            audioLibLoaded = true;
        })();
    }
    await audioLibLoadingPromise;
}

const resumeAudio = async () => {
    if (audioResumed || !game) return;
    try {
        await ensureAudioLibLoaded();
        if (!game.audioManager && typeof EnhancedAudioManager !== 'undefined') {
            game.audioManager = new EnhancedAudioManager();
        }
        if (game.audioManager) {
            game.audioManager.resumeAudio();
            if (game.audioManager.audioContext) {
                await game.audioManager.audioContext.resume();
                audioResumed = true;
            }
        }
    } catch (err) {
        console.error('[Audio] Failed to initialize/resume:', err);
    }
};

document.addEventListener('click', resumeAudio, { once: false });
document.addEventListener('keydown', resumeAudio, { once: false });
document.addEventListener('mousedown', resumeAudio, { once: false });

// Handle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Add fullscreen button to instructions
document.addEventListener('DOMContentLoaded', () => {
    const instructions = document.getElementById('instructions');
    if (instructions) {
        instructions.innerHTML += '<br>ESC - Pause<br>F11 - Fullscreen';
    }
});

// Handle F11 for fullscreen
document.addEventListener('keydown', (e) => {
    if (e.code === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
});

// Performance monitoring
let frameCount = 0;
let lastFpsTime = 0;

function updateFPS() {
    frameCount++;
    const now = performance.now();
    
    if (now - lastFpsTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
        console.log(`FPS: ${fps}`);
        frameCount = 0;
        lastFpsTime = now;
    }
    
    requestAnimationFrame(updateFPS);
}

// Start FPS monitoring only in debug mode
const __IS_DEBUG__ = window.location.search.includes('debug=true');
if (__IS_DEBUG__) {
    updateFPS();
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Game state management
class GameState {
    static SPLASH = 'splash';
    static PLAYING = 'playing';
    static PAUSED = 'paused';
    static GAME_OVER = 'game_over';
}

// Add some debug controls
if (window.location.search.includes('debug=true')) {
    console.log('Debug mode enabled');
    
    // Add debug panel
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'absolute';
    debugPanel.style.top = '10px';
    debugPanel.style.left = '10px';
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugPanel.style.color = '#fff';
    debugPanel.style.padding = '10px';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.zIndex = '1000';
    debugPanel.innerHTML = `
        <div>Debug Mode</div>
        <div>Press F1 for help</div>
    `;
    document.body.appendChild(debugPanel);
    
    // Debug key bindings
    document.addEventListener('keydown', (e) => {
        if (game) {
            switch(e.code) {
                case 'F1':
                    console.log('Debug commands:');
                    console.log('F2 - Add health');
                    console.log('F3 - Add wanted level');
                    console.log('F4 - Spawn police');
                    console.log('F5 - Spawn random vehicle');
                    console.log('F6 - Spawn sports car');
                    console.log('F7 - Spawn truck');
                    console.log('F8 - Spawn motorcycle');
                    console.log('F9 - Show vehicle stats');
                    console.log('F10 - Add boost (50%)');
                    console.log('F11 - Toggle boost regeneration');
                    break;
                case 'F2':
                    game.player.heal(25);
                    break;
                case 'F3':
                    game.increaseWantedLevel(1);
                    break;
                case 'F4':
                    game.spawnPolice();
                    break;
                case 'F5':
                    game.spawnVehicle();
                    break;
                case 'F6':
                    game.spawnSpecificVehicle('SPORTS_CAR');
                    console.log('Spawned sports car');
                    break;
                case 'F7':
                    game.spawnSpecificVehicle('TRUCK');
                    console.log('Spawned truck');
                    break;
                case 'F8':
                    game.spawnSpecificVehicle('MOTORCYCLE');
                    console.log('Spawned motorcycle');
                    break;
                case 'F9':
                    const stats = game.getVehicleTypeStats();
                    console.log('Vehicle Type Stats:', stats);
                    console.log('Total vehicles:', game.vehicles.length);
                    break;
                case 'F10':
                    if (game.player && game.player.addBoost) {
                        game.player.addBoost(50);
                        console.log('Added 50% boost to player');
                    }
                    break;
                case 'F11':
                    if (game.player && game.player.setBoostRegeneration) {
                        game.player.boostRegenEnabled = !game.player.boostRegenEnabled;
                        console.log(`Boost regeneration: ${game.player.boostRegenEnabled ? 'ENABLED' : 'DISABLED'}`);
                    }
                    break;
            }
        }
    });
}
