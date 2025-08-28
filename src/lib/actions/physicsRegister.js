import { get } from 'svelte/store';
import { physicsEngine } from '@stores/physics.js';

export function physicsRegister(element, options = {}) {
  let registeredBoundary = null;
  let boundaryId = null;
  let registrationTimeout = null;

  // Generate ID automatically if not provided
  function generateId() {
    if (options.id) return options.id;
    
    const tag = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim()
      .split(/\s+/)
      .slice(0, 3)
      .join('-')
      .toLowerCase() || '';
    const position = Array.from(element.parentElement?.children || []).indexOf(element);
    
    return `${tag}-${textContent}-${position}`.replace(/[^a-z0-9-]/g, '');
  }

  function register() {
    const engine = get(physicsEngine);
    
    if (!engine) {
      throw new Error(`PhysicsRegister: Physics engine not ready for element "${boundaryId}"`);
    }
    
    if (!engine.boundaryMappers || !engine.boundaryMappers[0]) {
      throw new Error(`PhysicsRegister: No boundary mappers available for element "${boundaryId}"`);
    }
    
    const mapper = engine.boundaryMappers[0];
    registeredBoundary = mapper.registerBoundary(boundaryId, element, options);
    
  }

  boundaryId = generateId();
  registrationTimeout = setTimeout(() => {
    register();
  }, 500);

  return {
    update(newOptions) {
      // Re-register if options change significantly
      Object.assign(options, newOptions);
    },
    
    destroy() {
            // Clear timeout if component unmounts before registration
            if (registrationTimeout) {
              clearTimeout(registrationTimeout);
            }
      if (registeredBoundary && boundaryId) {
        const engine = get(physicsEngine);
        if (engine?.boundaryMappers?.[0]) {
          engine.boundaryMappers[0].unregisterBoundary(boundaryId);
        }
      }
    }
  };
}