<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MarkerType } from '@vue-flow/core'
import { initialEdges, initialNodes } from './initial-elements.js'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import RhombusNode from './RhombusNode.vue';
import RectangleNode from './RectangleNode.vue';


const props = defineProps({
  initialNodes: {
    type: Array,
    default: () => [
      {
        id: '1',
        type: 'input',
        data: { label: '' },
        position: { x: 250, y: 0 },
        class: 'start-node',
      },
      {
        id: '2',
        type: 'output',
        data: { label: '' },
        position: { x: 250, y: 250 },
        class: 'end-node',
      }
    ]
  },
  initialEdges: {
    type: Array,
    default: () => [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
        label: '+',
        labelBgStyle: {
          fill: '#ccc',
          rx: '50%',
          ry: '50%',
          width: '20px',
          height: '20px',
          transform: 'translate(-9px,-6px)'
        },
        labelStyle: {
          dominantBaseline: 'middle',
          textAnchor: 'middle',
          fill: 'white',
          fontWeight: 'bold',
          transform: 'translateY(-5px)'
        },
        class: "custom-node"
      }
    ]
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update']);

const { onInit, addEdges, addNodes, fitView, removeEdges, removeNodes, onConnect } = useVueFlow()

const nodes = ref([]);
const edges = ref([]);
const dark = ref(false);
const activeEdgeId = ref(null);
const showShapeOptions = ref(false);
const shapeOptionsPosition = ref({ x: 0, y: 0 });
const editingNodeId = ref(null);
const nodeLabel = ref('');

const nodeTypes = {
  rhombus: RhombusNode,
  rectangle: RectangleNode
};

// Add this connection handler
const onConnectHandler = (params) => {
  const newEdge = {
    ...params,
    id: `edge-${params.source}-${params.target}-${Date.now()}`,
    type: 'smoothstep',
    label: '+',
    labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
    labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
  };
  addEdges([newEdge]);
};

// Watch for changes in nodes and edges and emit them
watch([nodes, edges], () => {
  if (!props.readonly) {
    emit('update', { nodes: nodes.value, edges: edges.value });
  }
}, { deep: true });

// Rest of your existing code...

// Initialize with props when component mounts

onMounted(() => {
  nodes.value = [...props.initialNodes];
  edges.value = [...props.initialEdges];
  nextTick(() => fitView());
});
// Watch for changes in props (in case they update after mount)
watch(() => props.initialNodes, (newNodes) => {
  nodes.value = [...newNodes];
  
}, { immediate: true });
// Watch for changes in props (in case they update after mount)
watch(() => props.initialEdges, (newEdges) => {
  edges.value = [...newEdges];
  
}, { immediate: true });


// Handle edge click
const handleEdgeClick = (event) => {
  const edge = event.edge;
  if (!edge) return;

  if (edge.label === '+') {
    edges.value = edges.value.map(e => 
      e.id === edge.id ? { 
        ...e, 
        label: '×',
        labelBgStyle: { ...e.labelBgStyle, fill: 'rgb(255, 0, 60)' }
      } : e
    );
    
    activeEdgeId.value = edge.id;
    shapeOptionsPosition.value = { x: (event.event.clientX - 190), y: event.event.clientY - 90 };
    showShapeOptions.value = true;
  } else if (edge.label === '×') {
    edges.value = edges.value.map(e => 
      e.id === edge.id ? { 
        ...e,   
        label: '+',
        labelBgStyle: { ...e.labelBgStyle, fill: '#ccc' }
      } : e
    );
    showShapeOptions.value = false;
    activeEdgeId.value = null;
  }
}

const startEditingNode = (nodeId, currentLabel = '') => {
  editingNodeId.value = nodeId;
  nodeLabel.value = currentLabel;
}

const saveNodeLabel = () => {
  if (editingNodeId.value) {
    nodes.value = nodes.value.map(n => 
      n.id === editingNodeId.value ? { ...n, data: { ...n.data, label: nodeLabel.value } } : n
    );
    editingNodeId.value = null;
    nodeLabel.value = '';
  }
}
const deleteNode = async (nodeId) => {
  // Prevent deleting start or end nodes
  if (nodeId === '1' || nodeId === '2') {
    console.warn('Cannot delete start or end nodes');
    return;
  }

  // Find the node to be deleted
  const nodeToDelete = nodes.value.find(n => n.id === nodeId);
  if (!nodeToDelete) {
    console.error('Node not found:', nodeId);
    return;
  }

  // Find all edges connected to this node
  const connectedEdges = edges.value.filter(
    e => e.source === nodeId || e.target === nodeId
  );

  // find incoming edge (edge where this node is the target)
  const incomingEdge = edges.value.find(e => e.target === nodeId);
  // find outgoing edges (edges where this node is the source)
  const outgoingEdges = edges.value.filter(e => e.source === nodeId);

  // special handling for rhombus nodes
  if (nodeToDelete.type === 'rhombus') {
    // Find all nodes connected to this rhombus (branches)
    const branchNodes = outgoingEdges.map(e => e.target);
    
    // Recursively delete all branch nodes
    for (const branchId of branchNodes) {
      await deleteNode(branchId);
    }
  }

  // Find the previous node (source of incoming edge)
  const previousNode = incomingEdge ? nodes.value.find(n => n.id === incomingEdge.source) : null;
  
  // Find next nodes (targets of outgoing edges)
  const nextNodes = outgoingEdges.map(e => nodes.value.find(n => n.id === e.target)).filter(Boolean);

  // Remove the node and its connected edges
  await removeNodes([nodeId]);
  await removeEdges(connectedEdges.map(e => e.id));

  // Reconnect previous node to next nodes if they exist
  if (previousNode && nextNodes.length > 0) {
    const newEdges = nextNodes.map(nextNode => ({
      id: `edge-${previousNode.id}-${nextNode.id}-${Date.now()}`,
      source: previousNode.id,
      target: nextNode.id,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }));

    await addEdges(newEdges);
  }
  

  await nextTick();
  fitView();
}
const addRhombusNewNode = () => {
  if (!activeEdgeId.value) return;
  const edge = edges.value.find(e => e.id === activeEdgeId.value);
  if (!edge) return;

  const sourceNode = nodes.value.find(n => n.id === edge.source);
  const targetNode = nodes.value.find(n => n.id === edge.target);
  const centerX = (sourceNode.position.x + targetNode.position.x) / 2;
  const centerY = (sourceNode.position.y + targetNode.position.y) / 2;

  const rhombusId = `rhombus-${Date.now()}`;
  const leftRectId = `rect-left-${Date.now()}`;
  const rightRectId = `rect-right-${Date.now()}`;

  const newNodes = [
    {
      id: rhombusId,
      type: 'rhombus',
      data: { label: 'Condition' },
      position: { x: centerX, y: centerY },
    },
    {
      id: leftRectId,
      type: 'rectangle',
      data: { label: 'Yes' },
      position: { x: centerX - 150, y: centerY },
    },
    {
      id: rightRectId,
      type: 'rectangle',
      data: { label: 'No' },
      position: { x: centerX + 150, y: centerY },
    }
  ];

  const newEdges = [
    {
      id: `edge-${edge.source}-${rhombusId}`,
      source: edge.source,
      target: rhombusId,
      type: 'smoothstep'
    },
    {
      id: `edge-${rhombusId}-${leftRectId}-left`,
      source: rhombusId,
      target: leftRectId,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    {
      id: `edge-${rhombusId}-${rightRectId}-right`,
      source: rhombusId,
      target: rightRectId,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    {
      id: `edge-${leftRectId}-${edge.target}`,
      source: leftRectId,
      target: edge.target,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    {
      id: `edge-${rightRectId}-next-${Date.now()}`,
      source: rightRectId,
      target: edge.target,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }
  ];

  removeEdges([activeEdgeId.value]);
  addNodes(newNodes);
  addEdges(newEdges);

  showShapeOptions.value = false;
  activeEdgeId.value = null;
  nextTick(() => fitView());
};

const addRectNewNode = () => {
  if (!activeEdgeId.value) return;
  const edge = edges.value.find(e => e.id === activeEdgeId.value);
  if (!edge) return;
  
  const sourceNode = nodes.value.find(n => n.id === edge.source);
  const targetNode = nodes.value.find(n => n.id === edge.target);
  const newNodeId = `node-${Date.now()}`;
  
  const newNode = {
    id: newNodeId,
    type: 'rectangle',
    data: { label: 'Step' },
    position: {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2
    }
  }

  removeEdges([activeEdgeId.value]);
  addNodes([newNode]);
  
  const newEdges = [
    {
      id: `edge-${edge.source}-${newNodeId}`,
      source: edge.source,
      target: newNodeId,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    {
      id: `edge-${newNodeId}-${edge.target}`,
      source: newNodeId,
      target: edge.target,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }
  ];
  
  addEdges(newEdges);
  showShapeOptions.value = false;
  activeEdgeId.value = null;
  nextTick(() => fitView());
}
onInit((instance) => {
  instance.fitView();
});
</script>

<template>
  <div>
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :class="{ dark }"
      class="basic-flow"
      :node-types="nodeTypes"
      @edge-click="handleEdgeClick"
      :nodes-draggable="!readonly"
      :nodes-connectable="!readonly" 
      :edges-updatable="!readonly"
        :connection-mode="!readonly ? 'strict' : false"
      @connect="onConnectHandler"
      :connection-radius="20"
    >
      <Background pattern-color="#aaa" :gap="16" />
      <!-- Rest of your template -->
     <!-- Rest of your template... -->
   
      <!-- Node edit modal -->
      <div v-if="editingNodeId" class="node-edit-modal">
        <input v-model="nodeLabel" class="node-label-input" />
        <button @click="saveNodeLabel" class="save-label-btn">Save</button>
      </div>      
       
      <!-- Shape selection options -->
      <div 
        v-if="showShapeOptions && !readonly"
        class="shape-options"
        :style="{
          transform: `translate(${shapeOptionsPosition.x}px,${shapeOptionsPosition.y}px)`
        }"
      > 
        <button @click="addRectNewNode()" class="shape-option rectangle">
          ▭
        </button>
        <button @click="addRhombusNewNode()" class="shape-option rhombus">
          ◇
        </button>
        <button @click="showShapeOptions = false" class="shape-option close">
          ×
        </button>
      </div>

     <template #node-rectangle="props">
        <RectangleNode 
          v-bind="props" 
          @editNode="startEditingNode" 
          @deleteNode="(id) => !readonly && deleteNode(id)"
          @click.stop
        />
      </template>

      <template #node-rhombus="props">
        <RhombusNode 
          v-bind="props" 
          @editNode="startEditingNode" 
          @deleteNode="(id) => !readonly && deleteNode(id)"
          @click.stop
        />
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.basic-flow {
  height: 100vh;
  width: 100vw;
}

.shape-options {
  position: absolute;
  gap: 10px;
  background: rgba(255, 255, 255, 0.01);
  padding: 8px;
  z-index: 10;
}

.shape-option {
  width: 30px;
  height: 30px;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #ccc;
  background: white;
  font-size: 16px;
  margin: 5px 0;
}

.shape-option:hover {
  background: #f0f0f0;
}

.shape-option.rectangle {
  font-size: 14px;
}

.shape-option.rhombus {
  font-size: 18px;
}

.shape-option.close {
  color: rgb(255, 0, 60);
}

.node-edit-modal {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 100;
  display: flex;
  gap: 5px;
}

.node-label-input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.save-label-btn {
  padding: 5px 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
</style>