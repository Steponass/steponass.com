<script>
  import { onMount } from "svelte";

  import ThemeProvider from "@lib/providers/ThemeProvider.svelte";
  import Header from "@/sections/Header.svelte";
  import PhysicsCanvas from "@components/PhysicsCanvas.svelte";
  import HeroSection from "@/sections/HeroSection.svelte";
  import ProjectsSection from "@/sections/ProjectsSection.svelte";
  import SkillsSection from "./sections/SkillsSection.svelte";
  import CTASection from "./sections/CTASection.svelte";
  import Footer from "./sections/Footer.svelte";

  let loaded = false;

  onMount(() => {
    loaded = true;
  });
</script>

<ThemeProvider />
<Header />
{#if loaded}
  <main>
    <PhysicsCanvas debug={true} />
    <HeroSection />
    <ProjectsSection />
    <SkillsSection />
    <CTASection />
  </main>
  <Footer />
{:else}
  <div class="loading">
    <p>Loading...</p>
  </div>
{/if}

<style>
  main {
    position: relative;
    max-width: 1920px;
    margin-inline: auto;
    /* border: 2px solid black; */
    outline: var(--clr-stroke-weak) solid 4px;
  }
</style>
