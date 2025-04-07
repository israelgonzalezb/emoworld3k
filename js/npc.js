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
        
        // Setup speech bubble properties
        this.speechTimer = 0;
        this.speechInterval = 5 + Math.random() * 10; // Random interval between 5-15 seconds
        this.lastMessage = '';
        
        // Define random messages
        this.messages = [
            "The matrix is glitching...",
            "Have you seen my vinyl collection?",
            "The pier's energy is off the charts!",
            "I need more RGB in my life",
            "Cyberpunk is not just a style, it's a lifestyle",
            "The rain feels different today",
            "My hoodie is literally glowing",
            "The future is now, old man!",
            "I can feel the bass in my bones",
            "The neon never sleeps",
            "My playlist is fire right now",
            "The pier's got that perfect vibe",
            "I'm feeling the cyber energy",
            "The matrix is calling",
            "Time to drop some beats"
        ];
        
        this.setupIdleBehavior();
        console.log("NPC created successfully with colors:", colors, "hair:", hairColor);
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
            console.error("NPC characterGroup is undefined");
            return;
        }

        // Update speech bubble timing
        this.speechTimer += deltaTime;
        if (this.speechTimer >= this.speechInterval) {
            this.speechTimer = 0;
            this.speechInterval = 5 + Math.random() * 10; // New random interval
            
            // Select a new random message different from the last one
            let newMessage;
            do {
                newMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
            } while (newMessage === this.lastMessage);
            
            this.lastMessage = newMessage;
            this.say(newMessage);
        }

        // Update speech bubble if active
        if (this.activeSpeechBubble) {
            this.activeSpeechBubble.update(this.characterGroup.position, camera);
        }

        // Update idle behavior
        this.idleState.idleTimer += deltaTime;
        
        if (this.idleState.isMoving) {
            // Calculate direction to target
            const direction = this.idleState.targetPosition.clone()
                .sub(this.characterGroup.position);
            const distance = direction.length();
            
            if (distance > 0.1) {
                // Normalize and apply movement
                direction.normalize();
                this.characterState.x += direction.x * this.idleState.moveSpeed * deltaTime;
                this.characterState.z += direction.z * this.idleState.moveSpeed * deltaTime;
                
                // Update rotation to face movement direction
                this.characterState.rotation = Math.atan2(direction.x, direction.z);
                
                // Update walk animation
                this.characterState.walkTime += deltaTime * this.characterState.walkSpeed;
                
                // Walking arm animations
                if (this.leftArm && this.rightArm) {
                    const leftArmAngle = -Math.sin(this.characterState.walkTime) * this.characterState.walkAmplitude * 0.7;
                    const rightArmAngle = -Math.sin(this.characterState.walkTime + Math.PI) * this.characterState.walkAmplitude * 0.7;
                    
                    this.leftArm.rotation.x = leftArmAngle;
                    this.rightArm.rotation.x = rightArmAngle;
                    
                    // Add slight side-to-side motion
                    this.leftArm.rotation.z = 0.15 + Math.sin(this.characterState.walkTime) * 0.1;
                    this.rightArm.rotation.z = -0.15 - Math.sin(this.characterState.walkTime) * 0.1;
                }
                
                // Walking leg animations
                if (this.leftLeg && this.rightLeg) {
                    const leftLegAngle = Math.sin(this.characterState.walkTime) * this.characterState.walkAmplitude;
                    const rightLegAngle = Math.sin(this.characterState.walkTime + Math.PI) * this.characterState.walkAmplitude;
                    
                    this.leftLeg.rotation.x = leftLegAngle + 0.1;
                    this.rightLeg.rotation.x = rightLegAngle - 0.1;
                    
                    this.leftLeg.position.y = -0.15 + Math.abs(Math.sin(this.characterState.walkTime)) * 0.1;
                    this.rightLeg.position.y = -0.15 + Math.abs(Math.sin(this.characterState.walkTime + Math.PI)) * 0.1;
                    
                    // Animate shoes
                    if (this.leftShoe && this.rightShoe) {
                        this.leftShoe.rotation.x = leftLegAngle + 0.1;
                        this.rightShoe.rotation.x = rightLegAngle - 0.1;
                        
                        this.leftShoe.position.y = -0.7 + Math.abs(Math.sin(this.characterState.walkTime)) * 0.1;
                        this.rightShoe.position.y = -0.7 + Math.abs(Math.sin(this.characterState.walkTime + Math.PI)) * 0.1;
                        
                        this.leftShoe.position.z = Math.sin(this.characterState.walkTime) * 0.15;
                        this.rightShoe.position.z = Math.sin(this.characterState.walkTime + Math.PI) * 0.15;
                    }
                }
            } else {
                // Reached target position, start waiting
                this.idleState.isMoving = false;
                this.idleState.waitTime = 0;
                
                // Reset legs to idle position
                if (this.leftLeg && this.rightLeg) {
                    this.leftLeg.rotation.x = 0.1;
                    this.rightLeg.rotation.x = -0.1;
                    this.leftLeg.position.y = -0.15;
                    this.rightLeg.position.y = -0.15;
                }
                
                if (this.leftShoe && this.rightShoe) {
                    this.leftShoe.rotation.x = 0.1;
                    this.rightShoe.rotation.x = -0.1;
                    this.leftShoe.position.y = -0.7;
                    this.rightShoe.position.y = -0.7;
                    this.leftShoe.position.z = 0;
                    this.rightShoe.position.z = 0;
                }
            }
        } else {
            // Update waiting time
            this.idleState.waitTime += deltaTime;
            
            // Idle animations
            if (this.leftArm && this.rightArm) {
                this.idleState.idleAnimationTime += deltaTime * this.idleState.idleAnimationSpeed;
                
                if (this.idleState.shouldWaveArm) {
                    // Wave animation for right arm
                    const waveAngle = Math.sin(this.idleState.idleAnimationTime * 2) * 0.5;
                    this.rightArm.rotation.z = -0.15 - waveAngle;
                    this.rightArm.rotation.x = -0.5 + Math.sin(this.idleState.idleAnimationTime) * 0.2;
                    
                    // Subtle movement for left arm
                    this.leftArm.rotation.x = Math.sin(this.idleState.idleAnimationTime * 0.5) * 0.1;
                } else {
                    // Subtle idle arm movements
                    this.leftArm.rotation.x = Math.sin(this.idleState.idleAnimationTime * 0.5) * 0.1;
                    this.rightArm.rotation.x = Math.sin(this.idleState.idleAnimationTime * 0.5 + Math.PI) * 0.1;
                    
                    // Maintain slight outward angle
                    this.leftArm.rotation.z = 0.15 + Math.sin(this.idleState.idleAnimationTime * 0.3) * 0.05;
                    this.rightArm.rotation.z = -0.15 - Math.sin(this.idleState.idleAnimationTime * 0.3) * 0.05;
                }
            }
            
            // Check if wait time is over
            if (this.idleState.waitTime >= this.idleState.maxWaitTime) {
                this.updateTargetPosition();
            }
        }

        // Check if it's time to pick a new target
        if (this.idleState.idleTimer >= this.idleState.idleDuration) {
            this.idleState.idleTimer = 0;
            this.idleState.idleDuration = 3 + Math.random() * 4;
            this.updateTargetPosition();
        }

        // Keep NPC within pier boundaries
        this.characterState.x = Math.max(-19.5, Math.min(19.5, this.characterState.x));
        this.characterState.z = Math.max(-9.5, Math.min(9.5, this.characterState.z));
        
        // Update character position and rotation
        this.characterGroup.position.set(
            this.characterState.x,
            this.characterState.y,
            this.characterState.z
        );
        this.characterGroup.rotation.y = this.characterState.rotation;
    }
} 