import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Custom Chromatic Aberration Shader (remains the same)
const ChromaticAberrationShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "amount": { value: 0.003 },
        "angle": { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        uniform float angle;
        varying vec2 vUv;
        
        void main() {
            vec2 offset = amount * vec2(cos(angle), sin(angle));
            vec4 cr = texture2D(tDiffuse, vUv + offset);
            vec4 cg = texture2D(tDiffuse, vUv);
            vec4 cb = texture2D(tDiffuse, vUv - offset);
            gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a); // Use cg.a for alpha
        }
    `
};

// EMO WORLD AESTHETIC CONSTANTS - ADJUSTED FOR MORE VISIBILITY
const EMO_COLORS = {
    SKY_TOP: new THREE.Color(0x121228), // Slightly lighter dark inky purple-blue
    SKY_BOTTOM: new THREE.Color(0x180D24), // Slightly lighter deeper purple
    FOG: new THREE.Color(0x1A182C), // Lighter, less dense purplish fog
    NEON_PINK: new THREE.Color(0xff00ff),
    NEON_CYAN: new THREE.Color(0x00ffff),
    NEON_PURPLE: new THREE.Color(0x8a2be2),
    NEON_BLUE: new THREE.Color(0x0077ff),
    DIGITAL_RAIN_COLOR: new THREE.Color(0x00ffaa),
    BUILDING_BASE: new THREE.Color(0x2A2D3A), // Noticeably lighter base for buildings
    BUILDING_EMISSIVE: new THREE.Color(0x08080C), // Slightly more emissive
    BALCONY_COLOR: new THREE.Color(0x282830), // Slightly lighter balcony
    MOON_VISUAL_COLOR: new THREE.Color(0xC0C0E8), // Pale lavender/blue moon
    MOON_EMISSIVE_COLOR: new THREE.Color(0x9090C0), // Emissive part of the moon
    MOON_LIGHT_COLOR: new THREE.Color(0xD0D8E8), // Lighter, stronger moonlight
    FILL_LIGHT_COLOR: new THREE.Color(0x504A65), // Lighter moody purple for fill
};

export class TitleScreen {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.composer = null;
        this.rainParticles = [];
        this.digitalRainParticles = null;
        this.neonLights = [];
        this.holographicAds = [];
        this.titleMesh = null;
        this.menuItemMeshes = [];
        this.fontLoader = new FontLoader();
        this.moonMesh = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredMenuItem = null;

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        // Optional: Tone mapping can help manage very bright lights and dark shadows
        // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 1, -10);

        // Significantly reduced fog density
        this.scene.fog = new THREE.FogExp2(EMO_COLORS.FOG, 0.010);

        this.setupLighting();
        this.setupPostProcessing();

        this.createBackground();
        this.createCityscape();
        this.createForegroundBalcony();
        this.createRain();
        this.createDigitalRain();

        this.loadFontsAndCreateTextElements();

        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.7,  // Bloom strength
            0.5,  // Bloom radius
            0.65  // Bloom threshold (lower means more things bloom)
        );
        this.composer.addPass(bloomPass);

        const chromaticAberrationPass = new ShaderPass(ChromaticAberrationShader);
        chromaticAberrationPass.uniforms.amount.value = 0.0015;
        this.composer.addPass(chromaticAberrationPass);
    }

    setupLighting() {
        // Significantly increased ambient light
        const ambientLight = new THREE.AmbientLight(EMO_COLORS.FOG, 2.0); // Was 0.9
        this.scene.add(ambientLight);

        // Main "Moon" light source - significantly stronger
        const moonLight = new THREE.DirectionalLight(EMO_COLORS.MOON_LIGHT_COLOR, 3.0); // Was 1.2
        moonLight.position.set(-0.7, 0.8, -1).normalize();
        this.scene.add(moonLight);

        // Fill light - stronger and better aimed
        const fillLight = new THREE.DirectionalLight(EMO_COLORS.FILL_LIGHT_COLOR, 1.5); // Was 0.5
        fillLight.position.set(0.7, 0.5, -1.0).normalize(); // Aimed more towards the city
        this.scene.add(fillLight);

        // Foreground light
        const cameraLight = new THREE.PointLight(EMO_COLORS.NEON_CYAN, 0.6, 25); // Slightly stronger
        cameraLight.position.set(0, 2, 10);
        this.scene.add(cameraLight);
    }

    createBackground() {
        const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: EMO_COLORS.SKY_TOP },
                bottomColor: { value: EMO_COLORS.SKY_BOTTOM }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(0.0, h) * 0.8 + 0.2), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);

        const moonGeometry = new THREE.SphereGeometry(25, 32, 32); // Slightly larger moon
        const moonMaterial = new THREE.MeshStandardMaterial({
            color: EMO_COLORS.MOON_VISUAL_COLOR,
            emissive: EMO_COLORS.MOON_EMISSIVE_COLOR,
            emissiveIntensity: 1.5, // More glow
            fog: false
        });
        this.moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        this.moonMesh.position.set(-150, 80, -350); // Positioned further and slightly larger
        this.scene.add(this.moonMesh);
    }

    createCityscape() {
        const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
        const numBuildings = 50;
        const citySpread = 150;

        for (let i = 0; i < numBuildings; i++) {
            const buildingMaterial = new THREE.MeshStandardMaterial({
                color: EMO_COLORS.BUILDING_BASE, // Uses new, lighter base color
                metalness: 0.2, // Less metalness, more diffuse reflection
                roughness: 0.7, // More roughness
                emissive: EMO_COLORS.BUILDING_EMISSIVE,
                emissiveIntensity: 0.5 // Slightly increased building self-glow
            });

            const height = 10 + Math.random() * 80;
            const width = 3 + Math.random() * 8;
            const depth = 3 + Math.random() * 8;

            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            building.scale.set(width, height, depth);
            building.position.set(
                (Math.random() - 0.5) * citySpread,
                height / 2 - 10,
                -(20 + Math.random() * (citySpread / 2))
            );
            this.scene.add(building);

            if (Math.random() < 0.7) {
                this.addNeonAccentToBuilding(building);
            }

            if (height > 40 && Math.random() < 0.3) {
                this.addHolographicAd(building);
            }
        }
    }

    addNeonAccentToBuilding(building) {
        const neonColors = [EMO_COLORS.NEON_PINK, EMO_COLORS.NEON_CYAN, EMO_COLORS.NEON_PURPLE, EMO_COLORS.NEON_BLUE];
        const color = neonColors[Math.floor(Math.random() * neonColors.length)];

        // Neon point lights now stronger to stand out against brighter scene
        const accentLight = new THREE.PointLight(color, 3.0, 18 + Math.random() * 12); // Was 2.0 intensity
        accentLight.position.set(
            building.position.x + (Math.random() - 0.5) * building.scale.x * 0.5,
            building.position.y + (Math.random() - 0.5) * building.scale.y * 0.8,
            building.position.z + (Math.random() > 0.5 ? building.scale.z / 2 : -building.scale.z / 2)
        );
        this.scene.add(accentLight);
        this.neonLights.push({light: accentLight, baseIntensity: accentLight.intensity, flickerSpeed: 0.001 + Math.random() * 0.005});

        const sourceGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.2, 8, 8); // Slightly larger sources
        const sourceMat = new THREE.MeshBasicMaterial({ color: color, emissive: color });
        const sourceMesh = new THREE.Mesh(sourceGeo, sourceMat);
        sourceMesh.position.copy(accentLight.position);
        this.scene.add(sourceMesh);
        this.neonLights.push({mesh: sourceMesh, flickerSpeed: 0.002 + Math.random() * 0.005});
    }

    addHolographicAd(building) {
        const adWidth = building.scale.x * (0.5 + Math.random() * 0.5);
        const adHeight = building.scale.y * (0.2 + Math.random() * 0.3);
        const adGeometry = new THREE.PlaneGeometry(adWidth, adHeight);
        
        const holographicAdMaterial = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? EMO_COLORS.NEON_CYAN : EMO_COLORS.NEON_PINK,
            transparent: true,
            opacity: 0.4 + Math.random() * 0.3, // Slightly more opaque
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        });

        const ad = new THREE.Mesh(adGeometry, holographicAdMaterial);
        ad.position.set(
            building.position.x,
            building.position.y + building.scale.y * 0.25 * (Math.random() - 0.5),
            building.position.z + (building.scale.z / 2 + 0.1) * (Math.random() > 0.5 ? 1 : -1)
        );
        ad.lookAt(this.camera.position);
        this.scene.add(ad);
        this.holographicAds.push(ad);
    }

    createRain() {
        const rainCount = 5000;
        const positions = new Float32Array(rainCount * 3);
        const velocities = new Float32Array(rainCount);

        for (let i = 0; i < rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = Math.random() * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;
            velocities[i] = 0.2 + Math.random() * 0.3;
        }

        const rainGeometry = new THREE.BufferGeometry();
        rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const rainMaterial = new THREE.PointsMaterial({
            color: 0x8899AA, // Slightly lighter rain
            size: 0.08,
            transparent: true,
            opacity: 0.5, // Slightly more opaque
            sizeAttenuation: true,
        });

        const rain = new THREE.Points(rainGeometry, rainMaterial);
        this.scene.add(rain);
        this.rainParticles.push({ points: rain, velocities: velocities, type: 'normal' });
    }

    createDigitalRain() {
        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 15;
            velocities[i] = 0.05 + Math.random() * 0.05;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: EMO_COLORS.DIGITAL_RAIN_COLOR,
            size: 0.15,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });
        this.digitalRainParticles = new THREE.Points(geometry, material);
        this.scene.add(this.digitalRainParticles);
        this.digitalRainParticles.userData.velocities = velocities;
    }

    loadFontsAndCreateTextElements() {
        this.fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
            const textGeometry = new TextGeometry('EMO WORLD', {
                font: font,
                size: 1.2,
                height: 0.1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });
            textGeometry.center();

            const textMaterial = new THREE.MeshStandardMaterial({
                color: EMO_COLORS.NEON_PINK,
                emissive: EMO_COLORS.NEON_PINK,
                emissiveIntensity: 1.0,
                metalness: 0.1,
                roughness: 0.5,
            });
            this.titleMesh = new THREE.Mesh(textGeometry, textMaterial);
            this.titleMesh.position.set(0, 6, -2);
            this.scene.add(this.titleMesh);
        }, undefined, (err) => console.error('Error loading title font:', err));

        const menuItems = ['ENTER', 'SETTINGS', 'ABOUT'];
        this.fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            menuItems.forEach((text, index) => {
                const itemGeometry = new TextGeometry(text, {
                    font: font,
                    size: 0.35,
                    height: 0.05,
                    curveSegments: 4,
                    bevelEnabled: false
                });
                itemGeometry.center();

                const itemMaterial = new THREE.MeshStandardMaterial({
                    color: 0xeeeeff,
                    emissive: 0xaaaacc,
                    emissiveIntensity: 0.5,
                });
                const textMesh = new THREE.Mesh(itemGeometry, itemMaterial);
                textMesh.position.set(0, 3.5 - index * 0.7, 0);
                textMesh.userData.text = text; // Store the menu text for click handling
                this.scene.add(textMesh);
                this.menuItemMeshes.push(textMesh);
            });
        }, undefined, (err) => console.error('Error loading menu font:', err));
    }

    createForegroundBalcony() {
        const mainRailGeo = new THREE.BoxGeometry(12, 0.2, 0.2);
        const supportGeo = new THREE.BoxGeometry(0.2, 2, 0.2);
        const balconyMaterial = new THREE.MeshStandardMaterial({
            color: EMO_COLORS.BALCONY_COLOR,
            metalness: 0.5,
            roughness: 0.5,
        });

        const mainRail = new THREE.Mesh(mainRailGeo, balconyMaterial);
        mainRail.position.set(0, 0.5, 5);
        this.scene.add(mainRail);

        const supportLeft = new THREE.Mesh(supportGeo, balconyMaterial);
        supportLeft.position.set(-5.8, -0.5, 5);
        this.scene.add(supportLeft);

        const supportRight = new THREE.Mesh(supportGeo, balconyMaterial);
        supportRight.position.set(5.8, -0.5, 5);
        this.scene.add(supportRight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    setupEventListeners() {
        window.addEventListener('mousemove', (event) => {
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('click', (event) => {
            if (this.hoveredMenuItem) {
                const menuText = this.hoveredMenuItem.userData.text;
                switch (menuText) {
                    case 'ENTER':
                        // Dispatch custom event for game start
                        window.dispatchEvent(new CustomEvent('startGame'));
                        break;
                    case 'SETTINGS':
                        // TODO: Implement settings menu
                        console.log('Settings clicked');
                        break;
                    case 'ABOUT':
                        // TODO: Implement about screen
                        console.log('About clicked');
                        break;
                }
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = Date.now();
        const slowTime = time * 0.0001;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.menuItemMeshes);

        // Handle hover effects
        if (intersects.length > 0) {
            const hoveredMesh = intersects[0].object;
            if (this.hoveredMenuItem !== hoveredMesh) {
                // Reset previous hover
                if (this.hoveredMenuItem) {
                    this.hoveredMenuItem.material.emissiveIntensity = 0.5;
                    this.hoveredMenuItem.scale.set(1, 1, 1);
                }
                // Set new hover
                this.hoveredMenuItem = hoveredMesh;
                this.hoveredMenuItem.material.emissiveIntensity = 1.0;
                this.hoveredMenuItem.scale.set(1.1, 1.1, 1.1);
            }
        } else if (this.hoveredMenuItem) {
            // Reset hover when mouse leaves menu item
            this.hoveredMenuItem.material.emissiveIntensity = 0.5;
            this.hoveredMenuItem.scale.set(1, 1, 1);
            this.hoveredMenuItem = null;
        }

        this.camera.position.x = Math.sin(slowTime * 0.3) * 0.5;
        this.camera.position.y = 5 + Math.cos(slowTime * 0.2) * 0.2;
        this.camera.lookAt(0, 1 + Math.sin(slowTime * 0.1) * 0.5, -10);

        this.rainParticles.forEach(particleSystem => {
            const positions = particleSystem.points.geometry.attributes.position.array;
            const velocities = particleSystem.velocities;
            for (let i = 0; i < velocities.length; i++) {
                positions[i * 3 + 1] -= velocities[i];
                if (positions[i * 3 + 1] < -10) {
                    positions[i * 3 + 1] = 50 + Math.random() * 10;
                }
            }
            particleSystem.points.geometry.attributes.position.needsUpdate = true;
        });

        if (this.digitalRainParticles) {
            const positions = this.digitalRainParticles.geometry.attributes.position.array;
            const velocities = this.digitalRainParticles.userData.velocities;
            for (let i = 0; i < velocities.length; i++) {
                positions[i * 3 + 1] -= velocities[i];
                if (positions[i * 3 + 1] < -5) {
                    positions[i * 3 + 1] = 40 + Math.random() * 10;
                }
            }
            this.digitalRainParticles.geometry.attributes.position.needsUpdate = true;
            this.digitalRainParticles.material.opacity = 0.5 + Math.sin(time * 0.005 + Math.random()) * 0.2;
        }

        this.neonLights.forEach(item => {
            if (item.light) {
                item.light.intensity = item.baseIntensity * (0.8 + Math.sin(time * item.flickerSpeed + Math.random() * Math.PI) * 0.2);
                if (Math.random() < 0.005) {
                    item.light.intensity = item.baseIntensity * 0.1;
                }
            } else if (item.mesh && item.mesh.material.emissive) {
                 item.mesh.material.opacity = (0.6 + Math.sin(time * item.flickerSpeed * 2.0 + Math.random() * Math.PI) * 0.4);
            }
        });

        this.holographicAds.forEach(ad => {
            ad.material.opacity = 0.3 + Math.sin(time * 0.002 + ad.uuid.length) * 0.2;
            if (Math.random() < 0.01) {
                ad.position.x += (Math.random() - 0.5) * 0.1;
                ad.position.y += (Math.random() - 0.5) * 0.1;
            }
        });

        if (this.titleMesh && this.titleMesh.material.emissive) {
            this.titleMesh.material.emissiveIntensity = 0.9 + Math.sin(time * 0.0015) * 0.3;
            this.titleMesh.rotation.y = Math.sin(time * 0.0002) * 0.01;
            this.titleMesh.rotation.x = Math.cos(time * 0.00023) * 0.005;
        }
        this.menuItemMeshes.forEach(item => {
             if (item.material.emissive) {
                 item.material.emissiveIntensity = 0.4 + Math.sin(time * 0.001 + item.uuid.length) * 0.2;
             }
        });

        if (this.composer) {
            const chromaticAberrationPass = this.composer.passes.find(pass => pass.uniforms && pass.uniforms.amount);
            if (chromaticAberrationPass) {
                chromaticAberrationPass.uniforms.angle.value = slowTime * 0.5;
                chromaticAberrationPass.uniforms.amount.value = 0.0015 + Math.abs(Math.sin(time * 0.0003)) * 0.003;
            }
        }

        this.composer.render();
    }
}