<script>
  import { onMount, getContext } from "svelte";
  import ProjectCard from "@components/ProjectCard.svelte";

  // Get access to physics registration functions from PhysicsAwareSection
  const physicsContext = getContext("physics");

  const projects = [
    {
      id: 1,
      title: "Co~Learn",
      description: "Full-stack project: a virtual classroom",
      techStack: ["React", "Next", "Supabase", "LiveKit"],
      gridArea: "item1",
    },
    {
      id: 2,
      title: "Co-Narrate",
      description:
        "Storytelling tool that integrates Web Speech Recognition API",
      techStack: ["React", "Tailwind"],
      gridArea: "item2",
    },
    {
      id: 3,
      title: "RushIQ",
      description: "A corporate website with an AI-enabled chatbot.",
      techStack: ["React", "Tailwind", "Botpress"],
      gridArea: "item3",
    },
    {
      id: 4,
      title: "Monochrome & Framing",
      description:
        "2 tailored sites, my early work. Did design & dev + deployment + maintenance",
      techStack: ["JS", "React", "EmailJS", "GSAP"],
      gridArea: "item4",
    },
    {
      id: 5,
      title: "Mystify Me",
      description:
        "A personal project where I scratched my creative itch while deepening knowledge of React + global state mgmt",
      techStack: ["React", "Zustand", "GSAP"],
      gridArea: "item5",
    },
    {
      id: 6,
      title: "Mystify Me",
      description:
        "A personal project where I scratched my creative itch while deepening knowledge of React + global state mgmt",
      techStack: ["React", "Zustand", "GSAP"],
      gridArea: "item6",
    },
    {
      id: 7,
      title: "Our Project?",
      description: "…This could be something beautiful!",
      techStack: ["Framework", "Library", "Database"],
      gridArea: "item7",
    },
  ];

  let sectionElement;
  let titleElement;
  let activeModal = null;
  let registeredTitleBoundary = null;
  let hasMounted = false;

  // Subscribe to the physics readiness store
  $: isReady = physicsContext?.isPhysicsReady;

  function handleOpenModal(event) {
    activeModal = event.detail;
    console.log("Modal opened for project:", activeModal.title);
    // In a future implementation, we would show the actual modal component here
  }

  function closeModal() {
    activeModal = null;
  }

  onMount(() => {
    hasMounted = true;
    console.log("Projects section mounted");
  });

  // Register title element as physics boundary
  $: if (hasMounted && titleElement && $isReady && !registeredTitleBoundary) {
    console.log(
      "ProjectsSection: Physics is ready, attempting title boundary registration..."
    );

    registeredTitleBoundary = physicsContext.registerBoundary(
      "projects-title", // unique ID
      titleElement, // the DOM element to map
      {
        restitution: 0.7, // moderately bouncy
        friction: 0.4, // moderate friction
        label: "projects-title", // debug label
      }
    );

    if (registeredTitleBoundary) {
      console.log(
        "ProjectsSection: Title successfully registered as physics boundary"
      );
    } else {
      console.warn(
        "ProjectsSection: Failed to register title physics boundary"
      );
    }
  }
</script>

<section bind:this={sectionElement} id="projects" class="projects-section">
  <div bind:this={titleElement} class="section-title-container">
    <h2>Projects</h2>
  </div>

  <div class="projects-container">
    {#each projects as project}
      <div class="project-cell" style="grid-area: {project.gridArea}">
        <ProjectCard
          title={project.title}
          description={project.description}
          techStack={project.techStack}
          shape={project.gridArea === "item7" ? "rotated" : "default"}
          on:openModal={handleOpenModal}
        />
      </div>
    {/each}
  </div>

  <!-- Placeholder for modal component -->
  {#if activeModal}
    <div class="modal-placeholder">
      <!-- We'll replace this with a proper modal component later -->
      <div class="modal-content">
        <button on:click={closeModal}>Close</button>
        <h3>{activeModal.title}</h3>
        <p>{activeModal.description}</p>
        <div class="tech-list">
          {#each activeModal.techStack as tech}
            <span>{tech}</span>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  .projects-section {
    width: 100%;
    padding-inline: 5%;
    border: 2px solid navy;
    box-sizing: border-box;
  }

  .section-title-container {
    width: min(66%, 320px);
    padding-block: var(--space-8-12px);
    border: 1px solid chocolate;
    margin-bottom: var(--space-32-48px);
  }

  .projects-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
    gap: var(--space-96px);
    grid-template-areas:
      "item1 item1 item2"
      "item3 . item2"
      "item3 item4 item4"
      "item5 item5 item7"
      "item6 item6 item7";
    min-height: 80vh;
    width: 100%;
    box-sizing: border-box;
  }

  .project-cell {
    min-height: 200px;
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
  .project-cell[style*="item6"] {
    grid-area: item6;
  }
  .project-cell[style*="item7"] {
    grid-area: item7;
  }

  /* Modal placeholder styles - will be replaced with proper modal later */
  .modal-placeholder {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: var(--z-index-highest);
  }

  .modal-content {
    padding: 5%;
    border-radius: var(--radius-8px);
    width: min(90%, 1024px);
    max-height: 80vh;
    overflow-y: auto;
  }

  .tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 2%;
    margin-top: 5%;
  }

  .tech-list span {
    padding: 1% 3%;
    border-radius: var(--radius-4px);
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* Tablet breakpoint - 2 column layout */
  @media (max-width: 1200px) and (min-width: 769px) {
    .projects-container {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
      grid-template-areas:
        "item1 item2"
        "item3 item2"
        "item3 item4"
        "item5 item4"
        "item5 item7"
        "item6 item7";
      gap: 8%;
      /* Temporary margin for grid testing */
      margin-bottom: 300px; 
    }
  }

  /* Mobile Layout - Single column with alternating alignment */
  @media (max-width: 768px) {
    .projects-container {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(7, auto);
      grid-template-areas:
        "item1"
        "item2"
        "item3"
        "item4"
        "item5"
        "item6"
        "item7";
      gap: var(--space-24-32px);
      min-height: auto;
    }

    /* Ensure all project-card instances are perfect squares and consistent */
    .project-cell :global(.project-card) {
      width: 100%;
      aspect-ratio: 1 / 1;
      height: auto;
      min-height: 0;
    }

    /* Ensure cards don't exceed container width */
    .project-cell > :global(*) {
      max-width: 90%;
    }
  }
</style>
