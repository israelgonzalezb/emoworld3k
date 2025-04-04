import * as THREE from 'three';
import { createStandardMaterial, createBoxGeometry } from './utils.js';

export class Character {
    constructor(scene) {
        this.scene = scene;
        this.createCharacter();
        this.setupState();
    }

    createCharacter() {
        // Create character group
        this.characterGroup = new THREE.Group();
        
        // Body - slim hoodie with better proportions
        const bodyGeometry = createBoxGeometry(0.85, 1.3, 0.45);
        const bodyMaterial = createStandardMaterial(0x000000, 0.9); // Pure black for hoodie
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.5, 0);
        body.name = 'hoodie';
        this.characterGroup.add(body);
        
        // Hood - more defined shape
        const hoodGeometry = createBoxGeometry(0.6, 0.4, 0.45);
        const hoodMaterial = createStandardMaterial(0x000000, 0.9);
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 1.25, -0.05);
        hood.name = 'hood';
        this.characterGroup.add(hood);

        // Hoodie pocket
        const pocketGeometry = createBoxGeometry(0.5, 0.25, 0.05);
        const pocket = new THREE.Mesh(pocketGeometry, bodyMaterial);
        pocket.position.set(0, 0.35, 0.25);
        pocket.name = 'pocket';
        this.characterGroup.add(pocket);

        // Hoodie drawstrings
        const drawstringGeometry = createBoxGeometry(0.05, 0.25, 0.05);
        const drawstringMaterial = createStandardMaterial(0xFFFFFF, 0.9);
        
        const leftDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        leftDrawstring.position.set(-0.2, 1.0, 0.2);
        leftDrawstring.rotation.z = 0.3;
        this.characterGroup.add(leftDrawstring);
        
        const rightDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        rightDrawstring.position.set(0.2, 1.0, 0.2);
        rightDrawstring.rotation.z = -0.3;
        this.characterGroup.add(rightDrawstring);
        
        // Head - adjusted proportions
        const headGeometry = createBoxGeometry(0.45, 0.5, 0.4);
        const headMaterial = createStandardMaterial(0xffdbac, 0.9);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.45, 0);
        head.name = 'head';
        this.characterGroup.add(head);
        
        // Hair - styled like the reference
        const hairGeometry = createBoxGeometry(0.5, 0.3, 0.45);
        const hairMaterial = createStandardMaterial(0x3a1f13, 0.9); // Darker brown
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 1.7, 0);
        hair.name = 'hair';
        this.characterGroup.add(hair);

        // Hair sides and back
        const hairSideGeometry = createBoxGeometry(0.12, 0.4, 0.4);
        const leftHairSide = new THREE.Mesh(hairSideGeometry, hairMaterial);
        leftHairSide.position.set(-0.28, 1.5, 0);
        this.characterGroup.add(leftHairSide);

        const rightHairSide = new THREE.Mesh(hairSideGeometry, hairMaterial);
        rightHairSide.position.set(0.28, 1.5, 0);
        this.characterGroup.add(rightHairSide);

        // Hair back piece
        const hairBackGeometry = createBoxGeometry(0.5, 0.4, 0.15);
        const hairBack = new THREE.Mesh(hairBackGeometry, hairMaterial);
        hairBack.position.set(0, 1.5, -0.2);
        this.characterGroup.add(hairBack);
        
        // Face - more detailed
        const faceGeometry = createBoxGeometry(0.4, 0.4, 0.05);
        const faceMaterial = createStandardMaterial(0xffdbac, 0.9);
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 1.45, 0.225);
        face.name = 'face';
        this.characterGroup.add(face);
        
        // Eyes - smaller and more expressive
        const eyeGeometry = createBoxGeometry(0.08, 0.15, 0.05);
        const eyeMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 1.48, 0.26);
        leftEye.name = 'leftEye';
        this.characterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 1.48, 0.26);
        rightEye.name = 'rightEye';
        this.characterGroup.add(rightEye);
        
        // Arms - adjusted proportions
        const armGeometry = createBoxGeometry(0.25, 0.8, 0.25);
        const armMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.55, 0.35, 0);
        leftArm.rotation.z = 0.15;
        leftArm.name = 'leftArm';
        this.characterGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.55, 0.35, 0);
        rightArm.rotation.z = -0.15;
        rightArm.name = 'rightArm';
        this.characterGroup.add(rightArm);
        
        // Legs - skinny jeans style
        const legGeometry = createBoxGeometry(0.3, 0.9, 0.3);
        const legMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, -0.15, 0);
        leftLeg.rotation.x = 0.1;
        leftLeg.name = 'leftLeg';
        this.characterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, -0.15, 0);
        rightLeg.rotation.x = -0.1;
        rightLeg.name = 'rightLeg';
        this.characterGroup.add(rightLeg);
        
        // Shoes - detailed sneaker style
        const createSneaker = (isLeft) => {
            const sneakerGroup = new THREE.Group();
            
            // Main shoe body
            const upperGeometry = createBoxGeometry(0.32, 0.18, 0.5);
            const upperMaterial = createStandardMaterial(0x000000, 0.9);
            const upper = new THREE.Mesh(upperGeometry, upperMaterial);
            upper.position.set(0, 0.06, 0);
            sneakerGroup.add(upper);
            
            // Sole
            const soleGeometry = createBoxGeometry(0.35, 0.12, 0.52);
            const soleMaterial = createStandardMaterial(0xFFFFFF, 0.9);
            const sole = new THREE.Mesh(soleGeometry, soleMaterial);
            sole.position.set(0, -0.05, 0);
            sneakerGroup.add(sole);
            
            // Laces
            const laceGeometry = createBoxGeometry(0.28, 0.02, 0.02);
            const laceMaterial = createStandardMaterial(0xFFFFFF, 0.9);
            for (let i = 0; i < 3; i++) {
                const lace = new THREE.Mesh(laceGeometry, laceMaterial);
                lace.position.set(0, 0.1, 0.15 - i * 0.12);
                sneakerGroup.add(lace);
            }
            
            // Position the complete shoe
            sneakerGroup.position.set(isLeft ? -0.2 : 0.2, -0.7, 0);
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
            // Add animation state
            walkTime: 0,
            walkSpeed: 8, // Controls how fast the legs move
            walkAmplitude: 0.4 // Controls how far the legs swing
        };

        // Store references to legs for animation
        this.leftLeg = this.characterGroup.getObjectByName('leftLeg');
        this.rightLeg = this.characterGroup.getObjectByName('rightLeg');
        this.leftShoe = this.characterGroup.children.find(child => 
            child.isGroup && child.position.x < 0);
        this.rightShoe = this.characterGroup.children.find(child => 
            child.isGroup && child.position.x > 0);
    }

    update(deltaTime, keys) {
        // Movement speed
        const moveSpeed = 5;
        let moving = false;
        let moveDirection = new THREE.Vector3();
        
        // Update position based on input
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.characterState.x -= moveSpeed * deltaTime;
            moveDirection.x -= 1;
            moving = true;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.characterState.x += moveSpeed * deltaTime;
            moveDirection.x += 1;
            moving = true;
        }
        if (keys['ArrowUp'] || keys['KeyW']) {
            this.characterState.z -= moveSpeed * deltaTime;
            moveDirection.z -= 1;
            moving = true;
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
            this.characterState.z += moveSpeed * deltaTime;
            moveDirection.z += 1;
            moving = true;
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
        if ((keys['Space'] || keys['Spacebar']) && !this.characterState.isJumping) {
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
    }

    getPosition() {
        return this.characterGroup.position;
    }
} 