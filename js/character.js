// js/character.js
import * as THREE from 'three';
import { createStandardMaterial, createBoxGeometry } from './utils.js';
import { Vinyl } from './vinyl.js';
import { SpeechBubble } from './speechBubble.js';
import { Box3 } from 'three'; // Import Box3

const CHARACTER_COLORS = {
    SKIN: 0xffdbac,
    HAIR: 0x5D3A1F, // Medium warm brown, closer to sprite
    HOODIE: 0x0A0A0A, // Very dark grey, almost black (sprite has pure black)
    PANTS: 0x030303,  // Darker than hoodie, very close to black
    SHOES_UPPER: 0x050505, // Black for shoes
    SHOES_SOLE_LACES: 0xFFFFFF,
    DRAWSTRINGS: 0xE0E0E0, // Off-white
    EYES: 0x000000,
};


export class Character {
    constructor(scene, chatSystem, name = 'Character') {
        this.scene = scene;
        this.chatSystem = chatSystem; // Store chatSystem
        this.name = name; // Store name
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
        // console.log(`${this.name} added to scene:`, scene.uuid); // Keep for debugging if needed
    }

    createCharacter() {
        // Create character group
        this.characterGroup = new THREE.Group();
        this.characterGroup.name = this.name; // Assign name to group
        
        // Body - slim hoodie
        const bodyGeometry = createBoxGeometry(0.5, 1.1, 0.3); 
        const bodyMaterial = createStandardMaterial(CHARACTER_COLORS.HOODIE, 0.8, 0.1); // Less shiny
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.55, 0); 
        body.name = 'hoodie_torso'; 
        this.characterGroup.add(body);
        
        // Hood - resting on back
        const hoodMainGeometry = createBoxGeometry(0.45, 0.4, 0.25);
        const hoodMaterial = createStandardMaterial(CHARACTER_COLORS.HOODIE, 0.8, 0.1);
        const hoodMain = new THREE.Mesh(hoodMainGeometry, hoodMaterial);
        hoodMain.position.set(0, 1.0, -0.15); 
        hoodMain.rotation.x = 0.3; 
        hoodMain.name = 'hood';
        this.characterGroup.add(hoodMain);

        const hoodTopGeometry = createBoxGeometry(0.40, 0.15, 0.2);
        const hoodTop = new THREE.Mesh(hoodTopGeometry, hoodMaterial);
        hoodTop.position.set(0, 1.20, -0.12); // Adjusted to sit better
        hoodTop.rotation.x = -0.2;
        hoodTop.name = 'hood_top_edge';
        this.characterGroup.add(hoodTop);


        // Hoodie pocket
        const pocketGeometry = createBoxGeometry(0.3, 0.2, 0.05); 
        const pocket = new THREE.Mesh(pocketGeometry, bodyMaterial);
        pocket.position.set(0, 0.30, 0.155); 
        pocket.name = 'pocket';
        this.characterGroup.add(pocket);

        // Hoodie drawstrings - longer and more visible
        const drawstringGeometry = createBoxGeometry(0.025, 0.25, 0.025); 
        const drawstringMaterial = createStandardMaterial(CHARACTER_COLORS.DRAWSTRINGS, 0.9);
        
        const leftDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        leftDrawstring.position.set(-0.08, 0.95, 0.13); // Slightly higher origin for hanging
        leftDrawstring.rotation.z = 0.05; // Less angled
        leftDrawstring.rotation.x = 0.05;
        this.characterGroup.add(leftDrawstring);
        
        const rightDrawstring = new THREE.Mesh(drawstringGeometry, drawstringMaterial);
        rightDrawstring.position.set(0.08, 0.95, 0.13); 
        rightDrawstring.rotation.z = -0.05;
        rightDrawstring.rotation.x = 0.05;
        this.characterGroup.add(rightDrawstring);
        
        // Head
        const headGeometry = createBoxGeometry(0.32, 0.38, 0.32); 
        const headMaterial = createStandardMaterial(CHARACTER_COLORS.SKIN, 0.9);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.23, 0); 
        head.name = 'head';
        this.characterGroup.add(head);
        
        // Eyes - simple black dots/rectangles
        const eyeGeometry = createBoxGeometry(0.07, 0.08, 0.03); 
        const eyeMaterial = createStandardMaterial(CHARACTER_COLORS.EYES, 1.0); // Pure black, no shine
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 1.30, 0.155); // Forward on Z
        leftEye.name = 'leftEye';
        this.characterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 1.30, 0.155); 
        rightEye.name = 'rightEye';
        this.characterGroup.add(rightEye);

        // Eyebrows - subtle, matching hair color
        const eyebrowGeometry = createBoxGeometry(0.1, 0.025, 0.02);
        const eyebrowMaterial = createStandardMaterial(CHARACTER_COLORS.HAIR, 0.9);
        
        const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        leftEyebrow.position.set(-0.08, 1.38, 0.158); 
        leftEyebrow.rotation.z = -0.05; 
        leftEyebrow.name = 'leftEyebrow';
        this.characterGroup.add(leftEyebrow);
        
        const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        rightEyebrow.position.set(0.08, 1.38, 0.158);
        rightEyebrow.rotation.z = 0.05;
        rightEyebrow.name = 'rightEyebrow';
        this.characterGroup.add(rightEyebrow);

        // Nose - simple angular shape
        const noseGeometry = createBoxGeometry(0.04, 0.06, 0.04);
        // Slightly darker skin for nose shadow/definition
        const noseMaterial = createStandardMaterial(new THREE.Color(CHARACTER_COLORS.SKIN).multiplyScalar(0.9), 0.9);
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.28, 0.16); 
        nose.name = 'nose';
        this.characterGroup.add(nose);
        
        // Hair - Reworked to match sprite (short sides, voluminous top swept to side)
        const hairMaterial = createStandardMaterial(CHARACTER_COLORS.HAIR, 0.85, 0.15);

        // Top hair main mass (slightly to character's right for sweep)
        const hairTopMainGeom = createBoxGeometry(0.28, 0.22, 0.26);
        const hairTopMain = new THREE.Mesh(hairTopMainGeom, hairMaterial);
        hairTopMain.position.set(0.03, 1.49, -0.03); // Y = top of head + half hair height
        hairTopMain.rotation.y = -0.05;
        hairTopMain.name = 'hair_top_main';
        this.characterGroup.add(hairTopMain);
        
        // Front fringe part of the sweep (more to character's right)
        const hairFringeGeom = createBoxGeometry(0.24, 0.18, 0.12);
        const hairFringe = new THREE.Mesh(hairFringeGeom, hairMaterial);
        hairFringe.position.set(0.06, 1.46, 0.10); // In front, slightly lower, offset right
        hairFringe.rotation.x = -0.15;
        hairFringe.rotation.y = -0.2;
        hairFringe.rotation.z = -0.1;
        hairFringe.name = 'hair_fringe';
        this.characterGroup.add(hairFringe);

        // Left Hair Side (character's left)
        const hairSideLeftGeom = createBoxGeometry(0.05, 0.20, 0.20);
        const hairSideLeft = new THREE.Mesh(hairSideLeftGeom, hairMaterial);
        hairSideLeft.position.set(-0.165, 1.32, -0.04); // Against head side
        hairSideLeft.name = 'hair_side_left';
        this.characterGroup.add(hairSideLeft);

        // Right Hair Side (character's right)
        const hairSideRightGeom = createBoxGeometry(0.05, 0.18, 0.18); // Slightly shorter for asymmetry
        const hairSideRight = new THREE.Mesh(hairSideRightGeom, hairMaterial);
        hairSideRight.position.set(0.165, 1.31, -0.04);
        hairSideRight.name = 'hair_side_right';
        this.characterGroup.add(hairSideRight);

        // Hair Back
        const hairBackGeom = createBoxGeometry(0.30, 0.20, 0.07); 
        const hairBack = new THREE.Mesh(hairBackGeom, hairMaterial);
        hairBack.position.set(0, 1.33, -0.155); // Back of the head
        hairBack.name = 'hair_back';
        this.characterGroup.add(hairBack);
        
        // Arms
        const armGeometry = createBoxGeometry(0.12, 0.55, 0.12); 
        const armMaterial = createStandardMaterial(CHARACTER_COLORS.HOODIE, 0.8, 0.1); 
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.31, 0.52, 0); 
        leftArm.rotation.z = 0.1;
        leftArm.name = 'leftArm';
        this.leftArm = leftArm;
        this.characterGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.31, 0.52, 0);
        rightArm.rotation.z = -0.1;
        rightArm.name = 'rightArm';
        this.rightArm = rightArm;
        this.characterGroup.add(rightArm);
        
        // Legs - skinny jeans style
        const legGeometry = createBoxGeometry(0.15, 0.75, 0.15); 
        const legMaterial = createStandardMaterial(CHARACTER_COLORS.PANTS, 0.85, 0.05); // Very slightly different from hoodie
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.1, -0.175, 0); 
        leftLeg.name = 'leftLeg';
        this.leftLeg = leftLeg;
        this.characterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.1, -0.175, 0);
        rightLeg.name = 'rightLeg';
        this.rightLeg = rightLeg;
        this.characterGroup.add(rightLeg);
        
        // Shoes - simplified to match sprite (low-top classic sneaker)
        const createClassicSneaker = () => {
            const sneakerGroup = new THREE.Group();
            
            // Main shoe body (upper)
            const upperGeometry = createBoxGeometry(0.22, 0.12, 0.38); 
            const upperMaterial = createStandardMaterial(CHARACTER_COLORS.SHOES_UPPER, 0.9);
            const upper = new THREE.Mesh(upperGeometry, upperMaterial);
            upper.position.set(0, 0.0, 0.02); 
            sneakerGroup.add(upper);
            
            // Sole
            const soleGeometry = createBoxGeometry(0.24, 0.08, 0.40); 
            const soleMaterial = createStandardMaterial(CHARACTER_COLORS.SHOES_SOLE_LACES, 0.95); // White, not shiny
            const sole = new THREE.Mesh(soleGeometry, soleMaterial);
            sole.position.set(0, -0.08, 0.02); 
            sneakerGroup.add(sole);
            
            // Laces (simplified)
            const laceDetailGeometry = createBoxGeometry(0.18, 0.03, 0.05); 
            const laceMaterial = createStandardMaterial(CHARACTER_COLORS.SHOES_SOLE_LACES, 0.95);
            const laceDetail = new THREE.Mesh(laceDetailGeometry, laceMaterial);
            laceDetail.position.set(0, 0.055, 0.08); // On top front of upper
            laceDetail.rotation.x = -0.3; // Angle back slightly
            sneakerGroup.add(laceDetail);
            
            return sneakerGroup;
        };

        this.leftShoe = createClassicSneaker();
        // Position: leg bottom Y (-0.175 - 0.75/2 = -0.55) minus half of shoe effective height
        // Shoe "effective" center Y relative to its group origin: -0.08 (sole pos) + 0 (sole y center) = -0.08 from shoe group origin.
        // Total shoe height approx 0.12 (upper) + 0.08 (sole) = 0.2. Lowest point -0.12.
        // Position Y: -0.55 (leg bottom) - 0.12 (shoe height above ground) = -0.67 (approx for shoe group origin)
        this.leftShoe.position.set(-0.1, -0.63, 0.05); // (leg Y - leg_h/2) - (shoe_group_y_offset + shoe_sole_h/2)
        this.leftShoe.name = 'leftShoe';
        this.characterGroup.add(this.leftShoe);

        this.rightShoe = createClassicSneaker();
        this.rightShoe.position.set(0.1, -0.63, 0.05);
        this.rightShoe.name = 'rightShoe';
        this.characterGroup.add(this.rightShoe);
        
        // Character group base position for feet at Y=0
        // Lowest point of shoe is at its local Y position (-0.08 for sole) - sole height/2 (0.04) = -0.12
        // So, if shoe group is at -0.63, absolute lowest point is -0.63 - 0.12 = -0.75
        this.characterGroup.position.set(0, 0.75, 0);
    }

    setupState() {
        this.characterState = {
            x: this.characterGroup.position.x,
            y: this.characterGroup.position.y,
            z: this.characterGroup.position.z,
            rotation: 0,
            moveSpeed: 5,
            jumpForce: 8,
            gravity: -15,
            velocity: new THREE.Vector3(),
            isJumping: false,
            jumpVelocity: 0,
            baseY: this.characterGroup.position.y, 
            walkTime: 0,
            walkSpeed: 10,
            walkAmplitude: 0.2, 
            isWalking: false,
            isIdle: true,
            idleAnimationTime: Math.random() * Math.PI * 2, 
            idleAnimationSpeed: 0.5 + Math.random() * 0.5,
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

        if (Object.keys(keys).length > 0) { // Assume player if keys are passed
            if (isPlayerMoving) {
                moveDirection.normalize();
                const moveVelocity = moveDirection.multiplyScalar(this.characterState.moveSpeed);
                this.characterState.velocity.x = THREE.MathUtils.lerp(this.characterState.velocity.x, moveVelocity.x, 0.1);
                this.characterState.velocity.z = THREE.MathUtils.lerp(this.characterState.velocity.z, moveVelocity.z, 0.1);
                this.characterState.rotation = Math.atan2(moveDirection.x, moveDirection.z);
                this.characterGroup.rotation.y = this.characterState.rotation;
            } else {
                 this.characterState.velocity.x = THREE.MathUtils.lerp(this.characterState.velocity.x, 0, 0.1);
                 this.characterState.velocity.z = THREE.MathUtils.lerp(this.characterState.velocity.z, 0, 0.1);
            }
            
            this.characterState.isWalking = isPlayerMoving && !this.characterState.isJumping;
            this.characterState.isIdle = !isPlayerMoving && !this.characterState.isJumping;

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
            // Apply a small downward force for ground detection, or integrate gravity better
             if (this.characterGroup.position.y > this.characterState.baseY) { // If above base, apply gravity
                 this.characterState.velocity.y += this.characterState.gravity * deltaTime * 0.1; // Softer gravity when just falling to ground
             } else {
                this.characterState.velocity.y = -1; // Ensure contact or small push for collision
             }
        }

        const currentPosition = this.characterGroup.position.clone();
        let proposedPosition = currentPosition.clone().add(this.characterState.velocity.clone().multiplyScalar(deltaTime)); 
        
        let collisionOccurred = false;
        let verticalCollision = false;
        
        // Sprite total height is ~130px. If head is ~25px, body ~45px, legs ~60px.
        // Our 3D model has roughly: head 0.38, body 1.1, leg 0.75, shoe 0.12 => ~2.35 units.
        // Sprite appears to be about 1 head wide. Our head is 0.32 wide.
        const collisionCharacterHeight = 1.95; // From feet on ground to top of head (approx)
        const collisionCharacterWidth = 0.4;  // Adjusted for slimmer profile

        obstacles.forEach(obstacle => {
            // Character's AABB for collision checking is centered at character's feet XZ, and Y extends upwards
            const checkMinY = proposedPosition.y; // Bottom of collision box is at feet
            const checkMaxY = proposedPosition.y + collisionCharacterHeight; // Top of collision box

            const collisionMin = new THREE.Vector3(
                proposedPosition.x - collisionCharacterWidth / 2, 
                checkMinY, 
                proposedPosition.z - collisionCharacterWidth / 2
            );
            const collisionMax = new THREE.Vector3(
                proposedPosition.x + collisionCharacterWidth / 2, 
                checkMaxY, 
                proposedPosition.z + collisionCharacterWidth / 2
            );
            const collisionCheckAABB = new THREE.Box3(collisionMin, collisionMax);

             if (collisionCheckAABB.intersectsBox(obstacle.aabb)) {
                 collisionOccurred = true;
                 const yCenterForCheck = currentPosition.clone(); // Use current for Y projection test
                 yCenterForCheck.y = proposedPosition.y + (collisionCharacterHeight / 2);
                 const tempAABB_Y = new THREE.Box3().setFromCenterAndSize(yCenterForCheck, new THREE.Vector3(collisionCharacterWidth, collisionCharacterHeight, collisionCharacterWidth));
                 
                 if (tempAABB_Y.intersectsBox(obstacle.aabb)) {
                      verticalCollision = true;
                      if (this.characterState.velocity.y <= 0) { 
                           this.characterState.isJumping = false;
                           this.characterState.jumpVelocity = 0;
                           this.characterState.velocity.y = 0;
                           proposedPosition.y = obstacle.aabb.max.y; 
                           this.characterState.baseY = proposedPosition.y;
                      } else { 
                           this.characterState.jumpVelocity = 0;
                           this.characterState.velocity.y = 0;
                           proposedPosition.y = obstacle.aabb.min.y - collisionCharacterHeight - 0.01;
                      }
                 }

                 const characterSize = new THREE.Vector3(collisionCharacterWidth, collisionCharacterHeight, collisionCharacterWidth);
                 
                 const xCenterForCheck = currentPosition.clone();
                 xCenterForCheck.x = proposedPosition.x;
                 xCenterForCheck.y = proposedPosition.y + collisionCharacterHeight / 2; // Use already Y-resolved position
                 const tempAABB_X = new THREE.Box3().setFromCenterAndSize(xCenterForCheck, characterSize);
                 if (tempAABB_X.intersectsBox(obstacle.aabb)) {
                     this.characterState.velocity.x = 0;
                     if (proposedPosition.x > currentPosition.x) {
                          proposedPosition.x = obstacle.aabb.min.x - (characterSize.x / 2) - 0.01;
                     } else {
                          proposedPosition.x = obstacle.aabb.max.x + (characterSize.x / 2) + 0.01;
                     }
                 }

                 const zCenterForCheck = currentPosition.clone();
                 zCenterForCheck.z = proposedPosition.z;
                 zCenterForCheck.y = proposedPosition.y + collisionCharacterHeight / 2; // Use already Y-resolved position
                 const tempAABB_Z = new THREE.Box3().setFromCenterAndSize(zCenterForCheck, characterSize);
                 if (tempAABB_Z.intersectsBox(obstacle.aabb)) {
                     this.characterState.velocity.z = 0;
                     if (proposedPosition.z > currentPosition.z) { 
                          proposedPosition.z = obstacle.aabb.min.z - (characterSize.z / 2) - 0.01;
                     } else { 
                          proposedPosition.z = obstacle.aabb.max.z + (characterSize.z / 2) + 0.01;
                     }
                 }
             }
        });

        this.characterGroup.position.copy(proposedPosition);

        if (this.characterGroup.position.y < this.characterState.baseY && !this.characterState.isJumping && !verticalCollision) {
            this.characterGroup.position.y = this.characterState.baseY;
            this.characterState.velocity.y = 0;
            if (this.characterState.isJumping) { // Landed
                 this.characterState.isJumping = false;
                 this.characterState.jumpVelocity = 0;
            }
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
        } else { // Jumping or falling
            this.setNeutralPose();
        }

         if (Object.keys(keys).length > 0) { // Only update vinyls for player
             for (let i = this.vinyls.length - 1; i >= 0; i--) {
                 const vinyl = this.vinyls[i];
                 vinyl.update(deltaTime); // This should return false if vinyl is inactive or handle its own scene removal
                 if (!vinyl.isActive) { // Vinyl handles its own disposal
                     this.vinyls.splice(i, 1);
                 }
             }
         }
        
        if (this.activeSpeechBubble && camera) {
            const headWorldPosition = new THREE.Vector3();
            const headMesh = this.characterGroup.getObjectByName('head');
            if (headMesh) {
                headMesh.getWorldPosition(headWorldPosition);
                headWorldPosition.y += 0.35; // Offset above the center of the head mesh
                this.activeSpeechBubble.update(headWorldPosition, camera);
            }
        }
    }


    animateWalk(walkTime, amplitude) {
        const armAngle = Math.sin(walkTime) * amplitude;
        const legAngle = Math.sin(walkTime) * amplitude * 1.1; // Slightly more leg swing

        if (this.leftArm) {
            this.leftArm.rotation.x = -armAngle;
            this.leftArm.rotation.z = 0.05 + Math.sin(walkTime * 0.5) * 0.03; 
        }
        if (this.rightArm) {
            this.rightArm.rotation.x = armAngle;
            this.rightArm.rotation.z = -0.05 - Math.sin(walkTime * 0.5) * 0.03;
        }

        const legBaseY = -0.175; 
        const shoeBaseY = -0.63; 
        const legBobAmplitude = 0.02; // More subtle bob

        if (this.leftLeg) {
            this.leftLeg.rotation.x = legAngle;
            this.leftLeg.position.y = legBaseY + Math.abs(Math.sin(walkTime)) * legBobAmplitude;
        }
        if (this.rightLeg) {
            this.rightLeg.rotation.x = -legAngle;
            this.rightLeg.position.y = legBaseY + Math.abs(Math.sin(walkTime + Math.PI)) * legBobAmplitude;
        }

        if (this.leftShoe && this.leftLeg) {
            this.leftShoe.rotation.x = this.leftLeg.rotation.x * 0.8; // Shoes rotate slightly less than legs
            this.leftShoe.position.y = shoeBaseY + (this.leftLeg.position.y - legBaseY); 
        }
        if (this.rightShoe && this.rightLeg) {
            this.rightShoe.rotation.x = this.rightLeg.rotation.x * 0.8;
            this.rightShoe.position.y = shoeBaseY + (this.rightLeg.position.y - legBaseY);
        }
    }

    animateIdle(idleTime, shouldWave) {
         if (this.leftArm && this.rightArm) {
             if (shouldWave) {
                 const waveAngle = Math.sin(idleTime * 2) * 0.8; 
                 this.rightArm.rotation.z = -0.1 - waveAngle;
                 this.rightArm.rotation.x = -0.5 + Math.sin(idleTime) * 0.3;
                 this.leftArm.rotation.x = Math.sin(idleTime * 0.5) * 0.03;
                 this.leftArm.rotation.z = 0.1;
             } else { // Subtle breathing
                 const idleArmAngle = Math.sin(idleTime * 0.4) * 0.02; 
                 this.leftArm.rotation.x = idleArmAngle;
                 this.rightArm.rotation.x = -idleArmAngle;
                 this.leftArm.rotation.z = 0.05 + Math.sin(idleTime * 0.25) * 0.01; 
                 this.rightArm.rotation.z = -0.05 - Math.sin(idleTime * 0.25) * 0.01;
             }
         }
        const legBaseY = -0.175;
        const shoeBaseY = -0.63;

         if (this.leftLeg) { // Subtle leg sway
            this.leftLeg.rotation.x = Math.sin(idleTime * 0.15) * 0.015;
            this.leftLeg.position.y = legBaseY;
        }
        if (this.rightLeg) {
            this.rightLeg.rotation.x = -Math.sin(idleTime * 0.15) * 0.015;
            this.rightLeg.position.y = legBaseY;
        }
        if (this.leftShoe && this.leftLeg) {
            this.leftShoe.rotation.x = this.leftLeg.rotation.x;
            this.leftShoe.position.y = shoeBaseY;
        }
        if (this.rightShoe && this.rightLeg) {
            this.rightShoe.rotation.x = this.rightLeg.rotation.x;
            this.rightShoe.position.y = shoeBaseY;
        }
    }

    setNeutralPose() {
        const legBaseY = -0.175;
        const shoeBaseY = -0.63;

        if (this.leftArm) this.leftArm.rotation.set(0, 0, 0.05); // Closer to body
        if (this.rightArm) this.rightArm.rotation.set(0, 0, -0.05);
        if (this.leftLeg) {
             this.leftLeg.rotation.set(0, 0, 0);
             this.leftLeg.position.y = legBaseY;
        }
        if (this.rightLeg) {
            this.rightLeg.rotation.set(0, 0, 0);
            this.rightLeg.position.y = legBaseY;
        }
        if (this.leftShoe) {
            this.leftShoe.rotation.set(0, 0, 0);
            this.leftShoe.position.y = shoeBaseY;
        }
         if (this.rightShoe) {
            this.rightShoe.rotation.set(0, 0, 0);
            this.rightShoe.position.y = shoeBaseY;
        }
    }

    shootVinyl() {
        const direction = new THREE.Vector3();
        this.characterGroup.getWorldDirection(direction);
        direction.negate(); // Character model faces -Z, so negate for forward
        
        // Spawn vinyl from near hand/chest height
        const armWorldPos = new THREE.Vector3();
        this.rightArm.getWorldPosition(armWorldPos); // Get right arm's world position

        const spawnOffset = direction.clone().multiplyScalar(0.3); // Slightly in front
        const spawnPosition = armWorldPos.clone().add(spawnOffset);
        // spawnPosition.y adjustment might be needed if armWorldPos is too low/high.
        // The Character group origin is at feet. Right arm's local Y is 0.52.
        // So world Y of arm is charGroup.y + 0.52.
        // For a throw, we might want it a bit higher, say chest/shoulder.
        spawnPosition.y = this.characterGroup.position.y + 0.8;


        const vinyl = new Vinyl(this.scene, spawnPosition, direction);
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