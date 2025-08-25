<script>
  import { onMount, getContext } from "svelte";


  const physicsContext = getContext("physics");

  let ctaElement;
  let titleElement;
  let registeredTitleBoundary = null;
  let registeredBoundary = null;
  let hasMounted = false;

  $: isReady = physicsContext?.isPhysicsReady;

  onMount(() => {
    hasMounted = true;
    console.log("CTA section mounted");
  });

    // Register title element as physics boundary
    $: if (hasMounted && titleElement && $isReady && !registeredTitleBoundary) {
    console.log(
      "CTASection: Physics is ready, attempting title boundary registration..."
    );

    registeredTitleBoundary = physicsContext.registerBoundary(
      "CTA-title", // unique ID
      titleElement, // the DOM element to map
      {
        restitution: 0.7, // moderately bouncy
        friction: 0.4, // moderate friction
        label: "CTA-title", // debug label
      }
    );

    if (registeredTitleBoundary) {
      console.log(
        "CTASection: Title successfully registered as physics boundary"
      );
    } else {
      console.warn(
        "CTASection: Failed to register title physics boundary"
      );
    }
  }
  
    // Register CTA DIV element as physics boundary
    $: if (hasMounted && ctaElement && $isReady && !registeredBoundary) {
    console.log(
      "CTAelement: Physics is ready, attempting title boundary registration..."
    );

    registeredBoundary = physicsContext.registerBoundary(
      "CTA-element", // unique ID
      ctaElement, // the DOM element to map
      {
        restitution: 0.7, // moderately bouncy
        friction: 0.4, // moderate friction
        label: "CTA-element", // debug label
      }
    );

    if (registeredBoundary) {
      console.log(
        "CTAelement: element successfully registered as physics boundary"
      );
    } else {
      console.warn(
        "CTAelement: Failed to register title physics boundary"
      );
    }
  }

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
