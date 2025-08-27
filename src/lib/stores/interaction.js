import { writable } from 'svelte/store';

/**
 * Interaction modes for the physics canvas
 */
export const InteractionMode = {
  NORMAL_BROWSING: 'normal_browsing',
  BALL_INTERACTION: 'ball_interaction'
};

// Current interaction mode store
export const interactionMode = writable(InteractionMode.NORMAL_BROWSING);

// Derived store to get pointer-events CSS value
export const canvasPointerEvents = writable('none');

// Optional override to lock pointer events regardless of mode
export const canvasPointerEventsOverride = writable(null); // 'auto' | 'none' | null

// Set up reactive connection between mode and pointer events
interactionMode.subscribe(mode => {
  // Respect override if set
  let pointerEventsOverrideValue;
  const unsubscribe = canvasPointerEventsOverride.subscribe(v => { pointerEventsOverrideValue = v; });
  unsubscribe();

  const pointerEvents = pointerEventsOverrideValue ?? (mode === InteractionMode.BALL_INTERACTION ? 'auto' : 'none');
  canvasPointerEvents.set(pointerEvents);
});

export function lockCanvasPointerEvents(value) {
  canvasPointerEventsOverride.set(value); // 'auto' | 'none' | null
  // Trigger recompute
  interactionMode.update(m => m);
}

/**
 * Utility functions to change interaction modes
 */
export function enableBallInteraction() {
  interactionMode.set(InteractionMode.BALL_INTERACTION);
}

export function enableNormalBrowsing() {
  interactionMode.set(InteractionMode.NORMAL_BROWSING);
}

/**
 * Temporary ball interaction (useful for brief interactions)
 * Automatically returns to normal browsing after a delay
 */
export function temporaryBallInteraction(durationMs = 2000) {
  enableBallInteraction();

  setTimeout(() => {
    enableNormalBrowsing();
  }, durationMs);
}