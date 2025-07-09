import { defineStore } from 'pinia';

export const useWorkflowStore = defineStore('workflow', {
    state: () => ({
        workflows: [],
        currentWorkflow: null
    }),
    actions: {
        loadWorkflows() {
            const saved = localStorage.getItem('workflows');
            this.workflows = saved ? JSON.parse(saved) : [];
        },
        saveWorkflows() {
            localStorage.setItem('workflows', JSON.stringify(this.workflows));
        },
        addWorkflow(workflow) {
            this.workflows.push(workflow);
            this.saveWorkflows();
        },
        updateWorkflow(updatedWorkflow) {
            const index = this.workflows.findIndex(w => w.id === updatedWorkflow.id);
            if (index !== -1) {
                this.workflows[index] = updatedWorkflow;
                this.saveWorkflows();
            }
        },
        setCurrentWorkflow(workflow) {
            this.currentWorkflow = workflow;
        }
    }
});