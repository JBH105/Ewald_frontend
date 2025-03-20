import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

const CustomNode = memo(({ id, data, deleteNode }) => {
    return (
      <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#fff' }}>
        <div>{data.label}</div>
        {id != "1" && <button
          onClick={() => deleteNode(id)}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: 'red',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            cursor: 'pointer',
          }}
        >
          X
        </button>}
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    );
})
  
export default CustomNode