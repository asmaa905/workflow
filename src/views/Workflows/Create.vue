<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import WorkflowEditor from '@/components/WorkflowEditor.vue';
// import NewFlowchart from '@/components/newFlowchart.vue';
// import WorkflowEditorAllEdit from '@/components/WorkflowEditorAllEdit.vue';
import FlowchartEditor from '@/components/FlowchartEditor.vue';

const router = useRouter();
const workflow = ref({
  name: '',
  description: '',
  nodes: [],
  edges: []
});

function saveWorkflow() {
  const savedWorkflows = JSON.parse(localStorage.getItem('workflows')) || [];
   let newId ;
  if(savedWorkflows.length){
    newId = savedWorkflows[savedWorkflows.length - 1 ].id + 1;
  }else {
    newId = 1;
  }
  
  const newWorkflow = {
    id: newId,
    name: workflow.value.name,
    description: workflow.value.description,
    nodes: workflow.value.nodes,
    edges: workflow.value.edges
  };
  
  savedWorkflows.push(newWorkflow);
  localStorage.setItem('workflows', JSON.stringify(savedWorkflows));
  
  alert('Workflow created successfully!');
  router.push('/workflows');
}

function updateDiagramData({ nodes, edges }) {
  workflow.value.nodes = nodes;
  workflow.value.edges = edges;
}
</script>

<template>
  <div class="workflow-section"> 
    <section class="bg-white dark:bg-gray-900">
      <div class="py-8 px-4 mx-auto lg:py-16">
        <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Add New Workflow
        </h2>
        <form @submit.prevent="saveWorkflow">
          <div class="grid gap-4 mb-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Workflow Name
              </label>
              <input v-model="workflow.name" type="text" id="name" 
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                placeholder="Type workflow name" required>
            </div>
            <div class="sm:col-span-2">
              <label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <textarea v-model="workflow.description" id="description" rows="4"
                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Workflow description" required></textarea>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Workflow Diagram
            </label>
            <FlowchartEditor />
          </div>
          
          <button type="submit" class="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
            Save Workflow
          </button>
        </form>
      </div>
    </section>
  </div>
</template>