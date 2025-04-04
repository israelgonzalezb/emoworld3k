import { Character } from './character.js';
import * as THREE from 'three';

export class NPC extends Character {
    constructor(scene, position) {
        console.log("Creating NPC at position:", position);
        super(scene);
        this.characterGroup.position.copy(position);
        
        // Define cyberpunk color combinations for clothes
        const cyberpunkColors = [
            // Neon Pink & Electric Blue
            { hoodie: 0xff00ff, pants: 0x00ffff },
            // Toxic Green & Purple
            { hoodie: 0x00ff00, pants: 0x800080 },
            // Hot Orange & Cyan
            { hoodie: 0xff6600, pants: 0x00ffff },
            // Electric Yellow & Magenta
            { hoodie: 0xffff00, pants: 0xff00ff },
            // Neon Blue & Hot Pink
            { hoodie: 0x00ffff, pants: 0xff00ff },
            // Purple & Lime
            { hoodie: 0x800080, pants: 0x00ff00 },
            // Red & Cyan
            { hoodie: 0xff0000, pants: 0x00ffff },
            // Yellow & Purple
            { hoodie: 0xffff00, pants: 0x800080 }
        ];
        
        // Define specific hair colors
        const hairColors = [
            0xFFD700, // Blonde
            0x000000, // Black
            0x0000FF, // Blue
            0xFF00FF, // Pink
            0x800080  // Purple
        ];
        
        // Randomly select a color combination and hair color
        const colors = cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)];
        const hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
        
        // Apply colors to the character's materials
        this.applyColors(colors, hairColor);
        
        this.setupIdleBehavior();
        console.log("NPC created successfully with colors:", colors, "hair:", hairColor);
    }

    applyColors(colors, hairColor) {
        // Update hoodie color
        this.characterGroup.children.forEach(child => {
            if (child.name === 'hoodie') {
                child.material.color.setHex(colors.hoodie);
            }
            // Update pants color (legs)
            if (child.name === 'leftLeg' || child.name === 'rightLeg') {
                child.material.color.setHex(colors.pants);
            }
            // Update hair color
            if (child.name === 'hair') {
                child.material.color.setHex(hairColor);
            }
        });
    }

    setupIdleBehavior() {
        this.idleState = {
            targetPosition: new THREE.Vector3(),
            moveSpeed: 2,
            idleTimer: 0,
            idleDuration: 3 + Math.random() * 4, // Random duration between 3-7 seconds
            isMoving: false,
            rotation: 0 // Add rotation state
        };
        this.updateTargetPosition();
    }

    updateTargetPosition() {
        // Random position within pier boundaries
        this.idleState.targetPosition.set(
            (Math.random() - 0.5) * 38, // -19 to 19
            0.9, // Keep on pier surface
            (Math.random() - 0.5) * 18  // -9 to 9
        );
        this.idleState.isMoving = true;
    }

    update(deltaTime, keys) {
        if (!this.characterGroup) {
            console.error("NPC characterGroup is undefined");
            return;
        }

        // Update idle behavior
        this.idleState.idleTimer += deltaTime;
        
        if (this.idleState.isMoving) {
            // Move towards target position
            const direction = this.idleState.targetPosition.clone()
                .sub(this.characterGroup.position);
            
            if (direction.length() > 0.1) {
                direction.normalize();
                this.characterState.x += direction.x * this.idleState.moveSpeed * deltaTime;
                this.characterState.z += direction.z * this.idleState.moveSpeed * deltaTime;
                
                // Update rotation to face movement direction
                this.idleState.rotation = Math.atan2(direction.x, direction.z);
                
                // Update character position and rotation
                this.characterGroup.position.set(
                    this.characterState.x,
                    this.characterState.y,
                    this.characterState.z
                );
                this.characterGroup.rotation.y = this.idleState.rotation;
            } else {
                this.idleState.isMoving = false;
            }
        }

        // Check if it's time to update target position
        if (this.idleState.idleTimer >= this.idleState.idleDuration) {
            this.idleState.idleTimer = 0;
            this.idleState.idleDuration = 3 + Math.random() * 4;
            this.updateTargetPosition();
        }

        // Keep NPC within pier boundaries
        this.characterState.x = Math.max(-19.5, Math.min(19.5, this.characterState.x));
        this.characterState.z = Math.max(-9.5, Math.min(9.5, this.characterState.z));
    }
} 