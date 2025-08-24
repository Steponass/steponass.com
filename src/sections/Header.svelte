<script>
  import { onMount } from 'svelte';
  
  // We'll use these props later when integrating with physics
  export let registerBoundary = null; // Function from PhysicsAwareSection
  export let physicsEnabled = false;
  
  let headerElement;
  let signElement;
  
  onMount(() => {
    // This is where we'll register the sign (not the strings) as a physics boundary
    // For now, just logging to show the concept
    if (signElement) {
      const rect = signElement.getBoundingClientRect();
      console.log('Sign boundary:', {
        element: signElement,
        bounds: rect,
        isPhysicsBody: true
      });
    }
    
    // The header element includes strings - not a physics body
    if (headerElement) {
      const rect = headerElement.getBoundingClientRect();
      console.log('Full header area (including strings):', {
        element: headerElement,
        bounds: rect,
        isPhysicsBody: false
      });
    }
  });
</script>

<header bind:this={headerElement} class="hanging-header">
  <div class="suspension-system">
    <div class="string left-string"></div>
    <div class="string right-string"></div>
  </div>
  
  <!-- The actual sign that acts as a physics boundary -->
  <nav bind:this={signElement} class="sign-board">
      <ul class="nav-links">
        <li><a href="#projects">Projects</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="#resume">Resume</a></li>
      </ul>
  </nav>
</header>

<style>
  .hanging-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--z-index-highest);
    /* The header container extends from viewport top */
    height: 120px; /* Space for strings + sign */
    pointer-events: none; /* Let clicks pass through empty space */
  }
  
  .suspension-system {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: min(75%, 320px);
    height: 40px; /* Height of the string area */
    pointer-events: none; /* Strings don't block interactions */
  }
  
  .string {
    position: absolute;
    top: 0;
    width: var(--space-4px);
    height: var(--space-32px);
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3),
      rgba(0, 0, 0, 0.6)
    );
    transform-origin: top center;
  }
  
  .left-string {
    left: 15%;
  }
  
  .right-string {
    right: 15%;
  }
  
  .sign-board {
    position: absolute;
    top: var(--space-24px); /* Hangs below the strings */
    left: 50%;
    transform: translateX(-50%);
    width: fit-content;
    display: flex;
    justify-content: center;
    padding-block: var(--space-12-16px);
    padding-inline: var(--space-16-24px);
    pointer-events: auto;
    background: lightgrey;
    border-radius: var(--radius-8px);
    position: relative;
    overflow: hidden;
  }
  
  .nav-links {
    display: flex;
    list-style: none;
    gap: var(--space-16-24px);
  }
  
  /* Disabling until we have physics set up 
  as there are notes that it might clash with matter.js */

  /* Subtle swing animation on the entire sign */
  /* @media (prefers-reduced-motion: no-preference) {
    .sign-board {
      animation: gentle-swing 14s ease-in-out infinite;
    }
  } */


  /* @keyframes gentle-swing {
    0%, 100% { transform: translateX(-50%) rotate(0deg); }
    25% { transform: translateX(-50%) rotate(0.25deg); }
    75% { transform: translateX(-50%) rotate(-0.25deg); }
  } */
  
</style>