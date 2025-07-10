<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import WorkflowEditor from '@/components/WorkflowEditor.vue';
import { debounce } from 'lodash-es';

const router = useRouter();
const route = useRoute();
const workflow = ref({
  id: null,
  name: '',
  nodesCount: '',
  nodes: [],
  edges: []
});

// Load workflow data from localStorage
onMounted(() => {
  const savedWorkflows = JSON.parse(localStorage.getItem('workflows')) || [];
  const foundWorkflow = savedWorkflows.find(w => w.id === parseInt(route.params.id));
  
  if (foundWorkflow) {
    workflow.value = {
      id: foundWorkflow.id,
      name: foundWorkflow.name,
      nodesCount: foundWorkflow.nodesCount,
      nodes: foundWorkflow.nodes ? JSON.parse(JSON.stringify(foundWorkflow.nodes)) : [],
      edges: foundWorkflow.edges ? JSON.parse(JSON.stringify(foundWorkflow.edges)) : []
    };
  } else {
    console.error('Workflow not found');
    router.push('/workflows');
  }
});

function saveWorkflow() {
  const savedWorkflows = JSON.parse(localStorage.getItem('workflows')) || [];
  const index = savedWorkflows.findIndex(w => w.id === workflow.value.id);
  
  if (index !== -1) {
    // Update existing workflow
    savedWorkflows[index] = {
      id: workflow.value.id,
      name: workflow.value.name,
      nodesCount: workflow.value.nodesCount,
      nodes: JSON.parse(JSON.stringify(workflow.value.nodes)),
      edges: JSON.parse(JSON.stringify(workflow.value.edges))
    };
    localStorage.setItem('workflows', JSON.stringify(savedWorkflows));
    alert('Workflow updated successfully!');
    router.push('/workflows');
  } else {
    console.error('Workflow not found for update');
  }
}

// Debounced update function to prevent recursive updates
const updateDiagramData = debounce(({ nodes, edges }) => {
  // Only update if there are actual changes
  if (JSON.stringify(nodes) !== JSON.stringify(workflow.value.nodes) ||
      JSON.stringify(edges) !== JSON.stringify(workflow.value.edges)) {
    workflow.value.nodes = JSON.parse(JSON.stringify(nodes));
    workflow.value.edges = JSON.parse(JSON.stringify(edges));
  }
}, 300);
</script>

<template>
  <div class="workflow-section"> 
    <section class="bg-white dark:bg-gray-900">
      <div class="py-8 px-4 mx-auto lg:py-16">
        <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Edit Workflow
        </h2>
  <form @submit.prevent="saveWorkflow" @click.stop>
          <div class="grid gap-4 mb-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Workflow Name
              </label>
              <input v-model="workflow.name" type="text" id="name" 
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                placeholder="Type workflow name" required>
            </div>
            <div class="sm:col-span-2 mb-5">
              <label for="nodesCount" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                nodes Count
              </label>
              <p id="nodesCount">{{ workflow.nodesCount }}</p>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Workflow Diagram
            </label>
      
              <WorkflowEditor 
                :initial-nodes="workflow.nodes" 
                :initial-edges="workflow.edges"
                @update="updateDiagramData"
              />

          </div>
          
          <button type="submit" class="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
            Update Workflow
          </button>
        </form>
      </div>
    </section>
  </div>
</template>