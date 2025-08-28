<script>
  import { physicsRegister } from "@lib/actions/physicsRegister.js";
  import { canCollectBalls, queueLength } from "@stores/ballQueue.js";

  export let canvasHeight = 0;

  // Pipe configuration (matching GravityChute styling)
  const PIPE_WIDTH = 48;           // Pipe inner width
  const PIPE_WALL_THICKNESS = 2;   // Pipe wall thickness
  const PIPE_LENGTH = 40;         // Horizontal pipe length

  // Reactive positioning for bottom-left horizontal placement
  $: centerX = PIPE_LENGTH / 2;    // Half pipe length from left edge
  $: centerY = canvasHeight - (PIPE_WIDTH / 2) - 3; // Bottom placement with small margin

  // Visual states based on queue capacity
  $: isActive = $canCollectBalls;
  $: queueStatus = $queueLength;
</script>

<div
  class="drain-hole"
  use:physicsRegister={{
    restitution: 0.8,
    friction: 0.2,
    label: "drain-hole",
  }}

  class:active={isActive}
  class:inactive={!isActive}
  style:left="{centerX}px"
  style:top="{centerY}px"
  style:--pipe-width="{PIPE_WIDTH}px"
  style:--wall-thickness="{PIPE_WALL_THICKNESS}px"
  style:--pipe-length="{PIPE_LENGTH}px"
>
  <div class="pipe-wall top-wall"></div>
  <div class="pipe-hole"></div>
  <div class="pipe-wall bottom-wall"></div>
</div>

<style>
  .drain-hole {
    position: absolute;
    transform: translate(-50%, -50%);
    
    /* Size based on pipe configuration */
    width: var(--pipe-length);
    height: calc(var(--pipe-width) + var(--wall-thickness) * 2);
    /* Layering - should be above canvas but below balls */
    z-index: var(--z-index-drain-hole);
    pointer-events: none;
  }

  .pipe-wall {
    position: absolute;
    left: 0;
    width: var(--pipe-length);
    height: var(--space-4px);
    background: linear-gradient(
      to left,
      #cecece 0%,
      #d8d8d8 100%
    );
  }

  .top-wall {
    top: 0;
  }

  .pipe-hole {
    position: absolute;
    top: 2%;
    right: -8px;
    background: linear-gradient(
      to bottom,
      #e4e4e4 0%,
      #d8d8d8 100%
    );
    border: 1px solid #555555;
    border-radius: 0 10px 10px 0px;
    width: var(--space-8px);
    height: 98%;
  }

  .bottom-wall {
    bottom: 0;
  }
</style>
