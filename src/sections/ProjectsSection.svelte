<script>
    import { projects } from "@lib/data/projectsData.js";
  import ProjectCard from "@/lib/components/ProjectCard.svelte";
  import ProjectModal from "@/sections/ProjectModal.svelte";
  import { physicsRegister } from "@lib/actions/physicsRegister.js";
  import { scrollAnimation } from "@lib/actions/scrollAnimation.js";

  let activeModal = null;

  function handleOpenModal(projectData) {
    activeModal = projectData;
  }

  function closeModal() {
    activeModal = null;
  }

</script>

<section class="projects-section" id="projects">
  <div
  class="section-title-container">
    <h2
    class="projects-title section-title"
    use:physicsRegister={{
      restitution: 0.8,
      friction: 0.2,
      label: "projects-title",
      shape: "text-rectangle",
    }}
    use:scrollAnimation>Projects</h2>
  </div>

  <div class="projects-container">
    {#each projects as project}
      <div class="project-cell" style="grid-area: {project.gridArea}">
        <ProjectCard
          title={project.title}
          description={project.description}
          projectData={project}
          onOpenModal={handleOpenModal}
        />
      </div>
    {/each}
  </div>

  {#if activeModal}
    <ProjectModal
      projectData={activeModal}
      onClose={closeModal}
    />
  {/if}
</section>

<style>
  .projects-section {
    padding-inline: 4%;
    box-sizing: border-box;
  }

  .section-title-container {
    margin-block: var(--space-32-48px);
  }

  .projects-title {
    width: fit-content;
    transition: all 0.4s 3s ease;
  }
  .projects-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: 1fr 1fr 1fr;
    gap: var(--space-64px);
    grid-template-areas:
      "item1 item1 item2"
      "item3 item5 item2"
      "item3 item4 item4";
  }

  .project-cell {
    display: flex;
  }

  /* Explicit grid area assignments */
  .project-cell[style*="item1"] {
    grid-area: item1;
  }
  .project-cell[style*="item2"] {
    grid-area: item2;
  }
  .project-cell[style*="item3"] {
    grid-area: item3;
  }
  .project-cell[style*="item4"] {
    grid-area: item4;
  }
  .project-cell[style*="item5"] {
    grid-area: item5;
  }


  /* Tablet breakpoint - 2 column layout */
  @media (max-width: 1600px) and (min-width: 769px) {
    .projects-container {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
      grid-template-areas:
        "item1 item2"
        "item1 item2"
        "item3 item3"
        "item4 item5"
        "item4 item5";
      /* Temporary margin for grid testing */
      margin-bottom: 100px;
    }
  }

  /* Mobile Layout - Single column with alternating alignment */
  @media (max-width: 768px) {
    .projects-container {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(5, auto);
      grid-template-areas:
        "item1"
        "item2"
        "item3"
        "item4"
        "item5";
      min-height: auto;
    }

    /* Ensure all project-card instances are perfect squares and consistent */
    .project-cell :global(.project-card) {
      width: 100%;
      aspect-ratio: 1 / 1;
      min-height: 0;
    }

    /* Ensure cards don't exceed container width */
    .project-cell > :global(*) {
      max-width: 90%;
    }
    
  }
</style>
