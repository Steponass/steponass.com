<script>
  import { onMount } from 'svelte';
  import { canCollectBalls, queueLength } from '@stores/ballQueue.js';

  /**
   * DrainHole Component - Visual representation of ball collection area
   * 
   * This component:
   * - Shows users where balls can be collected
   * - Provides visual feedback based on queue state
   * - Positions itself at bottom-center of canvas area
   * - Matches the detection area in PhysicsEngine.js
   */

  // Props for positioning and sizing
  export let canvasWidth = 0;
  export let canvasHeight = 0;

  // Visual configuration (should match PhysicsEngine.js drainHole config)
  const VISUAL_RADIUS = 30; // Matches physics engine visualRadius
  const GLOW_RADIUS = 45;   // Outer glow effect

  // Reactive positioning based on canvas size
  $: centerX = canvasWidth / 2;
  $: centerY = canvasHeight - 20; // Matches physics engine position

  // Visual states based on queue capacity
  $: isActive = $canCollectBalls;
  $: queueStatus = $queueLength;

  // Debug logging
  onMount(() => {
    console.log('DrainHole: Component mounted');
  });

  // Reactive logging for position updates
  $: if (centerX && centerY) {
    console.log(`DrainHole: Visual position updated to (${centerX}, ${centerY})`);
  }
</script>

<!-- 
  Drain hole visual positioned absolutely within the canvas area
  Uses CSS transforms for precise centering
-->
<div 
  class="drain-hole"
  class:active={isActive}
  class:inactive={!isActive}
  style:left="{centerX}px"
  style:top="{centerY}px"
  style:--visual-radius="{VISUAL_RADIUS}px"
  style:--glow-radius="{GLOW_RADIUS}px"
>
  <!-- Outer glow ring - indicates collection zone -->
  <div class="glow-ring"></div>
  
  <!-- Main hole - the visual drain opening -->
  <div class="hole-opening">
    <!-- Inner shadow to create depth effect -->
    <div class="hole-inner"></div>
  </div>

  <!-- Queue status indicator (optional debug info) -->
  {#if queueStatus > 0}
    <div class="queue-indicator">
      {queueStatus}/12
    </div>
  {/if}
</div>

<!-- Debug info -->
{#if true} <!-- Always show for now -->
  <div class="debug-info">
    Visual: ({centerX}, {centerY})
  </div>
{/if}

<style>
  .drain-hole {
    position: absolute;
    /* Transform centers the element on its coordinates */
    transform: translate(-50%, -50%);
    
    /* Layering - should be above canvas but below balls */
    z-index: 2;
    
    /* Size based on visual radius */
    width: calc(var(--visual-radius) * 2);
    height: calc(var(--visual-radius) * 2);
    
    /* Ensure it doesn't interfere with pointer events */
    pointer-events: none;
    
    /* For debugging - remove later */
    /* border: 1px dashed yellow; */
  }

  .glow-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    width: calc(var(--glow-radius) * 2);
    height: calc(var(--glow-radius) * 2);
    
    /* Subtle glow effect */
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 40%,
      transparent 70%
    );
    
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .hole-opening {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    width: calc(var(--visual-radius) * 2);
    height: calc(var(--visual-radius) * 2);
    
    /* Industrial pipe opening appearance */
    background: 
      radial-gradient(
        circle at center,
        #1a1a1a 0%,
        #2d2d2d 30%,
        #404040 60%,
        #555555 100%
      );
    
    border-radius: 50%;
    
    /* Subtle border to define the edge */
    border: 2px solid #666666;
    
    /* Shadow for depth */
    box-shadow: 
      inset 0 0 10px rgba(0, 0, 0, 0.8),
      0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .hole-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    width: 60%;
    height: 60%;
    
    /* Darker inner area for more depth */
    background: radial-gradient(
      circle at center,
      #000000 0%,
      #111111 50%,
      transparent 100%
    );
    
    border-radius: 50%;
  }

  .queue-indicator {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    
    /* Small text indicator */
    font-size: 12px;
    font-family: monospace;
    color: #666;
    background: rgba(255, 255, 255, 0.8);
    padding: 2px 6px;
    border-radius: 4px;
    
    /* Debug styling - can be removed later */
    pointer-events: none;
  }

  /* Active state - when queue can accept more balls */
  .drain-hole.active .glow-ring {
    opacity: 1;
  }

  .drain-hole.active .hole-opening {
    /* Subtle animation to indicate it's active */
    animation: gentle-pulse 2s ease-in-out infinite;
  }

  /* Inactive state - when queue is full */
  .drain-hole.inactive .hole-opening {
    /* Dimmed appearance when queue is full */
    opacity: 0.6;
    filter: grayscale(0.3);
  }

  .drain-hole.inactive .glow-ring {
    opacity: 0;
  }

  /* Gentle pulsing animation for active state */
  @keyframes gentle-pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1.0);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.05);
    }
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .drain-hole.active .hole-opening {
      animation: none;
    }
    
    .glow-ring {
      transition: none;
    }
  }

  .debug-info {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  
  font-size: 10px;
  font-family: monospace;
  color: #ff0000;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 2px;
  pointer-events: none;
}
</style>