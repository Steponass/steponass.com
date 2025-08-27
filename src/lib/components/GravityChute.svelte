<script>
  import { ballQueue, queueLength, canReleaseBall } from '@stores/ballQueue.js';

  /**
   * GravityChute Component - Visual pipe showing queued balls
   * 
   * This component:
   * - Shows a transparent industrial pipe at top-right of canvas
   * - Displays balls from the queue store as visual elements (no physics)
   * - Provides visual feedback about release readiness
   * - Positions balls in a realistic stacked arrangement
   */

  export let canvasWidth = 0;
  export let canvasHeight = 0;

  // Chute configuration
  const CHUTE_WIDTH = 80;           // Pipe inner width
  const CHUTE_WALL_THICKNESS = 8;   // Pipe wall thickness
  const CHUTE_HEIGHT = 200;         // Visible pipe length
  const BALL_SPACING = 45;          // Space between balls in pipe

  // Position at 25% from right edge of canvas
  $: chuteX = canvasWidth * 0.8;   // 75% from left = 25% from right
  $: chuteY = 20;                   // Near top of canvas

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
  <!-- Pipe walls - left and right sides -->
  <div class="pipe-wall left-wall"></div>
  <div class="pipe-wall right-wall"></div>
  
  <!-- Pipe bottom cap with release valve -->
  <div class="pipe-bottom">
    <div class="release-valve" class:ready={canRelease}>
      <div class="valve-indicator"></div>
    </div>
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

  <!-- Queue status indicator (optional) -->
  {#if hasQueuedBalls}
    <div class="queue-status">
      {$queueLength}/3
    </div>
  {/if}
</div>

<style>
  .gravity-chute {
    position: absolute;
    transform: translateX(-50%); /* Center on the X coordinate */
    
    /* Size based on chute configuration */
    width: calc(var(--chute-width) + var(--wall-thickness) * 2);
    height: var(--chute-height);
    
    /* Layering - above canvas, below balls when they're falling */
    z-index: 3;
    
    pointer-events: none;
    
  }

  .pipe-wall {
    position: absolute;
    top: 0;
    width: var(--wall-thickness);
    height: 100%;
    
    /* Industrial pipe material appearance */
    background: linear-gradient(
      to right,
      #888888 0%,
      #aaaaaa 20%,
      #cccccc 40%,
      #aaaaaa 60%,
      #888888 100%
    );
    
    /* Subtle pipe texture */
    border: 1px solid #666666;
    border-radius: var(--wall-thickness);
    
    /* Pipe shadow for depth */
    box-shadow: 
      inset 2px 0 4px rgba(255, 255, 255, 0.3),
      inset -2px 0 4px rgba(0, 0, 0, 0.3);
  }

  .left-wall {
    left: 0;
  }

  .right-wall {
    right: 0;
  }

  .pipe-bottom {
    position: absolute;
    bottom: -10px; /* Extends below the walls slightly */
    left: 0;
    right: 0;
    height: 20px;
    
    /* Bottom cap styling */
    background: linear-gradient(
      to bottom,
      #888888 0%,
      #666666 100%
    );
    border: 1px solid #555555;
    border-radius: 0 0 10px 10px;
  }

  .release-valve {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    
    width: 20px;
    height: 16px;
    
    /* Valve styling */
    background: #555555;
    border: 2px solid #333333;
    border-radius: 4px;
    
    transition: all 0.3s ease;
  }

  .release-valve.ready {
    /* Visual feedback when ready to release */
    background: #4CAF50;
    border-color: #2E7D32;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.4);
  }

  .valve-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    width: 6px;
    height: 6px;
    background: #222222;
    border-radius: 50%;
  }

  .release-valve.ready .valve-indicator {
    background: #ffffff;
  }

  .ball-container {
    position: absolute;
    top: 0;
    left: var(--wall-thickness);
    right: var(--wall-thickness);
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
    width: 100%;
    height: 100%;
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
    z-index: 1;
  }

  .queue-status {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: var(--fs-s);
    font-family: monospace;
    color: #666;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 6px;
    border-radius: 4px;
    
    pointer-events: none;
  }

  /* Animation states */
  .gravity-chute.has-balls {
    /* Subtle animation when balls are present */
  }

  .gravity-chute.can-release .release-valve {
    /* Ready to release animation */
    animation: valve-ready 2s ease-in-out infinite;
  }

  @keyframes valve-ready {
    0%, 100% {
      transform: translateX(-50%) scale(1.0);
    }
    50% {
      transform: translateX(-50%) scale(1.1);
    }
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .queued-ball {
      transition: none;
    }
    
    .gravity-chute.can-release .release-valve {
      animation: none;
    }
  }
</style>