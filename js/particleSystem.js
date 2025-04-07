// ParticleSystem.js
import * as THREE from 'three';

export class ParticleSystem {
    constructor(parent, options = {}) {
        this.parent = parent; // The object particles should be relative to (or the scene)
        this.options = {
            particleCount: options.particleCount || 500,
            color: options.color || new THREE.Color(0xffffff),
            secondaryColor: options.secondaryColor, // Optional second color
            size: options.size || 0.1,
            spawnRadius: options.spawnRadius || 1,
            lifetime: options.lifetime || 2,
            velocity: options.velocity || new THREE.Vector3(0, 1, 0), // Base velocity
            velocitySpread: options.velocitySpread || new THREE.Vector3(0.5, 0.5, 0.5),
            gravity: options.gravity || -0.5, // Simple downward pull
            blending: options.blending || THREE.NormalBlending,
            texture: options.texture, // Optional THREE.Texture
            opacity: options.opacity || 1.0
        };

        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: this.options.size,
            vertexColors: true, // Use colors defined per particle
            transparent: true,
            opacity: this.options.opacity,
            blending: this.options.blending,
            sizeAttenuation: true, // Particles smaller further away
            map: this.options.texture,
            depthWrite: false // Often looks better for additive blending
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.parent.add(this.points);

        this.positions = new Float32Array(this.options.particleCount * 3);
        this.colors = new Float32Array(this.options.particleCount * 3);
        this.velocities = [];
        this.ages = new Float32Array(this.options.particleCount);
        this.lifetimes = new Float32Array(this.options.particleCount);

        // Initialize particles off-screen or inactive
        for (let i = 0; i < this.options.particleCount; i++) {
            this.ages[i] = this.options.lifetime; // Start as "dead"
            this.positions[i * 3 + 1] = -9999; // Position off-screen
        }
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    }

    spawnParticle(index) {
        const i3 = index * 3;

        // Initial Position (randomly on a sphere surface within spawnRadius)
        const pos = new THREE.Vector3(
            (Math.random() - 0.5),
            (Math.random() - 0.5),
            (Math.random() - 0.5)
        ).normalize().multiplyScalar(this.options.spawnRadius * (0.8 + Math.random() * 0.4)); // Spawn in a shell

        this.positions[i3 + 0] = pos.x;
        this.positions[i3 + 1] = pos.y;
        this.positions[i3 + 2] = pos.z;

        // Color
        const color = this.options.secondaryColor && Math.random() > 0.5 ? this.options.secondaryColor : this.options.color;
        this.colors[i3 + 0] = color.r;
        this.colors[i3 + 1] = color.g;
        this.colors[i3 + 2] = color.b;

        // Velocity (base + random spread)
        this.velocities[index] = new THREE.Vector3(
            this.options.velocity.x + (Math.random() - 0.5) * this.options.velocitySpread.x,
            this.options.velocity.y + (Math.random() - 0.5) * this.options.velocitySpread.y,
            this.options.velocity.z + (Math.random() - 0.5) * this.options.velocitySpread.z
        );

        // Age and Lifetime
        this.ages[index] = 0;
        this.lifetimes[index] = this.options.lifetime * (0.5 + Math.random() * 0.5); // Vary lifetime slightly
    }

    update(deltaTime) {
        let needsRespawn = 0;
        for (let i = 0; i < this.options.particleCount; i++) {
            this.ages[i] += deltaTime;
            if (this.ages[i] >= this.lifetimes[i]) {
                // Particle is dead, mark for respawn
                this.positions[i * 3 + 1] = -9999; // Move off-screen
                needsRespawn++;
                continue; // Skip update for dead particle
            }

            const i3 = i * 3;

            // Update position based on velocity and gravity
            this.velocities[i].y += this.options.gravity * deltaTime; // Apply gravity
            this.positions[i3 + 0] += this.velocities[i].x * deltaTime;
            this.positions[i3 + 1] += this.velocities[i].y * deltaTime;
            this.positions[i3 + 2] += this.velocities[i].z * deltaTime;

            // Fade out (optional) - Adjust opacity via material or shader later if needed
            // For now, color attribute alpha isn't directly used by PointsMaterial opacity
            // Could fade color to black instead
            const lifeRatio = this.ages[i] / this.lifetimes[i];
            const fadeFactor = 1.0 - lifeRatio;
            // Example: Fade color - This requires vertexColors to be effective
             this.colors[i3 + 0] *= fadeFactor;
             this.colors[i3 + 1] *= fadeFactor;
             this.colors[i3 + 2] *= fadeFactor;
        }

        // Respawn dead particles
        let respawnCounter = 0;
        if (needsRespawn > 0) {
            for (let i = 0; i < this.options.particleCount && respawnCounter < needsRespawn * 2 * deltaTime; i++) { // Spawn based on time passed
                 if (this.ages[i] >= this.lifetimes[i]) {
                     this.spawnParticle(i);
                     respawnCounter++;
                 }
             }
        }


        // Update geometry attributes
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    dispose() {
        this.parent.remove(this.points);
        this.geometry.dispose();
        this.material.dispose();
        // Dispose texture if loaded
    }
}