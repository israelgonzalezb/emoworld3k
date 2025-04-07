// Portal.js
import * as THREE from 'three';
import { createStandardMaterial } from './utils.js'; // Assuming this exists
import { ParticleSystem } from './ParticleSystem.js'; // Fixed case sensitivity

export class Portal {
    constructor(scene, position, size, targetSceneName, targetSpawnPoint) {
        this.scene = scene; // The scene this portal instance lives in
        this.position = position;
        this.size = size; // Controls overall scale
        this.targetSceneName = targetSceneName; // e.g., 'waitingRoom' or 'mainArea'
        this.targetSpawnPoint = targetSpawnPoint; // THREE.Vector3 where character appears
        this.activationRadius = size * 1.5; // How close the player needs to be

        this.group = new THREE.Group();
        this.group.position.copy(position);

        this.createVisuals();
        this.createParticles();

        this.scene.add(this.group);
    }

    createVisuals() {
        const ringRadius = this.size;
        const tubeRadius = this.size * 0.1;

        // Portal Ring (Torus)
        const geometry = new THREE.TorusGeometry(ringRadius, tubeRadius, 16, 64);
        // Dark, slightly metallic material for the frame
        const material = createStandardMaterial(0x1a1a1a, 1.0, {
            metalness: 0.8,
            roughness: 0.4
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2; // Stand upright
        this.group.add(ring);

        // Optional: Inner shimmering effect (can add later)
        /*
        const innerGeometry = new THREE.CircleGeometry(ringRadius - tubeRadius, 32);
        const innerMaterial = createStandardMaterial(0x00ffff, 0.5, { // Cyan, semi-transparent
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide // Visible from both sides
        });
        const innerDisc = new THREE.Mesh(innerGeometry, innerMaterial);
        innerDisc.rotation.x = Math.PI / 2;
        this.group.add(innerDisc);
        */
    }

    createParticles() {
        // Sparks - using a dedicated particle system class
        this.particleSystem = new ParticleSystem(this.group, {
            particleCount: 100,
            color: new THREE.Color(0xffff00), // Yellow sparks
            secondaryColor: new THREE.Color(0x00ffff), // Cyan sparks
            size: 0.08 * this.size,
            spawnRadius: this.size * 1.1, // Spawn around the ring
            lifetime: 0.5, // Short-lived sparks
            velocitySpread: new THREE.Vector3(1, 1, 1).multiplyScalar(this.size * 0.5),
            blending: THREE.AdditiveBlending // For a bright, glowing look
        });
    }

    // Check if character is close enough to activate
    checkForActivation(characterPosition) {
        return this.position.distanceTo(characterPosition) < this.activationRadius;
    }

    // Get destination info
    getTarget() {
        return {
            sceneName: this.targetSceneName,
            spawnPoint: this.targetSpawnPoint.clone() // Clone to prevent accidental modification
        };
    }

    // Update animations (like sparks)
    update(deltaTime) {
        this.group.rotation.y += 0.5 * deltaTime; // Slow spin
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }
        // Add subtle floating bobbing motion
        this.group.position.y = this.position.y + Math.sin(Date.now() * 0.001) * 0.1 * this.size;
    }

    // Remove from scene (if needed)
    dispose() {
        if (this.particleSystem) {
            this.particleSystem.dispose();
        }
        // Dispose geometries and materials if necessary
        // ...
        this.scene.remove(this.group);
    }
}