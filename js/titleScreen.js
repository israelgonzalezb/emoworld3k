import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Custom Chromatic Aberration Shader
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
            gl_FragColor = vec4(cr.r, cg.g, cb.b, 1.0);
        }
    `
};

export class TitleScreen {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.composer = null;
        this.rainParticles = [];
        this.neonLights = [];
        this.titleMesh = null;
        this.menuItems = [];
        
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Setup camera - moved closer and adjusted position
        this.camera.position.set(0, 2, 10);
        this.camera.lookAt(0, 0, 0);

        // Add debug helpers
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        const gridHelper = new THREE.GridHelper(20, 20);
        this.scene.add(gridHelper);

        // Setup lighting first
        this.setupLighting();

        // Setup post-processing
        this.setupPostProcessing();

        // Create scene elements
        this.createBackground();
        this.createCityscape();
        this.createRain();
        this.createTitle();
        this.createMenu();
        this.createForeground();

        // Start animation
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Add fog for depth
        this.scene.fog = new THREE.FogExp2(0x101020, 0.035);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        // Add render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Add bloom effect for neon glow (reduced intensity)
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.7,  // strength reduced from 1.5
            0.3,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);

        // Add custom chromatic aberration
        const chromaticAberration = new ShaderPass(ChromaticAberrationShader);
        chromaticAberration.uniforms.amount.value = 0.003;
        chromaticAberration.uniforms.angle.value = 0.0;
        this.composer.addPass(chromaticAberration);
    }

    createBackground() {
        // Create sky gradient
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x1a1a2e) },
                bottomColor: { value: new THREE.Color(0x16213e) }
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
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(0.0, h)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    createCityscape() {
        // Create city buildings
        const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
        const buildingMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a3a,
            specular: 0x222222,
            shininess: 30,
            emissive: 0x1a1a2a,
            emissiveIntensity: 0.2
        });

        // Create multiple buildings
        for (let i = 0; i < 20; i++) {
            const height = 5 + Math.random() * 15;
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial.clone());
            building.scale.set(2 + Math.random() * 3, height, 2 + Math.random() * 3);
            building.position.set(
                (Math.random() - 0.5) * 50,
                height / 2,
                (Math.random() - 0.5) * 50
            );
            this.scene.add(building);

            // Add neon lights to some buildings
            if (Math.random() > 0.5) {
                this.addNeonLight(building);
            }

            // Add neon accent lines to some buildings
            if (Math.random() > 0.5) {
                this.addNeonAccent(building);
            }
        }
    }

    addNeonLight(building) {
        // Create a more intense neon light
        const light = new THREE.PointLight(
            Math.random() > 0.5 ? 0xff00ff : 0x00ffff,
            2 + Math.random() * 2,
            15
        );
        light.position.copy(building.position);
        light.position.y += building.scale.y / 2;
        this.scene.add(light);
        this.neonLights.push(light);

        // Add a small glowing sphere at the light position
        const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: light.color,
            emissive: light.color,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(light.position);
        this.scene.add(sphere);
    }

    addNeonAccent(building) {
        // Add glowing neon lines to the building
        const neonColors = [0xff00ff, 0x00ffff, 0x00ff99, 0xffff00, 0x00ffea];
        const color = neonColors[Math.floor(Math.random() * neonColors.length)];
        const neonMaterial = new THREE.MeshBasicMaterial({ color, emissive: color });
        const accentCount = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < accentCount; i++) {
            const accentHeight = building.scale.y * (0.2 + 0.6 * Math.random());
            const accentGeometry = new THREE.BoxGeometry(
                building.scale.x * (0.8 + 0.2 * Math.random()),
                0.1,
                0.1
            );
            const accent = new THREE.Mesh(accentGeometry, neonMaterial);
            accent.position.set(
                building.position.x,
                building.position.y - building.scale.y / 2 + accentHeight,
                building.position.z + building.scale.z / 2 + 0.1
            );
            this.scene.add(accent);
        }
    }

    createRain() {
        const rainGeometry = new THREE.BufferGeometry();
        const rainCount = 1000;
        const positions = new Float32Array(rainCount * 3);
        const velocities = new Float32Array(rainCount);

        for (let i = 0; i < rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            velocities[i] = 0.1 + Math.random() * 0.3;
        }

        rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        const rain = new THREE.Points(rainGeometry, rainMaterial);
        this.scene.add(rain);
        this.rainParticles.push({ points: rain, velocities });
    }

    createTitle() {
        console.log("Creating title...");
        // Create title text using a simple plane with texture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;

        // Draw background
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text
        context.font = 'bold 64px Arial';
        context.fillStyle = '#ff00ff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('EMO WORLD', canvas.width / 2, canvas.height / 2);

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create plane
        const geometry = new THREE.PlaneGeometry(10, 2.5);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            color: 0xff00ff,
            emissive: 0xff00ff,
            emissiveIntensity: 0.5,
            shininess: 100
        });

        this.titleMesh = new THREE.Mesh(geometry, material);
        this.titleMesh.position.set(0, 3, 0);
        this.scene.add(this.titleMesh);

        // Add a point light for the title
        const titleLight = new THREE.PointLight(0xff00ff, 3, 10);
        titleLight.position.set(0, 3, 2);
        this.scene.add(titleLight);
    }

    createMenu() {
        console.log("Creating menu...");
        const menuItems = ['START GAME', 'LOAD GAME', 'SETTINGS', 'CREDITS', 'EXIT'];
        
        menuItems.forEach((text, index) => {
            // Create canvas for each menu item
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;

            // Draw background
            context.fillStyle = 'rgba(0, 0, 0, 0)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Draw text
            context.font = 'bold 32px Arial';
            context.fillStyle = '#ffffff';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            // Create texture
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            // Create plane
            const geometry = new THREE.PlaneGeometry(5, 1.25);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                color: 0xffffff  // Added white color to make it more visible
            });

            const textMesh = new THREE.Mesh(geometry, material);
            textMesh.position.set(0, 1 - index * 0.8, 0);  // Moved closer to camera
            this.scene.add(textMesh);
            this.menuItems.push(textMesh);
        });
    }

    createForeground() {
        // Create balcony/railing
        const railingGeometry = new THREE.BoxGeometry(10, 0.1, 0.5);
        const railingMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            specular: 0x111111,
            shininess: 30
        });
        const railing = new THREE.Mesh(railingGeometry, railingMaterial);
        railing.position.set(0, -2, -5);
        this.scene.add(railing);

        // Add some ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Camera slow pan
        const t = Date.now() * 0.0002;
        this.camera.position.x = Math.sin(t) * 2;
        this.camera.position.z = 10 + Math.cos(t) * 2;
        this.camera.lookAt(0, 0, 0);

        // Update rain
        this.rainParticles.forEach(particle => {
            const positions = particle.points.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= particle.velocities[i / 3];
                if (positions[i + 1] < 0) {
                    positions[i + 1] = 50;
                }
            }
            particle.points.geometry.attributes.position.needsUpdate = true;
        });

        // Update neon lights
        this.neonLights.forEach(light => {
            light.intensity = 1 + Math.sin(Date.now() * 0.001) * 0.2;
        });

        // Update title glow
        if (this.titleMesh && this.titleMesh.material) {
            this.titleMesh.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.001) * 0.2;
        }

        // Update chromatic aberration
        if (this.composer) {
            const chromaticAberrationPass = this.composer.passes.find(pass => pass.uniforms && pass.uniforms.amount);
            if (chromaticAberrationPass) {
                // Subtle rotation of the chromatic aberration
                chromaticAberrationPass.uniforms.angle.value = Date.now() * 0.0001;
                // Subtle pulsing of the effect
                chromaticAberrationPass.uniforms.amount.value = 0.003 + Math.sin(Date.now() * 0.0005) * 0.001;
            }
        }

        // Render scene
        this.composer.render();
    }

    setupLighting() {
        // Add ambient light - increased intensity for better overall visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        this.scene.add(ambientLight);

        // Add directional light - adjusted for better shadows and depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(10, 15, 10);
        this.scene.add(directionalLight);

        // Add colored point lights for neon effect
        const pinkLight = new THREE.PointLight(0xff00ff, 3, 20);
        pinkLight.position.set(10, 5, 10);
        this.scene.add(pinkLight);

        const cyanLight = new THREE.PointLight(0x00ffff, 3, 20);
        cyanLight.position.set(-10, 5, -10);
        this.scene.add(cyanLight);

        // Add additional accent lights
        const purpleLight = new THREE.PointLight(0x8000ff, 2, 15);
        purpleLight.position.set(0, 8, -15);
        this.scene.add(purpleLight);

        const blueLight = new THREE.PointLight(0x0080ff, 2, 15);
        blueLight.position.set(-15, 8, 0);
        this.scene.add(blueLight);
    }
} 