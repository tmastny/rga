import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './components/ui/tooltip';
import { ChevronDown, ChevronRight, Info, RefreshCw } from 'lucide-react';

interface RGANode {
  id: string;
  value: string;
  timestamp: number;
  previousId: string | null;
  removed: boolean;
  author: 'user1' | 'user2';
}

const RGAEditorDemo = () => {
  const [user1Nodes, setUser1Nodes] = useState<RGANode[]>([]);
  const [user2Nodes, setUser2Nodes] = useState<RGANode[]>([]);
  const [networkDelay, setNetworkDelay] = useState(1000);
  const [showStructure, setShowStructure] = useState(true);
  const [cursorPos, setCursorPos] = useState<{ user1: number; user2: number }>({ user1: 0, user2: 0 });
  const user1EditorRef = useRef<HTMLDivElement>(null);
  const user2EditorRef = useRef<HTMLDivElement>(null);

  // Generate initial root node
  useEffect(() => {
    const rootNode: RGANode = {
      id: 'root',
      value: '',
      timestamp: 0,
      previousId: null,
      removed: false,
      author: 'user1'
    };
    setUser1Nodes([rootNode]);
    setUser2Nodes([rootNode]);
  }, []);

  const visibleNodes = useCallback((nodes: RGANode[]) => 
    nodes.filter(n => !n.removed), []);

  const findInsertPosition = useCallback((position: number, nodes: RGANode[]) => {
    const vnodes = visibleNodes(nodes);
    return position > 0 ? vnodes[position - 1]?.id || 'root' : 'root';
  }, [visibleNodes]);

  const applyOperation = useCallback((nodes: RGANode[], newNode: RGANode) => {
    const insertIndex = nodes.findIndex(n => n.id === newNode.previousId) + 1;
    if (insertIndex === 0) return nodes;

    // Check for existing node (conflict case)
    const existingIndex = nodes.findIndex(n => n.id === newNode.id);
    if (existingIndex !== -1) {
      // Last-write-wins conflict resolution
      if (nodes[existingIndex].timestamp >= newNode.timestamp) {
        return nodes;
      }
      // Replace existing node
      const updatedNodes = [...nodes];
      updatedNodes[existingIndex] = newNode;
      return updatedNodes;
    }

    // Insert new node
    return [
      ...nodes.slice(0, insertIndex),
      newNode,
      ...nodes.slice(insertIndex)
    ];
  }, []);

  const handleInsert = useCallback((
    value: string, 
    position: number, 
    author: 'user1' | 'user2',
    immediateUpdate: boolean
  ) => {
    const sourceNodes = author === 'user1' ? user1Nodes : user2Nodes;
    const previousId = findInsertPosition(position, sourceNodes);
    
    const newNode: RGANode = {
      id: Math.random().toString(36).substr(2, 9),
      value,
      timestamp: Date.now(),
      previousId,
      removed: false,
      author
    };

    // Local update
    if (immediateUpdate) {
      if (author === 'user1') {
        setUser1Nodes(nodes => applyOperation(nodes, newNode));
      } else {
        setUser2Nodes(nodes => applyOperation(nodes, newNode));
      }
    }

    // Remote update with delay
    setTimeout(() => {
      if (author === 'user1') {
        setUser2Nodes(nodes => applyOperation(nodes, newNode));
      } else {
        setUser1Nodes(nodes => applyOperation(nodes, newNode));
      }
    }, networkDelay);

    setCursorPos(prev => ({
      ...prev,
      [author]: prev[author] + 1
    }));
  }, [applyOperation, findInsertPosition, networkDelay, user1Nodes, user2Nodes]);

  const handleDelete = useCallback((
    position: number,
    author: 'user1' | 'user2',
    immediateUpdate: boolean
  ) => {
    const sourceNodes = author === 'user1' ? user1Nodes : user2Nodes;
    const vnodes = visibleNodes(sourceNodes);
    const targetNode = vnodes[position];
    if (!targetNode) return;

    const updatedNode = { 
      ...targetNode, 
      removed: true,
      timestamp: Date.now() // Update timestamp for conflict resolution
    };

    // Local update
    if (immediateUpdate) {
      if (author === 'user1') {
        setUser1Nodes(nodes => nodes.map(n => n.id === targetNode.id ? updatedNode : n));
      } else {
        setUser2Nodes(nodes => nodes.map(n => n.id === targetNode.id ? updatedNode : n));
      }
    }

    // Remote update with delay
    setTimeout(() => {
      if (author === 'user1') {
        setUser2Nodes(nodes => nodes.map(n => n.id === targetNode.id ? updatedNode : n));
      } else {
        setUser1Nodes(nodes => nodes.map(n => n.id === targetNode.id ? updatedNode : n));
      }
    }, networkDelay);

    setCursorPos(prev => ({
      ...prev,
      [author]: Math.max(0, prev[author] - 1)
    }));
  }, [networkDelay, user1Nodes, user2Nodes, visibleNodes]);

  const handleKeyDown = (author: 'user1' | 'user2') => (e: React.KeyboardEvent) => {
    e.preventDefault();
    const targetNodes = author === 'user1' ? user1Nodes : user2Nodes;
    
    if (e.key === 'Backspace' && cursorPos[author] > 0) {
      handleDelete(cursorPos[author] - 1, author, true);
    } else if (e.key === 'ArrowLeft') {
      setCursorPos(prev => ({ 
        ...prev, 
        [author]: Math.max(0, prev[author] - 1) 
      }));
    } else if (e.key === 'ArrowRight') {
      setCursorPos(prev => ({ 
        ...prev, 
        [author]: Math.min(visibleNodes(targetNodes).length, prev[author] + 1) 
      }));
    } else if (e.key.length === 1) {
      handleInsert(e.key, cursorPos[author], author, true);
    }
  };

  const renderEditor = (nodes: RGANode[], author: 'user1' | 'user2') => {
    const vnodes = visibleNodes(nodes);
    const editorRef = author === 'user1' ? user1EditorRef : user2EditorRef;

    return (
      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-2 flex items-center">
          <span style={{ color: author === 'user1' ? '#3b82f6' : '#22c55e' }}>
            User {author === 'user1' ? '1' : '2'}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            (Type to edit)
          </span>
        </h3>
        <div
          ref={editorRef}
          className="font-mono bg-gray-50 p-4 rounded min-h-32 whitespace-pre-wrap outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleKeyDown(author)}
          tabIndex={0}
        >
          {vnodes.map((node, index) => (
            <span
              key={node.id}
              className={`relative group ${index === cursorPos[author] ? 'bg-blue-100' : ''}`}
              style={{ color: node.author === 'user1' ? '#3b82f6' : '#22c55e' }}
            >
              {node.value}
              <span className="absolute -top-4 left-0 text-xs opacity-0 group-hover:opacity-100">
                {node.id.slice(0, 4)}
              </span>
            </span>
          ))}
          <span 
            className="w-0.5 h-5 inline-block animate-pulse"
            style={{ 
              backgroundColor: author === 'user1' ? '#3b82f6' : '#22c55e',
              marginLeft: '0.5px'
            }}
          ></span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Collaborative RGA Text Editor
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Real-time collaborative text editor using RGA CRDT</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            {renderEditor(user1Nodes, 'user1')}
            {renderEditor(user2Nodes, 'user2')}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={networkDelay}
              onChange={(e) => setNetworkDelay(Number(e.target.value))}
              className="border p-2 rounded w-32"
              placeholder="Delay (ms)"
            />
            <Button
              onClick={() => {
                const rootNode: RGANode = {
                  id: 'root',
                  value: '',
                  timestamp: 0,
                  previousId: null,
                  removed: false,
                  author: 'user1'
                };
                setUser1Nodes([rootNode]);
                setUser2Nodes([rootNode]);
                setCursorPos({ user1: 0, user2: 0 });
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset State
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center gap-2 mb-2 cursor-pointer" 
                onClick={() => setShowStructure(!showStructure)}>
              {showStructure ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <h3 className="font-semibold">RGA Internal Structure</h3>
            </div>
            
            {showStructure && (
              <div className="space-y-2">
                {user1Nodes.map((node) => (
                  <div key={node.id} className="p-2 bg-white rounded border text-sm">
                    <div className="flex gap-2">
                      <span className="font-mono">{node.id.slice(0, 4)}</span>
                      <span 
                        className={`px-2 ${node.removed ? 'line-through text-red-500' : ''}`}
                        style={{ color: node.author === 'user1' ? '#3b82f6' : '#22c55e' }}
                      >
                        {node.value || '◼ root'}
                      </span>
                      <span className="text-gray-500">
                        ← {node.previousId?.slice(0, 4) || 'null'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Author: {node.author} | Timestamp: {node.timestamp}
                      {node.removed && <span className="ml-2 text-red-500">(removed)</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RGAEditorDemo;