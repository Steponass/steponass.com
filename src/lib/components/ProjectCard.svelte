<script>
  import { physicsRegister } from "@lib/actions/physicsRegister.js";
  import { BLUR_SHADOW_REACTION_CONFIG } from "@lib/physics/BoundaryMapper";

  export let title = "Project Title";
  export let description = "Project description goes here.";
  export let shape = "rectangle";
  export let projectData = null;
  export let onOpenModal = null;

  function handleCardClick() {
    if (onOpenModal && projectData) {
      onOpenModal(projectData);
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
  <div class="project-card-content">
    <div class="project-card-text">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <div class="project-card-illustration">
        <img class="placeholder" alt="pipi">
    </div>
  </div>
</div>

<style>
  .project-card {
    width: 100%;
    border-radius: var(--radius-8px);
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    box-shadow: var(--shadow-elevation-2);
    background-color: var(--clr-bg-raised);
    border: 1px solid var(--clr-stroke-strong);
    container-type: inline-size;
  }

  .rotated .project-card-content {
    transform: rotate(-45deg);
    text-align: center;
  }

  .project-card-content {
    padding: var(--space-16-24px);
    width: 100%;
    height: 100%;
    display: grid;
    justify-items: center;
    align-items: center;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    gap: var(--space-12-16px);
  }

  /* When card is narrow (<960px), use vertical layout */
  @container (max-width: 959px) {
    .project-card-content {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    justify-items: center;
    align-items: center;
    }
  }

  .project-card-content p {
    margin-top: var(--space-16-24px);
    font-size: var(--fs-h6);
  }

  .project-card-illustration {
    min-width: 200px;
    min-height: 200px;
    background-color: var(--clr-stroke-weak);
  }
</style>