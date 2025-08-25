<script>
  import { onMount, onDestroy, setContext } from 'svelte';
  import { writable } from 'svelte/store'; // Add this import
  import { BoundaryMapper } from '@physics/BoundaryMapper.js';
  import { physicsEngine } from '@stores/physics.js';
  
  // Props that can be passed to this wrapper
  export let sectionId = 'physics-section'; // unique identifier for this section
  export let debug = false;
  
  let boundaryMapper = null;
  let physicsEngineInstance = null;
  
  // Create a reactive store for physics readiness
  const isPhysicsReady = writable(false);
  
  // Svelte's setContext makes these functions available to ALL child components
  // Children can access these using getContext('physics')
  setContext('physics', {
    registerBoundary: (id, element, options = {}) => {
      if (boundaryMapper) {
        return boundaryMapper.registerBoundary(id, element, options);
      } else {
        console.warn('PhysicsAwareSection: BoundaryMapper not ready yet');
        return null;
      }
    },
    
    // Expose the reactive store instead of a function
    isPhysicsReady // This is now a store that components can subscribe to
  });
  
  onMount(() => {
    console.log(`PhysicsAwareSection "${sectionId}": Mounting...`);
    
    // Subscribe to the physics engine store
    const unsubscribe = physicsEngine.subscribe(engine => {
      physicsEngineInstance = engine;
      
      if (engine) {
        // Create our boundary mapper now that we have a physics engine
        boundaryMapper = new BoundaryMapper(engine);
        boundaryMapper.debug = debug;
        
        // Update the reactive store
        isPhysicsReady.set(true);
        
        console.log(`PhysicsAwareSection "${sectionId}": BoundaryMapper ready`);
      } else {
        boundaryMapper = null;
        isPhysicsReady.set(false);
      }
    });
    
    // Return cleanup function - Svelte will call this when component unmounts
    return () => {
      console.log(`PhysicsAwareSection "${sectionId}": Cleaning up...`);
      unsubscribe();
      
      // TODO: In later steps, we'll add boundary cleanup here
    };
  });
</script>

<!-- 
  This component is just a wrapper - it renders whatever you put inside it
  The magic happens through the context system
-->
<section class="physics-aware-section" data-section={sectionId}>
  <slot />
</section>

<style>
  .physics-aware-section {
    /* No special styling needed - this is just a logical wrapper */
    position: relative;
  }
</style>