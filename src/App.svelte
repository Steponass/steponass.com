<script>
  import Header from "@/sections/Header.svelte";
  import HeroSection from "@/sections/HeroSection.svelte";
  import ProjectsSection from "@/sections/ProjectsSection.svelte";
  import SkillsSection from "./sections/SkillsSection.svelte";
  import CallToActionSection from "./sections/CallToActionSection.svelte";
  import Footer from "./sections/Footer.svelte";

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

{#if loaded}
  <main>
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
