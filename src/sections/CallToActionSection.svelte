<script>
  import { onMount } from "svelte";

  // For future physics integration
  export let registerBoundary = null;

  let ctaElement;
  let titleElement;
  let buttonElement;

  onMount(() => {
    console.log("CTA section mounted");

    // These elements will be registered as physics boundaries in later phases
    if (registerBoundary) {
      // Future physics registration code will go here
    }
  });

  function handleCtaClick() {
    // In the future, this could trigger a contact form or scroll to contact section
    console.log("CTA button clicked");
  }
</script>

<section id="cta" class="cta-section">
  <div bind:this={titleElement} class="section-title-container">
    <h2>Aroused?</h2>
  </div>

  <div bind:this={ctaElement} class="cta-container">
    <h3>Let's do it to it</h3>
    <p>Buzz me, mellow.</p>

    <button
      bind:this={buttonElement}
      class="cta-button"
      on:click={handleCtaClick}
    >
      Get In Touch
    </button>
  </div>
</section>

<style>
  .cta-section {
    width: 100%;
    padding-inline: 5%;
    position: relative;
    border: 2px solid navy;
    padding-bottom: var(--space-64-96px);
  }

  .section-title-container {
    width: min(70%, 320px);
    padding-block: var(--space-8-12px);
    border: 1px solid chocolate;
  }

  .cta-container {
    width: 50%;
    margin: 0 auto;
    aspect-ratio: 16 / 9;
    position: relative;
    background-color: lightgrey;
    border-radius: var(--radius-16px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 5%;
  }


  .cta-button {
    padding: 1.5% 5%;
    border-radius: var(radius-2px);
    background: none;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  @media (max-width: 991px) {
    .cta-container {
      width: 80%;
      aspect-ratio: 3 / 2;
    }
  }
</style>
