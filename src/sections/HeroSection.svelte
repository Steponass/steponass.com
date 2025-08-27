<script>
  import { onMount, getContext } from "svelte";

  import { canReleaseBall, releaseBallFromQueue } from '@stores/ballQueue.js';
  import { physicsEngine } from '@stores/physics.js';
  const physicsContext = getContext("physics");

  let heroElement;
  let registeredHeroBoundary = null;
  let hasMounted = false;

  // Subscribe to physics readiness and ball release availability
  $: isReady = physicsContext?.isPhysicsReady;
  $: canRelease = $canReleaseBall;
  $: engine = $physicsEngine;

  onMount(() => {
    hasMounted = true;
  });


  $: if (hasMounted && heroElement && $isReady && !registeredHeroBoundary) {
    console.log(
      "hero-section: Physics is ready, attempting boundary registration..."
    );

    registeredHeroBoundary = physicsContext.registerBoundary(
      "hero-section", // unique ID
      heroElement, // the DOM element to map
      {
        restitution: 0.6, // slightly less bouncy than launcher
        friction: 0.3, // slightly more friction
        label: "hero-section", // debug label
      }
    );

    if (registeredHeroBoundary) {
      console.log("hero-section: Successfully registered as physics boundary");
    } else {
      console.warn("hero-section: Failed to register physics boundary");
    }
  }

  /**
   * Handle ball release button click
   * Gets a ball from the queue and releases it from the chute
   */
   function handleReleaseBall() {
    if (!canRelease || !engine) {
      console.log('HeroSection: Cannot release - no balls queued or physics not ready');
      return;
    }

    console.log('HeroSection: Releasing ball from chute...');
    
    // Get ball data from queue
    const ballData = releaseBallFromQueue();
    
    if (ballData && engine.releaseBallFromChute) {
      // Call physics engine to create new physics ball at chute position
      engine.releaseBallFromChute(ballData);
    } else {
      console.warn('HeroSection: Failed to release ball - no data or release method unavailable');
    }
  }

</script>

<section class="hero-section">
  <div class="hero-content" bind:this={heroElement}>
    <h1>HEY, I'M STEP,<br />I DO WEB STUFF</h1>
    <button 
    class="release-button"
    class:ready={canRelease}
    class:disabled={!canRelease}
    on:click={handleReleaseBall}
    disabled={!canRelease}
  >
    {#if canRelease}
      I like to party
    {:else}
      Need more balls
    {/if}
  </button>
  </div>

</section>

<style>
  .hero-section {
    position: relative;
    width: 100%;
    /* Using aspect ratio instead of fixed height */
    aspect-ratio: 16 / 9;
    max-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid purple;
  }

  /* I really want to use min(), but I'm careful about
  the physics canvas calc. overhead. More flexible container width = 
  more boundary re-calculations */
  .hero-content {
    width: 50%;
    text-align: center;
    border: 2px solid green;
  }

  .release-button {
    padding: var(--space-12-16px) var(--space-24-32px);
    font-size: var(--fs-p);
    font-weight: 600;
    border: 3px solid #666666;
    border-radius: var(--radius-8px);
    color: #333333;
    cursor: pointer;
  }

  
  @media (max-width: 991px) {
    .hero-content {
      width: 80%;
    }
  }
</style>
