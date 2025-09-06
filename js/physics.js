class Physics {
    static checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius || 10) + (obj2.radius || 10);
    }
    
    static checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    static checkPointInRect(pointX, pointY, rect) {
        return pointX >= rect.x &&
               pointX <= rect.x + rect.width &&
               pointY >= rect.y &&
               pointY <= rect.y + rect.height;
    }
    
    static getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    static randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    static angleBetweenPoints(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    static distanceBetweenPoints(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static isPointInCircle(pointX, pointY, circleX, circleY, radius) {
        const dx = pointX - circleX;
        const dy = pointY - circleY;
        return (dx * dx + dy * dy) <= (radius * radius);
    }
    
    static isPointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
        return pointX >= rectX &&
               pointX <= rectX + rectWidth &&
               pointY >= rectY &&
               pointY <= rectY + rectHeight;
    }
    
    static lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
        // Check if line from (x1,y1) to (x2,y2) intersects rectangle (rx,ry,rw,rh)
        const left = this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
        const right = this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
        const top = this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
        const bottom = this.lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
        
        return left || right || top || bottom;
    }
    
    static lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 0.0001) return false;
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    
    static bounceOffWall(obj, wallX, wallY, wallWidth, wallHeight) {
        // Simple wall bouncing logic
        if (obj.x < wallX) {
            obj.x = wallX;
            obj.velocity.x = Math.abs(obj.velocity.x);
        } else if (obj.x > wallX + wallWidth) {
            obj.x = wallX + wallWidth;
            obj.velocity.x = -Math.abs(obj.velocity.x);
        }
        
        if (obj.y < wallY) {
            obj.y = wallY;
            obj.velocity.y = Math.abs(obj.velocity.y);
        } else if (obj.y > wallY + wallHeight) {
            obj.y = wallY + wallHeight;
            obj.velocity.y = -Math.abs(obj.velocity.y);
        }
    }
    
    static applyFriction(obj, friction) {
        obj.velocity.x *= friction;
        obj.velocity.y *= friction;
    }
    
    static applyForce(obj, forceX, forceY) {
        obj.velocity.x += forceX;
        obj.velocity.y += forceY;
    }
    
    static limitVelocity(obj, maxSpeed) {
        const speed = Math.sqrt(obj.velocity.x * obj.velocity.x + obj.velocity.y * obj.velocity.y);
        if (speed > maxSpeed) {
            obj.velocity.x = (obj.velocity.x / speed) * maxSpeed;
            obj.velocity.y = (obj.velocity.y / speed) * maxSpeed;
        }
    }
}
