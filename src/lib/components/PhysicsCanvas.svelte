<script>
  import { onMount } from 'svelte';
  import { CanvasManager } from '@physics/CanvasManager.js';
  import { PhysicsEngine } from '@physics/PhysicsEngine.js';
  import { canvasPointerEvents } from '@stores/interaction.js';
  import { physicsEngine, physicsEnabled } from '@stores/physics.js';
  
  // Props for configuration
  export let debug = false;
  export let enabled = true;
  
  let canvasElement;
  let canvasManager;
  let engine; // Our physics engine instance
  
  onMount(() => {
    console.log('PhysicsCanvas: Starting initialization...');
    
    // Step 1: Initialize CanvasManager first (handles sizing)
    canvasManager = new CanvasManager(canvasElement, {
      debug,
      footerSelector: 'footer'
    });
    
    // Step 2: Start watching for canvas size changes
    canvasManager.startWatching();
    
    // Step 3: Initialize physics engine after canvas is properly sized
    // We need a small delay to ensure canvas has proper dimensions
    setTimeout(() => {
      initializePhysics();
    }, 100);
    
    // Cleanup function - Svelte will call this when component unmounts
    return () => {
      console.log('PhysicsCanvas: Cleaning up...');
      
      if (engine) {
        engine.cleanup();
      }
      
      if (canvasManager) {
        canvasManager.stopWatching();
      }
    };
  });
  
  /**
   * Initialize the physics engine after canvas is ready
   */
  function initializePhysics() {
    if (!canvasElement) {
      console.error('PhysicsCanvas: Canvas element not available for physics initialization');
      return;
    }
    
    // Check if canvas has proper dimensions
    if (canvasElement.width === 0 || canvasElement.height === 0) {
      console.warn('PhysicsCanvas: Canvas has no dimensions, retrying...');
      setTimeout(initializePhysics, 100);
      return;
    }
    
    console.log(`PhysicsCanvas: Initializing physics on ${canvasElement.width}x${canvasElement.height} canvas`);
    
    try {
      // Create physics engine instance
      engine = new PhysicsEngine(canvasElement);
      engine.debugMode = debug; // Pass debug prop to engine
      
      // Initialize the physics world
      if (engine.init()) {
        console.log('PhysicsCanvas: Physics engine initialized successfully');
        
        // Start the physics simulation
        engine.start();
        
        // Update the physics store so other components can access it
        physicsEngine.set(engine);
        physicsEnabled.set(true);
        
        // Set up canvas resize handler for physics
        setupPhysicsResizeHandler();
        
      } else {
        console.error('PhysicsCanvas: Failed to initialize physics engine');
      }
      
    } catch (error) {
      console.error('PhysicsCanvas: Error during physics initialization:', error);
    }
  }
  
  /**
   * Handle canvas size changes and update physics accordingly
   */
  function setupPhysicsResizeHandler() {
    if (!canvasManager || !engine) return;
    
    // Store original canvas update method
    const originalUpdate = canvasManager.updateCanvasSize.bind(canvasManager);
    
    // Override with physics-aware version
    canvasManager.updateCanvasSize = function() {
      const sizeChanged = originalUpdate();
      
      if (sizeChanged && engine) {
        console.log('PhysicsCanvas: Canvas size changed, updating physics boundaries');
        engine.updateBoundaries();
      }
      
      return sizeChanged;
    };
  }
  
  // Reactive statement - updates when enabled prop changes
  $: if (engine) {
    if (enabled) {
      console.log('PhysicsCanvas: Physics enabled');
      physicsEnabled.set(true);
    } else {
      console.log('PhysicsCanvas: Physics disabled');
      engine.stop();
      physicsEnabled.set(false);
    }
  }
</script>

<canvas
  bind:this={canvasElement}
  class="physics-canvas"
  class:debug-mode={debug}
  style:display={enabled ? "block" : "none"}
  style:pointer-events={$canvasPointerEvents}
>
</canvas>

<style>
  .physics-canvas {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-index-physics-canvas);

    /* Ensure canvas doesn't interfere with page layout */
    width: 100vw;
    height: auto; /* Height is computed dynamically */
  }

  .debug-mode {
    /* Semi-transparent background to visualize canvas bounds */
    background-color: rgba(255, 0, 0, 0.1);
    border: 2px dashed red;
  }
</style>