<template>
  <div class="basic-flow">
    <div class="controls flex gap-2 ">
  <button @click="zoomIn">Zoom In +</button>
  <button @click="zoomOut">Zoom Out -</button>
  <button @click="fitToWindow">Fit to Window</button>
      </div>
    <div  ref="diagramDiv" style="width:100%; height:100%;  overflow:auto;"></div>

    <AddButton
    @close="handleCloseForm"
      v-if="showNodeTypeForm"
      :style="formStyle"
      @addStep="addNode('Rectangle')"
      @addDecision="addNode('Diamond')"
    />
  </div>
</template>

<style scoped>
.basic-flow {
  height: 1000px;
  width: 1000px;
  background: #fff;
  position: relative;
}
.controls {
  padding: 10px;
  text-align: center;
}
.controls button {
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid #42b983;
  background-color: #42b983;
  color: white;
  transition: background-color 0.3s;
}
.controls button:hover {
  background-color: #36a473;
}
.node-selection-form {
  position: absolute;
  background: white;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  max-width: 200px; /* Prevent too wide */
}
.come-from-in-to-out-enter-active,
.come-from-in-to-out-leave-active {
  transition: transform 0.3s ease-in-out;
}

.come-from-in-to-out-enter-from,
.come-from-in-to-out-leave-to {
  transform: scale(0);
}
.option-node {
  background-color: white;
  transition: all 0.3s ease-in-out;
}
.option-node:hover {
  background-color: #1ed760;
}
.option-node:hover svg {
  stroke: white;
}
.option-node:hover svg path {
  stroke: white;
}
</style>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import * as go from 'gojs';
import AddButton from './workflow/addButton.vue';
const $ = go.GraphObject.make;
const diagramDiv = ref(null);
const showNodeTypeForm = ref(false);
const formStyle = ref({ left: '0px', top: '0px' });
let currentLink = null;
let diagram = null;
import { useWorkflowStore } from '@/stores/workflow22';
const workflowStore = useWorkflowStore();
 const nodesArray = Object.values(workflowStore.nodesJson);


//computed

const initialNodes = computed({
  get: () => workflowStore.initialNodes,
  set: (value) => workflowStore.setInitialNodes(value)
});
const initailLines = computed({
  get: () => workflowStore.initailLines,
  set: (value) => workflowStore.setInitialLines(value)
});
//functions
function zoomIn() {
  if (!diagram) return;
  diagram.scale = Math.min(2, diagram.scale * 1.01);
}

function zoomOut() {
  if (!diagram) return;
  diagram.scale = Math.max(0.1, diagram.scale / 1.01);
}

function fitToWindow() {
  if (!diagram) return;
  reorganizeLayout(); // This will auto-fit the diagram
}
function handleCloseForm() {
  showNodeTypeForm.value = false;
  if (currentLink) {
    // Show the plus button again
    diagram.model.setDataProperty(currentLink.data, "hasPlusButton", true);
    currentLink = null;
  }
}
function addNode(category) {
  if (!currentLink || !diagram) return;
  
  diagram.startTransaction("Add Node");
  
  const fromNodeKey = currentLink.data.from;
  const toNodeKey = currentLink.data.to;
  //for find data by  key in 
  const fromNode = diagram.model.findNodeDataForKey(fromNodeKey);

  // Remove the link that was clicked
  diagram.model.removeLinkData(currentLink.data);

  // Get the parent diamond node (if we're on a branch)
  let parentDiamondNode = null;
  let branchNumber = null;
  if(fromNode.category !=='Merge'){
     if(fromNode.parent){
      parentDiamondNode = diagram.model.findNodeDataForKey(fromNode.parent);
    }
  } else {
    //if merge it for sure have parent
    if(fromNode.parent){
     let parentFormerge = diagram.model.findNodeDataForKey(fromNode.parent);
     if(parentFormerge.parent){
        parentDiamondNode = diagram.model.findNodeDataForKey(parentFormerge.parent);
     } else{
        parentDiamondNode = null
     }
  }
  }
  // Check if we're adding to a branch node
  if (fromNode.category === 'BranchNode') {     
    branchNumber = fromNode.actualId.split('.').length>1?
    fromNode.actualId.split('.')[fromNode.actualId.split('.').length-2]:fromNode.actualId;
  
  }else if(fromNode.parent && fromNode.category !=='Merge') { //
     branchNumber = (fromNode.actualId.includes('.')&& fromNode.actualId.split('.').length>1)?
    fromNode.actualId.split('.')[fromNode.actualId.split('.').length-2]:fromNode.actualId
  }else if(fromNode.parent && fromNode.category =='Merge') { //
     let parentFormerge = diagram.model.findNodeDataForKey(fromNode.parent);//if merge daimond key = daimond-45455     
     branchNumber = (parentFormerge.actualId.includes('.')&& parentFormerge.actualId.split('.').length>1)?
     parentFormerge.actualId.split('.')[parentFormerge.actualId.split('.').length-2]:parentFormerge.actualId
  }
  

  if (category === 'Diamond') {
    const timestamp = Date.now();
    const newId = `diamond-${timestamp}`;
    // const newActualId = getNextAvailableId(workflowStore.nodesJson);
     
    const decisionX = parseFloat(getLinkMidpoint(currentLink).split(' ')[0]);
    const decisionY = parseFloat(getLinkMidpoint(currentLink).split(' ')[1]);
    const branchSpacing = 300;
    const branchVerticalOffset = 100; 
    const decisionNodeKey = newId;
    const yesNodeKey = `yes-${timestamp}`;

    const noNodeKey = `no-${timestamp}`;
    const mergeNodeKey = `merge-${timestamp}`;
                  console.log('workflowStore.nodesJson111111111',workflowStore.nodesJson)

    let newActualId = null
        // Create the Decision node
    let decisionNode = { 
      id: newId,
      actualId: '',
      text: `Decision`, 
      category: 'Diamond',
      loc: getLinkMidpoint(currentLink),
      parent: parentDiamondNode?.key || null,
      nextNode: toNodeKey,
      prevNode: fromNodeKey,
      key: newId
    };
   
 // Create branch nodes (yes/no)
    let yesNode = { 
      id: `0`,
      actualId: ``,
      text: '', 
      category: 'BranchNode',
      loc: `${decisionX - branchSpacing} ${decisionY + branchVerticalOffset}`,
      key: yesNodeKey,
      parent: decisionNodeKey
    }; 
     //get actualId from here

    let noNode = { 
      id: `0`,
      actualId: ``,
      text: '', 
      category: 'BranchNode',
      loc: `${decisionX + branchSpacing} ${decisionY + branchVerticalOffset}`,
      key: noNodeKey,
      parent: decisionNodeKey
    }; 
    //get actualId from here

    let mergeNode = { 
      id: `merge-0`,
      actualId: ``,
      category: 'Merge',
      loc: `${decisionX} ${decisionY + branchVerticalOffset * 2}`,
      key: mergeNodeKey,
      parent: decisionNodeKey
    };
    
        // Create the node data for storage
    let newNodeData =null;

    // Add to store - either as a new main node or as a child of a diamond
    console.log('parentDiamondNode',parentDiamondNode)
    if (parentDiamondNode) {
      // Find the parent diamond in nodesJson and add this node to its branch
      const parentKay = parentDiamondNode.key;
      const firstParentId = parentDiamondNode.actualId.includes('.')?getParents(parentDiamondNode.actualId)[0]:parentDiamondNode.actualId;
      //search on all nodesJson and its multi nested children for these ids and get its key 
      //let firstparentKey = 
      let parentsCount = parentDiamondNode.actualId.includes('.')?getParents(parentDiamondNode.actualId).length:1;
      let parentsArray=parentDiamondNode.actualId.includes('.')?getParents(parentDiamondNode.actualId):[`${parentDiamondNode.actualId}`];
            const firstparentKey = parentDiamondNode.actualId.includes('.')?getParents(parentDiamondNode.actualId)[0]:parentDiamondNode.actualId;

      //search on all nodesJson and its multi nested children for these ids and get its key 

      //let parentskeys =
 
      console.log('parentKay222222222',parentKay)
      console.log('workflowStore.nodesJson14444444444',workflowStore.nodesJson)
      console.log('workflowStore.nodesJson[parentKay]',workflowStore.nodesJson[parentKay])//should be firstparentKey

      if (workflowStore.nodesJson[parentKay]) {
        if (!workflowStore.nodesJson[parentKay].children) {
          workflowStore.nodesJson[parentKay].children = {};
          console.log('workflowStore.nodesJson[parentKay].children',workflowStore.nodesJson[parentKay].children)
        }
        if (!workflowStore.nodesJson[parentKay].children[branchNumber]) {
          workflowStore.nodesJson[parentKay].children[branchNumber] = [];
           console.log(' workflowStore.nodesJson[parentKay].children[branchNumber] ', workflowStore.nodesJson[parentKay].children[branchNumber] )
        }
        // Generate sequential ID for this level
        const nextId = workflowStore.nodesJson[parentKay].children[branchNumber].length;
        
        console.log('nextId111111',nextId)
        decisionNode.id = nextId.toString();
        decisionNode.actualId = `${parentDiamondNode.actualId}.${branchNumber}.${nextId}`;
        noNode.actualId = `${parentDiamondNode.actualId}.${branchNumber}.${nextId}.2.0`
        yesNode.actualId = `${parentDiamondNode.actualId}.${branchNumber}.${nextId}.1.0`
        mergeNode.actualId = `${parentDiamondNode.actualId}.${branchNumber}.${nextId}.merge`
     
        console.log('rrggrg',nextId.toString())//hi sline print actualId of decisionNode not change
        newNodeData= {
          id: decisionNode.id ,
          actualId: decisionNode.actualId ,
          key: decisionNode.key,
          category: 'Diamond',
          loc: decisionNode.loc,
          children: {
            "1": [{
              id: yesNode.id,
              actualId: yesNode.actualId,
              key: yesNode.key,
              category: yesNode.category,
              loc: yesNode.loc,
              children: null,
              parent: newId
            }],
            "2": [{
              id: noNode.id,
              actualId: noNode.actualId,
              key: noNode.key,
              category: noNode.category,
              loc: noNode.loc,
              children: null,
              parent: newId
            }]
          },
          parent: parentDiamondNode?.key || null
        }
        diagram.model.updateTargetBindings(); //or a similar method.
        workflowStore.nodesJson[parentKay].children[branchNumber].push(newNodeData);
      }
      console.log('rrggrg22',decisionNode)//hi sline print actualId of decisionNode not change
    } else {        
        // Generate sequential ID for this level
         let newId = getNextAvailableId(workflowStore.nodesJson);
         console.log('newId',newId)
        decisionNode.id = newId;
        decisionNode.actualId = newId;

        noNode.actualId = `${newId}.2.0`
        yesNode.actualId = `${newId}.1.0`
        mergeNode.actualId = `${newId}.merge`
        // newNodeData.id = nextId.toString();
        diagram.model.updateTargetBindings(); //or a similar method.

        newNodeData= {
          id: decisionNode.id ,
          actualId: decisionNode.actualId ,
          key: decisionNode.key,
          category: 'Diamond',
          loc: decisionNode.loc,
          children: {
            "1": [{
              id: yesNode.id,
              actualId: yesNode.actualId,
              key: yesNode.key,
              category: yesNode.category,
              loc: yesNode.loc,
              children: null,
              parent: newId
            }],
            "2": [{
              id: noNode.id,
              actualId: noNode.actualId,
              key: noNode.key,
              category: noNode.category,
              loc: noNode.loc,
              children: null,
              parent: newId
            }]
          },
          parent: parentDiamondNode?.key || null
        }
     console.log('workflowStore.nodesJson12222 1111111',workflowStore.nodesJson)
      workflowStore.nodesJson[decisionNode.key] = newNodeData;   
       console.log('decisionNoccccde',decisionNode)//hi sline print actualId of decisionNode not change

    }
    // Add to diagram
    diagram.model.addNodeData(decisionNode);
  
  
    // Add to diagram
    diagram.model.addNodeData(yesNode);
    diagram.model.addNodeData(noNode);
    // Add to diagram
    diagram.model.addNodeData(mergeNode);

    // Add links between nodes
    diagram.model.addLinkData({ from: fromNodeKey, to: decisionNodeKey });
    diagram.model.addLinkData({ from: decisionNodeKey, to: yesNodeKey, hasPlusButton: false, text: 'Yes' });
    diagram.model.addLinkData({ from: decisionNodeKey, to: noNodeKey, hasPlusButton: false, text: 'No' });
    diagram.model.addLinkData({ from: yesNodeKey, to: mergeNodeKey, hasPlusButton: true });
    diagram.model.addLinkData({ from: noNodeKey, to: mergeNodeKey, hasPlusButton: true});
    diagram.model.addLinkData({ from: mergeNodeKey, to: toNodeKey, hasPlusButton: true });


      adjustIds(decisionNode)


  } else {
    //if you want to make  node
    const timestamp = Date.now();
    const newId = `rect-${timestamp}`;
        // Create the node data for storage
    const newNodeData = {
      id: '',
      actualId: '',
      key: newId,
        text: `Step`, 
      category: 'Rectangle',
      loc: getLinkMidpoint(currentLink),
      // loc: newNode.loc,
      children: null,
      parent: parentDiamondNode?.key || null,
       nextNode: toNodeKey,
      prevNode: fromNodeKey
    };

    // Add to store - either as a new main node or as a child of a diamond
    if (parentDiamondNode) {
      // Find the parent diamond in nodesJson and add this node to its branch
      const parentId = parentDiamondNode.key;
      console.log('parentId22222222222',parentId)
      if (workflowStore.nodesJson[parentId]) {
        if (!workflowStore.nodesJson[parentId].children) {
          workflowStore.nodesJson[parentId].children = {};
        }
        if (!workflowStore.nodesJson[parentId].children[branchNumber]) {
          workflowStore.nodesJson[parentId].children[branchNumber] = [];
        }
        
        // Generate sequential ID for this level
        const nextId = workflowStore.nodesJson[parentId].children[branchNumber].length + 1;
        newNodeData.id = nextId.toString();
        newNodeData.actualId = `${parentDiamondNode.actualId}.${branchNumber}.${nextId}`;
        
        workflowStore.nodesJson[parentId].children[branchNumber].push(newNodeData);
      }
    } else {
      // Add as a new main node
     let newActualId = getNextAvailableId(workflowStore.nodesJson);
      newNodeData.id = newActualId.toString();
      newNodeData.actualId = newActualId;
      workflowStore.nodesJson[newNodeData.key] = newNodeData;
    }
    
    // Add to diagram
    diagram.model.addNodeData(newNodeData);
    const newNodeKey = diagram.model.getKeyForNodeData(newNodeData);
    
    // Add links
    diagram.model.addLinkData({ from: fromNodeKey, to: newNodeKey });
    diagram.model.addLinkData({ from: newNodeKey, to: toNodeKey, hasPlusButton: true });

 adjustIds(newNodeData)
  }
  
  diagram.commitTransaction("Add Node");
  reorganizeLayout();
 
  showNodeTypeForm.value = false;
  currentLink = null;
}

// Helper function to get next available ID for main nodes
function getNextAvailableId(nodesJson) {
  // Get all actualIds from main nodes (not children)
  const numericIds = Object.values(nodesJson)
    .filter(node => node.actualId && !isNaN(parseInt(node.actualId)))
    .map(node => parseInt(node.actualId));
  
  if (numericIds.length === 0) return '1';
  
  const maxId = Math.max(...numericIds);
  return (maxId + 1).toString();
}

// Helper function to calculate midpoint of a link
function getLinkMidpoint(link) {
  if (!link || !link.data) return "0 0";
  const fromNode = diagram.findNodeForKey(link.data.from);
  const toNode = diagram.findNodeForKey(link.data.to);
  if (!fromNode || !toNode) return "0 0";
  const fromPt = fromNode.location;
  const toPt = toNode.location;
  return `${(fromPt.x + toPt.x) / 2} ${(fromPt.y + toPt.y) / 2}`;
}

function deleteNodeAndReconnect(node) {
    if (!node || !diagram) return;
    const nodeData = node.data;

    // Forbid deleting Start and End nodes
    if (nodeData.category === "Start" || nodeData.category === "End") {
        console.warn("Deletion of Start/End nodes is not allowed.");
        return;
    }

    diagram.startTransaction("delete and reconnect");

    // 1. Find the node that links *into* the node being deleted.
    const inLink = node.findLinksInto().first();
    const fromNodeKey = inLink ? inLink.fromNode.key : null;

    let toNodeKey = null;

    if (nodeData.category === "Diamond") {
        const partsToDelete = new go.Set();
        partsToDelete.add(node); 

        let mergeNode = null;
        const queue = new go.List(); 
        queue.addAll(node.findNodesOutOf());
        while (queue.count > 0) {
            const current = queue.first();
            queue.removeAt(0);

            if (partsToDelete.contains(current)) continue; // Avoid cycles if the graph is malformed.

            // If we've found the merge node, mark it and stop traversing this path.
            if (current.data.category === "Merge") {
                mergeNode = current;
                continue;
            }
            
            // Otherwise, mark this node for deletion and add its children to the search queue.
            partsToDelete.add(current);
            queue.addAll(current.findNodesOutOf());
        }

        // After the search, if we found a merge node, find what it connects to.
        if (mergeNode) {
            partsToDelete.add(mergeNode); // Mark the merge node for deletion.
            const mergeOutLink = mergeNode.findLinksOutOf().first();
            if (mergeOutLink) {
                toNodeKey = mergeOutLink.toNode.key; // This is our final destination.
            }
        }
        
        // Remove the diamond, all branch nodes, the merge node, and their connecting links all at once.
        diagram.removeParts(partsToDelete, true);

    } else {
        // --- Handle Simple Node Deletion ---
        // Find the single node that comes *after* the node being deleted.
        const outLink = node.findLinksOutOf().first();
        toNodeKey = outLink ? outLink.toNode.key : null;
        
        // Remove just the one node.
        diagram.remove(node);
    }

    // 4. Create a new link to bridge the gap between the preceding and succeeding nodes.
    if (fromNodeKey && toNodeKey) {
        diagram.model.addLinkData({ from: fromNodeKey, to: toNodeKey, hasPlusButton: true });
    }

    diagram.commitTransaction("delete and reconnect");
}

const makeDeleteButton = () => {
  return $(go.Shape,
      { alignment: new go.Spot(1, 0, -5, 5), // Position at top-right with small offset
      click: (e, obj) => {
        deleteNodeAndReconnect(obj.part);
      },
      cursor: "pointer", // Add pointer cursor
        // No need for the "SVG" argument here
        width: 10,
        height: 10,
        fill: "red", 
        stroke:"red",// It's better to set fill here
        geometryString: "M15,4c-0.52344,0 -1.05859,0.18359 -1.4375,0.5625c-0.37891,0.37891 -0.5625,0.91406 -0.5625,1.4375v1h-6v2h1v16c0,1.64453 1.35547,3 3,3h12c1.64453,0 3,-1.35547 3,-3v-16h1v-2h-6v-1c0,-0.52344 -0.18359,-1.05859 -0.5625,-1.4375c-0.37891,-0.37891 -0.91406,-0.5625 -1.4375,-0.5625zM15,6h4v1h-4zM10,9h14v16c0,0.55469 -0.44531,1 -1,1h-12c-0.55469,0 -1,-0.44531 -1,-1zM12,12v11h2v-11zM16,12v11h2v-11zM20,12v11h2v-11z"
      }
    )
  
};

// Then update the reorganizeLayout function to this:
function reorganizeLayout() {
  if (!diagram) return;
  
  // Store current zoom level
  const currentScale = diagram.scale;
  
  diagram.startTransaction("Reorganize Layout");
  
  diagram.layout = $(go.LayeredDigraphLayout, {
    direction: 90,  // 90 means vertical flow //it have (0 left to right, 90 top to bottom, 180 bottom to top, 270 right to left) 
    layerSpacing: 150,  //spaces between layers
      columnSpacing: 200,//spaces between nodes not determins spaces between lines
    setsPortSpots: true
  });
  
  diagram.layoutDiagram(true);
  
  if (diagram.documentBounds.isReal() && diagramDiv.value) {
    const newScale = Math.min(
      diagramDiv.value.clientWidth / diagram.documentBounds.width,
      diagramDiv.value.clientHeight / diagram.documentBounds.height
    ) * 0.9;
    
    if (!isNaN(newScale)) {
      diagram.scale = Math.min(currentScale, Math.max(0.1, Math.min(2, newScale)));
    }
  }
  
  diagram.commitTransaction("Reorganize Layout");
}
function updateStoreFromDiagram() {
  // Get current diagram state
  const nodes = diagram.model.nodeDataArray;
  const links = diagram.model.linkDataArray;
  
  // Update store
  workflowStore.setInitialNodes(nodes);
  workflowStore.setInitialLines(links);
}

// Call this whenever you modify the diagram
function addNodeWithStoreSync(category) {
  diagram.startTransaction("Add Node");
  // ... your existing addNode logic
  diagram.commitTransaction("Add Node");
  updateStoreFromDiagram(); // Sync with store
}
function convertHierarchicalNodesToGoJS(nodes) {
  const goNodes = [];
  const goLinks = [];
  
  function processNode(node, parentKey = null) {
    const goNode = {
      key: node.key,//
      category: node.category,
      id: node.id,
      actualId: node.actualId,//
      loc: node.loc,
      text: node.text || node.category
    };
    goNodes.push(goNode);
    
    if (parentKey) {
      goLinks.push({
        from: parentKey,
        to: node.key,
        hasPlusButton: true,
        text: ""
      });
    }
    
    if (node.children) {
      Object.entries(node.children).forEach(([branch, children]) => {
        children.forEach(child => {
          processNode(child, node.key);
          if (branch === '1') {
            // Add "Yes" label for first branch
            goLinks[goLinks.length-1].text = "Yes";
          } else if (branch === '2') {
            // Add "No" label for second branch
            goLinks[goLinks.length-1].text = "No";
          }
        });
      });
    }
  }
  
  Object.values(nodes).forEach(node => processNode(node));
  return { nodes: goNodes, links: goLinks };
}
function initializeDiagramFromStore() {
  try {
    // Initialize with empty arrays as fallback
    let nodes = [];
    let links = [];
    
    // Check if we have flat structure data
    if (Array.isArray(workflowStore.initialNodes) && workflowStore.initialNodes.length) {
      nodes = [...workflowStore.initialNodes];
      links = Array.isArray(workflowStore.initialLines) ? [...workflowStore.initialLines] : [];
    } 
    // Check if we have hierarchical data
    else if (workflowStore.nodes && typeof workflowStore.nodes === 'object') {
      const converted = convertHierarchicalNodesToGoJS(workflowStore.nodes);
      nodes = converted?.nodes || [];
      links = converted?.links || [];
    }
  // In initializeDiagramFromStore(), ensure actualId is included:
  const validatedNodes = nodes.map(node => ({
    key: node.key,
    category: node.category,
    id: node.id,
    actualId: node.actualId || '', // Make sure this is included
    loc: node.loc || "0 0",
    text: node.text || node.category || 'Node',
                  children:node.children,
                  parent:node.parent
  }));

    // Validate and format links
    const validatedLinks = links.map(link => ({
      from: link.from || '',
      to: link.to || '',
      hasPlusButton: link.hasPlusButton !== false,
      text: link.text || ""
    })).filter(link => link.from && link.to); // Filter out invalid links

    // Set model data with validation
    diagram.model = new go.GraphLinksModel({
      nodeDataArray: validatedNodes,
      linkDataArray: validatedLinks
    });
    
  } catch (error) {
    console.error('Error initializing diagram from store:', error);
    // Fallback to empty diagram
    diagram.model = new go.GraphLinksModel({
      nodeDataArray: [],
      linkDataArray: []
    });
  }
}

 function getParents(id) {
    // 1. Input Validation
    if (typeof id !== 'string' || !id.includes('.')) {
        return null;
    }

    // 2. Split ID into parts
    const parts = id.split('.');
    
    if (parts.length < 3) {
        return [];
    }

    // 3. Extract Parents
    const parents = [];
    for (let i = 0; i <= parts.length - 3; i += 2) {
        const parentId = parts.slice(0, i + 1).join('.');
        parents.push(parentId);
    }

    // 4. Return Result
    return parents;
}

function adjustIds(affectedNode, action = 'add-new') {
    // Get all nodes from the diagram model
    const allNodes = diagram.model.nodeDataArray;
    if (action === 'add-new') {
        if (!affectedNode.actualId.includes('.')) {
          //newnode = 2
              // then increase this section in actualId by one then return this node
              // increase id 
            //   allNodes.forEach(node => {
            //     // Ensure you don't modify special nodes like 'start', 'end', or 'merge'
            //     if (node.category !== 'Merge' && node.category !== 'End' && node.category !== 'Start') {
            //         const parentIds = getParents(node.actualId);
            //         if (parentIds && parentIds.length > 0 && parentIds[0] >= affectedNode.actualId) {
            //             // Logic to increment the node's ID
            //             // This is where you would modify the node's actualId
            //             // For example, you might need to parse the actualId, increment a part of it, and then update the node data.
            //             // diagram.model.setDataProperty(node, "actualId", newId);
            //         } else if (!node.actualId.includes('.') ) {
            //           //if node don't have parent
            //     //increase id and actualId
            //         }
            //     }
            //     //return node
            // });
            allNodes.map(node => {
                // Ensure you don't modify special nodes like 'start', 'end', or 'merge'
                if (node.category !== 'Merge' && node.category !== 'End' && node.category !== 'Start') {
                    const parentIds = getParents(node.actualId);
                    //node to change id = 2.1.1 or 2.1.1.1
                    if (parentIds && parentIds.length > 0 && parseInt(parentIds[0]) >=  parseInt(affectedNode.actualId)) {
                       
                    } else if (!node.actualId.includes('.') ) {
                      //if node don't have parent
                      //increase id and actualId
                      // node.id +=1;
                      // node.actualId += 1;
                      const nnode = diagram.findNodeForKey(node.key);
                      if (nnode) {
                        // Modify the node's data object directly
                        // nnode.data.text = "New Label";
                         nnode.id +=1;
                      nnode.actualId += 1;
                      return nnode;
                        // Now, force the bindings to update
                        nnode.updateTargetBindings();
                      }
                    }
                }
                //return node
            });
  //update nodesJson as well
        // nodesJson.map((nodee=> {
        //    // if node.actualId == 2.1.1 or 2.1.1.1.1 or 3.3.1.22 or 2
        //    // then get 2,2,3,2
        //    if(nodee.type !=='merge'&& nodee.type !=='end'&& nodee.type !=='start'){
        //      if(getParents(nodee.actualId) && getParents(nodee.actualId).length && getParents(nodee.actualId)[0] >= affectedNode.actualId){
        //       // then increase this section by one then return this node
       
        //       }else {
        //         //if node don't have parent

        //       }
        //    }
        //   return nodee
        // }))
        } else {
            // Logic for when the affected node is a child node
        }
    } else if (action === 'delete') {
  // shift ids of remainig nodes (next nodes and its children ) to up that means increase actualId and id all nodes in new node level by one
      // if affectedNode don't have parent && !affectedNode.actualId.includes('.') then increase actualId and id OF all next nodes by one including node that have the same id
      // where check actualId and id of all  next nodes in daigram model nodes and nodesJson and its children 
      // where check if !node.actualId.includes('.') then increase actualId and id by  one and then push it to daigram.model.nodes and nodesJson with new ids
      // where check if node.actualId.includes('.')&& node.type !=='merge'&& node.type !=='end'&& node.type !=='start'   then increase id and the first section of actualId
      // node.actualId.includes('.')[0] of all next nodes by one and then push them to daigram.model.nodes and nodesJson with new ids
      
      
      // if affectedNode.actualId.includes('.') 
      // find branch number by affectedNode.actualId.includes('.')[affectedNode.actualId.includes('.').length-2] 
      // find parentId = 
      // and decrese all next nodes 
      // that have node.actualId.includes('.') && node.actualId.includes('.')[node.actualId.includes('.').length-2] == affectedNode.actualId.includes('.')[affectedNode.actualId.includes('.').length-2] 
      // then increase the last section of actualId by 1 like this node.actualId.includes('.')[node.actualId.includes('.').length-1]+1 and then join actualId where if it was like this (1.2.1) them make it like this (1.2.2) 
      // and then push them to daigram.model.nodes and nodesJson with new ids
    }

    // After making changes, you might need to refresh the diagram
    diagram.model.updateTargetBindings(); //or a similar method.
}
onMounted(() => {
// go.licenseKey = "YOUR_LICENSE_KEY"; 

  const $ = go.GraphObject.make;
  //draw diagram
  //g.diagram is mandatory
  //diagrma contaoiner ref=> diagramDiv.value
  //then option 
  //---> layout and grid
  diagram = $(go.Diagram, diagramDiv.value, {
    'undoManager.isEnabled': true,
    'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,

    // 1. REMOVE this line
    //  initialAutoScale: go.Diagram.Uniform, //this sis make diagram in the center if small by defualt

    // 2. ADD this line to align content to the top
    initialContentAlignment: go.Spot.TopCenter,

    layout: $(go.LayeredDigraphLayout, {
      direction: 90,
      layerSpacing: 100,
      columnSpacing: 10,
      setsPortSpots: true
    }),
    grid: $(go.Panel, "Grid",
      { 
        gridCellSize: new go.Size(20, 20),
        visible: true
      },
      $(go.Shape, "LineH", { 
        stroke: "lightgray",
        strokeWidth: 0.5
      }),
      $(go.Shape, "LineV", { 
        stroke: "lightgray",
        strokeWidth: 0.5
      })
    )
  });

  // Add mouse wheel event listener for smoother zooming
  diagram.div.addEventListener('wheel', (e) => {
    e.preventDefault();
    const oldScale = diagram.scale;
    const newScale = e.deltaY < 0 ? 
    oldScale * 1.1 :  // Zoom in
    oldScale / 1.1;   // Zoom out
    // Limit zoom range
    diagram.scale = Math.max(0.1, Math.min(2, newScale));
  }, { passive: false });

  // Template for rectangular steps, with a delete button.
  // Update the Rectangle template
  // Update the Rectangle template
  diagram.nodeTemplateMap.add("Rectangle",
    $(go.Node, "Auto",
      {
        locationSpot: go.Spot.Center,
        margin: new go.Margin(0, 0, 10, 10),
        minSize: new go.Size(120, 60), 
        selectable: false,
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "RoundedRectangle",
        {
          fill: "#FFFFFF",
          stroke: "#E0E0E0",
          strokeWidth: 1
        }),
      $(go.Panel, "Vertical",
        {
          margin: 6,
          defaultAlignment: go.Spot.Left
        },
        $(go.TextBlock,
          {
            font: "bold 11px sans-serif",
            stroke: "#555",
            margin: new go.Margin(0, 0, 2, 0)
          },
          new go.Binding("text", "actualId")),  // Display actualId
        $(go.TextBlock,
          {
            editable: true,
            font: "14px sans-serif",
            margin: new go.Margin(0, 0, 2, 0)
          },
          new go.Binding("text", "text").makeTwoWay())  // Display node text
      ),
      makeDeleteButton()
  ));

  // Update the Diamond template similarly
  diagram.nodeTemplateMap.add("Diamond",
    $(go.Node, "Auto",
      { 
        locationSpot: go.Spot.Center,
        minSize: new go.Size(80, 80), 
        selectable: false,
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "RoundedRectangle",
        { 
          fill: "#FFFFFF",
          stroke: "#444",
          strokeWidth: 2,
          width: 70,
          height: 70,
          angle: 45
        }
      ),
      $(go.Panel, "Vertical",
        {
          margin: 6,
          defaultAlignment: go.Spot.Left
        },
        $(go.TextBlock,
          {
            font: "bold 11px sans-serif",
            stroke: "#555",
            margin: new go.Margin(0, 0, 2, 0)
          },
          new go.Binding("text", "actualId")),  // Changed from "key" to "actualId"
        $(go.TextBlock,
          {
            editable: true,
            font: "14px sans-serif"
          },
          new go.Binding("text").makeTwoWay())
      ),
      makeDeleteButton()
    )
  );

const circleTemplate = (text, color) => {
  return $(go.Node, "Auto",
    { 
      locationSpot: go.Spot.Center,
      minSize: new go.Size(50, 50), 
      selectable: false,
      // isLayoutPositioned: false, // <-- this line to make start and end node take poistion from store
    },
    // new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), // <-- this line to make start and end node take poistion from store 
    $(go.Shape, "Circle", 
      { fill: color, stroke: "transparent", strokeWidth: 2, width: 35, height: 35 }),
    // $(go.TextBlock,
    //   {
    //     // margin: 8,
    //     editable: true,
    //     font: "12px sans-serif",
    //     textAlign: "center"
    //   },
    //   new go.Binding("text", "text").makeTwoWay()),
  );
};

diagram.nodeTemplateMap.add("Start", circleTemplate("Start", "#4CAF50"));
diagram.nodeTemplateMap.add("End", circleTemplate("End", "#f44336"));
// Update the Merge template
diagram.nodeTemplateMap.add("Merge",
  $(go.Node, "Spot",
    { 
      locationSpot: go.Spot.Center, 
      selectable: false,
      minSize: new go.Size(30, 30)
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    $(go.Shape, "Diamond", 
      { fill: "#5c5b5b", stroke: "#5c5b5b", width: 25, height: 25 }),
    $(go.TextBlock,
      { 
        alignment: go.Spot.Center, 
        font: "bold 10px sans-serif", 
        stroke: "white",
        margin: 2
      },
      new go.Binding("text", "actualId"))  // Changed from "key" to "actualId"
  ));

// Update the BranchNode template
diagram.nodeTemplateMap.add("BranchNode",
  $(go.Node, "Auto",
    { 
      locationSpot: go.Spot.Center,
      minSize: new go.Size(100, 40), 
      selectable: false,
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    $(go.Shape, "Rectangle",
      { 
        fill: "transparent",
        stroke: "transparent",
        width: 120,
        height: 50
      }),
    $(go.Panel, "Vertical",
      {
        margin: 6,
        defaultAlignment: go.Spot.Left
      },
      $(go.TextBlock,
        {
          font: "bold 11px sans-serif",
          stroke: "#555",
          margin: new go.Margin(0, 0, 2, 0)
        },
        new go.Binding("text", "actualId")),  // Changed from "key" to "actualId"
      $(go.TextBlock,
        { 
          editable: true,
          font: "12px sans-serif"
        },
        new go.Binding("text").makeTwoWay())
    )
  ));

  // Link template
  diagram.linkTemplate = $(go.Link,
    {
      routing: go.Link.AvoidsNodes,
      curve: go.Link.JumpOver,
      corner: 10,
      reshapable: true,
      resegmentable: true,
      relinkableFrom: true,
      relinkableTo: true, 
      selectable: false,
    },
    $(go.Shape, { strokeWidth: 2, stroke: "#ccc" }),
    $(go.Shape, { toArrow: "Circle", stroke: "transparent", fill: "transparent", scale: 1 }),
    $(go.TextBlock, { 
        textAlign: "center",
        font: "12px sans-serif",
        stroke: "#444",
        background: "rgba(255,255,255,0.8)",
        editable: true
      }, 
      new go.Binding("text").makeTwoWay()),
    $("Panel", "Auto",
      new go.Binding("visible", "hasPlusButton"),
      {
        cursor: "pointer",
        segmentIndex: NaN,
        segmentFraction: 0.5,
      },
      $(go.Shape, "Circle", { fill: "#ccc", stroke: "#ccc", strokeWidth: 2, width: 24, height: 24 }),
      $(go.TextBlock, "+", { stroke: "#444", font: "bold 16px sans-serif" }),
      {
        click: (e, obj) => {
          e.handled = true;
          currentLink = obj.part;
          
          // Hide the plus button by updating the link data
          diagram.model.setDataProperty(currentLink.data, "hasPlusButton", false);
          
          const clickPointInDoc = e.documentPoint;
          const viewPoint = diagram.transformDocToView(clickPointInDoc);
          showNodeTypeForm.value = true;

          formStyle.value = {
            position: 'absolute',
            left: viewPoint.x + 'px',
            top: viewPoint.y+55 + 'px',
            transform: 'translate(-50%, -50%)',
            zIndex: 100
          };
        }
      }
    )
  );

  // Branch node template
  diagram.nodeTemplateMap.add("BranchNode",
    $(go.Node, "Auto",
      { 
        locationSpot: go.Spot.Center,
        minSize: new go.Size(100, 40), 
      selectable: false,
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "Rectangle",
        { 
          fill: "transparent",
          stroke: "transparent",
          width: 120,
          height: 50
        }),
      $(go.Panel, "Vertical",
        {
          margin: 6,
          defaultAlignment: go.Spot.Left
        },
        $(go.TextBlock,
          {
            font: "bold 11px sans-serif",
            stroke: "#555",
            margin: new go.Margin(0, 0, 2, 0)
          },
          new go.Binding("text", "actualId", k => `ID: ${k}`)),
        $(go.TextBlock,
          { 
            editable: true,
            font: "12px sans-serif"
          },
          new go.Binding("text").makeTwoWay())
      )
    ));

  // draw  Initial nodes from store
  // Load data from store
  diagram.model = new go.GraphLinksModel({
    nodeDataArray: Object.values(workflowStore.nodesJson),
    linkDataArray: workflowStore.initialLines
  });

  // Initialize model with store data
  initializeDiagramFromStore();

  // After model initialization
  diagram.startTransaction("Initial Layout");
  diagram.layoutDiagram(true);
  diagram.commitTransaction("Initial Layout");
});
</script>
