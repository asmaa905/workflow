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
import { ref, onMounted } from 'vue';
import * as go from 'gojs';
import AddButton from './workflow/addButton.vue';
const $ = go.GraphObject.make;

const diagramDiv = ref(null);
const showNodeTypeForm = ref(false);
const formStyle = ref({ left: '0px', top: '0px' });
let currentLink = null;
let diagram = null;

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
  
  // Remove the link that was clicked
  diagram.model.removeLinkData(currentLink.data);
console.log('Number(fromNodeKey)',fromNodeKey)
console.log('Number(toNodeKey)',toNodeKey)

  if (category === 'Diamond') {
  // 1. Create the Decision node
  const decisionNode = { 
    id:`diamond-${Number(fromNodeKey)+1}-${Date.now()}`,
    actualId:`${Number(fromNodeKey)+1}`,
      text: ` ${Number(fromNodeKey)+1}`, 
    category: 'Diamond',
    loc: getLinkMidpoint(currentLink)
  };
  diagram.model.addNodeData(decisionNode);
  const decisionNodeKey = diagram.model.getKeyForNodeData(decisionNode);

  const decisionX = parseFloat(decisionNode.loc.split(' ')[0]);
  const decisionY = parseFloat(decisionNode.loc.split(' ')[1]);
  const branchSpacing = 300; // Horizontal spread
  const branchVerticalOffset = 100; // Vertical offset

  // 2. Create branch nodes
  const yesNode = { 
        id:`yesNode-${Number(fromNodeKey)+1}.1.1-${Date.now()}`,
    actualId:`${Number(fromNodeKey)+1}.1.1`,
    text: '', 
    category: 'BranchNode',
    loc: `${decisionX - branchSpacing} ${decisionY + branchVerticalOffset}`
  };
  diagram.model.addNodeData(yesNode);
  const yesNodeKey = diagram.model.getKeyForNodeData(yesNode);

  const noNode = { 
            id:`noNode-${Number(fromNodeKey)+1}.1.1-${Date.now()}`,
    actualId:`${Number(fromNodeKey)+1}.1.1`,
    text: '', 
    category: 'BranchNode',
    loc: `${decisionX + branchSpacing} ${decisionY + branchVerticalOffset}`
  };
  diagram.model.addNodeData(noNode);
  const noNodeKey = diagram.model.getKeyForNodeData(noNode);

  // 3. Create Merge node further down
  const mergeNode = { 
            id:`merge-${Number(fromNodeKey)+1}.merge-${Date.now()}`,
    actualId:`${Number(fromNodeKey)+1}.merge`,
    category: 'Merge',
    loc: `${decisionX} ${decisionY + branchVerticalOffset * 2}` // Double the vertical offset
  };
  diagram.model.addNodeData(mergeNode);
  const mergeNodeKey = diagram.model.getKeyForNodeData(mergeNode);

  // 4. Reconnect the flow
  diagram.model.addLinkData({ from: fromNodeKey, to: decisionNodeKey });
  diagram.model.addLinkData({ from: decisionNodeKey, to: yesNodeKey,hasPlusButton: false,  text: 'Yes' });
  diagram.model.addLinkData({ from: decisionNodeKey, to: noNodeKey,hasPlusButton: false,  text: 'No' });
  diagram.model.addLinkData({ from: yesNodeKey, to: mergeNodeKey, hasPlusButton: true });
  diagram.model.addLinkData({ from: noNodeKey, to: mergeNodeKey, hasPlusButton: true});
  diagram.model.addLinkData({ from: mergeNodeKey, to: toNodeKey, hasPlusButton: true });
} else {
    // --- Create a simple rectangular node ---
    const newNode = { 
      id:`rect-${Number(fromNodeKey)+1}-${Date.now()}`,
      actualId:`${Number(fromNodeKey)+1}`,
      text: `Step ${Number(fromNodeKey)+1}`, 
      category: 'Rectangle',
      loc: getLinkMidpoint(currentLink)
    };
    diagram.model.addNodeData(newNode);
    const newNodeKey = diagram.model.getKeyForNodeData(newNode);
    
    diagram.model.addLinkData({ from: fromNodeKey, to: newNodeKey });
    diagram.model.addLinkData({ from: newNodeKey, to: toNodeKey, hasPlusButton: true });
  }
  
  diagram.commitTransaction("Add Node");
    diagram.startTransaction("Reorganize Layout");
  

  
  showNodeTypeForm.value = false;
  currentLink = null;reorganizeLayout(); // Add this line to trigger automatic layout
  diagram.layoutDiagram(true);

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
onMounted(() => {
 const $ = go.GraphObject.make;

diagram = $(go.Diagram, diagramDiv.value, {
  'undoManager.isEnabled': true,  // Enables undo/redo functionality
  'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom, // Enable mouse wheel zoom
  initialAutoScale: go.Diagram.Uniform, // Initial scaling
  layout: $(go.LayeredDigraphLayout, {
    direction: 90,
    layerSpacing: 100,
    columnSpacing: 10,
    setsPortSpots: true
  }),
  grid: $(go.Panel, "Grid",
    { 
      gridCellSize: new go.Size(20, 20),
      visible: true  // Ensure grid is visible
    },
    // Horizontal lines (solid)
    $(go.Shape, "LineH", { 
      stroke: "lightgray",  // Line color
      strokeWidth: 0.5      // Line thickness
    }),
    // Vertical lines (solid)
    $(go.Shape, "LineV", { 
      stroke: "lightgray",  // Line color
      strokeWidth: 0.5      // Line thickness
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
diagram.nodeTemplateMap.add("Rectangle",
  $(go.Node, "Auto",
    {
      locationSpot: go.Spot.Center,
      margin: new go.Margin(0, 0, 10, 10)
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

    // THE FIX: Use "RoundedRectangle" as the figure name
    $(go.Shape, "RoundedRectangle",
      {
        // REMOVE the "corner" property, as it's not supported in your version
        fill: "#FFFFFF",
        stroke: "#E0E0E0",
        strokeWidth: 1,
        minSize: new go.Size(120, 50)
      }),

    $(go.TextBlock,
      {
        margin: 10,
        editable: true,
        font: "14px sans-serif"
      },
      new go.Binding("text").makeTwoWay()),

    makeDeleteButton()
  ));
diagram.nodeTemplateMap.add("Diamond",
  $(go.Node, "Auto",
    { locationSpot: go.Spot.Center },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    $(go.Shape, "RoundedRectangle",
      { 
        fill: "#FFFFFF",
        stroke: "#444",
        strokeWidth: 2,
        width: 70,  // Adjust as needed
        height: 70, // Should be same as width for perfect diamond
        angle: 45,  // Rotates the rectangle to make a diamond
        // corner: 5   // Now corner works because it's a RoundedRectangle
      }
    ),
    $(go.TextBlock, 
      { margin: 10, editable: true, font: "14px sans-serif" },
      new go.Binding("text").makeTwoWay()
    ),
    makeDeleteButton()
  )
);
//node in the end of line
const circleTemplate = (text, color) => {
  return $(go.Node, "Auto",
    { locationSpot: go.Spot.Center },
    $(go.Shape, "Circle", 
      { fill: color, stroke: "transparent", strokeWidth: 2, width: 35, height: 35 }),
  );
};
  diagram.nodeTemplateMap.add("Start", circleTemplate("", "#4CAF50"));
  diagram.nodeTemplateMap.add("End", circleTemplate("", "#f44336"));
  
  diagram.nodeTemplateMap.add("Merge",
    $(go.Node, "Spot",
      { locationSpot: go.Spot.Center, selectable: false },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "Diamond", 
      
        { fill: "#5c5b5b", stroke: "#5c5b5b", width: 25, height: 25 })
    ));
  //style link template
  diagram.linkTemplate = $(go.Link,
    {
      routing: go.Link.AvoidsNodes,
      curve: go.Link.JumpOver,
      corner: 10,
      reshapable: true,
      resegmentable: true,
      relinkableFrom: true,
      relinkableTo: true
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

  diagram.model = new go.GraphLinksModel(
    [
        // Start node at 100, 100
      { key: 1, category: "Start", id: "Start", actualId: "1", loc: "100 0" },
      // End node at 100, 350
      { key: 2, category: "End", id: "End", actualId: "2", loc: "100 800" },
    ],
    [
      { from: 1, to: 2, hasPlusButton: true },
    ]
  );
  // Add this to your node template definitions (in the onMounted() section)
  diagram.nodeTemplateMap.add("BranchNode",
    $(go.Node, "Auto",
      { locationSpot: go.Spot.Center },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "Rectangle",  // Changed to Rectangle for better visibility
        { 
          fill: "transparent",
          stroke: "transparent",
          width: 1,
          height: 1
        }),
      $(go.TextBlock,
        { 
          margin: 8,
          editable: true,
          font: "12px sans-serif"
        },
        new go.Binding("text").makeTwoWay()),
    ));

  // After model initialization
    diagram.startTransaction("Initial Layout");
    diagram.layoutDiagram(true);
    diagram.commitTransaction("Initial Layout");
});
</script>
