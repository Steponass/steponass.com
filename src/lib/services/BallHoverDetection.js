/**
 * BallHoverDetection - Service for detecting when mouse cursor is near physics balls
 * 
 * This service continuously tracks:
 * 1. Current mouse position (x, y coordinates)
 * 2. Current positions of all physics balls
 * 3. Distance calculations between mouse and each ball
 * 4. Automatic interaction mode switching based on proximity
 */

export class BallHoverDetection {
  constructor(physicsEngine, interactionStore) {
    // Store references to the systems we need to coordinate with
    this.physicsEngine = physicsEngine;
    this.interactionStore = interactionStore;
    
    // Current mouse position - updated continuously
    this.mousePosition = { x: 0, y: 0 };
    
    // Hover detection configuration
    this.hoverRadius = 25; // pixels - how close mouse needs to be to trigger hover
    this.currentHoveredBall = null; // which ball (if any) is currently being hovered
    
    // Performance optimization - we don't need to check every single frame
    this.checkInterval = null;
    this.checkFrequency = 100; // milliseconds between checks
    
    // State tracking
    this.isActive = false;
    
    // Bind methods to maintain proper 'this' context
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.checkBallProximity = this.checkBallProximity.bind(this);
  }
  
  /**
   * Start the hover detection system
   * Sets up mouse tracking and begins proximity checking
   */
  start() {
    if (this.isActive) {
      console.warn('BallHoverDetection: Already active');
      return;
    }
    
    console.log('BallHoverDetection: Starting hover detection system');
    
    // Listen for mouse movement across the entire document
    // We use the document so we catch mouse movement even when it's outside our canvas
    document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    
    // Start the proximity checking loop
    this.checkInterval = setInterval(this.checkBallProximity, this.checkFrequency);
    
    this.isActive = true;
  }
  
  /**
   * Stop the hover detection system and clean up resources
   */
  stop() {
    if (!this.isActive) return;
    
    console.log('BallHoverDetection: Stopping hover detection system');
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    
    // Clear the checking interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // Reset hover state
    this.currentHoveredBall = null;
    
    this.isActive = false;
  }
  
  /**
   * Handle mouse movement events
   * Updates our tracking of the current mouse position
   */
  handleMouseMove(event) {
    // Store the current mouse position for use in our proximity calculations
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
  }
  
  /**
   * Check if mouse is near any balls and update interaction state accordingly
   * This is the core logic that runs continuously
   */
  checkBallProximity() {
    // Safety check - make sure we have access to physics data
    if (!this.physicsEngine || !this.physicsEngine.balls) {
      return;
    }
    
    // Get current mouse position relative to the canvas
    const canvasMousePos = this.getCanvasRelativePosition();
    if (!canvasMousePos) {
      return; // Mouse not over canvas area
    }
    
    // Find the closest ball to the mouse cursor
    let closestBall = null;
    let closestDistance = Infinity;
    
    // Check each ball to see which one is closest to the mouse
    this.physicsEngine.balls.forEach(ball => {
      const distance = this.calculateDistance(canvasMousePos, ball.position);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestBall = ball;
      }
    });
    
    // Determine if we should be in hover state
    const shouldBeHovering = closestBall && closestDistance <= this.hoverRadius;
    const isCurrentlyHovering = this.currentHoveredBall !== null;
    
    // Handle state changes
    if (shouldBeHovering && !isCurrentlyHovering) {
      // We just started hovering over a ball
      this.enterHoverState(closestBall);
    } else if (!shouldBeHovering && isCurrentlyHovering) {
      // We just moved away from all balls
      this.exitHoverState();
    } else if (shouldBeHovering && closestBall !== this.currentHoveredBall) {
      // We switched from hovering one ball to hovering a different ball
      this.switchHoveredBall(closestBall);
    }
  }
  
  /**
   * Convert screen mouse coordinates to canvas-relative coordinates
   * This is necessary because our physics simulation works in canvas space
   */
  getCanvasRelativePosition() {
    const canvas = this.physicsEngine.canvas;
    if (!canvas) return null;
    
    const canvasRect = canvas.getBoundingClientRect();
    
    // Check if mouse is actually over the canvas area
    if (this.mousePosition.x < canvasRect.left || 
        this.mousePosition.x > canvasRect.right ||
        this.mousePosition.y < canvasRect.top || 
        this.mousePosition.y > canvasRect.bottom) {
      return null; // Mouse is outside canvas
    }
    
    // Convert to canvas-relative coordinates
    return {
      x: this.mousePosition.x - canvasRect.left,
      y: this.mousePosition.y - canvasRect.top
    };
  }
  
  /**
   * Calculate distance between two points
   * Uses the Pythagorean theorem: distance = sqrt((x2-x1)² + (y2-y1)²)
   */
  calculateDistance(point1, point2) {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  
/**
 * Enter hover state - we just started hovering over a ball
 * This method now handles both interaction mode switching AND visual feedback
 */
enterHoverState(ball) {
  console.log('BallHoverDetection: Entering hover state for ball');
  
  this.currentHoveredBall = ball;
  
  // Switch to ball interaction mode
  this.interactionStore.enableBallInteraction();
  
  // NEW: Apply visual feedback to the hovered ball
  if (this.physicsEngine && typeof this.physicsEngine.setBallVisualState === 'function') {
    this.physicsEngine.setBallVisualState(ball, 'hovered');
  } else {
    console.warn('BallHoverDetection: Cannot set visual state - physics engine method not available');
  }
  
  // Set cursor to pointer to indicate interactivity
  this.setCursorStyle('pointer');
}

/**
 * Exit hover state - mouse moved away from all balls
 * This method handles cleanup of both interaction mode and visual effects
 */
exitHoverState() {
  console.log('BallHoverDetection: Exiting hover state');
  
  // Clear visual state for the previously hovered ball
  if (this.currentHoveredBall && this.physicsEngine && typeof this.physicsEngine.clearBallVisualState === 'function') {
    this.physicsEngine.clearBallVisualState(this.currentHoveredBall);
  }
  
  this.currentHoveredBall = null;
  
  // Switch back to normal browsing mode
  this.interactionStore.enableNormalBrowsing();
  
  // Reset cursor to default
  this.setCursorStyle('default');
}

/**
 * Switch from hovering one ball to hovering a different ball
 * This method handles the transition between different hovered balls
 */
switchHoveredBall(newBall) {
  console.log('BallHoverDetection: Switching hovered ball');
  
  // Clear visual state from the previously hovered ball
  if (this.currentHoveredBall && this.physicsEngine && typeof this.physicsEngine.clearBallVisualState === 'function') {
    this.physicsEngine.clearBallVisualState(this.currentHoveredBall);
  }
  
  // Update which ball is being hovered
  this.currentHoveredBall = newBall;
  
  // Apply visual state to the newly hovered ball
  if (this.physicsEngine && typeof this.physicsEngine.setBallVisualState === 'function') {
    this.physicsEngine.setBallVisualState(newBall, 'hovered');
  }
}

/**
 * Set the cursor style for the entire document
 * This provides additional visual feedback about the current interaction state
 * @param {string} style - CSS cursor value ('default', 'pointer', 'grab', etc.)
 */
setCursorStyle(style) {
  // We apply cursor changes to the document body so they're visible everywhere
  // This is more reliable than trying to coordinate cursor changes across multiple elements
  document.body.style.cursor = style;
}
}