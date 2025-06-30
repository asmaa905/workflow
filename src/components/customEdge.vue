<script setup>
import { computed } from 'vue'
import { getBezierPath, getSmoothStepPath } from '@vue-flow/core'
import { MarkerType } from '@vue-flow/core'

const props = defineProps({  
  id: String,
  source: String,
  target: String,
  sourceX: Number,
  sourceY: Number,
  targetX: Number,
  targetY: Number,
  sourcePosition: String,
  targetPosition: String,
  data: Object,
  markerEnd: String,
  style: Object,
  label: String,
  labelStyle: Object,
  labelShowBg: Boolean,
  labelBgStyle: Object,
  labelBgPadding: [Number, String],
  labelBgBorderRadius: [Number, String],
  // Add these to handle VueFlow's extra props
  sourceNode: Object,
  targetNode: Object,
  selected: Boolean,
  animated: Boolean,
  updatable: Boolean,
  type:  String,
   
  
})


const edgePath = computed(() => {
  if (
    props.sourceX == null || props.sourceY == null ||
    props.targetX == null || props.targetY == null
  ) {
    return null;
  }

  return `M ${props.sourceX},${props.sourceY} L ${props.sourceX},${props.targetY} L ${props.targetX},${props.targetY}`;
});




const edgeTextX = computed(() => {
  return props.sourceX + (props.targetX - props.sourceX) * 0.5;
});

const edgeTextY = computed(() => {
  return props.sourceY + (props.targetY - props.sourceY) * 0.5;
});

const edgeAngle = computed(() => {
  const dx = props.targetX - props.sourceX;
  const dy = props.targetY - props.sourceY
  return Math.atan2(dy, dx) * (180 / Math.PI)
})

const extractNodeIdPart = (id) => {
  if (id.includes('-')) {
    const parts = id.split('-');
    if (parts.length >= 2) {
      return parts[1];
    }
  }
  // For simple IDs like "2" or "end"
  return id;
};

const edgeIdentifier = computed(() => {
  return `e${extractNodeIdPart(props.source)} → ${extractNodeIdPart(props.target)}`;
});
</script>

<template>
<path
  v-if="edgePath" 
  :id="props.id"
  class="vue-flow__edge-path"
  :d="edgePath"
  
  :marker-end="props.markerEnd"
  :style="props.style"
/>

  <!-- Edge label (the + button) -->
  <foreignObject
    v-if="props.label"
    :width="props.labelBgStyle?.width || '20px'"
    :height="props.labelBgStyle?.height || '20px'"
    :x="edgeTextX - 10"
    :y="edgeTextY - 10"
    requiredExtensions="http://www.w3.org/1999/xhtml"
  >
    <div
      class="edge-label"
      :style="{
        ...props.labelBgStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }"
    >
      <span :style="props.labelStyle">{{ props.label }}</span>
    </div>
  </foreignObject>
  
  <!-- Edge identifier text -->
  <text
    class="edge-identifier-text"
    :x="edgeTextX"
    :y="edgeTextY"
    :transform="`rotate(${edgeAngle} ${edgeTextX} ${edgeTextY})`"
    text-anchor="middle"
    dominant-baseline="middle"
  >
    {{ edgeIdentifier }}
  </text>
</template>

<style>
.vue-flow__edge-path {
  stroke: #333;
  stroke-width: 2;
  fill: none;
}

.edge-identifier-text {
  font-size: 10px;
  fill: #555;
  pointer-events: none;
  user-select: none;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2px 5px;
  border-radius: 3px;
  transform: translate(71px, -17px);
}

.edge-label {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ccc;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.vue-flow__edge-text{
      width: 100%;
    height: 100%;
    display: flex !important;
    align-items: flex-end;
    justify-content: end;
    border-radius: 50%;
    background: #ccc;
    color: white;
    font-weight: bold;
    cursor: pointer;
}
/* In customEdge.vue */
.edge-identifier-text {
  font-size: 10px;
  fill: #555;
  pointer-events: none;
  user-select: none;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2px 5px;
  border-radius: 3px;
  /* Remove this line: transform: translate(71px, -17px); */
}
</style>