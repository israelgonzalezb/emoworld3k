// In your main game file (e.g., main.js or app.js)

import * as THREE from 'three';
import { Character } from './Character.js';
import { Portal } from './Portal.js';
import { createWaitingRoomScene } from './WaitingRoom.js';
// ... other imports

let camera, renderer, character;
let mainScene, waitingRoomScene;
let currentScene; // Reference to the scene currently being rendered/updated
let activePortals = []; // Portals in the current scene

const clock = new THREE.Clock();

// --- Scene Names and Spawn Points ---
const MAIN_AREA_NAME = 'mainArea';
const WAITING_ROOM_NAME = 'waitingRoom';
const mainAreaSpawnPoint = new THREE.Vector3(0, 1.0, 5); // Example spawn in main area
const waitingRoomSpawnPoint = new THREE.Vector3(0, 1.0, 0); // Example spawn in waiting room

function init() {
    // ... existing camera, renderer setup ...

    // --- Create Scenes ---
    mainScene = new THREE.Scene();
    mainScene.background = new THREE.Color(0x87ceeb); // Sky blue for main area
    // Add existing main area lights, floor (pier), etc., to mainScene
    // ... setup main scene content (like your pier) ...
    mainScene.userData.portals = []; // Initialize portal list


    waitingRoomScene = createWaitingRoomScene(MAIN_AREA_NAME, mainAreaSpawnPoint);
    // The waiting room scene creation function already adds its own return portal
    // We stored it in waitingRoomScene.userData.portals

    // --- Create Character ---
    // Character needs to be added to the *initial* scene
    character = new Character(mainScene); // Start character in the main scene
    character.characterGroup.position.copy(mainAreaSpawnPoint); // Set initial position
    character.characterState.x = mainAreaSpawnPoint.x;
    character.characterState.y = mainAreaSpawnPoint.y;
    character.characterState.z = mainAreaSpawnPoint.z;
    character.characterState.baseY = mainAreaSpawnPoint.y; // Update base Y


    // --- Create Portals ---
    // Portal in Main Area -> Waiting Room
    const portalToWaitingRoomPos = new THREE.Vector3(10, 1.5, -5); // Example position
    const portalToWaitingRoom = new Portal(
        mainScene,
        portalToWaitingRoomPos,
        1.2, // Size
        WAITING_ROOM_NAME,
        waitingRoomScene.userData.spawnPoint // Use spawn defined in waiting room creation
    );
    mainScene.userData.portals.push(portalToWaitingRoom);

    // --- Set Initial Scene ---
    currentScene = mainScene;
    activePortals = mainScene.userData.portals; // Initial active portals

    // ... event listeners, window resize ...

    animate(); // Start the loop
}

function switchScene(targetSceneName, targetSpawnPoint) {
    console.log(`Switching to ${targetSceneName} at ${targetSpawnPoint.x}, ${targetSpawnPoint.y}, ${targetSpawnPoint.z}`);

    // Remove character from the old scene
    currentScene.remove(character.characterGroup);

    // Find the target scene object
    let targetScene;
    if (targetSceneName === MAIN_AREA_NAME) {
        targetScene = mainScene;
    } else if (targetSceneName === WAITING_ROOM_NAME) {
        targetScene = waitingRoomScene;
    } else {
        console.error("Unknown target scene:", targetSceneName);
        return; // Don't switch if target is unknown
    }

    // Set the new current scene and its portals
    currentScene = targetScene;
    activePortals = currentScene.userData.portals || []; // Get portals from the new scene

    // Add character to the new scene
    currentScene.add(character.characterGroup);

    // Move character to the spawn point in the new scene
    character.characterGroup.position.copy(targetSpawnPoint);
    // IMPORTANT: Reset character's internal state coordinates as well
    character.characterState.x = targetSpawnPoint.x;
    character.characterState.y = targetSpawnPoint.y;
    character.characterState.z = targetSpawnPoint.z;
    character.characterState.baseY = targetSpawnPoint.y; // Assume spawn is on the ground
    character.characterState.velocity.set(0, 0, 0); // Stop movement upon teleport
    character.characterState.isJumping = false; // Ensure not stuck in jump state
    character.characterState.jumpVelocity = 0;

     // Optional: Update character's internal scene reference if it uses it
     // character.scene = currentScene;
}


function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();

    // --- Update Character & Check for Portal Activation ---
    if (character) {
        // Pass currently active portals for checking
        character.update(deltaTime, keys, camera, activePortals); // keys needs to be managed

        // Check portal activation (Moved here from Character.update for clarity)
        const characterPos = character.characterGroup.position;
        for (const portal of activePortals) {
             portal.update(deltaTime); // Update portal visuals/animations
             if (portal.checkForActivation(characterPos)) {
                 const target = portal.getTarget();
                 switchScene(target.sceneName, target.spawnPoint);
                 break; // Only activate one portal per frame
             }
        }
    }


    // Update other elements in the current scene if needed
    // e.g., update vinyls, speech bubbles associated with the character
    // You might need to adjust how Vinyls/SpeechBubbles are managed
    // if they should persist across scenes or be tied to a specific scene.


    // Render the CURRENT scene
    renderer.render(currentScene, camera);
}

// --- Key State Management (Example) ---
const keys = {};
document.addEventListener('keydown', (event) => keys[event.code] = true);
document.addEventListener('keyup', (event) => keys[event.code] = false);

// --- Start ---
init();