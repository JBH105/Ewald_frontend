import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import axiosInstance from './axiosInstance';
import CustomNode from './CustomNode';

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
}

const initialNode = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 0, y: 50 },
    ...nodeDefaults
  },
];

let id = 1;
const getId = () => `${++id}`;
const nodeOrigin = [0.5, 0];

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get('/node-edge-data/4/');
        setNodes(data?.data?.nodes || initialNode);
        if (data?.data?.nodes?.length > 0) {
          id = data?.data?.nodes?.length;
        }
        setEdges(data?.data?.edges || []);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const saveFlow = async () => {

      const payload = {
        data: {
          nodes: nodes,
          edges: edges,
        }
      }

      try {
        setSaving(true);
        await axiosInstance.put('/node-edge-data/4/', payload);
      } catch (error) {
        console.error(error);
      }
      setSaving(false);
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      saveFlow();
    }, 1000)
  }, [edges, nodes])

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
          type: 'input',
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

  const handleReset = async () => {

    const emptyPayload = {
      data: {
        nodes: initialNode,
        edges: [],
      }
    }

    try {
      setSaving(true);
      await axiosInstance.put('/node-edge-data/4/', emptyPayload);
      setNodes(initialNode);
      setEdges([]);
      id = 1;
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <div
      className="wrapper"
      ref={reactFlowWrapper}
      style={{ height: "100vh", width: "100vw" }}
    >
      <ReactFlow
        style={{ backgroundColor: "#F7F9FB" }}
        nodes={loading ? [] : nodes}
        edges={loading ? [] : edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
        nodeTypes={{
          "input": (props) =>  {
            return <CustomNode {...props} deleteNode={(id) => {
              setNodes((nds) => nds.filter((n) => n.id != id));
              setEdges((eds) => eds.filter((e) => e.source != id || e.target != id));
              id -= 1;
            }} />
          }
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Loading...
          </div>
        )}
        {saving && (
          <div
            style={{
              position: "absolute",
              top: "5%",
              right: "0%",
              transform: "translate(-50%, -50%)",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Saving...
          </div>
        )}
        {nodes?.length > 1 && (
          <button
            style={{
              position: 'absolute',
              top: '8%',
              left: '4%',
              transform: 'translate(-50%, -50%)',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '10px 20px',
              background: 'linear-gradient(145deg, #6e7bff, #3b49df)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              zIndex: 1000,
            }}
            onClick={handleReset}
          >
            Reset
          </button>
        )}
        <Background />
      </ReactFlow>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);