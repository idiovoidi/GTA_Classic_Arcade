/**
 * Error Handling Wrappers for Game Classes
 * Provides safe error handling for all game operations
 */

/**
 * Wrap a function with error handling
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context for error reporting
 * @param {Function} fallback - Fallback function if error occurs
 * @returns {Function} Wrapped function
 */
function withErrorHandling(fn, context, fallback = null) {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            window.errorHandler.handleGameError(`${context}_error`, {
                message: error.message,
                stack: error.stack,
                functionName: fn.name,
                arguments: args,
                context: context
            });
            
            if (fallback) {
                try {
                    return fallback.apply(this, args);
                } catch (fallbackError) {
                    window.errorHandler.handleGameError(`${context}_fallback_error`, {
                        message: fallbackError.message,
                        stack: fallbackError.stack,
                        originalError: error.message
                    });
                }
            }
            
            return null;
        }
    };
}

/**
 * Safe property access with error handling
 * @param {Object} obj - Object to access
 * @param {string} path - Property path (e.g., 'player.health')
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} Property value or default
 */
function safeGet(obj, path, defaultValue = null) {
    try {
        return path.split('.').reduce((current, key) => {
            if (current && typeof current === 'object' && key in current) {
                return current[key];
            }
            return defaultValue;
        }, obj);
    } catch (error) {
        window.errorHandler.handleGameError('property_access_error', {
            message: error.message,
            path: path,
            objectType: typeof obj
        });
        return defaultValue;
    }
}

/**
 * Safe array operation with error handling
 * @param {Array} array - Array to operate on
 * @param {Function} operation - Operation to perform
 * @param {string} context - Context for error reporting
 * @returns {Array} Result array
 */
function safeArrayOperation(array, operation, context) {
    try {
        if (!Array.isArray(array)) {
            throw new Error('Expected array, got ' + typeof array);
        }
        return operation(array);
    } catch (error) {
        window.errorHandler.handleGameError(`${context}_array_error`, {
            message: error.message,
            arrayLength: array?.length || 0,
            operation: operation.name
        });
        return [];
    }
}

/**
 * Safe canvas operation with error handling
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Function} operation - Canvas operation
 * @param {string} context - Context for error reporting
 */
function safeCanvasOperation(ctx, operation, context) {
    try {
        if (!ctx || typeof ctx !== 'object') {
            throw new Error('Invalid canvas context');
        }
        operation(ctx);
    } catch (error) {
        window.errorHandler.handleGameError(`${context}_canvas_error`, {
            message: error.message,
            canvasWidth: ctx?.canvas?.width || 0,
            canvasHeight: ctx?.canvas?.height || 0
        });
    }
}

/**
 * Safe physics calculation with error handling
 * @param {Function} calculation - Physics calculation function
 * @param {Object} params - Calculation parameters
 * @param {string} context - Context for error reporting
 * @returns {*} Calculation result or null
 */
function safePhysicsCalculation(calculation, params, context) {
    try {
        // Validate parameters
        if (params && typeof params === 'object') {
            for (const [key, value] of Object.entries(params)) {
                if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
                    throw new Error(`Invalid parameter ${key}: ${value}`);
                }
            }
        }
        
        return calculation(params);
    } catch (error) {
        window.errorHandler.handleGameError(`${context}_physics_error`, {
            message: error.message,
            parameters: params,
            calculation: calculation.name
        });
        return null;
    }
}

/**
 * Safe AI update with error handling
 * @param {Object} entity - AI entity
 * @param {number} deltaTime - Delta time
 * @param {string} entityType - Type of entity
 */
function safeAIUpdate(entity, deltaTime, entityType) {
    try {
        if (!entity || typeof entity.update !== 'function') {
            throw new Error(`Invalid ${entityType} entity`);
        }
        
        if (typeof deltaTime !== 'number' || deltaTime < 0) {
            throw new Error(`Invalid deltaTime: ${deltaTime}`);
        }
        
        entity.update(deltaTime);
    } catch (error) {
        window.errorHandler.handleGameError(`${entityType}_ai_error`, {
            message: error.message,
            entityId: entity?.id || 'unknown',
            deltaTime: deltaTime,
            entityState: entity ? {
                x: entity.x,
                y: entity.y,
                health: entity.health,
                state: entity.state
            } : null
        });
        
        // Remove problematic entity
        if (window.game) {
            switch (entityType) {
                case 'pedestrian':
                    window.game.pedestrians = window.game.pedestrians.filter(p => p !== entity);
                    break;
                case 'vehicle':
                    window.game.vehicles = window.game.vehicles.filter(v => v !== entity);
                    break;
                case 'police':
                    window.game.police = window.game.police.filter(p => p !== entity);
                    break;
            }
        }
    }
}

/**
 * Safe collision detection with error handling
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @param {string} context - Context for error reporting
 * @returns {boolean} Collision result or false
 */
function safeCollisionDetection(obj1, obj2, context) {
    try {
        if (!obj1 || !obj2) {
            throw new Error('Invalid objects for collision detection');
        }
        
        const dx = (obj1.x || 0) - (obj2.x || 0);
        const dy = (obj1.y || 0) - (obj2.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius1 = obj1.radius || 10;
        const radius2 = obj2.radius || 10;
        
        if (isNaN(distance) || !isFinite(distance)) {
            throw new Error('Invalid distance calculation');
        }
        
        return distance < (radius1 + radius2);
    } catch (error) {
        window.errorHandler.handleGameError(`${context}_collision_error`, {
            message: error.message,
            obj1: obj1 ? { x: obj1.x, y: obj1.y, radius: obj1.radius } : null,
            obj2: obj2 ? { x: obj2.x, y: obj2.y, radius: obj2.radius } : null
        });
        return false;
    }
}

/**
 * Safe input handling with error handling
 * @param {Object} inputState - Current input state
 * @param {string} inputType - Type of input (keyboard, mouse, touch)
 * @param {Function} handler - Input handler function
 */
function safeInputHandling(inputState, inputType, handler) {
    try {
        if (!inputState || typeof handler !== 'function') {
            throw new Error(`Invalid input state or handler for ${inputType}`);
        }
        
        handler(inputState);
    } catch (error) {
        window.errorHandler.handleGameError(`${inputType}_input_error`, {
            message: error.message,
            inputState: inputState,
            handler: handler.name
        });
    }
}

/**
 * Safe audio operation with error handling
 * @param {Function} audioOperation - Audio operation
 * @param {string} context - Context for error reporting
 * @param {*} fallback - Fallback value
 * @returns {*} Operation result or fallback
 */
function safeAudioOperation(audioOperation, context, fallback = null) {
    try {
        return audioOperation();
    } catch (error) {
        window.errorHandler.handleGameError(`${context}_audio_error`, {
            message: error.message,
            operation: audioOperation.name
        });
        return fallback;
    }
}

/**
 * Safe rendering operation with error handling
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Function} renderOperation - Rendering operation
 * @param {string} context - Context for error reporting
 */
function safeRenderOperation(ctx, renderOperation, context) {
    try {
        if (!ctx) {
            throw new Error('Canvas context not available');
        }
        
        // Save context state
        ctx.save();
        
        try {
            renderOperation(ctx);
        } finally {
            // Always restore context state
            ctx.restore();
        }
    } catch (error) {
        window.errorHandler.handleGameError(`${context}_render_error`, {
            message: error.message,
            canvasSize: ctx?.canvas ? {
                width: ctx.canvas.width,
                height: ctx.canvas.height
            } : null
        });
        
        // Attempt to clear canvas
        try {
            if (ctx && ctx.canvas) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }
        } catch (clearError) {
            console.error('Failed to clear canvas after render error:', clearError);
        }
    }
}

/**
 * Safe game loop with error handling
 * @param {Function} gameLoop - Game loop function
 * @param {number} currentTime - Current time
 */
function safeGameLoop(gameLoop, currentTime) {
    try {
        gameLoop(currentTime);
    } catch (error) {
        window.errorHandler.handleError('game_loop_error', {
            message: error.message,
            stack: error.stack,
            currentTime: currentTime,
            critical: true
        });
        
        // Attempt to recover game loop
        setTimeout(() => {
            try {
                if (window.game && window.game.gameLoop) {
                    window.game.gameLoop();
                }
            } catch (recoveryError) {
                console.error('Failed to recover game loop:', recoveryError);
                window.errorHandler.showErrorMessage('Game loop failed. Please refresh the page.');
            }
        }, 100);
    }
}

/**
 * Safe entity creation with error handling
 * @param {Function} entityConstructor - Entity constructor
 * @param {Array} args - Constructor arguments
 * @param {string} entityType - Type of entity
 * @returns {Object|null} Created entity or null
 */
function safeEntityCreation(entityConstructor, args, entityType) {
    try {
        if (typeof entityConstructor !== 'function') {
            throw new Error(`Invalid constructor for ${entityType}`);
        }
        
        const entity = new entityConstructor(...args);
        
        // Validate entity
        if (!entity || typeof entity.update !== 'function') {
            throw new Error(`Invalid ${entityType} entity created`);
        }
        
        return entity;
    } catch (error) {
        window.errorHandler.handleGameError(`${entityType}_creation_error`, {
            message: error.message,
            constructor: entityConstructor.name,
            arguments: args
        });
        return null;
    }
}

// Export functions for use in other modules
window.ErrorWrappers = {
    withErrorHandling,
    safeGet,
    safeArrayOperation,
    safeCanvasOperation,
    safePhysicsCalculation,
    safeAIUpdate,
    safeCollisionDetection,
    safeInputHandling,
    safeAudioOperation,
    safeRenderOperation,
    safeGameLoop,
    safeEntityCreation
};
