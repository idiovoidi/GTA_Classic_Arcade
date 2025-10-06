// Audio Debug Panel - Shows audio logs in the game window

class AudioDebugPanel {
    constructor() {
        this.logs = [];
        this.maxLogs = 50;
        this.enabled = false;
        this.panel = null;
        this.createPanel();
    }
    
    createPanel() {
        // Create debug panel
        this.panel = document.createElement('div');
        this.panel.id = 'audioDebugPanel';
        this.panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 500px;
            background: rgba(0, 0, 0, 0.9);
            color: #0f0;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            padding: 10px;
            border: 2px solid #0f0;
            border-radius: 5px;
            overflow-y: auto;
            z-index: 10000;
            display: none;
        `;
        
        // Add header
        const header = document.createElement('div');
        header.style.cssText = `
            color: #fff;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #0f0;
        `;
        header.innerHTML = `
            🔊 AUDIO DEBUG LOG
            <button id="clearAudioLog" style="float: right; background: #f00; color: #fff; border: none; padding: 2px 8px; cursor: pointer;">Clear</button>
            <button id="toggleAudioLog" style="float: right; margin-right: 5px; background: #00f; color: #fff; border: none; padding: 2px 8px; cursor: pointer;">Hide</button>
        `;
        this.panel.appendChild(header);
        
        // Add log container
        this.logContainer = document.createElement('div');
        this.logContainer.id = 'audioLogContainer';
        this.panel.appendChild(this.logContainer);
        
        document.body.appendChild(this.panel);
        
        // Add event listeners
        document.getElementById('clearAudioLog').addEventListener('click', () => this.clear());
        document.getElementById('toggleAudioLog').addEventListener('click', () => this.toggle());
        
        // Add keyboard shortcut (F9)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F9') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            time: timestamp,
            message: message,
            type: type
        };
        
        this.logs.push(logEntry);
        
        // Keep only last N logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Update display
        this.updateDisplay();
        
        // Also log to console
        const prefix = `[${timestamp}] [Audio]`;
        switch(type) {
            case 'error':
                console.error(prefix, message);
                break;
            case 'warn':
                console.warn(prefix, message);
                break;
            case 'success':
                console.log(prefix, '✓', message);
                break;
            default:
                console.log(prefix, message);
        }
    }
    
    updateDisplay() {
        if (!this.logContainer) return;
        
        this.logContainer.innerHTML = this.logs.map(log => {
            let color = '#0f0';
            let icon = '•';
            
            switch(log.type) {
                case 'error':
                    color = '#f00';
                    icon = '✗';
                    break;
                case 'warn':
                    color = '#ff0';
                    icon = '⚠';
                    break;
                case 'success':
                    color = '#0f0';
                    icon = '✓';
                    break;
                case 'info':
                    color = '#0ff';
                    icon = 'ℹ';
                    break;
            }
            
            return `<div style="color: ${color}; margin: 2px 0; padding: 2px; border-left: 2px solid ${color}; padding-left: 5px;">
                <span style="color: #888;">[${log.time}]</span> ${icon} ${log.message}
            </div>`;
        }).join('');
        
        // Auto-scroll to bottom
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    
    clear() {
        this.logs = [];
        this.updateDisplay();
    }
    
    toggle() {
        this.enabled = !this.enabled;
        this.panel.style.display = this.enabled ? 'block' : 'none';
        
        if (this.enabled) {
            this.log('Audio debug panel enabled (F9 to toggle)', 'success');
        }
    }
    
    show() {
        this.enabled = true;
        this.panel.style.display = 'block';
    }
    
    hide() {
        this.enabled = false;
        this.panel.style.display = 'none';
    }
}

// Create global debug panel
window.audioDebug = new AudioDebugPanel();

// Helper function for easy logging
window.logAudio = (message, type = 'info') => {
    if (window.audioDebug) {
        window.audioDebug.log(message, type);
    }
};

// Auto-show on first audio event
let firstAudioEvent = true;
const originalLog = console.log;
console.log = function(...args) {
    originalLog.apply(console, args);
    
    // Check if it's an audio-related log
    const message = args.join(' ');
    if (firstAudioEvent && (message.includes('[Audio]') || message.includes('[AudioManager]') || message.includes('[EnhancedAudio]'))) {
        if (window.audioDebug && !window.audioDebug.enabled) {
            window.audioDebug.show();
            firstAudioEvent = false;
        }
    }
};

console.log('[AudioDebug] Debug panel loaded. Press F9 to toggle.');
