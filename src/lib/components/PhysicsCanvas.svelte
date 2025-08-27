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

  // Diagnostics: confirm module load
  console.log("PhysicsCanvas: module loaded");

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
  let scrollTimeout;

  onMount(() => {
    console.log("PhysicsCanvas: Starting initialization (onMount entered)...");

    // Disable canvas interaction during scroll to allow smooth scrolling
    //THIS WAS SUPPOSED TO HELP WITH DISTINGUISHING TOUCH TO SCROLL VS TOUCH TO GRAB BALL, BUT NOW IT CAUSES MASSIVE NORMAL BROWSING/BALL HANDLING SWITCH ISSUES, SO LEAVING IT IN CASE, BUT DO NOT USE UNLESS TOUCH TO SCROLL GETS LOUSY AGAIN

    // const handleScroll = () => {
    //   canvasPointerEvents.set("none");
    //   clearTimeout(scrollTimeout);
    //   scrollTimeout = setTimeout(() => {
    //     canvasPointerEvents.set("auto");
    //   }, 200);
    // };
    // window.addEventListener("wheel", handleScroll, { passive: true });

    // Step 1: Initialize CanvasManager first (handles sizing)
    canvasManager = new CanvasManager(canvasElement, {
      debug,
      footerSelector: "footer",
    });

    // Step 2: Start watching for canvas size changes
    canvasManager.startWatching();

    // Step 3: Initialize physics engine after canvas is properly sized
    // We need a small delay to ensure canvas has proper dimensions
    setTimeout(() => {
      initializePhysics();
    }, 100);

    // Cleanup function - Svelte will call this when component unmounts
    // UPDATED: Added drag manager cleanup in the correct dependency order
    return () => {
      console.log("PhysicsCanvas: Cleaning up...");

      // TouchHitDetection removed

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

      // Clean up scroll handler and timeout
      try {
        window.removeEventListener("wheel", handleScroll);
      } catch {}
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
      }
    };
  });

  /**
   * Initialize the physics engine after canvas is ready
   * This function orchestrates the initialization of all physics-related systems
   */
  function initializePhysics() {
    if (!canvasElement) {
      console.error(
        "PhysicsCanvas: Canvas element not available for physics initialization"
      );
      return;
    }

    // Check if canvas has proper dimensions
    if (canvasElement.width === 0 || canvasElement.height === 0) {
      console.warn("PhysicsCanvas: Canvas has no dimensions, retrying...");
      setTimeout(initializePhysics, 100);
      return;
    }

    console.log(
      `PhysicsCanvas: Initializing physics on ${canvasElement.width}x${canvasElement.height} canvas (full document height)`
    );

    try {
      // Create physics engine instance
      engine = new PhysicsEngine(canvasElement);
      engine.debugMode = debug; // Pass debug prop to engine

      // Initialize the physics world
      if (engine.init()) {
        console.log("PhysicsCanvas: Physics engine initialized successfully");

        // Start the physics simulation
        engine.start();

        // Update the physics store so other components can access it
        physicsEngine.set(engine);
        physicsEnabled.set(true);

        canvasWidth = canvasElement.width;
        canvasHeight = canvasElement.height;

        // Set up canvas resize handler for physics
        setupPhysicsResizeHandler();

        // Initialize interaction systems in dependency order
        // Drag manager first
        initializeDragManager();

        // Hover detection next
        initializeHoverDetection();
      } else {
        console.error("PhysicsCanvas: Failed to initialize physics engine");
      }
    } catch (error) {
      console.error(
        "PhysicsCanvas: Error during physics initialization:",
        error
      );
    }
  }

  /**
   * Initialize the hover detection service after physics engine is ready
   */

  function initializeHoverDetection() {
    console.log("PhysicsCanvas: initializeHoverDetection called");
    if (!engine) {
      console.warn(
        "PhysicsCanvas: Cannot initialize hover detection without physics engine"
      );
      return;
    }

    // Initialize hover detection (uniform behavior)
    console.log("PhysicsCanvas: Initializing hover detection");

    try {
      // Create the interaction store interface that our service needs
      const interactionInterface = {
        enableBallInteraction,
        enableNormalBrowsing,
      };

      // Create the hover detection service
      hoverDetection = new BallHoverDetection(engine, interactionInterface);

      // Start the hover detection system
      hoverDetection.start();

      console.log("PhysicsCanvas: Hover detection active");
    } catch (error) {
      console.error(
        "PhysicsCanvas: Failed to initialize hover detection:",
        error
      );
    }
  }

  // TouchHitDetection removed in favor of Matter.js touch handling fix in BallDragManager

  /**
   * Initialize the ball drag manager after physics engine is ready
   * NEW FUNCTION: This was missing from your current implementation
   */
  function initializeDragManager() {
    if (!engine || !canvasElement) {
      console.warn(
        "PhysicsCanvas: Cannot initialize drag manager without engine and canvas"
      );
      return;
    }

    try {
      // Create the drag manager with references to physics engine and canvas
      dragManager = new BallDragManager(engine, canvasElement);

      // No device detection: drag manager handles both mouse and touch fix internally

      // Start the drag manager service
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

  /**
   * Handle canvas size changes and update physics accordingly
   * This ensures all physics systems remain synchronized when the canvas resizes
   */
  function setupPhysicsResizeHandler() {
    if (!canvasManager || !engine) return;

    // Store original canvas update method
    const originalUpdate = canvasManager.updateCanvasSize.bind(canvasManager);

    // Override with physics-aware version
    canvasManager.updateCanvasSize = function () {
      const sizeChanged = originalUpdate();

      if (sizeChanged && engine) {
        console.log(
          "PhysicsCanvas: Canvas size changed, updating physics boundaries"
        );

        // Update physics boundaries
        engine.updateBoundaries();

        // NEW: Update our canvas dimension tracking for DrainHole
        canvasWidth = canvasElement.width;
        canvasHeight = canvasElement.height;

        console.log(
          `PhysicsCanvas: Canvas dimensions updated to ${canvasWidth}x${canvasHeight}`
        );
      }

      return sizeChanged;
    };
  }

  // Reactive statement - updates when enabled prop changes
  // This ensures the physics system can be dynamically enabled/disabled
  $: if (engine) {
    if (enabled) {
      console.log("PhysicsCanvas: Physics enabled");
      physicsEnabled.set(true);
    } else {
      console.log("PhysicsCanvas: Physics disabled");
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
  <GravityChute 
    {canvasWidth} 
    {canvasHeight}
  />
{#if enabled && canvasWidth > 0 && canvasHeight > 0}
  <DrainHole {canvasWidth} {canvasHeight} />
{/if}

<style>
  .physics-canvas {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-index-physics-canvas);

    /* Canvas covers the main element area */
    width: 100%;
    height: 100%;
    pointer-events: none; /* Let clicks pass through to underlying content */
    overflow: hidden;
  }

  .debug-mode {
    /* Semi-transparent background to visualize canvas bounds */
    background-color: rgba(255, 0, 0, 0.1);
    border: 2px dashed red;
  }

  :global(.drain-hole),
  :global(.gravity-chute) {
    position: absolute;
  }
</style>
