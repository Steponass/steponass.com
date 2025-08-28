<script>
  import { onMount } from "svelte";
  import { resolvedTheme, Theme } from "@lib/stores/theme.js";

  let documentElement;

  function applyThemeToDocument(theme) {
    if (!documentElement) return;

    if (theme === Theme.DARK) {
      documentElement.setAttribute("data-theme", "dark");
    } else {
      documentElement.setAttribute("data-theme", "light");
    }
  }

  onMount(() => {
    documentElement = document.documentElement;
    applyThemeToDocument($resolvedTheme);
  });

  $: if (documentElement) {
    applyThemeToDocument($resolvedTheme);
  }
</script>
