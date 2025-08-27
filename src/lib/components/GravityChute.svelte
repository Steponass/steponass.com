<script>
  import { ballQueue, queueLength, canReleaseBall } from '@stores/ballQueue.js';

  export let canvasWidth = 0;
  export let canvasHeight = 0;

  // Chute configuration
  const CHUTE_WIDTH = 48;           // Pipe inner width
  const CHUTE_WALL_THICKNESS = 5;   // Pipe wall thickness
  const CHUTE_HEIGHT = 300;         // Visible pipe length (increased for 12 balls)
  const BALL_SPACING = 44;          // Space between balls in pipe (reduced for 12 balls)

  // Position at 25% from right edge of canvas
  $: chuteX = canvasWidth * 0.85;   // 75% from left = 25% from right
  $: chuteY = -(CHUTE_HEIGHT * 0.75); // Position 75% of chute above screen (only bottom 25% visible)

  // Visual states
  $: hasQueuedBalls = $queueLength > 0;
  $: canRelease = $canReleaseBall;

  // Calculate ball positions within the chute
  $: ballPositions = $ballQueue.map((ball, index) => {
    return {
      ...ball,
      // Stack balls from bottom up within the chute
      x: chuteX,
      y: chuteY + CHUTE_HEIGHT - 40 - (index * BALL_SPACING), // 40px from bottom, spaced upward
      stackIndex: index
    };
  });

  // Debug logging
  $: if (canvasWidth && canvasHeight) {
    console.log(`GravityChute: Positioned at (${chuteX}, ${chuteY}) on ${canvasWidth}x${canvasHeight} canvas`);
  }
</script>

<!--
  Gravity chute positioned absolutely within the canvas area
  Consists of: pipe walls, queued balls, release valve
-->
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
  <div class="pipe-bottom">
  </div>
  
  <!-- Queued balls displayed inside the pipe -->
  <div class="ball-container">
    {#each ballPositions as ballData (ballData.id)}
      <div 
        class="queued-ball"
        class:bottom-ball={ballData.stackIndex === 0}
        style:left="{ballData.x - chuteX}px"
        style:top="{ballData.y - chuteY}px"
        style:--ball-color="{ballData.color}"
        style:--ball-radius="{ballData.radius}px"
      >
        <!-- Ball visual with physics-style rendering -->
        <div class="ball-visual"></div>
      </div>
    {/each}
  </div>

</div>

<style>
  .gravity-chute {
    position: absolute;
    transform: translateX(-50%); /* Center on the X coordinate */
    
    /* Size based on chute configuration */
    width: calc(var(--chute-width) + var(--wall-thickness) * 2);
    height: var(--chute-height);
    
    /* Layering - above canvas, below balls when they're falling */
    z-index: var(--z-index-gravity-chute);
    
    pointer-events: none;
    
  }

  .pipe-wall {
    position: absolute;
    top: 0;
    width: var(--wall-thickness);
    height: 100%;
    
    background: linear-gradient(
      to bottom,
      #e4e4e4 0%,
      #d8d8d8 100%
    );
    

  }

  .left-wall {
    left: 0;
  }

  .right-wall {
    right: 0;
  }

  .pipe-bottom {
    position: absolute;
    bottom: -8px; /* Extends below the walls slightly */
    left: 0;
    right: 0;
    height: var(--space-8px);
    
    /* Bottom cap styling */
    background: linear-gradient(
      to bottom,
      #e4e4e4 0%,
      #d8d8d8 100%
    );
    border: 1px solid #555555;
    border-radius: 0 0 10px 10px;
  }




  .ball-container {
    position: absolute;
    top: 0;
    left: calc(var(--wall-thickness) * 6 );
    height: 100%;
    
    /* Container for ball positioning */
    pointer-events: none;
  }

  .queued-ball {
    position: absolute;
    transform: translateX(-50%); /* Center ball horizontally */
    
    /* Size based on ball radius */
    width: calc(var(--ball-radius) * 2);
    height: calc(var(--ball-radius) * 2);
    
    /* Transition for smooth movement when queue changes */
    transition: all 0.3s ease;
  }

  .ball-visual {
    width: 95%;
    height: 95%;
    border-radius: 50%;
    
    /* Match the physics ball appearance */
    background: var(--ball-color);
    /* Physics-style shadows */
    box-shadow: 
      inset -2px -4px 6px rgba(0, 0, 0, 0.2),
      inset 2px 4px 6px rgba(255, 255, 255, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .bottom-ball {
    /* Special styling for the ball that will be released next */
    z-index: var(--z-index-physics-canvas);
  }





</style>