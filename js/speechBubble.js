import * as THREE from 'three';

export class SpeechBubble {
    constructor(scene, text, lifespan = 5000) {
        this.scene = scene;
        this.text = text;
        this.lifespan = lifespan;
        this.creationTime = Date.now();
        this.createBubble();
        this.initialOpacity = 0;
        this.targetOpacity = 1;
        this.fadeInDuration = 200; // 200ms fade in
    }

    createBubble() {
        // Create container group
        this.group = new THREE.Group();

        // Create background plane for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size (smaller for better resolution)
        canvas.width = 256;
        canvas.height = 128;
        
        // Draw background with solid color
        context.fillStyle = '#000000';
        this.roundRect(context, 2, 2, canvas.width - 4, canvas.height - 4, 10);
        context.fill();
        
        // Draw border
        context.strokeStyle = '#00ff9d';
        context.lineWidth = 2;
        this.roundRect(context, 2, 2, canvas.width - 4, canvas.height - 4, 10);
        context.stroke();
        
        // Draw text with improved font and size
        context.font = 'bold 16px Arial';
        context.fillStyle = '#00ff9d';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Word wrap text with improved spacing
        const words = this.text.split(' ');
        let line = '';
        let lines = [];
        const maxWidth = canvas.width - 40;
        const lineHeight = 20;

        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = context.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Draw each line with improved positioning
        lines.forEach((line, i) => {
            context.fillText(
                line.trim(),
                canvas.width / 2,
                (canvas.height / 2) - ((lines.length - 1) * lineHeight / 2) + (i * lineHeight)
            );
        });

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create speech bubble plane with adjusted size
        const geometry = new THREE.PlaneGeometry(1.2, 0.6);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        this.bubble = new THREE.Mesh(geometry, material);
        
        // Create pointer triangle
        const triangleGeometry = new THREE.BufferGeometry();
        const triangleVertices = new Float32Array([
            -0.05, -0.2, 0,  // bottom left
             0.05, -0.2, 0,  // bottom right
             0.0, -0.3, 0   // point
        ]);
        triangleGeometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3));
        const triangleMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        
        // Add stroke to triangle
        const triangleStrokeGeometry = new THREE.BufferGeometry();
        const strokeVertices = new Float32Array([
            -0.05, -0.2, 0,
             0.05, -0.2, 0,
             0.0, -0.3, 0,
            -0.05, -0.2, 0  // Close the triangle
        ]);
        triangleStrokeGeometry.setAttribute('position', new THREE.BufferAttribute(strokeVertices, 3));
        const triangleStrokeMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff9d,
            transparent: true,
            opacity: 1
        });

        const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
        const triangleStroke = new THREE.Line(triangleStrokeGeometry, triangleStrokeMaterial);

        // Add meshes to group
        this.group.add(this.bubble);
        this.group.add(triangle);
        this.group.add(triangleStroke);

        // Position above character with increased height
        this.group.position.y = 2.5; // Increased from 2.2 to 2.5
        this.group.position.z = 0.2; // Slight forward offset
        
        // Add to scene
        this.scene.add(this.group);
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    update(characterPosition, camera) {
        if (!this.group) return false;

        // Update position to follow character with increased height
        this.group.position.x = characterPosition.x;
        this.group.position.y = characterPosition.y + 2.5; // Increased from 2.2 to 2.5
        this.group.position.z = characterPosition.z + 0.2; // Keep forward offset

        // Make bubble face camera with slight tilt
        this.group.quaternion.copy(camera.quaternion);
        this.group.rotation.x += 0.1; // Slight upward tilt

        // Handle fade in
        const age = Date.now() - this.creationTime;
        if (age < this.fadeInDuration) {
            this.initialOpacity = age / this.fadeInDuration;
            this.bubble.material.opacity = this.initialOpacity;
            this.group.children[1].material.opacity = this.initialOpacity;
            this.group.children[2].material.opacity = this.initialOpacity;
        } else {
            this.bubble.material.opacity = this.targetOpacity;
            this.group.children[1].material.opacity = this.targetOpacity;
            this.group.children[2].material.opacity = this.targetOpacity;
        }

        // Check if lifetime is expired
        if (age >= this.lifespan) {
            this.remove();
            return false;
        }

        // Fade out near end of life
        const fadeStart = this.lifespan - 300;
        if (age > fadeStart) {
            const opacity = 1 - ((age - fadeStart) / 300);
            this.bubble.material.opacity = opacity;
            this.group.children[1].material.opacity = opacity;
            this.group.children[2].material.opacity = opacity;
        }

        return true;
    }

    remove() {
        if (this.group && this.group.parent) {
            this.scene.remove(this.group);
            this.bubble.material.dispose();
            this.bubble.geometry.dispose();
            this.group.children[1].material.dispose();
            this.group.children[1].geometry.dispose();
            this.group.children[2].material.dispose();
            this.group.children[2].geometry.dispose();
        }
    }
} 