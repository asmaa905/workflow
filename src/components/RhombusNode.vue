<script setup>
import { ref } from 'vue';
import { onMounted, onUnmounted } from 'vue';
import { Handle, Position } from '@vue-flow/core'

// data
const showOptions = ref(false);
const actuallabel = ref('');
const isHovering = ref(false);

// props
const props = defineProps(['id', 'data', 'type']);
// emit
const emit = defineEmits(['editNode', 'deleteNode', 'edge-click']);

// hooks
onMounted(() => {
  document.addEventListener("keydown", listen);
  actuallabel.value = props.data.label;
});

onUnmounted(() => {
  document.removeEventListener("keydown", listen);
});

// methods
const handleEditText = (e) => {
  if(e.key == 'Enter'){
    e.preventDefault();
    e.stopPropagation();
  }
  emit('editNode', props.id, props.data.label);
};

const handleDelete = (e) => {
  e.preventDefault();
  e.stopPropagation();
    e.stopImmediatePropagation();

  emit('deleteNode', props.id);
};

const edgeClick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  emit('edge-click', props.id, e);
};

const listen = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
  }
};

const handleRhombusClick = (e) => {
  e.stopPropagation();
  showOptions.value = !showOptions.value;
  props.data.label = showOptions.value ? '+' : actuallabel.value;
};

const handleRhombusHover = (isHover) => {
  isHovering.value = isHover;
  if (!showOptions.value) {
    props.data.label = isHover ? '+' : actuallabel.value;
  }
};

const extractNodeIdPart = (id) => {
  if (!id) return ''; // Add this null check
  if (id.includes('-')) {
    const parts = id.split('-');
    if (parts.length >= 2) {
      return parts[1];
    }
  }
  return id;
};
</script>

<template>
  <div 
    class="rhombus-node node-container" 
    @click="handleRhombusClick"
    @mouseenter="handleRhombusHover(true)"
    @mouseleave="handleRhombusHover(false)"
  >
    <!-- Handles -->
    <Handle type="source" :position="Position.Bottom" class="bottom-right-handle" />
    <Handle type="source" :position="Position.Top" class="top-left-handle" />
    
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div class="rect-setting flex justify-between items-center w-full">
        <p style="font-size: 6px;">p-{{extractNodeIdPart(data.actualPrevNode )}}, ch-{{extractNodeIdPart(data.actualNextNode)}}</p>
        <button 
          class="delete-btn w-[25px] h-[25px]" 
          @click.stop="handleDelete"
          @mousedown.stop
          @touchstart.stop
        >
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
            <g fill="#de4850" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
              <g transform="scale(8,8)"><path d="M15,4c-0.52344,0 -1.05859,0.18359 -1.4375,0.5625c-0.37891,0.37891 -0.5625,0.91406 -0.5625,1.4375v1h-6v2h1v16c0,1.64453 1.35547,3 3,3h12c1.64453,0 3,-1.35547 3,-3v-16h1v-2h-6v-1c0,-0.52344 -0.18359,-1.05859 -0.5625,-1.4375c-0.37891,-0.37891 -0.91406,-0.5625 -1.4375,-0.5625zM15,6h4v1h-4zM10,9h14v16c0,0.55469 -0.44531,1 -1,1h-12c-0.55469,0 -1,-0.44531 -1,-1zM12,12v11h2v-11zM16,12v11h2v-11zM20,12v11h2v-11z"></path></g>
            </g>
          </svg>   
        </button>
      </div>
    </div>
    
    <!-- Options Panel -->
    <div v-if="showOptions" class="options-panel flex flex-row justify-between items-center">
      <div class="option" @click.stop="handleEditText">
        <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </div>
      <div class="option" @click.stop="edgeClick">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
     
    </div>
  </div>
</template>

<style scoped>
.rhombus-node {
  width: 30px;
  height: 30px;
  /* border: 2px solid #2196F3; */
  background: #fff;
  border:1px solid rgb(30,215,76);
  transform: rotate(45deg);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rhombus-node:hover {
  background: rgb(30, 215, 76);
}

.node-content {
  transform: rotate(-45deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
  height: 100%;
  justify-content: center;
}

.node-label {
  padding: 5px;
  text-align: center;
  color: rgb(30, 215, 76);
  font-size: 25px;
  font-weight: bold;
  transition: color 0.2s ease;
}

.rhombus-node:hover .node-label {
  color: white;
}

.rect-setting {
  position: absolute;
  top: -10px;
  right: -10px;
}

.rect-setting p {
  background: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 6px;
}

.delete-btn {
  transform: translate(-12px, 10px);
  background: transparent;
  border: none;
  width: 12px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

/* Options Panel */
.options-panel {
 position: absolute;
    top: 100%;
    left: 50%;
    transform: translate(-99%, 100%) rotate(-45deg);
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
    /* min-width: 120px;*/
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.option:hover {
  background: #f0f0f0;
}

.option svg {
  width: 10px;
  height: 10px;
}

.option span {
  font-size: 12px;
  white-space: nowrap;
}

/* Handle styles */
.vue-flow__handle {
  width: 8px;
  height: 8px;
  background: #555;
  border: 2px solid white;
  border-radius: 50%;
}

.bottom-right-handle {
  bottom: 2px;
  right: 74px;
  transform: translate(150%, 80%);
}

.top-left-handle {
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
}
</style>