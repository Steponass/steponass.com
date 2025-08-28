<script>
  import { physicsRegister } from "@lib/actions/physicsRegister.js";

  function handleCtaClick() {
    console.log("CTA button clicked");
  }
</script>

<section id="cta" class="cta-section">
  <div class="section-title-container">
    <h2 class="cta-title"
    use:physicsRegister={{
      restitution: 0.8,
      friction: 0.2,
      label: "cta-title",
    }}>Aroused?</h2>
  </div>

  <div class="cta-container">
    <h2
    class="cta-heading"
    use:physicsRegister={{
      restitution: 0.8,
      friction: 0.2,
      label: "hero-title",
    }}>Let's do it to it</h2>
    <p>Buzz me, mellow.</p>

    <button
      class="cta-button"
      use:physicsRegister={{
        restitution: 0.8,
        friction: 0.2,
        label: "cta-button",
      }}
      on:click={handleCtaClick}
    >
      Get In Touch
    </button>
  </div>
</section>

<style>
  .cta-section {
    width: 100%;
    padding-block: var(--space-64-96px);
    padding-inline: 5%;
  }

  .section-title-container {
    margin-block: var(--space-32-48px);
  }

  .cta-title {
    width: fit-content;
  }

  .cta-container {
    width: min(900px, 60%);
    margin: 0 auto;
    border-radius: var(--radius-8px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2%;
    gap: var(--space-8-12px);
  }

  .cta-button {
    padding: 1.5% 5%;
    border-radius: var(radius-2px);
    background: none;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
</style>
