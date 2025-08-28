<script>
  import { canReleaseBall, releaseBallFromQueue } from '@stores/ballQueue.js';
  import { physicsRegister } from "@lib/actions/physicsRegister.js";
  import { physicsEngine } from "@/lib/stores/physics";

  // Subscribe to physics readiness and ball release availability
  $: canRelease = $canReleaseBall;
  $: engine = $physicsEngine;

   function handleReleaseBall() {
    if (!canRelease || !engine) {
      return;
    }

    const ballData = releaseBallFromQueue();
    
    if (ballData && engine.releaseBallFromChute) {
      engine.releaseBallFromChute(ballData);
    }
  }

</script>

<section class="hero-section">
  <div class="hero-content">
    <h1
    class="hero-heading"
    use:physicsRegister={{
      restitution: 0.8,
      friction: 0.2,
      label: "hero-title",
    }}>Hey, I'm Step!<br />I do web stuff</h1>
    <button 
    class="release-button"
    use:physicsRegister={{
      restitution: 0.8,
      friction: 0.2,
      label: "release-button",
    }}
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
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 156px;
    padding-bottom: var(--space-64-96px);
  }

  .hero-content {
    width: min(900px, 60%);
    text-align: center;
  }

  .hero-heading {
    width: fit-content;
    margin-inline: auto;
    /* background-color: var(--clr-primary); */
    border-radius: var(--radius-2px);
  }

  .release-button {
    padding: var(--space-12px) var(--space-24px);
    font-size: var(--fs-p);
    border-radius: var(--radius-4px);
    cursor: pointer;
  }
</style>
