import Matter from 'matter-js';

export class PhysicsEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // These will hold our Matter.js components
    this.engine = null;
    this.world = null;
    this.runner = null;
    this.boundaries = [];
    this.balls = [];


    this.domBoundaries = []; // Track DOM-derived boundaries separately from viewport boundaries
    this.boundaryMappers = []; // Track all boundary mappers using this engine

    // Debug mode helps us see what's happening behind the scenes
    this.debugMode = true; // We'll make this configurable later

    this.log = this.debugMode ? console.log : () => { };


    console.log('PhysicsEngine initialized');
  }

  /**
   * Initialize the Matter.js physics world
   */
  init() {
    try {
      // Create the physics engine - this calculates all interactions
      this.engine = Matter.Engine.create();
      this.world = this.engine.world;

      // Set gravity - gravity.y of 1 is Earth-like gravity
      this.engine.gravity.y = 1;
      this.engine.gravity.x = 0;

      // Create the runner - this is what keeps the physics updating
      this.runner = Matter.Runner.create();

      // Create boundaries around the canvas edges
      this.createViewportBoundaries();

// Set up collision event listening for reactive boundaries
this.setupCollisionEvents();

      // Create the initial ball
      this.createInitialBall();

      console.log('Matter.js engine initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize physics engine:', error);
      return false;
    }
  }

  /**
   * Start the physics simulation
   */
  start() {
    if (!this.engine || !this.runner) {
      console.error('Physics engine not initialized. Call init() first.');
      return;
    }

    try {
      // Start the runner - now physics calculations begin happening every frame
      Matter.Runner.run(this.runner, this.engine);

      // Start our custom render loop
      this.startRenderLoop();

      console.log('Physics engine started');
    } catch (error) {
      console.error('Failed to start physics engine:', error);
    }
  }

  /**
   * Stop the physics simulation
   * Important for cleanup when component unmounts
   */
  stop() {
    if (this.runner) {
      Matter.Runner.stop(this.runner);
    }

    if (this.renderLoopId) {
      cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = null;
    }

    console.log('Physics engine stopped');
  }

  /**
   * Clean up all physics objects and stop the render loop
   */
  cleanup() {
    console.log('Cleaning up physics engine...');

    // Stop the render loop
    this.stop();

    // Clear all balls
    this.balls.forEach(ball => {
      if (this.world && ball) {
        Matter.World.remove(this.world, ball);
      }
    });
    this.balls = [];

    // Clear all boundaries  
    this.clearBoundaries();

    // Clear the world
    if (this.world) {
      Matter.World.clear(this.world, false);
    }

    console.log('Physics engine cleanup complete');
  }

  /**
   * Custom render loop - this draws everything on our canvas
   * We use our own instead of Matter.js's built-in renderer for more control
   */
  startRenderLoop() {
    if (this.renderLoopId) {
      // Already running, don't start another loop
      return;
    }

    const render = (currentTime) => {
      try {
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all the physics objects (no coordinate translation needed)
        this.renderBalls();

        // Draw debug information if enabled
        if (this.debugMode) {
          this.renderDebugBoundaries();
          this.renderDebugInfo();
        }

        // Schedule next frame
        this.renderLoopId = requestAnimationFrame(render);

      } catch (error) {
        console.error('Render loop error:', error);
        // Don't stop the loop for minor errors, but log them
        this.renderLoopId = requestAnimationFrame(render);
      }
    };

    console.log('Starting physics render loop');
    this.renderLoopId = requestAnimationFrame(render);
  }



  /**
   * Draw all balls on the canvas
   */
  renderBalls() {
    if (!this.balls.length) return;

    this.balls.forEach((ball, index) => {
      const { x, y } = ball.position;
      const radius = ball.circleRadius || 28;

      this.ctx.save();

      // Main ball body
      this.ctx.fillStyle = '#ff6b6b';
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Add a subtle highlight to make it look more 3D
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      // Debug: show ball center and velocity vector if in debug mode
      if (this.debugMode) {
        // Mark center point
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Show velocity as a line (helps debug movement)
        const velocity = ball.velocity;
        const scale = 5; // Scale factor to make velocity visible
        this.ctx.strokeStyle = '#0066ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + velocity.x * scale, y + velocity.y * scale);
        this.ctx.stroke();
      }

      this.ctx.restore();
    });
  }

  /**
  * Draw debug boundaries so we can see the invisible walls
  * Now handles both viewport and DOM boundaries with different colors
  */
  renderDebugBoundaries() {
    this.ctx.save();

    // Draw viewport boundaries (green, as before)
    if (this.boundaries.length) {
      this.ctx.strokeStyle = '#00ff00';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);

      this.boundaries.forEach(boundary => {
        this.drawBoundaryDebug(boundary, '#00ff00', 'viewport');
      });
    }

    // Draw DOM boundaries (blue, to distinguish them)
    if (this.domBoundaries.length) {
      this.ctx.strokeStyle = '#0066ff';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([3, 3]);

      this.domBoundaries.forEach(boundaryInfo => {
        this.drawBoundaryDebug(boundaryInfo.body, '#0066ff', 'DOM');
      });
    }

    this.ctx.restore();
  }

  /**
   * Helper method to draw a single boundary
   */
  drawBoundaryDebug(boundary, color, type) {
    const { x, y } = boundary.position;
    const bounds = boundary.bounds;
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;

    // Draw boundary rectangle
    this.ctx.strokeStyle = color;
    this.ctx.strokeRect(
      x - width / 2,
      y - height / 2,
      width,
      height
    );

    // Label the boundary
    this.ctx.fillStyle = color;
    this.ctx.font = '12px monospace';
    this.ctx.fillText(
      `${type}: ${boundary.label || 'boundary'}`,
      x - width / 2 + 5,
      y - height / 2 + 15
    );
  }

  /**
   * Display debug information on canvas
   */
  renderDebugInfo() {
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    this.ctx.font = '14px monospace';

    const info = [
      `Canvas: ${this.canvas.width}x${this.canvas.height}`,
      `Balls: ${this.balls.length}`,
      `Boundaries: ${this.boundaries.length}`,
      `DOM Boundaries: ${this.domBoundaries.length}`,
      `Gravity: ${this.engine.world.gravity.y}`
    ];

    // Draw background for text - position relative to viewport, not document
    const padding = 10;
    const lineHeight = 18;
    const textWidth = 200;
    const textHeight = info.length * lineHeight + padding * 2;

    // Reset transform for viewport-relative positioning of debug info
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, textWidth, textHeight);

    // Draw text
    this.ctx.fillStyle = '#ffffff';
    info.forEach((line, index) => {
      this.ctx.fillText(line, 20, 30 + index * lineHeight);
    });

    this.ctx.restore();
  }

  /**
   * Create invisible boundaries around the canvas edges
   * These act like walls that keep balls within the main content area
   */
  createViewportBoundaries() {
    if (!this.canvas || !this.world) {
      console.error('Canvas or world not available for boundary creation');
      return;
    }
  
    this.clearBoundaries();
  
    const width = this.canvas.width;
    const height = this.canvas.height;
    const thickness = 25;

    const boundaries = [
      // Floor - bottom boundary  
      this.createBoundary(width / 2, height + thickness / 2, width, thickness, 'floor'),
      
      // Ceiling - top boundary
      this.createBoundary(width / 2, -thickness / 2, width, thickness, 'ceiling'),
      
      // Left wall - positioned inside the left edge of canvas
      this.createBoundary(thickness / 25, height / 2, thickness, height, 'left-wall'),
      
      // Right wall - positioned inside the right edge of canvas  
      this.createBoundary(width - thickness / 25, height / 2, thickness, height, 'right-wall')
    ];
  
    // Add all boundaries to the physics world
    boundaries.forEach(boundary => {
      if (boundary) {
        Matter.World.add(this.world, boundary);
        this.boundaries.push(boundary);
      }
    });
  
    console.log(`Created ${boundaries.length} canvas boundaries for ${width}x${height} area`);
    console.log('Boundary positions:');
    boundaries.forEach((boundary, i) => {
      if (boundary) {
        console.log(`  ${boundary.label}: (${boundary.position.x}, ${boundary.position.y})`);
      }
    });
  }

/**
 * Set up collision event listeners for reactive boundary feedback
 * This is the "security camera notification system" for physics interactions
 */
setupCollisionEvents() {
  if (!this.engine) {
    console.warn('PhysicsEngine: Cannot setup collision events without engine');
    return;
  }

  // Matter.js provides several collision events, but we want 'collisionStart'
  // This fires once when objects first make contact (not continuously while touching)
  Matter.Events.on(this.engine, 'collisionStart', (event) => {
    this.handleCollisionStart(event);
  });

  this.log('PhysicsEngine: Collision event listeners established');
}


/**
 * Handle collision start events - this is our "detective work" method
 * Examines each collision to determine if visual feedback should trigger
 * @param {Object} event - Matter.js collision event containing pairs of colliding objects
 */
handleCollisionStart(event) {
  // Matter.js gives us an array of collision pairs
  // Each pair represents two objects that just started touching
  const pairs = event.pairs;

  pairs.forEach(pair => {
    // Extract the two objects involved in this collision
    const { bodyA, bodyB, collision } = pair;

    // Step 1: Identify which object is the ball and which is the boundary
    // We need to check both directions since we don't know the order
    let ball = null;
    let boundary = null;

    if (this.isBall(bodyA) && this.isBoundary(bodyB)) {
      ball = bodyA;
      boundary = bodyB;
    } else if (this.isBall(bodyB) && this.isBoundary(bodyA)) {
      ball = bodyB;
      boundary = bodyA;
    } else {
      // This collision doesn't involve a ball hitting a boundary
      // Could be ball-to-ball, boundary-to-boundary, or ball-to-viewport-wall
      return; // Skip this collision
    }

    // Step 2: Check if this boundary is reactive
    const boundaryInfo = this.getBoundaryInfo(boundary);
    if (!boundaryInfo || boundaryInfo.boundaryType !== 'reactive') {
      return; // Static boundary - no visual feedback needed
    }

    // Step 3: Calculate impact force and check threshold
    const impactForce = this.calculateImpactForce(collision, ball);
    if (impactForce < boundaryInfo.reactionConfig.velocityThreshold) {
      return; // Impact too gentle - no reaction needed
    }

    // All conditions met! Trigger visual feedback
    this.triggerBoundaryReaction(boundaryInfo, impactForce);
  });
}

/**
 * Trigger visual reaction for a boundary that was hit by a ball
 * This bridges the physics world back to DOM visual effects
 * @param {Object} boundaryInfo - The boundary data including DOM element and reaction config
 * @param {number} impactForce - The calculated impact force for potential effect scaling
 */
triggerBoundaryReaction(boundaryInfo, impactForce) {
  const { element, reactionConfig } = boundaryInfo;
  
  if (!element || !reactionConfig) {
    this.log('PhysicsEngine: Cannot trigger reaction - missing element or config');
    return;
  }

  // Apply visual effects using CSS custom properties
  // This is the "lighting up" moment when physics meets visual design
  this.applyReactionEffects(element, reactionConfig, impactForce);

  this.log(`PhysicsEngine: Triggered reaction for ${boundaryInfo.physicsBody.label} with force ${impactForce.toFixed(2)}`);
}

/**
 * Apply the actual visual effects to a DOM element
 * Uses CSS custom properties for smooth, hardware-accelerated animations
 * @param {HTMLElement} element - The DOM element to animate
 * @param {Object} reactionConfig - Animation configuration with scale, brightness, etc.
 * @param {number} impactForce - Force magnitude (could be used for effect intensity)
 */
applyReactionEffects(element, reactionConfig, impactForce) {
  const { scale, brightness, saturation, duration } = reactionConfig;

  // Store the original state so we can restore it later
  const originalTransform = element.style.transform || '';
  const originalFilter = element.style.filter || '';

  // Apply the reaction effects immediately
  element.style.transform = `${originalTransform} scale(${scale.to})`;
  element.style.filter = `brightness(${brightness.to}) saturate(${saturation.to})`;
  
  // Set up the return animation using CSS transitions
  element.style.transition = `transform ${duration}ms ease-out, filter ${duration}ms ease-out`;

  // Return to original state after a short delay
  // This creates the "flash" effect - quick reaction then fade back to normal
  setTimeout(() => {
    element.style.transform = originalTransform;
    element.style.filter = originalFilter;

    // Clean up transition after animation completes
    setTimeout(() => {
      element.style.transition = '';
    }, duration);
  }, 50); // Short delay before starting the return animation
}

/**
 * Check if a physics body represents a ball
 * We identify balls by their label property set during creation
 * @param {Object} body - Matter.js physics body
 * @returns {boolean} - true if this body is a ball
 */
isBall(body) {
  return body && body.label === 'physics-ball';
}

/**
 * Check if a physics body represents a boundary (static or reactive)
 * We identify boundaries by checking if they're static and not balls
 * @param {Object} body - Matter.js physics body  
 * @returns {boolean} - true if this body is a boundary
 */
isBoundary(body) {
  return body && body.isStatic && body.label !== 'physics-ball';
}

/**
 * Get boundary information from our boundary mappers
 * This connects the physics body back to our boundary metadata
 * @param {Object} physicsBody - Matter.js body representing a boundary
 * @returns {Object|null} - boundary info with type and reaction config, or null
 */
getBoundaryInfo(physicsBody) {
  // Search through all registered boundary mappers to find info about this body
  for (const mapper of this.boundaryMappers) {
    if (mapper && mapper.registeredBoundaries) {
      for (const [id, boundaryInfo] of mapper.registeredBoundaries) {
        if (boundaryInfo.physicsBody === physicsBody) {
          return boundaryInfo;
        }
      }
    }
  }
  return null; // This boundary isn't tracked by our mappers
}

/**
 * Calculate the meaningful impact force from a collision
 * This determines whether the impact was "significant enough" for visual feedback
 * @param {Object} collision - Matter.js collision data
 * @param {Object} ball - The ball object involved in collision
 * @returns {number} - Impact force magnitude
 */
calculateImpactForce(collision, ball) {
  // Method 1: Use the ball's velocity magnitude
  // This represents "how fast was the ball moving when it hit?"
  const velocity = ball.velocity;
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  // Method 2: We could also use collision force data
  // const force = collision.force || 0;
  
  // For now, using speed is simpler and more predictable
  return speed;
}

  /**
   * Create a single boundary (wall) at specified position
   * x, y = center position, width/height = dimensions, label = debug name
   */
  createBoundary(x, y, width, height, label = 'boundary') {
    try {
      const boundary = Matter.Bodies.rectangle(x, y, width, height, {
        isStatic: true, // Static means it won't move or be affected by physics
        label: label,   // Useful for debugging
        render: {
          fillStyle: 'transparent' // We don't want to see these normally
        },
        // Physics properties that affect how balls bounce off
        restitution: 0.8, // Bounciness (0 = no bounce, 1 = perfect bounce)
        friction: 0.3      // Surface friction (affects sliding)
      });

      return boundary;
    } catch (error) {
      console.error(`Failed to create boundary ${label}:`, error);
      return null;
    }
  }

  /**
   * Remove all existing boundaries from the world
   * Useful when canvas resizes and we need to recreate boundaries
   */
  clearBoundaries() {
    this.boundaries.forEach(boundary => {
      if (this.world && boundary) {
        Matter.World.remove(this.world, boundary);
      }
    });
    this.boundaries = [];
  }

  /**
   * Update boundaries when canvas size changes
   * This is important for responsive design
   */
  updateBoundaries() {
    if (!this.world) return;

    console.log('Updating boundaries for new canvas size');

    // Store old boundaries temporarily
    const oldBoundaries = [...this.boundaries];

    // Create new boundaries first (don't clear old ones yet)
    const width = this.canvas.width;
    const height = this.canvas.height;
    const thickness = 50;

    const newBoundaries = [
      this.createBoundary(width / 2, height + thickness / 2, width, thickness, 'floor'),
      this.createBoundary(width / 2, -thickness / 2, width, thickness, 'ceiling'),
      this.createBoundary(-thickness / 2, height / 2, thickness, height, 'left-wall'),
      this.createBoundary(width + thickness / 2, height / 2, thickness, height, 'right-wall')
    ];

    // Add new boundaries to world
    newBoundaries.forEach(boundary => {
      if (boundary) {
        Matter.World.add(this.world, boundary);
      }
    });

    // Now remove old boundaries (new ones are already in place)
    oldBoundaries.forEach(boundary => {
      if (this.world && boundary) {
        Matter.World.remove(this.world, boundary);
      }
    });

    // Update tracking array
    this.boundaries = newBoundaries.filter(b => b !== null);

    // Ensure balls are not below the new floor after rapid viewport changes
    try {
      const floorTopY = height; // Floor's top edge aligns with canvas height
      this.balls.forEach(ball => {
        const radius = ball.circleRadius || 28;
        const maxAllowedY = floorTopY - radius - 0.5; // small epsilon
        if (ball.position.y > maxAllowedY) {
          Matter.Body.setPosition(ball, { x: ball.position.x, y: maxAllowedY });
          if (ball.velocity.y > 0) {
            Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: 0 });
          }
        }
      });
    } catch (err) {
      console.warn('Post-boundary ball adjustment failed:', err);
    }

    console.log('Boundary update complete');

    // Force update all DOM boundary positions after canvas resize
    // Use a small delay to ensure DOM layout has settled
    requestAnimationFrame(() => {
      this.forceUpdateAllBoundaryPositions();
    });

    // Also update again after a longer delay to catch any late layout changes
    setTimeout(() => {
      this.forceUpdateAllBoundaryPositions();
    }, 100);
  }

  /**
   * Create a physics ball at specified position
   * radius = ball size, x/y = starting position
   */
  createBall(x, y, radius = 32) {
    try {
      const ball = Matter.Bodies.circle(x, y, radius, {
        // Physical properties that affect how the ball behaves
        restitution: 0.7,    // Bounciness (0.7 = fairly bouncy)
        friction: 0.05,      // Surface friction (low = rolls easily) 
        frictionAir: 0.01,   // Air resistance (prevents infinite bouncing)
        density: 0.001,      // Mass per unit area (affects how heavy it feels)

        // Visual properties for Matter.js built-in renderer (we don't use this, but good to have)
        render: {
          fillStyle: '#ff6b6b'
        },

        // Label for debugging
        label: 'physics-ball'
      });

      // Store the radius on the ball object so our renderer can access it
      ball.circleRadius = radius;

      return ball;
    } catch (error) {
      console.error('Failed to create ball:', error);
      return null;
    }
  }

  /**
   * Add a ball to the physics world and our tracking array
   */
  addBall(x, y, radius = 32) {
    const ball = this.createBall(x, y, radius);

    if (ball && this.world) {
      // Add to Matter.js world so it participates in physics
      Matter.World.add(this.world, ball);

      // Add to our tracking array so we can render it
      this.balls.push(ball);

      console.log(`Ball added at position (${x}, ${y}) with radius ${radius}px`);
      return ball;
    }

    return null;
  }

  /**
   * Create multiple initial balls in the upper area of the canvas
   * Using canvas-relative positioning
   */
  createInitialBall() {
    if (!this.canvas) {
      console.error('Canvas not available for ball creation');
      return;
    }

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Create multiple balls with slight position variations
    const numBalls = 5;
    for (let i = 0; i < numBalls; i++) {
      const ballX = canvasWidth * (0.82 + i * 0.01); // Spread horizontally from 82% to 86%
      const ballY = canvasHeight * (0.05 + i * 0.02); // Stagger vertically in upper 15% of canvas
      const radius = 32 + Math.random() * 8; // Vary size (32-40px)
      
      const ball = this.addBall(ballX, ballY, radius);
      
      if (ball) {
        console.log(`Ball ${i + 1} created at canvas position (${ballX.toFixed(1)}, ${ballY.toFixed(1)}) with radius ${radius.toFixed(1)}`);
      }
    }
  }

  /**
 * Register a DOM boundary with the physics engine
 * This is called by BoundaryMapper when elements register themselves
 */
  registerDomBoundary(physicsBody, metadata = {}) {
    if (!physicsBody || !this.world) {
      console.warn('PhysicsEngine: Cannot register DOM boundary - missing body or world');
      return false;
    }

    try {
      // The body should already be added to the world by BoundaryMapper
      // We just need to track it for debugging and cleanup
      this.domBoundaries.push({
        body: physicsBody,
        type: 'dom-element',
        ...metadata
      });

      this.log(`PhysicsEngine: DOM boundary registered: ${physicsBody.label}`);
      return true;
    } catch (error) {
      console.error('PhysicsEngine: Failed to register DOM boundary:', error);
      return false;
    }
  }

  /**
   * Remove a DOM boundary from tracking
   * The BoundaryMapper handles removing from the physics world
   */
  unregisterDomBoundary(physicsBody) {
    const index = this.domBoundaries.findIndex(boundary => boundary.body === physicsBody);
    if (index !== -1) {
      this.domBoundaries.splice(index, 1);
      this.log(`PhysicsEngine: DOM boundary unregistered: ${physicsBody.label}`);
    }
  }

  /**
   * Register a BoundaryMapper instance with this engine
   * This allows the engine to coordinate with multiple mappers
   */
  registerBoundaryMapper(boundaryMapper) {
    if (!this.boundaryMappers.includes(boundaryMapper)) {
      this.boundaryMappers.push(boundaryMapper);
      this.log('PhysicsEngine: BoundaryMapper registered');
    }
  }

  /**
   * Update all DOM boundary positions (simplified for canvas-relative coordinates)
   */
  updateBoundaryPositions() {
    if (!this.boundaryMappers.length) return;

    this.boundaryMappers.forEach(mapper => {
      if (mapper && typeof mapper.updateBoundaryPositions === 'function') {
        mapper.updateBoundaryPositions();
      }
    });
  }

  /**
   * Force update all DOM boundary positions (used during canvas resize)
   * This ensures all boundaries are updated even if their individual ResizeObservers aren't triggered
   */
  forceUpdateAllBoundaryPositions() {
    if (!this.boundaryMappers.length) return;

    console.log('PhysicsEngine: Force updating all DOM boundary positions');

    this.boundaryMappers.forEach(mapper => {
      if (mapper && typeof mapper.updateBoundaryPositions === 'function') {
        mapper.updateBoundaryPositions();
      }
    });
  }
}