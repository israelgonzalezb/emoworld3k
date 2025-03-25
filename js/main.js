import * as THREE from 'three';
import { Character } from './character.js';
import { Pier } from './pier.js';
import { DecorativeElements } from './decorative.js';
import { NPC } from './npc.js';
import { Billboard } from './billboard.js';

export class EBOYIsometricPierScene {
    constructor() {
        console.log("Initializing EBOYIsometricPierScene...");
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000033); // Dark blue background (EBOY style)
        
        // Add San Francisco fog with increased density
        this.scene.fog = new THREE.Fog(0x000033, 10, 50); // Dark blue fog, starts at 10 units, ends at 50 units
        
        // Create Matrix rain
        this.createMatrixRain();
        
        // Camera setup for isometric view
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -10 * aspect, 10 * aspect, 10, -10, 0.1, 1000
        );
        
        // Set camera position for isometric view
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('scene-container').appendChild(this.renderer.domElement);
        
        // Basic lighting
        this.setupLighting();
        
        // Create scene elements
        console.log("Creating pier...");
        this.pier = new Pier(this.scene);
        
        console.log("Creating player character...");
        this.character = new Character(this.scene);
        
        console.log("Creating decorative elements...");
        this.decorativeElements = new DecorativeElements(this.scene);
        
        console.log("Creating billboard...");
        this.billboard = new Billboard(this.scene);
        
        // Create NPCs
        console.log("Creating NPCs...");
        this.npcs = [];
        for (let i = 0; i < 10; i++) {
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 38, // Random x position
                0.9, // On pier surface
                (Math.random() - 0.5) * 18  // Random z position
            );
            this.npcs.push(new NPC(this.scene, position));
        }
        
        // Input handling
        this.keys = {};
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Clock for frame-rate independent movement
        this.clock = new THREE.Clock();
        
        // Start animation loop
        console.log("Starting animation loop...");
        this.animate();
        
        console.log("EBOY-Inspired Isometric Pier Scene initialized");
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 20, 15);
        this.scene.add(directionalLight);
        
        // Add colored point lights for EBOY style neon effect
        const pinkLight = new THREE.PointLight(0xff00ff, 1, 10);
        pinkLight.position.set(5, 3, 5);
        this.scene.add(pinkLight);
        
        const cyanLight = new THREE.PointLight(0x00ffff, 1, 10);
        cyanLight.position.set(-5, 3, -5);
        this.scene.add(cyanLight);
        
        const greenLight = new THREE.PointLight(0x00ff00, 0.8, 8);
        greenLight.position.set(0, 2, -3);
        this.scene.add(greenLight);
        
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
        this.scene.add(this.rain);
        
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

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update rain
        this.updateRain(deltaTime);
        
        // Update character
        if (this.character) {
            this.character.update(deltaTime, this.keys);
        }
        
        // Update NPCs
        if (this.npcs) {
            this.npcs.forEach(npc => {
                if (npc) {
                    npc.update(deltaTime, this.keys);
                }
            });
        }
        
        // Update decorative elements
        if (this.decorativeElements) {
            this.decorativeElements.update(deltaTime);
        }
        
        // Update billboard
        if (this.billboard) {
            this.billboard.update(deltaTime);
        }
        
        // Animate neon lights
        const time = Date.now() * 0.001;
        if (this.neonLights) {
            this.neonLights.forEach((light, i) => {
                light.intensity = 0.5 + Math.sin(time + i * 1.5) * 0.5;
            });
        }
        
        // Update camera to follow character
        if (this.character) {
            this.updateCamera();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
} 