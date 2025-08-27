<script>
  import { onMount, getContext } from "svelte";

  const physicsContext = getContext("physics");

  let heroElement;
  let registeredBoundary = null;
  let registeredHeroBoundary = null;
  let hasMounted = false;

  // Subscribe to the physics readiness store
  $: isReady = physicsContext?.isPhysicsReady;

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
</script>

<section class="hero-section">
  <div class="hero-content" bind:this={heroElement}>
    <h1>HEY, I'M STEP,<br />I DO WEB STUFF</h1>
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

  @media (max-width: 991px) {
    .hero-content {
      width: 80%;
    }
  }
</style>
