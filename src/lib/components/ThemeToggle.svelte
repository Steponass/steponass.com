<script>
  import { themePreference, resolvedTheme, Theme } from "@stores/theme.js";

  function handleToggleClick() {
    themePreference.toggle();
  }

  function getAriaLabel(currentTheme) {
    return currentTheme === Theme.DARK
      ? "Switch to light mode"
      : "Switch to dark mode";
  }
</script>

<button
  class="theme-toggle"
  on:click={handleToggleClick}
  aria-label={getAriaLabel($resolvedTheme)}
  title={getAriaLabel($resolvedTheme)}
>
  <span class="toggle-icon">
    <svg
      width="32"
      height="32"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      class="icon sun-icon"
      class:visible={$resolvedTheme === Theme.DARK}
    >
      <path
        d="M32.1286 15.1843C22.8029 15.1843 15.278 22.6936 15.278 32C15.278 41.3064 22.8029 48.8157 32.1286 48.8157C41.4544 48.8157 48.9793 41.3064 48.9793 32C48.9793 22.6936 41.4544 15.1843 32.1286 15.1843ZM35.5373 4.40166C35.5373 2.54037 33.9938 1 32.1286 1C30.2635 1 28.7199 2.54037 28.7199 4.40166V11.911H35.5373V4.40166ZM55.2178 15.6977C56.5685 14.3499 56.5685 12.1677 55.2178 10.8841C53.8672 9.53623 51.6805 9.53623 50.3942 10.8841L45.1203 16.147L49.944 20.9607L55.2178 15.6977ZM14.249 21.0248L19.0726 16.2112L13.7988 10.9482C12.4481 9.60041 10.2614 9.60041 8.9751 10.9482C7.6888 12.2961 7.62448 14.4783 8.9751 15.7619L14.249 21.0248ZM28.6556 59.5983C28.6556 61.4596 30.1992 63 32.0643 63C33.9295 63 35.473 61.4596 35.473 59.5983V52.089H28.6556V59.5983ZM8.9751 48.3023C7.62448 49.6501 7.62448 51.8323 8.9751 53.1159C10.3257 54.3996 12.5124 54.4638 13.7988 53.1159L19.0726 47.853L14.249 43.0393L8.9751 48.3023ZM49.8797 42.9752L45.056 47.7888L50.3299 53.0518C51.6805 54.3996 53.8672 54.3996 55.1535 53.0518C56.5042 51.7039 56.5042 49.5217 55.1535 48.2381L49.8797 42.9752ZM11.9336 28.5983H4.40871C2.54357 28.5983 1 30.1387 1 32C1 33.8613 2.54357 35.4017 4.40871 35.4017H11.9336V28.5983ZM59.5913 28.5983H52.0664V35.4017H59.5913C61.4564 35.4017 63 33.8613 63 32C63 30.1387 61.4564 28.5983 59.5913 28.5983Z"
        fill="currentColor"
      />
    </svg>

    <!-- Moon icon - visible in light mode -->
    <svg
      width="32"
      height="32"
      viewBox="0 0 57 59"
      xmlns="http://www.w3.org/2000/svg"
      class="icon moon-icon"
      class:visible={$resolvedTheme === Theme.LIGHT}
    >
      <path
        d="M54.5855 41.9407C49.2115 43.3025 43.5367 42.9059 38.4091 40.8099C33.2814 38.714 28.9763 35.0313 26.1367 30.3121C23.2972 25.5929 22.0758 20.0904 22.655 14.627C23.2342 9.16352 25.5828 4.03234 29.3501 0C26.9001 0.018133 24.4623 0.342306 22.0943 0.964823C14.4577 2.9912 7.94682 7.93879 3.99378 14.7192C0.040801 21.4995 -1.0304 29.5573 1.01581 37.1199C3.06202 44.6824 8.05806 51.1302 14.9048 55.0449C21.7515 58.9596 29.8882 60.0204 37.5248 57.994C41.8499 56.8422 45.8525 54.7279 49.2274 51.8122C52.6024 48.8965 55.2607 45.2564 57 41.1691C56.2089 41.4667 55.403 41.7243 54.5855 41.9407Z"
        fill="currentColor"
      />
    </svg>
  </span>
</button>

<style>
  .theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    border-radius: var(--radius-4px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.4s ease;
    min-width: var(--space-32px);
    min-height: var(--space-32px);
    color: var(--clr-txt-strong);
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    &:focus-visible {
      outline: 2px solid var(--clr-primary);
    } 
  }

  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .icon {
    width: 32px;
    height: 32px;
    padding: var(--space-8px);
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transform: rotate(-180deg) scale(0.3);
    transition: all 0.3s ease-in-out;
  }

  .icon.visible {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
</style>