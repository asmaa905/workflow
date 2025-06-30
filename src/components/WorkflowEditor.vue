
<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { VueFlow, useVueFlow, Position, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import RhombusNode from './RhombusNode.vue';
import RectangleNode from './RectangleNode.vue';
import { markRaw } from 'vue'
import CustomEdge from './customEdge.vue'

// In your workflow editor component
const edgeTypes = {
  custom: markRaw(CustomEdge), // Make sure this matches what you use when creating edges
  // default: markRaw(CustomEdge) // Fallback
};
const nodeTypes = {
  rhombus: RhombusNode,
  rectangle: RectangleNode,
  dot: {
    template: `<div class="dot-node"></div>`,
  }
};
const dotMarker = {
  type: MarkerType.Dot,
  color: '#333',
  width: 10,
  height: 10,
};
const props = defineProps({
  initialNodes: {
    type: Array,
    default: () => [
      {
        id: '1',
        type: 'input',
        data: { label: '' },
       position: { x: 100, y: 100 }, 
        class: 'start-node',
      },
      {
        id: 'end',
        type: 'output',
        data: { label: '' },
        position: { x: 100, y: 350 },
        class: 'end-node',
      }
    ]
  },
initialEdges: {
  type: Array,
  default: () => [
    {
      id: 'e1-end',
      source: '1',
      target: 'end',
        type: 'custom',
      label: '+',
      markerEnd: {
        type: MarkerType.Dot,
        color: 'yellow',
        width: 10,
        height: 10,
      },
      labelBgStyle: {
        fill: '#ccc',
        rx: '50%',
        ry: '50%',
        width: '20px',
        height: '20px',
      },
      labelStyle: {
        fill: 'white',
        fontWeight: 'bold',
      }
    }
  ]
},
  readonly: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['update']);
const { onInit, addEdges, addNodes, fitView, removeEdges, removeNodes, onConnect } = useVueFlow();
const nodes = ref([]);
const edges = ref([]);
const dark = ref(false);
const activeEdgeId = ref(null);//
const showShapeOptions = ref(false);
const shapeOptionsPosition = ref({ x: 0, y: 0 });
const editingNodeId = ref(null);
const nodeLabel = ref('');
const activeRhombusId = ref(null);
const showRhombusShapeOptions = ref(false);
const rhombusShapeOptionsPosition = ref({ x: 0, y: 0 });

const onConnectHandler = (params) => {
  // Check if this connection already exists
  // Add this to your onConnectHandler
const existingEdge = edges.value.find(e => 
  e.source === params.source && e.target === params.target
);
if (existingEdge) return;

  const newEdge = {
    ...params,
    id: `edge-${params.source}-${params.target}-${Date.now()}`,
    type: 'custom',
    label: '+',
    markerEnd: {
      type: MarkerType.Dot,
      color: 'yellow',
      width: 10,
      height: 10,
    },
    labelBgStyle: {
      fill: '#ccc',
      rx: '50%',
      ry: '50%',
      width: '20px',
      height: '20px',
    },
    labelStyle: {
      fill: 'white',
      fontWeight: 'bold',
    }
  };
  addEdges([newEdge]);
};
watch([nodes, edges], () => {
  if (!props.readonly) {
    emit('update', { nodes: nodes.value, edges: edges.value });
  }
}, { deep: true });

onMounted(() => {
  nodes.value = [...props.initialNodes]
  edges.value = [...props.initialEdges]
  nextTick(() => fitView())
})
watch(() => props.initialNodes, (newNodes) => {
  nodes.value = [...newNodes];

}, { immediate: true });
watch(() => props.initialEdges, (newEdges) => {
  edges.value = [...newEdges];
  
}, { immediate: true });

// Add this to see what edges are being created
watch(edges, (newEdges) => {
  console.log('Current edges:', newEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type
  })));
}, { deep: true });
const getNodeId= (nodeId) => {
  
}
const handleEdgeClick = (event) => {
  const edge = event.edge;
  if (!edge) return;

  if (edge.label === '+') {
    edges.value = edges.value.map(e => 
      e.id === edge.id ? { 
        ...e, 
        label: '×',
        labelBgStyle: { ...e.labelBgStyle, fill: 'red' }
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

const handleRhombusClick = (nodeId, event) => {
  if (!props.readonly) {
    activeRhombusId.value = nodeId;
    rhombusShapeOptionsPosition.value = { 
      x: event.clientX - 190, 
      y: event.clientY - 90 
    };
    showRhombusShapeOptions.value = true;
  }
};
const addRectFromRhombus = () => {
  console.log("any thing")
  if (!activeRhombusId.value) return;
  const rhombusNode = nodes.value.find(n => n.id === activeRhombusId.value);
  if (!rhombusNode) return;
 let targetNodeId='';
  if (activeRhombusId.value.includes('-')) {
    const parts = activeRhombusId.value.split('-');
    console.log("parts",parts)
    if (parts.length > 0) {
      if(parts[0] == 'rhombus'){
         console.log("parts[0]",parts[0])
        if(parts.length >= 3){
          let target = parts[2];
          if(target.includes('.')){
            console.log('target.split(".")[1]',target.split('.')[1])
              targetNodeId = target.split('.')[1] //get target
          }
        }
      }
    }
  }
  const outgoingEdges = edges.value.filter(e => e.source === activeRhombusId.value);
  
  const newNodePosition = {
    x: rhombusNode.position.x + 200,
    y: rhombusNode.position.y + (outgoingEdges.length * 60)
  };

  let newNodeId;
  let prevId;
  let extractNestedId = extractNodeIdPart(activeRhombusId.value); // e.g., "2.1.1"
  console.log("extractNestedId",extractNestedId);//3
  let newRhombusId;
  if (extractNestedId.includes('.')) {
      const parts = extractNestedId.split('.'); // e.g., ["2", "1", "1"]
      if (parts.length) {
          let lastPrevId = parts[parts.length - 1]; 
          prevId = lastPrevId;
          console.log('prevId',prevId) 
                let actualNodeId = Number(prevId) + 1; 
                          console.log('actualNodeId',actualNodeId) 

          let prefixParts = parts.slice(0, -1); // ["2", "1"]
                                    console.log('prefixParts',prefixParts) 

          let finalNodeId = prefixParts.join('.') + '.' + actualNodeId+'.'+outgoingEdges.length +1+'.'+'1'; // "2.1.2 .3.1"
          newRhombusId = finalNodeId;
          newNodeId = `rect-${finalNodeId}-${Date.now()}`;
      }
  } else {
    console.log('extractNestedId',extractNestedId)
      prevId = extractNestedId;
      newRhombusId = Number(extractNestedId) + 1;
      let newBranchNum = outgoingEdges.length +1
      newNodeId = `rect-${Number(extractNestedId) +'.'+newBranchNum+'.'+'1'}-${Date.now()}`;
  }
  const rectId = newNodeId;

  const newNode = {
    id: rectId,
    type: 'rectangle',
    data: { label: 'Lorem ipsum', parent: extractNodeIdPart(rhombusNode.id), child: [ extractNodeIdPart(targetNodeId)] },
    position: newNodePosition
  };
  const newEdges = [{
    id: `edge-${rhombusNode.id}-${rectId}`,
    source: rhombusNode.id,
    target: rectId,
    type: 'custom', // Explicitly set type
    markerEnd: dotMarker,
    label: '+',
    labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
    labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
  },
  //new edge from newrect to final target of rhombus, rhombus ther branches can be have retangles or nested rhombus how to handle that and  get 
    {
      id: `edge-${rectId}-${targetNodeId}`,
      source: rectId,
      target: targetNodeId,
      type: 'custom', // Explicitly set type
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }];

  addNodes([newNode]);
  addEdges(newEdges);
  
  showRhombusShapeOptions.value = false;
  activeRhombusId.value = null;
  nextTick(() => fitView());
};

const addRhombusFromRhombus = () => {
  if (!activeRhombusId.value) return;
  const rhombusNode = nodes.value.find(n => n.id === activeRhombusId.value);
  if (!rhombusNode) return;
  
 let targetNodeId='';
  if (activeRhombusId.value.includes('-')) {
    const parts = activeRhombusId.value.split('-');

    if (parts.length > 0) {
      if(parts[0] == 'rhombus'){
        if(parts.length >= 3){
          let target = parts[2];
          if(target.includes('.')){
              targetNodeId = target.split('.')[1] //get target
          }
        }
      }
    }
  }
  const outgoingEdges = edges.value.filter(e => e.source === activeRhombusId.value);// get all branches
  const newRhombusPosition = {
    x: rhombusNode.position.x + 250,
    y: rhombusNode.position.y + (outgoingEdges.length * 100)
  };

  let newNodeId;
  let prevId;
  let extractNestedId = extractNodeIdPart(activeRhombusId.value); // e.g., "2.1.1"
  let newRhombusId;
  if (extractNestedId.includes('.')) {
      const parts = extractNestedId.split('.'); // e.g., ["2", "1", "1"]
      if (parts.length) {
          let lastPrevId = parts[parts.length - 1]; // "1"
          prevId = lastPrevId;
          let actualNodeId = Number(prevId) + 1; // Increment the last part
          
          // Reconstruct the ID with all parts except the last, then append the incremented value
          let prefixParts = parts.slice(0, -1); // ["2", "1"]
          let finalNodeId = prefixParts.join('.') + '.' + actualNodeId+'.'+outgoingEdges.length +1+'.'+'1'; // "2.1.2 .3.1"
          newRhombusId = finalNodeId;
          newNodeId = `rhombus-${finalNodeId}-t.${targetNodeId}-${Date.now()}`;
      }
  } else {
      prevId = extractNestedId;
      newRhombusId = Number(extractNestedId) + 1;
      newNodeId = `rhombus-${Number(extractNestedId) + 1 +'.'+outgoingEdges.length +1+'.'+'1'}-t.${targetNodeId}-${Date.now()}`;
  }
  const rhombusId = newNodeId;
  const leftRectId = `rect-${rhombusId}.1.1-${Date.now()}`;
  const rightRectId = `rect-${rhombusId}.2.1-${Date.now()}`;



  const newNodes = [
    {
      id: rhombusId,
      type: 'rhombus',
      data: { label: '+', parent:  extractNodeIdPart(rhombusNode.id), child: [ extractNodeIdPart(leftRectId), extractNodeIdPart(rightRectId)] },
      position: newRhombusPosition,
    },
    {
      id: leftRectId,
      type: 'rectangle',
      data: { label: 'Yes', parent:  extractNodeIdPart(rhombusId), child:[ extractNodeIdPart(targetNodeId)] },
      position: { x: newRhombusPosition.x - 100, y: newRhombusPosition.y + 100 },
    },
    {
      id: rightRectId,
      type: 'rectangle',
      data: { label: 'No', parent:  extractNodeIdPart(rhombusId), child: [ extractNodeIdPart(targetNodeId)] },
      position: { x: newRhombusPosition.x + 100, y: newRhombusPosition.y + 100 },
    }
  ];

  const newEdges = [
    {
      id: `edge-${rhombusNode.id}-${rhombusId}`,
      source: rhombusNode.id,
      target: rhombusId,
        type: 'custom', // Explicitly set type
      markerEnd: dotMarker,
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    {
      id: `edge-${rhombusId}-${leftRectId}`,
      source: rhombusId,
      target: leftRectId,
        type: 'custom', // Explicitly set type
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    {
      id: `edge-${rhombusId}-${rightRectId}`,
      source: rhombusId,
      target: rightRectId,
        type: 'custom', // Explicitly set type
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }
    ,
    {
      id: `edge-${leftRectId}-${targetNodeId}`,
      source: leftRectId,
      target: targetNodeId,
        type: 'custom', // Explicitly set type
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    {
      id: `edge-${rightRectId}-${targetNodeId}`,
      source: rightRectId,
      target: targetNodeId,
        type: 'custom', // Explicitly set type
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }
    //targetNodeId
  ];

  addNodes(newNodes);
  addEdges(newEdges);
  
  showRhombusShapeOptions.value = false;
  activeRhombusId.value = null;
  nextTick(() => fitView());
};
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
  if (nodeId === '1' || nodeId === 'end') {
    console.warn('Cannot delete start or end nodes');
    return;
  }
  const nodeToDelete = nodes.value.find(n => n.id === nodeId);
  if (!nodeToDelete) {
    console.error('Node not found:', nodeId);
    return;
  }
  // Find all edges connected to this node
   const connectedEdges = (edges.value || []).filter(
    e => e.source === nodeId || e.target === nodeId
  );
  const incomingEdge = edges.value.find(e => e.target === nodeId);
  const outgoingEdges = edges.value.filter(e => e.source === nodeId);
  if (nodeToDelete.type === 'rhombus') {
    const branchNodes = outgoingEdges.map(e => e.target);
        for (const branchId of branchNodes) {
      await deleteNode(branchId);
    }
  }
  const previousNode = incomingEdge ? nodes.value.find(n => n.id === incomingEdge.source) : null;
  const nextNodes = outgoingEdges.map(e => nodes.value.find(n => n.id === e.target)).filter(Boolean);
  await removeNodes([nodeId]);
  await removeEdges(connectedEdges.map(e => e.id));

  // Reconnect previous node to next nodes if they exist
  if (previousNode && nextNodes.length > 0) {
    const newEdges = nextNodes.map(nextNode => ({
      id: `edge-${previousNode.id}-${nextNode.id}-${Date.now()}`,
      source: previousNode.id,
      target: nextNode.id,
        type: 'custom', // Explicitly set type
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }));
    await addEdges(newEdges);
  }
  await nextTick();
  fitView();
}
const deleteRhombusNode = async (nodeId) => {
  const nodeToDelete = nodes.value.find(n => n.id === nodeId);
  
  // Only process if it's a rhombus node
  if (!nodeToDelete || nodeToDelete.type !== 'rhombus') {
    console.error('Node not found or not a rhombus:', nodeId);
    return;
  }

  // Find all edges connected to this node
  const connectedEdges = edges.value.filter(
    e => e.source === nodeId || e.target === nodeId
  );

  // Find incoming edge (edge where this node is the target)
  const incomingEdge = edges.value.find(e => e.target === nodeId);
  console.log('Incoming edge to rhombus:', incomingEdge);

  // Find outgoing edges (edges where this node is the source)
  const outgoingEdges = edges.value.filter(e => e.source === nodeId);
  console.log('Outgoing edges from rhombus:', outgoingEdges);

  console.log("Processing rhombus node deletion");
  
  // Extract target node ID from rhombus ID (format: rhombus-{id}-t.{targetId}-{timestamp})
  let targetNodeId = null;
if (nodeId.includes('-t.')) {
  const match = nodeId.match(/-t\.([^-]+)/);
  if (match) targetNodeId = match[1];
}
  console.log("Target node ID:", targetNodeId);
  
  // Validate if target node exists
  const targetNodeExists = targetNodeId && nodes.value.some(n => n.id === targetNodeId);
  console.log("Target node exists:", targetNodeExists);
  
  const branchNodes = outgoingEdges.map(e => e.target);
  // Find the previous node (source of incoming edge)
  const previousNode = incomingEdge ? nodes.value.find(n => n.id === incomingEdge.source) : null;
  
  // Collect all nodes to be deleted (rhombus and its branches)
  const nodesToDelete = [nodeId];
  const edgesToDelete = [...(connectedEdges || [])];
  // For each branch, find all nodes in the branch and add them to nodesToDelete
  const branchEndNodes = []; // Nodes that connect back to the main flow
  
  for (const branchId of branchNodes) {
    let currentNodeId = branchId;
    let lastNodeInBranch = null;
    let branchNodesToDelete = [];
    let branchEdgesToDelete = [];
    
    // Keep track of visited nodes to prevent infinite loops
    const visitedNodes = new Set();
    
    while (currentNodeId && currentNodeId !== 'end' && !visitedNodes.has(currentNodeId)) {
      visitedNodes.add(currentNodeId);
      const node = nodes.value.find(n => n.id === currentNodeId);
      if (!node) break;
      
      branchNodesToDelete.push(currentNodeId);
      
      // Find outgoing edges from this node
      const outgoing = edges.value.filter(e => e.source === currentNodeId);
      branchEdgesToDelete.push(...outgoing);
      
      // Check if any outgoing edge connects to the target node
      const connectsToTarget = outgoing.some(e => e.target === targetNodeId);
      
      if (connectsToTarget) {
        lastNodeInBranch = node;
        break;
      }
      
      // Otherwise move to the next node in the branch
      if (outgoing.length > 0) {
        currentNodeId = outgoing[0].target;
      } else {
        break;
      }
    }
    
    // Add branch nodes to deletion (they're part of the rhombus structure)
    nodesToDelete.push(...branchNodesToDelete);
    edgesToDelete.push(...branchEdgesToDelete);
    
    if (lastNodeInBranch) {
      branchEndNodes.push(lastNodeInBranch);
    }
  }
  
  console.log('Branch end nodes:', branchEndNodes);
  
  // Filter out any potential end node that might have been added
  const filteredNodesToDelete = nodesToDelete.filter(id => id !== 'end');
  // Filter out edges connected to end node
  const filteredEdgesToDelete = edgesToDelete
    .map(e => e.id)
    .filter(id => {
      const edge = edges.value.find(ed => ed.id === id);
      return edge && edge.target !== 'end';
    });
  
  // Remove the rhombus and all its branches (excluding end node)
  await removeNodes(filteredNodesToDelete);
  await removeEdges(filteredEdgesToDelete);
  
  // Reconnect the flow
  if (previousNode) {
    // 1. First priority: Connect to targetNode if it exists
    if (targetNodeExists) {
      console.log("Connecting directly to target node");
      const newEdge = {
        id: `edge-${previousNode.id}-${targetNodeId}-${Date.now()}`,
        source: previousNode.id,
        target: targetNodeId,
          type: 'custom', // Explicitly set type
        label: '+',
        labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
        labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
      };
      await addEdges([newEdge]);
    }
    // 2. Second priority: Connect to branch end nodes if they exist
    else if (branchEndNodes.length > 0) {
      console.log("Connecting to branch end nodes");
      // Filter out any null/undefined branch end nodes
      const validBranchEndNodes = branchEndNodes.filter(n => n && n.id !== 'end');
      if (validBranchEndNodes.length > 0) {
        const newEdges = validBranchEndNodes.map(endNode => ({
          id: `edge-${previousNode.id}-${endNode.id}-${Date.now()}`,
          source: previousNode.id,
          target: endNode.id,
            type: 'custom', // Explicitly set type
          label: '+',
          labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
          labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
        }));
        await addEdges(newEdges);
      }
    }
    // 3. Final fallback: Connect to end node if exists
    else if (nodes.value.some(n => n.id === 'end')) {
      console.log("Connecting to end node");
      const newEdge = {
        id: `edge-${previousNode.id}-end-${Date.now()}`,
        source: previousNode.id,
        target: 'end',
          type: 'custom', // Explicitly set type
        label: '+',
        labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
        labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
      };
      await addEdges([newEdge]);
    } else {
      console.log("No valid connection points found");
    }
  }
  
  await nextTick();
  fitView();
};
const addRhombusNewNode = () => {
  if (!activeEdgeId.value) return;
  const edge = edges.value.find(e => e.id === activeEdgeId.value);
  if (!edge) return;

  const sourceNode = nodes.value.find(n => n.id === edge.source);
  const targetNode = nodes.value.find(n => n.id === edge.target);
  const centerX = (sourceNode.position.x + targetNode.position.x) / 2;
  const centerY = (sourceNode.position.y + targetNode.position.y) / 2;

  let newNodeId;
  let prevId;
  let extractNestedId = extractNodeIdPart(sourceNode.id);
  let newRhombusId;
  
  if (extractNestedId.includes('.')) {
    const parts = extractNestedId.split('.');
    if (parts.length) {
      let lastPrevId = parts[parts.length - 1];
      prevId = lastPrevId;
      let actualNodeId = Number(prevId) + 1;
      let prefixParts = parts.slice(0, -1);
      let finalNodeId = prefixParts.join('.') + '.' + actualNodeId;
      newRhombusId = finalNodeId;
      newNodeId = `rhombus-${finalNodeId}-t.${targetNode.id}-${Date.now()}`;
    }
  } else {
    prevId = extractNestedId;
    newRhombusId = Number(extractNestedId) + 1;
    newNodeId = `rhombus-${Number(extractNestedId) + 1}-t.${targetNode.id}-${Date.now()}`;
  }

  const rhombusId = newNodeId;
  const leftRectId = `rect-${rhombusId}.1.1-${Date.now()}`;
  const rightRectId = `rect-${rhombusId}.2.1-${Date.now()}`;
  const startDotId = `${rhombusId}.dot-start`;
  const endDotId = `${rhombusId}.dot-end`;
console.log("dge.target",edge.target)
  const newNodes = [
    
    // Rhombus node
    {
      id: rhombusId,
      type: 'rhombus',
      data: { label: '+', parent:  extractNodeIdPart(sourceNode.id), child: [ extractNodeIdPart(leftRectId),  extractNodeIdPart(rightRectId)] },
      position: { x: centerX, y: centerY },
    },
    // Start dot (before branches)
    {
      id: startDotId,
      type: 'dot',
      data: { label: 'soso' },
      position: { x: centerX, y: centerY +20 },
        class: 'dot-node', // Add CSS class

         labelStyle: { fill: 'red', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: 'green', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    // Left branch (Yes)
    {
      id: leftRectId,
      type: 'rectangle',
      data: { label: 'Yes', parent:  extractNodeIdPart(rhombusId), child: [ extractNodeIdPart(edge.target)] },
      position: { x: centerX - 150, y: centerY + 100 },
    },
    // Right branch (No)
    {
      id: rightRectId,
      type: 'rectangle',
      data: { label: 'No', parent:  extractNodeIdPart(rhombusId), child: [ extractNodeIdPart(edge.target)] },
      position: { x: centerX + 150, y: centerY + 100 },
    },
    // End dot (after branches merge)
    {
      id: endDotId,
      type: 'dot',
      data: { label: 'soso' },
      position: { x: centerX, y: centerY + 200 },
        class: 'dot-node' // Add CSS class

      //    labelStyle: { fill: 'red', fontSize: '14px', fontWeight: 'bold' },
      // labelBgStyle: { fill: 'green', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }
  ];

  const newEdges = [

    // Edge from start dot to rhombus
    {
        id: `edge-${edge.source}-${rhombusId}`,
      source: edge.source,
      target: rhombusId,
      type: 'custom',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
        // Edge from source to start dot

        {
      id: `edge-${rhombusId}-${startDotId}`,
      source: rhombusId,
      target: startDotId,
      type: 'custom',
      // markerEnd: dotMarker,
      label: '',
      // labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      // labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    // Left branch edge
    {
      id: `edge-${startDotId}-${leftRectId}`,
      source: startDotId,
      target: leftRectId,
      type: 'custom',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    // Right branch edge
    {
      id: `edge-${startDotId}-${rightRectId}`,
      source: startDotId,
      target: rightRectId,
      type: 'custom',
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    // Left branch to end dot
    {
      id: `edge-${leftRectId}-${endDotId}`,
      source: leftRectId,
      target: endDotId,
      type: 'custom',
      markerStart: dotMarker,
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    // Right branch to end dot
    {
      id: `edge-${rightRectId}-${endDotId}`,
      source: rightRectId,
      target: endDotId,
      type: 'custom',
      markerStart: dotMarker,
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    // End dot to original target
    {
      id: `edge-${endDotId}-${edge.target}`,
      source: endDotId,
      target: edge.target,
      type: 'custom',
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

const extractNodeIdPart = (id) => {
  console.log("extractNodeIdPart id",id)
  if (id.includes('-')) {
    const parts = id.split('-');
    if (parts.length >= 2) {
      return parts[1];
    }
  }
  // For simple IDs like "2" or "end"
  return id;
};
const splitNodeNestedIdPart = (nestedId) => {
  if (nestedId.includes('.')) {
    const parts = nestedId.split('.');
    if (parts.length ) {
      return parts[parts.length -1];
    }
  }
  // For simple IDs like "2" or "end"
  return nestedId;
};
const addRectNewNode = (fromRhombus = false) => {
  if (!activeEdgeId.value) return;
  const edge = edges.value.find(e => e.id === activeEdgeId.value);
  if (!edge) return;
  const sourceNode = nodes.value.find(n => n.id === edge.source);
  const targetNode = nodes.value.find(n => n.id === edge.target);
 //get rectangle node
  let newNodeId;
  let prevId,newAcualNode;
  let extractNestedId = extractNodeIdPart(sourceNode.id); // e.g., "2.1.1"
  if (extractNestedId.includes('.')) {
      const parts = extractNestedId.split('.'); // e.g., ["2", "1", "1"]
      if (parts.length) {
          let lastPrevId = parts[parts.length - 1]; // "1"
          prevId = lastPrevId;
          let actualNodeId = Number(prevId) + 1; // Increment the last part
          
          // Reconstruct the ID with all parts except the last, then append the incremented value
          let prefixParts = parts.slice(0, -1); // ["2", "1"]
          let finalNodeId = prefixParts.join('.') + '.' + actualNodeId; // "2.1.2"
                newAcualNode =finalNodeId;

          newNodeId = `rect-${finalNodeId}-${Date.now()}`;
      }
  } else {
      prevId = extractNestedId;
      newAcualNode = Number(extractNestedId) + 1;
      newNodeId = `rect-${Number(extractNestedId) + 1}-${Date.now()}`;
  }
  console.log('sourceNode.position.x',sourceNode.position.x);
    console.log('sourceNode.position.y ',sourceNode.position.y )

  //remove old empty edges node

  removeEdges([activeEdgeId.value]);
  
  //create rectangle node
  const newNode = {  
    id: newNodeId,
    type: 'rectangle',
    data: {
      label: 'Lorem ipsum',
      acualNodeId:newAcualNode, 
      parent: extractNodeIdPart(sourceNode.id),
      child:[ extractNodeIdPart(edge.target)]},
      position: {
        x: (sourceNode.id == '1'?sourceNode.position.x - 37:sourceNode.position.x ),
        y: (sourceNode.position.y + targetNode.position.y) / 2
    }
  }
  const newEdges = [
    {
      id: `edge-${edge.source}-${newNodeId}`,
      source: edge.source,
      target: newNodeId,
        type: 'custom', // Explicitly set type
      markerEnd: dotMarker,
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    {
      id: `edge-${newNodeId}-${edge.target}`,
      source: newNodeId,
      target: edge.target,
        type: 'custom', // Explicitly set type
      markerStart: dotMarker,
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }
  ];
  addNodes([newNode]);
  addEdges(newEdges);
  showShapeOptions.value = false;
  activeEdgeId.value = null;
  nextTick(() => fitView());
}
const getNextNodeId = (prevNode)=>{
  console.log('prevNode',prevNode)
  let newNodeId;
  let prevId,newAcualNode;
  let extractNestedId = extractNodeIdPart(prevNode.id); // e.g., "2.1.1"
  if(prevNode)
  if (extractNestedId.includes('.')) {
      const parts = extractNestedId.split('.'); // e.g., ["2", "1", "1"]
      if (parts.length) {
          let lastPrevId = parts[parts.length - 1]; // "1"
          prevId = lastPrevId;
          let actualNodeId = Number(prevId) + 1; // Increment the last part
          // Reconstruct the ID with all parts except the last, then append the incremented value
          let prefixParts = parts.slice(0, -1); // ["2", "1"]
          let finalNodeId = prefixParts.join('.') + '.' + actualNodeId; // "2.1.2"
          newAcualNode =finalNodeId;
      }
  } else {
      prevId = extractNestedId;
      newAcualNode = Number(extractNestedId) + 1;
  }
}
const addNodeFromEdge = (fromRhombus = false,type='rhombus') => {
  if (!activeEdgeId.value) return;
  const edge = edges.value.find(e => e.id === activeEdgeId.value);
  if (!edge) return;
  const sourceNode = nodes.value.find(n => n.id === edge.source);
  const targetNode = nodes.value.find(n => n.id === edge.target);

  removeEdges([activeEdgeId.value]);
  //create rectangle node
  const newNode = {  
    id: newNodeId,
    type: 'rectangle',
    data: {
      label: 'Lorem ipsum',
      acualNodeId:newAcualNode, 
      parent: extractNodeIdPart(sourceNode.id),
      child:[ extractNodeIdPart(edge.target)]},
      position: {
        x: (sourceNode.id == '1'?sourceNode.position.x - 37:sourceNode.position.x ),
        y: (sourceNode.position.y + targetNode.position.y) / 2
    }
  }
  const newEdges = [
    {
      id: `edge-${edge.source}-${newNodeId}`,
      source: edge.source,
      target: newNodeId,
        type: 'custom', // Explicitly set type
      markerEnd: dotMarker,
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    },
    {
      id: `edge-${newNodeId}-${edge.target}`,
      source: newNodeId,
      target: edge.target,
        type: 'custom', // Explicitly set type
      markerStart: dotMarker,
      label: '+',
      labelStyle: { fill: 'white', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#ccc', rx: '50%', ry: '50%', width: '25px', height: '25px' }
    }
  ];
  addNodes([newNode]);
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
      :edge-types="edgeTypes"
      @edge-click="handleEdgeClick"
      :nodes-draggable="!readonly"
      :nodes-connectable="!readonly" 
      :edges-updatable="!readonly"
      :connection-mode="!readonly ? 'strict' : false"
      @connect="onConnectHandler"
      :connection-radius="20"
    >
      <Background pattern-color="#aaa" :gap="16" />
      <div v-if="editingNodeId" class="node-edit-modal">
        <input v-model="nodeLabel" class="node-label-input" />
        <button @click="saveNodeLabel" class="save-label-btn">Save</button>
      </div>      
      <!-- Shape selection options -->
        <div   v-if="showShapeOptions && !readonly"
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
      <!-- Shape selection options for rhombus nodes -->
      <div  v-if="showRhombusShapeOptions && !readonly"
        class="shape-options"
        :style="{
          transform: `translate(${rhombusShapeOptionsPosition.x}px,${rhombusShapeOptionsPosition.y}px)`
        }"
      > 
        <button @click="addRectFromRhombus()" class="shape-option rectangle">
          ▭
        </button>
        <button @click="addRhombusFromRhombus()" class="shape-option rhombus">
          ◇
        </button>
        <button @click="showRhombusShapeOptions = false" class="shape-option close">
          ×
        </button>
      </div>
      <template #node-rhombus="props">
        <RhombusNode 
          v-bind="props" 
          @editNode="startEditingNode" 
          @deleteNode="(id) => !readonly && deleteRhombusNode(id)"
          @edge-click="(id, event) => !readonly && handleRhombusClick(id, event)"
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
  background: #fff;
  position: relative;
}



.edge-identifier {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #ddd;
  transform-origin: center center;
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
.vue-flow__edge-path {
  stroke: #333;
  stroke-width: 2;
  fill: none;
}


.edge-identifier {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #ddd;
  transform-origin: center center;
}
.dot-node {
  width: 8px !important;
  height: 8px !important;
  fill: green !important;
  /* stroke: yellow !important; */
  background-color: red !important;
  border-radius: 50% !important;
  border: none !important;
  transform: translate(-4px, -4px) !important;
}
</style>

