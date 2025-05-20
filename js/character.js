// js/character.js
import * as THREE from 'three';
import { createStandardMaterial, createBoxGeometry } from './utils.js';
import { Vinyl } from './vinyl.js';
import { SpeechBubble } from './speechBubble.js';
import { Box3 } from 'three';

// Centralized color palette matching sprite inspiration
const CHARACTER_COLORS = {
    SKIN: 0xffdbac,
    HAIR: 0x5D3A1F, 
    HOODIE: 0x0A0A0A, 
    PANTS: 0x030303,  
    SHOES_UPPER: 0x050505, 
    SHOES_SOLE: 0xF0F0F0, // Slightly off-white for sole to differentiate
    SHOES_LACES_TOECAP: 0xFFFFFF, // Pure white for laces and potential toe cap
    DRAWSTRINGS: 0xE0E0E0,
    EYES: 0x000000,
};


export class Character {
    constructor(scene, chatSystem, name = 'Character') {
        this.scene = scene;
        this.chatSystem = chatSystem;
        this.name = name;
        this.createCharacter();
        this.setupState();
        
        this.vinyls = [];
        this.lastShootTime = 0;
        this.shootCooldown = 0.5;
        
        this.activeSpeechBubble = null;

        this.scene.add(this.characterGroup);
    }

    createCharacter() {
        this.characterGroup = new THREE.Group();
        this.characterGroup.name = this.name;
        
        // Body (Hoodie Torso) - Slightly adjusted for silhouette
        const bodyGeometry = createBoxGeometry(0.52, 1.05, 0.32); // Slightly wider, little shorter
        const bodyMaterial = createStandardMaterial(CHARACTER_COLORS.HOODIE, 0.85, 0.1); // More matte
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.525, 0); // Centered based on new height
        body.name = 'hoodie_torso'; 
        this.characterGroup.add(body);
        
        // Hood - More volume and slouch
        const hoodMaterial = createStandardMaterial(CHARACTER_COLORS.HOODIE, 0.85, 0.1);
        
        // Main back part of the hood
        const hoodBackMain = new THREE.Mesh(createBoxGeometry(0.48, 0.45, 0.20), hoodMaterial);
        hoodBackMain.position.set(0, 0.95, -0.18); // Lowered and further back
        hoodBackMain.rotation.x = 0.4; 
        hoodBackMain.name = 'hood_back_main';
        this.characterGroup.add(hoodBackMain);

        // Part of hood resting on shoulders
        const hoodShoulderPart = new THREE.Mesh(createBoxGeometry(0.52, 0.2, 0.25), hoodMaterial);
        hoodShoulderPart.position.set(0, 1.0, -0.05); // Slightly forward, on shoulders
        hoodShoulderPart.rotation.x = 0.1;
        hoodShoulderPart.name = 'hood_shoulder';
        this.characterGroup.add(hoodShoulderPart);

        // Hood opening edge (refined)
        const hoodOpeningEdge = new THREE.Mesh(createBoxGeometry(0.42, 0.12, 0.22), hoodMaterial); 
        hoodOpeningEdge.position.set(0, 1.18, -0.08); // Adjusted for new hood shape
        hoodOpeningEdge.rotation.x = -0.25; 
        hoodOpeningEdge.name = 'hood_opening_edge';
        this.characterGroup.add(hoodOpeningEdge);

        // Hoodie pocket
        const pocketGeometry = createBoxGeometry(0.32, 0.18, 0.05); // Slightly wider pocket
        const pocket = new THREE.Mesh(pocketGeometry, bodyMaterial);
        pocket.position.set(0, 0.28, 0.165); // Adjusted position
        pocket.name = 'pocket';
        this.characterGroup.add(pocket);

        // Hoodie drawstrings - longer, thinner
        const drawstringGeometry = createBoxGeometry(0.02, 0.30, 0.02); 
        const drawstringMaterial = createStandardMaterial(CHARACTER_COLORS.DRAWSTRINGS, 0.95);
        
        const leftDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        leftDrawstring.position.set(-0.085, 0.90, 0.14); 
        leftDrawstring.rotation.z = 0.08;
        leftDrawstring.rotation.x = 0.1;
        this.characterGroup.add(leftDrawstring);
        
        const rightDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        rightDrawstring.position.set(0.085, 0.90, 0.14); 
        rightDrawstring.rotation.z = -0.08;
        rightDrawstring.rotation.x = 0.1;
        this.characterGroup.add(rightDrawstring);
        
        // Head
        const headGeometry = createBoxGeometry(0.32, 0.38, 0.30); // Slightly slimmer depth
        const headMaterial = createStandardMaterial(CHARACTER_COLORS.SKIN, 0.95, 0.05); // Matte skin
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.20, 0); // Adjusted base Y position
        head.name = 'head';
        this.characterGroup.add(head);
        
        // Eyes
        const eyeGeometry = createBoxGeometry(0.065, 0.07, 0.03); 
        const eyeMaterial = createStandardMaterial(CHARACTER_COLORS.EYES, 1.0);
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.075, 1.28, 0.145); 
        leftEye.name = 'leftEye';
        this.characterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.075, 1.28, 0.145);
        rightEye.name = 'rightEye';
        this.characterGroup.add(rightEye);

        // Eyebrows
        const eyebrowGeometry = createBoxGeometry(0.09, 0.022, 0.02);
        const eyebrowMaterial = createStandardMaterial(CHARACTER_COLORS.HAIR, 0.9);
        
        const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        leftEyebrow.position.set(-0.075, 1.36, 0.148); 
        leftEyebrow.rotation.z = -0.08; 
        leftEyebrow.name = 'leftEyebrow';
        this.characterGroup.add(leftEyebrow);
        
        const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        rightEyebrow.position.set(0.075, 1.36, 0.148);
        rightEyebrow.rotation.z = 0.08;
        rightEyebrow.name = 'rightEyebrow';
        this.characterGroup.add(rightEyebrow);

        // Nose
        const noseGeometry = createBoxGeometry(0.035, 0.05, 0.035);
        const noseMaterial = createStandardMaterial(new THREE.Color(CHARACTER_COLORS.SKIN).multiplyScalar(0.92), 0.95);
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.26, 0.15); 
        nose.name = 'nose';
        this.characterGroup.add(nose);
        
        // Hair - Refined sprite-accurate hair
        const hairMaterial = createStandardMaterial(CHARACTER_COLORS.HAIR, 0.9, 0.1);

        // Top hair mass - main volume for the quiff
        const hairTopMainGeom = createBoxGeometry(0.30, 0.24, 0.28); // Slightly wider, taller
        const hairTopMain = new THREE.Mesh(hairTopMainGeom, hairMaterial);
        hairTopMain.position.set(0.02, 1.48, -0.02); // Higher, slightly to character's right
        hairTopMain.rotation.y = -0.1; // More pronounced sweep angle
        hairTopMain.name = 'hair_top_main';
        this.characterGroup.add(hairTopMain);
        
        // Front fringe - defining the sweep across forehead
        const hairFringeGeom = createBoxGeometry(0.26, 0.20, 0.14); // Longer, thinner
        const hairFringe = new THREE.Mesh(hairFringeGeom, hairMaterial);
        hairFringe.position.set(0.07, 1.45, 0.12); // Forward, bit lower, character's right
        hairFringe.rotation.x = -0.20;
        hairFringe.rotation.y = -0.25; 
        hairFringe.rotation.z = -0.15; 
        hairFringe.name = 'hair_fringe';
        this.characterGroup.add(hairFringe);

        // Connecting piece for top volume
        const hairTopConnectGeom = createBoxGeometry(0.15, 0.1, 0.22);
        const hairTopConnect = new THREE.Mesh(hairTopConnectGeom, hairMaterial);
        hairTopConnect.position.set(-0.08, 1.46, -0.01); // Fills gap on character's left
        hairTopConnect.rotation.y = 0.15;
        hairTopConnect.name = 'hair_top_connect';
        this.characterGroup.add(hairTopConnect);

        // Left Hair Side (character's left) - shorter
        const hairSideLeftGeom = createBoxGeometry(0.045, 0.18, 0.18);
        const hairSideLeft = new THREE.Mesh(hairSideLeftGeom, hairMaterial);
        hairSideLeft.position.set(-0.16, 1.30, -0.05); 
        hairSideLeft.name = 'hair_side_left';
        this.characterGroup.add(hairSideLeft);

        // Right Hair Side (character's right) - shorter
        const hairSideRightGeom = createBoxGeometry(0.045, 0.17, 0.17);
        const hairSideRight = new THREE.Mesh(hairSideRightGeom, hairMaterial);
        hairSideRight.position.set(0.16, 1.29, -0.05);
        hairSideRight.name = 'hair_side_right';
        this.characterGroup.add(hairSideRight);

        // Hair Back - neat and short
        const hairBackGeom = createBoxGeometry(0.31, 0.18, 0.06); 
        const hairBack = new THREE.Mesh(hairBackGeom, hairMaterial);
        hairBack.position.set(0, 1.31, -0.15); 
        hairBack.name = 'hair_back';
        this.characterGroup.add(hairBack);
        
        // Arms
        const armGeometry = createBoxGeometry(0.11, 0.56, 0.11); // Slimmer arms
        const armMaterial = createStandardMaterial(CHARACTER_COLORS.HOODIE, 0.85, 0.1); 
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.315, 0.50, 0); // Adjusted to torso
        leftArm.rotation.z = 0.08;
        leftArm.name = 'leftArm';
        this.leftArm = leftArm;
        this.characterGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.315, 0.50, 0);
        rightArm.rotation.z = -0.08;
        rightArm.name = 'rightArm';
        this.rightArm = rightArm;
        this.characterGroup.add(rightArm);
        
        // Legs - skinny style
        const legGeometry = createBoxGeometry(0.14, 0.78, 0.14); // Slightly longer, slimmer
        const legMaterial = createStandardMaterial(CHARACTER_COLORS.PANTS, 0.9, 0.05); 
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.095, -0.19, 0); // Adjusted base Y
        leftLeg.name = 'leftLeg';
        this.leftLeg = leftLeg;
        this.characterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.095, -0.19, 0);
        rightLeg.name = 'rightLeg';
        this.rightLeg = rightLeg;
        this.characterGroup.add(rightLeg);
        
        // Shoes - Refined flat classic sneaker
        const createFlatSneaker = () => {
            const sneakerGroup = new THREE.Group();
            
            // Main shoe upper - flatter
            const upperGeometry = createBoxGeometry(0.21, 0.10, 0.39); // Slimmer height, slightly longer
            const upperMaterial = createStandardMaterial(CHARACTER_COLORS.SHOES_UPPER, 0.95);
            const upper = new THREE.Mesh(upperGeometry, upperMaterial);
            upper.position.y = 0.01; // Slightly higher for sole to fit under
            sneakerGroup.add(upper);
            
            // Sole - thinner
            const soleGeometry = createBoxGeometry(0.23, 0.06, 0.41); 
            const soleMaterial = createStandardMaterial(CHARACTER_COLORS.SHOES_SOLE, 0.98); // Off-white sole
            const sole = new THREE.Mesh(soleGeometry, soleMaterial);
            sole.position.y = -0.05; // Position sole under upper
            sneakerGroup.add(sole);
            
            // Simple Lace Detail / Tongue area
            const laceAreaGeometry = createBoxGeometry(0.16, 0.05, 0.04); // Flat plate for laces
            const laceMaterial = createStandardMaterial(CHARACTER_COLORS.SHOES_LACES_TOECAP, 1.0);
            const laceArea = new THREE.Mesh(laceAreaGeometry, laceMaterial);
            laceArea.position.set(0, 0.06, 0.09); // On top-front of upper
            laceArea.rotation.x = -0.35; 
            sneakerGroup.add(laceArea);

            // Subtle Toe Cap (optional, for Vans-like look)
            const toeCapGeom = createBoxGeometry(0.18, 0.07, 0.05);
            const toeCap = new THREE.Mesh(toeCapGeom,createStandardMaterial(CHARACTER_COLORS.SHOES_UPPER, 0.95)); // Can be shoe color or white
             // If white: createStandardMaterial(CHARACTER_COLORS.SHOES_LACES_TOECAP, 1.0)
            toeCap.position.set(0, -0.01, 0.17); // At the very front toe
            sneakerGroup.add(toeCap);
            
            sneakerGroup.position.z = 0.02; // Move entire shoe slightly forward from leg center
            return sneakerGroup;
        };

        this.leftShoe = createFlatSneaker();
        // Position calculation: Leg bottom Y (-0.19 - 0.78/2 = -0.58)
        // Shoe origin is roughly at center of sole Y. Sole Y is -0.05, sole height is 0.06.
        // So lowest point of sole is -0.05 - 0.03 = -0.08 relative to shoe group.
        // Shoe group Y: -0.58 (leg bottom) - 0.08 (shoe height) = -0.66.
        this.leftShoe.position.set(-0.095, -0.66, 0); 
        this.leftShoe.name = 'leftShoe';
        this.characterGroup.add(this.leftShoe);

        this.rightShoe = createFlatSneaker();
        this.rightShoe.position.set(0.095, -0.66, 0);
        this.rightShoe.name = 'rightShoe';
        this.characterGroup.add(this.rightShoe);
        
        // Adjust character group base position so feet are at Y=0
        // Lowest point of shoe in local space is ~ -0.08.
        // Shoe group Y is -0.66. So absolute lowest Y of character model is -0.66 - 0.08 = -0.74
        this.characterGroup.position.set(0, 0.74, 0);
    }

    setupState() {
        this.characterState = {
            x: this.characterGroup.position.x,
            y: this.characterGroup.position.y,
            z: this.characterGroup.position.z,
            rotation: 0,
            moveSpeed: 5,
            jumpForce: 8,
            gravity: -15, // Keep gravity fairly high for snappy jumps
            velocity: new THREE.Vector3(),
            isJumping: false,
            jumpVelocity: 0,
            baseY: this.characterGroup.position.y, 
            walkTime: 0,
            walkSpeed: 10, // Controls how fast the walk cycle plays
            walkAmplitude: 0.18, // Reduced amplitude for more subtle walk
            isWalking: false,
            isIdle: true,
            idleAnimationTime: Math.random() * Math.PI * 2, 
            idleAnimationSpeed: 0.45 + Math.random() * 0.3, // Slightly slower idle
            shouldWaveArm: false,
        };

        // Store references to parts for animation
        this.leftLeg = this.characterGroup.getObjectByName('leftLeg');
        this.rightLeg = this.characterGroup.getObjectByName('rightLeg');
        this.leftArm = this.characterGroup.getObjectByName('leftArm');
        this.rightArm = this.characterGroup.getObjectByName('rightArm');
        this.leftShoe = this.characterGroup.getObjectByName('leftShoe');
        this.rightShoe = this.characterGroup.getObjectByName('rightShoe');
    }

    getAABB() {
        if (!this._aabb) {
            this._aabb = new THREE.Box3();
        }
        this._aabb.setFromObject(this.characterGroup, true);
        return this._aabb;
    }
    
    update(deltaTime, keys, camera, obstacles = [], portals = []) {
        // --- Player Input & Velocity Update ---
        const moveDirection = new THREE.Vector3(0, 0, 0);
        let isPlayerMoving = false;
        let playerWantsToShoot = false;

        if (keys['ArrowUp']) { moveDirection.z -= 1; isPlayerMoving = true; }
        if (keys['ArrowDown']) { moveDirection.z += 1; isPlayerMoving = true; }
        if (keys['ArrowLeft']) { moveDirection.x -= 1; isPlayerMoving = true; }
        if (keys['ArrowRight']) { moveDirection.x += 1; isPlayerMoving = true; }

        const now = performance.now() / 1000;
        if (keys['KeyE'] && (now - this.lastShootTime > this.shootCooldown)) {
             playerWantsToShoot = true;
        }

        if (Object.keys(keys).length > 0) { // Player-controlled
            if (isPlayerMoving) {
                moveDirection.normalize();
                const targetVelocity = moveDirection.multiplyScalar(this.characterState.moveSpeed);
                // Interpolate for smoother movement start/stop
                this.characterState.velocity.x = THREE.MathUtils.lerp(this.characterState.velocity.x, targetVelocity.x, 0.15);
                this.characterState.velocity.z = THREE.MathUtils.lerp(this.characterState.velocity.z, targetVelocity.z, 0.15);
                this.characterGroup.rotation.y = Math.atan2(this.characterState.velocity.x, this.characterState.velocity.z);
            } else {
                 this.characterState.velocity.x = THREE.MathUtils.lerp(this.characterState.velocity.x, 0, 0.15);
                 this.characterState.velocity.z = THREE.MathUtils.lerp(this.characterState.velocity.z, 0, 0.15);
            }
            
            this.characterState.isWalking = (Math.abs(this.characterState.velocity.x) > 0.01 || Math.abs(this.characterState.velocity.z) > 0.01) && !this.characterState.isJumping;
            this.characterState.isIdle = !this.characterState.isWalking && !this.characterState.isJumping;

            if (playerWantsToShoot) {
                this.lastShootTime = now;
                this.shootVinyl();
                if (this.chatSystem) { 
                    this.chatSystem.addPlayerMessage("Flinging a disc!");
                }
            }
        } 
        // For NPCs, velocity.x/z and animation states are set externally by NPC class

        // --- Vertical Movement (Gravity & Jumping) ---
        if (this.characterState.isJumping) {
            this.characterState.jumpVelocity += this.characterState.gravity * deltaTime;
            this.characterState.velocity.y = this.characterState.jumpVelocity;
        } else {
            // Apply gravity if slightly above base ground, or ensure contact
            if (this.characterGroup.position.y > this.characterState.baseY + 0.01) {
                this.characterState.velocity.y += this.characterState.gravity * deltaTime * 0.5; // Softer continuous gravity
            } else if (this.characterGroup.position.y < this.characterState.baseY - 0.01) {
                 // If sunk below baseY for some reason, try to correct upwards quickly unless jumping
                 this.characterState.velocity.y = Math.max(this.characterState.velocity.y, 1); 
            }
            else {
                this.characterState.velocity.y = -0.1; // Gentle downward push for collision
            }
        }
        
        // --- Collision Detection & Resolution ---
        const currentPosition = this.characterGroup.position.clone();
        let proposedPosition = currentPosition.clone().add(this.characterState.velocity.clone().multiplyScalar(deltaTime)); 
        
        // Approximate character collision dimensions (adjust as needed)
        // Height from feet to top of hair approx: 0.74 (base) + 1.48 (hair top Y) + 0.12 (half hair height) = ~1.62 (total model height is around 1.48 (hair) + 0.08 (shoe sole) = 1.56 from feet to top)
        // For collision, a slightly more generous box is often better.
        const collisionCharacterHeight = 1.6; 
        const collisionCharacterWidth = 0.4;  

        obstacles.forEach(obstacle => {
            const checkMinY = proposedPosition.y; 
            const checkMaxY = proposedPosition.y + collisionCharacterHeight;

            const charAABBmin = new THREE.Vector3(
                proposedPosition.x - collisionCharacterWidth / 2, 
                checkMinY, 
                proposedPosition.z - collisionCharacterWidth / 2
            );
            const charAABBmax = new THREE.Vector3(
                proposedPosition.x + collisionCharacterWidth / 2, 
                checkMaxY, 
                proposedPosition.z + collisionCharacterWidth / 2
            );
            const charCollisionAABB = new THREE.Box3(charAABBmin, charAABBmax);

            if (charCollisionAABB.intersectsBox(obstacle.aabb)) {
                 // Y-collision first
                 const tempYcenter = currentPosition.clone();
                 tempYcenter.y = proposedPosition.y + (collisionCharacterHeight / 2);
                 const tempAABB_Y = new THREE.Box3().setFromCenterAndSize(tempYcenter, new THREE.Vector3(collisionCharacterWidth, collisionCharacterHeight, collisionCharacterWidth));
                 
                 if (tempAABB_Y.intersectsBox(obstacle.aabb)) {
                      if (this.characterState.velocity.y <= 0) { // Moving Down / On Ground
                           this.characterState.isJumping = false;
                           this.characterState.jumpVelocity = 0;
                           this.characterState.velocity.y = 0;
                           proposedPosition.y = obstacle.aabb.max.y; 
                           this.characterState.baseY = proposedPosition.y; // Update base Y to what we landed on
                      } else { // Moving Up (Hit head)
                           this.characterState.jumpVelocity = 0; // Stop upward jump velocity
                           this.characterState.velocity.y = 0;
                           proposedPosition.y = obstacle.aabb.min.y - collisionCharacterHeight - 0.01; // Place below obstacle
                      }
                 }

                 // X-collision
                 const tempXcenter = currentPosition.clone(); // Use current Z
                 tempXcenter.x = proposedPosition.x;          // Test proposed X
                 tempXcenter.y = proposedPosition.y + collisionCharacterHeight / 2; // Use Y-resolved position
                 const tempAABB_X = new THREE.Box3().setFromCenterAndSize(tempXcenter, new THREE.Vector3(collisionCharacterWidth, collisionCharacterHeight, collisionCharacterWidth));
                 if (tempAABB_X.intersectsBox(obstacle.aabb)) {
                     this.characterState.velocity.x = 0;
                     if (proposedPosition.x > currentPosition.x) { // Moving Right
                          proposedPosition.x = obstacle.aabb.min.x - (collisionCharacterWidth / 2) - 0.01;
                     } else { // Moving Left
                          proposedPosition.x = obstacle.aabb.max.x + (collisionCharacterWidth / 2) + 0.01;
                     }
                 }

                 // Z-collision
                 const tempZcenter = currentPosition.clone(); // Use current X
                 tempZcenter.z = proposedPosition.z;          // Test proposed Z
                 tempZcenter.y = proposedPosition.y + collisionCharacterHeight / 2; // Use Y-resolved position
                 const tempAABB_Z = new THREE.Box3().setFromCenterAndSize(tempZcenter, new THREE.Vector3(collisionCharacterWidth, collisionCharacterHeight, collisionCharacterWidth));
                 if (tempAABB_Z.intersectsBox(obstacle.aabb)) {
                     this.characterState.velocity.z = 0;
                     if (proposedPosition.z > currentPosition.z) { // Moving Forward (+Z in character space)
                          proposedPosition.z = obstacle.aabb.min.z - (collisionCharacterWidth / 2) - 0.01;
                     } else { // Moving Backward (-Z in character space)
                          proposedPosition.z = obstacle.aabb.max.z + (collisionCharacterWidth / 2) + 0.01;
                     }
                 }
            }
        });

        this.characterGroup.position.copy(proposedPosition);

        // Final ground clamp if not jumping and no vertical collision happened that frame
        if (!this.characterState.isJumping && Math.abs(this.characterState.velocity.y) < 0.1 && this.characterGroup.position.y < this.characterState.baseY) {
             if(this.characterGroup.position.y < this.characterState.baseY - 0.05) { // Only hard clamp if significantly below
                this.characterGroup.position.y = this.characterState.baseY;
             }
        } else if (this.characterState.isJumping && this.characterGroup.position.y <= this.characterState.baseY && this.characterState.velocity.y <0) {
            // Landed during a jump
            this.characterGroup.position.y = this.characterState.baseY;
            this.characterState.isJumping = false;
            this.characterState.jumpVelocity = 0;
            this.characterState.velocity.y = 0;
        }
        
        this.characterState.x = this.characterGroup.position.x;
        this.characterState.y = this.characterGroup.position.y;
        this.characterState.z = this.characterGroup.position.z;
        
        // --- Animations & Other Updates ---
        if (this.characterState.isWalking) {
            this.characterState.walkTime += deltaTime * this.characterState.walkSpeed;
            this.animateWalk(this.characterState.walkTime, this.characterState.walkAmplitude);
        } else if (this.characterState.isIdle) {
            this.characterState.idleAnimationTime += deltaTime * this.characterState.idleAnimationSpeed;
            this.animateIdle(this.characterState.idleAnimationTime, this.characterState.shouldWaveArm); 
        } else { 
            this.setNeutralPose();
        }

        if (Object.keys(keys).length > 0) { // Player character updates
             for (let i = this.vinyls.length - 1; i >= 0; i--) {
                 const vinyl = this.vinyls[i];
                 if (!vinyl.update(deltaTime)) { // Vinyl's update returns false if inactive
                     this.vinyls.splice(i, 1); // Vinyl handles its own disposal from scene
                 }
             }
        }
        
        if (this.activeSpeechBubble && camera) {
            const headWorldPosition = new THREE.Vector3();
            const headMesh = this.characterGroup.getObjectByName('head');
            if (headMesh) {
                headMesh.getWorldPosition(headWorldPosition);
                // Place bubble slightly above and in front of the head center
                headWorldPosition.y += 0.45; 
                // Small forward offset can be done in SpeechBubble itself or here via camera relative calc
                this.activeSpeechBubble.update(headWorldPosition, camera);
            } else {
                // Fallback if head mesh not found (shouldn't happen)
                const charPos = this.characterGroup.position.clone();
                charPos.y += 1.8;
                this.activeSpeechBubble.update(charPos, camera);
            }
        }
    }


    animateWalk(walkTime, amplitude) {
        const armAngle = Math.sin(walkTime) * amplitude;
        const legAngle = Math.sin(walkTime) * amplitude * 1.2; // Leg swing slightly more

        if (this.leftArm) {
            this.leftArm.rotation.x = -armAngle;
            this.leftArm.rotation.z = 0.03 + Math.sin(walkTime * 0.6) * 0.02; 
        }
        if (this.rightArm) {
            this.rightArm.rotation.x = armAngle;
            this.rightArm.rotation.z = -0.03 - Math.sin(walkTime * 0.6) * 0.02;
        }

        // Base Y positions for legs and shoes
        const legBaseLocalY = -0.19; 
        const shoeBaseLocalY = -0.66;
        const legBobAmplitude = 0.015; // Very subtle bob

        if (this.leftLeg) {
            this.leftLeg.rotation.x = legAngle;
            this.leftLeg.position.y = legBaseLocalY + Math.abs(Math.sin(walkTime)) * legBobAmplitude;
        }
        if (this.rightLeg) {
            this.rightLeg.rotation.x = -legAngle;
            this.rightLeg.position.y = legBaseLocalY + Math.abs(Math.sin(walkTime + Math.PI)) * legBobAmplitude;
        }

        if (this.leftShoe && this.leftLeg) {
            this.leftShoe.rotation.x = this.leftLeg.rotation.x * 0.7; 
            this.leftShoe.position.y = shoeBaseLocalY + (this.leftLeg.position.y - legBaseLocalY); 
        }
        if (this.rightShoe && this.rightLeg) {
            this.rightShoe.rotation.x = this.rightLeg.rotation.x * 0.7;
            this.rightShoe.position.y = shoeBaseLocalY + (this.rightLeg.position.y - legBaseLocalY);
        }
    }

    animateIdle(idleTime, shouldWave) {
        const legBaseLocalY = -0.19;
        const shoeBaseLocalY = -0.66;

        if (this.leftArm && this.rightArm) {
            if (shouldWave) {
                const waveAngle = Math.sin(idleTime * 2.2) * 0.9; 
                this.rightArm.rotation.z = -0.08 - waveAngle; // Raise arm from side for wave
                this.rightArm.rotation.x = -0.6 + Math.sin(idleTime * 1.2) * 0.35; // Forward/back wave motion
                this.leftArm.rotation.x = Math.sin(idleTime * 0.4) * 0.02; // Gentle sway for other arm
                this.leftArm.rotation.z = 0.08;
            } else { // Subtle breathing / idle pose
                const idleArmAngle = Math.sin(idleTime * 0.35) * 0.015; 
                this.leftArm.rotation.x = idleArmAngle;
                this.rightArm.rotation.x = -idleArmAngle;
                this.leftArm.rotation.z = 0.06 + Math.sin(idleTime * 0.2) * 0.01; 
                this.rightArm.rotation.z = -0.06 - Math.sin(idleTime * 0.2) * 0.01;
            }
        }
        
        // Subtle idle leg movement
        if (this.leftLeg) {
            this.leftLeg.rotation.x = Math.sin(idleTime * 0.1) * 0.01;
            this.leftLeg.position.y = legBaseLocalY;
        }
        if (this.rightLeg) {
            this.rightLeg.rotation.x = -Math.sin(idleTime * 0.1) * 0.01;
            this.rightLeg.position.y = legBaseLocalY;
        }
        if (this.leftShoe && this.leftLeg) {
            this.leftShoe.rotation.x = this.leftLeg.rotation.x;
            this.leftShoe.position.y = shoeBaseLocalY;
        }
        if (this.rightShoe && this.rightLeg) {
            this.rightShoe.rotation.x = this.rightLeg.rotation.x;
            this.rightShoe.position.y = shoeBaseLocalY;
        }
    }

    setNeutralPose() {
        const legBaseLocalY = -0.19;
        const shoeBaseLocalY = -0.66;

        if (this.leftArm) this.leftArm.rotation.set(0, 0, 0.08); // Arms slightly by the side
        if (this.rightArm) this.rightArm.rotation.set(0, 0, -0.08);
        if (this.leftLeg) {
             this.leftLeg.rotation.set(0, 0, 0);
             this.leftLeg.position.y = legBaseLocalY;
        }
        if (this.rightLeg) {
            this.rightLeg.rotation.set(0, 0, 0);
            this.rightLeg.position.y = legBaseLocalY;
        }
        if (this.leftShoe) {
            this.leftShoe.rotation.set(0, 0, 0);
            this.leftShoe.position.y = shoeBaseLocalY;
        }
         if (this.rightShoe) {
            this.rightShoe.rotation.set(0, 0, 0);
            this.rightShoe.position.y = shoeBaseLocalY;
        }
    }

    shootVinyl() {
        const direction = new THREE.Vector3();
        // Get forward direction based on character's rotation (Y-axis)
        // Assuming character model's "front" is along its local +Z axis after rotation
        // If model is oriented differently (e.g. faces -Z), this needs adjustment.
        // Let's assume +Z is forward for simplicity here, adjust if sprite implies facing -Z for model.
        this.characterGroup.getWorldDirection(direction); 
        // If default model faces -Z, then direction.negate(); 
        // Sprite reference seems to imply front facing camera initially (positive Z if camera is at -Z).
        // After model update, sprite seems to face towards camera. Our character rotates on Y.
        // `getWorldDirection` gets the local -Z axis in world space if not modified.
        // Since our character's rotation points its +Z towards movement, this might be correct.
        // But Habbo-style often has characters "facing" slightly away from direct movement for isometric.
        // For a throw "forwards" relative to where character *looks*, use rotation.
        // For now, use world direction from group.

        const worldDir = new THREE.Vector3();
        this.characterGroup.getWorldDirection(worldDir); // Gets the -Z direction the character group is facing.
                                                        // We want the +Z direction for "forward throw".
        worldDir.negate(); // Now it's the "forward" direction relative to character's orientation.


        // Spawn vinyl from near character's hand/chest height
        const armWorldPos = new THREE.Vector3();
        // Using head position as a more stable reference than rapidly moving arms
        const headMesh = this.characterGroup.getObjectByName('head');
        if (headMesh) {
            headMesh.getWorldPosition(armWorldPos);
            armWorldPos.y -= 0.3; // Estimate hand/chest level relative to head
        } else { // Fallback to character group position
            this.characterGroup.getWorldPosition(armWorldPos);
            armWorldPos.y += 0.8; // Mid-body height
        }


        const spawnOffset = worldDir.clone().multiplyScalar(0.4); // Spawn slightly in front
        const spawnPosition = armWorldPos.clone().add(spawnOffset);

        const vinyl = new Vinyl(this.scene, spawnPosition, worldDir);
        this.vinyls.push(vinyl);
    }

    getPosition() {
        return this.characterGroup.position.clone();
    }
    
    say(message) {
        if (this.activeSpeechBubble) {
            this.activeSpeechBubble.remove();
        }
        this.activeSpeechBubble = new SpeechBubble(this.scene, message); 
    }
}