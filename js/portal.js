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

        // Create portal visuals directly in the scene
        this.createPortalVisuals();
    }

    createPortalVisuals() {
        // Create portal group
        this.portalGroup = new THREE.Group();
        this.portalGroup.position.copy(this.position);
        
        // Create outer ring with improved material
        const outerRingGeometry = new THREE.TorusGeometry(0.5 * this.size, 0.1 * this.size, 32, 100);
        const outerRingMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff9d,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x00ff9d,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });
        this.outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
        this.portalGroup.add(this.outerRing);
        
        // Create inner ring with sheen effect
        const innerRingGeometry = new THREE.TorusGeometry(0.4 * this.size, 0.05 * this.size, 32, 100);
        const innerRingMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.1,
            emissive: 0xffffff,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        this.innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
        this.portalGroup.add(this.innerRing);
        
        // Create portal core with dynamic sheen
        const coreGeometry = new THREE.CircleGeometry(0.35 * this.size, 32);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff9d,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x00ff9d,
            emissiveIntensity: 0.7,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        this.portalCore = new THREE.Mesh(coreGeometry, coreMaterial);
        this.portalCore.rotation.x = -Math.PI / 2; // Rotate to face forward
        this.portalGroup.add(this.portalCore);
        
        // Create portal glow effect
        const glowGeometry = new THREE.CircleGeometry(0.5 * this.size, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff9d,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.portalGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.portalGlow.rotation.x = -Math.PI / 2; // Rotate to face forward
        this.portalGroup.add(this.portalGlow);
        
        // Create particle system with more dynamic particles
        this.particleSystem = new ParticleSystem(
            this.scene,
            this.portalGroup.position,
            50, // Increased particle count
            [0x00ff9d, 0xffffff, 0x00cc7d], // Multiple colors
            0.1 * this.size, // Scale particle size with portal size
            0.5, // Faster particle speed
            2.0, // Longer particle lifetime
            0.8, // Higher particle opacity
            0.5  // More spread
        );
        
        // Add portal group to scene
        this.scene.add(this.portalGroup);
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
        if (!this.portalGroup) return;
        
        // Update portal rotation
        this.portalGroup.rotation.y += deltaTime * 0.5;
        
        // Update inner ring sheen effect
        if (this.innerRing) {
            this.innerRing.material.emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.003) * 0.2;
        }
        
        // Update portal core glow
        if (this.portalCore) {
            this.portalCore.material.emissiveIntensity = 0.7 + Math.sin(Date.now() * 0.002) * 0.3;
            this.portalCore.material.opacity = 0.8 + Math.sin(Date.now() * 0.001) * 0.1;
        }
        
        // Update glow effect
        if (this.portalGlow) {
            this.portalGlow.material.opacity = 0.3 + Math.sin(Date.now() * 0.001) * 0.1;
        }
        
        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }
    }

    // Remove from scene (if needed)
    dispose() {
        if (this.particleSystem) {
            this.particleSystem.dispose();
        }
        if (this.portalGroup) {
            this.scene.remove(this.portalGroup);
        }
    }
}