<script setup>
import { ref } from 'vue';
import { onMounted, onUnmounted } from 'vue';
import { Handle, Position } from '@vue-flow/core'

const props = defineProps(['id', 'data', 'type']);

const emit = defineEmits(['editNode', 'deleteNode', 'edge-click']);

const handleEditText = (e) => {
  console.log(e)
  if(e.key == 'enter'){
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
  e.stopImmediatePropagation();
  emit('edge-click', props.id, e);
};
const listen = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
  }
};

onMounted(() => {
    console.log("props",props)

  document.addEventListener("keydown", listen);
});

onUnmounted(() => {
  document.removeEventListener("keydown", listen);
});

</script>

<template>
  <div class="rhombus-node node-container" @click="handleEditText">
    <!-- Bottom-right handle -->
    <Handle 
      type="source" 
      :position="Position.Bottom" 
      class="bottom-right-handle" 
    />
    <!-- Top-left handle -->
    <Handle 
      type="source" 
      :position="Position.Top" 
      class="top-left-handle" 
    />
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div class="rect-setting flex justify-between items-center w-full">
        <p style="font-size: 6px;background-color: #fff;">p{{ data.parent }}, ch-{{data.child[0]}}</p>
         <button 
            class="delete-btn w-[25px] h-[25px]" 
            @click.stop="handleDelete"
            @mousedown.stop
            @touchstart.stop
        >
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
            <g fill="#de4850" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(8,8)"><path d="M15,4c-0.52344,0 -1.05859,0.18359 -1.4375,0.5625c-0.37891,0.37891 -0.5625,0.91406 -0.5625,1.4375v1h-6v2h1v16c0,1.64453 1.35547,3 3,3h12c1.64453,0 3,-1.35547 3,-3v-16h1v-2h-6v-1c0,-0.52344 -0.18359,-1.05859 -0.5625,-1.4375c-0.37891,-0.37891 -0.91406,-0.5625 -1.4375,-0.5625zM15,6h4v1h-4zM10,9h14v16c0,0.55469 -0.44531,1 -1,1h-12c-0.55469,0 -1,-0.44531 -1,-1zM12,12v11h2v-11zM16,12v11h2v-11zM20,12v11h2v-11z"></path></g></g>
          </svg>   
        </button>
      </div>
      <div class="plus-icon" @click.stop="edgeClick" @mousedown.stop @touchstart.stop>
        +
      </div>
    </div>
  </div>
</template>
<style scoped>
.rhombus-node {
  width: 30px;
  height: 30px;
  /* border: 2px solid #2196F3; */
  background: rgb(30,215,76);
  transform: rotate(45deg);
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.node-content {
  transform: rotate(-45deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.node-label {
  padding: 5px;
  text-align: center;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
    color:white;
    font-size:25px

}

.rect-setting{
    position: absolute;
  top: -10px;
  right: -10px;
}
.rect-setting p{
  background :white
}
.delete-btn {
transform: translate(-12px, 10px);
    background: transparent;
    color: white;
    border: none;
    border-radius: 50%;
    width: 12px;
    height: 14px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
}
.plus-icon {
  position: absolute;
  bottom: -12px;
  right: calc(50% - 12px); /* Center horizontally */
  background: #ccc;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  transform: rotate(-45deg);
}

/* Handle styles */
.vue-flow__handle {
  width: 8px;
  height: 8px;
  background: #555;
  border: 2px solid white;
  border-radius: 50%;
}

/* Position handles at the corners */

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