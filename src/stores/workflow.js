import { defineStore } from 'pinia';
import { VueFlow, useVueFlow, Position, MarkerType } from '@vue-flow/core'

export const useWorkflowStore = defineStore('workflow', {

    state: () => ({
        initialNodes: [
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
        ],
        initialEdges: [
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
                    fill: '#ccc',
                    rx: '50%',
                    ry: '50%',
                    width: '20px',
                    height: '20px',
                    transform: 'translate(-5px, 0px)',

                },
                labelStyle: {
                    fill: 'white',
                    fontWeight: 'bold',
                },
            },
        ],
        nodes: [],
        edges: [],
        labelCircleStyle: {
            fill: '#ccc',
            rx: '50%',
            ry: '50%',
            width: '20px',
            height: '20px',
            transform: 'translate(-5px, 0px)',
        },

        labelTextStyle: {
            fill: 'white',
            fontWeight: 'bold',
        },

        dotEndStyle: {
            type: MarkerType.Dot,
            color: 'yellow',
            width: 10,
            height: 10,
        },
    }),
    actions: {
        setNodes(nodes) {
            this.nodes = nodes;
        },
        setEdges(edges) {
            this.edges = edges;
        },
        addNodes(newNodes) {
            this.nodes = [...this.nodes, ...newNodes];
        },
        addEdges(newEdges) {
            this.edges = [...this.edges, ...newEdges];
        },
        removeNodes(ids) {
            this.nodes = this.nodes.filter(node => !ids.includes(node.id));
        },
        removeEdges(ids) {
            this.edges = this.edges.filter(edge => !ids.includes(edge.id));
        },
        updateNodes(updatedNodes) {
            this.nodes = this.nodes.map(node => {
                const updatedNode = updatedNodes.find(n => n.id === node.id);
                return updatedNode ? { ...node, ...updatedNode } : node;
            });
        }
    }
});