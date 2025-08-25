<script>
  import { onMount, createEventDispatcher } from "svelte";

  // Props for the card
  export let title = "Project Title";
  export let description = "Project description goes here.";
  export let shape = "rectangle"; // "rectangle" or "square"
  export let techStack = [];

  // For physics integration later
  export let registerBoundary = null;

  // For opening the modal
  const dispatch = createEventDispatcher();

  function openProjectDetails() {
    dispatch("openModal", {
      title,
      description,
      techStack,
      // We'll add more details like images when we implement the full modal
    });
  }

  let cardElement;

  onMount(() => {
    // Will register with physics engine in later phase
    if (cardElement && registerBoundary) {
      // Future physics boundary registration will go here
    }
  });
</script>

<div
  bind:this={cardElement}
  class="project-card"
  class:square={shape === "square"}
  class:rectangle={shape === "rectangle"}
  on:click={openProjectDetails}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === "Enter" && openProjectDetails()}
>
  <div class="card-content">
    <h3>{title}</h3>
    <p>{description}</p>
    <div class="tech-stack">
      {#each techStack as tech}
        <span class="tech-item">{tech}</span>
      {/each}
    </div>
  </div>
</div>

<style>
  .project-card {
    width: 100%;
    min-height: 440px;
    background: lightgrey;
    border-radius: var(--radius-8px);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: transform 0.2s ease-in-out;
  }

  .square {
    aspect-ratio: 1 / 1;
  }

  .rectangle {
    aspect-ratio: 16 / 9;
  }

  .card-content {
    padding: 5%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 2%;
    margin-top: 5%;
  }
  
  .tech-item {
    padding: 1% 3%;
    background-color: rgba(0,0,0,0.05);
  }
</style>
