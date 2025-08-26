<script>
  import { onMount, getContext } from 'svelte';
  
  // Component props
  export let title = "Skill Title";
  export let description = "A brief description of this skill area.";
  
  const physicsContext = getContext("physics");
  
  let skillElement;
  let registeredBoundary = null;
  let hasMounted = false;
  
  $: isReady = physicsContext?.isPhysicsReady;

  onMount(() => {
    hasMounted = true;
  });

  // Register card element as physics boundary
  $: if (hasMounted && skillElement && $isReady && !registeredBoundary) {
    console.log(
      `SkillCard "${title}": Physics is ready, attempting boundary registration...`
    );

    registeredBoundary = physicsContext.registerBoundary(
  `skill-card-${title.toLowerCase().replace(/\s+/g, "-")}`,
  skillElement,
  {
    restitution: 0.8,
    friction: 0.2,
    label: `skill-card-${title}`,

    boundaryType: 'reactive',
    velocityThreshold: 4 // You can adjust this per skill card if needed
  }
);

    if (registeredBoundary) {
      console.log(
        `SkillCard "${title}": Successfully registered as physics boundary`
      );
    } else {
      console.warn(
        `SkillCard "${title}": Failed to register physics boundary`
      );
    }
  }
</script>

<div bind:this={skillElement} class="skill-item">
  <h3>{title}</h3>
  <p>{description}</p>
</div>

<style>
  .skill-item {
    width: 100%;
    /* Horizontal rectangular shape */
    aspect-ratio: 1;
    background: lightgrey;
    border-radius: 999px; /* Large value creates pill/oval shape */
    padding: 0 5%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  
  h3 {
    margin-bottom: 2%;
  }
  
  p {
    max-width: 90%;
  }
</style>