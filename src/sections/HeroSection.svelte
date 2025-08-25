<script>
  import { onMount } from 'svelte';
  
  // For future physics integration
  export let registerBoundary = null;
  export let physicsEnabled = false;
  
  let heroElement;
  let launcherElement;
  
  onMount(() => {
    // Will be used for physics boundaries later
    console.log('Hero section mounted');
  });
</script>

<section bind:this={heroElement} class="hero-section">
  <div class="hero-content">
    <h1>HEY, I'M STEP,<br>I DO WEB STUFF</h1>
  </div>
  
  <div bind:this={launcherElement} class="launcher-container">
    <div class="launcher">
      <button class="launcher-button">
        LAUNCH BALL
      </button>
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