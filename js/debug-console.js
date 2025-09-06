/**
 * Debug Console for Error Monitoring and Game Debugging
 * Provides real-time error monitoring and debugging tools
 */

class DebugConsole {
    constructor() {
        this.isVisible = false;
        this.errors = [];
        this.performance = {
            fps: 0,
            frameTime: 0,
            memory: 0
        };
        this.gameState = {};
        
        this.createConsole();
        this.setupKeyboardShortcuts();
        this.startPerformanceMonitoring();
    }
    
    /**
     * Create the debug console UI
     */
    createConsole() {
        // Create console container
        this.console = document.createElement('div');
        this.console.id = 'debug-console';
        this.console.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
        `;
        
        // Create console content
        this.console.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                <h2 style="margin: 0; color: #00ff00;">Debug Console</h2>
                <button id="close-console" style="background: #ff0000; color: white; border: none; padding: 5px 10px; cursor: pointer;">Close (F12)</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: calc(100% - 60px);">
                <!-- Left Panel -->
                <div>
                    <h3>Error Log</h3>
                    <div id="error-log" style="background: #111; padding: 10px; border: 1px solid #333; height: 200px; overflow-y: auto; margin-bottom: 20px;"></div>
                    
                    <h3>Performance</h3>
                    <div id="performance-info" style="background: #111; padding: 10px; border: 1px solid #333; margin-bottom: 20px;">
                        <div>FPS: <span id="fps-display">0</span></div>
                        <div>Frame Time: <span id="frame-time-display">0</span>ms</div>
                        <div>Memory: <span id="memory-display">0</span>MB</div>
                    </div>
                    
                    <h3>Game State</h3>
                    <div id="game-state" style="background: #111; padding: 10px; border: 1px solid #333; height: 150px; overflow-y: auto;"></div>
                </div>
                
                <!-- Right Panel -->
                <div>
                    <h3>Controls</h3>
                    <div style="background: #111; padding: 10px; border: 1px solid #333; margin-bottom: 20px;">
                        <button onclick="debugConsole.clearErrors()" style="background: #ff6600; color: white; border: none; padding: 5px 10px; margin: 2px; cursor: pointer;">Clear Errors</button>
                        <button onclick="debugConsole.exportErrors()" style="background: #0066ff; color: white; border: none; padding: 5px 10px; margin: 2px; cursor: pointer;">Export Errors</button>
                        <button onclick="debugConsole.testError()" style="background: #ff0066; color: white; border: none; padding: 5px 10px; margin: 2px; cursor: pointer;">Test Error</button>
                        <button onclick="debugConsole.reloadGame()" style="background: #00ff66; color: white; border: none; padding: 5px 10px; margin: 2px; cursor: pointer;">Reload Game</button>
                    </div>
                    
                    <h3>Error Statistics</h3>
                    <div id="error-stats" style="background: #111; padding: 10px; border: 1px solid #333; margin-bottom: 20px;"></div>
                    
                    <h3>Console Commands</h3>
                    <div style="background: #111; padding: 10px; border: 1px solid #333;">
                        <input type="text" id="console-input" placeholder="Enter command..." style="width: 100%; background: #222; color: #00ff00; border: 1px solid #333; padding: 5px; margin-bottom: 10px;">
                        <div id="console-output" style="height: 100px; overflow-y: auto; background: #000; padding: 5px; border: 1px solid #333;"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.console);
        
        // Set up event listeners
        document.getElementById('close-console').addEventListener('click', () => this.hide());
        document.getElementById('console-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(e.target.value);
                e.target.value = '';
            }
        });
    }
    
    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceInfo();
            this.updateGameState();
        }, 1000);
    }
    
    /**
     * Toggle console visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        this.console.style.display = this.isVisible ? 'block' : 'none';
        
        if (this.isVisible) {
            this.updateAll();
        }
    }
    
    /**
     * Show console
     */
    show() {
        this.isVisible = true;
        this.console.style.display = 'block';
        this.updateAll();
    }
    
    /**
     * Hide console
     */
    hide() {
        this.isVisible = false;
        this.console.style.display = 'none';
    }
    
    /**
     * Update all console information
     */
    updateAll() {
        this.updateErrorLog();
        this.updatePerformanceInfo();
        this.updateGameState();
        this.updateErrorStats();
    }
    
    /**
     * Update error log display
     */
    updateErrorLog() {
        const errorLog = document.getElementById('error-log');
        if (!errorLog) return;
        
        const errors = window.errorHandler?.getErrorStats() || { recent: [] };
        errorLog.innerHTML = errors.recent.map(error => `
            <div style="margin-bottom: 5px; padding: 5px; background: ${error.critical ? '#330000' : '#001100'}; border-left: 3px solid ${error.critical ? '#ff0000' : '#ffaa00'};">
                <div style="font-weight: bold;">[${error.type}] ${error.data.message || 'Unknown error'}</div>
                <div style="font-size: 10px; color: #888;">${new Date(error.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
    }
    
    /**
     * Update performance information
     */
    updatePerformanceInfo() {
        if (window.game) {
            this.performance.fps = window.game.fps || 0;
            this.performance.frameTime = window.game.deltaTime || 0;
            this.performance.memory = performance.memory ? 
                Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
        }
        
        document.getElementById('fps-display').textContent = this.performance.fps;
        document.getElementById('frame-time-display').textContent = this.performance.frameTime.toFixed(2);
        document.getElementById('memory-display').textContent = this.performance.memory;
    }
    
    /**
     * Update game state information
     */
    updateGameState() {
        if (!window.game) {
            document.getElementById('game-state').innerHTML = '<div>Game not initialized</div>';
            return;
        }
        
        const state = {
            isRunning: window.game.isRunning,
            score: window.game.score,
            wantedLevel: window.game.wantedLevel,
            playerHealth: window.game.player?.health || 0,
            entities: {
                pedestrians: window.game.pedestrians?.length || 0,
                vehicles: window.game.vehicles?.length || 0,
                police: window.game.police?.length || 0,
                bullets: window.game.bullets?.length || 0,
                particles: window.game.particles?.length || 0
            },
            camera: {
                x: Math.round(window.game.camera?.x || 0),
                y: Math.round(window.game.camera?.y || 0)
            }
        };
        
        document.getElementById('game-state').innerHTML = `
            <div>Running: ${state.isRunning}</div>
            <div>Score: ${state.score}</div>
            <div>Wanted: ${state.wantedLevel}</div>
            <div>Health: ${state.playerHealth}</div>
            <div>Pedestrians: ${state.entities.pedestrians}</div>
            <div>Vehicles: ${state.entities.vehicles}</div>
            <div>Police: ${state.entities.police}</div>
            <div>Bullets: ${state.entities.bullets}</div>
            <div>Particles: ${state.entities.particles}</div>
            <div>Camera: (${state.camera.x}, ${state.camera.y})</div>
        `;
    }
    
    /**
     * Update error statistics
     */
    updateErrorStats() {
        const stats = window.errorHandler?.getErrorStats() || { total: 0, critical: 0, byType: {} };
        
        document.getElementById('error-stats').innerHTML = `
            <div>Total Errors: ${stats.total}</div>
            <div>Critical Errors: ${stats.critical}</div>
            <div>Error Types:</div>
            ${Object.entries(stats.byType).map(([type, count]) => 
                `<div style="margin-left: 10px;">${type}: ${count}</div>`
            ).join('')}
        `;
    }
    
    /**
     * Clear all errors
     */
    clearErrors() {
        window.errorHandler?.clearErrors();
        this.updateErrorLog();
        this.updateErrorStats();
        this.log('Errors cleared');
    }
    
    /**
     * Export errors to JSON
     */
    exportErrors() {
        const errors = window.errorHandler?.errors || [];
        const dataStr = JSON.stringify(errors, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `gta-clone-errors-${new Date().toISOString().slice(0, 19)}.json`;
        link.click();
        
        this.log('Errors exported');
    }
    
    /**
     * Test error handling
     */
    testError() {
        window.errorHandler?.handleError('test_error', {
            message: 'This is a test error',
            test: true
        });
        this.log('Test error generated');
    }
    
    /**
     * Reload the game
     */
    reloadGame() {
        if (window.game) {
            window.game.isRunning = false;
        }
        window.location.reload();
    }
    
    /**
     * Execute console command
     * @param {string} command - Command to execute
     */
    executeCommand(command) {
        const output = document.getElementById('console-output');
        
        try {
            // Handle special commands
            if (command.startsWith('clear')) {
                output.innerHTML = '';
                return;
            }
            
            if (command.startsWith('help')) {
                this.log('Available commands: clear, help, game, errors, performance');
                return;
            }
            
            if (command.startsWith('game')) {
                if (window.game) {
                    this.log(`Game state: ${JSON.stringify(this.gameState, null, 2)}`);
                } else {
                    this.log('Game not initialized');
                }
                return;
            }
            
            if (command.startsWith('errors')) {
                const stats = window.errorHandler?.getErrorStats() || {};
                this.log(`Error stats: ${JSON.stringify(stats, null, 2)}`);
                return;
            }
            
            if (command.startsWith('performance')) {
                this.log(`Performance: FPS=${this.performance.fps}, Memory=${this.performance.memory}MB`);
                return;
            }
            
            // Execute as JavaScript
            const result = eval(command);
            this.log(`> ${command}`);
            this.log(`< ${result}`);
            
        } catch (error) {
            this.log(`Error: ${error.message}`);
        }
    }
    
    /**
     * Log message to console output
     * @param {string} message - Message to log
     */
    log(message) {
        const output = document.getElementById('console-output');
        if (output) {
            const time = new Date().toLocaleTimeString();
            output.innerHTML += `<div>[${time}] ${message}</div>`;
            output.scrollTop = output.scrollHeight;
        }
    }
}

// Initialize debug console
window.debugConsole = new DebugConsole();

// Add debug console to global scope for easy access
window.DebugConsole = DebugConsole;
