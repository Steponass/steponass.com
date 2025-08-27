<script>
  import { ballQueue, queueLength, canReleaseBall } from "@stores/ballQueue.js";

  export let canvasWidth = 0;

  const CHUTE_WIDTH = 48;
  const CHUTE_WALL_THICKNESS = 5; 
  const CHUTE_HEIGHT = 150;
  const BALL_SPACING = 46;

  $: chuteX = canvasWidth * 0.85; // 15% from right
  $: chuteY = -(CHUTE_HEIGHT * 0.5); // only bottom 25% visible

  $: hasQueuedBalls = $queueLength > 0;
  $: canRelease = $canReleaseBall;

  $: ballPositions = $ballQueue.map((ball, index) => {
    return {
      ...ball,
      x: chuteX,
      y: chuteY + CHUTE_HEIGHT - 44 - index * BALL_SPACING,
      stackIndex: index,
    };
  });
</script>

<div
  class="gravity-chute"
  class:has-balls={hasQueuedBalls}
  class:can-release={canRelease}
  style:left="{chuteX}px"
  style:top="{chuteY}px"
  style:--chute-width="{CHUTE_WIDTH}px"
  style:--wall-thickness="{CHUTE_WALL_THICKNESS}px"
  style:--chute-height="{CHUTE_HEIGHT}px"
>
  <div class="pipe-wall left-wall"></div>
  <div class="pipe-wall right-wall"></div>
  <div class="pipe-bottom"></div>

  <div class="ball-container">
    {#each ballPositions as ballData (ballData.id)}
      <div
        class="queued-ball"
        class:bottom-ball={ballData.stackIndex === 0}
        style:left="{ballData.x - chuteX}px"
        style:top="{ballData.y - chuteY}px"
        style:--ball-color={ballData.color}
        style:--ball-radius="{ballData.radius}px"
      >
        <div class="ball-visual"></div>
      </div>
    {/each}
  </div>
</div>

<style>
  .gravity-chute {
    position: absolute;
    transform: translateX(-50%);
    width: calc(var(--chute-width) + var(--wall-thickness) * 2);
    height: var(--chute-height);
    z-index: var(--z-index-gravity-chute);
    pointer-events: none;
  }

  .pipe-wall {
    position: absolute;
    top: 0;
    width: var(--wall-thickness);
    height: 100%;
    background: linear-gradient(to bottom, #e4e4e4 0%, #d8d8d8 100%);
  }

  .left-wall {
    left: 0;
  }

  .right-wall {
    right: 0;
  }

  .pipe-bottom {
    position: absolute;
    bottom: -8px;
    left: 0;
    right: 0;
    height: var(--space-8px);
    background: linear-gradient(to bottom, #e4e4e4 0%, #d8d8d8 100%);
    border: 1px solid #555555;
    border-radius: 0 0 10px 10px;
  }

  .ball-container {
    position: absolute;
    top: 0;
    left: calc(var(--wall-thickness) * 6);
    pointer-events: none;
  }

  .queued-ball {
    position: absolute;
    transform: translateX(-50%);
    width: calc(var(--ball-radius) * 2);
    height: calc(var(--ball-radius) * 2);
    transition: all 0.3s ease;
  }

  .ball-visual {
    width: 95%;
    height: 95%;
    border-radius: 50%;
    background: var(--ball-color);
    box-shadow:
      inset -2px -4px 6px rgba(0, 0, 0, 0.2),
      inset 2px 4px 6px rgba(255, 255, 255, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .bottom-ball {
    z-index: var(--z-index-physics-canvas);
  }
</style>
