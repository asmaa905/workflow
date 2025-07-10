<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import WorkflowEditor from '@/components/WorkflowEditor.vue';

const route = useRoute();
const workflow = ref({
  name: '',
  nodesCount: '',
  nodes: [],
  edges: []
});

// Load workflow data from localStorage
onMounted(() => {
  const savedWorkflows = JSON.parse(localStorage.getItem('workflows') || []);
  const foundWorkflow = savedWorkflows.find(w => w.id === parseInt(route.params.id));
  
  if (foundWorkflow) {
    workflow.value = {
      name: foundWorkflow.name,
      nodesCount: foundWorkflow.nodesCount,
      nodes: foundWorkflow.nodes || [],
      edges: foundWorkflow.edges || []
    };
  }
});
</script>

<template>
  <div class="workflow-section">
    <section class="bg-white dark:bg-gray-900 p-3 sm:p-5">
      <div class="mx-auto lg:px-4">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Workflow Review: {{ workflow.name }}
          </h1>
          <router-link to="/workflows" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Back to List
          </router-link>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-2">{{ workflow.name }}</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ workflow.nodesCount }}
          </p>
          
          <div style="height: 500px; width: 100%" class="border rounded-lg">
            <WorkflowEditor 
              :initial-nodes="workflow.nodes" 
              :initial-edges="workflow.edges"
              :readonly="true"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>