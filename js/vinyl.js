import * as THREE from 'three';

export class Vinyl {
    constructor(scene, position, direction) {
        this.scene = scene;
        this.speed = 15;
        this.lifespan = 2; // Seconds before disappearing
        this.timeAlive = 0;
        
        // Create vinyl geometry
        const vinylGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32);
        
        // Create materials for both sides of the vinyl
        const vinylMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.8,
            roughness: 0.2,
            side: THREE.DoubleSide
        });
        
        // Create the vinyl mesh
        this.vinyl = new THREE.Mesh(vinylGeometry, vinylMaterial);
        
        // Add grooves (rings) to the vinyl
        const grooveCount = 8;
        for (let i = 1; i <= grooveCount; i++) {
            const radius = (i / grooveCount) * 0.18;
            const grooveGeometry = new THREE.RingGeometry(radius, radius + 0.01, 32);
            const grooveMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333,
                side: THREE.DoubleSide
            });
            const groove = new THREE.Mesh(grooveGeometry, grooveMaterial);
            groove.rotation.x = Math.PI / 2;
            groove.position.y = 0.011; // Slightly above the vinyl surface
            this.vinyl.add(groove);
            
            // Add groove to bottom side
            const bottomGroove = groove.clone();
            bottomGroove.position.y = -0.011;
            this.vinyl.add(bottomGroove);
        }
        
        // Add center hole
        const holeGeometry = new THREE.CircleGeometry(0.02, 16);
        const holeMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
            side: THREE.DoubleSide
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.rotation.x = Math.PI / 2;
        hole.position.y = 0.011;
        this.vinyl.add(hole);
        
        // Add hole to bottom side
        const bottomHole = hole.clone();
        bottomHole.position.y = -0.011;
        this.vinyl.add(bottomHole);
        
        // Position and rotate the vinyl
        this.vinyl.position.copy(position);
        this.vinyl.rotation.x = Math.PI / 2; // Make it vertical
        
        // Store normalized direction for movement
        this.direction = direction.normalize();
        
        // Add to scene
        this.scene.add(this.vinyl);
    }
    
    update(deltaTime) {
        // Update position
        this.vinyl.position.x += this.direction.x * this.speed * deltaTime;
        this.vinyl.position.z += this.direction.z * this.speed * deltaTime;
        
        // Rotate the vinyl
        this.vinyl.rotation.y += 15 * deltaTime; // Spin animation
        
        // Update lifespan
        this.timeAlive += deltaTime;
        
        // Check if vinyl should be removed
        if (this.timeAlive >= this.lifespan) {
            this.remove();
            return false;
        }
        
        return true;
    }
    
    remove() {
        this.scene.remove(this.vinyl);
    }
    
    getPosition() {
        return this.vinyl.position;
    }
} 