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

    this.log = this.debugMode ? console.log : () => {};
    
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

      // Create viewport boundaries now that we have a world
      this.createViewportBoundaries();

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

        // Draw all the physics objects
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

    // Draw background for text
    const padding = 10;
    const lineHeight = 18;
    const textWidth = 200;
    const textHeight = info.length * lineHeight + padding * 2;

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
   * These act like walls that keep balls from falling out of view
   */
  createViewportBoundaries() {
    if (!this.canvas || !this.world) {
      console.error('Canvas or world not available for boundary creation');
      return;
    }

    const width = this.canvas.width;
    const height = this.canvas.height;
    const thickness = 50; // How thick our invisible walls are

    // Clear existing boundaries first
    this.clearBoundaries();

    // Create four walls around the viewport
    const boundaries = [
      // Floor - bottom boundary (balls will bounce off this)
      this.createBoundary(width / 2, height + thickness / 2, width, thickness, 'floor'),

      // Ceiling - top boundary (prevents balls from going too high)
      this.createBoundary(width / 2, -thickness / 2, width, thickness, 'ceiling'),

      // Left wall
      this.createBoundary(-thickness / 2, height / 2, thickness, height, 'left-wall'),

      // Right wall  
      this.createBoundary(width + thickness / 2, height / 2, thickness, height, 'right-wall')
    ];

    // Add all boundaries to the physics world
    boundaries.forEach(boundary => {
      if (boundary) {
        Matter.World.add(this.world, boundary);
        this.boundaries.push(boundary);
      }
    });

    console.log(`Created ${boundaries.length} viewport boundaries`);
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
   * Create the initial ball above the launcher container
   * Using fixed positioning for now as requested
   */
  createInitialBall() {
    if (!this.canvas) {
      console.error('Canvas not available for ball creation');
      return;
    }

    // Calculate position above the launcher container
    // Launcher is at right: 0%, bottom: 2%, width: 10%
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Position the ball above where the launcher would be
    const ballX = canvasWidth * 0.95; // 95% from left (near right edge)
    const ballY = canvasHeight * 0.2;  // 20% from top (well above the launcher)

    // Create ball with 56px diameter (28px radius) - middle of your 48-64px range
    const ball = this.addBall(ballX, ballY, 28);

    if (ball) {
      console.log('Initial ball created above launcher position');
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
}