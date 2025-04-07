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

        // Add to scene
        this.scene.add(this.characterGroup);
    }

    createCharacter() {
        // Create character group
        this.characterGroup = new THREE.Group();
        
        // Body - slim hoodie with better proportions
        const bodyGeometry = createBoxGeometry(0.5, 1.2, 0.3); // Slimmer body
        const bodyMaterial = createStandardMaterial(0x000000, 0.9); // Pure black for hoodie
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.6, 0); // Lower body position
        body.name = 'hoodie';
        this.characterGroup.add(body);
        
        // Hood - more defined shape
        const hoodGeometry = createBoxGeometry(0.45, 0.3, 0.3); // Slimmer hood
        const hoodMaterial = createStandardMaterial(0x000000, 0.9);
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 1.25, -0.05);
        hood.name = 'hood';
        this.characterGroup.add(hood);

        // Hoodie pocket
        const pocketGeometry = createBoxGeometry(0.35, 0.15, 0.05); // Slimmer pocket
        const pocket = new THREE.Mesh(pocketGeometry, bodyMaterial);
        pocket.position.set(0, 0.35, 0.15);
        pocket.name = 'pocket';
        this.characterGroup.add(pocket);

        // Hoodie drawstrings
        const drawstringGeometry = createBoxGeometry(0.03, 0.15, 0.03); // Thinner drawstrings
        const drawstringMaterial = createStandardMaterial(0xFFFFFF, 0.9);
        
        const leftDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        leftDrawstring.position.set(-0.12, 1.1, 0.12);
        leftDrawstring.rotation.z = 0.2;
        this.characterGroup.add(leftDrawstring);
        
        const rightDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        rightDrawstring.position.set(0.12, 1.1, 0.12);
        rightDrawstring.rotation.z = -0.2;
        this.characterGroup.add(rightDrawstring);
        
        // Head - more angular with defined jawline
        const headGeometry = createBoxGeometry(0.32, 0.4, 0.32); // Slightly taller for jawline
        const headMaterial = createStandardMaterial(0xffdbac, 0.9);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.4, 0);
        head.name = 'head';
        this.characterGroup.add(head);
        
        // Face - more angular with stronger jawline
        const faceGeometry = createBoxGeometry(0.32, 0.4, 0.08); // Deeper face for more definition
        const faceMaterial = createStandardMaterial(0xffdbac, 0.9);
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 1.4, 0.16);
        face.name = 'face';
        this.characterGroup.add(face);

        // Jaw definition
        const jawGeometry = createBoxGeometry(0.28, 0.15, 0.08);
        const jaw = new THREE.Mesh(jawGeometry, faceMaterial);
        jaw.position.set(0, 1.25, 0.16);
        jaw.name = 'jaw';
        this.characterGroup.add(jaw);
        
        // Eyes - more determined, slightly angled
        const eyeGeometry = createBoxGeometry(0.08, 0.1, 0.05);
        const eyeMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.09, 1.48, 0.21);
        leftEye.rotation.z = -0.15;
        leftEye.name = 'leftEye';
        this.characterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.09, 1.48, 0.21);
        rightEye.rotation.z = -0.15;
        rightEye.name = 'rightEye';
        this.characterGroup.add(rightEye);

        // Eyebrows - more angular and expressive
        const eyebrowGeometry = createBoxGeometry(0.12, 0.035, 0.02);
        const eyebrowMaterial = createStandardMaterial(0x2a1003, 0.9); // Darker brown for contrast
        
        const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        leftEyebrow.position.set(-0.09, 1.56, 0.21);
        leftEyebrow.rotation.z = -0.3; // More angled for determined expression
        this.characterGroup.add(leftEyebrow);
        
        const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        rightEyebrow.position.set(0.09, 1.56, 0.21);
        rightEyebrow.rotation.z = -0.3; // More angled for determined expression
        this.characterGroup.add(rightEyebrow);

        // Inner eyebrow details for thickness
        const innerEyebrowGeometry = createBoxGeometry(0.08, 0.03, 0.02);
        
        const leftInnerEyebrow = new THREE.Mesh(innerEyebrowGeometry, eyebrowMaterial);
        leftInnerEyebrow.position.set(-0.09, 1.555, 0.22);
        leftInnerEyebrow.rotation.z = -0.3;
        this.characterGroup.add(leftInnerEyebrow);
        
        const rightInnerEyebrow = new THREE.Mesh(innerEyebrowGeometry, eyebrowMaterial);
        rightInnerEyebrow.position.set(0.09, 1.555, 0.22);
        rightInnerEyebrow.rotation.z = -0.3;
        this.characterGroup.add(rightInnerEyebrow);

        // Nose - angular and defined
        const noseBridgeGeometry = createBoxGeometry(0.04, 0.12, 0.06);
        const noseMaterial = createStandardMaterial(0xf0c5a3, 0.9); // Slightly darker than face for definition
        
        const noseBridge = new THREE.Mesh(noseBridgeGeometry, noseMaterial);
        noseBridge.position.set(0, 1.45, 0.23);
        noseBridge.rotation.x = 0.1; // Slight angle for profile
        this.characterGroup.add(noseBridge);

        // Nose tip
        const noseTipGeometry = createBoxGeometry(0.06, 0.06, 0.04);
        const noseTip = new THREE.Mesh(noseTipGeometry, noseMaterial);
        noseTip.position.set(0, 1.41, 0.25);
        this.characterGroup.add(noseTip);

        // Nose bottom shadow
        const noseBottomGeometry = createBoxGeometry(0.08, 0.02, 0.02);
        const noseShadowMaterial = createStandardMaterial(0xe0b593, 0.9); // Darker for shadow
        const noseBottom = new THREE.Mesh(noseBottomGeometry, noseShadowMaterial);
        noseBottom.position.set(0, 1.39, 0.24);
        this.characterGroup.add(noseBottom);
        
        // Hair - refined styling
        const hairMaterial = createStandardMaterial(0x3a1f13, 0.9); // Dark brown

        // Main hair volume
        const hairGeometry = createBoxGeometry(0.34, 0.15, 0.34);
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 1.65, 0);
        hair.name = 'hair';
        this.characterGroup.add(hair);

        // Front hair piece - more dramatic sweep
        const hairFrontGeometry = createBoxGeometry(0.32, 0.15, 0.25);
        const hairFront = new THREE.Mesh(hairFrontGeometry, hairMaterial);
        hairFront.position.set(0, 1.72, 0.12);
        hairFront.rotation.x = -0.4; // More dramatic upward angle
        this.characterGroup.add(hairFront);

        // Additional front sweep
        const hairSweepGeometry = createBoxGeometry(0.28, 0.12, 0.2);
        const hairSweep = new THREE.Mesh(hairSweepGeometry, hairMaterial);
        hairSweep.position.set(0, 1.75, 0.18);
        hairSweep.rotation.x = -0.6; // Even more swept up
        this.characterGroup.add(hairSweep);

        // Hair sides - shorter and more styled
        const hairSideGeometry = createBoxGeometry(0.08, 0.28, 0.32);
        const leftHairSide = new THREE.Mesh(hairSideGeometry, hairMaterial);
        leftHairSide.position.set(-0.17, 1.48, 0);
        leftHairSide.rotation.z = 0.1; // Slight inward angle
        this.characterGroup.add(leftHairSide);

        const rightHairSide = new THREE.Mesh(hairSideGeometry, hairMaterial);
        rightHairSide.position.set(0.17, 1.48, 0);
        rightHairSide.rotation.z = -0.1; // Slight inward angle
        this.characterGroup.add(rightHairSide);

        // Hair back - more styled
        const hairBackGeometry = createBoxGeometry(0.34, 0.28, 0.12);
        const hairBack = new THREE.Mesh(hairBackGeometry, hairMaterial);
        hairBack.position.set(0, 1.48, -0.15);
        this.characterGroup.add(hairBack);
        
        // Arms - adjusted proportions
        const armGeometry = createBoxGeometry(0.15, 0.6, 0.15); // Thinner arms
        const armMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.32, 0.6, 0);
        leftArm.rotation.z = 0.1;
        leftArm.name = 'leftArm';
        this.characterGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.32, 0.6, 0);
        rightArm.rotation.z = -0.1;
        rightArm.name = 'rightArm';
        this.characterGroup.add(rightArm);
        
        // Legs - skinny jeans style
        const legGeometry = createBoxGeometry(0.18, 0.7, 0.18); // Thinner legs
        const legMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.12, -0.15, 0);
        leftLeg.rotation.x = 0.1;
        leftLeg.name = 'leftLeg';
        this.characterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.12, -0.15, 0);
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
    }

    setupState() {
        this.characterState = {
            x: 0,
            y: 1.1,
            z: 0,
            baseY: 1.1,
            velocity: new THREE.Vector3(0, 0, 0),
            isJumping: false,
            jumpVelocity: 0,
            walkSpeed: 5,
            jumpForce: 8,
            gravity: 20,
            rotation: 0,
            walkTime: 0,
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

        // Add character to scene with adjusted base height
        this.characterGroup.position.set(0, 1.1, 0);
    }

    update(deltaTime, keys, camera, portals = []) {
        // Update character state
        this.characterState.velocity.x = 0;
        this.characterState.velocity.z = 0;

        // Movement
        if (keys['ArrowLeft']) {
            this.characterState.velocity.x = -this.characterState.walkSpeed;
            this.characterGroup.rotation.y = -Math.PI / 2;
        }
        if (keys['ArrowRight']) {
            this.characterState.velocity.x = this.characterState.walkSpeed;
            this.characterGroup.rotation.y = Math.PI / 2;
        }
        if (keys['ArrowUp']) {
            this.characterState.velocity.z = -this.characterState.walkSpeed;
            this.characterGroup.rotation.y = Math.PI;
        }
        if (keys['ArrowDown']) {
            this.characterState.velocity.z = this.characterState.walkSpeed;
            this.characterGroup.rotation.y = 0;
        }

        // Update walking animation
        const isMoving = keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown'];
        if (isMoving) {
            this.characterState.walkTime += deltaTime * this.characterState.walkSpeed;
            
            // Leg animation
            if (this.leftLeg && this.rightLeg) {
                this.leftLeg.rotation.x = Math.sin(this.characterState.walkTime) * this.characterState.walkAmplitude;
                this.rightLeg.rotation.x = -Math.sin(this.characterState.walkTime) * this.characterState.walkAmplitude;
            }
            
            // Arm animation
            if (this.leftArm && this.rightArm) {
                this.leftArm.rotation.z = -Math.sin(this.characterState.walkTime) * this.characterState.walkAmplitude;
                this.rightArm.rotation.z = Math.sin(this.characterState.walkTime) * this.characterState.walkAmplitude;
            }
        } else {
            // Reset to neutral position when not moving
            if (this.leftLeg && this.rightLeg) {
                this.leftLeg.rotation.x = 0;
                this.rightLeg.rotation.x = 0;
            }
            if (this.leftArm && this.rightArm) {
                this.leftArm.rotation.z = 0;
                this.rightArm.rotation.z = 0;
            }
        }

        // Jumping
        if (keys['ShiftLeft'] && !this.characterState.isJumping) {
            this.characterState.velocity.y = 8;
            this.characterState.isJumping = true;
            this.characterState.jumpVelocity = 8;
        }

        // Apply gravity
        if (this.characterState.isJumping) {
            this.characterState.velocity.y -= 20 * deltaTime;
            this.characterState.jumpVelocity -= 20 * deltaTime;
        }

        // Update position
        this.characterState.x += this.characterState.velocity.x * deltaTime;
        this.characterState.y += this.characterState.velocity.y * deltaTime;
        this.characterState.z += this.characterState.velocity.z * deltaTime;

        // Ground collision
        if (this.characterState.y < this.characterState.baseY) {
            this.characterState.y = this.characterState.baseY;
            this.characterState.velocity.y = 0;
            this.characterState.isJumping = false;
            this.characterState.jumpVelocity = 0;
        }

        // Update character group position
        this.characterGroup.position.set(
            this.characterState.x,
            this.characterState.y,
            this.characterState.z
        );

        // Handle vinyl shooting
        if (keys['KeyE'] && Date.now() - this.lastShootTime > this.shootCooldown * 1000) {
            this.shootVinyl();
            this.lastShootTime = Date.now();
        }

        // Update vinyls
        for (let i = this.vinyls.length - 1; i >= 0; i--) {
            const vinyl = this.vinyls[i];
            vinyl.update(deltaTime);
            if (vinyl.isExpired()) {
                this.scene.remove(vinyl.mesh);
                this.vinyls.splice(i, 1);
            }
        }

        // Update speech bubble if active
        if (this.activeSpeechBubble) {
            this.activeSpeechBubble.update(this.characterGroup.position);
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