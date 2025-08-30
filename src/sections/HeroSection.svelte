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
        Need more balls!
      {/if}
    </button>
</section>

<style>
  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    justify-content: center;
    padding-top: 156px;
    padding-bottom: var(--space-64-96px);
  }

  .hero-heading {
    padding-block: var(--space-8-12px);
    translate: 0 0;
    transition: all 0.5s ease;
    scale: 1;
    text-shadow: var(--text-shadow-1);
    @starting-style {
      translate: 0 -100%;
      scale: 0;
    }
  }
  .hero-heading-bottom {
    transition: all 0.5s 1s ease;
    @starting-style {
      translate: 0 100%;
    }
  }

  .release-button {
    padding: var(--space-12px) var(--space-24px);
    margin-top: var(--space-24-32px);
    border-radius: var(--radius-4px);
    background-color: var(--clr-primary);
    border: 1px solid var(--clr-stroke-strong);
    box-shadow: var(--shadow-elevation-2);
    cursor: pointer;
    opacity: 1;
    translate: 0 0;
    clip-path: inset(0 0 -10% 0);
    transition: all 0.4s 1.9s ease;
    &:disabled {
    /*--clr-ball-dragged, used only as # in physicsEngine */
      color: #CC2426;
       }
    @starting-style {
      opacity: 0;
      translate: -50% 0;
      clip-path: inset(0 0 0 100%);
    }
  }

  @media (max-width: 568px) {
    .hero-heading {
      max-width: 6ch;
    }
    .hero-heading-bottom {
      max-width: 7ch;
    }
  }
</style>
