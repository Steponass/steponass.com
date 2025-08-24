<script>
  import { onMount } from 'svelte';
  import ProjectCard from '@components/ProjectCard.svelte';
  
  // For future physics integration
  export let registerBoundary = null;
  
  // Sample project data with tech stacks
  const projects = [
    { 
      id: 1, 
      title: "Co~Learn", 
      description: "Full-stack project: a virtual classroom", 
      techStack: ["React", "Next", "Supabase", "LiveKit"]
    },
    { 
      id: 2, 
      title: "Co-Narrate", 
      description: "Storytelling tool that integrates Web Speech Recognition API", 
      techStack: ["React", "Tailwind"]
    },
    { 
      id: 3, 
      title: "RushIQ", 
      description: "A corporate website with an AI-enabled chatbot.", 
      techStack: ["React", "Tailwind", "Botpress"]
    },
    { 
      id: 4, 
      title: "Artist websites", 
      description: "2 tailored sites, my early work. Did design & dev + deployment + maintenance", 
      techStack: ["JS", "React", "EmailJS", "GSAP"] 
    },
    { 
      id: 5, 
      title: "Our Project?", 
      description: "…This could be something beautiful!", 
      techStack: ["Framework", "Library", "Database"]
    },
    { 
      id: 6, 
      title: "Mystify Me", 
      description: "A personal project where I scratched my creative itch while deepening knowledge of React + global state mgmt", 
      techStack: ["React", "Zustand", "GSAP"]
    }
  ];
  
  let sectionElement;
  let titleElement;
  let activeModal = null;
  
  function handleOpenModal(event) {
    activeModal = event.detail;
    console.log('Modal opened for project:', activeModal.title);
    // In a future implementation, we would show the actual modal component here
  }
  
  function closeModal() {
    activeModal = null;
  }
  
  onMount(() => {
    console.log('Projects section mounted');
  });
</script>

<section bind:this={sectionElement} id="projects" class="projects-section">
  <div bind:this={titleElement} class="section-title-container">
    <h2>Projects</h2>
  </div>
  
  <div class="projects-grid">
    <!-- Row 1: rectangle + square -->
    <div class="project-row">
      <div class="project-cell rectangle-cell">
        <ProjectCard 
          title={projects[0].title} 
          description={projects[0].description} 
          techStack={projects[0].techStack}
          shape="rectangle"
          {registerBoundary}
          on:openModal={handleOpenModal}
        />
      </div>
      <div class="project-cell square-cell">
        <ProjectCard 
          title={projects[1].title} 
          description={projects[1].description} 
          techStack={projects[1].techStack}
          shape="square"
          {registerBoundary}
          on:openModal={handleOpenModal}
        />
      </div>
    </div>
    
    <!-- Row 2: square + rectangle -->
    <div class="project-row">
      <div class="project-cell square-cell">
        <ProjectCard 
          title={projects[2].title} 
          description={projects[2].description}
          techStack={projects[2].techStack} 
          shape="square"
          {registerBoundary}
          on:openModal={handleOpenModal}
        />
      </div>
      <div class="project-cell rectangle-cell">
        <ProjectCard 
          title={projects[3].title} 
          description={projects[3].description}
          techStack={projects[3].techStack} 
          shape="rectangle"
          {registerBoundary}
          on:openModal={handleOpenModal}
        />
      </div>
    </div>
    
    <!-- Row 3: rectangle + square -->
    <div class="project-row">
      <div class="project-cell rectangle-cell">
        <ProjectCard 
          title={projects[4].title} 
          description={projects[4].description}
          techStack={projects[4].techStack} 
          shape="rectangle"
          {registerBoundary}
          on:openModal={handleOpenModal}
        />
      </div>
      <div class="project-cell square-cell">
        <ProjectCard 
          title={projects[5].title} 
          description={projects[5].description}
          techStack={projects[5].techStack} 
          shape="square"
          {registerBoundary}
          on:openModal={handleOpenModal}
        />
      </div>
    </div>
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
    padding: 5% 5%;
  }
  
  h2 {
    margin-bottom: 5%;
    text-align: center;
  }
  
  .projects-grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5%;
  }
  
  .project-row {
    display: flex;
    width: 100%;
    gap: 5%;
  }
  
  .project-cell {
    flex-grow: 1;
  }
  
  .rectangle-cell {
    flex-basis: 60%;
  }
  
  .square-cell {
    flex-basis: 35%;
  }
  
  /* Modal placeholder styles - will be replaced with proper modal later */
  .modal-placeholder {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
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
    background-color: rgba(0,0,0,0.05);
  }
  
  /* Responsive layout for smaller screens */
  @media (max-width: 991px) {
    .project-row {
      flex-direction: column;
      gap: 5vh;
    }
    
    .project-cell {
      width: 100%;
    }
    
    /* On mobile, all cells have the same layout */
    .rectangle-cell, .square-cell {
      flex-basis: 100%;
    }
  }
</style>