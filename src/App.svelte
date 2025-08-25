<script>
  import Header from "@/sections/Header.svelte";
  import PhysicsCanvas from "./lib/components/PhysicsCanvas.svelte";
  import HeroSection from "@/sections/HeroSection.svelte";
  import ProjectsSection from "@/sections/ProjectsSection.svelte";
  import SkillsSection from "./sections/SkillsSection.svelte";
  import CallToActionSection from "./sections/CallToActionSection.svelte";
  import Footer from "./sections/Footer.svelte";

  import { enableBallInteraction, enableNormalBrowsing, temporaryBallInteraction, interactionMode } from '@stores/interaction.js';


    // We'll import and initialize physics in Phase 4
  // For now, just checking our structure works
  
  let registerBoundary = null;

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

<PhysicsCanvas debug={true} />

{#if loaded}
  <main>

    <!-- Temporary interaction switch for debugging -->
    <div style="position: fixed; top: 100px; right: 20px; z-index: 10; background: white; padding: 10px;">
      <p>Current mode: {$interactionMode}</p>
      <button on:click={enableNormalBrowsing}>Normal Browsing</button>
      <button on:click={enableBallInteraction}>Ball Interaction</button>
      <button on:click={() => temporaryBallInteraction(3000)}>Temp Ball (3s)</button>
    </div>
    
    <HeroSection {registerBoundary} />
    <ProjectsSection {registerBoundary} />
    <SkillsSection {registerBoundary} />
    <CallToActionSection {registerBoundary} />
  </main>
  <Footer />
{:else}
  <div class="loading">
    <p>Loading...</p>
  </div>
{/if}

<style>

  main {
    max-width: 1920px;
    margin-inline: auto;
    padding-block: var(--space-24-32px);
    border: 3px solid brown;
  }

</style>
