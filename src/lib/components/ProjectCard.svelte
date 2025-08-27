<script>
  import { onMount, createEventDispatcher, getContext } from "svelte";

  // Props for the card
  export let title = "Project Title";
  export let description = "Project description goes here.";
  export let shape = "rectangle"; // "rectangle", "square", or "rotated"
  export let techStack = [];

  // Get access to physics registration functions from PhysicsAwareSection
  const physicsContext = getContext("physics");

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
  let registeredBoundary = null;
  let hasMounted = false;

  // Subscribe to the physics readiness store
  $: isReady = physicsContext?.isPhysicsReady;

  onMount(() => {
    hasMounted = true;
  });

  // Register card element as physics boundary
  $: if (hasMounted && cardElement && $isReady && !registeredBoundary) {
    console.log(
      `ProjectCard "${title}": Physics is ready, attempting boundary registration...`
    );

    registeredBoundary = physicsContext.registerBoundary(
      `project-card-${title.toLowerCase().replace(/\s+/g, "-")}`, // unique ID based on title
      cardElement, // the DOM element to map
      {
        restitution: 0.6, // moderately bouncy
        friction: 0.3, // low friction for smooth interactions
        label: `project-card-${title}`, // debug label
      }
    );

    if (registeredBoundary) {
      console.log(
        `ProjectCard "${title}": Successfully registered as physics boundary`
      );
    } else {
      console.warn(
        `ProjectCard "${title}": Failed to register physics boundary`
      );
    }
  }
</script>

<div
  bind:this={cardElement}
  class="project-card"
  class:square={shape === "square"}
  class:rectangle={shape === "rectangle"}
  class:rotated={shape === "rotated"}
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

  .rotated {
    aspect-ratio: 1 / 1;
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
