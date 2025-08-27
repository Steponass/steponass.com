import Matter from 'matter-js';
import { addBallToQueue, canCollectBalls } from '@stores/ballQueue.js';
import { get } from 'svelte/store';

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
    this.ballVisualStates = new Map();

    this.drainHole = {
      centerX: 0,        // Will be calculated based on canvas width
      centerY: 0,        // Will be calculated based on canvas height  
      radius: 60,        // Detection radius for ball collection
      visualRadius: 40,  // Visual hole size (smaller than detection)
      shrinkZone: 70     // Radius where shrinking effect begins
    };

    this.ballsBeingCollected = new Map();

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
      this.engine = Matter.Engine.create({
        // Anti-tunneling settings - prevent fast objects from passing through boundaries
        positionIterations: 6,    // Default: 6. Higher = better collision detection, lower performance
        velocityIterations: 4,     // Default: 4. Higher = more accurate velocity calculations
        constraintIterations: 2,   // Default: 2. Affects constraint solving accuracy

        // Performance and stability settings
        enableSleeping: true,      // Allow inactive bodies to "sleep" for better performance

        // Timing configuration for consistent simulation
        timing: {
          timeScale: 1.0,          // Normal speed simulation
          timestamp: 0             // Starting timestamp
        }
      });


      this.world = this.engine.world;

      // Set gravity - gravity.y of 1 is Earth-like gravity
      this.engine.gravity.y = 1;
      this.engine.gravity.x = 0;

      // Create the runner - this is what keeps the physics updating
      this.runner = Matter.Runner.create({
        // Sub-stepping configuration for anti-tunneling
        delta: 1000 / 120,        // Target 120Hz physics updates (8.33ms per step)
        isFixed: true,            // Use fixed timestep for consistent physics
        enabled: true             // Enable the runner by default
      });

      // Create boundaries around the canvas edges
      this.createViewportBoundaries();

      this.updateDrainHolePosition();

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


        this.checkBallCollection();

        // Draw all the physics objects (no coordinate translation needed)
        this.renderBalls();


        // Draw debug information if enabled
        if (this.debugMode) {
          this.renderDebugBoundaries();
          this.renderDebugDrainHole();
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
   * Draw all balls on the canvas with state-aware visual effects
   */
  renderBalls() {
    if (!this.balls.length) return;

    this.balls.forEach((ball, index) => {
      const { x, y } = ball.position;
      const radius = (ball.visualRadius ?? ball.circleRadius) || 28;
      const visualState = this.getBallVisualState(ball);

      this.ctx.save();

      // Apply visual effects based on the ball's current state
      if (visualState === 'hovered') {
        // Draw glow effect for hovered balls
        this.renderBallGlow(x, y, radius);
      }

      // Get ball color once
      const ballColor = this.getBallColor(visualState);
      this.ctx.fillStyle = ballColor;

      // First shadow (softer, larger, more offset)
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetX = 1;
      this.ctx.shadowOffsetY = 3;

      // Draw ball with first shadow
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Second shadow (sharper, closer to ball)
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 3;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 2;

      // Draw ball with second shadow
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Reset shadow properties to prevent affecting other drawings
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;

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

        // Show visual state as text
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(visualState, x + radius + 5, y);
      }

      this.ctx.restore();
    });
  }

  /**
   * Render a glow effect around a ball
   * This creates the visual feedback that indicates a ball can be interacted with
   */
  renderBallGlow(centerX, centerY, radius) {
    const glowRadius = radius + 15; // Glow extends beyond the ball
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, radius,           // Inner circle (ball edge)
      centerX, centerY, glowRadius        // Outer circle (glow edge)
    );

    // Create a gradient that fades from semi-transparent to fully transparent
    gradient.addColorStop(0, 'rgba(255, 107, 107, 0.3)'); // Semi-transparent red at ball edge
    gradient.addColorStop(0.7, 'rgba(255, 107, 107, 0.1)'); // Lighter red in middle of glow
    gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');     // Fully transparent at glow edge

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Get the appropriate color for a ball based on its visual state
   * This allows different states to have different colors if desired
   */
  getBallColor(visualState) {
    switch (visualState) {
      case 'hovered':
        return '#ff5252'; // Slightly different red when hovered
      case 'dragged':
        return '#ff3030'; // Even more intense red when being dragged
      default:
        return '#ff6b6b'; // Default red color
    }
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
    const thickness = 250; // Increased thickness

    const boundaries = [
      // Floor - bottom boundary (extends outward)
      this.createBoundary(width / 2, height + thickness / 2, width, thickness, 'floor'),

      // Ceiling - top boundary (extends outward)
      this.createBoundary(width / 2, -thickness / 2, width, thickness, 'ceiling'),

      // Left wall - positioned outside the left edge of canvas (extends outward)
      this.createBoundary(-thickness / 2, height / 2, thickness, height, 'left-wall'),

      // Right wall - positioned outside the right edge of canvas (extends outward)
      this.createBoundary(width + thickness / 2, height / 2, thickness, height, 'right-wall')
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

    //  Update drain hole position for new canvas size
    this.updateDrainHolePosition();

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
        restitution: 0.9,    // Bounciness (0.7 = fairly bouncy)
        friction: 0.02,      // Surface friction (low = rolls easily) 
        frictionAir: 0.01,   // Air resistance (prevents infinite bouncing)
        density: 0.02,      // Mass per unit area (affects how heavy it feels)

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
   * Set the visual state for a specific ball
   * This allows external systems (like hover detection) to influence how balls are rendered
   * @param {Object} ball - The Matter.js ball object
   * @param {string} state - The visual state ('normal', 'hovered', 'dragged')
   */
  setBallVisualState(ball, state) {
    if (!ball) {
      console.warn('PhysicsEngine: Cannot set visual state for null/undefined ball');
      return;
    }

    this.ballVisualStates.set(ball, state);
    this.log(`PhysicsEngine: Ball visual state set to "${state}"`);
  }

  /**
   * Get the current visual state for a specific ball
   * @param {Object} ball - The Matter.js ball object
   * @returns {string} - The visual state ('normal' is default)
   */
  getBallVisualState(ball) {
    return this.ballVisualStates.get(ball) || 'normal';
  }

  /**
   * Clear visual state for a specific ball (returns it to normal)
   * @param {Object} ball - The Matter.js ball object
   */
  clearBallVisualState(ball) {
    this.ballVisualStates.delete(ball);
    this.log('PhysicsEngine: Ball visual state cleared (returned to normal)');
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


  /**
   * Update drain hole position based on current canvas size
   * Called during initialization and canvas resize
   */
  updateDrainHolePosition() {
    if (!this.canvas) return;

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Position drain hole at bottom center of canvas
    this.drainHole.centerX = canvasWidth / 2;
    this.drainHole.centerY = canvasHeight - 20; // Slightly above the very bottom

    this.log(`DrainHole: Updated position to (${this.drainHole.centerX}, ${this.drainHole.centerY})`);
  }

  /**
   * Check all balls for drain hole collection
   * Called every frame during render loop
   */
  checkBallCollection() {
    // Only collect if queue has space
    const canCollect = get(canCollectBalls);
    if (!canCollect) {
      // Only log this occasionally to avoid spam
      if (Math.random() < 0.01) { // 1% chance per frame
        console.log('DrainHole: Queue full, not collecting balls');
      }
      return;
    }

    // Log detection area info occasionally
    if (Math.random() < 0.005) { // 0.5% chance per frame
      console.log(`DrainHole: Detection active at (${this.drainHole.centerX}, ${this.drainHole.centerY}), checking ${this.balls.length} balls`);
    }

    // Check each active ball
    this.balls.forEach((ball, ballIndex) => {
      const ballX = ball.position.x;
      const ballY = ball.position.y;
      const ballRadius = ball.circleRadius || 32;

      // Calculate distance from ball center to drain hole center
      const deltaX = ballX - this.drainHole.centerX;
      const deltaY = ballY - this.drainHole.centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If this ball is already being collected, continue shrinking it every frame
      if (this.ballsBeingCollected.has(ball)) {
        this.updateBallShrinking(ball, distance);
        return;
      }

      // Log when balls get close (for debugging)
      if (distance < this.drainHole.shrinkZone * 1.5) { // Slightly larger than shrink zone
        console.log(`DrainHole: Ball at (${ballX.toFixed(1)}, ${ballY.toFixed(1)}) is ${distance.toFixed(1)}px from drain center`);
      }

      // Check if ball is within the shrink zone
      if (distance < this.drainHole.shrinkZone) {
        console.log(`DrainHole: Ball entering shrink zone! Distance: ${distance.toFixed(1)}`);
        this.startBallCollection(ball, ballIndex, distance);
      }
    });
  }

  /**
   * Start the collection process for a ball that entered the drain area
   */
  startBallCollection(ball, ballIndex, distanceToHole) {
    // If ball is very close to center, collect it immediately
    if (distanceToHole < this.drainHole.radius) {
      this.collectBall(ball, ballIndex);
      return;
    }

    // Start the shrinking/collection process
    if (!this.ballsBeingCollected.has(ball)) {
      this.ballsBeingCollected.set(ball, {
        originalRadius: ball.circleRadius || 32,
        startTime: Date.now(),
        ballIndex: ballIndex
      });

      this.log(`DrainHole: Ball entering collection zone, distance: ${distanceToHole.toFixed(1)}`);
    }

    // Update shrinking effect based on distance
    this.updateBallShrinking(ball, distanceToHole);
  }

  /**
   * Debug method to render drain hole detection area
   * This helps us see if visual and physics positions match
   */
  renderDebugDrainHole() {
    if (!this.debugMode) return;

    this.ctx.save();

    // Draw the shrink zone (outer circle)
    this.ctx.strokeStyle = '#ffff00'; // Yellow
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.arc(this.drainHole.centerX, this.drainHole.centerY, this.drainHole.shrinkZone, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw the collection radius (inner circle)
    this.ctx.strokeStyle = '#ff0000'; // Red
    this.ctx.setLineDash([3, 3]);
    this.ctx.beginPath();
    this.ctx.arc(this.drainHole.centerX, this.drainHole.centerY, this.drainHole.radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw center point
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(this.drainHole.centerX, this.drainHole.centerY, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Label the drain hole
    this.ctx.fillStyle = '#000000';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(
      `Drain: (${this.drainHole.centerX.toFixed(0)}, ${this.drainHole.centerY.toFixed(0)})`,
      this.drainHole.centerX + 50,
      this.drainHole.centerY
    );

    this.ctx.restore();
  }

  /**
   * Update ball shrinking effect as it approaches the drain hole
   */
  updateBallShrinking(ball, distanceToHole) {
    const collectionData = this.ballsBeingCollected.get(ball);
    if (!collectionData) return;

    const originalRadius = collectionData.originalRadius;
    const shrinkZone = this.drainHole.shrinkZone;
    const collectRadius = this.drainHole.radius;

    // Calculate shrink factor based on distance (1.0 = full size, 0.0 = invisible)
    let shrinkFactor = 1.0;

    if (distanceToHole < collectRadius) {
      // Very close to center - shrink rapidly to 0
      shrinkFactor = 0.1;
    } else if (distanceToHole < shrinkZone) {
      // In shrink zone - gradual shrinking
      shrinkFactor = (distanceToHole - collectRadius) / (shrinkZone - collectRadius);
      shrinkFactor = Math.max(0.1, Math.min(1.0, shrinkFactor));
    }

    // Apply the shrinking effect to the ball's visual radius
    ball.visualRadius = originalRadius * shrinkFactor;

    // If ball shrunk enough or close enough, collect it
    if (shrinkFactor <= 0.2 || distanceToHole < this.drainHole.radius) {
      const ballIndex = this.balls.indexOf(ball);
      this.collectBall(ball, ballIndex);
    }
  }

  /**
   * Finalize ball collection - remove from physics and add to queue
   */
  collectBall(ball, ballIndex) {
    try {
      // Prepare ball data for the queue
      const ballData = {
        radius: ball.circleRadius || 32,
        color: '#ff6b6b',
        originalLabel: ball.label
      };

      // Add to queue
      const success = addBallToQueue(ballData);

      if (success) {
        // Remove from physics world
        if (this.world && ball) {
          Matter.World.remove(this.world, ball);
        }

        // Remove from our tracking arrays
        this.balls.splice(ballIndex, 1);
        this.ballsBeingCollected.delete(ball);

        // Clear any visual state
        this.ballVisualStates.delete(ball);

        this.log(`DrainHole: Ball successfully collected and queued`);
      } else {
        // Queue was full, stop the collection process
        this.ballsBeingCollected.delete(ball);

        // Reset visual radius
        if (ball.visualRadius !== undefined) {
          delete ball.visualRadius;
        }

        this.log(`DrainHole: Collection failed - queue full, ball returned to physics`);
      }

    } catch (error) {
      console.error('DrainHole: Error collecting ball:', error);
      this.ballsBeingCollected.delete(ball);
    }
  }


/**
 * Release a ball from the gravity chute
 * Creates a new physics ball at the chute position with initial velocity
 * @param {Object} ballData - Ball data from the queue
 */
releaseBallFromChute(ballData) {
  if (!this.canvas || !this.world) {
    console.error('PhysicsEngine: Cannot release ball - canvas or world not available');
    return null;
  }

  // Calculate chute release position (matches GravityChute component positioning)
  const canvasWidth = this.canvas.width;
  const chuteX = canvasWidth * 0.75; // 75% from left = 25% from right
  const chuteY = 220; // Just below the chute bottom (200px chute height + 20px top offset)

  // Create physics ball at chute exit
  const releasedBall = this.createBall(
    chuteX, 
    chuteY, 
    ballData.radius || 32
  );

  if (releasedBall) {
    // Add to physics world
    Matter.World.add(this.world, releasedBall);

    // Add to our tracking array
    this.balls.push(releasedBall);

    // Give the ball a slight initial velocity for natural release
    // Small horizontal randomness + gentle downward velocity
    const randomHorizontal = (Math.random() - 0.5) * 2; // -1 to 1
    const initialVelocity = {
      x: randomHorizontal,
      y: 1 // Gentle downward velocity
    };

    Matter.Body.setVelocity(releasedBall, initialVelocity);

    console.log(`PhysicsEngine: Ball released from chute at (${chuteX}, ${chuteY}) with velocity (${randomHorizontal.toFixed(2)}, 1)`);
    
    return releasedBall;
  }

  console.error('PhysicsEngine: Failed to create released ball');
  return null;
}


}