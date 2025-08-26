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
    
    // Touch gesture detection state (simplified for now)
    this.touchStartPosition = null;
    this.touchStartTime = null;
    this.touchMoveThreshold = 10;
    this.touchTimeThreshold = 150;
    
    // State tracking
    this.currentDraggedBall = null;
    this.dragMode = null; // 'mouse' or 'touch'
    
    // Configuration
    this.debug = physicsEngine?.debugMode || false;
    this.log = this.debug ? console.log : () => {};
    
    // Bind event handlers
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }
  
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
          stiffness: 0.2,     // How "springy" the drag connection feels
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
      
      // Add our simplified touch gesture detection
      this.setupTouchEventHandlers();
      
      this.log('BallDragManager: Initialization complete');
      return true;
      
    } catch (error) {
      console.error('BallDragManager: Error during initialization:', error);
      return false;
    }
  }
  
  /**
 * Set up event listeners for Matter.js MouseConstraint events
 * DIAGNOSTIC VERSION - This will show us the actual event structure
 */
setupMouseConstraintEvents() {
  if (!this.mouseConstraint) {
    console.warn('BallDragManager: Cannot setup events without mouseConstraint');
    return;
  }
  
  // Listen for drag start with detailed logging
  Matter.Events.on(this.mouseConstraint, 'startdrag', (event) => {
    this.log('BallDragManager: DIAGNOSTIC - Full startdrag event object:', event);
    this.log('BallDragManager: DIAGNOSTIC - Event keys:', Object.keys(event));
    
    // Try different ways to access the dragged body
    let draggedBody = null;
    
    // Method 1: Direct access (what documentation suggests)
    if (event.body) {
      draggedBody = event.body;
      this.log('BallDragManager: DIAGNOSTIC - Found body via direct access');
    }
    // Method 2: Through source property
    else if (event.source && event.source.body) {
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
    this.log('BallDragManager: DIAGNOSTIC - Full enddrag event object:', event);
    this.log('BallDragManager: DIAGNOSTIC - Event keys:', Object.keys(event));
    
    // Try different ways to access the released body
    let releasedBody = null;
    
    // Method 1: Direct access (what documentation suggests)
    if (event.body) {
      releasedBody = event.body;
      this.log('BallDragManager: DIAGNOSTIC - Found body via direct access');
    }
    // Method 2: Through source property
    else if (event.source && event.source.body) {
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
  



  /**
   * Set up simplified touch gesture detection
   * This is a basic implementation - we can enhance it later
   */
  setupTouchEventHandlers() {
    if (!this.canvas) return;
    
    // Add touch event listeners for gesture detection
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
  }
  
  /**
   * Simplified touch start handler
   */
  handleTouchStart(event) {
    if (event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    
    this.touchStartPosition = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    this.touchStartTime = Date.now();
    
    // For now, we'll let the MouseConstraint handle touch events naturally
    // This is a simplified approach - we can enhance gesture detection later
  }
  
  /**
   * Simplified touch move handler
   */
  handleTouchMove(event) {
    if (!this.touchStartPosition || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const currentPos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    
    // Basic gesture analysis
    const deltaX = currentPos.x - this.touchStartPosition.x;
    const deltaY = currentPos.y - this.touchStartPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If user is moving significantly and we detect likely drag intent,
    // prevent default to stop scrolling
    if (distance > this.touchMoveThreshold) {
      const isMoreVertical = Math.abs(deltaY) > Math.abs(deltaX) * 1.5;
      
      // If movement is not primarily vertical (which would suggest scrolling),
      // assume drag intent and prevent scrolling
      if (!isMoreVertical) {
        event.preventDefault();
        this.dragMode = 'touch';
      }
    }
  }
  
  /**
   * Simplified touch end handler
   */
  handleTouchEnd(event) {
    // Reset touch tracking
    this.touchStartPosition = null;
    this.touchStartTime = null;
  }
  
  /**
   * Clean up all event listeners and constraints
   */
  stop() {
    this.log('BallDragManager: Stopping drag manager');
    
    // Remove touch event listeners
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchmove', this.handleTouchMove);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
      this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    }
    
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
}