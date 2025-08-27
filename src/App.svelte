<script>
  import { onMount } from "svelte";

  import PhysicsAwareSection from "./lib/components/PhysicsAwareSection.svelte";
  import Header from "@/sections/Header.svelte";
  import PhysicsCanvas from "./lib/components/PhysicsCanvas.svelte";
  import HeroSection from "@/sections/HeroSection.svelte";
  import ProjectsSection from "@/sections/ProjectsSection.svelte";
  import SkillsSection from "./sections/SkillsSection.svelte";
  import CallToActionSection from "./sections/CallToActionSection.svelte";
  import Footer from "./sections/Footer.svelte";

  let loaded = false;

  onMount(() => {
    loaded = true;
  });
</script>

<PhysicsAwareSection sectionId="header-section" debug={true}>
  <Header />
</PhysicsAwareSection>

{#if loaded}
  <main>
    <PhysicsCanvas debug={true} />

    <PhysicsAwareSection sectionId="hero-section" debug={true}>
      <HeroSection />
    </PhysicsAwareSection>

    <PhysicsAwareSection sectionId="projects-section" debug={true}>
      <ProjectsSection />
    </PhysicsAwareSection>

    <PhysicsAwareSection sectionId="skills-section" debug={true}>
      <SkillsSection />
    </PhysicsAwareSection>

    <PhysicsAwareSection sectionId="CTA-section" debug={true}>
      <CallToActionSection />
    </PhysicsAwareSection>
  </main>

  <PhysicsAwareSection sectionId="CTA-section" debug={true}>
    <Footer />
  </PhysicsAwareSection>
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
  }
</style>
