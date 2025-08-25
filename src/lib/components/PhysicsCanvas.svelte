<script>
  import { onMount } from 'svelte';
  import { CanvasManager } from '@physics/CanvasManager.js';
  import { canvasPointerEvents } from '@stores/interaction.js';
  
  // Props for configuration
  export let debug = false;
  export let enabled = true;
  
  let canvasElement;
  let canvasManager;
  
  onMount(() => {
    // Initialize CanvasManager with our canvas element
    canvasManager = new CanvasManager(canvasElement, {
      debug,
      footerSelector: 'footer'
    });
    
    // Start watching for size changes
    canvasManager.startWatching();
    
    // Cleanup on component unmount
    return () => {
      if (canvasManager) {
        canvasManager.stopWatching();
      }
    };
  });
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
    z-index: var(
      --z-index-physics-canvas
    ); /* Behind header (z-index: 4) but above background */

    /* Ensure canvas doesn't interfere with page layout */
    width: 100vw;
    height: auto; /* Height is computed dynamically */
  }

  .debug-mode {
    /* Semi-transparent background to visualize canvas bounds */
    background-color: rgba(255, 0, 0, 0.253);
    border: 2px dashed red;
  }
</style>
