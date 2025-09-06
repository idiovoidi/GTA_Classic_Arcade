/**
 * Comprehensive Error Handling System for GTA Clone
 * Provides centralized error management, logging, and recovery
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.isEnabled = true;
        this.reportingEnabled = false;
        this.recoveryStrategies = new Map();
        
        this.setupGlobalErrorHandling();
        this.setupRecoveryStrategies();
    }
    
    /**
     * Set up global error handling for uncaught errors
     */
    setupGlobalErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                type: 'uncaught_error'
            });
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('promise_rejection', {
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                type: 'unhandled_promise'
            });
        });
        
        // Handle canvas context errors
        this.setupCanvasErrorHandling();
    }
    
    /**
     * Set up canvas-specific error handling
     */
    setupCanvasErrorHandling() {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
            try {
                const context = originalGetContext.call(this, contextType, ...args);
                if (!context) {
                    throw new Error(`Failed to get ${contextType} context from canvas`);
                }
                return context;
            } catch (error) {
                ErrorHandler.getInstance().handleError('canvas_context_error', {
                    message: error.message,
                    contextType: contextType,
                    canvasId: this.id || 'unknown',
                    type: 'canvas_error'
                });
                return null;
            }
        };
    }
    
    /**
     * Set up recovery strategies for different error types
     */
    setupRecoveryStrategies() {
        // Game engine recovery
        this.recoveryStrategies.set('game_engine_error', () => {
            console.log('Attempting game engine recovery...');
            if (window.game) {
                try {
                    window.game.isRunning = false;
                    window.game = null;
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } catch (e) {
                    console.error('Failed to recover game engine:', e);
                }
            }
        });
        
        // Rendering recovery
        this.recoveryStrategies.set('rendering_error', () => {
            console.log('Attempting rendering recovery...');
            if (window.game && window.game.ctx) {
                try {
                    window.game.ctx.clearRect(0, 0, window.game.width, window.game.height);
                    window.game.ctx.fillStyle = '#000';
                    window.game.ctx.fillRect(0, 0, window.game.width, window.game.height);
                    window.game.ctx.fillStyle = '#fff';
                    window.game.ctx.font = '16px Arial';
                    window.game.ctx.textAlign = 'center';
                    window.game.ctx.fillText('Rendering Error - Attempting Recovery...', 
                        window.game.width / 2, window.game.height / 2);
                } catch (e) {
                    console.error('Failed to recover rendering:', e);
                }
            }
        });
        
        // Audio recovery
        this.recoveryStrategies.set('audio_error', () => {
            console.log('Attempting audio recovery...');
            try {
                if (window.game && window.game.audioManager) {
                    window.game.audioManager.disable();
                }
            } catch (e) {
                console.error('Failed to recover audio:', e);
            }
        });
        
        // Physics recovery
        this.recoveryStrategies.set('physics_error', () => {
            console.log('Attempting physics recovery...');
            try {
                if (window.game) {
                    // Reset physics state
                    window.game.bullets = [];
                    window.game.particles = [];
                    // Clear any problematic entities
                    window.game.pedestrians = window.game.pedestrians.filter(p => p && p.health > 0);
                    window.game.vehicles = window.game.vehicles.filter(v => v && v.health > 0);
                    window.game.police = window.game.police.filter(p => p && p.health > 0);
                }
            } catch (e) {
                console.error('Failed to recover physics:', e);
            }
        });
        
        // Input recovery
        this.recoveryStrategies.set('input_error', () => {
            console.log('Attempting input recovery...');
            try {
                if (window.game) {
                    window.game.keys = {};
                    window.game.mouse = { x: 0, y: 0, clicked: false };
                }
            } catch (e) {
                console.error('Failed to recover input:', e);
            }
        });
    }
    
    /**
     * Main error handling method
     * @param {string} errorType - Type of error
     * @param {Object} errorData - Error details
     * @param {boolean} critical - Whether this is a critical error
     */
    handleError(errorType, errorData, critical = false) {
        if (!this.isEnabled) return;
        
        const error = {
            id: this.generateErrorId(),
            type: errorType,
            data: errorData,
            timestamp: new Date().toISOString(),
            critical: critical,
            userAgent: navigator.userAgent,
            url: window.location.href,
            gameState: this.getGameState()
        };
        
        // Add to error log
        this.addError(error);
        
        // Log to console
        this.logError(error);
        
        // Attempt recovery
        this.attemptRecovery(errorType, error);
        
        // Report error if enabled
        if (this.reportingEnabled) {
            this.reportError(error);
        }
        
        // Handle critical errors
        if (critical) {
            this.handleCriticalError(error);
        }
    }
    
    /**
     * Add error to the error log
     * @param {Object} error - Error object
     */
    addError(error) {
        this.errors.push(error);
        
        // Keep only the most recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }
    }
    
    /**
     * Log error to console with appropriate level
     * @param {Object} error - Error object
     */
    logError(error) {
        const logMessage = `[${error.type}] ${error.data.message || 'Unknown error'}`;
        const logData = {
            error: error,
            stack: error.data.stack,
            gameState: error.gameState
        };
        
        if (error.critical) {
            console.error(logMessage, logData);
        } else {
            console.warn(logMessage, logData);
        }
    }
    
    /**
     * Attempt to recover from the error
     * @param {string} errorType - Type of error
     * @param {Object} error - Error object
     */
    attemptRecovery(errorType, error) {
        const recoveryStrategy = this.recoveryStrategies.get(errorType);
        if (recoveryStrategy) {
            try {
                recoveryStrategy();
                console.log(`Recovery attempted for ${errorType}`);
            } catch (recoveryError) {
                console.error(`Recovery failed for ${errorType}:`, recoveryError);
                this.handleError('recovery_failed', {
                    message: recoveryError.message,
                    originalError: errorType,
                    stack: recoveryError.stack
                });
            }
        }
    }
    
    /**
     * Handle critical errors that require immediate attention
     * @param {Object} error - Error object
     */
    handleCriticalError(error) {
        console.error('CRITICAL ERROR:', error);
        
        // Show user-friendly error message
        this.showErrorMessage('A critical error occurred. The game will attempt to recover.');
        
        // Attempt emergency recovery
        setTimeout(() => {
            if (this.isGameUnresponsive()) {
                this.showErrorMessage('The game is unresponsive. Please refresh the page.');
                this.enableRefreshPrompt();
            }
        }, 5000);
    }
    
    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    showErrorMessage(message) {
        // Remove existing error messages
        const existingError = document.getElementById('game-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.id = 'game-error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #ff0000;
            padding: 20px;
            border: 2px solid #ff0000;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            text-align: center;
            z-index: 10000;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <div style="margin-bottom: 10px;">⚠️ Game Error</div>
            <div style="margin-bottom: 15px;">${message}</div>
            <button onclick="this.parentElement.remove()" style="
                background: #ff0000;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            ">OK</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }
    
    /**
     * Enable refresh prompt for unresponsive games
     */
    enableRefreshPrompt() {
        const refreshDiv = document.createElement('div');
        refreshDiv.id = 'game-refresh-prompt';
        refreshDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            z-index: 10001;
        `;
        refreshDiv.innerHTML = `
            <div style="margin-bottom: 10px;">Game Unresponsive</div>
            <button onclick="window.location.reload()" style="
                background: white;
                color: #ff0000;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
            ">Refresh Page</button>
        `;
        
        document.body.appendChild(refreshDiv);
    }
    
    /**
     * Check if game is unresponsive
     * @returns {boolean} True if game is unresponsive
     */
    isGameUnresponsive() {
        if (!window.game) return true;
        
        // Check if game loop is running
        if (!window.game.isRunning) return true;
        
        // Check if last update was too long ago
        const now = performance.now();
        const lastUpdate = window.game.lastTime || 0;
        return (now - lastUpdate) > 5000; // 5 seconds
    }
    
    /**
     * Get current game state for error context
     * @returns {Object} Game state information
     */
    getGameState() {
        if (!window.game) return { status: 'not_initialized' };
        
        return {
            status: window.game.isRunning ? 'running' : 'stopped',
            score: window.game.score || 0,
            wantedLevel: window.game.wantedLevel || 0,
            playerHealth: window.game.player?.health || 0,
            entityCounts: {
                pedestrians: window.game.pedestrians?.length || 0,
                vehicles: window.game.vehicles?.length || 0,
                police: window.game.police?.length || 0,
                bullets: window.game.bullets?.length || 0,
                particles: window.game.particles?.length || 0
            },
            performance: {
                fps: window.game.fps || 0,
                deltaTime: window.game.deltaTime || 0
            }
        };
    }
    
    /**
     * Generate unique error ID
     * @returns {string} Unique error ID
     */
    generateErrorId() {
        return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Report error to external service
     * @param {Object} error - Error object
     */
    reportError(error) {
        // This would typically send to an error reporting service
        // For now, we'll just log it
        console.log('Error reported:', error);
        
        // Example: Send to external service
        // fetch('/api/errors', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(error)
        // }).catch(e => console.error('Failed to report error:', e));
    }
    
    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            critical: this.errors.filter(e => e.critical).length,
            byType: {},
            recent: this.errors.slice(-10)
        };
        
        this.errors.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * Clear error log
     */
    clearErrors() {
        this.errors = [];
        console.log('Error log cleared');
    }
    
    /**
     * Enable/disable error handling
     * @param {boolean} enabled - Whether to enable error handling
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`Error handling ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Enable/disable error reporting
     * @param {boolean} enabled - Whether to enable error reporting
     */
    setReportingEnabled(enabled) {
        this.reportingEnabled = enabled;
        console.log(`Error reporting ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Get singleton instance
     * @returns {ErrorHandler} Error handler instance
     */
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
}

/**
 * Game-specific error types and handling
 */
class GameErrorHandler extends ErrorHandler {
    constructor() {
        super();
        this.setupGameSpecificHandling();
    }
    
    /**
     * Set up game-specific error handling
     */
    setupGameSpecificHandling() {
        // Player-specific errors
        this.recoveryStrategies.set('player_error', () => {
            console.log('Attempting player recovery...');
            if (window.game && window.game.player) {
                try {
                    // Reset player to safe state
                    window.game.player.health = Math.max(1, window.game.player.health);
                    window.game.player.speed = 0;
                    window.game.player.velocity = { x: 0, y: 0 };
                } catch (e) {
                    console.error('Failed to recover player:', e);
                }
            }
        });
        
        // City-specific errors
        this.recoveryStrategies.set('city_error', () => {
            console.log('Attempting city recovery...');
            try {
                if (window.game && window.game.city) {
                    // Regenerate city if corrupted
                    window.game.city.generateCity();
                }
            } catch (e) {
                console.error('Failed to recover city:', e);
            }
        });
        
        // AI-specific errors
        this.recoveryStrategies.set('ai_error', () => {
            console.log('Attempting AI recovery...');
            try {
                if (window.game) {
                    // Clear problematic AI entities
                    window.game.pedestrians = window.game.pedestrians.filter(p => p && typeof p.update === 'function');
                    window.game.vehicles = window.game.vehicles.filter(v => v && typeof v.update === 'function');
                    window.game.police = window.game.police.filter(p => p && typeof p.update === 'function');
                }
            } catch (e) {
                console.error('Failed to recover AI:', e);
            }
        });
    }
    
    /**
     * Handle game-specific errors with context
     * @param {string} errorType - Type of error
     * @param {Object} errorData - Error details
     * @param {Object} gameContext - Game context information
     */
    handleGameError(errorType, errorData, gameContext = {}) {
        const enhancedErrorData = {
            ...errorData,
            gameContext: {
                ...gameContext,
                timestamp: Date.now(),
                frame: window.game?.frameCount || 0
            }
        };
        
        this.handleError(errorType, enhancedErrorData);
    }
}

// Export for use in other modules
window.ErrorHandler = ErrorHandler;
window.GameErrorHandler = GameErrorHandler;

// Initialize global error handler
window.errorHandler = new GameErrorHandler();
