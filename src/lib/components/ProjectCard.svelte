<script>
  import { physicsRegister } from "@lib/actions/physicsRegister.js";
  import { BLUR_SHADOW_REACTION_CONFIG } from "@lib/physics/BoundaryMapper";

  export let title = "Project Title";
  export let description = "Project description goes here.";
  export let shape = "rectangle";
  export let techStack = [];
  export let onOpenModal = null;

  function handleCardClick() {
    if (onOpenModal) {
      onOpenModal({
        title,
        description,
        techStack,
      });
    }
  }

</script>

<div
  class="project-card"
  class:rotated={shape === "rotated"}
  use:physicsRegister={{
    restitution: 0.8,
    friction: 0.1,
    boundaryType: "reactive",
    reactionConfig: BLUR_SHADOW_REACTION_CONFIG,
    label: "project-card",
  }}
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