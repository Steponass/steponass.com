import Matter from 'matter-js';

const STANDARD_REACTION_CONFIG = {
  animation: {
    scale: { from: 1.0, to: 1.05 },
    brightness: { from: 1.0, to: 1.2 },
    saturation: { from: 1.0, to: 1.3 },
    duration: 200
  },
  defaultVelocityThreshold: 2.3
};

/*
 * Handles the coordinate translation between DOM (top-left origin) and physics (center origin)
 */
export class BoundaryMapper {
  constructor(physicsEngine) {
    this.physicsEngine = physicsEngine;
    this.registeredBoundaries = new Map(); // Track DOM element -> physics body relationships

    this.debug = physicsEngine?.debugMode || false;

    if (physicsEngine) {
      physicsEngine.registerBoundaryMapper(this);
    }
  }

  registerBoundary(id, element, options = {}) {

    const {
      boundaryType = 'static', // defaults to static
      velocityThreshold = STANDARD_REACTION_CONFIG.defaultVelocityThreshold,
      shape = 'rectangle', // defaults to rectangle
      ...physicsOptions // all other options go to Matter.js body
    } = options;

    if (!element || !this.physicsEngine?.world) {
      return null;
    }

    // If this element is already registered, update it instead
    if (this.registeredBoundaries.has(id)) {
      this.updateBoundaryGeometry(id, element);
      return this.registeredBoundaries.get(id).physicsBody;
    }

    try {
      const rect = this.getElementRect(element);

      const physicsBody = this.createPhysicsBody(rect, options, id);

      if (physicsBody) {
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
          options: { ...physicsOptions, shape },
          originalRect: rect,
          boundaryType,
          reactionConfig: boundaryType === 'reactive' ? {
            velocityThreshold,
            ...STANDARD_REACTION_CONFIG.animation
          } : null,
          resizeObserver: null
        });

        // Set up element-specific ResizeObserver
        this.setupElementObserver(id, element);

        return physicsBody;
      }
    } catch (error) {
      console.error(`BoundaryMapper: Failed to register boundary "${id}":`, error);
    }

    return null;
  }

  /**
   * Get element's bounding rectangle relative to main container
   * @param {HTMLElement} element - The DOM element to measure
   * @returns {Object} - Rectangle with position and dimensions
   */
  getElementRect(element) {
    const rect = element.getBoundingClientRect();
    const canvas = this.physicsEngine?.canvas;
    const canvasRect = canvas?.getBoundingClientRect();
    const offsetLeft = canvasRect ? canvasRect.left : 0;
    const offsetTop = canvasRect ? canvasRect.top : 0;
    const elementRect = {
      left: rect.left - offsetLeft,
      top: rect.top - offsetTop,
      width: rect.width,
      height: rect.height,
      right: rect.right - offsetLeft,
      bottom: rect.bottom - offsetTop,
      x: rect.left - offsetLeft,
      y: rect.top - offsetTop
    };

    return elementRect;
  }

  /*
   * Update boundary positions for canvas-relative coordinates
   */
  updateBoundaryPositions() {
    this.registeredBoundaries.forEach((boundaryInfo, id) => {
      this.updateBoundaryGeometry(id, boundaryInfo.element);
    });
  }

  /*
   * Update a specific boundary's position
   */
  updateBoundaryPosition(id, element) {
    const boundaryInfo = this.registeredBoundaries.get(id);
    if (!boundaryInfo || !boundaryInfo.physicsBody) {
      return;
    }

    try {
      // Get current element position
      const rect = this.getElementRect(element);

      // Update physics body position only (size handled elsewhere)
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);

      Matter.Body.setPosition(boundaryInfo.physicsBody, { x: centerX, y: centerY });

    } catch (error) {
      console.error(`BoundaryMapper: Failed to update boundary "${id}":`, error);
    }
  }

  /*
   * Ensure both position and size match the element. If width/height changed,
   * recreate the physics body with new geometry to avoid stale bounds.
   */
  updateBoundaryGeometry(id, element) {
    const info = this.registeredBoundaries.get(id);
    if (!info) return;

    const prevRect = info.originalRect;
    const rect = this.getElementRect(element);

    const widthChanged = !prevRect || Math.abs(rect.width - prevRect.width) > 0.5;
    const heightChanged = !prevRect || Math.abs(rect.height - prevRect.height) > 0.5;

    if (widthChanged || heightChanged) {
      try {
        const oldBody = info.physicsBody;
        const creationOptions = { ...(info.options || {}), label: oldBody?.label };
        const newBody = this.createPhysicsBody(rect, creationOptions, oldBody?.label);

        if (newBody) {
          if (this.physicsEngine?.world && oldBody) {
            Matter.World.remove(this.physicsEngine.world, oldBody);
            this.physicsEngine.unregisterDomBoundary(oldBody);
          }

          Matter.World.add(this.physicsEngine.world, newBody);
          this.physicsEngine.registerDomBoundary(newBody, {
            id,
            element,
            type: 'dom-element'
          });

          info.physicsBody = newBody;
          info.originalRect = rect;
        }
      } catch (error) {
        console.error(`BoundaryMapper: Failed to recreate body for "${id}":`, error);
      }
    } else {
      // If size is stable, update position only
      this.updateBoundaryPosition(id, element);
      info.originalRect = rect;
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

    const { shape = 'rectangle', ...physicsOptions } = options;

    // Default physics properties
    const defaultOptions = {
      isStatic: true,
      label: label || 'dom-boundary',
      render: {
        fillStyle: 'transparent'
      },
      restitution: 0.8, // bounciness
      friction: 0.2,     // surface friction
      ...physicsOptions
    };

    try {
      let body;

      if (shape === 'circle') {
        // For circular boundaries, using smaller dimension as diameter
        const radius = Math.min(rect.width, rect.height) / 2;
        body = Matter.Bodies.circle(centerX, centerY, radius, defaultOptions);

      } else {
        // Default rectangular boundary
        body = Matter.Bodies.rectangle(
          centerX,
          centerY,
          rect.width,
          rect.height,
          defaultOptions
        );
      }

      return body;
    } catch (error) {
      console.error('BoundaryMapper: Failed to create physics body:', error);
      return null;
    }
  }

  /*
   * Set up ResizeObserver for a specific element
   */
  setupElementObserver(id, element) {
    if (!window.ResizeObserver) return;

    const observer = new ResizeObserver(() => {
      this.updateBoundaryGeometry(id, element);
    });

    observer.observe(element);

    // Store observer for cleanup
    const boundaryInfo = this.registeredBoundaries.get(id);
    if (boundaryInfo) {
      boundaryInfo.resizeObserver = observer;
    }
  }

  /*
   * Unregister a boundary and clean up resources
   */
  unregisterBoundary(id) {
    const boundaryInfo = this.registeredBoundaries.get(id);
    if (!boundaryInfo) return;

    if (this.physicsEngine?.world && boundaryInfo.physicsBody) {
      Matter.World.remove(this.physicsEngine.world, boundaryInfo.physicsBody);
      this.physicsEngine.unregisterDomBoundary(boundaryInfo.physicsBody);
    }

    // Clean up ResizeObserver
    if (boundaryInfo.resizeObserver) {
      boundaryInfo.resizeObserver.disconnect();
    }

    this.registeredBoundaries.delete(id);
  }
}