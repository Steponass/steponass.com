<script>
  import { onMount } from 'svelte';
  
  let footerElement;
  
  // Note: Footer typically won't be part of the physics simulation
  // as mentioned in the architecture document, it sits below the canvas
  
  onMount(() => {
    console.log('Footer section mounted');
  });
</script>

<footer bind:this={footerElement} id="contact" class="footer-section">
  <div class="footer-content">
    <div class="about-column">
      <h3>About Me</h3>
      <p>I'm Step, I like reading, big butts, and finding a nice bench to sit on.</p>
    </div>
    
    <div class="contact-column">
      <h3>Get In Touch</h3>
      <ul class="contact-list">
        <li>
          <span class="contact-label">Email:</span>
          <a href="mailto:hello@step.dev">hello@step.dev</a>
        </li>
        <li>
          <span class="contact-label">GitHub:</span>
          <a href="https://github.com/step" target="_blank" rel="noopener noreferrer">github.com/step</a>
        </li>
        <li>
          <span class="contact-label">LinkedIn:</span>
          <a href="https://linkedin.com/in/step" target="_blank" rel="noopener noreferrer">linkedin.com/in/step</a>
        </li>
      </ul>
    </div>
  </div>
  
  <div class="copyright">
    <p>&copy; {new Date().getFullYear()} Step. All rights reserved (I wish).</p>
  </div>
</footer>

<style>
  .footer-section {
    width: 100%;
    padding: 5% 5% 2% 5%;
    background-color: var(--clr-text-strong);
    color: white;
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    gap: 10%;
    margin-bottom: 5%;
  }
  
  .about-column, .contact-column {
    flex: 1;
  }
  
  h3 {
    margin-bottom: 5%;
  }
  
  .contact-list {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  
  .contact-label {
    font-weight: bold;
    margin-right: 0.5em;
  }
  
  .contact-list a {
    text-decoration: underline;
    transition: opacity 0.2s ease;
  }
  
  .contact-list a:hover {
    opacity: 0.8;
  }
  
  .copyright {
    text-align: center;
    font-size: smaller;
  }
  
  /* Responsive adjustments */
  @media (max-width: 991px) {
    .footer-content {
      flex-direction: column;
      gap: 2em;
    }
  }
</style>