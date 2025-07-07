<template>
  <div>
    <div ref="diagramDiv" style="width:100%; height:600px; border:1px solid #ccc; "></div>
    <div v-if="showNodeTypeForm" 
         :style="formStyle"
         style="position:absolute; background:white; padding:10px; border:1px solid #ccc; border-radius:5px; z-index:100;background-color: green !important;">
      <button @click="addNode('Rectangle')" style="margin-right:5px;"> ▭</button>
      <button @click="addNode('Diamond')"> ◇</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as go from 'gojs';
import $ from 'jquery';
window.$ = window.jQuery = $;

const diagramDiv = ref(null);
const showNodeTypeForm = ref(false);
const formStyle = ref({ left: '0px', top: '0px' });
let currentLink = null;
let currentMidPoint = null;
let diagram = null;
let branchCounter = 0; // Counter for new branches

function addNode(category) {
  if (!currentLink || !diagram) return;
  
  diagram.startTransaction("Add Node");
  
  // Create new node data with the selected category
  const newnode = { 
    text: category === 'Diamond' ? 'Decision' : 'new node', 
    category: category 
  };
  diagram.model.addNodeData(newnode);
  
  // Get the new node key
  const newkey = diagram.model.getKeyForNodeData(newnode);
  
  // Split the link into two links
  const from = currentLink.data.from;
  const to = currentLink.data.to;
  diagram.model.removeLinkData(currentLink.data);
  diagram.model.addLinkData({ from: from, to: newkey });
  
  // For diamond nodes, create branching paths with labels
  if (category === 'Diamond') {
    // Create merge node
    const mergeNode = { text: 'Merge', category: 'diamond' };
    diagram.model.addNodeData(mergeNode);
    const mergeKey = diagram.model.getKeyForNodeData(mergeNode);
    
    // Create initial two links from decision to merge node with labels
    diagram.model.addLinkData({ 
      from: newkey, 
      to: mergeKey, 
      text: 'Yes',
    //   curve: go.Link.Bezier,
    //   curviness: 50,
    //   toSpot: go.Spot.Left,
    //   fromSpot: go.Spot.Right
    });
    diagram.model.addLinkData({ 
      from: newkey, 
      to: mergeKey, 
      text: 'No',
    //   curve: go.Link.Bezier,
    //   curviness: -50,
    //   toSpot: go.Spot.Right,
    //   fromSpot: go.Spot.Left
    });
    
    // Add a plus button to the diamond node for adding new branches
    diagram.nodeTemplateMap.add("Diamond",
      $(go.Node, "Auto",
        $(go.Shape, "Diamond", 
          { fill: "lightgreen", stroke: "darkgreen", strokeWidth: 2, width: 60, height: 60 }),
        $(go.TextBlock, { margin: 8, editable: true, textAlign: "center" },
          new go.Binding("text", "text").makeTwoWay()),
        $("Panel", "Auto",
          { alignment: go.Spot.Bottom, alignmentFocus: new go.Spot(0.5, 0, 0, 10) },
          $(go.Shape, "Circle", 
            { 
              fill: "white", 
              stroke: "#42b983", 
              strokeWidth: 2,
              width: 20, 
              height: 20,
              cursor: "pointer"
            }),
          $(go.TextBlock, "+", 
            { 
              stroke: "#42b983", 
              font: "bold 12px sans-serif",
              cursor: "pointer"
            }),
          {
            click: function(e, node) {
              e.handled = true;
              addNewBranch(node);
            }
          }
        )
      )
    );
    
    diagram.model.addLinkData({ from: mergeKey, to: to });
    
    // Position the nodes
    const diamondNode = diagram.findNodeForData(newnode);
    if (diamondNode) {
      diamondNode.location = currentMidPoint;
      
      const mergeNodeObj = diagram.findNodeForData(mergeNode);
      if (mergeNodeObj) {
        mergeNodeObj.location = new go.Point(currentMidPoint.x, currentMidPoint.y + 150);
      }
    }
  } else {
    // Regular node connection
    diagram.model.addLinkData({ from: newkey, to: to });
    
    // Position the new node
    const newnodeobj = diagram.findNodeForData(newnode);
    if (newnodeobj) newnodeobj.location = currentMidPoint;
  }
  
  diagram.commitTransaction("Add Node");
  showNodeTypeForm.value = false;
  currentLink = null;
  currentMidPoint = null;
}

function addNewBranch(decisionNode) {
  if (!decisionNode || !diagram) return;
  
  diagram.startTransaction("Add Branch");
  
  const decisionKey = decisionNode.data.key;
  const mergeNode = findMergeNode(decisionNode);
  
  if (!mergeNode) return;
  
  branchCounter++;
  const branchLabel = `Branch ${branchCounter}`;
  
  // Create new link from decision to merge with label
  diagram.model.addLinkData({
    from: decisionKey,
    to: mergeNode.data.key,
    text: branchLabel,
    curve: go.Link.Bezier,
    curviness: branchCounter % 2 === 0 ? 75 : -75, // Alternate curvature
    toSpot: go.Spot.Top,
    fromSpot: go.Spot.Bottom
  });
  
  diagram.commitTransaction("Add Branch");
}

function findMergeNode(decisionNode) {
  if (!decisionNode || !diagram) return null;
  
  // Find all links coming out of the decision node
  const outgoingLinks = diagram.findLinksOutOf(decisionNode.data.key);
  if (outgoingLinks.count === 0) return null;
  
  // Get the first link's to node (all should go to same merge node)
  const firstLink = outgoingLinks.first();
  return firstLink ? firstLink.toNode : null;
}

onMounted(() => {
  const $ = go.GraphObject.make;

  diagram = $(go.Diagram, diagramDiv.value, {
    'undoManager.isEnabled': true,
    layout: $(go.LayeredDigraphLayout, {
      direction: 90,
      layerSpacing: 100,
      columnSpacing: 100
    }),
    "commandHandler.archetypeGroupData": { key: "Group", isGroup: true }
  });

  // Define node templates
  diagram.nodeTemplateMap.add("Start",
    $(go.Node, "Auto",
      $(go.Shape, "Ellipse", 
        { fill: "red", stroke: "darkred", strokeWidth: 2, width: 40, height: 40 }),
      $(go.TextBlock, "Start", 
        { margin: 5, stroke: "white", font: "bold 12px sans-serif" })
    ));

  diagram.nodeTemplateMap.add("End",
    $(go.Node, "Auto",
      $(go.Shape, "Ellipse", 
        { fill: "green", stroke: "darkgreen", strokeWidth: 2, width: 40, height: 40 }),
      $(go.TextBlock, "End", 
        { margin: 5, stroke: "white", font: "bold 12px sans-serif" })
    ));

  // Default node template (Rectangle)
  diagram.nodeTemplateMap.add("Rectangle",
    $(go.Node, "Auto",
      $(go.Shape, "RoundedRectangle", 
        { fill: "lightblue", stroke: "dodgerblue", strokeWidth: 2 }),
      $(go.TextBlock, { margin: 8, editable: true },
        new go.Binding("text", "text").makeTwoWay())
    ));

  // Diamond node template (Decision node) - will be overridden in addNode with plus button
  diagram.nodeTemplateMap.add("Diamond",
    $(go.Node, "Auto",
      $(go.Shape, "Diamond", 
        { fill: "lightgreen", stroke: "darkgreen", strokeWidth: 2, width: 60, height: 60 }),
      $(go.TextBlock, { margin: 8, editable: true, textAlign: "center" },
        new go.Binding("text", "text").makeTwoWay())
    ));

  // Enhanced link template with better label positioning
  diagram.linkTemplate =
    $(go.Link,
      {
        curve: go.Link.Bezier,
        adjusting: go.Link.Stretch,
        reshapable: true
      },
      $(go.Shape, { strokeWidth: 2 }),
      $(go.Shape, { toArrow: "Standard", strokeWidth: 2 }),
      $(go.TextBlock,  // Branch label
        { 
          segmentIndex: 0,
          segmentOffset: new go.Point(0, -20),
          alignmentFocus: go.Spot.Center,
          stroke: "black",
          font: "bold 12px sans-serif",
          background: "rgba(255,255,255,0.7)",
          margin: 2,
          editable: true  // Allow editing the label text
        },
        new go.Binding("text", "text").makeTwoWay()
      ),
      $("Panel", "Auto",  // the plus button
        { 
          _side: go.Link.OrientUp,
          segmentIndex: 0,
          segmentFraction: 0.5,
          alignmentFocus: new go.Spot(0, 0, 0, 20)
        },
        $(go.Shape, "Circle", 
          { 
            fill: "white", 
            stroke: "#42b983", 
            strokeWidth: 2,
            width: 20, 
            height: 20,
            cursor: "pointer"
          }),
        $(go.TextBlock, "+", 
          { 
            stroke: "#42b983", 
            font: "bold 12px sans-serif",
            cursor: "pointer"
          }),
        {
          click: function(e, obj) {
            e.handled = true;
            currentLink = obj.part;
            currentMidPoint = currentLink.midPoint;
            
            // Show the form near the click position
            showNodeTypeForm.value = true;
            formStyle.value = {
              left: (e.viewPoint.x + 20) + 'px',
              top: (e.viewPoint.y + 20) + 'px'
            };
          }
        }
      )
    );

  // Initialize model
  diagram.model = new go.GraphLinksModel(
    [
      { key: 0, category: "Start" },
      { key: 1, text: "Step 1", category: "Rectangle" },
      { key: 2, category: "End" },
    ],
    [
      { from: 0, to: 1 },
      { from: 1, to: 2 }
    ]
  );
});
</script>