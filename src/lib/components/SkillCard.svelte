<script>
  import { physicsRegister } from "@lib/actions/physicsRegister.js";
  export let title = "Skill Title";
  export let description = "A brief description of this skill area.";
</script>

<div class="skill-item"
use:physicsRegister={{
  restitution: 0.8,
  friction: 0.2,
  label: "skill-item",
  shape: "circle",
        boundaryType: "reactive",
        velocityThreshold: 3,
}}>
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
