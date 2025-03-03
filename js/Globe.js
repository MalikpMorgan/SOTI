class Globe {
    constructor() {
        this.rotationX = 0;
        this.rotationY = 0;
        this.velocityX = 0;
        this.velocityY = 0.0150;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Create p5 instance
        this.sketch = new p5(this.createSketch.bind(this), 'globeContainer');
    }

    createSketch(p) {
        p.setup = () => {
            p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
            p.smooth();
        };

        p.draw = () => {
            p.background(0);
            
            if (!this.isDragging) {
                this.rotationX += this.velocityX;
                this.rotationY += this.velocityY;
            }
            
            p.rotateX(this.rotationX);
            p.rotateY(this.rotationY);
            
            p.stroke(255);
            p.noFill();
            p.sphere(200);
        };

        p.windowResized = () => {
            p.resizeCanvas(window.innerWidth, window.innerHeight);
        };

        p.mousePressed = () => {
            this.isDragging = true;
            this.lastMouseX = p.mouseX;
            this.lastMouseY = p.mouseY;
        };

        p.mouseReleased = () => {
            this.isDragging = false;
        };

        p.mouseDragged = () => {
            if (this.isDragging) {
                const deltaX = p.mouseX - this.lastMouseX;
                const deltaY = p.mouseY - this.lastMouseY;
                
                this.velocityX = -deltaY * 0.00055;
                this.velocityY = deltaX * 0.00055;
                
                this.rotationX += this.velocityX;
                this.rotationY += this.velocityY;
                
                this.lastMouseX = p.mouseX;
                this.lastMouseY = p.mouseY;
            }
        };
    }
} 