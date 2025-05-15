import * as THREE from 'three';

export class Vinyl {
    constructor(scene, position, direction) {
        this.scene = scene;
        this.speed = 15;
        this.lifespan = 2; // Seconds before disappearing
        this.timeAlive = 0;
        this.isActive = true;
        this.gravity = 9.8; // Gravity constant
        this.velocity = new THREE.Vector3(
            direction.x * this.speed,
            0,
            direction.z * this.speed
        );
        
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
        this.mesh = new THREE.Mesh(vinylGeometry, vinylMaterial);
        
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
            this.mesh.add(groove);
            
            // Add groove to bottom side
            const bottomGroove = groove.clone();
            bottomGroove.position.y = -0.011;
            this.mesh.add(bottomGroove);
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
        this.mesh.add(hole);
        
        // Add hole to bottom side
        const bottomHole = hole.clone();
        bottomHole.position.y = -0.011;
        this.mesh.add(bottomHole);
        
        // Position and rotate the vinyl
        this.mesh.position.copy(position);
        this.mesh.rotation.x = Math.PI / 2; // Make it vertical
        
        // Add to scene
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        if (!this.isActive) return false;

        // Apply gravity to velocity
        this.velocity.y -= this.gravity * deltaTime;
        
        // Update position based on velocity
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.y += this.velocity.y * deltaTime;
        this.mesh.position.z += this.velocity.z * deltaTime;
        
        // Rotate the vinyl
        this.mesh.rotation.y += 15 * deltaTime; // Spin animation
        
        // Check if vinyl hit the ground
        if (this.mesh.position.y <= 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.velocity.x *= 0.8; // Friction
            this.velocity.z *= 0.8; // Friction
        }
        
        // Update lifespan
        this.timeAlive += deltaTime;
        
        // Check if vinyl should be removed
        if (this.timeAlive >= this.lifespan) {
            this.dispose();
            return false;
        }
        
        return true;
    }
    
    dispose() {
        if (this.mesh) {
            // Remove all child meshes and dispose their geometries and materials
            while(this.mesh.children.length > 0) {
                const child = this.mesh.children[0];
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
                this.mesh.remove(child);
            }
            
            // Dispose the main mesh's geometry and material
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) {
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(material => material.dispose());
                } else {
                    this.mesh.material.dispose();
                }
            }
            
            // Remove from scene
            this.scene.remove(this.mesh);
            this.mesh = null;
        }
        this.isActive = false;
    }
    
    getPosition() {
        return this.mesh ? this.mesh.position : new THREE.Vector3();
    }
} 