<script>
  import { onMount, getContext } from "svelte";

  const physicsContext = getContext("physics");

  let heroElement;
  let launcherElement;
  let registeredBoundary = null;
  let registeredHeroBoundary = null;
  let hasMounted = false;

  // Subscribe to the physics readiness store
  $: isReady = physicsContext?.isPhysicsReady;

  onMount(() => {
    hasMounted = true;
  });

  $: if (hasMounted && launcherElement && $isReady && !registeredBoundary) {
    console.log(
      "launcher-container: Physics is ready, attempting boundary registration..."
    );

    registeredBoundary = physicsContext.registerBoundary(
      "launcher-container", // unique ID
      launcherElement, // the DOM element to map
      {
        restitution: 0.8, // make it extra bouncy
        friction: 0.2, // low friction for fun bounces
        label: "launcher-container", // debug label
      }
    );

    if (registeredBoundary) {
      console.log(
        "launcher-container: Successfully registered as physics boundary"
      );
    } else {
      console.warn("launcher-container: Failed to register physics boundary");
    }
  }

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

  <div bind:this={launcherElement} class="launcher-container">
    <div class="launcher">
      <button class="launcher-button"> LAUNCH BALL </button>
    </div>
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

  .launcher-container {
    position: absolute;
    right: 0%;
    bottom: 2%;
    width: 10%;
    aspect-ratio: 1 / 2;
    border: 2px solid green;
  }

  .launcher {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
  }

  .launcher-button {
    width: 100%;
    padding: 5% 10%;
    border-radius: var(--radius-4px);
    cursor: pointer;
  }

  @media (max-width: 991px) {
    .hero-content {
      width: 80%;
    }
  }
</style>
