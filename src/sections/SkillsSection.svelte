
<script>
  import { onMount } from 'svelte';
  import SkillCard from '@components/SkillCard.svelte';
  
  // For future physics integration
  export let registerBoundary = null;
  
  // Sample skills data
  const skills = [
    {
      title: "Frontend Development",
      description: "Building responsive, accessible, and performant user interfaces with modern frameworks."
    },
    {
      title: "Animation & Interaction",
      description: "Creating engaging motion design and interactive experiences that delight users."
    },
    {
      title: "Backend Integration",
      description: "Connecting frontend applications to APIs and server-side systems for complete solutions."
    },
    {
      title: "Performance Optimization",
      description: "Identifying and resolving bottlenecks to ensure smooth user experiences across devices."
    },
    {
      title: "Dick Sucking",
      description: "Identifying and resolving dry dick syndrome."
    }
  ];
  
  let sectionElement;
  let titleElement;
  
  onMount(() => {
    console.log('Skills section mounted');
  });
  
      // Will register the title container as a physics boundary in later phases
      if (titleElement && registerBoundary) {
      // Future registration code will go here
      console.log('Title container ready for physics registration');
    }
</script>

<section bind:this={sectionElement} id="skills" class="skills-section">
  <div bind:this={titleElement} class="section-title-container">
    <h2>Skills</h2>
  </div>
  
  <div class="skills-container">
    {#each skills as skill}
      <div class="skill-wrapper">
        <SkillCard
          title={skill.title}
          description={skill.description}
          {registerBoundary}
        />
      </div>
    {/each}
  </div>
</section>

<style>
  .skills-section {
    width: 100%;
    padding: 5% 5%;
  }
  
  h2 {
    margin-bottom: 5%;
    text-align: center;
  }
  
  .skills-container {
    display: flex;
    flex-direction: column;
    gap: 5%;
    width: 100%;
    max-width: 90%;
    margin: 0 auto;
  }
  
  .skill-wrapper {
    width: 100%;
  }
  
  /* Alternating positioning for visual interest */
  .skill-wrapper:nth-child(odd) {
    align-self: flex-start;
  }
  
  .skill-wrapper:nth-child(even) {
    align-self: flex-end;
  }
  
  /* Responsive adjustments */
  @media (max-width: 991px) {
    .skill-wrapper {
      align-self: center !important; /* Override the alternating positioning */
      width: 100%;
    }
  }
</style>