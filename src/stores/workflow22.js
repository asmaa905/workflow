import { defineStore } from 'pinia';
import { VueFlow, useVueFlow, Position, MarkerType } from '@vue-flow/core'

export const useWorkflowStore = defineStore('workflow', {

    state: () => ({
        initialNodes: [
            {
                key: "start",
                category: "Start",
                id: "Start",
                actualId: "1",
                loc: "100 -150",
                text: "Start",
                parent: null,
                nextNode: '2',
                prevNode: null
            },
            {
                key: "end",
                category: "End",
                id: "End",
                actualId: "2",
                loc: "100 50",
                text: "End",
                parent: null,
                nextNode: null,
                prevNode: '1'
            }
        ],
        initialLines: [
            {
                from: "start",
                to: "end",
                hasPlusButton: true,
                text: "es-e"
            }
        ],
        nodes: [],
        lines: [],

        nodesJson: {
            "start": {
                "id": "start",
                "actualId": "start",
                "key": "start-2111114545",
                "category": "start",
                "loc": "100 100",
                "children": null,
                "parent": null
            },
            "end": {
                "id": "end",
                "actualId": "end",
                "key": "end-4555444",
                "category": "end",
                "loc": "100 1100",
                "children": null,
                "parent": null
            }
        },
        // nodes: Object.values({ ...this.nodesJson }),
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
            console.log("this.nodes", this.nodes)

        },
        setEdges(edges) {
            this.edges = edges;
        },
        setInitialNodes(nodes) {
            this.initialNodes = nodes;
        },
        setInitialLines(lines) {
            this.initailLines = lines;
        },
        addNodes(newNodes) {
            this.nodes = [...this.nodes, ...newNodes];
        },
        addEdges(newEdges) {
            this.edges = [...this.edges, ...newEdges];
        },
        removeNodes(ids) {
            this.nodes = this.nodes.filter(node => !ids.includes(node.key));
        },
        removeEdges(ids) {
            this.edges = this.edges.filter(edge => !ids.includes(edge.id));
        },
        updateNodes(updatedNodes) {
            this.nodes = this.nodes.map(node => {
                const updatedNode = updatedNodes.find(n => n.key === node.key);
                return updatedNode ? { ...node, ...updatedNode } : node;
            });
        }
    }
});