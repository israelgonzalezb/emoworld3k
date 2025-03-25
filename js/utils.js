import * as THREE from 'three';

// Utility functions for the EBOY Pier scene

export function createStandardMaterial(color, roughness = 0.7, metalness = 0.2, emissive = 0x000000, emissiveIntensity = 0) {
    return new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness,
        metalness: metalness,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity
    });
}

export function createBoxGeometry(width, height, depth) {
    return new THREE.BoxGeometry(width, height, depth);
}

export function createCylinderGeometry(radiusTop, radiusBottom, height, radialSegments = 8) {
    return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
}

export function createSphereGeometry(radius, widthSegments = 16, heightSegments = 16) {
    return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
}

export function createPlaneGeometry(width, height) {
    return new THREE.PlaneGeometry(width, height);
} 