import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { ChevronDown, ChevronRight, Info, RefreshCw } from 'lucide-react';

interface RGANode {
  id: string;
  value: string;
  timestamp: number;
  previousId: string | null;
  removed: boolean;
  author: 'user1' | 'user2';
}

type Example = {
  title: string;
  description: string;
  user1Text: string;
  user2Text: string;
  user1Nodes: RGANode[];
  user2Nodes: RGANode[];
};

const examples: Example[] = [
  {
    title: "Concurrent Insertion Ordering",
    description: "Two users insert different characters after 'h' at nearly the same time. When synced, they should appear in timestamp order.",
    user1Text: "h1",
    user2Text: "h2",
    user1Nodes: [
      {
        id: 'root',
        value: '',
        timestamp: 0,
        previousId: null,
        removed: false,
        author: 'user1'
      },
      {
        id: 'e2l2',
        value: 'h',
        timestamp: 1737859284865,
        previousId: 'root',
        removed: false,
        author: 'user1'
      },
      {
        id: 'vsmg',
        value: '1',
        timestamp: 1737859295511,
        previousId: 'e2l2',
        removed: false,
        author: 'user1'
      }
    ],
    user2Nodes: [
      {
        id: 'root',
        value: '',
        timestamp: 0,
        previousId: null,
        removed: false,
        author: 'user1'
      },
      {
        id: 'e2l2',
        value: 'h',
        timestamp: 1737859284865,
        previousId: 'root',
        removed: false,
        author: 'user1'
      },
      {
        id: 'nvb8',
        value: '2',
        timestamp: 1737859299411,
        previousId: 'e2l2',
        removed: false,
        author: 'user2'
      }
    ]
  },
  {
    title: "Concurrent Delete and Insert",
    description: "User1 deletes 'hello' while User2 inserts a character in the middle. When synced, the deletion is preserved while maintaining the new insertion.",
    user1Text: "",  // After deleting "hello"
    user2Text: "helXlo",  // After inserting "X"
    user1Nodes: [
      {
        id: 'root',
        value: '',
        timestamp: 0,
        previousId: null,
        removed: false,
        author: 'user1'
      },
      {
        id: 'h1',
        value: 'h',
        timestamp: 1006,  // Later timestamp when deleted
        previousId: 'root',
        removed: true,
        author: 'user1'
      },
      {
        id: 'e1',
        value: 'e',
        timestamp: 1007,  // Later timestamp when deleted
        previousId: 'h1',
        removed: true,
        author: 'user1'
      },
      {
        id: 'l1',
        value: 'l',
        timestamp: 1008,  // Later timestamp when deleted
        previousId: 'e1',
        removed: true,
        author: 'user1'
      },
      {
        id: 'l2',
        value: 'l',
        timestamp: 1009,  // Later timestamp when deleted
        previousId: 'l1',
        removed: true,
        author: 'user1'
      },
      {
        id: 'o1',
        value: 'o',
        timestamp: 1010,  // Later timestamp when deleted
        previousId: 'l2',
        removed: true,
        author: 'user1'
      }
    ],
    user2Nodes: [
      {
        id: 'root',
        value: '',
        timestamp: 0,
        previousId: null,
        removed: false,
        author: 'user1'
      },
      {
        id: 'h1',
        value: 'h',
        timestamp: 1000,
        previousId: 'root',
        removed: false,
        author: 'user1'
      },
      {
        id: 'e1',
        value: 'e',
        timestamp: 1001,
        previousId: 'h1',
        removed: false,
        author: 'user1'
      },
      {
        id: 'l1',
        value: 'l',
        timestamp: 1002,
        previousId: 'e1',
        removed: false,
        author: 'user1'
      },
      {
        id: 'x1',
        value: 'X',
        timestamp: 1005,  // Inserted after the deletions
        previousId: 'l1',
        removed: false,
        author: 'user2'
      },
      {
        id: 'l2',
        value: 'l',
        timestamp: 1003,
        previousId: 'l1',
        removed: false,
        author: 'user1'
      },
      {
        id: 'o1',
        value: 'o',
        timestamp: 1004,
        previousId: 'l2',
        removed: false,
        author: 'user1'
      }
    ]
  },
  {
    title: "Delete Range with Mixed States",
    description: "User1 deletes 'b' and 'd', then User2 deletes 'abc'. The final state correctly handles overlapping deletions.",
    user1Text: "ace",  // Shows 'ace' after deleting 'b' and 'd'
    user2Text: "de",   // Shows 'de' after deleting 'abc'
    user1Nodes: [
      {
        id: 'root',
        value: '',
        timestamp: 0,
        previousId: null,
        removed: false,
        author: 'user1'
      },
      {
        id: 'a1',
        value: 'a',
        timestamp: 1000,
        previousId: 'root',
        removed: false,
        author: 'user1'
      },
      {
        id: 'b1',
        value: 'b',
        timestamp: 1006,  // Later timestamp for deletion
        previousId: 'a1',
        removed: true,
        author: 'user1'
      },
      {
        id: 'c1',
        value: 'c',
        timestamp: 1002,
        previousId: 'b1',
        removed: false,
        author: 'user1'
      },
      {
        id: 'd1',
        value: 'd',
        timestamp: 1007,  // Later timestamp for deletion
        previousId: 'c1',
        removed: true,
        author: 'user1'
      },
      {
        id: 'e1',
        value: 'e',
        timestamp: 1004,
        previousId: 'd1',
        removed: false,
        author: 'user1'
      }
    ],
    user2Nodes: [
      {
        id: 'root',
        value: '',
        timestamp: 0,
        previousId: null,
        removed: false,
        author: 'user1'
      },
      {
        id: 'a1',
        value: 'a',
        timestamp: 1008,  // Later timestamp for deletion
        previousId: 'root',
        removed: true,
        author: 'user2'
      },
      {
        id: 'b1',
        value: 'b',
        timestamp: 1001,
        previousId: 'a1',
        removed: false,
        author: 'user1'
      },
      {
        id: 'c1',
        value: 'c',
        timestamp: 1009,  // Later timestamp for deletion
        previousId: 'b1',
        removed: true,
        author: 'user2'
      },
      {
        id: 'd1',
        value: 'd',
        timestamp: 1003,
        previousId: 'c1',
        removed: false,
        author: 'user1'
      },
      {
        id: 'e1',
        value: 'e',
        timestamp: 1004,
        previousId: 'd1',
        removed: false,
        author: 'user1'
      }
    ]
  }
];

const RGAEditorDemo = () => {
  const [user1Nodes, setUser1Nodes] = useState<RGANode[]>([]);
  const [user2Nodes, setUser2Nodes] = useState<RGANode[]>([]);
  const [networkDelay, setNetworkDelay] = useState(1000);
  const [showStructure, setShowStructure] = useState(true);
  const [cursorPos, setCursorPos] = useState<{ user1: number; user2: number }>({ user1: 0, user2: 0 });
  const user1EditorRef = useRef<HTMLDivElement>(null);
  const user2EditorRef = useRef<HTMLDivElement>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

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
    if (position === 0) return 'root';
    
    const targetNode = vnodes[position];  
    return targetNode?.id || 'root';
  }, [visibleNodes]);

  const applyOperation = useCallback((nodes: RGANode[], newNode: RGANode) => {
    // Check for existing node (conflict case)
    const existingIndex = nodes.findIndex(n => n.id === newNode.id);
    if (existingIndex !== -1) {
      if (nodes[existingIndex].timestamp >= newNode.timestamp) {
        return nodes;
      }
      const updatedNodes = [...nodes];
      updatedNodes[existingIndex] = newNode;
      return updatedNodes;
    }

    // Find all nodes that share the same previousId
    const insertAfterNode = nodes.find(n => n.id === newNode.previousId);
    if (!insertAfterNode) return nodes;

    // Get the base insert index
    let insertIndex = nodes.indexOf(insertAfterNode) + 1;
    
    // Move insertion point forward past any siblings with earlier timestamps
    while (insertIndex < nodes.length && 
           nodes[insertIndex].previousId === newNode.previousId && 
           nodes[insertIndex].timestamp < newNode.timestamp) {
      insertIndex++;
    }

    return [
      ...nodes.slice(0, insertIndex),
      newNode,
      ...nodes.slice(insertIndex)
    ];
  }, []);

  const updateNodes = useCallback((author: 'user1' | 'user2', node: RGANode, immediateUpdate: boolean) => {
    const setLocalNodes = author === 'user1' ? setUser1Nodes : setUser2Nodes;
    const setRemoteNodes = author === 'user1' ? setUser2Nodes : setUser1Nodes;
    
    // Local update (immediate)
    if (immediateUpdate) {
      setLocalNodes(nodes => applyOperation(nodes, node));
    }

    // Remote update (delayed)
    if (!isOffline) {
      setTimeout(() => {
        setRemoteNodes(nodes => applyOperation(nodes, node));
      }, networkDelay);
    }
  }, [networkDelay, isOffline, applyOperation]);

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

    updateNodes(author, newNode, immediateUpdate);

    setCursorPos(prev => ({
      ...prev,
      [author]: prev[author] + 1
    }));
  }, [findInsertPosition, networkDelay, user1Nodes, user2Nodes, isOffline, updateNodes]);

  const handleDelete = useCallback((
    position: number,
    author: 'user1' | 'user2',
    immediateUpdate: boolean
  ) => {
    const sourceNodes = author === 'user1' ? user1Nodes : user2Nodes;
    const vnodes = visibleNodes(sourceNodes);
    
    // Adjust position to account for root node
    const targetNode = vnodes[position + 1];  // Add 1 to skip root
    if (!targetNode) return;

    const updatedNode = { 
      ...targetNode, 
      removed: true,
      timestamp: Date.now() // Update timestamp for conflict resolution
    };

    updateNodes(author, updatedNode, immediateUpdate);

    setCursorPos(prev => ({
      ...prev,
      [author]: Math.max(0, prev[author] - 1)
    }));

    // Remote update only if not offline
    if (!isOffline) {
      setTimeout(() => {
        if (author === 'user1') {
          setUser2Nodes(nodes => nodes.map(n => n.id === targetNode.id ? updatedNode : n));
        } else {
          setUser1Nodes(nodes => nodes.map(n => n.id === targetNode.id ? updatedNode : n));
        }
      }, networkDelay);
    }
  }, [visibleNodes, networkDelay, user1Nodes, user2Nodes, isOffline, updateNodes]);

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

    const handleEditorClick = (e: React.MouseEvent) => {
      const rect = editorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = e.clientX - rect.left;
      const chars = editorRef.current?.getElementsByClassName('char-span');
      if (!chars) return;

      // Handle empty editor case - only count non-root nodes
      const vnodes = visibleNodes(author === 'user1' ? user1Nodes : user2Nodes);
      // Filter out the root node when checking if editor is empty
      const nonRootNodes = vnodes.filter(node => node.id !== 'root');
      if (nonRootNodes.length === 0) {
        setCursorPos(prev => ({
          ...prev,
          [author]: 0
        }));
        return;
      }

      // If clicked past the last character
      const lastChar = chars[chars.length - 1];
      if (lastChar) {
        const lastCharRect = lastChar.getBoundingClientRect();
        if (clickX > lastCharRect.right - rect.left) {
          setCursorPos(prev => ({
            ...prev,
            [author]: chars.length
          }));
          return;
        }
      }

      // Otherwise find closest character as before
      let closestIndex = 0;
      let minDistance = Infinity;

      Array.from(chars).forEach((char, index) => {
        const charRect = char.getBoundingClientRect();
        const charMiddle = charRect.left + charRect.width / 2 - rect.left;
        const distance = Math.abs(clickX - charMiddle);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setCursorPos(prev => ({
        ...prev,
        [author]: closestIndex
      }));
    };

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
          className="font-mono bg-gray-50 p-4 rounded min-h-32 whitespace-pre-wrap outline-none focus-visible:ring-2 focus-visible:ring-blue-500 caret-transparent"
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleKeyDown(author)}
          onClick={handleEditorClick}
          tabIndex={0}
        >
          {vnodes.map((node, index) => (
            <span
              key={node.id}
              className="relative group char-span"
              style={{ color: node.author === 'user1' ? '#3b82f6' : '#22c55e' }}
            >
              {node.value}
              {index === cursorPos[author] + 1 && (
                <span 
                  className="absolute w-0.5 h-5 animate-pulse"
                  style={{ 
                    backgroundColor: author === 'user1' ? '#3b82f6' : '#22c55e',
                    left: '-1px'
                  }}
                ></span>
              )}
            </span>
          ))}
          <span className="relative char-span">
            {cursorPos[author] === vnodes.length - 1 && (
              <span 
                className="absolute w-0.5 h-5 animate-pulse"
                style={{ 
                  backgroundColor: author === 'user1' ? '#3b82f6' : '#22c55e',
                  left: '-1px'
                }}
              ></span>
            )}
          </span>
        </div>
      </div>
    );
  };

  // Watch for offline mode changes
  useEffect(() => {
    if (!isOffline) {
      // Sync user1's nodes to user2
      user1Nodes.forEach(node => {
        updateNodes('user1', node, false);
      });

      // Sync user2's nodes to user1
      user2Nodes.forEach(node => {
        updateNodes('user2', node, false);
      });
    }
  }, [isOffline, user1Nodes, user2Nodes, updateNodes]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <h1 className="text-2xl font-bold mb-8">Collaborative RGA Text Editor</h1>
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

            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isOffline}
                  onChange={(e) => setIsOffline(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">Offline Mode</span>
              </label>
            </div>

            {isOffline && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ Offline Mode: Changes won't sync between users until online
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-center gap-2 mb-2 cursor-pointer" 
                  onClick={() => setShowStructure(!showStructure)}>
                {showStructure ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <h3 className="font-semibold">RGA Internal Structure</h3>
              </div>
              
              {showStructure && (
                <div className="flex gap-4">
                  {/* User 1's Structure */}
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-sm" style={{ color: '#3b82f6' }}>User 1 Structure</h4>
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

                  {/* User 2's Structure */}
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-sm" style={{ color: '#22c55e' }}>User 2 Structure</h4>
                    {user2Nodes.map((node) => (
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
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2 cursor-pointer" 
                  onClick={() => setShowExamples(!showExamples)}>
                {showExamples ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <h3 className="font-semibold">Examples</h3>
              </div>
              
              {showExamples && (
                <div className="space-y-4">
                  {examples.map((example, index) => (
                    <div key={index} className="p-4 bg-white rounded border">
                      <h4 className="font-semibold mb-2">{example.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{example.description}</p>
                      <button
                        onClick={() => {
                          setIsOffline(true);
                          setUser1Nodes(example.user1Nodes);
                          setUser2Nodes(example.user2Nodes);
                          setCursorPos({ user1: example.user1Text.length + 1, user2: example.user2Text.length + 1 });
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Load Example
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Built by <a 
          href="https://timmastny.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Tim Mastny
        </a>
      </div>
    </div>
  );
};

export default RGAEditorDemo;