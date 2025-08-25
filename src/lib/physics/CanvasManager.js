/**
 * CanvasManager - Centralized canvas sizing and memory management
 * Handles dynamic height calculation, devicePixelRatio optimization, and memory monitoring
 */
export class CanvasManager {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.options = {
      footerSelector: 'footer',
      debug: false,
      ...options
    };
    
    // Cached dimensions to avoid unnecessary updates
    this.lastWidth = 0;
    this.lastHeight = 0;
    
    // ResizeObserver and event listeners
    this.resizeObserver = null;
    this.eventCleanupFns = [];
    
    this.log = this.options.debug ? console.log : () => {};
  }

  /**
   * Calculate the optimal canvas height (viewport top to footer top)
   */
  calculateCanvasHeight() {
    const footer = document.querySelector(this.options.footerSelector);
    
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Ensure canvas height stays within viewport boundaries
      const canvasHeight = Math.max(
        0,
        Math.min(viewportHeight, footerRect.top)
      );
      
      this.log('CanvasManager - Footer found:', {
        footerViewportTop: footerRect.top,
        canvasHeight,
        viewportHeight
      });
      
      return canvasHeight;
    } else {
      this.log('CanvasManager - Footer not found, using viewport height');
      return window.innerHeight;
    }
  }

  /**
   * Calculate the optimal canvas width (full viewport width)
   */
  calculateCanvasWidth() {
    return window.innerWidth;
  }

  /**
   * Update canvas dimensions if they've changed
   * Returns true if dimensions were updated, false if no change
   */
  updateCanvasSize() {
    if (!this.canvas) return false;

    const newWidth = this.calculateCanvasWidth();
    const newHeight = this.calculateCanvasHeight();

    // Skip update if dimensions haven't changed (performance optimization)
    if (newWidth === this.lastWidth && newHeight === this.lastHeight) {
      this.log('CanvasManager - No size change, skipping update');
      return false;
    }

    // Update canvas drawing buffer size
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    // Update CSS display size to match
    this.canvas.style.width = `${newWidth}px`;
    this.canvas.style.height = `${newHeight}px`;

    // Cache the new dimensions
    this.lastWidth = newWidth;
    this.lastHeight = newHeight;

    this.log(`CanvasManager - Canvas updated: ${newWidth}x${newHeight}px`);
    return true;
  }

  /**
   * Set up observers and event listeners for canvas resizing
   */
  startWatching() {
    if (!this.canvas) {
      console.error('CanvasManager - No canvas element provided');
      return;
    }

    // Initial size update
    this.updateCanvasSize();

    // Set up ResizeObserver for efficient size monitoring
    this.resizeObserver = new ResizeObserver(() => {
      this.updateCanvasSize();
    });

    // Observe document element (viewport changes) and footer (footer size changes)
    this.resizeObserver.observe(document.documentElement);
    
    const footer = document.querySelector(this.options.footerSelector);
    if (footer) {
      this.resizeObserver.observe(footer);
    }

    // Set up event listeners for cases ResizeObserver might miss
    const onResize = () => this.updateCanvasSize();
    const onScroll = () => this.updateCanvasSize();

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Store cleanup functions
    this.eventCleanupFns.push(() => window.removeEventListener('resize', onResize));
    this.eventCleanupFns.push(() => window.removeEventListener('scroll', onScroll));

    this.log('CanvasManager - Started watching for size changes');
  }

  /**
   * Stop watching for canvas size changes and cleanup resources
   */
  stopWatching() {
    // Disconnect ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clean up event listeners
    this.eventCleanupFns.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('CanvasManager - Cleanup error:', error);
      }
    });
    this.eventCleanupFns = [];

    this.log('CanvasManager - Stopped watching for size changes');
  }

  /**
   * Get current canvas dimensions
   */
  getDimensions() {
    return {
      width: this.lastWidth,
      height: this.lastHeight
    };
  }

  /**
   * Force a canvas size update (useful for manual triggers)
   */
  forceUpdate() {
    this.lastWidth = 0; // Reset cache to force update
    this.lastHeight = 0;
    return this.updateCanvasSize();
  }
}