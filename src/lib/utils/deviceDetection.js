
/**
 * Detect the user's primary input method to optimize interaction systems
 * 
 * This function combines multiple detection strategies to reliably identify
 * whether the user is primarily using touch, mouse, or hybrid input.
 * 
 * @returns {string} - One of: 'mouse-primary', 'touch-primary', 'hybrid-device'
 */
export function detectPrimaryInputMethod() {
  // Strategy 1: Check for touch capability through multiple APIs
  const hasTouchCapability = (
    'ontouchstart' in window ||           // Basic touch event support
    navigator.maxTouchPoints > 0      // Modern API for touch points
  );
  
  // Strategy 2: Analyze pointer characteristics via CSS Media Queries
  // Fine pointer usually indicates mouse/trackpad precision
  const hasFinePrimaryPointer = window.matchMedia && 
    window.matchMedia('(pointer: fine)').matches;
  
  // Strategy 3: Check for hover capability at the device level
  // True hover requires the ability to detect pointer proximity without contact
  const canHoverOnPrimaryInput = window.matchMedia && 
    window.matchMedia('(hover: hover)').matches;
  
  // Strategy 4: Check for coarse pointer (typically touch)
  const hasCoarsePrimaryPointer = window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches;
  
  // Decision logic: Combine signals for reliable classification
  // Pure mouse/trackpad devices
  if (!hasTouchCapability && hasFinePrimaryPointer && canHoverOnPrimaryInput) {
    return 'mouse-primary';
  }
  
  // Pure touch devices (phones, tablets without precise stylus)
  if (hasTouchCapability && hasCoarsePrimaryPointer && !canHoverOnPrimaryInput) {
    return 'touch-primary';
  }
  
  // Hybrid devices (laptops with touchscreens, tablets with precision stylus)
  if (hasTouchCapability && hasFinePrimaryPointer) {
    return 'hybrid-device';
  }
  
  // Conservative fallback for uncertain cases
  // Default to mouse-primary since it's the more restrictive interaction model
  return 'mouse-primary';
}

/**
 * Check if the current device supports touch input
 * Simplified version for basic touch capability detection
 * 
 * @returns {boolean} - true if device supports touch input
 */
export function isTouchCapable() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

/**
 * Check if the device prefers reduced motion
 * Important for accessibility and performance optimization
 * 
 * @returns {boolean} - true if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get device pixel ratio for high-DPI display optimization
 * Useful for canvas rendering optimization
 * 
 * @returns {number} - device pixel ratio, clamped to reasonable limits
 */
export function getOptimalPixelRatio() {
  const rawRatio = window.devicePixelRatio || 1;
  // Clamp to reasonable limits for performance and memory usage
  return Math.min(rawRatio, 2.5);
}

/**
 * Comprehensive device capability report
 * Useful for debugging and understanding the user's device characteristics
 * 
 * @returns {Object} - Complete device capability information
 */
export function getDeviceCapabilities() {
  return {
    primaryInputMethod: detectPrimaryInputMethod(),
    touchCapable: isTouchCapable(),
    prefersReducedMotion: prefersReducedMotion(),
    optimalPixelRatio: getOptimalPixelRatio(),
    hasHoverCapability: window.matchMedia && window.matchMedia('(hover: hover)').matches,
    hasFinePrimaryPointer: window.matchMedia && window.matchMedia('(pointer: fine)').matches,
    hasCoarsePrimaryPointer: window.matchMedia && window.matchMedia('(pointer: coarse)').matches,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    userAgent: navigator.userAgent,
    // Additional debugging information
    timestamp: new Date().toISOString(),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  };
}