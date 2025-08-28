<script>
    import { skills } from "@lib/data/skillsData.js";
  import SkillCard from "@components/SkillCard.svelte";
  import { physicsRegister } from "@lib/actions/physicsRegister.js";



</script>

<section class="skills-section" id="skills">
  <div class="section-title-container">
    <h2 class="skills-title"
    use:physicsRegister={{
      restitution: 0.8,
      friction: 0.2,
      label: "skills-title",
      shape: "text-rectangle",
    }}>
    Skills</h2>
  </div>
  <div class="skills-container">
    {#each skills as skill}
      <SkillCard 
      title={skill.title} 
      description={skill.description} />
    {/each}
  </div>
</section>

<style>
  .skills-section {
    width: 100%;
    padding-inline: 5%;
  }

  .section-title-container {
    margin-block: var(--space-32-48px);
  }

  .skills-title {
    width: fit-content;
  }
  
  .skills-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    margin: 0 auto;
    aspect-ratio: 1;
  }

  .skills-container > :global(*) {
    grid-column: 2;
    grid-row: 2;
    width: 100%;
    height: 100%;
  }

  .skills-container > :global(*:nth-child(1)) {
    grid-column: 1;
    grid-row: 1;
  }

  .skills-container > :global(*:nth-child(2)) {
    grid-column: 3;
    grid-row: 1;
  }

  .skills-container > :global(*:nth-child(3)) {
    grid-column: 2;
    grid-row: 2;
  }

  .skills-container > :global(*:nth-child(4)) {
    grid-column: 1;
    grid-row: 3;
  }

  .skills-container > :global(*:nth-child(5)) {
    grid-column: 3;
    grid-row: 3;
  }

  @media (max-width: 991px) {
    .skills-container {
      display: flex;
      flex-direction: column;
      gap: 3rem;
      max-width: 100%;
      aspect-ratio: auto;
    }

    .skills-container > :global(*) {
      width: 80%;
      max-width: 400px;
      margin: 0;
    }

    .skills-container > :global(*:nth-child(odd)) {
      align-self: flex-start;
    }

    .skills-container > :global(*:nth-child(even)) {
      align-self: flex-end;
    }
  }
</style>
