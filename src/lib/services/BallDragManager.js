/**
 * BallDragManager - Enhanced wrapper around Matter.js MouseConstraint
 * Fixed version with proper error handling and realistic API usage
 */

import Matter from 'matter-js';

export class BallDragManager {
  constructor(physicsEngine, canvas) {
    this.physicsEngine = physicsEngine;
    this.canvas = canvas;

    // Matter.js MouseConstraint system
    this.mouseConstraint = null;
    this.mouse = null;

    // No custom touch handling

    // State tracking
    this.currentDraggedBall = null;
    this.dragMode = null; // 'mouse' or 'touch'

    // Configuration
    this.debug = physicsEngine?.debugMode || false;
    this.log = this.debug ? console.log : () => { };

    // No custom touch handling fields
  }

  /**
   * Enable/disable generic touch event handlers
   */
  setEnableTouchHandlers(enable) { }

  /**
   * Initialize the drag manager using Matter.js MouseConstraint
   */
  start() {
    // Defensive programming: check all our dependencies exist
    if (!this.canvas) {
      console.error('BallDragManager: Canvas is required but not provided');
      return false;
    }

    if (!this.physicsEngine) {
      console.error('BallDragManager: PhysicsEngine is required but not provided');
      return false;
    }

    if (!this.physicsEngine.world) {
      console.error('BallDragManager: PhysicsEngine world is not initialized');
      return false;
    }

    if (!this.physicsEngine.engine) {
      console.error('BallDragManager: PhysicsEngine engine is not initialized');
      return false;
    }

    this.log('BallDragManager: Starting with Matter.js MouseConstraint system');

    try {
      // Create Matter.js Mouse instance tied to our canvas
      this.mouse = Matter.Mouse.create(this.canvas);

      // Verify mouse creation was successful
      if (!this.mouse) {
        console.error('BallDragManager: Failed to create Matter.js Mouse instance');
        return false;
      }

      // Create MouseConstraint with our physics engine
      this.mouseConstraint = Matter.MouseConstraint.create(this.physicsEngine.engine, {
        mouse: this.mouse,
        constraint: {
          stiffness: 1,     // How "springy" the drag connection feels
          render: {
            visible: this.debug  // Show constraint visually in debug mode
          }
        }
      });

      // Verify constraint creation was successful
      if (!this.mouseConstraint) {
        console.error('BallDragManager: Failed to create MouseConstraint');
        return false;
      }

      // Add the MouseConstraint to the physics world
      Matter.World.add(this.physicsEngine.world, this.mouseConstraint);

      // Subscribe to MouseConstraint events for our visual feedback
      this.setupMouseConstraintEvents();

      this.log('BallDragManager: Initialization complete');
      return true;

    } catch (error) {
      console.error('BallDragManager: Error during initialization:', error);
      return false;
    }
  }

  /**
 * Set up event listeners for Matter.js MouseConstraint events
 */
  setupMouseConstraintEvents() {
    if (!this.mouseConstraint) {
      console.warn('BallDragManager: Cannot setup events without mouseConstraint');
      return;
    }

    // Listen for drag start with detailed logging
    Matter.Events.on(this.mouseConstraint, 'startdrag', (event) => {
      this.log('BallDragManager: startdrag event');

      // Try different ways to access the dragged body
      let draggedBody = null;

      // Method 1: Direct access (what documentation suggests)
      // @ts-ignore - event.body exists on Matter event at runtime
      if (event.body) {
        // @ts-ignore
        draggedBody = event.body;
        this.log('BallDragManager: DIAGNOSTIC - Found body via direct access');
      }
      // Method 2: Through source property
      else if (event.source && event.source.body) {
        // @ts-ignore
        draggedBody = event.source.body;
        this.log('BallDragManager: DIAGNOSTIC - Found body via source.body');
      }
      // Method 3: Through mouse constraint property
      else if (this.mouseConstraint && this.mouseConstraint.body) {
        draggedBody = this.mouseConstraint.body;
        this.log('BallDragManager: DIAGNOSTIC - Found body via mouseConstraint.body');
      }

      if (!draggedBody) {
        console.warn('BallDragManager: DIAGNOSTIC - Could not find dragged body through any method');
        return;
      }

      this.log('BallDragManager: Drag started on body:', draggedBody.label || 'unlabeled');

      // Update our state tracking
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
      this.log('BallDragManager: enddrag event');

      // Try different ways to access the released body
      let releasedBody = null;

      // Method 1: Direct access (what documentation suggests)
      // @ts-ignore - event.body exists on Matter event at runtime
      if (event.body) {
        // @ts-ignore
        releasedBody = event.body;
        this.log('BallDragManager: DIAGNOSTIC - Found body via direct access');
      }
      // Method 2: Through source property
      else if (event.source && event.source.body) {
        // @ts-ignore
        releasedBody = event.source.body;
        this.log('BallDragManager: DIAGNOSTIC - Found body via source.body');
      }
      // Method 3: Use the body we tracked during drag start
      else if (this.currentDraggedBall) {
        releasedBody = this.currentDraggedBall;
        this.log('BallDragManager: DIAGNOSTIC - Using tracked body from drag start');
      }

      if (!releasedBody) {
        console.warn('BallDragManager: DIAGNOSTIC - Could not find released body through any method');
        return;
      }

      this.log('BallDragManager: Drag ended on body:', releasedBody.label || 'unlabeled');

      // Clear visual feedback - use defensive programming
      if (this.physicsEngine && typeof this.physicsEngine.clearBallVisualState === 'function') {
        this.physicsEngine.clearBallVisualState(releasedBody);
      }

      // Reset cursor
      if (document && document.body) {
        document.body.style.cursor = 'default';
      }

      // Clear our state tracking
      this.currentDraggedBall = null;
      this.dragMode = null;
    });
  }




  // Removed touch gesture handlers


  /**
   * Handle ball hit notification from TouchHitDetection
   * Called when a touch definitely hits a ball
   * @param {Object} ball - The Matter.js ball that was hit
   * @param {Object} position - Canvas-relative touch position {x, y}
   */
  handleBallHit(ball, position) {
    this.log(`BallDragManager: Ball hit detected for ${ball.label || 'unlabeled ball'}`);

    // Set visual feedback immediately
    if (this.physicsEngine && typeof this.physicsEngine.setBallVisualState === 'function') {
      this.physicsEngine.setBallVisualState(ball, 'dragged');
    }

    // Track the ball we're dragging
    this.currentDraggedBall = ball;
    this.dragMode = 'touch-hit';

    // Set cursor feedback for touch devices (some support it)
    if (document && document.body) {
      document.body.style.cursor = 'grabbing';
    }

    this.log(`BallDragManager: Ball ${ball.label} ready for dragging`);

    // Manual touch drag removed
  }

  /**
   * Handle touch end notification from TouchHitDetection
   * Called when the touch that hit a ball ends
   * @param {Object} ball - The Matter.js ball that was being touched
   */
  handleTouchEnd(ball) {
    this.log(`BallDragManager: Touch ended for ${ball.label || 'unlabeled ball'}`);

    // Clear visual feedback
    if (this.physicsEngine && typeof this.physicsEngine.clearBallVisualState === 'function') {
      this.physicsEngine.clearBallVisualState(ball);
    }

    // Reset cursor
    if (document && document.body) {
      document.body.style.cursor = 'default';
    }

    // Clear tracking state
    this.currentDraggedBall = null;
    this.dragMode = null;

    this.log('BallDragManager: Touch drag session ended');

    // No manual constraint used
  }


  /**
   * Clean up all event listeners and constraints
   */
  stop() {
    this.log('BallDragManager: Stopping drag manager');

    // No touch listeners to remove

    // Remove MouseConstraint from physics world
    if (this.mouseConstraint && this.physicsEngine && this.physicsEngine.world) {
      try {
        Matter.World.remove(this.physicsEngine.world, this.mouseConstraint);
      } catch (error) {
        console.warn('BallDragManager: Error removing MouseConstraint:', error);
      }
    }

    // Reset state
    this.currentDraggedBall = null;
    this.dragMode = null;
    this.mouseConstraint = null;
    this.mouse = null;
  }

  /**
   * Matter.js mobile touch handling fix, adapted from
   * https://github.com/liabru/matter-js/issues/678 (Striffly, Jan 4, 2023)
   */
  // Removed touch override fix

  /**
   * Create a soft constraint from the ball to the touch point
   */
  // Removed manual touch drag helpers
}