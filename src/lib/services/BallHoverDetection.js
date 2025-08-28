/*
 * Service for detecting when mouse cursor is near physics balls
 * 
 * This service continuously tracks:
 * 1. Current mouse position
 * 2. Current positions of all physics balls
 * 3. Distance calculations between mouse and each ball
 * 4. Automatic interaction mode switching based on proximity
 */

export class BallHoverDetection {
  constructor(physicsEngine, interactionStore) {
    this.physicsEngine = physicsEngine;
    this.interactionStore = interactionStore;
    
    this.mousePosition = { x: 0, y: 0 };
    
    this.hoverRadius = 20; // pixels - how close mouse needs to be to trigger hover
    this.currentHoveredBall = null; 
    
    // Performance optimization
    this.checkInterval = null;
    this.checkFrequency = 100;
    
    this.isActive = false;
    
    // Bind methods to maintain proper 'this' context
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.checkBallProximity = this.checkBallProximity.bind(this);
  }
  
  /*
   * Start hover detection system
   */
  start() {
    if (this.isActive) {
      return;
    }
    
    // Listen for mouse movement across the entire document (document to catch mouse movement even when it's outside our canvas)
    document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    
    // Start proximity checking loop
    this.checkInterval = setInterval(this.checkBallProximity, this.checkFrequency);
    
    this.isActive = true;
  }
  
  /*
   * Stop hover detection system and clean up resources
   */
  stop() {
    if (!this.isActive) return;
    
    document.removeEventListener('mousemove', this.handleMouseMove);
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.currentHoveredBall = null;
    this.isActive = false;
  }
  
  /*
   * Handle mouse movement events
   */
  handleMouseMove(event) {
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
  }
  
  /*
   * Check if mouse is near any balls and update interaction state accordingly. Runs continuously
   */
  checkBallProximity() {
    // Make sure we have access to physics data
    if (!this.physicsEngine || !this.physicsEngine.balls) {
      return;
    }
    
    // Get current mouse position relative to canvas
    const canvasMousePos = this.getCanvasRelativePosition();
    if (!canvasMousePos) {
      return; // Mouse not over canvas area
    }
    
    // Find closest ball to the mouse cursor
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
  
  /*
   * Convert screen mouse coordinates to canvas-relative coordinates
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
  
  /*
   * Calculate distance between two points
   * Uses the Pythagorean theorem: distance = sqrt((x2-x1)² + (y2-y1)²). Lol.
   */
  calculateDistance(point1, point2) {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  
/*
 * Enter hover state: handles interaction mode switching AND visual feedback
 */
enterHoverState(ball) {
  this.currentHoveredBall = ball;
  
  this.interactionStore.enableBallInteraction();
  
  if (this.physicsEngine && typeof this.physicsEngine.setBallVisualState === 'function') {
    this.physicsEngine.setBallVisualState(ball, 'hovered');
  }
  
  this.setCursorStyle('pointer');
}

/*
 * Exit hover state - mouse moved away from all balls
 * This method handles cleanup of both interaction mode and visual effects
 */
exitHoverState() {
  if (this.currentHoveredBall && this.physicsEngine && typeof this.physicsEngine.clearBallVisualState === 'function') {
    this.physicsEngine.clearBallVisualState(this.currentHoveredBall);
  }
  
  this.currentHoveredBall = null;

  this.interactionStore.enableNormalBrowsing();
  
  this.setCursorStyle('default');
}

/*
 * Switch from hovering one ball to hovering a different ball
 * This method handles the transition between different hovered balls
 */
switchHoveredBall(newBall) {
  
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
  document.body.style.cursor = style;
}
}