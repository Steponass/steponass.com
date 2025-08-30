<script>
  import { slide, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { onMount } from "svelte";

  export let projectData;
  export let onClose;

  const { title, description, techStack, sections } = projectData;

  function handleKeydown(event) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="modal-backdrop"
  transition:fade={{ duration: 200 }}
  on:click={onClose}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="modal-container"
    transition:slide={{ duration: 400, easing: quintOut, axis: "y" }}
    on:click|stopPropagation
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <button
      class="close-button"
      on:click={onClose}
      aria-label="Close modal"
      type="button">×</button
    >

    <div class="case-study-grid">
      <section class="section overview-section">
        <h1 id="modal-title">{title}</h1>
        <div class="overview-content">
          <p class="overview-description">{description}</p>
        </div>
      </section>

      <section class="section process-section">
        <h2>Process</h2>
        <div class="section-content">
          <p>{sections?.process || "Process details coming soon..."}</p>
        </div>
      </section>

      <section class="section tools-section">
        <h2>Tools</h2>
        <div class="section-content">
          {#if sections?.tools && Array.isArray(sections.tools)}
            <ul class="tools-list">
              {#each sections.tools as tool}
                <li>{tool}</li>
              {/each}
            </ul>
          {:else}
            <p>Tools information coming soon...</p>
          {/if}
        </div>
      </section>

      <section class="section challenges-section">
        <h2>Challenges</h2>
        <div class="section-content">
          <p>
            {sections?.challenges || "Challenges information coming soon..."}
          </p>
        </div>
      </section>

      <section class="section lessons-section">
        <h2>Lessons</h2>
        <div class="section-content">
          <p>{sections?.lessons || "Lessons learned coming soon..."}</p>
        </div>
      </section>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: var(--z-index-highest);
  }

  .modal-container {
    background: var(--clr-bg-raised);
    border-radius: var(--radius-8px);
    width: min(98%, 1920px);
    max-height: 95vh;
    overflow-y: auto;
    position: relative;
    padding: var(--space-24-32px);
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: var(--fs-h4);
    cursor: pointer;
    color: var(--clr-text-primary);
    z-index: 1;
  }

  .case-study-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto auto auto auto;
    gap: 2rem;
    grid-template-areas:
      "overview tools"
      "process process"
      "challenges challenges"
      "lessons lessons";
  }

.section-content {
  max-width: 75ch;
}

  .section {
    padding: var(--space-24-32px);
    min-height: 300px;
    background: var(--clr-bg);
    border-radius: var(--radius-8px);
    border: 1px solid var(--clr-stroke-weak);
  }

  .overview-section {
    grid-area: overview;
  }
  .process-section {
    grid-area: process;
  }
  .tools-section {
    grid-area: tools;
  }
  .challenges-section {
    grid-area: challenges;
  }
  .lessons-section {
    grid-area: lessons;
  }

h1 {
  font-size: var(--fs-h2);
}
h2 {
  font-size: var(--fs-h3);
}

  .tools-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  /* Responsive adjustment */
  @media (max-width: 768px) {
    .case-study-grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        "overview"
        "process"
        "tools"
        "challenges"
        "lessons";
    }
  }
</style>
