<script>
  import { onMount, getContext } from "svelte";

  export let title = "Project Title";
  export let description = "Project description goes here.";
  export let shape = "rectangle";
  export let techStack = [];
  export let onOpenModal = null;

  const physicsContext = getContext("physics");

  function handleCardClick() {
    if (onOpenModal) {
      onOpenModal({
        title,
        description,
        techStack,
      });
    }
  }

  let cardElement;
  let registeredBoundary = null;
  let hasMounted = false;

  $: isReady = physicsContext?.isPhysicsReady;

  onMount(() => {
    hasMounted = true;
  });

  // Register card element as physics boundary
  $: if (hasMounted && cardElement && $isReady && !registeredBoundary) {

    registeredBoundary = physicsContext.registerBoundary(
      `project-card-${title.toLowerCase().replace(/\s+/g, "-")}`,
      cardElement, // the DOM element to map
      {
        restitution: 0.8, // bouncy
        friction: 0.2, // low friction
        label: `project-card-${title}`, // debug label
      }
    );
  }
</script>

<div
  bind:this={cardElement}
  class="project-card"
  class:square={shape === "square"}
  class:rectangle={shape === "rectangle"}
  class:rotated={shape === "rotated"}
  on:click={handleCardClick}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === "Enter" && handleCardClick()}
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

  .rotated .card-content {
    transform: rotate(-45deg);
    text-align: center;
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
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>
