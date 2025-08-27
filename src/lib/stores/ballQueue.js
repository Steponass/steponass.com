import { writable, derived } from 'svelte/store';

// Maximum number of balls that can be stored in the chute
const MAX_QUEUE_CAPACITY = 18;

/*
 * Core queue state - array of ball objects waiting in the chute
 */
export const ballQueue = writable([]);

/*
 * Derived store: Current number of balls in queue
 */
export const queueLength = derived(
  ballQueue,
  ($ballQueue) => $ballQueue.length
);

/*
 * Derived store: Can we collect more balls?
 * Returns false when queue is at capacity
 */
export const canCollectBalls = derived(
  queueLength,
  ($queueLength) => $queueLength < MAX_QUEUE_CAPACITY
);

/*
 * Derived store: Can we release a ball?
 * Returns false when queue is empty
 */
export const canReleaseBall = derived(
  queueLength,
  ($queueLength) => $queueLength > 0
);

/*
 * Add a ball to the queue (called when ball falls into drain hole)
 * @param {Object} ballData - Visual data for the ball (color, size, etc.)
 * @returns {boolean} - Success/failure based on queue capacity
 */
export function addBallToQueue(ballData) {
  let success = false;

  ballQueue.update(currentQueue => {
    if (currentQueue.length < MAX_QUEUE_CAPACITY) {
      const newBall = {
        id: `queued-ball-${Date.now()}`,
        radius: ballData.radius || 22,
        color: ballData.color || '#ff6b6b',
        queuedAt: Date.now(),
        ...ballData
      };

      currentQueue.push(newBall);
      success = true;
    }

    return currentQueue;
  });

  return success;
}

/**
 * Remove the next ball from queue (called when user releases a ball)
 * Uses FIFO (First In, First Out) - oldest ball gets released first
 * @returns {Object|null} - Ball data for physics creation, or null if queue empty
 */
export function releaseBallFromQueue() {
  let releasedBall = null;

  ballQueue.update(currentQueue => {
    if (currentQueue.length > 0) {
      // Remove the first ball (oldest, top of the visual queue)
      releasedBall = currentQueue.shift();
    }

    return currentQueue;
  });

  return releasedBall;
}