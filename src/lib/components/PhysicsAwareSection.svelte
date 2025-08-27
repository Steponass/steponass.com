<script>
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";
  import { BoundaryMapper } from "@physics/BoundaryMapper.js";
  import { physicsEngine } from "@stores/physics.js";

  export let sectionId = "physics-section";
  export let debug = false;

  let boundaryMapper = null;
  let physicsEngineInstance = null;

  const isPhysicsReady = writable(false);

  // Svelte's setContext makes these functions available to ALL child components
  // Children can access these using getContext('physics')
  setContext("physics", {
    registerBoundary: (id, element, options = {}) => {
      if (boundaryMapper) {
        return boundaryMapper.registerBoundary(id, element, options);
      } else {
        return null;
      }
    },

    // Expose the reactive store instead of a function
    isPhysicsReady, // This is now a store that components can subscribe to
  });

  onMount(() => {
    const unsubscribe = physicsEngine.subscribe((engine) => {
      physicsEngineInstance = engine;

      if (engine) {
        boundaryMapper = new BoundaryMapper(engine);
        boundaryMapper.debug = debug;

        isPhysicsReady.set(true);
      } else {
        boundaryMapper = null;
        isPhysicsReady.set(false);
      }
    });

    return () => {
      unsubscribe();

      // TODO: Maybe add boundary cleanup here?
    };
  });
</script>

<section class="physics-aware-section" data-section={sectionId}>
  <slot />
</section>
