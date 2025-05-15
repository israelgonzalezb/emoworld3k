import * as THREE from 'three';
import { createStandardMaterial, createBoxGeometry, createCylinderGeometry, createPlaneGeometry } from './utils.js';

export class Pier {
    constructor(scene) {
        this.scene = scene;
        this.createPier();
        this.createWater();
    }

    createWater() {
        // Create water plane
        const waterGeometry = createPlaneGeometry(200, 200);
        const waterMaterial = createStandardMaterial(0x0077ff, 0.3, 0.2, 0x003366, 0.2);
        waterMaterial.side = THREE.DoubleSide;
        waterMaterial.transparent = true;
        waterMaterial.opacity = 0.8;
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -0.1;
        this.scene.add(water);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(200, 200, 0x00ffff, 0x00ffff);
        gridHelper.position.y = -0.09; // Slightly above the water
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);
    }

    createPier() {
        // Create pier group
        this.pierGroup = new THREE.Group();
        
        // Main pier platform
        const pierGeometry = createBoxGeometry(40, 0.5, 20);
        const pierMaterial = createStandardMaterial(0x8B4513, 0.7, 0.2);
        pierMaterial.side = THREE.DoubleSide;
        pierMaterial.depthWrite = true;
        pierMaterial.depthTest = true;
        
        const pierPlatform = new THREE.Mesh(pierGeometry, pierMaterial);
        pierPlatform.position.y = 0;
        pierPlatform.renderOrder = 1;
        pierPlatform.userData.isCollidable = true;
        this.pierGroup.add(pierPlatform);
        
        // Create pier supports
        const supportGeometry = createCylinderGeometry(0.2, 0.2, 1, 8);
        const supportMaterial = createStandardMaterial(0x6B3E14, 0.8);
        
        // Add supports at corners and middle
        const supportPositions = [
            // Front supports
            [-20, -0.25, 10], [-10, -0.25, 10], [0, -0.25, 10], [10, -0.25, 10], [20, -0.25, 10],
            // Back supports
            [-20, -0.25, -10], [-10, -0.25, -10], [0, -0.25, -10], [10, -0.25, -10], [20, -0.25, -10],
            // Middle supports
            [-20, -0.25, 0], [-10, -0.25, 0], [0, -0.25, 0], [10, -0.25, 0], [20, -0.25, 0],
            // Additional supports for stability
            [-15, -0.25, 5], [-5, -0.25, 5], [5, -0.25, 5], [15, -0.25, 5],
            [-15, -0.25, -5], [-5, -0.25, -5], [5, -0.25, -5], [15, -0.25, -5]
        ];
        
        supportPositions.forEach(pos => {
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            support.position.set(pos[0], pos[1], pos[2]);
            this.pierGroup.add(support);
        });
        
        // Add railings
        this.addRailings();
        
        // Add pier to scene
        this.scene.add(this.pierGroup);
    }

    addRailings() {
        // Railing material with emissive for neon effect
        const railingMaterial = createStandardMaterial(0x333333, 0.5, 0.8, 0x00ffff, 0.2);
        
        // Top railing
        const topRailingGeometry = createBoxGeometry(40, 0.1, 0.1);
        const frontTopRailing = new THREE.Mesh(topRailingGeometry, railingMaterial);
        frontTopRailing.position.set(0, 1.25, 10);
        frontTopRailing.userData.isCollidable = true;
        this.pierGroup.add(frontTopRailing);
        
        const backTopRailing = new THREE.Mesh(topRailingGeometry, railingMaterial);
        backTopRailing.position.set(0, 1.25, -10);
        backTopRailing.userData.isCollidable = true;
        this.pierGroup.add(backTopRailing);
        
        const leftTopRailing = new THREE.Mesh(createBoxGeometry(0.1, 0.1, 20), railingMaterial);
        leftTopRailing.position.set(-20, 1.25, 0);
        leftTopRailing.userData.isCollidable = true;
        this.pierGroup.add(leftTopRailing);
        
        const rightTopRailing = new THREE.Mesh(createBoxGeometry(0.1, 0.1, 20), railingMaterial);
        rightTopRailing.position.set(20, 1.25, 0);
        rightTopRailing.userData.isCollidable = true;
        this.pierGroup.add(rightTopRailing);
        
        // Vertical posts
        const postGeometry = createBoxGeometry(0.1, 1, 0.1);
        const postPositions = [
            // Front posts
            [-20, 0.75, 10], [-15, 0.75, 10], [-10, 0.75, 10], [-5, 0.75, 10],
            [0, 0.75, 10], [5, 0.75, 10], [10, 0.75, 10], [15, 0.75, 10], [20, 0.75, 10],
            // Back posts
            [-20, 0.75, -10], [-15, 0.75, -10], [-10, 0.75, -10], [-5, 0.75, -10],
            [0, 0.75, -10], [5, 0.75, -10], [10, 0.75, -10], [15, 0.75, -10], [20, 0.75, -10],
            // Side posts
            [-20, 0.75, 0], [-20, 0.75, -5], [-20, 0.75, 5],
            [20, 0.75, 0], [20, 0.75, -5], [20, 0.75, 5]
        ];
        
        postPositions.forEach(pos => {
            const post = new THREE.Mesh(postGeometry, railingMaterial);
            post.position.set(pos[0], pos[1], pos[2]);
            post.userData.isCollidable = true;
            this.pierGroup.add(post);
        });
    }
} 