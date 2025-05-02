import * as THREE from 'three';
import { Character } from './character.js';
import { Pier } from './pier.js';
import { DecorativeElements } from './decorative.js';
import { NPC } from './npc.js';
import { Billboard } from './billboard.js';
import { ChatSystem } from './chat.js';
import { Portal } from './portal.js';
import { createWaitingRoomScene } from './waitingRoom.js';

// Scene names and spawn points
const MAIN_AREA_NAME = 'mainArea';
const WAITING_ROOM_NAME = 'waitingRoom';
const mainAreaSpawnPoint = new THREE.Vector3(0, 1.0, 5);
const waitingRoomSpawnPoint = new THREE.Vector3(0, 1.0, 0);

export class EBOYIsometricPierScene {
    constructor() {
        console.log("Starting IsometricPierScene initialization...");
        
        try {
            // Scene setup
            console.log("Creating main scene...");
            this.mainScene = new THREE.Scene();
            this.mainScene.background = new THREE.Color(0x000033);
            
            // Add San Francisco fog with increased density
            console.log("Setting up fog...");
            this.mainScene.fog = new THREE.Fog(0x000033, 10, 50);
            
            // Create waiting room scene first
            console.log("Creating waiting room scene...");
            this.waitingRoomScene = createWaitingRoomScene(MAIN_AREA_NAME, mainAreaSpawnPoint);
            
            // Set current scene to main scene initially
            console.log("Setting up scene management...");
            this.currentScene = this.mainScene;
            this.activePortals = this.mainScene.userData.portals || [];
            
            // Create portal to waiting room in main scene
            console.log("Creating portal to waiting room...");
            const portalToWaitingRoomPos = new THREE.Vector3(5, 2.5, -3);
            const portalToWaitingRoom = new Portal(
                this.mainScene,
                portalToWaitingRoomPos,
                1.5,
                WAITING_ROOM_NAME,
                waitingRoomSpawnPoint
            );
            this.mainScene.userData.portals = [portalToWaitingRoom];
            this.activePortals = this.mainScene.userData.portals;
            
            // Create Matrix rain after both scenes are ready
            console.log("Creating matrix rain...");
            this.createMatrixRain();
            
            // Camera setup for isometric view
            console.log("Setting up camera...");
            const aspect = window.innerWidth / window.innerHeight;
            this.camera = new THREE.OrthographicCamera(
                -10 * aspect, 10 * aspect, 10, -10, 0.1, 1000
            );
            
            // Set camera position for isometric view
            this.camera.position.set(15, 15, 15);
            this.camera.lookAt(0, 0, 0);
            
            // Renderer setup
            console.log("Setting up renderer...");
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            
            const container = document.getElementById('scene-container');
            if (!container) {
                throw new Error('Scene container not found!');
            }
            container.appendChild(this.renderer.domElement);
            
            // Basic lighting
            console.log("Setting up lighting...");
            this.setupLighting();
            
            // Initialize chat system (no longer needs character)
            console.log("Initializing chat system...");
            this.chatSystem = new ChatSystem();

            // Create scene elements
            console.log("Creating pier...");
            this.pier = new Pier(this.mainScene);

            console.log("Creating player character...");
            // Pass chatSystem to Character
            this.character = new Character(this.mainScene, this.chatSystem);

            console.log("Creating decorative elements...");
            this.decorativeElements = new DecorativeElements(this.mainScene);

            console.log("Creating billboard...");
            this.billboard = new Billboard(this.mainScene);

            // Create NPCs
            console.log("Creating NPCs...");
            this.npcs = [];
            for (let i = 0; i < 10; i++) {
                const position = new THREE.Vector3(
                    (Math.random() - 0.5) * 38,
                    0.9,
                    (Math.random() - 0.5) * 18
                );
                // Pass chatSystem to NPC
                this.npcs.push(new NPC(this.mainScene, position, this.chatSystem, `NPC-${i + 1}`));
            }
            
            // Input handling
            console.log("Setting up input handling...");
            this.keys = {};
            window.addEventListener('keydown', (e) => this.onKeyDown(e));
            window.addEventListener('keyup', (e) => this.onKeyUp(e));
            
            // Handle window resize
            window.addEventListener('resize', () => this.onWindowResize());
            
            // Clock for frame-rate independent movement
            this.clock = new THREE.Clock();
            
            // Add the welcome message via the chat system
            this.chatSystem.addSystemMessage("Welcome to the Cyberpunk Pier! Use Arrows to move, Shift to jump, E to throw discs.");
            
            // Start animation loop
            console.log("Starting animation loop...");
            this.animate();
            
            console.log("Isometric Pier Scene successfully initialized!");
        } catch (error) {
            console.error("Error during initialization:", error);
            throw error;
        }
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
        this.mainScene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 20, 15);
        this.mainScene.add(directionalLight);
        
        // Add colored point lights for EBOY style neon effect
        const pinkLight = new THREE.PointLight(0xff00ff, 1, 10);
        pinkLight.position.set(5, 3, 5);
        this.mainScene.add(pinkLight);
        
        const cyanLight = new THREE.PointLight(0x00ffff, 1, 10);
        cyanLight.position.set(-5, 3, -5);
        this.mainScene.add(cyanLight);
        
        const greenLight = new THREE.PointLight(0x00ff00, 0.8, 8);
        greenLight.position.set(0, 2, -3);
        this.mainScene.add(greenLight);
        
        // Store lights for animation
        this.neonLights = [pinkLight, cyanLight, greenLight];
    }
    
    onKeyDown(event) {
        this.keys[event.code] = true;
        
        // Prevent default behavior for arrow keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyE'].includes(event.code)) {
            event.preventDefault();
        }
    }
    
    onKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.left = -10 * aspect;
        this.camera.right = 10 * aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    updateCamera() {
        // Camera following with isometric offset
        const cameraOffset = new THREE.Vector3(15, 15, 15);
        const characterPos = this.character.getPosition();
        const targetCameraPosition = new THREE.Vector3(
            characterPos.x + cameraOffset.x,
            cameraOffset.y,
            characterPos.z + cameraOffset.z
        );
        
        // Smoothly interpolate camera position
        this.camera.position.lerp(targetCameraPosition, 0.05);
        
        // Look at character
        this.camera.lookAt(
            characterPos.x,
            characterPos.y,
            characterPos.z
        );
    }
    
    createMatrixRain() {
        // Create particle system
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random position in a wide area - keep away from camera view at top
            positions[i3] = (Math.random() - 0.5) * 100;     // x
            positions[i3 + 1] = Math.random() * 30 + 30;    // y (start higher above scene to avoid UI)
            positions[i3 + 2] = (Math.random() - 0.5) * 100; // z
            
            // Random velocity (mostly downward with slight random movement)
            velocities[i3] = (Math.random() - 0.5) * 0.5;    // x
            velocities[i3 + 1] = -Math.random() * 2 - 1;    // y (falling)
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.5; // z
        }
        
        // Create geometry and attributes
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create material with Matrix-style green color
        const material = new THREE.PointsMaterial({
            color: 0x00ff00,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        
        // Create particle system
        this.rain = new THREE.Points(geometry, material);
        
        // Add rain to both scenes - ensure this doesn't create DOM elements
        this.mainScene.add(this.rain);
        // Clone the rain rather than create a new instance to ensure we don't get extra DOM elements
        const rainClone = this.rain.clone();
        this.waitingRoomScene.add(rainClone);
        
        // Store velocities for animation
        this.rainVelocities = velocities;
    }

    updateRain(deltaTime) {
        if (!this.rain || !this.rainVelocities) return;
        
        const positions = this.rain.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Update position based on velocity
            positions[i] += this.rainVelocities[i] * deltaTime;
            positions[i + 1] += this.rainVelocities[i + 1] * deltaTime;
            positions[i + 2] += this.rainVelocities[i + 2] * deltaTime;
            
            // Reset particle if it falls below ground
            if (positions[i + 1] < -10) {
                positions[i] = (Math.random() - 0.5) * 100;
                positions[i + 1] = Math.random() * 50 + 20;
                positions[i + 2] = (Math.random() - 0.5) * 100;
                
                // Reset velocity
                this.rainVelocities[i] = (Math.random() - 0.5) * 0.5;
                this.rainVelocities[i + 1] = -Math.random() * 2 - 1;
                this.rainVelocities[i + 2] = (Math.random() - 0.5) * 0.5;
            }
        }
        
        this.rain.geometry.attributes.position.needsUpdate = true;
    }

    switchScene(targetSceneName, targetSpawnPoint) {
        console.log(`Switching to ${targetSceneName} at ${targetSpawnPoint.x}, ${targetSpawnPoint.y}, ${targetSpawnPoint.z}`);

        // Remove character from the old scene
        this.currentScene.remove(this.character.characterGroup);

        // Find the target scene object
        let targetScene;
        if (targetSceneName === MAIN_AREA_NAME) {
            targetScene = this.mainScene;
        } else if (targetSceneName === WAITING_ROOM_NAME) {
            targetScene = this.waitingRoomScene;
        } else {
            console.error("Unknown target scene:", targetSceneName);
            return;
        }

        // Set the new current scene and its portals
        this.currentScene = targetScene;
        this.activePortals = this.currentScene.userData.portals || [];

        // Add character to the new scene
        this.currentScene.add(this.character.characterGroup);

        // Move character to the spawn point in the new scene
        this.character.characterGroup.position.copy(targetSpawnPoint);
        // Reset character's internal state coordinates
        this.character.characterState.x = targetSpawnPoint.x;
        this.character.characterState.y = targetSpawnPoint.y;
        this.character.characterState.z = targetSpawnPoint.z;
        this.character.characterState.baseY = targetSpawnPoint.y;
        this.character.characterState.velocity.set(0, 0, 0);
        this.character.characterState.isJumping = false;
        this.character.characterState.jumpVelocity = 0;

        // Update character's scene reference
        this.character.scene = this.currentScene;
        // Update character's chat system reference (though it's the same instance)
        this.character.chatSystem = this.chatSystem;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();

        // --- Prepare Obstacles for Collision --- 
        const obstacles = [];
        const tempBox = new THREE.Box3(); // Reuse Box3 object for efficiency

        // Add pier elements (assuming pier object has meshes/groups)
        // Example: Check if pier.pierGroup exists and is a group
        if (this.pier && this.pier.pierGroup) {
            this.pier.pierGroup.traverse((child) => {
                if (child.isMesh) {
                    // We need a way to identify collidable parts vs non-collidable (like water)
                    // For now, let's assume all pier meshes are collidable
                    tempBox.setFromObject(child); 
                    obstacles.push({ aabb: tempBox.clone(), object: child });
                }
            });
        } else if (this.pier && this.pier.isMesh) { // If pier itself is a single mesh
             tempBox.setFromObject(this.pier); 
             obstacles.push({ aabb: tempBox.clone(), object: this.pier });
        }

        // Add decorative elements (assuming they have meshes/groups)
        // Example: Iterate through decorativeElements array or group
        if (this.decorativeElements && this.decorativeElements.elementsGroup) {
            this.decorativeElements.elementsGroup.traverse((child) => {
                if (child.isMesh) { 
                    // Add logic here if some decoratives are non-collidable
                     tempBox.setFromObject(child);
                     obstacles.push({ aabb: tempBox.clone(), object: child });
                }
            });
        } 

         // Add billboard (assuming billboard.mesh exists)
         if (this.billboard && this.billboard.billboardGroup) { // Check for billboardGroup
            tempBox.setFromObject(this.billboard.billboardGroup);
            obstacles.push({ aabb: tempBox.clone(), object: this.billboard.billboardGroup });
        } else if (this.billboard && this.billboard.mesh) { // Fallback to mesh if no group
            tempBox.setFromObject(this.billboard.mesh);
            obstacles.push({ aabb: tempBox.clone(), object: this.billboard.mesh });
        }

        // Add NPCs
        this.npcs.forEach(npc => {
            if (npc.npcGroup) { // Assuming npc has an npcGroup
                tempBox.setFromObject(npc.npcGroup);
                obstacles.push({ aabb: tempBox.clone(), object: npc.npcGroup });
            }
        });

         // Add active portals (assuming portal.portalMesh exists)
         this.activePortals.forEach(portal => {
             if (portal.portalMesh) {
                 // Portals might not be solid obstacles, decide if they should be added
                 // tempBox.setFromObject(portal.portalMesh);
                 // obstacles.push({ aabb: tempBox.clone(), object: portal.portalMesh });
             }
         });

        // --- Update Game Elements --- 

        // Update character (pass obstacles)
        this.character.update(deltaTime, this.keys, this.camera, obstacles, this.activePortals);

        // Update NPCs
        this.npcs.forEach(npc => {
            npc.update(deltaTime, this.camera);
        });
        
        // Update decorative elements
        this.decorativeElements.update(deltaTime);
        
        // Update billboard
        this.billboard.update(deltaTime);
        
        // Update portals
        this.activePortals.forEach(portal => {
            portal.update(deltaTime);
            if (portal.checkForActivation(this.character.getPosition())) {
                const target = portal.getTarget();
                this.switchScene(target.sceneName, target.spawnPoint);
            }
        });
        
        // Update camera
        this.updateCamera();
        
        // Update rain
        this.updateRain(deltaTime);
        
        // Render current scene
        this.renderer.render(this.currentScene, this.camera);
    }
} 