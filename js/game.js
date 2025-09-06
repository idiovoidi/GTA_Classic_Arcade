class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.targetFrameTime = 1000 / this.fps;
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
        
        // Game objects
        this.player = null;
        this.city = null;
        this.pedestrians = [];
        this.police = [];
        this.vehicles = [];
        this.bullets = [];
        this.particles = [];
        
        // Game stats
        this.score = 0;
        this.wantedLevel = 0;
        this.wantedTimer = 0;
        
        // Input handling
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            clicked: false
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.clicked = true;
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.mouse.clicked = false;
        });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    init() {
        // Initialize game objects
        this.city = new City(this);
        this.player = new Player(this, this.width / 2, this.height / 2);
        
        // Spawn initial pedestrians
        for (let i = 0; i < 20; i++) {
            this.spawnPedestrian();
        }
        
        // Spawn some vehicles
        for (let i = 0; i < 5; i++) {
            this.spawnVehicle();
        }
        
        this.isRunning = true;
        this.gameLoop();
    }
    
    spawnPedestrian() {
        const x = Math.random() * this.city.width;
        const y = Math.random() * this.city.height;
        this.pedestrians.push(new Pedestrian(this, x, y));
    }
    
    spawnVehicle() {
        const x = Math.random() * this.city.width;
        const y = Math.random() * this.city.height;
        this.vehicles.push(new Vehicle(this, x, y));
    }
    
    update(deltaTime) {
        // Update camera to follow player
        this.camera.x = this.player.x - this.width / 2;
        this.camera.y = this.player.y - this.height / 2;
        
        // Update game objects
        this.player.update(deltaTime);
        this.city.update(deltaTime);
        
        // Update pedestrians
        this.pedestrians.forEach((ped, index) => {
            ped.update(deltaTime);
            if (ped.health <= 0) {
                this.pedestrians.splice(index, 1);
                this.score += 10;
                this.increaseWantedLevel(1);
            }
        });
        
        // Update vehicles
        this.vehicles.forEach((vehicle, index) => {
            vehicle.update(deltaTime);
            if (vehicle.health <= 0) {
                this.vehicles.splice(index, 1);
                this.score += 50;
                this.increaseWantedLevel(2);
            }
        });
        
        // Update police
        this.police.forEach((cop, index) => {
            cop.update(deltaTime);
            if (cop.health <= 0) {
                this.police.splice(index, 1);
                this.score += 100;
                this.increaseWantedLevel(3);
            }
        });
        
        // Update bullets
        this.bullets.forEach((bullet, index) => {
            bullet.update(deltaTime);
            if (bullet.life <= 0) {
                this.bullets.splice(index, 1);
            }
        });
        
        // Update particles
        this.particles.forEach((particle, index) => {
            particle.update(deltaTime);
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // Spawn new pedestrians occasionally
        if (Math.random() < 0.01) {
            this.spawnPedestrian();
        }
        
        // Spawn police if wanted level is high
        if (this.wantedLevel > 0 && this.police.length < this.wantedLevel * 2 && Math.random() < 0.005) {
            this.spawnPolice();
        }
        
        // Decrease wanted level over time
        if (this.wantedLevel > 0) {
            this.wantedTimer += deltaTime;
            if (this.wantedTimer > 5000) { // 5 seconds
                this.wantedLevel = Math.max(0, this.wantedLevel - 1);
                this.wantedTimer = 0;
            }
        }
    }
    
    spawnPolice() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 300;
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;
        this.police.push(new Police(this, x, y));
    }
    
    increaseWantedLevel(amount) {
        this.wantedLevel = Math.min(6, this.wantedLevel + amount);
        this.wantedTimer = 0;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render game objects
        this.city.render(this.ctx);
        
        // Render vehicles first (so they appear behind player)
        this.vehicles.forEach(vehicle => vehicle.render(this.ctx));
        
        // Render pedestrians
        this.pedestrians.forEach(ped => ped.render(this.ctx));
        
        // Render police
        this.police.forEach(cop => cop.render(this.ctx));
        
        // Render player
        this.player.render(this.ctx);
        
        // Render bullets
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        
        // Render particles
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // Restore context
        this.ctx.restore();
        
        // Render UI
        this.renderUI();
    }
    
    renderUI() {
        // Update UI elements
        document.getElementById('wantedLevel').textContent = `WANTED: ${this.wantedLevel}`;
        document.getElementById('score').textContent = `SCORE: ${this.score}`;
        
        // Render minimap
        this.renderMinimap();
    }
    
    renderMinimap() {
        const minimap = document.getElementById('minimap');
        const minimapCtx = minimap.getContext('2d');
        const scale = 0.1;
        
        minimapCtx.fillStyle = '#000';
        minimapCtx.fillRect(0, 0, 150, 150);
        
        // Draw city
        minimapCtx.fillStyle = '#333';
        minimapCtx.fillRect(0, 0, 150, 150);
        
        // Draw roads
        minimapCtx.fillStyle = '#666';
        for (let x = 0; x < this.city.width; x += 100) {
            minimapCtx.fillRect(x * scale, 0, 20 * scale, 150);
        }
        for (let y = 0; y < this.city.height; y += 100) {
            minimapCtx.fillRect(0, y * scale, 150, 20 * scale);
        }
        
        // Draw player
        minimapCtx.fillStyle = '#00ff00';
        minimapCtx.fillRect(
            this.player.x * scale - 2,
            this.player.y * scale - 2,
            4, 4
        );
        
        // Draw police
        minimapCtx.fillStyle = '#ff0000';
        this.police.forEach(cop => {
            minimapCtx.fillRect(
                cop.x * scale - 1,
                cop.y * scale - 1,
                2, 2
            );
        });
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.deltaTime >= this.targetFrameTime) {
            this.update(this.deltaTime);
            this.render();
            this.deltaTime = 0;
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    addBullet(bullet) {
        this.bullets.push(bullet);
    }
    
    addParticle(particle) {
        this.particles.push(particle);
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    checkCollision(obj1, obj2) {
        const distance = this.getDistance(obj1, obj2);
        return distance < (obj1.radius || 10) + (obj2.radius || 10);
    }
}
