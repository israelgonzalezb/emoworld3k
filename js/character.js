import * as THREE from 'three';
import { createStandardMaterial, createBoxGeometry } from './utils.js';
import { Vinyl } from './vinyl.js';
import { SpeechBubble } from './speechBubble.js';

export class Character {
    constructor(scene) {
        this.scene = scene;
        this.createCharacter();
        this.setupState();
        
        // Add vinyl shooting properties
        this.vinyls = [];
        this.lastShootTime = 0;
        this.shootCooldown = 0.5; // Half second cooldown between shots
        
        // Add speech bubble properties
        this.activeSpeechBubble = null;
    }

    createCharacter() {
        // Create character group
        this.characterGroup = new THREE.Group();
        
        // Body - slim hoodie with better proportions
        const bodyGeometry = createBoxGeometry(0.6, 1.4, 0.4); // Slimmer and taller body
        const bodyMaterial = createStandardMaterial(0x000000, 0.9); // Pure black for hoodie
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.7, 0); // Adjusted height
        body.name = 'hoodie';
        this.characterGroup.add(body);
        
        // Hood - more defined shape
        const hoodGeometry = createBoxGeometry(0.5, 0.35, 0.4); // Adjusted hood size
        const hoodMaterial = createStandardMaterial(0x000000, 0.9);
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 1.4, -0.05);
        hood.name = 'hood';
        this.characterGroup.add(hood);

        // Hoodie pocket
        const pocketGeometry = createBoxGeometry(0.4, 0.2, 0.05); // Adjusted pocket size
        const pocket = new THREE.Mesh(pocketGeometry, bodyMaterial);
        pocket.position.set(0, 0.4, 0.2);
        pocket.name = 'pocket';
        this.characterGroup.add(pocket);

        // Hoodie drawstrings
        const drawstringGeometry = createBoxGeometry(0.04, 0.2, 0.04); // Thinner drawstrings
        const drawstringMaterial = createStandardMaterial(0xFFFFFF, 0.9);
        
        const leftDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        leftDrawstring.position.set(-0.15, 1.2, 0.15);
        leftDrawstring.rotation.z = 0.3;
        this.characterGroup.add(leftDrawstring);
        
        const rightDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        rightDrawstring.position.set(0.15, 1.2, 0.15);
        rightDrawstring.rotation.z = -0.3;
        this.characterGroup.add(rightDrawstring);
        
        // Head - adjusted proportions
        const headGeometry = createBoxGeometry(0.35, 0.4, 0.35); // Smaller, more realistic head
        const headMaterial = createStandardMaterial(0xffdbac, 0.9);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.6, 0);
        head.name = 'head';
        this.characterGroup.add(head);
        
        // Hair - styled like the reference
        const hairGeometry = createBoxGeometry(0.4, 0.25, 0.4); // Adjusted hair size
        const hairMaterial = createStandardMaterial(0x3a1f13, 0.9); // Darker brown
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 1.8, 0);
        hair.name = 'hair';
        this.characterGroup.add(hair);

        // Hair sides and back
        const hairSideGeometry = createBoxGeometry(0.1, 0.35, 0.35); // Thinner hair sides
        const leftHairSide = new THREE.Mesh(hairSideGeometry, hairMaterial);
        leftHairSide.position.set(-0.2, 1.7, 0);
        this.characterGroup.add(leftHairSide);

        const rightHairSide = new THREE.Mesh(hairSideGeometry, hairMaterial);
        rightHairSide.position.set(0.2, 1.7, 0);
        this.characterGroup.add(rightHairSide);

        // Hair back piece
        const hairBackGeometry = createBoxGeometry(0.4, 0.35, 0.12); // Adjusted back hair
        const hairBack = new THREE.Mesh(hairBackGeometry, hairMaterial);
        hairBack.position.set(0, 1.7, -0.15);
        this.characterGroup.add(hairBack);
        
        // Face - more detailed
        const faceGeometry = createBoxGeometry(0.3, 0.3, 0.05); // Smaller face
        const faceMaterial = createStandardMaterial(0xffdbac, 0.9);
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 1.6, 0.2);
        face.name = 'face';
        this.characterGroup.add(face);
        
        // Eyes - smaller and more expressive
        const eyeGeometry = createBoxGeometry(0.06, 0.12, 0.05); // Smaller eyes
        const eyeMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.63, 0.25);
        leftEye.name = 'leftEye';
        this.characterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 1.63, 0.25);
        rightEye.name = 'rightEye';
        this.characterGroup.add(rightEye);
        
        // Arms - adjusted proportions
        const armGeometry = createBoxGeometry(0.2, 0.7, 0.2); // Thinner arms
        const armMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4, 0.7, 0);
        leftArm.rotation.z = 0.15;
        leftArm.name = 'leftArm';
        this.characterGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4, 0.7, 0);
        rightArm.rotation.z = -0.15;
        rightArm.name = 'rightArm';
        this.characterGroup.add(rightArm);
        
        // Legs - skinny jeans style
        const legGeometry = createBoxGeometry(0.25, 0.8, 0.25); // Thinner legs
        const legMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.15, -0.1, 0);
        leftLeg.rotation.x = 0.1;
        leftLeg.name = 'leftLeg';
        this.characterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.15, -0.1, 0);
        rightLeg.rotation.x = -0.1;
        rightLeg.name = 'rightLeg';
        this.characterGroup.add(rightLeg);
        
        // Shoes - detailed sneaker style
        const createSneaker = (isLeft) => {
            const sneakerGroup = new THREE.Group();
            
            // Main shoe body
            const upperGeometry = createBoxGeometry(0.25, 0.15, 0.4); // Smaller sneakers
            const upperMaterial = createStandardMaterial(0x000000, 0.9);
            const upper = new THREE.Mesh(upperGeometry, upperMaterial);
            upper.position.set(0, 0.05, 0);
            sneakerGroup.add(upper);
            
            // Sole
            const soleGeometry = createBoxGeometry(0.28, 0.1, 0.42); // Adjusted sole
            const soleMaterial = createStandardMaterial(0xFFFFFF, 0.9);
            const sole = new THREE.Mesh(soleGeometry, soleMaterial);
            sole.position.set(0, -0.05, 0);
            sneakerGroup.add(sole);
            
            // Laces
            const laceGeometry = createBoxGeometry(0.22, 0.02, 0.02); // Thinner laces
            const laceMaterial = createStandardMaterial(0xFFFFFF, 0.9);
            for (let i = 0; i < 3; i++) {
                const lace = new THREE.Mesh(laceGeometry, laceMaterial);
                lace.position.set(0, 0.08, 0.12 - i * 0.1);
                sneakerGroup.add(lace);
            }
            
            // Position the complete shoe
            sneakerGroup.position.set(isLeft ? -0.15 : 0.15, -0.5, 0);
            sneakerGroup.rotation.x = isLeft ? 0.1 : -0.1;
            return sneakerGroup;
        };
        
        this.characterGroup.add(createSneaker(true)); // Left shoe
        this.characterGroup.add(createSneaker(false)); // Right shoe
        
        // Add character to scene with adjusted base height
        this.characterGroup.position.set(0, 1.1, 0);
        this.scene.add(this.characterGroup);
    }

    setupState() {
        this.characterState = {
            x: 0,
            y: 0.9,
            z: 0,
            velocity: new THREE.Vector3(),
            isJumping: false,
            jumpVelocity: 0,
            baseY: 0.9,
            rotation: 0,
            walkTime: 0,
            walkSpeed: 8,
            walkAmplitude: 0.4,
            // Add arm animation states
            throwingArm: false,
            throwTime: 0,
            throwDuration: 0.3 // Duration of throw animation in seconds
        };

        // Store references to legs and arms for animation
        this.leftLeg = this.characterGroup.getObjectByName('leftLeg');
        this.rightLeg = this.characterGroup.getObjectByName('rightLeg');
        this.leftArm = this.characterGroup.getObjectByName('leftArm');
        this.rightArm = this.characterGroup.getObjectByName('rightArm');
        this.leftShoe = this.characterGroup.children.find(child => 
            child.isGroup && child.position.x < 0);
        this.rightShoe = this.characterGroup.children.find(child => 
            child.isGroup && child.position.x > 0);
    }

    update(deltaTime, keys, camera) {
        // Movement speed
        const moveSpeed = 5;
        let moving = false;
        let moveDirection = new THREE.Vector3();
        
        // Update position based on input
        if (keys['ArrowLeft']) {
            this.characterState.x -= moveSpeed * deltaTime;
            moveDirection.x -= 1;
            moving = true;
        }
        if (keys['ArrowRight']) {
            this.characterState.x += moveSpeed * deltaTime;
            moveDirection.x += 1;
            moving = true;
        }
        if (keys['ArrowUp']) {
            this.characterState.z -= moveSpeed * deltaTime;
            moveDirection.z -= 1;
            moving = true;
        }
        if (keys['ArrowDown']) {
            this.characterState.z += moveSpeed * deltaTime;
            moveDirection.z += 1;
            moving = true;
        }

        // Handle vinyl shooting with arm animation
        if (keys['Enter']) {
            const currentTime = Date.now() / 1000;
            if (currentTime - this.lastShootTime >= this.shootCooldown) {
                this.shootVinyl();
                this.lastShootTime = currentTime;
                this.characterState.throwingArm = true;
                this.characterState.throwTime = 0;
            }
        }
        
        // Update rotation if moving
        if (moving) {
            moveDirection.normalize();
            const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
            this.characterState.rotation = targetRotation;
            
            // Update walk animation time
            this.characterState.walkTime += deltaTime * this.characterState.walkSpeed;
        } else {
            // Gradually return legs to center when not moving
            this.characterState.walkTime += deltaTime * this.characterState.walkSpeed * 0.5;
            if (this.leftLeg && this.rightLeg) {
                this.leftLeg.rotation.x = THREE.MathUtils.lerp(
                    this.leftLeg.rotation.x, 
                    0.1, 
                    deltaTime * 5
                );
                this.rightLeg.rotation.x = THREE.MathUtils.lerp(
                    this.rightLeg.rotation.x, 
                    -0.1, 
                    deltaTime * 5
                );
            }
        }
        
        // Update arm animations
        if (this.leftArm && this.rightArm) {
            if (this.characterState.throwingArm) {
                // Throwing animation
                this.characterState.throwTime += deltaTime;
                const throwProgress = this.characterState.throwTime / this.characterState.throwDuration;
                
                if (throwProgress <= 1) {
                    // Wind up and throw motion
                    const throwPhase = Math.min(throwProgress * Math.PI, Math.PI);
                    this.rightArm.rotation.x = Math.sin(throwPhase) * 2 - 1; // Wind up and forward throw
                    this.rightArm.rotation.z = -0.15 - Math.sin(throwPhase) * 0.3; // Slight outward motion
                } else {
                    // Reset throwing state
                    this.characterState.throwingArm = false;
                    this.rightArm.rotation.x = 0;
                    this.rightArm.rotation.z = -0.15;
                }
            } else if (moving) {
                // Walking arm animations
                const leftArmAngle = -Math.sin(this.characterState.walkTime) * this.characterState.walkAmplitude * 0.7;
                const rightArmAngle = -Math.sin(this.characterState.walkTime + Math.PI) * this.characterState.walkAmplitude * 0.7;
                
                this.leftArm.rotation.x = leftArmAngle;
                this.rightArm.rotation.x = rightArmAngle;
                
                // Add slight side-to-side motion
                this.leftArm.rotation.z = 0.15 + Math.sin(this.characterState.walkTime) * 0.1;
                this.rightArm.rotation.z = -0.15 - Math.sin(this.characterState.walkTime) * 0.1;
            } else {
                // Return arms to idle position
                this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, deltaTime * 5);
                this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, deltaTime * 5);
                this.leftArm.rotation.z = THREE.MathUtils.lerp(this.leftArm.rotation.z, 0.15, deltaTime * 5);
                this.rightArm.rotation.z = THREE.MathUtils.lerp(this.rightArm.rotation.z, -0.15, deltaTime * 5);
            }
        }
        
        // Animate legs
        if (this.leftLeg && this.rightLeg) {
            const leftLegAngle = Math.sin(this.characterState.walkTime) * this.characterState.walkAmplitude;
            const rightLegAngle = Math.sin(this.characterState.walkTime + Math.PI) * this.characterState.walkAmplitude;
            
            if (moving) {
                // Legs swing back and forth
                this.leftLeg.rotation.x = leftLegAngle + 0.1;
                this.rightLeg.rotation.x = rightLegAngle - 0.1;
                
                // Move legs slightly up and down
                this.leftLeg.position.y = -0.15 + Math.abs(Math.sin(this.characterState.walkTime)) * 0.1;
                this.rightLeg.position.y = -0.15 + Math.abs(Math.sin(this.characterState.walkTime + Math.PI)) * 0.1;
                
                // Animate shoes to follow legs
                if (this.leftShoe && this.rightShoe) {
                    this.leftShoe.rotation.x = leftLegAngle + 0.1;
                    this.rightShoe.rotation.x = rightLegAngle - 0.1;
                    
                    this.leftShoe.position.y = -0.7 + Math.abs(Math.sin(this.characterState.walkTime)) * 0.1;
                    this.rightShoe.position.y = -0.7 + Math.abs(Math.sin(this.characterState.walkTime + Math.PI)) * 0.1;
                    
                    // Add slight forward/backward motion to shoes
                    this.leftShoe.position.z = Math.sin(this.characterState.walkTime) * 0.15;
                    this.rightShoe.position.z = Math.sin(this.characterState.walkTime + Math.PI) * 0.15;
                }
            }
        }
        
        // Jumping
        const chatInput = document.getElementById('chat-input');
        if ((keys['ShiftLeft'] || keys['ShiftRight']) && !this.characterState.isJumping && 
            (!chatInput || !chatInput.matches(':focus'))) {
            this.characterState.isJumping = true;
            this.characterState.jumpVelocity = 8;
        }
        
        // Apply gravity and update jump
        if (this.characterState.isJumping) {
            this.characterState.jumpVelocity -= 20 * deltaTime;
            this.characterState.y += this.characterState.jumpVelocity * deltaTime;
            
            // Landing check
            if (this.characterState.y <= this.characterState.baseY) {
                this.characterState.y = this.characterState.baseY;
                this.characterState.isJumping = false;
                this.characterState.jumpVelocity = 0;
            }
        }
        
        // Simple boundary checking to keep character on the pier
        this.characterState.x = Math.max(-19.5, Math.min(19.5, this.characterState.x));
        this.characterState.z = Math.max(-9.5, Math.min(9.5, this.characterState.z));
        
        // Update character position and rotation
        this.characterGroup.position.set(
            this.characterState.x,
            this.characterState.y,
            this.characterState.z
        );
        this.characterGroup.rotation.y = this.characterState.rotation;

        // Update active vinyls
        this.vinyls = this.vinyls.filter(vinyl => vinyl.update(deltaTime));

        // Update active speech bubble
        if (this.activeSpeechBubble) {
            const bubbleAlive = this.activeSpeechBubble.update(this.characterGroup.position, camera);
            if (!bubbleAlive) {
                this.activeSpeechBubble = null;
            }
        }
    }

    shootVinyl() {
        // Calculate spawn position from the right hand
        const rightArmPosition = new THREE.Vector3(0.4, 0.7, 0);
        rightArmPosition.applyMatrix4(this.characterGroup.matrix);
        
        const spawnOffset = new THREE.Vector3(0.3, 1.2, 0.5);
        spawnOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.characterState.rotation);
        
        const spawnPosition = new THREE.Vector3(
            this.characterGroup.position.x + spawnOffset.x,
            this.characterGroup.position.y + spawnOffset.y,
            this.characterGroup.position.z + spawnOffset.z
        );
        
        // Calculate shooting direction based on character's rotation
        const direction = new THREE.Vector3(
            Math.sin(this.characterState.rotation),
            0,
            Math.cos(this.characterState.rotation)
        );
        
        // Create new vinyl
        const vinyl = new Vinyl(this.scene, spawnPosition, direction);
        this.vinyls.push(vinyl);
    }

    getPosition() {
        return this.characterGroup.position;
    }

    say(message) {
        // Remove existing speech bubble if there is one
        if (this.activeSpeechBubble) {
            this.activeSpeechBubble.remove();
        }
        
        // Create new speech bubble
        this.activeSpeechBubble = new SpeechBubble(this.scene, message);
    }
} 