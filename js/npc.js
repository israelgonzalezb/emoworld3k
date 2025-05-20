// js/npc.js
import { Character } from './character.js';
import * as THREE from 'three';

const NPC_DEFAULT_HAIR_COLOR = 0x5D3A1F; // Same as player's default sprite hair

export class NPC extends Character {
    constructor(scene, position, chatSystem, name, obstacles = []) {
        // console.log(`Creating NPC ${name} at position:`, position);
        super(scene, chatSystem, name);
        
        this.chatSystem = chatSystem; // Already stored by super, but good for clarity
        this.npcObstacles = obstacles; // Store obstacles relevant to this NPC
        
        this.characterGroup.position.copy(position);
        // Ensure NPC's base Y is its starting position's Y
        this.characterState.baseY = position.y; 
        
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
            // Dark Grey & Neon Blue
            { hoodie: 0x222222, pants: 0x0077ff },
            // Black & Neon Red
            { hoodie: 0x050505, pants: 0xff0000 },
            // Muted Purple & Off-Black
            { hoodie: 0x4b0082, pants: 0x1a1a1a },
            // Grey & Yellow
            { hoodie: 0x505050, pants: 0xffff33 }
        ];
        
        // Define specific hair colors, including default
        const hairColors = [
            NPC_DEFAULT_HAIR_COLOR,
            0x000000, // Black
            0x0000FF, // Blue
            0xFF00FF, // Pink
            0x800080, // Purple
            0x00FF00, // Green
            0xFFD700, // Blonde
            0xDCDCDC, // Silver/Grey
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
            "Just thinking about the digital sea.",
            "Is this real life?",
            "Lost in the code.",
            "These colors... wow.",
            "Can't stop the signal.",
            "Waiting for the next drop."
        ];
        
        this.setupIdleBehavior();
        // console.log(`NPC ${name} created successfully.`);
    }

    applyColors(colors, hairColorHex) {
        const hairColor = new THREE.Color(hairColorHex);
        this.characterGroup.traverse((child) => {
            if (child.isMesh) {
                // Hoodie parts (torso, hood, arms)
                if (child.name === 'hoodie_torso' || child.name === 'hood' || child.name === 'hood_top_edge' ||
                    child.name === 'leftArm' || child.name === 'rightArm') {
                    if (child.material) {
                        child.material.color.setHex(colors.hoodie);
                    }
                }
                // Pants (legs)
                else if (child.name === 'leftLeg' || child.name === 'rightLeg') {
                     if (child.material) {
                        child.material.color.setHex(colors.pants);
                    }
                }
                // Hair parts
                else if (child.name.startsWith('hair_') || child.name.endsWith('Eyebrow')) {
                     if (child.material) {
                        child.material.color.copy(hairColor);
                    }
                }
            }
        });
    }

    setupIdleBehavior() {
        this.idleState = {
            targetPosition: this.characterGroup.position.clone(), // Start with current position
            moveSpeed: 1 + Math.random() * 1.5, // Slower, more varied speed: 1 to 2.5
            idleTimer: 0,
            idleDuration: 3 + Math.random() * 4,
            isMoving: false,
            waitTime: 0,
            maxWaitTime: 3 + Math.random() * 5, // Random wait time between 3-8 seconds
            idleAnimationTime: Math.random() * Math.PI * 2, 
            idleAnimationSpeed: 0.4 + Math.random() * 0.4, 
            shouldWaveArm: Math.random() < 0.1 // 10% chance to wave
        };
        // Initial target can be current pos, or set one immediately
        // this.updateTargetPosition(); // Optionally start moving right away
    }

    updateTargetPosition() {
        // Random position within pier boundaries, maintaining current Y level
        this.idleState.targetPosition.set(
            (Math.random() - 0.5) * 38, 
            this.characterGroup.position.y, // Keep current Y
            (Math.random() - 0.5) * 18  
        );
        this.idleState.isMoving = true;
        this.idleState.waitTime = 0;
        this.idleState.shouldWaveArm = Math.random() < 0.1; 
    }

    update(deltaTime, camera, obstacles = []) { // Receive obstacles from main loop
        if (!this.characterGroup) {
            console.error(`NPC ${this.name} characterGroup is undefined`);
            return;
        }
        if (this.chatSystem) {
             this.speechTimer += deltaTime;
             if (this.speechTimer >= this.speechInterval) {
                 this.speechTimer = 0;
                 this.speechInterval = 10 + Math.random() * 15;

                 let newMessage;
                 do {
                     newMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
                 } while (newMessage === this.lastMessage && this.messages.length > 1);

                 this.lastMessage = newMessage;
                 this.say(newMessage); 
                 this.chatSystem.addNPCMessage(this.name, newMessage);
             }
        }

        // --- NPC Idle Movement Logic ---
        if (this.idleState.isMoving) {
            const direction = this.idleState.targetPosition.clone().sub(this.characterGroup.position);
            const distance = direction.length();

            if (distance > 0.2) { // Increased threshold to prevent jitter
                direction.normalize();
                // Set velocity for parent Character class to handle movement and collision
                this.characterState.velocity.x = direction.x * this.idleState.moveSpeed;
                this.characterState.velocity.z = direction.z * this.idleState.moveSpeed;
                // Rotation handled by base Character class based on velocity/direction
                this.characterGroup.rotation.y = Math.atan2(direction.x, direction.z);

                this.characterState.isWalking = true; 
                this.characterState.isIdle = false;
            } else { // Reached target
                this.idleState.isMoving = false;
                this.idleState.waitTime = 0;
                this.characterState.isWalking = false;
                this.characterState.isIdle = true;
                this.characterState.velocity.x = 0;
                this.characterState.velocity.z = 0;
            }
        } else { // Waiting
            this.idleState.waitTime += deltaTime;
            this.characterState.isWalking = false;
            this.characterState.isIdle = true;
            this.characterState.shouldWaveArm = this.idleState.shouldWaveArm;
            this.characterState.velocity.x = 0;
            this.characterState.velocity.z = 0;


            if (this.idleState.waitTime >= this.idleState.maxWaitTime) {
                this.updateTargetPosition();
                // isIdle will be set to false by moving logic next frame if a target is set
            }
        }
        
        // Call parent update method. Pass empty keys, but do pass obstacles.
        // Portals are usually player-specific, NPCs typically don't use them automatically.
        super.update(deltaTime, {}, camera, obstacles, []); 
    }
}