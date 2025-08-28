/*
 * CanvasManager: Handles dynamic height calculation, devicePixelRatio optimization, and memory monitoring
 */
export class CanvasManager {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.options = {
      footerSelector: 'footer',
      debug: false,
      ...options
    };

    this.lastWidth = 0;
    this.lastHeight = 0;

    this.resizeObserver = null;
    this.eventCleanupFns = [];

  }

  /*
   * Calculate optimal canvas height ( equal to <main> height)
   */
  calculateCanvasHeight() {
    const parent = this.canvas.parentElement;
    if (!parent) {
      return window.innerHeight;
    }

    const parentHeight = parent.offsetHeight;
    return parentHeight;
  }

  /*
   * Calculate optimal canvas width ( equal to <main> width)
   */
  calculateCanvasWidth() {
    const parent = this.canvas.parentElement;
    if (!parent) {
      return window.innerWidth;
    }

    const parentWidth = parent.offsetWidth;
    return parentWidth;
  }

  /*
   * Update canvas dimensions if they've changed
   */
  updateCanvasSize() {
    if (!this.canvas) return false;

    const newWidth = this.calculateCanvasWidth();
    const newHeight = this.calculateCanvasHeight();

    if (newWidth === this.lastWidth && newHeight === this.lastHeight) {
      return false;
    }

    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    // Update CSS display size to match
    this.canvas.style.width = `${newWidth}px`;
    this.canvas.style.height = `${newHeight}px`;

    this.lastWidth = newWidth;
    this.lastHeight = newHeight;

    return true;
  }

  /*
   * Set up observers and event listeners for canvas resizing
   */
  startWatching() {
    if (!this.canvas) {
      return;
    }

    this.updateCanvasSize();

    // Set up ResizeObserver for efficient size monitoring
    this.resizeObserver = new ResizeObserver(() => {
      this.updateCanvasSize();
    });

    // Observe <main> for size changes
    const parent = this.canvas.parentElement;
    if (parent) {
      this.resizeObserver.observe(parent);
    };
  }

  /**
   * Stop watching for canvas size changes and cleanup resources
   */
  stopWatching() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.eventCleanupFns.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('CanvasManager - Cleanup error:', error);
      }
    });
    this.eventCleanupFns = [];

  }

  /*
   * Get current canvas dimensions
   */
  getDimensions() {
    return {
      width: this.lastWidth,
      height: this.lastHeight
    };
  }

  /*
   * Force a canvas size update (useful for manual triggers)
   */
  forceUpdate() {
    this.lastWidth = 0; // Reset cache to force update
    this.lastHeight = 0;
    return this.updateCanvasSize();
  }

}