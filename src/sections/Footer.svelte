<script>
  import { physicsRegister } from "@lib/actions/physicsRegister.js";
</script>

<footer
  class="footer-section"
  use:physicsRegister={{
    restitution: 0.8,
    friction: 0.2,
    label: "footer",
  }}
>
  <div class="footer-content">
    <div class="about-column">
      <h3>About Me</h3>
      <p>
        I like reading, big butts, and finding a nice bench to sit on.
      </p>
    </div>

    <div class="contact-column">
      <h3>Get In Touch</h3>
      <ul class="contact-list">
        <li>
          <span class="contact-label">Email:</span>
          <a href="mailto:steponas.dabuzinskas@gmail.com">steponas.dabuzinskas@gmail.com</a>
        </li>
        <li>
          <span class="contact-label">GitHub:</span>
          <a
            href="https://github.com/steponass"
            target="_blank"
            rel="noopener noreferrer">github.com/step</a
          >
        </li>
        <li>
          <span class="contact-label">LinkedIn:</span>
          <a
            href="https://linkedin.com/in/step"
            target="_blank"
            rel="noopener noreferrer">linkedin.com/in/steponasd</a
          >
        </li>
      </ul>
    </div>
  </div>

</footer>

<style>
  .footer-section {
    padding: 5% 5% 2% 5%;
    background-color: var(--clr-txt-strong);
    color: white;
  }

  .footer-content {
    width: 80%;
    margin-inline: auto;
    display: flex;
    justify-content: space-between;
    gap: 10%;
    margin-bottom: 5%;
  }

  .about-column,
  .contact-column {
    flex: 1;
  }

  /* Responsive adjustments */
  @media (max-width: 991px) {
    .footer-content {
      flex-direction: column;
      gap: 2em;
    }
  }
</style>
