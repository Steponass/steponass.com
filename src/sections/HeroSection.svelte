<script>
  import { canReleaseBall, releaseBallFromQueue } from "@stores/ballQueue.js";
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
        shape: "text-rectangle",
      }}
    >
      Hey, I'm Step!
    </h1>
    <h1
      class="hero-heading hero-heading-bottom"
      use:physicsRegister={{
        restitution: 0.8,
        friction: 0.2,
        label: "hero-title",
        shape: "text-rectangle",
      }}
    >
      I do web stuff
    </h1>
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
    translate: 0 0;
    /* clip-path: inset(0 0 0% 0); */
    transition: all 0.5s ease;
    scale: 1;
    @starting-style {
      translate: 0 -100%;
      /* clip-path: inset(100% 0 0 0); */
      scale: 0;
    }
  }
  .hero-heading-bottom {
    transition: all 0.5s 1s ease;
    @starting-style {
      translate: 0 100%;
      /* clip-path: inset(0 0 100% 0); */
    }
  }


  .release-button {
    padding: var(--space-12px) var(--space-24px);
    margin-top: var(--space-24-32px);
    border-radius: var(--radius-4px);
    cursor: pointer;
    opacity: 1;
    translate: 0 0;
    clip-path: inset(0 0 0% 0);
    transition: all 0.4s 1.9s ease;
    @starting-style {
      opacity: 0;
      translate: -50% 0;
      clip-path: inset(0 0 0 100%);
    }
  }
</style>
