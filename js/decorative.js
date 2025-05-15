import * as THREE from 'three';
import { createStandardMaterial, createBoxGeometry, createCylinderGeometry, createSphereGeometry, createPlaneGeometry } from './utils.js';

export class DecorativeElements {
    constructor(scene) {
        this.scene = scene;
        this.createDecorations();
    }

    createDecorations() {
        // Create decorative group
        this.decorativeGroup = new THREE.Group();
        
        // Add benches along the pier
        this.addBenches();
        
        // Add trash bins
        this.addTrashBins();
        
        // Add lamp posts
        this.addLampPosts();
        
        // Add the scene
        this.scene.add(this.decorativeGroup);
    }

    addBenches() {
        const benchMaterial = createStandardMaterial(0x8B4513, 0.7, 0.2);
        
        // Create bench geometry
        const benchGeometry = createBoxGeometry(2, 0.4, 0.5);
        const benchBackGeometry = createBoxGeometry(2, 0.8, 0.1);
        
        // Add benches along the pier
        const benchPositions = [
            [-15, 0.2, 8], [-5, 0.2, 8], [5, 0.2, 8], [15, 0.2, 8],
            [-15, 0.2, -8], [-5, 0.2, -8], [5, 0.2, -8], [15, 0.2, -8]
        ];
        
        benchPositions.forEach(pos => {
            const bench = new THREE.Group();
            
            // Bench seat
            const seat = new THREE.Mesh(benchGeometry, benchMaterial);
            seat.position.set(0, 0.2, 0);
            bench.add(seat);
            
            // Bench back
            const back = new THREE.Mesh(benchBackGeometry, benchMaterial);
            back.position.set(0, 0.6, -0.2);
            bench.add(back);
            
            // Bench legs
            const legGeometry = createBoxGeometry(0.1, 0.4, 0.1);
            const legMaterial = createStandardMaterial(0x6B3E14, 0.8);
            
            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.9, 0, 0);
            bench.add(leftLeg);
            
            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.9, 0, 0);
            bench.add(rightLeg);
            
            bench.position.set(pos[0], pos[1], pos[2]);
            bench.userData.isCollidable = true;
            this.decorativeGroup.add(bench);
        });
    }

    addTrashBins() {
        const binMaterial = createStandardMaterial(0x333333, 0.8);
        const binGeometry = createBoxGeometry(0.4, 0.8, 0.4);
        
        const binPositions = [
            [-18, 0.4, 8], [-8, 0.4, 8], [8, 0.4, 8], [18, 0.4, 8],
            [-18, 0.4, -8], [-8, 0.4, -8], [8, 0.4, -8], [18, 0.4, -8]
        ];
        
        binPositions.forEach(pos => {
            const bin = new THREE.Mesh(binGeometry, binMaterial);
            bin.position.set(pos[0], pos[1], pos[2]);
            this.decorativeGroup.add(bin);
        });
    }

    addLampPosts() {
        const lampMaterial = createStandardMaterial(0xCCCCCC, 0.8);
        const lampLightMaterial = createStandardMaterial(0xFFFF00, 0.5, 0.8, 0xFFFF00, 0.5);
        
        const lampPositions = [
            [-15, 0, 9], [-5, 0, 9], [5, 0, 9], [15, 0, 9],
            [-15, 0, -9], [-5, 0, -9], [5, 0, -9], [15, 0, -9]
        ];
        
        lampPositions.forEach(pos => {
            const lamp = new THREE.Group();
            
            // Lamp post
            const post = new THREE.Mesh(createBoxGeometry(0.1, 2, 0.1), lampMaterial);
            post.position.set(0, 1, 0);
            lamp.add(post);
            
            // Lamp head
            const head = new THREE.Mesh(createBoxGeometry(0.4, 0.1, 0.4), lampMaterial);
            head.position.set(0, 2, 0);
            lamp.add(head);
            
            // Lamp light
            const light = new THREE.Mesh(createBoxGeometry(0.3, 0.1, 0.3), lampLightMaterial);
            light.position.set(0, 2.05, 0);
            lamp.add(light);
            
            lamp.position.set(pos[0], pos[1], pos[2]);
            this.decorativeGroup.add(lamp);
        });
    }

    addPalmTree(x, y, z) {
        const palmGroup = new THREE.Group();
        
        // Trunk
        const trunkGeometry = createCylinderGeometry(0.1, 0.15, 2, 8);
        const trunkMaterial = createStandardMaterial(0x8B4513, 0.8);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        palmGroup.add(trunk);
        
        // Leaves
        const leafMaterial = createStandardMaterial(0x00AA00, 0.7, 0.2, 0x003300, 0.2);
        
        for (let i = 0; i < 5; i++) {
            const leafGeometry = createBoxGeometry(0.8, 0.05, 0.3);
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.y = 2;
            leaf.rotation.y = (i / 5) * Math.PI * 2;
            leaf.rotation.x = -0.2;
            leaf.position.x = Math.sin(leaf.rotation.y) * 0.5;
            leaf.position.z = Math.cos(leaf.rotation.y) * 0.5;
            palmGroup.add(leaf);
        }
        
        palmGroup.position.set(x, y, z);
        this.scene.add(palmGroup);
    }

    addBeachChair(x, y, z) {
        const chairGroup = new THREE.Group();
        
        // Chair base
        const baseGeometry = createBoxGeometry(0.8, 0.1, 1.5);
        const chairMaterial = createStandardMaterial(0xFFD700, 0.5, 0.2, 0x332200, 0.1);
        const base = new THREE.Mesh(baseGeometry, chairMaterial);
        base.position.y = 0.05;
        chairGroup.add(base);
        
        // Chair back
        const backGeometry = createBoxGeometry(0.8, 0.8, 0.1);
        const back = new THREE.Mesh(backGeometry, chairMaterial);
        back.position.set(0, 0.4, -0.7);
        back.rotation.x = Math.PI / 6;
        chairGroup.add(back);
        
        chairGroup.position.set(x, y, z);
        this.scene.add(chairGroup);
    }

    addKiosk(x, y, z) {
        const kioskGroup = new THREE.Group();
        
        // Kiosk base
        const baseGeometry = createBoxGeometry(2, 1.5, 1.5);
        const baseMaterial = createStandardMaterial(0x1E90FF, 0.5, 0.2, 0x001133, 0.2);
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.75;
        kioskGroup.add(base);
        
        // Kiosk roof
        const roofGeometry = createBoxGeometry(2.4, 0.1, 1.9);
        const roofMaterial = createStandardMaterial(0xFF6347, 0.7, 0.2, 0x330000, 0.1);
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.55;
        kioskGroup.add(roof);
        
        // Counter
        const counterGeometry = createBoxGeometry(2, 0.1, 0.5);
        const counterMaterial = createStandardMaterial(0xDEB887, 0.6);
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);
        counter.position.set(0, 1, 0.8);
        kioskGroup.add(counter);
        
        kioskGroup.position.set(x, y, z);
        this.scene.add(kioskGroup);
    }

    addBoat(x, y, z) {
        const boatGroup = new THREE.Group();
        
        // Boat hull
        const hullGeometry = createBoxGeometry(2, 0.5, 1);
        const hullMaterial = createStandardMaterial(0x964B00, 0.7);
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 0.25;
        boatGroup.add(hull);
        
        // Boat interior
        const interiorGeometry = createBoxGeometry(1.8, 0.2, 0.8);
        const interiorMaterial = createStandardMaterial(0xDEB887, 0.6);
        const interior = new THREE.Mesh(interiorGeometry, interiorMaterial);
        interior.position.y = 0.4;
        boatGroup.add(interior);
        
        boatGroup.position.set(x, y, z);
        this.scene.add(boatGroup);
    }

    addFishingSpot(x, y, z) {
        const fishingGroup = new THREE.Group();
        
        // Fishing rod
        const rodGeometry = createCylinderGeometry(0.02, 0.02, 1.5, 8);
        const rodMaterial = createStandardMaterial(0x8B4513, 0.8);
        const rod = new THREE.Mesh(rodGeometry, rodMaterial);
        rod.position.y = 0.75;
        rod.rotation.x = -Math.PI / 4;
        rod.rotation.z = Math.PI / 10;
        fishingGroup.add(rod);
        
        // Fishing line
        const lineGeometry = new THREE.BufferGeometry();
        const linePoints = [
            new THREE.Vector3(0, 1.5, -0.75),
            new THREE.Vector3(0.2, 0.5, -1.5),
            new THREE.Vector3(0.2, 0, -1.5)
        ];
        lineGeometry.setFromPoints(linePoints);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        fishingGroup.add(line);
        
        fishingGroup.position.set(x, y, z);
        this.scene.add(fishingGroup);
    }

    addBeachBall(x, y, z) {
        const ballGeometry = createSphereGeometry(0.3, 16, 16);
        const ballMaterial = createStandardMaterial(0xFF6347, 0.4, 0.2, 0x330000, 0.1);
        const ball = new THREE.Mesh(ballGeometry, ballMaterial);
        ball.position.set(x, y + 0.3, z);
        this.scene.add(ball);
        
        // Store for animation
        this.beachBall = ball;
    }

    addNeonSign(x, y, z, text, color) {
        const signGroup = new THREE.Group();
        
        // Sign background
        const backGeometry = createBoxGeometry(text.length * 0.5, 0.8, 0.1);
        const backMaterial = createStandardMaterial(0x111111, 0.9, 0.2);
        const back = new THREE.Mesh(backGeometry, backMaterial);
        signGroup.add(back);
        
        // Create neon text effect with small cubes
        const textGroup = new THREE.Group();
        const cubeSize = 0.1;
        const letterSpacing = 0.25;
        const startX = -(text.length - 1) * letterSpacing / 2;
        
        // Simple pixel font patterns for each letter
        const patterns = {
            'P': [
                [1,1,1],
                [1,0,1],
                [1,1,1],
                [1,0,0],
                [1,0,0]
            ],
            'I': [
                [1,1,1],
                [0,1,0],
                [0,1,0],
                [0,1,0],
                [1,1,1]
            ],
            'E': [
                [1,1,1],
                [1,0,0],
                [1,1,1],
                [1,0,0],
                [1,1,1]
            ],
            'R': [
                [1,1,1],
                [1,0,1],
                [1,1,1],
                [1,0,1],
                [1,0,1]
            ],
            'B': [
                [1,1,0],
                [1,0,1],
                [1,1,0],
                [1,0,1],
                [1,1,0]
            ],
            'O': [
                [1,1,1],
                [1,0,1],
                [1,0,1],
                [1,0,1],
                [1,1,1]
            ],
            'Y': [
                [1,0,1],
                [1,0,1],
                [0,1,0],
                [0,1,0],
                [0,1,0]
            ]
        };
        
        const cubeMaterial = createStandardMaterial(color, 0.3, 0.8, color, 1);
        
        for (let i = 0; i < text.length; i++) {
            const letter = text[i];
            const pattern = patterns[letter];
            
            if (pattern) {
                for (let row = 0; row < pattern.length; row++) {
                    for (let col = 0; col < pattern[row].length; col++) {
                        if (pattern[row][col]) {
                            const cube = new THREE.Mesh(
                                createBoxGeometry(cubeSize, cubeSize, cubeSize),
                                cubeMaterial
                            );
                            cube.position.set(
                                startX + i * letterSpacing + (col - 1) * cubeSize,
                                0.2 - row * cubeSize,
                                0.1
                            );
                            textGroup.add(cube);
                        }
                    }
                }
            }
        }
        
        signGroup.add(textGroup);
        signGroup.position.set(x, y, z);
        signGroup.rotation.y = Math.PI;
        this.scene.add(signGroup);
    }

    update(deltaTime) {
        // Animate beach ball
        if (this.beachBall) {
            const time = Date.now() * 0.001;
            this.beachBall.position.y = 0.3 + Math.sin(time * 2) * 0.05;
            this.beachBall.rotation.y += deltaTime;
        }
    }
} 