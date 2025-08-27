<script>
  import { onMount } from "svelte";
  import { CanvasManager } from "@physics/CanvasManager.js";
  import { PhysicsEngine } from "@physics/PhysicsEngine.js";
  import { BallHoverDetection } from "@lib/services/BallHoverDetection.js";
  import { BallDragManager } from "@lib/services/BallDragManager.js";
  import GravityChute from "./GravityChute.svelte";
  import DrainHole from "./DrainHole.svelte";

  import {
    canvasPointerEvents,
    enableBallInteraction,
    enableNormalBrowsing,
  } from "@stores/interaction.js";
  import { physicsEngine, physicsEnabled } from "@stores/physics.js";

  export let debug = false;
  export let enabled = true;

  let canvasElement;
  let canvasManager;
  let engine;
  let hoverDetection;
  let dragManager;
  let touchHitDetection;
  let canvasWidth = 0;
  let canvasHeight = 0;

  onMount(() => {
    // Step 1: Initialize CanvasManager first (handles sizing)
    canvasManager = new CanvasManager(canvasElement, {
      debug,
      footerSelector: "footer",
    });

    // Step 2: Start watching for canvas size changes
    canvasManager.startWatching();

    // Step 3: Initialize physics engine after canvas is properly sized
    setTimeout(() => {
      initializePhysics();
    }, 100);

    // Cleanup function - Svelte will call this when component unmounts
    return () => {
      // Clean up drag manager first (it depends on physics engine)
      if (dragManager) {
        dragManager.stop();
        dragManager = null;
      }

      // Clean up hover detection next (it also depends on physics engine)
      if (hoverDetection) {
        hoverDetection.stop();
        hoverDetection = null;
      }

      // Clean up physics engine after dependent systems are stopped
      if (engine) {
        engine.cleanup();
      }

      // Clean up canvas manager last (lowest level dependency)
      if (canvasManager) {
        canvasManager.stopWatching();
      }
    };
  });

  /*
   * Initialize physics engine after canvas is ready
   */
  function initializePhysics() {
    if (!canvasElement) {
      return;
    }

    // Check if canvas has proper dimensions
    if (canvasElement.width === 0 || canvasElement.height === 0) {
      setTimeout(initializePhysics, 100);
      return;
    }

    try {
      engine = new PhysicsEngine(canvasElement);
      engine.debugMode = debug; // Pass debug prop to engine

      // Initialize the physics world
      if (engine.init()) {
        engine.start();

        // Update the physics store so other components can access it
        physicsEngine.set(engine);
        physicsEnabled.set(true);

        canvasWidth = canvasElement.width;
        canvasHeight = canvasElement.height;

        setupPhysicsResizeHandler();

        // Initialize interaction systems in dependency order
        // Drag manager first
        initializeDragManager();

        // Hover detection next
        initializeHoverDetection();
      }
    } catch (error) {
      console.error(
        "PhysicsCanvas: Error during physics initialization:",
        error
      );
    }
  }

  /*
   * Initialize  hover detection service after physics engine is ready
   */

  function initializeHoverDetection() {
    if (!engine) {
      return;
    }

    try {
      // Create the interaction store interface that service needs
      const interactionInterface = {
        enableBallInteraction,
        enableNormalBrowsing,
      };

      hoverDetection = new BallHoverDetection(engine, interactionInterface);
      hoverDetection.start();
    } catch (error) {
      console.error(
        "PhysicsCanvas: Failed to initialize hover detection:",
        error
      );
    }
  }

  /*
   * Initialize the ball drag manager after physics engine is ready
   */
  function initializeDragManager() {
    if (!engine || !canvasElement) {
      return;
    }

    try {
      // Create drag manager with references to physics engine and canvas
      dragManager = new BallDragManager(engine, canvasElement);

      const success = dragManager.start();

      if (success) {
        console.log("PhysicsCanvas: Drag manager initialized successfully");
      } else {
        console.error("PhysicsCanvas: Drag manager failed to start");
      }
    } catch (error) {
      console.error("PhysicsCanvas: Error initializing drag manager:", error);
    }
  }

  /*
   * Handle canvas size changes and update physics accordingly
   */
  function setupPhysicsResizeHandler() {
    if (!canvasManager || !engine) return;

    const originalUpdate = canvasManager.updateCanvasSize.bind(canvasManager);

    // Override with physics-aware version
    canvasManager.updateCanvasSize = function () {
      const sizeChanged = originalUpdate();

      if (sizeChanged && engine) {
        engine.updateBoundaries();

        canvasWidth = canvasElement.width;
        canvasHeight = canvasElement.height;
      }

      return sizeChanged;
    };
  }

  // Reactive statement - updates when enabled prop changes
  // Ensures the physics system can be dynamically enabled/disabled
  $: if (engine) {
    if (enabled) {
      physicsEnabled.set(true);
    } else {
      engine.stop();
      physicsEnabled.set(false);
    }
  }
</script>

<canvas
  bind:this={canvasElement}
  class="physics-canvas"
  style:display={enabled ? "block" : "none"}
  style:pointer-events={$canvasPointerEvents}
>
</canvas>
<GravityChute {canvasWidth} />
{#if enabled && canvasWidth > 0 && canvasHeight > 0}
  <DrainHole {canvasHeight} />
{/if}

<style>
  .physics-canvas {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-index-physics-canvas);
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  :global(.drain-hole),
  :global(.gravity-chute) {
    position: absolute;
  }
</style>
