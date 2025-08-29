<script>
  import { physicsRegister } from "@lib/actions/physicsRegister.js";
  import { scrollAnimation } from "@lib/actions/scrollAnimation.js";

  function handleCtaClick() {
    console.log("CTA button clicked");
  }
</script>

<section id="cta" class="cta-section">
  <div class="section-title-container">
    <h2 class="cta-title section-title"
    use:physicsRegister={{
      restitution: 1,
      friction: 0.2,
      label: "cta-title",
      shape: "text-rectangle",
    }}
    use:scrollAnimation>Interested?</h2>
  </div>

  <div class="cta-container">
    <h2
    class="cta-heading"
    use:physicsRegister={{
      restitution: 1,
      friction: 0.2,
      label: "hero-title",
      shape: "text-rectangle",
      boundaryType: "reactive",
    }}>Let's connect!</h2>

    <!-- <button
      class="cta-button"
      use:physicsRegister={{
        restitution: 0.8,
        friction: 0.2,
        label: "cta-button",
      }}
      on:click={handleCtaClick}
    >
      Get In Touch
    </button> -->
  </div>
</section>

<style>
  .cta-section {
    width: 100%;
    /* aspect-ratio: 3/1; */
    padding-block: var(--space-64-96px);
    padding-inline: 5%;
  }

  .section-title-container {
    margin-block: var(--space-32-48px);
  }

  .cta-title {
    width: fit-content;
  }

  .cta-heading {
    width: fit-content;
    margin-inline: auto;
    margin-block: var(--space-64-96px);
  }

  /* .cta-button {
    padding: 1.5% 5%;
    border-radius: var(radius-2px);
    background: none;
    cursor: pointer;
    transition: transform 0.2s ease;
  } */
</style>
