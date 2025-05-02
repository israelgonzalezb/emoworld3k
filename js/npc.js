import { Character } from './character.js';
import * as THREE from 'three';

export class NPC extends Character {
    constructor(scene, position, chatSystem, name) {
        console.log(`Creating NPC ${name} at position:`, position);
        super(scene, chatSystem, name);
        
        this.chatSystem = chatSystem;
        
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
        
        // Setup speech bubble properties
        this.speechTimer = 0;
        this.speechInterval = 10 + Math.random() * 15; // Random interval between 10-25 seconds
        this.lastMessage = '';
        
        // Define random messages
        this.messages = [
            "The rain feels electric tonight.",
            "Did you see that glitch in the sky?",
            "This pier has seen things...",
            "Need more neon.",
            "Keep the vibes flowing.",
            "Watch out for the data streams.",
            "My circuits are buzzing.",
            "The future is bright... and rainy.",
            "Synthwave and solitude.",
            "Just contemplating the digital sea.",
            "Is this real life?",
            "Lost in the code.",
            "These colors... wow.",
            "Can't stop the signal.",
            "Waiting for the next drop."
        ];
        
        this.setupIdleBehavior();
        console.log(`NPC ${name} created successfully.`);
    }

    applyColors(colors, hairColor) {
        // Update hoodie color
        this.characterGroup.children.forEach(child => {
            if (child.name === 'hoodie' || child.name === 'hood' || 
                child.name === 'leftArm' || child.name === 'rightArm') {
                child.material.color.setHex(colors.hoodie);
            }
            // Update pants color (legs)
            if (child.name === 'leftLeg' || child.name === 'rightLeg') {
                child.material.color.setHex(colors.pants);
            }
            // Update hair color
            if (child.name === 'hair' || child instanceof THREE.Mesh && 
                child.material.color.getHex() === 0x3a1f13) {
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
            waitTime: 0,
            maxWaitTime: 2 + Math.random() * 3, // Random wait time between 2-5 seconds
            // Add idle animation states
            idleAnimationTime: Math.random() * Math.PI * 2, // Random start phase
            idleAnimationSpeed: 0.5 + Math.random() * 0.5, // Random animation speed
            shouldWaveArm: Math.random() < 0.3 // 30% chance to wave while idle
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
        this.idleState.waitTime = 0;
        // Reset idle animation state
        this.idleState.shouldWaveArm = Math.random() < 0.3;
    }

    update(deltaTime, camera) {
        if (!this.characterGroup) {
            console.error(`NPC ${this.name} characterGroup is undefined`);
            return;
        }
        if (!this.chatSystem) {
             console.error(`NPC ${this.name} chatSystem is undefined`);
             // Don't proceed with chat logic if system is missing
        } else {
             // Update speech timing
             this.speechTimer += deltaTime;
             if (this.speechTimer >= this.speechInterval) {
                 this.speechTimer = 0;
                 this.speechInterval = 10 + Math.random() * 15; // New random interval

                 // Select a new random message different from the last one
                 let newMessage;
                 do {
                     newMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
                 } while (newMessage === this.lastMessage && this.messages.length > 1);

                 this.lastMessage = newMessage;
                 // MODIFIED: Send message to chat system instead of using say()
                 this.chatSystem.addNPCMessage(this.name, newMessage);
             }
        }

        // Update speech bubble if active (Let Character class handle this)
        // if (this.activeSpeechBubble) { 
        //     this.activeSpeechBubble.update(this.characterGroup.position, camera);
        // }
        // We call the parent update method AFTER our NPC-specific logic
        // This ensures the base Character update (movement, animations, speech bubble update) runs.
        super.update(deltaTime, {}, camera, [], []); // Pass empty keys, obstacles, portals for base update

        // --- NPC Idle Movement Logic (moved from Character.update) ---
        // Update idle behavior timer (previously part of Character update, now specific to NPC)
        // this.idleState.idleTimer += deltaTime; // Timer update handled by base Character class now if needed

        if (this.idleState.isMoving) {
            // Calculate direction to target
            const direction = this.idleState.targetPosition.clone()
                .sub(this.characterGroup.position);
            const distance = direction.length();

            if (distance > 0.1) {
                // Normalize and apply movement
                direction.normalize();
                this.characterGroup.position.x += direction.x * this.idleState.moveSpeed * deltaTime;
                this.characterGroup.position.z += direction.z * this.idleState.moveSpeed * deltaTime;

                // Update rotation to face movement direction
                this.characterGroup.rotation.y = Math.atan2(direction.x, direction.z);

                // Update walk animation state (handled by base Character class)
                this.characterState.isWalking = true; 

            } else {
                // Reached target position, start waiting
                this.idleState.isMoving = false;
                this.idleState.waitTime = 0;
                this.characterState.isWalking = false; // Stop walking animation state
                // Update target position after waiting
                // We'll handle this in the waiting section below
            }
        } else {
            // Update waiting time
            this.idleState.waitTime += deltaTime;
            this.characterState.isWalking = false; // Ensure not walking while waiting

            // Perform idle animations (handled by base Character class)
            this.characterState.isIdle = true;
            this.characterState.shouldWaveArm = this.idleState.shouldWaveArm; // Pass waving state

            // If wait time exceeded, find a new target
            if (this.idleState.waitTime >= this.idleState.maxWaitTime) {
                this.updateTargetPosition();
                this.characterState.isIdle = false; // Start moving again
            }
        }
        // --- End NPC Idle Movement Logic ---
    }
} 