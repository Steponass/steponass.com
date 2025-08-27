<script>
  import { onMount, getContext } from "svelte";

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

  $: if (hasMounted && skillElement && $isReady && !registeredBoundary) {

    registeredBoundary = physicsContext.registerBoundary(
      `skill-card-${title.toLowerCase().replace(/\s+/g, "-")}`,
      skillElement,
      {
        restitution: 0.8,
        friction: 0.2,
        label: `skill-card-${title}`,
        shape: "circle",
        boundaryType: "reactive",
        velocityThreshold: 3.5,
      }
    );

  }
</script>

<div bind:this={skillElement} class="skill-item">
  <h3>{title}</h3>
  <p>{description}</p>
</div>

<style>
  .skill-item {
    width: 100%;
    aspect-ratio: 1;
    background: lightgrey;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
</style>
