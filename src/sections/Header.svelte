<script>
  import ThemeToggle from "@/lib/components/ThemeToggle.svelte";
</script>

<header class="hanging-header">
  <div class="suspension-system">
    <div class="string left-string"></div>
    <div class="string right-string"></div>
  </div>

  <!-- The actual sign that acts as a physics boundary -->
  <nav class="sign-board">
    <ul class="nav-links">
      <li class="cv-item">
        <a href="/resume/CV - Steponas Dabuzinskas - Our Web Guy.pdf" download="Steponas-Dabuzinskas-Resume.pdf" target="_blank">
          CV
          <div class="cv-icon">
            <svg class="icon download-icon" xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 256 256">
              <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-42.34-61.66a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L120,164.69V120a8,8,0,0,1,16,0v44.69l10.34-10.35A8,8,0,0,1,157.66,154.34Z"></path>
            </svg>
          </div>
        </a>
      </li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#skills">Skills</a></li>
      <li><a href="#contact">Contact</a></li>

    </ul>
    <ThemeToggle />
  </nav>
</header>

<style>
  .hanging-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--z-index-high);
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
    padding-block: var(--space-12px);
    padding-inline: var(--space-16-24px);
    gap: var(--space-12-16px);
    pointer-events: auto;
    background: lightgrey;
    border-radius: var(--radius-8px);
    position: relative;
    overflow: hidden;
  }

  .nav-links {
    display: flex;
    list-style: none;
    align-items: center;
    gap: var(--space-16-24px);
  }

.nav-links a {
  font-size: var(--fs-h6);
}

  .cv-item a {
    display: flex;
    align-items: center;
    gap: var(--space-4px);
  }

  .cv-icon {
    position: relative;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cv-icon .icon {
    width: 100%;
    height: 100%;
    fill: currentColor;
    transition: all 0.3s ease;
  }

  .cv-item:hover .download-icon {
    fill: var(--clr-txt-strong);
    transform: translateY(-2px);
    transform: rotate(6deg);
    scale: 1.15;
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
