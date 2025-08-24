<script>
  import { onMount } from 'svelte';
  
  // For future physics integration
  export let registerBoundary = null;
  
  let ctaElement;
  let titleElement;
  let buttonElement;
  
  onMount(() => {
    console.log('CTA section mounted');
    
    // These elements will be registered as physics boundaries in later phases
    if (registerBoundary) {
      // Future physics registration code will go here
    }
  });
  
  function handleCtaClick() {
    // In the future, this could trigger a contact form or scroll to contact section
    console.log('CTA button clicked');
  }
</script>

<section id="cta" class="cta-section">
  <div bind:this={titleElement} class="section-title-container">
    <h2>Let's Work Together</h2>
  </div>
  
  <div bind:this={ctaElement} class="cta-container">
    <div class="cta-content">
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
    
    <!-- Pinball-inspired decorative elements -->
    <div class="pinball-bumper left-bumper"></div>
    <div class="pinball-bumper right-bumper"></div>
    <div class="pinball-path"></div>
  </div>
</section>

<style>
  .cta-section {
    width: 100%;
    padding: 5% 5%;
    position: relative;
  }
  
  .section-title-container {
    width: 70%;
    margin: 0 auto 5% auto;
    padding: 2% 0;
    text-align: center;
    border-bottom: 2px solid currentColor;
  }
  
  .cta-container {
    width: 90%;
    margin: 0 auto;
    aspect-ratio: 16 / 7;
    position: relative;
    background-color: lightgrey;
    border-radius: var(--radius-16px);
    overflow: hidden;
  }
  
  .cta-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 5%;
    z-index: 1;
  }
  
  h3 {
    margin-bottom: 3%;
  }
  
  p {
    max-width: 70%;
    margin-bottom: 5%;
  }
  
  .cta-button {
    padding: 1.5% 5%;
    border-radius: var(radius-2px);
    background: none;
    cursor: pointer;
    transition: transform 0.2s ease;
    &:hover {
      transform: scale(1.05);
    }
  }
  
  /* Pinball-inspired decorative elements */
  .pinball-bumper {
    position: absolute;
    width: 15%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: repeating-radial-gradient(
      circle,
      rgba(0,0,0,0.05),
      rgba(0,0,0,0.05) 10%,
      rgba(0,0,0,0.08) 10%,
      rgba(0,0,0,0.08) 20%
    );
    z-index: 0;
  }
  
  .left-bumper {
    bottom: 10%;
    left: 10%;
  }
  
  .right-bumper {
    top: 10%;
    right: 10%;
  }
  
  .pinball-path {
    position: absolute;
    width: 90%;
    height: 90%;
    top: 5%;
    left: 5%;
    border-radius: var(--radius-16px);
    border: 2px dashed rgba(0,0,0,0.1);
    pointer-events: none;
    z-index: 0;
  }
  
  /* Responsive adjustments */
  @media (max-width: 991px) {
    .section-title-container {
      width: 90%;
    }
    
    .cta-container {
      width: 100%;
      aspect-ratio: 3 / 2;
    }
    
    p {
      max-width: 90%;
    }
    
    .cta-button {
      padding: 3% 10%;
    }
  }
</style>