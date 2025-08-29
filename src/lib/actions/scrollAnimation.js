/**
 * @param {HTMLElement} node - The element to observe
 * @param {Object} [options] - Animation options
 * @param {string} [options.animationClass] - CSS class to add when in view
 * @param {number} [options.threshold] - Intersection threshold (0-1)
 * @param {string} [options.rootMargin] - Root margin for intersection observer
 * @param {boolean} [options.once] - If true, unobserve after first intersection
 */
export function scrollAnimation(node, options = {}) {
  const {
    animationClass = 'animate-in-view',
    threshold = 0,
    rootMargin = '0px',
    once = true
  } = options;

  let observer;

  function handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        // Once animated, stop observing if configured
        if (once && observer) {
          observer.unobserve(entry.target);
        }
      }
    });
  }

  function setupObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for environments without IntersectionObserver
      node.classList.add(animationClass);
      return;
    }

    // Immediate check: if already in viewport on mount, apply class right away
    const rect = node.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const isInViewport = (
      rect.top < viewportHeight &&
      rect.bottom > 0 &&
      rect.left < viewportWidth &&
      rect.right > 0
    );

    if (isInViewport) {
      // Defer adding the class to the next frame to ensure styles are applied
      // and the keyframe animation reliably triggers
      requestAnimationFrame(() => {
        node.classList.add(animationClass);
      });
      if (once) {
        return; // Do not observe further if we only need to animate once
      }
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