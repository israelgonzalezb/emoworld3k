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
        
        // Body - slim hoodie
        const bodyGeometry = createBoxGeometry(0.75, 1.1, 0.35);
        const bodyMaterial = createStandardMaterial(0x1a1a1a, 0.9);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.4, 0);
        body.name = 'hoodie';
        this.characterGroup.add(body);
        
        // Hood
        const hoodGeometry = createBoxGeometry(0.4, 0.3, 0.35);
        const hoodMaterial = createStandardMaterial(0x1a1a1a, 0.9);
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 1.1, 0);
        hood.name = 'hood';
        this.characterGroup.add(hood);
        
        // Head
        const headGeometry = createBoxGeometry(0.35, 0.4, 0.35);
        const headMaterial = createStandardMaterial(0xffdbac, 0.9);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.3, 0);
        head.name = 'head';
        this.characterGroup.add(head);
        
        // Hair - longer, more natural style
        const hairGeometry = createBoxGeometry(0.4, 0.5, 0.4);
        const hairMaterial = createStandardMaterial(0x1a1a1a, 0.9);
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 1.5, 0);
        hair.name = 'hair';
        this.characterGroup.add(hair);
        
        // Face
        const faceGeometry = createBoxGeometry(0.3, 0.3, 0.1);
        const faceMaterial = createStandardMaterial(0xffdbac, 0.9);
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 1.3, 0.15);
        face.name = 'face';
        this.characterGroup.add(face);
        
        // Eyes - smaller, more natural
        const eyeGeometry = createBoxGeometry(0.08, 0.08, 0.1);
        const eyeMaterial = createStandardMaterial(0x1a1a1a, 0.9);
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 1.35, 0.15);
        leftEye.name = 'leftEye';
        this.characterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 1.35, 0.15);
        rightEye.name = 'rightEye';
        this.characterGroup.add(rightEye);
        
        // Arms - thinner, more natural
        const armGeometry = createBoxGeometry(0.15, 0.6, 0.15);
        const armMaterial = createStandardMaterial(0x1a1a1a, 0.9);
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.45, 0.2, 0);
        leftArm.name = 'leftArm';
        this.characterGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.45, 0.2, 0);
        rightArm.name = 'rightArm';
        this.characterGroup.add(rightArm);
        
        // Legs - skinny jeans style with gap
        const legGeometry = createBoxGeometry(0.15, 0.7, 0.15);
        const legMaterial = createStandardMaterial(0x1a1a1a, 0.9);
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, 0, 0);
        leftLeg.name = 'leftLeg';
        this.characterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, 0, 0);
        rightLeg.name = 'rightLeg';
        this.characterGroup.add(rightLeg);
        
        // Shoes - Vans Authentic style with more natural proportions
        const shoeGeometry = createBoxGeometry(0.3, 0.15, 0.4);
        const shoeMaterial = createStandardMaterial(0x1a1a1a, 0.9); // Dark canvas upper
        const soleMaterial = createStandardMaterial(0xFFFFFF, 0.9); // White rubber sole
        
        // Left shoe
        const leftShoe = new THREE.Group();
        // Shoe upper
        const leftUpper = new THREE.Mesh(shoeGeometry, shoeMaterial);
        leftUpper.position.set(0, 0.05, 0);
        leftShoe.add(leftUpper);
        // Sole
        const leftSole = new THREE.Mesh(createBoxGeometry(0.3, 0.1, 0.4), soleMaterial);
        leftSole.position.set(0, -0.05, 0);
        leftShoe.add(leftSole);
        leftShoe.position.set(-0.3, -0.45, 0); // Adjusted to match new leg position
        this.characterGroup.add(leftShoe);
        
        // Right shoe
        const rightShoe = new THREE.Group();
        // Shoe upper
        const rightUpper = new THREE.Mesh(shoeGeometry, shoeMaterial);
        rightUpper.position.set(0, 0.05, 0);
        rightShoe.add(rightUpper);
        // Sole
        const rightSole = new THREE.Mesh(createBoxGeometry(0.3, 0.1, 0.4), soleMaterial);
        rightSole.position.set(0, -0.05, 0);
        rightShoe.add(rightSole);
        rightShoe.position.set(0.3, -0.45, 0); // Adjusted to match new leg position
        this.characterGroup.add(rightShoe);
        
        // Add character to scene
        this.characterGroup.position.set(0, 0.9, 0); // Position on pier surface
        this.scene.add(this.characterGroup);
    }

    setupState() {
        this.characterState = {
            x: 0,
            y: 0.9, // Base y position (pier surface + character height)
            z: 0,
            velocity: new THREE.Vector3(),
            isJumping: false,
            jumpVelocity: 0,
            baseY: 0.9, // Base y position for landing
            rotation: 0 // Add rotation state
        };
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