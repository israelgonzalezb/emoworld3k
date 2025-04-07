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
        console.log("Starting EBOYIsometricPierScene initialization...");
        
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
            const portalToWaitingRoomPos = new THREE.Vector3(10, 1.5, -5);
            const portalToWaitingRoom = new Portal(
                this.mainScene,
                portalToWaitingRoomPos,
                1.2,
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
            
            // Create scene elements
            console.log("Creating pier...");
            this.pier = new Pier(this.mainScene);
            
            console.log("Creating player character...");
            this.character = new Character(this.mainScene);
            
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
                this.npcs.push(new NPC(this.mainScene, position));
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
            
            // Initialize chat system with character reference
            console.log("Initializing chat system...");
            this.chatSystem = new ChatSystem(this.character);
            this.chatSystem.addSystemMessage("Welcome to the Cyberpunk Pier! Press E to throw vinyl discs.");
            
            // Start animation loop
            console.log("Starting animation loop...");
            this.animate();
            
            console.log("EBOY-Inspired Isometric Pier Scene successfully initialized!");
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
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
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
            
            // Random position in a wide area
            positions[i3] = (Math.random() - 0.5) * 100;     // x
            positions[i3 + 1] = Math.random() * 50 + 20;    // y (start above scene)
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
        
        // Add rain to both scenes
        this.mainScene.add(this.rain);
        this.waitingRoomScene.add(this.rain.clone());
        
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
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update rain
        this.updateRain(deltaTime);
        
        // Update character and check for portal activation
        if (this.character) {
            // Update character with current scene's portals
            this.character.update(deltaTime, this.keys, this.camera);

            // Check portal activation
            const characterPos = this.character.characterGroup.position;
            for (const portal of this.activePortals) {
                portal.update(deltaTime);
                if (portal.checkForActivation(characterPos)) {
                    const target = portal.getTarget();
                    this.switchScene(target.sceneName, target.spawnPoint);
                    break;
                }
            }
        }
        
        // Update NPCs only in main scene
        if (this.npcs && this.currentScene === this.mainScene) {
            this.npcs.forEach(npc => {
                if (npc) {
                    npc.update(deltaTime, this.keys, this.camera);
                }
            });
        }
        
        // Update decorative elements only in main scene
        if (this.decorativeElements && this.currentScene === this.mainScene) {
            this.decorativeElements.update(deltaTime);
        }
        
        // Update billboard only in main scene
        if (this.billboard && this.currentScene === this.mainScene) {
            this.billboard.update(deltaTime);
        }
        
        // Animate neon lights only in main scene
        const time = Date.now() * 0.001;
        if (this.neonLights && this.currentScene === this.mainScene) {
            this.neonLights.forEach((light, i) => {
                light.intensity = 0.5 + Math.sin(time + i * 1.5) * 0.5;
            });
        }
        
        // Update camera
        this.updateCamera();
        
        // Render the current scene
        this.renderer.render(this.currentScene, this.camera);
    }
} 