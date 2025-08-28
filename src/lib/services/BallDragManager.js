import Matter from 'matter-js';

export class BallDragManager {
  constructor(physicsEngine, canvas) {
    this.physicsEngine = physicsEngine;
    this.canvas = canvas;

    this.mouseConstraint = null;
    this.mouse = null;

    this.currentDraggedBall = null;
    this.dragMode = null; // 'mouse' or 'touch'

    this.debug = physicsEngine?.debugMode || false;
    this.log = this.debug ? console.log : () => { };

  }

  /*
   * Initialize drag manager using Matter.js MouseConstraint
   */
  start() {
    try {
      // Create Matter.js Mouse instance tied to canvas
      this.mouse = Matter.Mouse.create(this.canvas);

      // Verify mouse creation was successful
      if (!this.mouse) {
        console.error('BallDragManager: Failed to create Matter.js Mouse instance');
        return false;
      }

      // Create MouseConstraint with physics engine
      this.mouseConstraint = Matter.MouseConstraint.create(this.physicsEngine.engine, {
        mouse: this.mouse,
        constraint: {
          stiffness: 0.5,  // How "springy" the drag connection feels
        }
      });

      Matter.World.add(this.physicsEngine.world, this.mouseConstraint);

      // Subscribe to MouseConstraint events for visual feedback
      this.setupMouseConstraintEvents();

      return true;

    } catch (error) {
      console.error('BallDragManager: Error during initialization:', error);
      return false;
    }
  }

/*
 * Set up event listeners for Matter.js MouseConstraint events
 */
  setupMouseConstraintEvents() {
    // Listen for drag start
    Matter.Events.on(this.mouseConstraint, 'startdrag', (event) => {
      // Try different ways to access the dragged body
      let draggedBody = null;

      // @ts-ignore - event.body exists on Matter event at runtime
      if (event.body) {
        // @ts-ignore
        draggedBody = event.body;
      }

      this.currentDraggedBall = draggedBody;
      this.dragMode = this.dragMode || 'mouse';

      // Apply visual feedback - use defensive programming
      if (this.physicsEngine && typeof this.physicsEngine.setBallVisualState === 'function') {
        this.physicsEngine.setBallVisualState(draggedBody, 'dragged');
      }

      // Set cursor feedback
      if (document && document.body) {
        document.body.style.cursor = 'grabbing';
      }
    });

    // Listen for drag end with detailed logging
    Matter.Events.on(this.mouseConstraint, 'enddrag', (event) => {

      // Try different ways to access the released body
      let releasedBody = null;

      // @ts-ignore - event.body exists on Matter event at runtime
      if (event.body) {
        // @ts-ignore
        releasedBody = event.body;
      }

      // Clear visual feedbac
      if (this.physicsEngine && typeof this.physicsEngine.clearBallVisualState === 'function') {
        this.physicsEngine.clearBallVisualState(releasedBody);
      }

      if (document && document.body) {
        document.body.style.cursor = 'default';
      }

      this.currentDraggedBall = null;
      this.dragMode = null;
    });
  }

  /*
   * Clean up all event listeners and constraints
   */
  stop() {
    // Remove MouseConstraint from physics world
    if (this.mouseConstraint && this.physicsEngine && this.physicsEngine.world) {
      try {
        Matter.World.remove(this.physicsEngine.world, this.mouseConstraint);
      } catch (error) {
        console.warn('BallDragManager: Error removing MouseConstraint:', error);
      }
    }

    this.currentDraggedBall = null;
    this.dragMode = null;
    this.mouseConstraint = null;
    this.mouse = null;
  }
}