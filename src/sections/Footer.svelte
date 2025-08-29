<script>
  import { physicsRegister } from "@lib/actions/physicsRegister.js";
</script>

<footer
  class="footer-section"
  id="contact"
  use:physicsRegister={{
    restitution: 0.8,
    friction: 0.2,
    label: "footer",
  }}
>
  <div class="about-column">
    <h3>About Me</h3>
    <p>
      I used to teach English language&#8230; now look at me, ma!<br />I've
      lived in the UK, Costa Rica, Spain, Finland, Portugal, Mexico. Seen some
      stuff! Currently based in Lithuania (or thereabouts).
    </p>
    <p>
      I enjoy <a
        href="https://www.goodreads.com/review/list/113462152-sanopets?ref=nav_mybooks&shelf=read"
        >reading</a
      >, single-player video games, and walking around random neighborhoods &mdash; the more random, the better!
    </p>
  </div>

  <div class="contact-column">
    <h3>Contact info</h3>
    <ul class="contact-list">
      <li>
        <div class="contact-icon">
          <svg
            class="icon email-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 256 256"
          >
            <path
              d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z"
            ></path>
          </svg>
          <svg
            class="icon email-icon-hover"
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 256 256"
          >
            <path
              d="M228.44,89.34l-96-64a8,8,0,0,0-8.88,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.44,89.34ZM96.72,152,40,192V111.53Zm16.37,8h29.82l56.63,40H56.46Zm46.19-8L216,111.53V192ZM128,41.61l81.91,54.61-67,47.78H113.11l-67-47.78Z"
            ></path>
          </svg>
        </div>
        <a href="mailto:steponas.dabuzinskas@gmail.com">Drop me a line</a>
      </li>
      <li>
        <div class="contact-icon">
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 96 96"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
            />
          </svg>
        </div>
        <a
          href="https://github.com/steponass"
          target="_blank"
          rel="noopener noreferrer">Here's my Gitty</a
        >
      </li>
      <li>
        <div class="contact-icon">
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 24 24"
          >
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </svg>
        </div>
        <a
          href="https://linkedin.com/in/steponasd"
          target="_blank"
          rel="noopener noreferrer">Network work</a
        >
      </li>
      <li>
        <div class="contact-icon">
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 509 511.514"
          >
            <path
              d="M434.762 74.334C387.553 26.81 323.245 0 256.236 0h-.768C115.795.001 2.121 113.696 2.121 253.456l.001.015a253.516 253.516 0 0033.942 126.671L0 511.514l134.373-35.269a253.416 253.416 0 00121.052 30.9h.003.053C395.472 507.145 509 393.616 509 253.626c0-67.225-26.742-131.727-74.252-179.237l.014-.055zM255.555 464.453c-37.753 0-74.861-10.22-107.293-29.479l-7.72-4.602-79.741 20.889 21.207-77.726-4.984-7.975c-21.147-33.606-32.415-72.584-32.415-112.308 0-116.371 94.372-210.743 210.741-210.743 56.011 0 109.758 22.307 149.277 61.98a210.93 210.93 0 0161.744 149.095c0 116.44-94.403 210.869-210.844 210.869h.028zm115.583-157.914c-6.363-3.202-37.474-18.472-43.243-20.593-5.769-2.121-10.01-3.202-14.315 3.203-4.305 6.404-16.373 20.593-20.063 24.855-3.69 4.263-7.401 4.815-13.679 1.612-6.278-3.202-26.786-9.883-50.899-31.472a192.748 192.748 0 01-35.411-43.867c-3.712-6.363-.404-9.777 2.82-12.873 3.224-3.096 6.363-7.381 9.48-11.092a41.58 41.58 0 006.357-10.597 11.678 11.678 0 00-.508-11.09c-1.718-3.18-14.444-34.357-19.534-47.06-5.09-12.703-10.37-10.603-14.272-10.901-3.902-.297-7.911-.19-12.089-.19a23.322 23.322 0 00-16.964 7.911c-5.707 6.298-22.1 21.673-22.1 52.849s22.671 61.249 25.852 65.532c3.182 4.284 44.663 68.227 108.288 95.649 15.099 6.489 26.891 10.392 36.053 13.403a87.504 87.504 0 0025.216 3.718c4.905 0 9.82-.416 14.65-1.237 12.174-1.782 37.453-15.291 42.776-30.073s5.303-27.57 3.711-30.093c-1.591-2.524-5.704-4.369-12.088-7.615l-.038.021z"
            />
          </svg>
        </div>
        <a
          href="https://wa.me/your-number"
          target="_blank"
          rel="noopener noreferrer">Buzz me, mellow</a
        >
      </li>
    </ul>
  </div>
</footer>

<style>
  .footer-section {
    display: flex;
    gap: 10%;
    padding-inline: 5%;
    padding-block: var(--space-32-48px);
    background-color: black;
    color: white;
  }

  h3 {
    justify-self: center;
    margin-bottom: 0.5em;
  }

  .about-column,
  .contact-column {
    flex: 1;
    max-width: 560px;
    margin-inline: auto;
  }

  a {
    text-decoration: underline;
    transition: all 0.3 ease-in-out;
    &:hover {
      color: var(--clr-primary);
    }
  }

  .contact-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-16-24px);
  }

  .contact-list li {
    display: flex;
    align-items: center;
    gap: var(--space-12-16px);
  }

  .contact-icon {
    position: relative;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    width: 100%;
    height: 100%;
    fill: white;
    transition: fill 0.3s ease;
  }

  .email-icon,
  .email-icon-hover {
    transform: scale(1.2);
  }

  .email-icon-hover {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .contact-list li:hover .icon {
    fill: var(--clr-primary);
  }

  .contact-list li:hover .email-icon-hover {
    opacity: 1;
  }

  .contact-list li:hover .email-icon {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  /* Responsive adjustments */
  @media (max-width: 991px) {
    .footer-section {
      flex-direction: column;
      gap: var(--space-32-48px);
    }
  }
</style>
