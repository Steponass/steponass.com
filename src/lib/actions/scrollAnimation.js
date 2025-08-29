/**
 * @param {HTMLElement} node - The element to observe
 * @param {Object} options - Animation options
 * @param {string} options.animationClass - CSS class to add when in view
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 */
export function scrollAnimation(node, options = {}) {
  const {
    animationClass = 'animate-in-view',
    threshold = 0.1,
    rootMargin = '0px 0px -20% 0px'
  } = options;

  let observer;

  function handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        // Once animated, stop observing
        observer.unobserve(entry.target);
      }
    });
  }

  function setupObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for environments without IntersectionObserver
      node.classList.add(animationClass);
      return;
    }

    observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observer.observe(node);
  }

  // Initialize
  setupObserver();

  return {
    update(newOptions) {
      // Clean up existing observer
      if (observer) {
        observer.unobserve(node);
      }
      
      // Update options and recreate observer
      Object.assign(options, newOptions);
      setupObserver();
    },
    
    destroy() {
      if (observer) {
        observer.unobserve(node);
        observer.disconnect();
      }
    }
  };
}