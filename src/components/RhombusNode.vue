<script setup>
import { ref } from 'vue';
import { onMounted, onUnmounted } from 'vue';

const props = defineProps(['id', 'data', 'type']);

const emit = defineEmits(['editNode', 'deleteNode']);



const handleEditText = (e) => {
  console.log(e)
  if(e.key == 'enter'){
                    e.preventDefault();

  e.stopPropagation();

  }
  emit('editNode', props.id, props.data.label);
};

    // handleDelete() {
    //   if (this.deleteNode) {
    //     this.deleteNode(this.id);
    //   }
    // }

const handleDelete = (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  emit('deleteNode', props.id);
};

const listen = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
  }
};

onMounted(() => {
  document.addEventListener("keydown", listen);
});

onUnmounted(() => {
  document.removeEventListener("keydown", listen);
});

</script>

<template>
  <div class="rhombus-node"    @click="handleEditText">

    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <button  
      class="delete-btn w-[25px] h-[25px]" 
      @click.stop="handleDelete"
        @mousedown.stop
        @touchstart.stop
      >
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25px" height="25px" viewBox="0,0,256,256">
<g fill="#de4850" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(8.53333,8.53333)"><path d="M13,3c-0.26757,-0.00363 -0.52543,0.10012 -0.71593,0.28805c-0.1905,0.18793 -0.29774,0.44436 -0.29774,0.71195h-5.98633c-0.36064,-0.0051 -0.69608,0.18438 -0.87789,0.49587c-0.18181,0.3115 -0.18181,0.69676 0,1.00825c0.18181,0.3115 0.51725,0.50097 0.87789,0.49587h18c0.36064,0.0051 0.69608,-0.18438 0.87789,-0.49587c0.18181,-0.3115 0.18181,-0.69676 0,-1.00825c-0.18181,-0.3115 -0.51725,-0.50097 -0.87789,-0.49587h-5.98633c0,-0.26759 -0.10724,-0.52403 -0.29774,-0.71195c-0.1905,-0.18793 -0.44836,-0.29168 -0.71593,-0.28805zM6,8v16c0,1.105 0.895,2 2,2h14c1.105,0 2,-0.895 2,-2v-16z"></path></g></g>
</svg>
      </button>
    </div>
    <div class="plus-icon">✍🏻</div>
  </div>
</template>

<style scoped>
.rhombus-node {
  width: 80px;
  height: 80px;
  border: 2px solid #2196F3;
  background: white;
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
}

.delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #fff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transform: rotate(-45deg);
}

.plus-icon {
  position: absolute;
  bottom: -12px;
  right: -12px;
  background: transparent;
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
</style>