<script>
  import { onMount } from "svelte";
  import SkillCard from "@components/SkillCard.svelte";

  // For future physics integration
  export let registerBoundary = null;

  // Sample skills data
  const skills = [
    {
      title: "Frontend Development",
      description:
        "Building responsive, accessible, and performant user interfaces with modern frameworks.",
    },
    {
      title: "Animation & Interaction",
      description:
        "Creating engaging motion design and interactive experiences that delight users.",
    },
    {
      title: "Backend Integration",
      description:
        "Connecting frontend applications to APIs and server-side systems for complete solutions.",
    },
    {
      title: "Performance Optimization",
      description:
        "Identifying and resolving bottlenecks to ensure smooth user experiences across devices.",
    },
    {
      title: "Dick Sucking",
      description: "Identifying and resolving dry dick syndrome.",
    },
  ];

  let sectionElement;
  let titleElement;

  onMount(() => {
    console.log("Skills section mounted");
  });

  // Will register the title container as a physics boundary in later phases
  if (titleElement && registerBoundary) {
    // Future registration code will go here
    console.log("Title container ready for physics registration");
  }
</script>

<section bind:this={sectionElement} id="skills" class="skills-section">
  <div bind:this={titleElement} class="section-title-container">
    <h2>Skills</h2>
  </div>
  <div class="skills-container">
    {#each skills as skill}
      <SkillCard
        title={skill.title}
        description={skill.description}
        {registerBoundary}
      />
    {/each}
  </div>
</section>

<style>
  .skills-section {
    width: 100%;
    padding-inline: 5%;
  }

  .section-title-container {
    width: min(66%, 320px);
    padding-block: var(--space-8-12px);
    border: 1px solid chocolate;
  }

  .skills-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 2rem;
    max-width: 1024px;
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
