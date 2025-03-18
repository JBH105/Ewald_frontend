import React, { useCallback, useEffect, useRef } from 'react';
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Position,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
 

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
}

const initialNode = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Node' },
    position: { x: 0, y: 50 },
    ...nodeDefaults
  },
];
 
let id = 1;
const getId = () => `${id++}`;
const nodeOrigin = [0.5, 0];
 
const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);
  const initialNodes = localStorage.getItem('nodes') ? JSON.parse(localStorage.getItem('nodes')) : initialNode
  const initialEdges = localStorage.getItem('edges') ? JSON.parse(localStorage.getItem('edges')) : []
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const timeoutRef = useRef(null);

  useEffect(() => {
    const saveFlow = () => {
      console.log("Flow is saved")
      localStorage.setItem("edges", JSON.stringify(edges));
      localStorage.setItem("nodes", JSON.stringify(nodes));
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      saveFlow();
    }, 1000)
  },[edges, nodes])
 
  const onConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid) {
        const id = getId();
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `Node ${id}` },
          origin: [0.5, 0.0],
          ...nodeDefaults
        };
 
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectionState.fromNode.id, target: id }),
        );
      }
    },
    [screenToFlowPosition],
  );
 
  return (
    <div className="wrapper" ref={reactFlowWrapper} style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow
        style={{ backgroundColor: "#F7F9FB" }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
    >
      <Background  />
    </ReactFlow>
    </div>
  );
};
 
export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);