import Matter from 'matter-js';
import { addBallToQueue, canCollectBalls } from '@stores/ballQueue.js';
import { get } from 'svelte/store';

export class PhysicsEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.engine = null;
    this.world = null;
    this.runner = null;
    this.boundaries = [];
    this.balls = [];
    this.ballVisualStates = new Map();

    this.drainHole = {
      centerX: 0,
      centerY: 0,
      radius: 15,      // Detection radius for ball collection (smaller = disappears closer)
      visualRadius: 12,
      shrinkZone: 30   // Radius where shrinking effect begins (just outside the hole)
    };

    this.ballsBeingCollected = new Map();

    this.domBoundaries = []; // Track DOM-derived boundaries separately from viewport boundaries
    this.boundaryMappers = []; // Track all boundary mappers using this engine

    // Track previous canvas dimensions for proportional ball scaling during resize
    this.previousCanvasWidth = 0;
    this.previousCanvasHeight = 0;


    this.debugMode = true;

    this.log = this.debugMode ? console.log : () => { };

  }

  /*
   * Initialize Matter.js physics world
   */
  init() {
    try {
      this.engine = Matter.Engine.create({
        // Anti-tunneling settings - prevent fast objects from passing through boundaries
        positionIterations: 8,    // Default: 6. Higher = better collision detection, lower performance
        velocityIterations: 6,     // Default: 4. Higher = more accurate velocity calculations
        constraintIterations: 4,   // Default: 2. Affects constraint solving accuracy

        enableSleeping: true,      // Allow inactive bodies to "sleep" for better performance

        // Timing configuration for consistent simulation
        timing: {
          timeScale: 1.0,          // Normal speed simulation
          timestamp: 0             // Starting timestamp
        }
      });

      this.world = this.engine.world;

      this.engine.gravity.y = 1;
      this.engine.gravity.x = 0;

      this.runner = Matter.Runner.create({
        // Sub-stepping configuration for anti-tunneling
        delta: 1000 / 120,        // Target 120Hz physics updates (8.33ms per step)
        enabled: true
      });

      this.createViewportBoundaries();

      this.updateDrainHolePosition();

      this.setupCollisionEvents();

      this.populateInitialBallQueue();

      return true;
    } catch (error) {
      console.error('Failed to initialize physics engine:', error);
      return false;
    }
  }

  /*
   * Start the physics simulation
   */
  start() {
    if (!this.engine || !this.runner) {
      return;
    }

    try {
      // Start the runner - physics calculations begin happening every frame
      Matter.Runner.run(this.runner, this.engine);

      this.startRenderLoop();

    } catch (error) {
      console.error('Failed to start physics engine:', error);
    }
  }

  /*
   * Stop the physics simulation
   */
  stop() {
    if (this.runner) {
      Matter.Runner.stop(this.runner);
    }

    if (this.renderLoopId) {
      cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = null;
    }
  }

  /*
   * Clean up all physics objects and stop the render loop
   */
  cleanup() {
    this.stop();

    this.balls.forEach(ball => {
      if (this.world && ball) {
        Matter.World.remove(this.world, ball);
      }
    });
    this.balls = [];

    this.clearBoundaries();

    if (this.world) {
      Matter.World.clear(this.world, false);
    }
  }

  /*
   * Custom render loop - this draws everything on our canvas
   * We use our own instead of Matter.js's built-in renderer for more control
   */
  startRenderLoop() {
    if (this.renderLoopId) {
      return;
    }

    const render = (currentTime) => {
      try {
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.checkBallCollection();

        this.renderBalls();

        // Draw debug information if enabled
        if (this.debugMode) {
          this.renderDebugBoundaries();
        }

        // Schedule next frame
        this.renderLoopId = requestAnimationFrame(render);

      } catch (error) {
        console.error('Render loop error:', error);
        this.renderLoopId = requestAnimationFrame(render);
      }
    };

    this.renderLoopId = requestAnimationFrame(render);
  }

  /*
   * Draw all balls on the canvas with state-aware visual effects
   */
  renderBalls() {
    if (!this.balls.length) return;

    this.balls.forEach((ball, index) => {
      const { x, y } = ball.position;
      const radius = (ball.visualRadius ?? ball.circleRadius) || 22;
      const visualState = this.getBallVisualState(ball);

      this.ctx.save();

      if (visualState === 'hovered') {
        this.renderBallGlow(x, y, radius);
      }

      const ballColor = this.getBallColor(visualState);
      this.ctx.fillStyle = ballColor;

      // First shadow (softer, larger, more offset)
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 3;

      // Draw ball with first shadow
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Second shadow (sharper, closer to ball)
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      this.ctx.shadowBlur = 2;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 1;

      // Draw ball with second shadow
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Reset shadow properties to prevent affecting other drawings
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;

      this.ctx.restore();
    });
  }

  /*
   * Render a glow effect around a ball
   */
  renderBallGlow(centerX, centerY, radius) {
    const glowRadius = radius + 5; // Glow extends beyond the ball
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, radius,           // Inner circle (ball edge)
      centerX, centerY, glowRadius        // Outer circle (glow edge)
    );

    gradient.addColorStop(0, 'rgba(245, 61, 63, 0.3)'); // Semi-transparent red at ball edge
    gradient.addColorStop(0.7, 'rgba(245, 61, 63, 0.1)'); // Lighter red in middle of glow
    gradient.addColorStop(1, 'rgba(245, 61, 63, 0)');     // Fully transparent at glow edge

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  getBallColor(visualState) {
    switch (visualState) {
      case 'hovered':
        return '#C20A0C';
      case 'dragged':
        return '#6E1C1D';
      default:
        return '#E73C3E'; // Default color
    }
  }

// Removed draw debug boundaries, see Onenote/Steponass.com - Notes


  /**
   * Helper method to draw a single boundary
   */
  drawBoundaryDebug(boundary, color, type) {
    const { x, y } = boundary.position;
    const bounds = boundary.bounds;
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;

    // Draw the actual shape if it has vertices (polygons, hexagons)
    if (boundary.vertices && boundary.vertices.length > 0) {
      this.ctx.beginPath();
      const vertices = boundary.vertices;
      this.ctx.moveTo(vertices[0].x, vertices[0].y);
      
      for (let i = 1; i < vertices.length; i++) {
        this.ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      
      this.ctx.closePath();
      this.ctx.stroke();
    } else {
      // Fallback to bounding box for simple shapes
      this.ctx.strokeRect(
        x - width / 2,
        y - height / 2,
        width,
        height
      );
    }

    // Label the boundary
    this.ctx.fillStyle = color;
    this.ctx.font = '12px monospace';
    this.ctx.fillText(
      `${type}: ${boundary.label || 'boundary'}`,
      x - width / 2 + 5,
      y - height / 2 + 15
    );
  }


  /*
   * Create invisible boundaries around the canvas edges to keep balls within main content area
   */

  createViewportBoundaries() {
    if (!this.canvas || !this.world) {
      console.error('Canvas or world not available for boundary creation');
      return;
    }

    this.clearBoundaries();

    const width = this.canvas.width;
    const height = this.canvas.height;
    const thickness = 250; // Extra thick to avoid "tunneling"

    // Store initial canvas dimensions for future scaling calculations
    this.previousCanvasWidth = width;
    this.previousCanvasHeight = height;

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

    boundaries.forEach(boundary => {
      if (boundary) {
        Matter.World.add(this.world, boundary);
        this.boundaries.push(boundary);
      }
    });
  }

  /*
   * Set up collision event listeners for reactive boundary feedback
   */
  setupCollisionEvents() {
    if (!this.engine) {
      return;
    }

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      this.handleCollisionStart(event);
    });
  }


  /**
   * Handle collision start events
   * Examines each collision to determine if visual feedback should trigger
   * @param {Object} event - Matter.js collision event containing pairs of colliding objects
   */
  handleCollisionStart(event) {
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

      // All conditions met: trigger visual feedback
      this.triggerBoundaryReaction(boundaryInfo, impactForce);
    });
  }

  /**
   * Trigger visual reaction for a boundary that was hit by a ball
   * @param {Object} boundaryInfo - The boundary data including DOM element and reaction config
   * @param {number} impactForce - The calculated impact force for potential effect scaling
   */
  triggerBoundaryReaction(boundaryInfo, impactForce) {
    const { element, reactionConfig } = boundaryInfo;

    if (!element || !reactionConfig) {
      return;
    }

    this.applyReactionEffects(element, reactionConfig, impactForce);

  }

  /**
   * Apply the visual effects to a DOM element
   * @param {HTMLElement} element - The DOM element to animate
   * @param {Object} reactionConfig - Animation configuration with scale, brightness, etc.
   * @param {number} impactForce - Force magnitude (could be used for effect intensity)
   */
  applyReactionEffects(element, reactionConfig, impactForce) {
    const { scale, brightness, saturation, hueRotate, blur, dropShadow, duration } = reactionConfig;

    // Clear any ongoing animations to prevent stacking effects
    element.style.transition = '';
    
    // Store the original state (without any existing scale transforms)
    const originalTransform = this.getBaseTransform(element.style.transform || '');
    const originalFilter = this.getBaseFilter(element.style.filter || '');

    // Build filter effects dynamically based on available properties
    let filterEffects = [];
    
    if (brightness) filterEffects.push(`brightness(${brightness.to})`);
    if (saturation) filterEffects.push(`saturate(${saturation.to})`);
    if (hueRotate) filterEffects.push(`hue-rotate(${hueRotate.to}deg)`);
    if (blur) filterEffects.push(`blur(${blur.to}px)`);
    if (dropShadow) filterEffects.push(`drop-shadow(${dropShadow.to})`);

    // Apply the reaction effects with clean transforms
    element.style.transform = `${originalTransform} scale(${scale.to})`;
    element.style.filter = filterEffects.join(' ');

    // Set up the return animation using CSS transitions
    element.style.transition = `transform ${duration}ms ease-out, filter ${duration}ms ease-out`;

    // Return to original state after a short delay
    setTimeout(() => {
      element.style.transform = originalTransform;
      element.style.filter = originalFilter;

      setTimeout(() => {
        element.style.transition = '';
      }, duration);
    }, 50); // Short delay before starting the return animation
  }

  /**
   * Extract base transform without scale to prevent stacking effects
   * @param {string} transformString - Current transform CSS string
   * @returns {string} - Transform string without scale functions
   */
  getBaseTransform(transformString) {
    if (!transformString) return '';
    
    // Remove any scale transforms to prevent accumulation
    return transformString.replace(/scale\([^)]*\)/g, '').trim();
  }

  /**
   * Extract base filter without reaction effects to prevent stacking effects
   * @param {string} filterString - Current filter CSS string
   * @returns {string} - Filter string without brightness/saturate/hue-rotate/blur/drop-shadow functions
   */
  getBaseFilter(filterString) {
    if (!filterString) return '';
    
    // Remove all reaction-based filters to prevent accumulation
    return filterString
      .replace(/brightness\([^)]*\)/g, '')
      .replace(/saturate\([^)]*\)/g, '')
      .replace(/hue-rotate\([^)]*\)/g, '')
      .replace(/blur\([^)]*\)/g, '')
      .replace(/drop-shadow\([^)]*\)/g, '')
      .trim();
  }

  /**
   * Check if a physics body represents a ball
   * @param {Object} body - Matter.js physics body
   * @returns {boolean} - true if this body is a ball
   */
  isBall(body) {
    return body && body.label === 'physics-ball';
  }

  /**
   * Check if a physics body represents a boundary (static or reactive)
   * @param {Object} body - Matter.js physics body  
   * @returns {boolean} - true if this body is a boundary
   */
  isBoundary(body) {
    return body && body.isStatic && body.label !== 'physics-ball';
  }

  /**
   * Get boundary information from boundary mappers
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
    return null;
  }

  /**
   * Calculate the meaningful impact force from a collision
   * @param {Object} collision - Matter.js collision data
   * @param {Object} ball - The ball object involved in collision
   * @returns {number} - Impact force magnitude
   */
  calculateImpactForce(collision, ball) {
    const velocity = ball.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    return speed;
  }

  /*
   * Create a single boundary (wall) at specified position
   * x, y = center position, width/height = dimensions, label = debug name
   */
  createBoundary(x, y, width, height, label = 'boundary') {
    try {
      const boundary = Matter.Bodies.rectangle(x, y, width, height, {
        isStatic: true, // Static means it won't move or be affected by physics
        label: label,   // Useful for debugging
        render: {
          fillStyle: 'transparent'
        },
        restitution: 1, // Bounciness (0 = no bounce, 1 = perfect bounce)
        friction: 0.01      // Surface friction (affects sliding)
      });

      return boundary;
    } catch (error) {
      console.error(`Failed to create boundary ${label}:`, error);
      return null;
    }
  }

  /*
   * Remove all existing boundaries from the world: for when canvas resizes and we need to recreate boundaries
   */
  clearBoundaries() {
    this.boundaries.forEach(boundary => {
      if (this.world && boundary) {
        Matter.World.remove(this.world, boundary);
      }
    });
    this.boundaries = [];
  }

  /*
   * Update boundaries when canvas size changes
   */
  updateBoundaries() {
    if (!this.world) return;

    const oldBoundaries = [...this.boundaries];

    const width = this.canvas.width;
    const height = this.canvas.height;
    const thickness = 50;

    const newBoundaries = [
      this.createBoundary(width / 2, height + thickness / 2, width, thickness, 'floor'),
      this.createBoundary(width / 2, -thickness / 2, width, thickness, 'ceiling'),
      this.createBoundary(-thickness / 2, height / 2, thickness, height, 'left-wall'),
      this.createBoundary(width + thickness / 2, height / 2, thickness, height, 'right-wall')
    ];

    newBoundaries.forEach(boundary => {
      if (boundary) {
        Matter.World.add(this.world, boundary);
      }
    });

    oldBoundaries.forEach(boundary => {
      if (this.world && boundary) {
        Matter.World.remove(this.world, boundary);
      }
    });

    this.boundaries = newBoundaries.filter(b => b !== null);

    this.updateDrainHolePosition();

    // Proportionally reposition balls based on canvas size change
    try {
      if (this.previousCanvasWidth > 0 && this.previousCanvasHeight > 0) {
        const scaleX = width / this.previousCanvasWidth;
        const scaleY = height / this.previousCanvasHeight;

        this.balls.forEach(ball => {
          const currentX = ball.position.x;
          const currentY = ball.position.y;

          const newX = currentX * scaleX;
          const newY = currentY * scaleY;

          const radius = ball.circleRadius || 22;
          const clampedX = Math.max(radius, Math.min(width - radius, newX));
          const clampedY = Math.max(radius, Math.min(height - radius, newY));

          Matter.Body.setPosition(ball, { x: clampedX, y: clampedY });

          const currentVel = ball.velocity;
          const scaledVelX = currentVel.x * scaleX;
          const scaledVelY = currentVel.y * scaleY;
          Matter.Body.setVelocity(ball, { x: scaledVelX, y: scaledVelY });

        });
      }
    } catch (error) {
      console.warn('Ball repositioning during resize failed:', error);
    }

    this.previousCanvasWidth = width;
    this.previousCanvasHeight = height;


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

  /*
   * Create a physics ball at specified position
   * radius = ball size, x/y = starting position
   */
  createBall(x, y, radius = 22) {
    try {
      const ball = Matter.Bodies.circle(x, y, radius, {
        // Physical properties that affect how the ball behaves
        restitution: 0.95,    // Bounciness (0.7 = fairly bouncy)
        friction: 0.002,      // Surface friction (low = rolls easily) 
        frictionAir: 0.008,   // Air resistance (prevents infinite bouncing)
        density: 0.005,      // Mass per unit area (affects how heavy it feels)
        render: {
          fillStyle: '#E73C3E'
        },
        // Label for debugging
        label: 'physics-ball'
      });

      ball.circleRadius = radius;

      return ball;
    } catch (error) {
      console.error('Failed to create ball:', error);
      return null;
    }
  }

  /*
   * Add a ball to the physics world and tracking array
   */
  addBall(x, y, radius = 22) {
    const ball = this.createBall(x, y, radius);

    if (ball && this.world) {
      // Add to Matter.js world so it participates in physics
      Matter.World.add(this.world, ball);

      // Add to tracking array so we can render it
      this.balls.push(ball);

      return ball;
    }

    return null;
  }

  /**
   * Pre-populate the ball queue for the gravity chute
   * This creates ball data (not physics bodies) that will be shown in the chute
   */
  populateInitialBallQueue() {
    for (let i = 0; i < 24; i++) {
      const ballData = {
        radius: 22 + Math.random() * 2, // Vary size (22-24px)
        color: '#E73C3E',
        id: `initial-ball-${i}`,
        queuedAt: Date.now() + i
      };
      const success = addBallToQueue(ballData);
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
      return;
    }
    this.ballVisualStates.set(ball, state);
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
  }

  /**
 * Register a DOM boundary with the physics engine
 * This is called by BoundaryMapper when elements register themselves
 */
  registerDomBoundary(physicsBody, metadata = {}) {
    if (!physicsBody || !this.world) {
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
   * Update all DOM boundary positions
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

    // Position drain hole at bottom-left of canvas (horizontal orientation)
    this.drainHole.centerX = 60; // Half pipe length from left edge (120/2 = 60)
    this.drainHole.centerY = canvasHeight - 34; // Bottom placement with margin (48/2 + 10 = 34)
  }

  /**
   * Check all balls for drain hole collection
   * Called every frame during render loop
   */
  checkBallCollection() {
    // Only collect if queue has space
    const canCollect = get(canCollectBalls);
    if (!canCollect) {
      return;
    }

    this.balls.forEach((ball, ballIndex) => {
      const ballX = ball.position.x;
      const ballY = ball.position.y;

      // Calculate distance from ball center to drain hole center
      const deltaX = ballX - this.drainHole.centerX;
      const deltaY = ballY - this.drainHole.centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If this ball is already being collected, continue shrinking it every frame
      if (this.ballsBeingCollected.has(ball)) {
        this.updateBallShrinking(ball, distance);
        return;
      }

      // Check if ball is within the shrink zone
      if (distance < this.drainHole.shrinkZone) {
        this.startBallCollection(ball, ballIndex, distance);
      }
    });
  }

  /*
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
        originalRadius: ball.circleRadius || 22,
        startTime: Date.now(),
        ballIndex: ballIndex
      });
    }

    // Update shrinking effect based on distance
    this.updateBallShrinking(ball, distanceToHole);
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
        radius: ball.circleRadius || 22,
        color: '#E73C3E',
        originalLabel: ball.label
      };

      // Add to queue
      const success = addBallToQueue(ballData);

      if (success) {
        if (this.world && ball) {
          Matter.World.remove(this.world, ball);
        }

        this.balls.splice(ballIndex, 1);
        this.ballsBeingCollected.delete(ball);

        this.ballVisualStates.delete(ball);

      } else {
        // Queue was full, stop the collection process
        this.ballsBeingCollected.delete(ball);

        if (ball.visualRadius !== undefined) {
          delete ball.visualRadius;
        }

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
      return null;
    }

    // Calculate chute release position (matches GravityChute component positioning)
    const canvasWidth = this.canvas.width;
    const chuteX = canvasWidth * 0.85; // 80% from left = 20% from right (matches GravityChute)
    // Chute is positioned with 75% above screen, so visible bottom is at 25% of chute height
    const chuteY = (400 * 0.25) + 10; // Bottom of visible chute section + small margin

    // Create physics ball at chute exit
    const releasedBall = this.createBall(
      chuteX,
      chuteY,
      ballData.radius || 22
    );

    if (releasedBall) {
      Matter.World.add(this.world, releasedBall);

      this.balls.push(releasedBall);

      // Give the ball a slight initial velocity for natural release
      // Small horizontal randomness + gentle downward velocity
      const randomHorizontal = (Math.random() - 0.5) * 2; // -1 to 1
      const initialVelocity = {
        x: randomHorizontal,
        y: 1 // Gentle downward velocity
      };

      Matter.Body.setVelocity(releasedBall, initialVelocity);

      return releasedBall;
    }

    return null;
  }

}