// Svelte stores are objects with a subscribe method
// The writable store helper gives us set and update methods too
import { writable } from 'svelte/store';

// This store will hold our physics engine instance and state
export const physicsEngine = writable(null);
export const physicsEnabled = writable(false);