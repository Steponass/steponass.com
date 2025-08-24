<script>
  import Header from "@/sections/Header.svelte";

    // We'll import and initialize physics in Phase 4
  // For now, just checking our structure works
  
  let loaded = false;
  
  // In Svelte, onMount is like useEffect(() => {}, [])
  import { onMount } from 'svelte';
  
  onMount(() => {
    loaded = true;
    console.log('App mounted successfully');
    return () => {
      console.log('App unmounting');
    };
  });
</script>

<Header />

<main>
  {#if loaded}
    <h1>Step’s Portfolio: The Foundationing</h1>
    <h2>Poopy poopito</h2>
    <h3>Wot is happen?</h3>
    <h4>I no know.</h4>
    <h5>Who are you, who who, who who</h5>
    <h6>Sick slacks bitch</h6>
    <p>Are you reddy? Reloading is hot hot hot.</p>
    <span>I span your entire anus</span>
    {:else}
    <p>Loading...</p>
  {/if}
</main>

<style>

  main {
    max-width: 1920px;
    margin-inline: auto;
    padding-block: var(--space-24-32px);
    border: 1px solid brown;
  }

</style>
