import Matter from 'matter-js';

/*
 * Handles the coordinate translation between DOM (top-left origin) and physics (center origin)
 */
export class BoundaryMapper {
  constructor(physicsEngine) {
    this.physicsEngine = physicsEngine;
    this.registeredBoundaries = new Map(); // Track DOM element -> physics body relationships

    // Debug logging
    this.debug = physicsEngine?.debugMode || false;
    this.log = this.debug ? console.log : () => { };

    // Register this mapper with the physics engine
    if (physicsEngine) {
      physicsEngine.registerBoundaryMapper(this);
    }
  }

  /**
   * Register a DOM element as a physics boundary
   * @param {string} id - unique identifier for this boundary
   * @param {HTMLElement} element - the DOM element to map
   * @param {Object} options - physics properties (restitution, friction, etc.)
   * @returns {Object|null} - the created physics body or null if failed
   */
  registerBoundary(id, element, options = {}) {
    if (!element || !this.physicsEngine?.world) {
      console.warn('BoundaryMapper: Missing element or physics world');
      return null;
    }

    // If this element is already registered, update it instead
    if (this.registeredBoundaries.has(id)) {
      this.log(`BoundaryMapper: Boundary "${id}" already registered, updating position`);
      this.updateBoundaryPosition(id, element);
      return this.registeredBoundaries.get(id).physicsBody;
    }

    try {
      // Get element's current position and size (simplified)
      const rect = this.getElementRect(element);

      // Create physics body from element coordinates
      const physicsBody = this.createPhysicsBody(rect, options, id);

      if (physicsBody) {
        // Add to physics world
        Matter.World.add(this.physicsEngine.world, physicsBody);

        // Tell the PhysicsEngine to track this for debug rendering
        this.physicsEngine.registerDomBoundary(physicsBody, {
          id,
          element,
          type: 'dom-element'
        });

        // Track the relationship
        this.registeredBoundaries.set(id, {
          element,
          physicsBody,
          options,
          originalRect: rect // Store original rect for position updates
        });

        // Set up element-specific ResizeObserver
        this.setupElementObserver(id, element);

        this.log(`BoundaryMapper: Registered boundary "${id}" at position (${rect.left}, ${rect.top}), size: ${rect.width}x${rect.height}`);

        return physicsBody;
      }
    } catch (error) {
      console.error(`BoundaryMapper: Failed to register boundary "${id}":`, error);
    }

    return null;
  }

  /**
   * Get element's bounding rectangle relative to main container (simplified)
   */
  getElementRect(element) {
    const rect = element.getBoundingClientRect();

    // Since we're now working in canvas-relative coordinates (within main),
    // we can use the viewport rect directly as it's relative to the canvas parent
    const elementRect = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom,
      x: rect.left,
      y: rect.top
    };

    if (this.debug) {
      this.log(`BoundaryMapper: Element rect: (${elementRect.left}, ${elementRect.top}), size: ${elementRect.width}x${elementRect.height}`);
    }

    return elementRect;
  }

  /**
   * Update boundary positions (simplified for canvas-relative coordinates)
   */
  updateBoundaryPositions() {
    this.registeredBoundaries.forEach((boundaryInfo, id) => {
      this.updateBoundaryPosition(id, boundaryInfo.element);
    });
  }

  /**
   * Update a specific boundary's position
   */
  updateBoundaryPosition(id, element) {
    const boundaryInfo = this.registeredBoundaries.get(id);
    if (!boundaryInfo || !boundaryInfo.physicsBody) {
      return;
    }

    try {
      // Get current element position (simplified)
      const rect = this.getElementRect(element);

      // Update physics body position
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);

      Matter.Body.setPosition(boundaryInfo.physicsBody, { x: centerX, y: centerY });

      if (this.debug) {
        this.log(`BoundaryMapper: Updated "${id}" to position (${centerX.toFixed(1)}, ${centerY.toFixed(1)})`);
      }
    } catch (error) {
      console.error(`BoundaryMapper: Failed to update boundary "${id}":`, error);
    }
  }

  /**
   * Convert DOM rectangle to Matter.js physics body
   * @param {DOMRect} rect - element's bounding rectangle in document coordinates
   * @param {Object} options - physics properties
   * @param {string} label - debug label for the boundary
   * @returns {Object|null} - Matter.js body
   */
  createPhysicsBody(rect, options, label) {
    // Physics bodies use center coordinates, DOM uses top-left
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    // Default physics properties
    const physicsOptions = {
      isStatic: true, // DOM elements don't move due to physics
      label: label || 'dom-boundary',
      render: {
        fillStyle: 'transparent' // We don't want Matter.js to render these
      },
      // Default bouncy properties (can be overridden)
      restitution: 0.6, // bounciness
      friction: 0.3,     // surface friction
      ...options         // Allow overriding defaults
    };

    try {
      const body = Matter.Bodies.rectangle(
        centerX,
        centerY,
        rect.width,
        rect.height,
        physicsOptions
      );

      return body;
    } catch (error) {
      console.error('BoundaryMapper: Failed to create physics body:', error);
      return null;
    }
  }

  /**
 * Set up ResizeObserver for a specific element
 */
  setupElementObserver(id, element) {
    if (!window.ResizeObserver) return;

    const observer = new ResizeObserver(() => {
      this.updateBoundaryPosition(id, element);
    });

    observer.observe(element);

    // Store observer for cleanup
    const boundaryInfo = this.registeredBoundaries.get(id);
    if (boundaryInfo) {
      boundaryInfo.resizeObserver = observer;
    }
  }


  /**
   * Unregister a boundary and clean up resources
   */
  unregisterBoundary(id) {
    const boundaryInfo = this.registeredBoundaries.get(id);
    if (!boundaryInfo) return;

    // Remove from physics world
    if (this.physicsEngine?.world && boundaryInfo.physicsBody) {
      Matter.World.remove(this.physicsEngine.world, boundaryInfo.physicsBody);
      this.physicsEngine.unregisterDomBoundary(boundaryInfo.physicsBody);
    }

    // Clean up ResizeObserver
    if (boundaryInfo.resizeObserver) {
      boundaryInfo.resizeObserver.disconnect();
    }

    this.registeredBoundaries.delete(id);
    this.log(`BoundaryMapper: Unregistered boundary "${id}"`);
  }
}