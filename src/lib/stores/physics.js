import { writable } from 'svelte/store';

export const physicsEngine = writable(null);
export const physicsEnabled = writable(false);