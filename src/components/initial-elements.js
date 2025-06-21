import { MarkerType } from '@vue-flow/core'

export const initialNodes = [
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

export const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
        label: '+',
        labelBgStyle: {
            fill: '#ccc',
            rx: '50%',  // Makes the background circular
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