// WaitingRoom.js
import * as THREE from 'three';
import { createStandardMaterial, createBoxGeometry } from './utils.js'; // Use your utils
import { Portal } from './portal.js'; // Need portal to get back

export function createWaitingRoomScene(mainSceneName, mainAreaSpawnPoint) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc); // Bland office background color

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- Basic Office Geometry ---
    const floorSize = 20;
    const wallHeight = 5;

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMaterial = createStandardMaterial(0x888888, 1.0); // Simple grey floor
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Walls (using simple boxes)
    const wallMaterial = createStandardMaterial(0xd1d1d1, 1.0); // Off-white walls
    const wallThickness = 0.2;

    // Back Wall
    const backWall = new THREE.Mesh(
        createBoxGeometry(floorSize, wallHeight, wallThickness),
        wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, -floorSize / 2);
    scene.add(backWall);

    // Front Wall (with potential gap for entrance?) - let's make it solid for now
     const frontWall = new THREE.Mesh(
        createBoxGeometry(floorSize, wallHeight, wallThickness),
        wallMaterial
     );
     frontWall.position.set(0, wallHeight / 2, floorSize / 2);
     scene.add(frontWall);

    // Left Wall
    const leftWall = new THREE.Mesh(
        createBoxGeometry(wallThickness, wallHeight, floorSize),
        wallMaterial
    );
    leftWall.position.set(-floorSize / 2, wallHeight / 2, 0);
    scene.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(
        createBoxGeometry(wallThickness, wallHeight, floorSize),
        wallMaterial
    );
    rightWall.position.set(floorSize / 2, wallHeight / 2, 0);
    scene.add(rightWall);

     // --- Furniture --- (Very basic examples)
     const chairMaterial = createStandardMaterial(0x593a2a, 1.0); // Brownish
     const chairSeatGeo = createBoxGeometry(0.8, 0.2, 0.8);
     const chairBackGeo = createBoxGeometry(0.8, 1.0, 0.1);
     const legGeo = createBoxGeometry(0.1, 0.5, 0.1);

     function createChair(x, z, rotationY = 0) {
         const chairGroup = new THREE.Group();
         const seat = new THREE.Mesh(chairSeatGeo, chairMaterial);
         seat.position.y = 0.5; // Seat height
         chairGroup.add(seat);

         const back = new THREE.Mesh(chairBackGeo, chairMaterial);
         back.position.set(0, 1.0, -0.4); // Behind seat
         chairGroup.add(back);

         // Add legs (simple example)
         const leg1 = new THREE.Mesh(legGeo, chairMaterial); leg1.position.set(0.35, 0.25, 0.35); chairGroup.add(leg1);
         const leg2 = new THREE.Mesh(legGeo, chairMaterial); leg2.position.set(-0.35, 0.25, 0.35); chairGroup.add(leg2);
         const leg3 = new THREE.Mesh(legGeo, chairMaterial); leg3.position.set(0.35, 0.25, -0.35); chairGroup.add(leg3);
         const leg4 = new THREE.Mesh(legGeo, chairMaterial); leg4.position.set(-0.35, 0.25, -0.35); chairGroup.add(leg4);

         chairGroup.position.set(x, 0, z);
         chairGroup.rotation.y = rotationY;
         scene.add(chairGroup);
         return chairGroup;
     }

     createChair(-floorSize/2 + 2, -floorSize/2 + 3, Math.PI / 4);
     createChair(-floorSize/2 + 4, -floorSize/2 + 3, Math.PI / 4);
     createChair(-floorSize/2 + 6, -floorSize/2 + 3, Math.PI / 4);


    // --- Return Portal ---
    const returnPortalPosition = new THREE.Vector3(0, 1.5, floorSize / 2 - 2); // Near the front wall
    const returnPortal = new Portal(
        scene,
        returnPortalPosition,
        1.0, // Size of the portal
        mainSceneName, // Target scene name (passed in)
        mainAreaSpawnPoint // Target spawn point (passed in)
    );
    // Store portal reference in the scene for easy access during update
    scene.userData.portals = [returnPortal];
    scene.userData.spawnPoint = new THREE.Vector3(0, 1, 0); // Default spawn point inside the room

    return scene;
}