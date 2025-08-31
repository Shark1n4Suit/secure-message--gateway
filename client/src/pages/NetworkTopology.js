import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Wifi, Activity, Network, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useMeshNetwork } from '../contexts/MeshNetworkContext';
import ForceGraph3D from 'react-force-graph-3d';

const NetworkTopology = () => {
  const { topology, networkStats, isConnected } = useMeshNetwork();
  const graphRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [showLabels, setShowLabels] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isGraphReady, setIsGraphReady] = useState(false);

  // Transform topology data for 3D graph
  useEffect(() => {
    if (topology && topology.nodes && topology.connections) {
      try {
        // Create a map of node names for quick lookup
        const nodeMap = new Map();
        topology.nodes.forEach(node => {
          if (node.name && node.id) {
            nodeMap.set(node.name, node.id);
          }
        });

        // Ensure we have valid nodes
        if (nodeMap.size === 0) {
          setIsGraphReady(false);
          return;
        }

        const nodes = topology.nodes
          .filter(node => node.name && node.id) // Only include valid nodes
          .map((node, index) => {
            // Calculate better positioning for nodes - centered and visible
            const angle = (index / topology.nodes.length) * 2 * Math.PI;
            const radius = 200; // Smaller radius for better centering
            const height = 50; // Small height variation
            
            return {
              id: node.id,
              name: node.name,
              type: node.type || 'standard',
              connections: node.connections || 0,
              trustScore: node.trustScore || 100,
              status: node.status || 'active',
              // Better 3D positioning - nodes in a centered circle pattern
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
              z: height * Math.sin(index * 0.5) // Gentle wave pattern
            };
          });

        // Filter connections to only include valid node references
        const validLinks = topology.connections
          .filter(connection => {
            if (!connection.sourceNode || !connection.targetNode) return false;
            const sourceExists = nodeMap.has(connection.sourceNode);
            const targetExists = nodeMap.has(connection.targetNode);
            return sourceExists && targetExists;
          })
          .map(connection => {
            // Find the actual node objects for source and target
            const sourceNode = nodes.find(n => n.name === connection.sourceNode);
            const targetNode = nodes.find(n => n.name === connection.targetNode);
            
            if (!sourceNode || !targetNode) {
              console.warn('Invalid connection:', connection);
              return null;
            }
            
            return {
              id: connection.id || `link-${connection.sourceNode}-${connection.targetNode}`,
              source: sourceNode.id, // Use node ID instead of name
              target: targetNode.id, // Use node ID instead of name
              type: connection.type || 'standard',
              securityLevel: connection.securityLevel || 'medium',
              encryptionAlgorithm: connection.encryptionAlgorithm || 'AES-256',
              messageCount: connection.messageCount || 0
            };
          })
          .filter(link => link !== null); // Remove any null links

        // Only set graph data if we have valid data
        if (nodes.length > 0) {
          // Final validation: ensure all links reference valid node IDs
          const finalLinks = validLinks.filter(link => {
            const sourceExists = nodes.some(n => n.id === link.source);
            const targetExists = nodes.some(n => n.id === link.target);
            if (!sourceExists || !targetExists) {
              console.warn('Filtering out invalid link:', link);
              return false;
            }
            return true;
          });
          
          console.log('Setting graph data:', { 
            nodes: nodes.length, 
            links: finalLinks.length,
            nodeIds: nodes.map(n => n.id),
            linkSources: finalLinks.map(l => l.source),
            linkTargets: finalLinks.map(l => l.target)
          });
          
          setGraphData({ nodes, links: finalLinks });
          setIsGraphReady(true);
        } else {
          console.log('No valid nodes found');
          setIsGraphReady(false);
        }
      } catch (error) {
        console.error('Error processing topology data:', error);
        setIsGraphReady(false);
      }
    } else {
      setIsGraphReady(false);
    }
  }, [topology]);

  // Handle node click
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    // Center the graph on the selected node using correct method
    if (graphRef.current) {
      try {
        // Get the node's current position
        const nodePosition = {
          x: node.x || 0,
          y: node.y || 0,
          z: node.z || 0
        };
        
        // Calculate camera position to center on the node
        const distance = 500; // Distance from node
        const cameraPosition = {
          x: nodePosition.x,
          y: nodePosition.y,
          z: nodePosition.z + distance
        };
        
        // Use the correct method to position camera
        graphRef.current.cameraPosition(cameraPosition, nodePosition, 1000);
      } catch (error) {
        console.warn('Could not center camera on node:', error);
      }
    }
  }, []);

  // Handle link click
  const handleLinkClick = useCallback((link) => {
    console.log('Link clicked:', link);
  }, []);

  // Reset camera position
  const resetCamera = useCallback(() => {
    if (graphRef.current) {
      try {
        // Better centered view
        const centerPosition = { x: 0, y: 0, z: 0 };
        const cameraPosition = { x: 0, y: 0, z: 800 };
        graphRef.current.cameraPosition(cameraPosition, centerPosition, 1000);
      } catch (error) {
        console.warn('Could not reset camera:', error);
      }
    }
  }, []);

  // Zoom in
  const zoomIn = useCallback(() => {
    if (graphRef.current) {
      try {
        const currentCamera = graphRef.current.cameraPosition();
        const newDistance = Math.max(100, currentCamera.z * 0.8);
        const newCameraPosition = { ...currentCamera, z: newDistance };
        graphRef.current.cameraPosition(newCameraPosition, undefined, 1000);
      } catch (error) {
        console.warn('Could not zoom in:', error);
      }
    }
  }, []);

  // Zoom out
  const zoomOut = useCallback(() => {
    if (graphRef.current) {
      try {
        const currentCamera = graphRef.current.cameraPosition();
        const newDistance = Math.min(2000, currentCamera.z * 1.2);
        const newCameraPosition = { ...currentCamera, z: newDistance };
        graphRef.current.cameraPosition(newCameraPosition, undefined, 1000);
      } catch (error) {
        console.warn('Could not zoom out:', error);
      }
    }
  }, []);

  // Enhanced camera controls with keyboard support
  const moveCamera = useCallback((direction) => {
    if (graphRef.current) {
      try {
        const currentCamera = graphRef.current.cameraPosition();
        const step = 100;
        
        switch (direction) {
          case 'forward':
            graphRef.current.cameraPosition({ ...currentCamera, z: currentCamera.z - step }, undefined, 500);
            break;
          case 'backward':
            graphRef.current.cameraPosition({ ...currentCamera, z: currentCamera.z + step }, undefined, 500);
            break;
          case 'left':
            graphRef.current.cameraPosition({ ...currentCamera, x: currentCamera.x - step }, undefined, 500);
            break;
          case 'right':
            graphRef.current.cameraPosition({ ...currentCamera, x: currentCamera.x + step }, undefined, 500);
            break;
          case 'up':
            graphRef.current.cameraPosition({ ...currentCamera, y: currentCamera.y - step }, undefined, 500);
            break;
          case 'down':
            graphRef.current.cameraPosition({ ...currentCamera, y: currentCamera.y + step }, undefined, 500);
            break;
          case 'rotateLeft':
            graphRef.current.cameraPosition({ ...currentCamera, x: currentCamera.x - step }, undefined, 500);
            break;
          case 'rotateRight':
            graphRef.current.cameraPosition({ ...currentCamera, x: currentCamera.x + step }, undefined, 500);
            break;
          default:
            break;
        }
      } catch (error) {
        console.warn('Could not move camera:', error);
      }
    }
  }, []);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          moveCamera('forward');
          break;
        case 's':
          moveCamera('backward');
          break;
        case 'a':
          moveCamera('left');
          break;
        case 'd':
          moveCamera('right');
          break;
        case 'q':
          moveCamera('up');
          break;
        case 'e':
          moveCamera('down');
          break;
        case 'r':
          resetCamera();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveCamera, resetCamera]);

  // Get node color based on type
  const getNodeColor = (nodeType) => {
    switch (nodeType) {
      case 'gateway': return '#8b5cf6'; // Purple
      case 'router': return '#3b82f6'; // Blue
      case 'sensor': return '#10b981'; // Green
      case 'standard': return '#6b7280'; // Gray
      default: return '#6b7280';
    }
  };

  // Get link color based on security
  const getLinkColor = (securityType) => {
    return securityType === 'secure' ? '#10b981' : '#f59e0b';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network Topology</h1>
          <p className="text-gray-600">Visualize and monitor your mesh network structure</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-600' : 'bg-red-600'
            }`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network Health</p>
              <p className="text-2xl font-bold text-gray-900">
                {networkStats?.health || 'Unknown'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Connections</p>
              <p className="text-2xl font-bold text-gray-900">
                {networkStats?.totalConnections || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wifi className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network Type</p>
              <p className="text-2xl font-bold text-gray-900">Mesh</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Network className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Debug Info (Development Only)</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Topology Available:</strong> {topology ? 'Yes' : 'No'}</p>
            <p><strong>Nodes Count:</strong> {topology?.nodes?.length || 0}</p>
            <p><strong>Connections Count:</strong> {topology?.connections?.length || 0}</p>
            <p><strong>Graph Ready:</strong> {isGraphReady ? 'Yes' : 'No'}</p>
            <p><strong>Graph Data Nodes:</strong> {graphData.nodes.length}</p>
            <p><strong>Graph Data Links:</strong> {graphData.links.length}</p>
            <p><strong>WebSocket Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
            {topology?.nodes && (
              <div>
                <p><strong>Node Names:</strong></p>
                <ul className="ml-4 text-xs">
                  {topology.nodes.map(node => (
                    <li key={node.id}>{node.name} ({node.type})</li>
                  ))}
                </ul>
              </div>
            )}
            {topology?.connections && (
              <div>
                <p><strong>Connection Details:</strong></p>
                <ul className="ml-4 text-xs">
                  {topology.connections.map(conn => (
                    <li key={conn.id}>{conn.sourceNode} → {conn.targetNode} ({conn.type})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D Topology Visualization */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">3D Network Topology</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={showLabels ? 'Hide Labels' : 'Show Labels'}
            >
              {showLabels ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={resetCamera}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Camera"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={zoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {topology && topology.nodes && topology.nodes.length > 0 ? (
          <div className="relative">
            {/* 3D Graph Container */}
            {isGraphReady && graphData.nodes.length > 0 && graphData.links.length >= 0 ? (
              <div className="w-full h-96 border border-gray-200 rounded-lg overflow-hidden relative">
                {/* 3D Navigation Instructions */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded z-10">
                  <div className="font-medium mb-1">3D Navigation:</div>
                  <div>🖱️ Left Drag: Rotate | Right Drag: Pan | Scroll: Zoom</div>
                  <div>⌨️ WASD: Move | QE: Rotate | R: Reset</div>
                </div>
                
                {/* Safety check: ensure all links reference valid nodes */}
                {(() => {
                  const allNodeIds = new Set(graphData.nodes.map(n => n.id));
                  const validLinks = graphData.links.filter(link => 
                    allNodeIds.has(link.source) && allNodeIds.has(link.target)
                  );
                  
                  if (validLinks.length !== graphData.links.length) {
                    console.warn('Some links were invalid, filtering them out');
                    setGraphData(prev => ({ ...prev, links: validLinks }));
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-red-50">
                        <p className="text-red-600">Data inconsistency detected, refreshing...</p>
                      </div>
                    );
                  }
                  
                  return (
                    <ForceGraph3D
                      ref={graphRef}
                      graphData={{ nodes: graphData.nodes, links: validLinks }}
                      nodeLabel={showLabels ? 'name' : null}
                      nodeColor={node => getNodeColor(node.type)}
                      nodeRelSize={8}
                      linkColor={link => getLinkColor(link.type)}
                      linkWidth={3}
                      linkDirectionalParticles={2}
                      linkDirectionalParticleSpeed={0.005}
                      onNodeClick={handleNodeClick}
                      onLinkClick={handleLinkClick}
                      backgroundColor="#f8fafc"
                      showNavInfo={true}
                      enableNodeDrag={true}
                      enableNavigationControls={true}
                      d3AlphaDecay={0.02}
                      d3VelocityDecay={0.1}
                      cooldownTicks={100}
                      // Enhanced 3D controls
                      enableZoomInteraction={true}
                      enablePanInteraction={true}
                      enableRotateInteraction={true}
                      // Better initial positioning
                      d3Force="link"
                      d3ForceLinkDistance={100}
                      d3ForceLinkIterations={10}
                      // Camera settings
                      cameraPosition={{ x: 0, y: 0, z: 600 }}
                      // Node positioning
                      d3ForceX={0}
                      d3ForceY={0}
                      d3ForceZ={0}
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="w-full h-96 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Preparing 3D visualization...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {!isGraphReady ? 'Validating network data...' : 'Building 3D graph...'}
                  </p>
                  {graphData.nodes.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Found {graphData.nodes.length} nodes, {graphData.links.length} connections
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Node Type Legend */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Node Types</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-gray-700">Gateway</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-700">Router</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-700">Sensor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-xs text-gray-700">Standard</span>
                </div>
              </div>
            </div>

            {/* Selected Node Info */}
            {selectedNode && (
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200 max-w-xs">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Node</h4>
                <div className="space-y-1 text-xs text-gray-700">
                  <p><strong>Name:</strong> {selectedNode.name}</p>
                  <p><strong>Type:</strong> {selectedNode.type}</p>
                  <p><strong>Connections:</strong> {selectedNode.connections}</p>
                  <p><strong>Trust Score:</strong> {selectedNode.trustScore}</p>
                  <p><strong>Status:</strong> {selectedNode.status}</p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Wifi className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p>No topology data available</p>
            <p className="text-sm text-gray-400 mt-2">Create some nodes to see the 3D network structure</p>
          </div>
        )}
      </div>

      {/* Topology Overview */}
      {topology && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nodes List */}
          {topology.nodes && topology.nodes.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Network Nodes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {topology.nodes.map((node) => (
                  <div key={node.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{node.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        node.type === 'gateway' ? 'bg-purple-100 text-purple-800' :
                        node.type === 'router' ? 'bg-blue-100 text-blue-800' :
                        node.type === 'sensor' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {node.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Connections: {node.connections}</p>
                      <p>Status: {node.status}</p>
                      <p>Trust Score: {node.trustScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connections List */}
          {topology.connections && topology.connections.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Network Connections</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {topology.connections.map((connection) => (
                  <div key={connection.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{connection.sourceNode}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-gray-900">{connection.targetNode}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          connection.type === 'secure' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {connection.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {connection.encryptionAlgorithm}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Messages: {connection.messageCount} | 
                      Established: {new Date(connection.establishedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Network Statistics */}
      {networkStats && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Network Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{networkStats.totalNodes || 0}</p>
              <p className="text-sm text-gray-600">Total Nodes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{networkStats.totalConnections || 0}</p>
              <p className="text-sm text-gray-600">Total Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{networkStats.averageConnectivity?.toFixed(2) || '0'}</p>
              <p className="text-sm text-gray-600">Avg Connectivity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{networkStats.networkDiameter || '0'}</p>
              <p className="text-sm text-gray-600">Network Diameter</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkTopology;
