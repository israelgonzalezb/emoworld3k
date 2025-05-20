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
    SHOES_SOLE: 0xF0F0F0, 
    SHOES_LACES_TOECAP: 0xFFFFFF,
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

        // For debugging character collision box
        this.characterCollisionHelper = new THREE.Box3Helper(new THREE.Box3(), 0xff0000); // Red color
        this.characterCollisionHelper.visible = true; // Set to false or remove for production
        this.scene.add(this.characterCollisionHelper);


        this.scene.add(this.characterGroup);
    }

    createCharacter() {
        this.characterGroup = new THREE.Group();
        this.characterGroup.name = this.name;
        
        const bodyGeometry = createBoxGeometry(0.52, 1.05, 0.32); 
        const bodyMaterial = createStandardMaterial(CHARACTER_COLORS.HOODIE, 0.85, 0.1);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.525, 0); 
        body.name = 'hoodie_torso'; 
        this.characterGroup.add(body);
        
        const hoodMaterial = createStandardMaterial(CHARACTER_COLORS.HOODIE, 0.85, 0.1);
        
        const hoodBackMain = new THREE.Mesh(createBoxGeometry(0.48, 0.45, 0.20), hoodMaterial);
        hoodBackMain.position.set(0, 0.95, -0.18); 
        hoodBackMain.rotation.x = 0.4; 
        hoodBackMain.name = 'hood_back_main';
        this.characterGroup.add(hoodBackMain);

        const hoodShoulderPart = new THREE.Mesh(createBoxGeometry(0.52, 0.2, 0.25), hoodMaterial);
        hoodShoulderPart.position.set(0, 1.0, -0.05); 
        hoodShoulderPart.rotation.x = 0.1;
        hoodShoulderPart.name = 'hood_shoulder';
        this.characterGroup.add(hoodShoulderPart);

        const hoodOpeningEdge = new THREE.Mesh(createBoxGeometry(0.42, 0.12, 0.22), hoodMaterial); 
        hoodOpeningEdge.position.set(0, 1.18, -0.08); 
        hoodOpeningEdge.rotation.x = -0.25; 
        hoodOpeningEdge.name = 'hood_opening_edge';
        this.characterGroup.add(hoodOpeningEdge);

        const pocketGeometry = createBoxGeometry(0.32, 0.18, 0.05); 
        const pocket = new THREE.Mesh(pocketGeometry, bodyMaterial);
        pocket.position.set(0, 0.28, 0.165); 
        pocket.name = 'pocket';
        this.characterGroup.add(pocket);

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
        
        const headGeometry = createBoxGeometry(0.32, 0.38, 0.30); 
        const headMaterial = createStandardMaterial(CHARACTER_COLORS.SKIN, 0.95, 0.05); 
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.20, 0); 
        head.name = 'head';
        this.characterGroup.add(head);
        
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

        const noseGeometry = createBoxGeometry(0.035, 0.05, 0.035);
        const noseMaterial = createStandardMaterial(new THREE.Color(CHARACTER_COLORS.SKIN).multiplyScalar(0.92), 0.95);
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.26, 0.15); 
        nose.name = 'nose';
        this.characterGroup.add(nose);
        
        const hairMaterial = createStandardMaterial(CHARACTER_COLORS.HAIR, 0.9, 0.1);

        const hairTopMainGeom = createBoxGeometry(0.30, 0.24, 0.28); 
        const hairTopMain = new THREE.Mesh(hairTopMainGeom, hairMaterial);
        hairTopMain.position.set(0.02, 1.48, -0.02); 
        hairTopMain.rotation.y = -0.1; 
        hairTopMain.name = 'hair_top_main';
        this.characterGroup.add(hairTopMain);
        
        const hairFringeGeom = createBoxGeometry(0.26, 0.20, 0.14); 
        const hairFringe = new THREE.Mesh(hairFringeGeom, hairMaterial);
        hairFringe.position.set(0.07, 1.45, 0.12); 
        hairFringe.rotation.x = -0.20;
        hairFringe.rotation.y = -0.25; 
        hairFringe.rotation.z = -0.15; 
        hairFringe.name = 'hair_fringe';
        this.characterGroup.add(hairFringe);

        const hairTopConnectGeom = createBoxGeometry(0.15, 0.1, 0.22);
        const hairTopConnect = new THREE.Mesh(hairTopConnectGeom, hairMaterial);
        hairTopConnect.position.set(-0.08, 1.46, -0.01); 
        hairTopConnect.rotation.y = 0.15;
        hairTopConnect.name = 'hair_top_connect';
        this.characterGroup.add(hairTopConnect);

        const hairSideLeftGeom = createBoxGeometry(0.045, 0.18, 0.18);
        const hairSideLeft = new THREE.Mesh(hairSideLeftGeom, hairMaterial);
        hairSideLeft.position.set(-0.16, 1.30, -0.05); 
        hairSideLeft.name = 'hair_side_left';
        this.characterGroup.add(hairSideLeft);

        const hairSideRightGeom = createBoxGeometry(0.045, 0.17, 0.17);
        const hairSideRight = new THREE.Mesh(hairSideRightGeom, hairMaterial);
        hairSideRight.position.set(0.16, 1.29, -0.05);
        hairSideRight.name = 'hair_side_right';
        this.characterGroup.add(hairSideRight);

        const hairBackGeom = createBoxGeometry(0.31, 0.18, 0.06); 
        const hairBack = new THREE.Mesh(hairBackGeom, hairMaterial);
        hairBack.position.set(0, 1.31, -0.15); 
        hairBack.name = 'hair_back';
        this.characterGroup.add(hairBack);
        
        const armGeometry = createBoxGeometry(0.11, 0.56, 0.11); 
        const armMaterial = createStandardMaterial(CHARACTER_COLORS.HOODIE, 0.85, 0.1); 
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.315, 0.50, 0); 
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
        
        const legGeometry = createBoxGeometry(0.14, 0.78, 0.14); 
        const legMaterial = createStandardMaterial(CHARACTER_COLORS.PANTS, 0.9, 0.05); 
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.095, -0.19, 0); 
        leftLeg.name = 'leftLeg';
        this.leftLeg = leftLeg;
        this.characterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.095, -0.19, 0);
        rightLeg.name = 'rightLeg';
        this.rightLeg = rightLeg;
        this.characterGroup.add(rightLeg);
        
        const createFlatSneaker = () => {
            const sneakerGroup = new THREE.Group();
            
            const upperGeometry = createBoxGeometry(0.21, 0.10, 0.39); 
            const upperMaterial = createStandardMaterial(CHARACTER_COLORS.SHOES_UPPER, 0.95);
            const upper = new THREE.Mesh(upperGeometry, upperMaterial);
            upper.position.y = 0.01; 
            sneakerGroup.add(upper);
            
            const soleGeometry = createBoxGeometry(0.23, 0.06, 0.41); 
            const soleMaterial = createStandardMaterial(CHARACTER_COLORS.SHOES_SOLE, 0.98); 
            const sole = new THREE.Mesh(soleGeometry, soleMaterial);
            sole.position.y = -0.05; 
            sneakerGroup.add(sole);
            
            const laceAreaGeometry = createBoxGeometry(0.16, 0.05, 0.04); 
            const laceMaterial = createStandardMaterial(CHARACTER_COLORS.SHOES_LACES_TOECAP, 1.0);
            const laceArea = new THREE.Mesh(laceAreaGeometry, laceMaterial);
            laceArea.position.set(0, 0.06, 0.09); 
            laceArea.rotation.x = -0.35; 
            sneakerGroup.add(laceArea);

            const toeCapGeom = createBoxGeometry(0.18, 0.07, 0.05);
            const toeCap = new THREE.Mesh(toeCapGeom,createStandardMaterial(CHARACTER_COLORS.SHOES_UPPER, 0.95));
            toeCap.position.set(0, -0.01, 0.17); 
            sneakerGroup.add(toeCap);
            
            sneakerGroup.position.z = 0.02; 
            return sneakerGroup;
        };

        this.leftShoe = createFlatSneaker();
        this.leftShoe.position.set(-0.095, -0.66, 0); 
        this.leftShoe.name = 'leftShoe';
        this.characterGroup.add(this.leftShoe);

        this.rightShoe = createFlatSneaker();
        this.rightShoe.position.set(0.095, -0.66, 0);
        this.rightShoe.name = 'rightShoe';
        this.characterGroup.add(this.rightShoe);
        
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
            gravity: -20, // Increased gravity slightly for less floaty feel
            velocity: new THREE.Vector3(),
            isJumping: false,
            jumpVelocity: 0,
            baseY: this.characterGroup.position.y, 
            walkTime: 0,
            walkSpeed: 10,
            walkAmplitude: 0.18,
            isWalking: false,
            isIdle: true,
            idleAnimationTime: Math.random() * Math.PI * 2, 
            idleAnimationSpeed: 0.45 + Math.random() * 0.3,
            shouldWaveArm: false,
        };

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

        if (Object.keys(keys).length > 0) { 
            if (isPlayerMoving) {
                moveDirection.normalize();
                const targetVelocity = moveDirection.multiplyScalar(this.characterState.moveSpeed);
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
        
        if (this.characterState.isJumping) {
            this.characterState.jumpVelocity += this.characterState.gravity * deltaTime;
            this.characterState.velocity.y = this.characterState.jumpVelocity;
        } else {
            // Not jumping, apply gentle downward force for ground detection if not already on ground
             this.characterState.velocity.y = -0.1; // Constant small downward pull
        }
        
        const currentPosition = this.characterGroup.position.clone();
        
        // Calculate total displacement for this frame
        const displacement = this.characterState.velocity.clone().multiplyScalar(deltaTime);

        // --- Iterative Collision Resolution ---
        let finalProposedPos = currentPosition.clone();

        // Character collision properties
        const collisionCharacterHeight = 1.6; 
        const collisionCharacterWidth = 0.4;  
        const characterHalfWidth = collisionCharacterWidth / 2;
        const epsilon = 0.01; // Small offset to prevent exact surface overlap issues

        // 1. Resolve X-axis
        finalProposedPos.x += displacement.x;
        let tempCharAABB = new THREE.Box3(
            new THREE.Vector3(finalProposedPos.x - characterHalfWidth, finalProposedPos.y, finalProposedPos.z - characterHalfWidth),
            new THREE.Vector3(finalProposedPos.x + characterHalfWidth, finalProposedPos.y + collisionCharacterHeight, finalProposedPos.z + characterHalfWidth)
        );

        for (const obstacle of obstacles) {
            if (tempCharAABB.intersectsBox(obstacle.aabb)) {
                if (displacement.x > 0) { // Moving right
                    finalProposedPos.x = obstacle.aabb.min.x - characterHalfWidth - epsilon;
                } else if (displacement.x < 0) { // Moving left
                    finalProposedPos.x = obstacle.aabb.max.x + characterHalfWidth + epsilon;
                }
                this.characterState.velocity.x = 0; // Stop X movement
                tempCharAABB.min.x = finalProposedPos.x - characterHalfWidth; // Update AABB for next checks
                tempCharAABB.max.x = finalProposedPos.x + characterHalfWidth;
                break; 
            }
        }

        // 2. Resolve Z-axis (using X-resolved position)
        finalProposedPos.z += displacement.z;
        tempCharAABB.min.z = finalProposedPos.z - characterHalfWidth;
        tempCharAABB.max.z = finalProposedPos.z + characterHalfWidth;
        // Y remains at current character position for this horizontal check phase
        tempCharAABB.min.y = currentPosition.y; 
        tempCharAABB.max.y = currentPosition.y + collisionCharacterHeight;


        for (const obstacle of obstacles) {
             // Re-check AABB with updated Z, using already resolved X and current Y
             let checkAABB_Z = new THREE.Box3(
                new THREE.Vector3(finalProposedPos.x - characterHalfWidth, currentPosition.y, finalProposedPos.z - characterHalfWidth),
                new THREE.Vector3(finalProposedPos.x + characterHalfWidth, currentPosition.y + collisionCharacterHeight, finalProposedPos.z + characterHalfWidth)
            );
            if (checkAABB_Z.intersectsBox(obstacle.aabb)) {
                if (displacement.z > 0) { // Moving "forward" (positive Z)
                    finalProposedPos.z = obstacle.aabb.min.z - characterHalfWidth - epsilon;
                } else if (displacement.z < 0) { // Moving "backward" (negative Z)
                    finalProposedPos.z = obstacle.aabb.max.z + characterHalfWidth + epsilon;
                }
                this.characterState.velocity.z = 0; // Stop Z movement
                // No need to update tempCharAABB.z here as Z is the last horizontal check
                break; 
            }
        }

        // 3. Resolve Y-axis (using XZ-resolved position)
        finalProposedPos.y += displacement.y;
        tempCharAABB.min.y = finalProposedPos.y;
        tempCharAABB.max.y = finalProposedPos.y + collisionCharacterHeight;
        // Update X and Z for this AABB based on resolved horizontal positions
        tempCharAABB.min.x = finalProposedPos.x - characterHalfWidth; 
        tempCharAABB.max.x = finalProposedPos.x + characterHalfWidth;
        tempCharAABB.min.z = finalProposedPos.z - characterHalfWidth;
        tempCharAABB.max.z = finalProposedPos.z + characterHalfWidth;

        let onGroundThisFrame = false;
        const maxStepHeight = 0.25; 

        for (const obstacle of obstacles) {
            if (tempCharAABB.intersectsBox(obstacle.aabb)) {
                if (displacement.y <= 0 || this.characterState.velocity.y <=0 ) { // Moving Down or effectively on ground
                    const obstacleTopY = obstacle.aabb.max.y;
                    const characterFeetAtCurrentXZ = currentPosition.y; // Feet before Y move, at current XZ

                    // Check if it's a valid step up
                    if (obstacleTopY >= finalProposedPos.y && // Obstacle top is at or above where feet would land
                        obstacleTopY <= characterFeetAtCurrentXZ + maxStepHeight) { // And it's a reasonable step
                        
                        finalProposedPos.y = obstacleTopY;
                        this.characterState.baseY = finalProposedPos.y; // Update baseY to the new surface
                        this.characterState.isJumping = false;
                        this.characterState.jumpVelocity = 0;
                        onGroundThisFrame = true;
                    } else if (finalProposedPos.y < obstacleTopY) { 
                        // Feet are trying to go below the obstacle's top, but it's too high to step on.
                        // This implies collision with the side if horizontal collision didn't fully resolve,
                        // or character is falling next to a wall.
                        // If not a valid step, and horizontal collision did its job, this Y collision might simply mean
                        // we are still trying to move down but are blocked by something that's not a valid step.
                        // In this case, we might just ensure we don't pass through.
                        // If horizontal velocity was significant, the horizontal stop is more important.
                        // If y velocity is dominant (falling), reset to baseY or nearest valid ground.
                        // For simplicity here, if it's not a valid step, we effectively collide "flat"
                        // This is tricky: if we just set Y to obstacle.aabb.max.y we might pop up onto high things
                        // if horizontal check was insufficient.
                        // Let's assume if it's not a step, and we are moving down, we just stop vertical motion for now.
                        // The horizontal should prevent going through.
                         if (this.characterState.velocity.x === 0 && this.characterState.velocity.z === 0) {
                             // If stopped horizontally, and colliding vertically downwards with something too high to step on.
                             // This means we are likely at the base of a wall.
                             // Don't change Y from horizontally resolved + current Y velocity unless it's a valid step.
                             // Effectively, just stop downward velocity for this obstacle.
                            // Reset to current BaseY if below it.
                            if (finalProposedPos.y < this.characterState.baseY) {
                                finalProposedPos.y = this.characterState.baseY; // Or obstacle.aabb.max.y if that's higher and character on it.
                                onGroundThisFrame = true; // Assume on ground
                            }
                         }
                         // If still moving horizontally, allow the proposed Y unless it takes us through floor
                    }
                    this.characterState.velocity.y = 0; // Stop Y movement downwards
                } else { // Moving Up (hit head)
                    finalProposedPos.y = obstacle.aabb.min.y - collisionCharacterHeight - epsilon;
                    this.characterState.jumpVelocity = 0; 
                    this.characterState.velocity.y = 0; // Stop Y movement upwards
                }
                 tempCharAABB.min.y = finalProposedPos.y; // Update AABB for subsequent checks in loop if any
                 tempCharAABB.max.y = finalProposedPos.y + collisionCharacterHeight;
                // No break here, allow multiple Y collisions to resolve to highest point if overlapping.
            }
        }

        this.characterGroup.position.copy(finalProposedPos);

        // Update collision helper visualization
        if (this.characterCollisionHelper) {
            this.characterCollisionHelper.box.set(
                new THREE.Vector3(finalProposedPos.x - characterHalfWidth, finalProposedPos.y, finalProposedPos.z - characterHalfWidth),
                new THREE.Vector3(finalProposedPos.x + characterHalfWidth, finalProposedPos.y + collisionCharacterHeight, finalProposedPos.z + characterHalfWidth)
            );
        }

        // Final ground clamping / landing
        if (!this.characterState.isJumping && !onGroundThisFrame) {
            if (this.characterGroup.position.y < this.characterState.baseY) {
                this.characterGroup.position.y = this.characterState.baseY;
                this.characterState.velocity.y = 0;
            }
        }
        if (this.characterState.isJumping && this.characterGroup.position.y <= this.characterState.baseY && this.characterState.velocity.y <= 0) {
            this.characterGroup.position.y = this.characterState.baseY;
            this.characterState.isJumping = false;
            this.characterState.jumpVelocity = 0;
            this.characterState.velocity.y = 0;
        }
        
        this.characterState.x = this.characterGroup.position.x;
        this.characterState.y = this.characterGroup.position.y;
        this.characterState.z = this.characterGroup.position.z;
        
        if (this.characterState.isWalking) {
            this.characterState.walkTime += deltaTime * this.characterState.walkSpeed;
            this.animateWalk(this.characterState.walkTime, this.characterState.walkAmplitude);
        } else if (this.characterState.isIdle) {
            this.characterState.idleAnimationTime += deltaTime * this.characterState.idleAnimationSpeed;
            this.animateIdle(this.characterState.idleAnimationTime, this.characterState.shouldWaveArm); 
        } else { 
            this.setNeutralPose();
        }

        if (Object.keys(keys).length > 0) { 
             for (let i = this.vinyls.length - 1; i >= 0; i--) {
                 const vinyl = this.vinyls[i];
                 if (!vinyl.update(deltaTime)) { 
                     this.vinyls.splice(i, 1); 
                 }
             }
        }
        
        if (this.activeSpeechBubble && camera) {
            const headWorldPosition = new THREE.Vector3();
            const headMesh = this.characterGroup.getObjectByName('head');
            if (headMesh) {
                headMesh.getWorldPosition(headWorldPosition);
                headWorldPosition.y += 0.45; 
                this.activeSpeechBubble.update(headWorldPosition, camera);
            } else {
                const charPos = this.characterGroup.position.clone();
                charPos.y += 1.8;
                this.activeSpeechBubble.update(charPos, camera);
            }
        }
    }


    animateWalk(walkTime, amplitude) {
        const armAngle = Math.sin(walkTime) * amplitude;
        const legAngle = Math.sin(walkTime) * amplitude * 1.2; 

        if (this.leftArm) {
            this.leftArm.rotation.x = -armAngle;
            this.leftArm.rotation.z = 0.03 + Math.sin(walkTime * 0.6) * 0.02; 
        }
        if (this.rightArm) {
            this.rightArm.rotation.x = armAngle;
            this.rightArm.rotation.z = -0.03 - Math.sin(walkTime * 0.6) * 0.02;
        }

        const legBaseLocalY = -0.19; 
        const shoeBaseLocalY = -0.66;
        const legBobAmplitude = 0.015; 

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
                this.rightArm.rotation.z = -0.08 - waveAngle; 
                this.rightArm.rotation.x = -0.6 + Math.sin(idleTime * 1.2) * 0.35; 
                this.leftArm.rotation.x = Math.sin(idleTime * 0.4) * 0.02; 
                this.leftArm.rotation.z = 0.08;
            } else { 
                const idleArmAngle = Math.sin(idleTime * 0.35) * 0.015; 
                this.leftArm.rotation.x = idleArmAngle;
                this.rightArm.rotation.x = -idleArmAngle;
                this.leftArm.rotation.z = 0.06 + Math.sin(idleTime * 0.2) * 0.01; 
                this.rightArm.rotation.z = -0.06 - Math.sin(idleTime * 0.2) * 0.01;
            }
        }
        
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

        if (this.leftArm) this.leftArm.rotation.set(0, 0, 0.08); 
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
        const worldDir = new THREE.Vector3();
        this.characterGroup.getWorldDirection(worldDir); 
        worldDir.negate();

        const armWorldPos = new THREE.Vector3();
        const headMesh = this.characterGroup.getObjectByName('head');
        if (headMesh) {
            headMesh.getWorldPosition(armWorldPos);
            armWorldPos.y -= 0.3; 
        } else { 
            this.characterGroup.getWorldPosition(armWorldPos);
            armWorldPos.y += 0.8; 
        }

        const spawnOffset = worldDir.clone().multiplyScalar(0.4); 
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