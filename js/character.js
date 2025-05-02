import * as THREE from 'three';
import { createStandardMaterial, createBoxGeometry } from './utils.js';
import { Vinyl } from './vinyl.js';
import { SpeechBubble } from './speechBubble.js';
import { Box3 } from 'three'; // Import Box3

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
        console.log(`${this.name} added to scene:`, scene.uuid);
    }

    createCharacter() {
        // Create character group
        this.characterGroup = new THREE.Group();
        this.characterGroup.name = this.name; // Assign name to group
        
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
        this.leftArm = leftArm; // Store reference
        this.characterGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.32, 0.6, 0);
        rightArm.rotation.z = -0.1;
        rightArm.name = 'rightArm';
        this.rightArm = rightArm; // Store reference
        this.characterGroup.add(rightArm);
        
        // Legs - skinny jeans style
        const legGeometry = createBoxGeometry(0.18, 0.7, 0.18); // Thinner legs
        const legMaterial = createStandardMaterial(0x000000, 0.9);
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.12, -0.15, 0);
        leftLeg.rotation.x = 0.1;
        leftLeg.name = 'leftLeg';
        this.leftLeg = leftLeg; // Store reference
        this.characterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.12, -0.15, 0);
        rightLeg.rotation.x = -0.1;
        rightLeg.name = 'rightLeg';
        this.rightLeg = rightLeg; // Store reference
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
                lace.position.set(0, 0.08 + (i * 0.03), 0.2);
                lace.rotation.x = -0.1;
                sneakerGroup.add(lace);
            }

            // Tongue
            const tongueGeometry = createBoxGeometry(0.18, 0.1, 0.05);
            const tongueMaterial = createStandardMaterial(0x333333, 0.9);
            const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
            tongue.position.set(0, 0.12, 0.16); 
            tongue.rotation.x = -0.5;
            sneakerGroup.add(tongue);
            
            // Heel tab
            const heelGeometry = createBoxGeometry(0.15, 0.1, 0.05);
            const heelMaterial = createStandardMaterial(0x444444, 0.9);
            const heel = new THREE.Mesh(heelGeometry, heelMaterial);
            heel.position.set(0, 0.1, -0.2);
            heel.rotation.x = 0.3;
            sneakerGroup.add(heel);
            
            return sneakerGroup;
        };

        this.leftShoe = createSneaker(true);
        this.leftShoe.position.set(-0.12, -0.7, 0.1);
        this.leftShoe.rotation.x = 0.1;
        this.leftShoe.name = 'leftShoe';
        this.characterGroup.add(this.leftShoe);

        this.rightShoe = createSneaker(false);
        this.rightShoe.position.set(0.12, -0.7, 0.1);
        this.rightShoe.rotation.x = -0.1;
        this.rightShoe.name = 'rightShoe';
        this.characterGroup.add(this.rightShoe);
        
        // Add character to scene with adjusted base height
        this.characterGroup.position.set(0, 1.1, 0);
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
            baseY: 1.0, // Ground level
            // Animation states
            walkTime: 0,
            walkSpeed: 10,
            walkAmplitude: 0.3,
            isWalking: false,
            isIdle: true,
            idleAnimationTime: Math.random() * Math.PI * 2, 
            idleAnimationSpeed: 0.5 + Math.random() * 0.5,
            shouldWaveArm: false, // Controlled by NPC logic or player input if desired
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

        // REMOVED: Add character to scene with adjusted base height
        // this.characterGroup.position.set(0, 1.1, 0); 
    }

    // Helper method to get the character's AABB
    getAABB() {
        if (!this._aabb) {
            this._aabb = new THREE.Box3();
        }
        // Slightly adjust AABB if needed for better collision detection
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        this.characterGroup.children[0].geometry.computeBoundingBox(); // Assuming body is first child
        this._aabb.copy(this.characterGroup.children[0].geometry.boundingBox).applyMatrix4(this.characterGroup.matrixWorld);
        
        // Optional: Expand the box slightly for safety margin
        // this._aabb.expandByScalar(0.1);
        return this._aabb;
    }
    
    update(deltaTime, keys, camera, obstacles = [], portals = []) {
        // --- Player Input Processing --- 
        const moveDirection = new THREE.Vector3(0, 0, 0);
        let isPlayerMoving = false; // Use a local variable for input check
        let playerWantsToShoot = false;

        // Check movement keys (Only apply if this instance is player-controlled - NPCs pass empty keys)
        if (keys['ArrowUp']) {
            moveDirection.z -= 1;
            isPlayerMoving = true;
        }
        if (keys['ArrowDown']) {
            moveDirection.z += 1;
            isPlayerMoving = true;
        }
        if (keys['ArrowLeft']) {
            moveDirection.x -= 1;
            isPlayerMoving = true;
        }
        if (keys['ArrowRight']) {
            moveDirection.x += 1;
            isPlayerMoving = true;
        }

        // Check shoot key
        const now = performance.now() / 1000;
        if (keys['KeyE'] && (now - this.lastShootTime > this.shootCooldown)) {
             playerWantsToShoot = true;
        }

        // --- Update Velocity based on Input (if player) --- 
        if (Object.keys(keys).length > 0) { // Assume player if keys are passed
            if (isPlayerMoving) {
                moveDirection.normalize();
                const moveVelocity = moveDirection.multiplyScalar(this.characterState.moveSpeed);
                // Smoothly interpolate horizontal velocity
                this.characterState.velocity.x = THREE.MathUtils.lerp(this.characterState.velocity.x, moveVelocity.x, 0.1);
                this.characterState.velocity.z = THREE.MathUtils.lerp(this.characterState.velocity.z, moveVelocity.z, 0.1);
                 // Update rotation based on input direction
                 this.characterState.rotation = Math.atan2(moveDirection.x, moveDirection.z);
                 this.characterGroup.rotation.y = this.characterState.rotation;
            } else {
                 // Smoothly dampen horizontal velocity if no movement input
                 this.characterState.velocity.x = THREE.MathUtils.lerp(this.characterState.velocity.x, 0, 0.1);
                 this.characterState.velocity.z = THREE.MathUtils.lerp(this.characterState.velocity.z, 0, 0.1);
            }
            
            // Set animation state flags based on player input
             this.characterState.isWalking = isPlayerMoving && !this.characterState.isJumping;
             this.characterState.isIdle = !isPlayerMoving && !this.characterState.isJumping;

             // Handle Shooting based on input
              if (playerWantsToShoot) {
                  this.lastShootTime = now;
                  this.shootVinyl();
                  if (this.chatSystem) { 
                      this.chatSystem.addPlayerMessage("Flinging a disc!");
                  } else {
                      console.warn("Character: chatSystem not available to send message.");
                  }
             }
        } 
        // ELSE: If no keys are passed (NPC call), assume velocity/rotation/state is handled externally
        
        // --- Apply Gravity (Applies to both Player and NPC) --- 
        if (this.characterState.isJumping) {
            this.characterState.jumpVelocity += this.characterState.gravity * deltaTime;
            this.characterState.velocity.y = this.characterState.jumpVelocity;
        } else {
            // Apply a small downward force when on ground to ensure contact/trigger landing
            this.characterState.velocity.y = -1; 
        }

        // --- Collision Detection and Resolution (Applies to both Player and NPC) --- 
        const currentPosition = this.characterGroup.position.clone();
        // Use the current velocity (set by player input or NPC logic)
        let proposedPosition = currentPosition.clone().add(this.characterState.velocity.clone().multiplyScalar(deltaTime)); 
        
        const characterAABB = this.getAABB().translate(proposedPosition.clone().sub(currentPosition));
        let collisionOccurred = false;
        let verticalCollision = false;
        let landedThisFrame = false;

        obstacles.forEach(obstacle => {
             if (characterAABB.intersectsBox(obstacle.aabb)) {
                 collisionOccurred = true;
                 
                 // Resolve Y collision first
                 const tempAABB_Y = this.getAABB().translate(new THREE.Vector3(0, proposedPosition.y - currentPosition.y, 0));
                 if (tempAABB_Y.intersectsBox(obstacle.aabb)) {
                      verticalCollision = true;
                      if (this.characterState.velocity.y <= 0) { // Moving down
                           landedThisFrame = true;
                           this.characterState.isJumping = false;
                           this.characterState.jumpVelocity = 0;
                           this.characterState.velocity.y = 0;
                           proposedPosition.y = obstacle.aabb.max.y + (currentPosition.y - this.getAABB().min.y);
                           this.characterState.baseY = proposedPosition.y;
                      } else { // Moving up (Hit head)
                           this.characterState.jumpVelocity = 0;
                           this.characterState.velocity.y = 0;
                           proposedPosition.y = obstacle.aabb.min.y - (this.getAABB().max.y - currentPosition.y) - 0.01;
                      }
                 }

                 // Resolve X collision if no vertical collision resolved movement
                 const tempAABB_X = this.getAABB().translate(new THREE.Vector3(proposedPosition.x - currentPosition.x, 0, 0));
                 // Check intersection *only if Y didn't cause a landing this frame*
                 // Or, allow X/Z resolution even if landed? Let's allow it for now.
                 if (tempAABB_X.intersectsBox(obstacle.aabb)) { 
                     this.characterState.velocity.x = 0;
                     if (proposedPosition.x > currentPosition.x) { // Moving right
                          proposedPosition.x = obstacle.aabb.min.x - (this.getAABB().max.x - currentPosition.x) - 0.01;
                     } else { // Moving left
                          proposedPosition.x = obstacle.aabb.max.x + (currentPosition.x - this.getAABB().min.x) + 0.01;
                     }
                 }
                 
                 // Resolve Z collision if no vertical collision resolved movement
                 const tempAABB_Z = this.getAABB().translate(new THREE.Vector3(0, 0, proposedPosition.z - currentPosition.z));
                 if (tempAABB_Z.intersectsBox(obstacle.aabb)) { 
                     this.characterState.velocity.z = 0;
                     if (proposedPosition.z > currentPosition.z) { // Moving forward (relative)
                          proposedPosition.z = obstacle.aabb.min.z - (this.getAABB().max.z - currentPosition.z) - 0.01;
                     } else { // Moving backward (relative)
                          proposedPosition.z = obstacle.aabb.max.z + (currentPosition.z - this.getAABB().min.z) + 0.01;
                     }
                 }
             }
        });

        // Apply the potentially adjusted proposed position
        this.characterGroup.position.copy(proposedPosition);

        // Final ground check / prevent falling through floor
        // Use baseY determined by collision or default
        if (this.characterGroup.position.y < this.characterState.baseY && !this.characterState.isJumping && !verticalCollision) {
            this.characterGroup.position.y = this.characterState.baseY;
            this.characterState.velocity.y = 0;
            if (this.characterState.isJumping) { // Landed on ground
                 landedThisFrame = true; 
                 this.characterState.isJumping = false;
                 this.characterState.jumpVelocity = 0;
            }
        }
        
        // Update internal state position from final group position
        this.characterState.x = this.characterGroup.position.x;
        this.characterState.y = this.characterGroup.position.y;
        this.characterState.z = this.characterGroup.position.z;
        
        // --- Update Animations (Based on current state flags) --- 
        // State flags (isWalking, isIdle) are now set EITHER by player input OR by NPC logic before super.update()
        if (this.characterState.isWalking) {
            this.characterState.walkTime += deltaTime * this.characterState.walkSpeed;
            this.animateWalk(this.characterState.walkTime, this.characterState.walkAmplitude);
        } else if (this.characterState.isIdle) {
             // Reset walk time when starting idle?
             // this.characterState.walkTime = 0;
            this.characterState.idleAnimationTime += deltaTime * this.characterState.idleAnimationSpeed;
            // Use the shouldWaveArm state which might be set by NPC
            this.animateIdle(this.characterState.idleAnimationTime, this.characterState.shouldWaveArm); 
        } else { // Jumping or falling
            this.setNeutralPose(); // Or a specific jump/fall pose
        }

        // --- Update Vinyls (Applies to Player only, NPCs don't shoot) --- 
         if (Object.keys(keys).length > 0) { // Only update vinyls for player character
             for (let i = this.vinyls.length - 1; i >= 0; i--) {
                 const vinyl = this.vinyls[i];
                 vinyl.update(deltaTime);
                 if (!vinyl.isActive) {
                     this.scene.remove(vinyl.mesh);
                     this.vinyls.splice(i, 1);
                 }
             }
         }
        
        // --- Update Speech Bubble (Applies to both Player and NPC) --- 
        if (this.activeSpeechBubble && camera) {
             const headPosition = this.characterGroup.position.clone();
             headPosition.y += 1.8; // Adjust height offset
             this.activeSpeechBubble.update(headPosition, camera);
        }
    }

    // --- Animation Methods --- 

    animateWalk(walkTime, amplitude) {
        if (this.leftArm && this.rightArm) {
            const armAngle = Math.sin(walkTime) * amplitude * 0.7;
            this.leftArm.rotation.x = -armAngle;
            this.rightArm.rotation.x = armAngle;
            this.leftArm.rotation.z = 0.15 + Math.sin(walkTime) * 0.1; // Side swing
            this.rightArm.rotation.z = -0.15 - Math.sin(walkTime) * 0.1;
        }
        if (this.leftLeg && this.rightLeg) {
            const legAngle = Math.sin(walkTime) * amplitude;
            this.leftLeg.rotation.x = legAngle + 0.1;
            this.rightLeg.rotation.x = -legAngle - 0.1;
            // Subtle up/down motion for legs
            this.leftLeg.position.y = -0.15 + Math.abs(Math.sin(walkTime)) * 0.05;
            this.rightLeg.position.y = -0.15 + Math.abs(Math.sin(walkTime + Math.PI)) * 0.05;
        }
         if (this.leftShoe && this.rightShoe) {
            const legAngle = Math.sin(walkTime) * amplitude;
            this.leftShoe.rotation.x = legAngle + 0.1;
            this.rightShoe.rotation.x = -legAngle - 0.1;
            // Match shoe position y to leg position y
            this.leftShoe.position.y = -0.7 + Math.abs(Math.sin(walkTime)) * 0.05;
            this.rightShoe.position.y = -0.7 + Math.abs(Math.sin(walkTime + Math.PI)) * 0.05;
            // Add z movement for shoes
            this.leftShoe.position.z = 0.1 + Math.sin(walkTime) * 0.1;
            this.rightShoe.position.z = 0.1 + Math.sin(walkTime + Math.PI) * 0.1;
        }
    }

    animateIdle(idleTime, shouldWave) {
         if (this.leftArm && this.rightArm) {
             if (shouldWave) {
                 // Wave animation for right arm (example)
                 const waveAngle = Math.sin(idleTime * 2) * 0.8; // Faster, wider wave
                 this.rightArm.rotation.z = -0.15 - waveAngle;
                 this.rightArm.rotation.x = -0.5 + Math.sin(idleTime) * 0.3;
                 // Keep left arm relatively still
                 this.leftArm.rotation.x = Math.sin(idleTime * 0.5) * 0.05;
                 this.leftArm.rotation.z = 0.15;
             } else {
                 // Subtle breathing/idle movement
                 const idleAngle = Math.sin(idleTime * 0.5) * 0.05; 
                 this.leftArm.rotation.x = idleAngle;
                 this.rightArm.rotation.x = -idleAngle;
                 this.leftArm.rotation.z = 0.15 + Math.sin(idleTime * 0.3) * 0.03; // Very subtle side sway
                 this.rightArm.rotation.z = -0.15 - Math.sin(idleTime * 0.3) * 0.03;
             }
         }
         // Keep legs relatively still during idle
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
            this.leftShoe.position.z = 0.1;
            this.rightShoe.position.z = 0.1;
        }
    }

    setNeutralPose() {
        // Reset arms and legs to a neutral position (e.g., slightly bent)
        if (this.leftArm) this.leftArm.rotation.set(0, 0, 0.1);
        if (this.rightArm) this.rightArm.rotation.set(0, 0, -0.1);
        if (this.leftLeg) {
             this.leftLeg.rotation.set(0.1, 0, 0);
             this.leftLeg.position.y = -0.15;
        }
        if (this.rightLeg) {
            this.rightLeg.rotation.set(-0.1, 0, 0);
            this.rightLeg.position.y = -0.15;
        }
        if (this.leftShoe) {
            this.leftShoe.rotation.set(0.1, 0, 0);
            this.leftShoe.position.y = -0.7;
            this.leftShoe.position.z = 0.1;
        }
         if (this.rightShoe) {
            this.rightShoe.rotation.set(-0.1, 0, 0);
            this.rightShoe.position.y = -0.7;
            this.rightShoe.position.z = 0.1;
        }
    }

    // --- Other Methods --- 

    shootVinyl() {
        const direction = new THREE.Vector3();
        this.characterGroup.getWorldDirection(direction);
        
        // Spawn vinyl slightly in front of character
        const spawnOffset = direction.clone().multiplyScalar(0.5);
        const spawnPosition = this.characterGroup.position.clone().add(spawnOffset);
        spawnPosition.y += 1.0; // Adjust vertical spawn height

        const vinyl = new Vinyl(this.scene, spawnPosition, direction);
        this.vinyls.push(vinyl);
        
        console.log("Shot vinyl!");
        // Potentially add sound effect here
    }

    getPosition() {
        return this.characterGroup.position.clone();
    }
    
    say(message) {
        // Remove existing speech bubble if any
        if (this.activeSpeechBubble) {
            this.activeSpeechBubble.remove();
        }
        
        // Create a new speech bubble with correct argument order
        this.activeSpeechBubble = new SpeechBubble(this.scene, message); 
        // Initial position update will happen in the update loop
    }
} 