import { writable, derived } from 'svelte/store';

/**
 * Ball Queue Store - Manages the gravity chute ball collection system
 * 
 * This store handles:
 * - Tracking balls waiting in the chute
 * - Queue capacity management (max 3 balls)
 * - Ball visual data for rendering in the chute
 * - Release operations
 */

// Maximum number of balls that can be stored in the chute
const MAX_QUEUE_CAPACITY = 5;

/**
 * Core queue state - array of ball objects waiting in the chute
 * Each ball object contains visual data needed for rendering
 */
export const ballQueue = writable([]);

/**
 * Derived store: Current number of balls in queue
 * Useful for UI components that need to show queue status
 */
export const queueLength = derived(
  ballQueue,
  ($ballQueue) => $ballQueue.length
);

/**
 * Derived store: Can we collect more balls?
 * Returns false when queue is at capacity
 */
export const canCollectBalls = derived(
  queueLength,
  ($queueLength) => $queueLength < MAX_QUEUE_CAPACITY
);

/**
 * Derived store: Can we release a ball?
 * Returns false when queue is empty
 */
export const canReleaseBall = derived(
  queueLength,
  ($queueLength) => $queueLength > 0
);

/**
 * Add a ball to the queue (called when ball falls into drain hole)
 * @param {Object} ballData - Visual data for the ball (color, size, etc.)
 * @returns {boolean} - Success/failure based on queue capacity
 */
export function addBallToQueue(ballData) {
  let success = false;
  
  ballQueue.update(currentQueue => {
    // Check if we have space in the queue
    if (currentQueue.length < MAX_QUEUE_CAPACITY) {
      // Add ball data to the end of the queue (bottom of chute visually)
      const newBall = {
        id: `queued-ball-${Date.now()}`, // Unique identifier
        radius: ballData.radius || 32,
        color: ballData.color || '#ff6b6b',
        // Store timestamp for potential future features (aging, priority, etc.)
        queuedAt: Date.now(),
        ...ballData
      };
      
      currentQueue.push(newBall);
      success = true;
      
      console.log(`BallQueue: Ball added to queue. Queue length: ${currentQueue.length}`);
    } else {
      console.log('BallQueue: Queue is full, cannot add more balls');
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
      
      console.log(`BallQueue: Ball released from queue. Remaining: ${currentQueue.length}`);
    } else {
      console.log('BallQueue: Queue is empty, cannot release ball');
    }
    
    return currentQueue;
  });
  
  return releasedBall;
}

/**
 * Clear the entire queue (useful for reset functionality)
 * This might be needed if we implement a "clear all balls" feature
 */
export function clearQueue() {
  ballQueue.set([]);
  console.log('BallQueue: Queue cleared');
}

/**
 * Get queue status for debugging
 * @returns {Object} - Current queue statistics
 */
export function getQueueStatus() {
  let status = {};
  
  ballQueue.subscribe(currentQueue => {
    status = {
      length: currentQueue.length,
      capacity: MAX_QUEUE_CAPACITY,
      canCollect: currentQueue.length < MAX_QUEUE_CAPACITY,
      canRelease: currentQueue.length > 0,
      balls: currentQueue.map(ball => ({
        id: ball.id,
        queuedAt: ball.queuedAt
      }))
    };
  })();
  
  return status;
}