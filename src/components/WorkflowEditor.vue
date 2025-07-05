
<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { VueFlow, useVueFlow, Position, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import RhombusNode from './RhombusNode.vue';
import RectangleNode from './RectangleNode.vue';
import { useWorkflowStore } from '@/stores/workflow';
import DotNode from './EndDotNode.vue'
import { Controls } from '@vue-flow/controls'

const workflowStore = useWorkflowStore();
const nodeTypes = {
  rhombus: RhombusNode,
  rectangle: RectangleNode,
  endDot:DotNode,
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
      data: {
          label: '',//1
          child: [],//2
          parent: null,//3
          nextNodeId: 'end',//4
          prevNodeId: null,//5
          endDotId: null,//6
          nextNodeofRhombus: null,//7
          BranchfromRhombus: false,//8
          actualNextNode: 'end',//9
          actualPrevNode: null,//10
          actualId: '1'//11
      },
      position: { x: 100, y: 100 },
      class: 'start-node',
    },
    {
        id: 'end',
        type: 'output',
        data: {
            label: '',
            child: [],
            parent: null,
            nextNodeId: null,
            prevNodeId: '1',
            endDotId: null,
            nextNodeofRhombus: null,
            BranchfromRhombus: false,
            actualNextNode: null,
            actualPrevNode: '1',//10
            actualId: '1'//11
        },
        position: { x: 100, y: 300 },

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
      type: 'smoothstep',
      label: '+',
      markerEnd: {
        type: MarkerType.Dot,
        color: 'yellow',
        width: 10,
        height: 10,
      },
      labelBgStyle: {
        fill: 'rgb(246,246,246)',
        rx: '50%',
        ry: '50%',
        width: '20px',
        height: '20px',
        transform: 'translate(-3px, 0px)', 
      },
      labelStyle: {
        fill: 'rgb(139,143,149)',
        fontWeight: 'bold',
      },
    },
  ],
},
  readonly: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['update']);
const { onInit, addEdges, addNodes, fitView, removeEdges, removeNodes, onConnect } = useVueFlow();

const dark = ref(false);
const activeEdgeId = ref(null);//
const showShapeOptions = ref(false);
const shapeOptionsPosition = ref({ x: 0, y: 0 });
const editingNodeId = ref(null);
const nodeLabel = ref('');
const activeRhombusId = ref(null);
const showRhombusShapeOptions = ref(false);
const rhombusShapeOptionsPosition = ref({ x: 0, y: 0 });

const nodes = computed({
  get: () => workflowStore.nodes,
  set: (value) => workflowStore.setNodes(value)
});
const edges = computed({
  get: () => workflowStore.edges,
  set: (value) => workflowStore.setEdges(value)
});
watch([nodes, edges], () => {
  if (!props.readonly) {
    emit('update', { nodes: workflowStore.nodes, edges: workflowStore.edges });
    
  }
}, { deep: true });
onMounted(() => {
  workflowStore.setNodes([...props.initialNodes]);
  workflowStore.setEdges([...props.initialEdges]);
  nextTick(() => fitView());
});

const extractNodeIdPart = (id) => {
  if (id.includes('-')) {
    const parts = id.split('-');
    if (parts.length >= 2) {
      return parts[1];
    }
  }
  // For simple IDs like "2" or "end"
  return id;
};
const extractFirstParent=(nodeId)=>{
 let actualId,FirstParentId;
  if(nodeId.includes('-')){
    const parts = nodeId.split('-');
    if (parts.length >= 2) {
      actualId =  parts[1];//get id like this  2.1.1.1.1
      if(actualId.includes('.')){
        if(actualId !=='dot.end'){
          const idparts = actualId.split('.');
          if (idparts.length >= 2) {
            FirstParentId =  parts[0];//get first parent of id
          }
        } else {
          FirstParentId = actualId;
        }
      }else{
        FirstParentId = actualId;
      }
  }
  }else if(nodeId =='end'||nodeId=='1') {
    FirstParentId=nodeId
  }else{
    FirstParentId = null
  }
  return FirstParentId;
}

const adjustPostionsAndIds = (newNode) => {
  console.log('newNode', newNode);
          console.log("workflowStore.edges",workflowStore.edges)

  if (newNode.data.parent == null) {
      console.log("workflowStore.nodes",workflowStore.nodes)
      //['1','2','end']
      workflowStore.nodes = workflowStore.nodes.map((node) => {
      // Skip the new node itself and the root node ('1')
      if ( node.id === '1') return node;
      let originalNode = node;

      const nodeParent = extractFirstParent(node.id);
      console.log("nodeParent",nodeParent)//2
      const newNodeParent = extractFirstParent(newNode.id);//2
            console.log("newNodeParent",newNodeParent)//2

      // Case 1: Nodes that need ID and position adjustment
      let newId,partss=[],actualNewNodeId ;


      if (nodeParent && node.id !== 'end' && node.id !== '1') {
        if (parseInt(nodeParent) >= parseInt(newNodeParent)) {
          console.log("nody",node)
          // Adjust the ID by incrementing the first part
          if(extractNodeIdPart(node.id).includes('.')){
             const parts = extractNodeIdPart(node.id).split('.');
             parts[0] = (parseInt(parts[0]) + 1).toString();
             newId = parts.join('.');
          } else{
             newId = (parseInt(nodeParent) + 1).toString();
          }
          //split nodeId and join it

           if(node.id.includes('-')){
            partss = node.id.split('-');
            partss[1] = newId;
            actualNewNodeId = partss.join('-');
           }
          
          // Adjust position
             node.id=actualNewNodeId
            //x: (sourceNode.id=='1'?sourceNode.position.x-39:sourceNode.position.x),

            node.position.x += (newNode.type === 'rectangle' ? 0 : 3);
            node.position.y += (newNode.type === 'rectangle' ? 60 : 300);

           
          // Update any references in edges if needed
          // You might need additional code here to update edge connections
            workflowStore.edges.map((edgee)=>{
              if(extractNodeIdPart(edgee.target)==extractNodeIdPart(originalNode.id)){
                edgee.id=`edge-${edgee.source}-${actualNewNodeId}-${edgee.id.split('-')[edgee.id.split('-').length-1]}`;
                edgee.target=actualNewNodeId
          console.log("any totototo")
                return edgee
              }else if(extractNodeIdPart(edgee.source)==extractNodeIdPart(originalNode.id)){
                edgee.id=`edge-${actualNewNodeId}-${edgee.target}-${edgee.id.split('-')[edgee.id.split('-').length-1]}`
                edgee.source=actualNewNodeId
          console.log("any thingggggggg")
                return edgee
              }else return edgee
            })
          
      
          
          return node;
        }
      }  else if (node.id === 'end') {
            node.position.x += (newNode.type === 'rectangle' ? 0 :3);
      node.position.y += newNode.type=='rectangle'?60:300;
        return  node;
      }
     
      return node;
    });
    console.log('workflowStore.nodes2', workflowStore.nodes);
        console.log("workflowStore.edges2",workflowStore.edges)

    // You might need to update edges here if node IDs changed
    // workflowStore.edges = updateEdges(workflowStore.edges);
  } else {
    // Handle case where newNode has a parent
    // Your logic for when newNode.data.parent exists
  }
};


//when draw edge from two nodes it draw it or make it visible
const onConnectHandler = (params) => {
   /**
    * {
    * "source": "1",
    * "sourceHandle": null,
    * "target": "end",
    * "targetHandle": null
    * }
    */
  // Check if this connection already exists not create edge
const existingEdge = workflowStore.edges.find(e => 
  e.source === params.source && e.target === params.target
);
if (existingEdge) return;

  const newEdge = {
    ...params,
    id: `edge-${params.source}-${params.target}-${Date.now()}`,
    type: 'smoothstep',
    label: '+',
    markerEnd: {
      type: MarkerType.Dot,
      color: 'yellow',
      width: 10,
      height: 10,
    },
    labelBgStyle: {
        fill: 'rgb(246,246,246)',
        rx: '50%',
        ry: '50%',
        width: '20px',
        height: '20px',
                transform: 'translate(-3px, 5px)', 

      },
      labelStyle: {
        fill: 'rgb(139,143,149)',
        fontWeight: 'bold',
        // transform: 'translate(5px, 0px)', 
      },
  };
  addEdges([newEdge]);
  workflowStore.addEdges([newEdge]);
};
const handleEdgeClick = (event) => {
  const edge = event.edge;
  if (!edge) return;

  if (edge.label === '+') {
    workflowStore.edges = workflowStore.edges.map(e => 
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
    workflowStore.edges = workflowStore.edges.map(e => 
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
const addNewNodeFromRhombus=(type='rectangle')=>{

  if (!activeRhombusId.value) return;
  const rhombusNode = workflowStore.nodes.find(n => n.id === activeRhombusId.value);
  if (!rhombusNode) return;
  let targetNodeId='', endNode;
  if(type=='rectangle'){
    const parts = activeRhombusId.value.split('-');
    if (parts.length > 0) {
        if(parts.length >= 3){
          let target = parts[2];
          if(target.includes('.')){
              targetNodeId = target.split('.')[1] //get target
          }else{
            targetNodeId = target
          }
        }
    }
  } else {
    // get start & end node
    endNode = rhombusNode?.endDotId;
    targetNodeId = workflowStore.edges.filter((edge)=>edge.source == endNode).length??
    workflowStore.edges.filter((edge)=>edge.source == endNode)[0].target;
  }
  const outgoingEdges = workflowStore.edges.filter(e => e.source === activeRhombusId.value);
  const newNodePosition = {
    x: rhombusNode.position.x + 200,
    y: rhombusNode.position.y + (outgoingEdges.length * 60)
  };

  let newNodeId;
  let prevId;
  let extractNestedId = extractNodeIdPart(activeRhombusId.value); // e.g., "2.1.1"
    let newRhombusId;

  if(type=='rectangle'){
 if (extractNestedId.includes('.')) {
      const parts = extractNestedId.split('.'); // e.g., ["2", "1", "1"]
      if (parts.length) {
          let lastPrevId = parts[parts.length - 1]; 
          prevId = lastPrevId;
          let actualNodeId = Number(prevId) + 1; 
          let prefixParts = parts.slice(0, -1); // ["2", "1"]

          let finalNodeId = prefixParts.join('.') + '.' + actualNodeId+'.'+outgoingEdges.length +1+'.'+'1'; // "2.1.2 .3.1"
          newRhombusId = finalNodeId;
          newNodeId = `rect-${finalNodeId}-${Date.now()}`;
      }
  } else {
      prevId = extractNestedId;
      newRhombusId = Number(extractNestedId) + 1;
      let newBranchNum = outgoingEdges.length +1
      newNodeId = `rect-${Number(extractNestedId) +'.'+newBranchNum+'.'+'1'}-${Date.now()}`;
  } 
  const rectId = newNodeId;

  const newNode = {
    id: rectId,
    type: 'rectangle',
    data: {
      label: 'Lorem ipsum',
      prevNodeId: rhombusNode.id,
      nextNodeId: rhombusNode.data.endDotId,
      parent: rhombusNode.id,
      child:[],
      endDotId:null,
      nextNodeofRhombus:targetNodeId,
      BranchfromRhombus:true,
      actualNextNode: targetNodeId,
      actualPrevNode: rhombusNode.id
      //next =>child,
      //prev:parent
  },
    position: newNodePosition,
    class:''
  };
  const newEdges = [{
    id: `edge-${rhombusNode.id}-${rectId}-${Date.now()}`,
    source: rhombusNode.id,
    target: rectId,
    type: 'smoothstep', // Explicitly set type
    
    label: '+',
    labelBgStyle: {
        fill: 'rgb(246,246,246)',
        rx: '50%',
        ry: '50%',
        width: '20px',
        height: '20px',
       transform: 'translate(-3px, 5px)', 

      },
      labelStyle: {
        fill: 'rgb(139,143,149)',
        fontWeight: 'bold',
        fontSize:'18px'
      },
  },
    {
      id: `edge-${rectId}-${targetNodeId}-${Date.now()}`,
      source: rectId,
      target: targetNodeId,
      type: 'smoothstep', 
      label: '+',
       labelBgStyle: {
        fill: 'rgb(246,246,246)',
        rx: '50%',
        ry: '50%',
        width: '20px',
        height: '20px',
        transform: 'translate(-3px, 0px)', 

      },
      labelStyle: {
        fill: 'rgb(139,143,149)',
        fontWeight: 'bold',
        fontSize:'18px'
      },
    }];

  addNodes([newNode]);
  addEdges(newEdges);
  workflowStore.addNodes([newNode]);
  workflowStore.addEdges(newEdges);
  }else if(type='rhombus'){
  if (extractNestedId.includes('.')) {
      const parts = extractNestedId.split('.'); // e.g., ["2", "1", "1"]
      if (parts.length) {
          let lastPrevId = parts[parts.length - 1]; // "1"
          prevId = lastPrevId;
          let actualNodeId = Number(prevId) + 1; 
                    let prefixParts = parts.slice(0, -1); // ["2", "1"]
          let finalNodeId = prefixParts.join('.') + '.' + actualNodeId+'.'+outgoingEdges.length +1+'.'+'1'; // "2.1.2 .3.1"
          newRhombusId = finalNodeId;
          newNodeId = `rhombus-${finalNodeId}-t.${endNode}-${Date.now()}`;
      }
  } else {
      prevId = extractNestedId;
      newRhombusId = Number(extractNestedId) + 1;
      newNodeId = `rhombus-${Number(extractNestedId) + 1 +'.'+outgoingEdges.length +1+'.'+'1'}-t.${targetNodeId}-${Date.now()}`;
  }  
  const rhombusId = newNodeId;
  const leftRectId = `rect-${extractNodeIdPart(rhombusId)}.1.1-${Date.now()}`;
  const rightRectId = `rect-${extractNodeIdPart(rhombusId)}.2.1-${Date.now()}`;
  const endDotId = `dot.end-dot.end-r.${rhombusId}-${Date.now()}`;
  const newNodes = [
    {
      id: rhombusId,
      type: 'rhombus',
      data:{
        label: '+',
        prevNodeId: activeRhombusId.value,
        nextNodeId: leftRectId,
        parent: activeRhombusId.value,
        child:[
          leftRectId,
          rightRectId
          //we can in this add 
        ] ,
        endDotId:endDotId,
        nextNodeofRhombus:targetNodeId,  //
        BranchfromRhombus:true ,
        actualNextNode: leftRectId,
        actualPrevNode: activeRhombusId.value
      //next =>child,
      //prev:parent
      },
      
      position: newRhombusPosition,
    },
    {
      id: leftRectId,
      type: 'rectangle',
      data:{
        label: 'Yes',
        prevNodeId: rhombusId,
        nextNodeId: endDotId,//must be dot-node
        parent: rhombusId,
        child:[] ,
        endDotId:null,
        nextNodeofRhombus:targetNodeId,
        BranchfromRhombus:true ,
        actualNextNode: targetNodeId,
        actualPrevNode: rhombusId
      },
      position: { x: newRhombusPosition.x - 100, y: newRhombusPosition.y + 100 },
    },
    {
      id: rightRectId,
      type: 'rectangle',
      data: { label: 'No', 
        prevNodeId: rhombusId,
        nextNodeId: endDotId,//must be dot-node
        parent: rhombusId,
        child:[] ,
        endDotId:null,//for rhombus only
        nextNodeofRhombus:targetNodeId,//for rhombus child only
        BranchfromRhombus:true,
        actualNextNode: targetNodeId,
        actualPrevNode: rhombusId
     },
      position: { x: newRhombusPosition.x + 100, y: newRhombusPosition.y + 100 },
    },
    {
    id: endDotId,
    type: 'endDot', 
    data: { 
          prevNodeId: rhombusId,
          nextNodeId: targetNodeId,//must be dot-node
          parent: rhombusId,
          child:[] ,
          label: '', 
          endDotId:null,//for rhombus only 
          nextNodeofRhombus:targetNodeId,//for rhombus child only
          BranchfromRhombus:true,
          actualNextNode: targetNodeId,
          actualPrevNode: rightRectId   //for rhombus child only  
        },
          position: { x: newRhombusPosition.x, y: newRhombusPosition.y +235},//+25
          class: 'end-dot-node',
          style: {
            width: '20px',
            height: '20px',
            backgroundColor: 'red',
            border: 'none'
          },
          labelStyle: { 
              fill: 'gray', 
              fontSize: '14px', 
              fontWeight: 'bold' 
          },
          labelBgStyle: { 
              fill: 'gray', 
              rx: '0%', 
              ry: '0%', 
              width: '20px', 
              height: '20px',
              transform: 'rotate(45deg)' 
          }
    }
  ];

  const newEdges = [
    {
      id: `edge-${activeRhombusId.value}-${rhombusId}-${Date.now()}`,
      source: activeRhombusId.value,
      target: rhombusId,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: {
        fill: 'rgb(246,246,246)',
        rx: '50%',
        ry: '50%',
        width: '20px',
        height: '20px',
        transform: 'translate(-3px, 5px)', 

      },
    },
    {
      id: `edge-${rhombusId}-${leftRectId}-${Date.now()}`,
      source: rhombusId,
      target: leftRectId,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'},
    },
      {
      id: `edge-${rhombusId}-${rightRectId}-${Date.now()}`,
      source: rhombusId,
      target: rightRectId,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
    },
    {
      id: `edge-${leftRectId}-${endDotId}-${Date.now()}`,
      source: leftRectId,
      target: endDotId,
      type: 'smoothstep',
      
      label: '+',
      labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
    },
    {
      id: `edge-${rightRectId}-${endDotId}-${Date.now()}`,
      source: rightRectId,
      target: endDotId,
      type: 'smoothstep',
      
      label: '+',
      labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
    },
    {
      id: `edge-${endDotId}-${targetNodeId}-${Date.now()}`,
      source: endDotId,
      target: targetNodeId,
      type: 'smoothstep',
      label: '+',
      labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
    }
  ];
  removeEdges([activeEdgeId.value]);
  addNodes(newNodes);
  addEdges(newEdges);
  workflowStore.addNodes(newNodes);
  workflowStore.addEdges(newEdges);
  }
 
  // After adding nodes and edges:
  showRhombusShapeOptions.value = false;
  activeRhombusId.value = null;
  nextTick(() => fitView());
}
const startEditingNode = (nodeId, currentLabel = '') => {
  editingNodeId.value = nodeId;
  nodeLabel.value = currentLabel;
}

const saveNodeLabel = () => {
  if (editingNodeId.value) {
    workflowStore.nodes = workflowStore.nodes.map(n => 
      n.id === editingNodeId.value ? { ...n, data: { ...n.data, label: nodeLabel.value } } : n
    );
    editingNodeId.value = null;
    nodeLabel.value = '';
  }
}
const deleteNode = async  (nodeId) => {
  // Prevent deleting start or end nodes
  if (nodeId === '1' || nodeId === 'end') {
    console.warn('Cannot delete start or end nodes');
    return;
  }
  const nodeToDelete = workflowStore.nodes.find(n => n.id === nodeId);
  if (!nodeToDelete) {
    console.error('Node not found:', nodeId);
    return;
  }
  // Find all edges connected to this node
   const connectedEdges = (workflowStore.edges || []).filter(
    e => e.source === nodeId || e.target === nodeId
  );
  const incomingEdge = workflowStore.edges.find(e => e.target === nodeId);
  const outgoingEdges = workflowStore.edges.filter(e => e.source === nodeId);
  if (nodeToDelete.type === 'rhombus') {
    const branchNodes = outgoingEdges.map(e => e.target);
        for (const branchId of branchNodes) {
      await deleteNode(branchId);
    }
  }
  const previousNode = incomingEdge ? workflowStore.nodes.find(n => n.id === incomingEdge.source) : null;
  const nextNodes = outgoingEdges.map(e => workflowStore.nodes.find(n => n.id === e.target)).filter(Boolean);
  await removeNodes([nodeId]);
  await removeEdges(connectedEdges.map(e => e.id));

  // Reconnect previous node to next nodes if they exist
  if (previousNode && nextNodes.length > 0) {
    const newEdges = nextNodes.map(nextNode => ({
      id: `edge-${previousNode.id}-${nextNode.id}-${Date.now()}`,
      source: previousNode.id,
      target: nextNode.id,
        type: 'smoothstep', // Explicitly set type
      label: '+',
      labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
      labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
    }));
    await addEdges(newEdges)
      await   workflowStore.addEdges(newEdges);

    
  }
  await nextTick();
  fitView();
}
const deleteRhombusNode = async (nodeId) => {
  const nodeToDelete = workflowStore.nodes.find(n => n.id === nodeId);
  
  // Only process if it's a rhombus node
  if (!nodeToDelete || nodeToDelete.type !== 'rhombus') {
    console.error('Node not found or not a rhombus:', nodeId);
    return;
  }

  // Find all edges connected to this node
  const connectedEdges = workflowStore.edges.filter(
    e => e.source === nodeId || e.target === nodeId
  );

  // Find incoming edge (edge where this node is the target)
  const incomingEdge = workflowStore.edges.find(e => e.target === nodeId);
  console.log('Incoming edge to rhombus:', incomingEdge);

  // Find outgoing edges (edges where this node is the source)
  const outgoingEdges = workflowStore.edges.filter(e => e.source === nodeId);
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
  const targetNodeExists = targetNodeId && workflowStore.nodes.some(n => n.id === targetNodeId);
  console.log("Target node exists:", targetNodeExists);
  
  const branchNodes = outgoingEdges.map(e => e.target);
  // Find the previous node (source of incoming edge)
  const previousNode = incomingEdge ? workflowStore.nodes.find(n => n.id === incomingEdge.source) : null;
  
  const nodesToDelete = [nodeId];
  const edgesToDelete = [...(connectedEdges || [])];
  const branchEndNodes = []; 
  
  for (const branchId of branchNodes) {
    let currentNodeId = branchId;
    let lastNodeInBranch = null;
    let branchNodesToDelete = [];
    let branchEdgesToDelete = [];
    
    // Keep track of visited nodes to prevent infinite loops
    const visitedNodes = new Set();
    
    while (currentNodeId && currentNodeId !== 'end' && !visitedNodes.has(currentNodeId)) {
      visitedNodes.add(currentNodeId);
      const node = workflowStore.nodes.find(n => n.id === currentNodeId);
      if (!node) break;
      
      branchNodesToDelete.push(currentNodeId);
      
      // Find outgoing edges from this node
      const outgoing = workflowStore.edges.filter(e => e.source === currentNodeId);
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
      const edge = workflowStore.edges.find(ed => ed.id === id);
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
          type: 'smoothstep', // Explicitly set type
        label: '+',
        labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
        labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
      };
      await addEdges([newEdge])
       await    workflowStore.addEdges([newEdge]);
      
      

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
            type: 'smoothstep', // Explicitly set type
          label: '+',
          labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
          labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
        }));
        await addEdges(newEdges)
          await   workflowStore.addEdges(newEdges);

        
      }
    }
    // 3. Final fallback: Connect to end node if exists
    else if (workflowStore.nodes.some(n => n.id === 'end')) {
      console.log("Connecting to end node");
      const newEdge = {
        id: `edge-${previousNode.id}-end-${Date.now()}`,
        source: previousNode.id,
        target: 'end',
          type: 'smoothstep', // Explicitly set type
        label: '+',
        labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
        labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
      };
      await addEdges([newEdge])
      await workflowStore.addEdges([newEdge]);

    } else {
      console.log("No valid connection points found");
    }
  }
  
  await nextTick();
  fitView();
};

const addNewNode = (fromRhombus = false,type='rectangle')=>{
  
    //currect edge 
    let edge,
      sourceNode,
      targetNode, 
      newNodeId, 
      prevId,
      newAcualNode,
      extractNestedId,
      centerX,
      centerY,
      actualSourceNode ;
    if (!activeEdgeId.value) return;
    edge = workflowStore.edges.find(e => e.id === activeEdgeId.value);
    if (!edge) return;
    sourceNode = workflowStore.nodes.find(n => n.id === edge.source);//
    targetNode = workflowStore.nodes.find(n => n.id === edge.target);
    centerX = (sourceNode.position.x + targetNode.position.x) / 2;
    centerY = (sourceNode.position.y + targetNode.position.y) / 2;
    if(sourceNode.type=='endDot'){
        actualSourceNode = sourceNode.data.prevNodeId // get rhombusNode id
    }else{
      actualSourceNode = extractNodeIdPart(sourceNode.id);// e.g., "2.1.1"
    }
    extractNestedId = actualSourceNode; // e.g., "2.1.1"
    
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
            newNodeId = type=='rectangle'?`rect-${finalNodeId}-${Date.now()}`:
            `rhombus-${finalNodeId}-t.${targetNode.id}-${Date.now()}`;
        }
    } else {
        prevId = extractNestedId;
        newAcualNode = Number(extractNestedId) + 1;
        newNodeId = type=='rectangle'?`rect-${Number(extractNestedId) + 1}-${Date.now()}`:
        `rhombus-${Number(extractNestedId) + 1}-t.${targetNode.id}-${Date.now()}`;
    }
    //remove old empty edges node
    removeEdges([activeEdgeId.value]);  
    let nextNodeOfRect =edge.target.type=='endDot' &&
      workflowStore.edges.filter((edgee)=>edgee.source == edge.target).length?
      workflowStore.edges.filter((edgee)=>edgee.source == edge.target).length[0].target:
      edge.target;

      let prevNodeOfRect =edge.source.type=='endDot' &&
      workflowStore.edges.filter((edgee)=>edgee.target == edge.source).length?
      workflowStore.edges.filter((edgee)=>edgee.source == edge.target).length[0].source:
      edge.target;
    if(type == 'rectangle'){
     //if we add child attributes to store make recursive function to check id of node
      let nodeParent ;
      if(sourceNode.type=='rhombus'){
        nodeParent = sourceNode.id
      }else if(sourceNode.type=='endDot'){
        nodeParent = sourceNode.data.parent  
      }else {
        nodeParent = sourceNode.data.parent  
      }

        const newNode = {  
        id: newNodeId,
        type: 'rectangle',
        data: {
          label: 'Lorem ipsum',
          prevNodeId: sourceNode.id,
          nextNodeId: targetNode.id,//must be dot-node
          actualNextNode:nextNodeOfRect,
          actualPrevNode:prevNodeOfRect,
          parent: nodeParent,//if its parent == ''
          child:[] ,
          endDotId:null,//for rhombus only 
          nextNodeofRhombus:null,//for rhombus child only
          BranchfromRhombus:true,   //for rhombus child only  

        },
          position: {
            x: (sourceNode.id=='1'?sourceNode.position.x-39:sourceNode.position.x),
            y: sourceNode.position.y+75
        }
      }
      const newEdges = [
        {
          id: `edge-${edge.source}-${newNodeId}-${Date.now()}`,
          source: edge.source,
          target: newNodeId,
            type: 'smoothstep', // Explicitly set type
          
          label: '+',
          labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
          labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
        },
        {
          id: `edge-${newNodeId}-${edge.target}-${Date.now()}`,
          source: newNodeId,
          target: edge.target,
            type: 'smoothstep', // Explicitly set type
          
          label: '+',
          labelStyle: { fill: 'rgb(139,143,149)', fontSize: '18px', fontWeight: 'bolder' },
          labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
        }
      ];
      adjustPostionsAndIds(newNode);
      addNodes([newNode]);
  workflowStore.addNodes([newNode]);
      addEdges(newEdges);
      // workflowStore.addNodes([newNode]);
      workflowStore.addEdges(newEdges);
        // adjustNodePositions(newNode, 'down',0,10);
    } else {
        const rhombusId = newNodeId;
        const leftRectId = `rect-${extractNodeIdPart(rhombusId)}.1.1-${Date.now()}`;
        const rightRectId = `rect-${extractNodeIdPart(rhombusId)}.2.1-${Date.now()}`;
        const endDotId = `dot.end-dot.end-r.${rhombusId}-${Date.now()}`;
        console.log("dge.target",edge.target)
        const newNodes = [
          {
            id: rhombusId,
            type: 'rhombus',
            data: { 
              label: '+',
              parent: null,
              child: [ 
                leftRectId, 
                rightRectId
              ],
              endDotId:endDotId,
              prevNodeId: sourceNode.id,
              nextNodeId: leftRectId,
              actualNextNode:leftRectId,
              actualPrevNode:prevNodeOfRect,//must be dot-node
              nextNodeofRhombus:targetNode.id,//for rhombus only
              BranchfromRhombus:false,   //for rhombus child only  
          },
         
            position:  {  x:sourceNode.id=='1'&&targetNode.id=='end'?
            sourceNode.position.x:centerX+18,  y: sourceNode.position.y+80},
          },
          {
            id: leftRectId,
            type: 'rectangle',
            data: { 
              label: 'Yes', 
              parent:  rhombusId, 
              child: [],
              endDotId:null,
              prevNodeId: rhombusId,
              nextNodeId: endDotId,
              actualNextNode:nextNodeOfRect,
              actualPrevNode:rhombusId,
              nextNodeofRhombus:targetNode.id,//for rhombus only
              BranchfromRhombus:true,   //for rhombus child only  
            },
            position: { x: centerX - 100, y: centerY + 140 },
          },
          {
            id: rightRectId,
            type: 'rectangle',
            data: { 
              label: 'No', 
              parent:  rhombusId, 
              child: [],
              endDotId:null,
              prevNodeId: rhombusId,
              nextNodeId: endDotId,
              actualNextNode:nextNodeOfRect,
              actualPrevNode:rhombusId,
              nextNodeofRhombus:targetNode.id,//for rhombus only
              BranchfromRhombus:true,   //for rhombus child only  
           },
            position: {  x:sourceNode.id=='1'&&targetNode.id=='end'? centerX + 40:sourceNode.position.x+90 , y: centerY + 140 },
          },
          {
            id: endDotId,
            type: 'endDot',
            data: { 
              label: '',
              parent:  rhombusId,

              child: [],
              endDotId:null,
              prevNodeId: rightRectId,
              nextNodeId: targetNode.id,
              actualNextNode: targetNode.id,
              actualPrevNode: rightRectId,
              nextNodeofRhombus: targetNode.id,//for rhombus only
              BranchfromRhombus:true,   //for rhombus child only  
            },
            position: {x:sourceNode.id == '1'? sourceNode.position.x+8:centerX+23,  y: sourceNode.position.y+320 },
            class: 'end-dot-node',
          }
        ];

        const newEdges = [
          {
            id: `edge-${edge.source}-${rhombusId}-${Date.now()}`,
            source: edge.source,
            target: rhombusId,
            type: 'smoothstep',
            label: '+',
            labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
            labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
          },
          {
            id: `edge-${rhombusId}-${leftRectId}-${Date.now()}`,
            source: rhombusId,
            target: leftRectId,
            type: 'smoothstep',
            label: '+',
            labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
            labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
          },
          {
            id: `edge-${rhombusId}-${rightRectId}-${Date.now()}`,
            source: rhombusId,
            target: rightRectId,
            type: 'smoothstep',
            label: '+',
            labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
            labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
          },
          {
            id: `edge-${leftRectId}-${endDotId}-${Date.now()}`,
            source: leftRectId,
            target: endDotId,
            type: 'smoothstep',
            
            label: '+',
            labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
            labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
          },
          {
            id: `edge-${rightRectId}-${endDotId}-${Date.now()}`,
            source: rightRectId,
            target: endDotId,
            type: 'smoothstep',
            
            label: '+',
            labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
            labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
          },
          {
            id: `edge-${endDotId}-${edge.target}-${Date.now()}`,
            source: endDotId,
            target: edge.target,
            type: 'smoothstep',
            label: '+',
            labelStyle: { fill: 'rgb(139,143,149)', fontSize: '14px', fontWeight: 'bold' },
            labelBgStyle: {fill: 'rgb(246,246,246)',rx: '50%', ry: '50%', width: '20px',height: '20px', transform: 'translate(-3px, 5px)'}
          }
        ];
        removeEdges([activeEdgeId.value]);
        adjustPostionsAndIds(newNodes[0]);
        addNodes(newNodes);
                workflowStore.addNodes(newNodes);

        addEdges(newEdges);
        workflowStore.addEdges(newEdges);
    }
    showShapeOptions.value = false;
    activeEdgeId.value = null;
  nextTick(() => fitView());
}
watch(() => props.initialNodes, (newNodes) => {
  workflowStore.nodes = [...newNodes];
}, { immediate: true });
watch(() => props.initialEdges, (newEdges) => {
  workflowStore.edges = [...newEdges];
  
}, { immediate: true });
onInit((instance) => {
  workflowStore.setNodes(instance.getNodes.value);
  workflowStore.setEdges(instance.getEdges.value);
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
  :nodes-draggable="true" 
  :nodes-connectable="!readonly" 
  :edges-updatable="!readonly"
  :connection-mode="!readonly ? 'strict' : false"
  @connect="onConnectHandler"
  :connection-radius="20"
  
>    <!-- :default-viewport="{ x: 0, y: 0, zoom: 1 }"
    :fit-view-on-init="true"
    :min-zoom="0.5"
    :max-zoom="1" -->
        <Background variant="lines" />
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
        <button @click="addNewNode(false)" class="shape-option rectangle">
          ▭
        </button>
        <button @click="addNewNode(false,'rhombus')" class="shape-option rhombus">
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
      <div  v-if="showRhombusShapeOptions && !readonly"
        class="shape-options"
        :style="{
          transform: `translate(${rhombusShapeOptionsPosition.x}px,${rhombusShapeOptionsPosition.y}px)`
        }"
      > 
        <button @click="addNewNodeFromRhombus('rectangle')" class="shape-option rectangle">
          ▭
        </button>
        <button @click="addNewNodeFromRhombus('rhombus')" class="shape-option rhombus">
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
       <template #node-value="props">
    </template>
    </VueFlow>
  </div>
</template>
<style scoped>
.basic-flow {
  height: 1000px;
  width: 1000px;
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

/* For regular dot nodes */
.dot-node .vue-flow__label-bg {
  fill: yellow !important;
  rx: 50% !important;
  ry: 50% !important;
  width: 25px !important;
  height: 25px !important;
}

/* For end-dot nodes */
.end-dot-node .vue-flow__label-bg {
  background-color: green !important;
  width: 20px !important;
  height: 20px !important;
  visibility: visible !important;
}
div.vue-flow__node {
  visibility: visible !important;
  pointer-events: all !important;
  z-index: 0 !important;
}
</style>

