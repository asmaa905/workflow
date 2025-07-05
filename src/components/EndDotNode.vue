<script setup>
  const props = defineProps(['id', 'data', 'type']);
  const emit = defineEmits(['editNode', 'deleteNode']);
</script>
<template>
  <div  class="rhombus-node node-container"></div>
</template>
<style scoped>
.rhombus-node {
   width: 15px;
  height: 15px;
  background: #5c5b5b;
  transform: rotate(45deg);

  cursor: pointer;
  transition: all 0.2s ease;
}

</style>