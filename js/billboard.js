import * as THREE from 'three';
import { createBoxGeometry, createStandardMaterial } from './utils.js';

export class Billboard {
    constructor(scene) {
        // Create billboard frame
        const frameGeometry = createBoxGeometry(8, 4, 0.5);
        const frameMaterial = createStandardMaterial(0x333333, 0.9);
        this.frame = new THREE.Mesh(frameGeometry, frameMaterial);
        
        // Create billboard screen - make it more transparent
        const screenGeometry = createBoxGeometry(7.8, 3.8, 0.1);
        const screenMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.screen = new THREE.Mesh(screenGeometry, screenMaterial);
        this.screen.position.z = 0.2; // Slightly in front of frame
        
        // Create billboard group
        this.billboardGroup = new THREE.Group();
        this.billboardGroup.add(this.frame);
        this.billboardGroup.add(this.screen);
        
        // Position and rotate the billboard
        this.billboardGroup.position.set(0, 3, 8); // 8 units forward from the edge
        
        // Add billboard to scene
        scene.add(this.billboardGroup);
        
        // Add dedicated lighting for the billboard
        this.addBillboardLights(scene);
        
        // Add neon glow effect
        this.addNeonGlow();
        
        // Load and apply the logo texture
        this.loadLogoTexture();

        // Initialize color transition properties
        this.colorIndex = 0;
        this.transitionProgress = 0;
        this.cyberpunkColors = [
            0x00ffff, // Cyan
            0xff00ff, // Magenta
            0x00ff00, // Neon Green
            0xff0000, // Neon Red
            0x0000ff, // Neon Blue
            0xffff00, // Neon Yellow
            0xff00ff, // Magenta (loop back)
        ];
    }
    
    addBillboardLights(scene) {
        // Front spotlight - increased intensity
        const frontSpot = new THREE.SpotLight(0xffffff, 3);
        frontSpot.position.set(0, 5, 12);
        frontSpot.angle = Math.PI / 4;
        frontSpot.penumbra = 0.5;
        frontSpot.decay = 1;
        frontSpot.distance = 20;
        frontSpot.target = this.billboardGroup;
        scene.add(frontSpot);
        
        // Top spotlight - increased intensity
        const topSpot = new THREE.SpotLight(0xffffff, 2);
        topSpot.position.set(0, 8, 8);
        topSpot.angle = Math.PI / 4;
        topSpot.penumbra = 0.5;
        topSpot.decay = 1;
        topSpot.distance = 20;
        topSpot.target = this.billboardGroup;
        scene.add(topSpot);
        
        // Ambient light - increased intensity
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        ambientLight.position.set(0, 3, 8);
        scene.add(ambientLight);
    }
    
    loadLogoTexture() {
        console.log("Loading logo texture...");
        const textureLoader = new THREE.TextureLoader();
        
        // Try loading from different possible paths
        const possiblePaths = [
            '/logo.png',
            './logo.png',
            'logo.png'
        ];
        
        const tryLoadTexture = (path) => {
            console.log("Attempting to load texture from:", path);
            textureLoader.load(
                path,
                (texture) => {
                    console.log("Logo texture loaded successfully from:", path);
                    // Configure texture settings
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.format = THREE.RGBAFormat;
                    texture.flipY = true;
                    this.createLogoMesh(texture);
                },
                (progress) => {
                    console.log("Loading progress for", path + ":", (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.error("Error loading texture from:", path);
                    console.error("Error details:", error);
                    // Try next path if available
                    if (possiblePaths.length > 0) {
                        console.log("Trying next path...");
                        tryLoadTexture(possiblePaths.shift());
                    } else {
                        console.error("Failed to load logo texture from all possible paths");
                        console.log("Creating placeholder logo...");
                        this.createPlaceholderLogo();
                    }
                }
            );
        };
        
        // Start with the first path
        tryLoadTexture(possiblePaths.shift());
    }
    
    createLogoMesh(texture) {
        console.log("Creating logo mesh with texture...");
        
        // Configure texture settings
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;
        texture.flipY = true;
        
        // Create a plane for the logo
        const logoGeometry = new THREE.PlaneGeometry(5, 2.5);
        const logoMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide
        });
        
        this.logo = new THREE.Mesh(logoGeometry, logoMaterial);
        this.logo.position.z = 0.25;
        
        // Add logo to billboard group
        this.billboardGroup.add(this.logo);
        console.log("Logo mesh created and added to billboard group");
    }
    
    createPlaceholderLogo() {
        // Create a colored plane as placeholder - reduced size
        const logoGeometry = new THREE.PlaneGeometry(5, 2.5); // Reduced from 7.6, 3.6
        const logoMaterial = new THREE.MeshStandardMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            emissive: 0xff00ff,
            emissiveIntensity: 1.0,
            metalness: 0.8,
            roughness: 0.2
        });
        
        this.logo = new THREE.Mesh(logoGeometry, logoMaterial);
        this.logo.position.z = 0.15;
        
        // Add logo to billboard group
        this.billboardGroup.add(this.logo);
    }
    
    addNeonGlow() {
        // Create neon frame glow
        const glowGeometry = createBoxGeometry(8.2, 4.2, 0.6);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3, // Increased opacity
            emissive: 0x00ffff,
            emissiveIntensity: 1.0, // Increased intensity
            metalness: 0.8,
            roughness: 0.2
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glow.position.z = -0.1; // Behind the frame
        
        // Add glow to billboard group
        this.billboardGroup.add(this.glow);
    }
    
    update(deltaTime) {
        // Update color transition
        this.transitionProgress += deltaTime * 0.5; // Adjust speed by changing multiplier
        
        if (this.transitionProgress >= 1) {
            this.transitionProgress = 0;
            this.colorIndex = (this.colorIndex + 1) % this.cyberpunkColors.length;
        }
        
        // Calculate interpolated color
        const currentColor = this.cyberpunkColors[this.colorIndex];
        const nextColor = this.cyberpunkColors[(this.colorIndex + 1) % this.cyberpunkColors.length];
        
        const currentRGB = new THREE.Color(currentColor);
        const nextRGB = new THREE.Color(nextColor);
        
        const interpolatedColor = new THREE.Color();
        interpolatedColor.r = currentRGB.r + (nextRGB.r - currentRGB.r) * this.transitionProgress;
        interpolatedColor.g = currentRGB.g + (nextRGB.g - currentRGB.g) * this.transitionProgress;
        interpolatedColor.b = currentRGB.b + (nextRGB.b - currentRGB.b) * this.transitionProgress;
        
        // Update glow color and intensity
        if (this.glow) {
            this.glow.material.color = interpolatedColor;
            this.glow.material.emissive = interpolatedColor;
            this.glow.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.001) * 0.1;
        }
    }
} 