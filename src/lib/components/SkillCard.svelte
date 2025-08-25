<script>
  import { onMount } from 'svelte';
  
  // Component props
  export let title = "Skill Title";
  export let description = "A brief description of this skill area.";
  
  // For physics integration later
  export let registerBoundary = null;
  
  let skillElement;
  
  onMount(() => {
    // Will be used for physics boundary registration in later phase
    if (skillElement && registerBoundary) {
      // Future physics boundary registration will go here
    }
  });
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