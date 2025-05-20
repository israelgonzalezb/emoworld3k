// js/npc.js
import { Character } from './character.js';
import * as THREE from 'three';

const NPC_DEFAULT_HAIR_COLOR = 0x5D3A1F; // Same as player's default sprite hair

export class NPC extends Character {
    constructor(scene, position, chatSystem, name, obstacles = []) {
        // console.log(`Creating NPC ${name} at position:`, position); // Keep for debugging if needed
        super(scene, chatSystem, name);
        
        this.chatSystem = chatSystem; 
        this.npcObstacles = obstacles; // Store obstacles relevant to this NPC (though Character.update receives from main)
        
        this.characterGroup.position.copy(position);
        // Ensure NPC's base Y is its starting position's Y for correct ground interaction
        this.characterState.baseY = position.y; 
        
        const cyberpunkColors = [
            { hoodie: 0xff00ff, pants: 0x00ffff }, // Neon Pink & Electric Blue
            { hoodie: 0x00ff00, pants: 0x800080 }, // Toxic Green & Purple
            { hoodie: 0xff6600, pants: 0x00ffff }, // Hot Orange & Cyan
            { hoodie: 0xffff00, pants: 0xff00ff }, // Electric Yellow & Magenta
            { hoodie: 0x222222, pants: 0x0077ff }, // Dark Grey & Neon Blue
            { hoodie: 0x050505, pants: 0xff0000 }, // Black & Neon Red
            { hoodie: 0x4b0082, pants: 0x1a1a1a }, // Muted Purple & Off-Black
            { hoodie: 0x505050, pants: 0xffff33 }, // Grey & Yellow
            { hoodie: 0x333333, pants: 0x00ff00 }, // Darker Grey & Neon Green
            { hoodie: 0x1f1f1f, pants: 0xff00aa }  // Very Dark Grey & Hot Pink
        ];
        
        const hairColors = [
            NPC_DEFAULT_HAIR_COLOR, // Matches player default
            0x000000, // Black
            0x0000FF, // Blue
            0xFF00FF, // Pink
            0x800080, // Purple
            0x00FF00, // Green
            0xFFD700, // Blonde (can be cyberpunk yellow)
            0xDCDCDC, // Silver/Grey
            0xFF4500, // Orange-Red
            0x00CED1, // Dark Turquoise
        ];
        
        const colors = cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)];
        const hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
        
        this.applyColors(colors, hairColor);
        
        this.speechTimer = 0;
        this.speechInterval = 12 + Math.random() * 18; // Slightly longer average intervals
        this.lastMessage = '';
        
        this.messages = [
            "This city breathes neon.",
            "Ever feel like you're just a string of code?",
            "The rain always washes away the lies... for a bit.",
            "Glitching again. Or is it just me?",
            "Heard some new dark synth tracks? Heavy.",
            "Data streams are wild tonight.",
            "Just another cycle in the concrete jungle.",
            "What's real anymore?",
            "Sometimes the silence between the static is the loudest.",
            "Emo means 'I'm emotional,' right? Yeah, that tracks.",
            "Is this pixelated pain aesthetic?",
            "My boots are worn from walking these digital streets."
        ];
        
        this.setupIdleBehavior();
        // console.log(`NPC ${name} created successfully.`); // Keep for debugging if needed
    }

    applyColors(colors, hairColorHex) {
        const hairColorThree = new THREE.Color(hairColorHex);
        this.characterGroup.traverse((child) => {
            if (child.isMesh && child.material) {
                // Hoodie parts (torso, hood components, arms)
                if (child.name === 'hoodie_torso' || 
                    child.name === 'hood_back_main' || child.name === 'hood_shoulder' || child.name === 'hood_opening_edge' ||
                    child.name === 'leftArm' || child.name === 'rightArm') {
                    child.material.color.setHex(colors.hoodie);
                }
                // Pants (legs)
                else if (child.name === 'leftLeg' || child.name === 'rightLeg') {
                    child.material.color.setHex(colors.pants);
                }
                // Hair parts and eyebrows
                else if (child.name.startsWith('hair_') || child.name.endsWith('Eyebrow')) {
                    child.material.color.copy(hairColorThree);
                }
            }
        });
    }

    setupIdleBehavior() {
        this.idleState = {
            targetPosition: this.characterGroup.position.clone(), 
            moveSpeed: 0.8 + Math.random() * 1.2, // Slower average speed: 0.8 to 2.0
            idleTimer: 0, // Not strictly used in current logic but good to have
            idleDuration: 3 + Math.random() * 4, // This could gate how long an idle animation plays
            isMoving: false,
            waitTime: 0,
            maxWaitTime: 4 + Math.random() * 6, // Wait 4-10 seconds
            idleAnimationTime: Math.random() * Math.PI * 2, 
            idleAnimationSpeed: 0.35 + Math.random() * 0.3, 
            shouldWaveArm: Math.random() < 0.05 // Reduced chance to wave: 5%
        };
    }

    updateTargetPosition() {
        this.idleState.targetPosition.set(
            (Math.random() - 0.5) * 38, // X range for pier
            this.characterGroup.position.y, // Maintain current Y level
            (Math.random() - 0.5) * 18  // Z range for pier
        );
        this.idleState.isMoving = true;
        this.idleState.waitTime = 0; // Reset wait timer
        this.idleState.shouldWaveArm = Math.random() < 0.05; // Re-roll wave chance
    }

    update(deltaTime, camera, obstacles = []) { 
        if (!this.characterGroup) {
            console.error(`NPC ${this.name} characterGroup is undefined`);
            return;
        }
        // Speech logic
        if (this.chatSystem) {
             this.speechTimer += deltaTime;
             if (this.speechTimer >= this.speechInterval) {
                 this.speechTimer = 0;
                 this.speechInterval = 12 + Math.random() * 18;

                 let newMessage;
                 do {
                     newMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
                 } while (newMessage === this.lastMessage && this.messages.length > 1);

                 this.lastMessage = newMessage;
                 this.say(newMessage); // Uses Character.say() for bubble
                 this.chatSystem.addNPCMessage(this.name, newMessage); // Adds to chat log
             }
        }

        // NPC Idle Movement Logic
        if (this.idleState.isMoving) {
            const direction = this.idleState.targetPosition.clone().sub(this.characterGroup.position);
            const distance = direction.length();

            if (distance > 0.25) { // Threshold to stop before reaching exact target
                direction.normalize();
                // Set desired velocity for the Character base class to handle
                this.characterState.velocity.x = direction.x * this.idleState.moveSpeed;
                this.characterState.velocity.z = direction.z * this.idleState.moveSpeed;
                
                // Character base class will set rotation based on velocity if keys are passed.
                // For NPCs, we set rotation directly here as they don't use 'keys'.
                this.characterGroup.rotation.y = Math.atan2(this.characterState.velocity.x, this.characterState.velocity.z);

                this.characterState.isWalking = true; 
                this.characterState.isIdle = false;
            } else { // Reached target
                this.idleState.isMoving = false;
                this.idleState.waitTime = 0; // Reset wait timer
                this.characterState.isWalking = false;
                this.characterState.isIdle = true;
                this.characterState.velocity.x = 0; // Stop horizontal movement
                this.characterState.velocity.z = 0;
            }
        } else { // Waiting
            this.idleState.waitTime += deltaTime;
            this.characterState.isWalking = false;
            this.characterState.isIdle = true;
            this.characterState.shouldWaveArm = this.idleState.shouldWaveArm; // Pass wave state to Character animation
            this.characterState.velocity.x = 0; // Ensure stopped
            this.characterState.velocity.z = 0;

            if (this.idleState.waitTime >= this.idleState.maxWaitTime) {
                this.updateTargetPosition();
            }
        }
        
        // Call Character.update() for actual movement, collision, gravity, and animation updates.
        // NPCs don't use 'keys' for input. Pass the obstacles array for collision.
        // Portals are generally not used by NPCs in this manner.
        super.update(deltaTime, {}, camera, obstacles, []); 
    }
}