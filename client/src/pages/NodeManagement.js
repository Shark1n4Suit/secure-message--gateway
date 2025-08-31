import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Wifi, 
  Settings, 
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Network
} from 'lucide-react';
import { useMeshNetwork } from '../contexts/MeshNetworkContext';
import toast from 'react-hot-toast';

const NodeManagement = () => {
  const { 
    nodes, 
    createNode, 
    removeNode, 
    connectNodes,
    isLoading 
  } = useMeshNetwork();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);

  // Form states
  const [newNode, setNewNode] = useState({
    name: '',
    type: 'standard',
    capabilities: {}
  });

  const [connectionData, setConnectionData] = useState({
    sourceNode: '',
    targetNode: ''
  });

  // Filtered nodes
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesType;
  });

  // Node types
  const nodeTypes = [
    { value: 'standard', label: 'Standard Node', description: 'Basic mesh network node' },
    { value: 'router', label: 'Router Node', description: 'Advanced routing capabilities' },
    { value: 'gateway', label: 'Gateway Node', description: 'Network entry/exit point' },
    { value: 'sensor', label: 'Sensor Node', description: 'Data collection and monitoring' }
  ];

  // Handle node creation
  const handleCreateNode = async (e) => {
    e.preventDefault();
    
    if (!newNode.name.trim()) {
      toast.error('Node name is required');
      return;
    }

    try {
      await createNode(newNode);
      setShowCreateModal(false);
      setNewNode({ name: '', type: 'standard', capabilities: {} });
      toast.success(`Node '${newNode.name}' created successfully`);
    } catch (error) {
      console.error('Failed to create node:', error);
    }
  };

  // Handle node connection
  const handleConnectNodes = async (e) => {
    e.preventDefault();
    
    if (!connectionData.sourceNode || !connectionData.targetNode) {
      toast.error('Both source and target nodes are required');
      return;
    }

    if (connectionData.sourceNode === connectionData.targetNode) {
      toast.error('Cannot connect a node to itself');
      return;
    }

    try {
      await connectNodes(connectionData.sourceNode, connectionData.targetNode);
      setShowConnectModal(false);
      setConnectionData({ sourceNode: '', targetNode: '' });
      toast.success('Nodes connected successfully');
    } catch (error) {
      console.error('Failed to connect nodes:', error);
    }
  };

  // Handle node removal
  const handleRemoveNode = async (nodeName) => {
    if (window.confirm(`Are you sure you want to remove node '${nodeName}'?`)) {
      try {
        await removeNode(nodeName);
        toast.success(`Node '${nodeName}' removed successfully`);
      } catch (error) {
        console.error('Failed to remove node:', error);
      }
    }
  };

  // Copy node ID to clipboard
  const copyNodeId = (nodeId) => {
    navigator.clipboard.writeText(nodeId);
    toast.success('Node ID copied to clipboard');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Node Management</h1>
          <p className="text-gray-600">Create, connect, and manage mesh network nodes</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowConnectModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Wifi className="w-4 h-4" />
            <span>Connect Nodes</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Node</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Types</option>
            {nodeTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNodes.map((node) => (
          <div key={node.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  node.type === 'gateway' ? 'bg-purple-100' :
                  node.type === 'router' ? 'bg-blue-100' :
                  node.type === 'sensor' ? 'bg-green-100' :
                  'bg-gray-100'
                }`}>
                  <span className={`text-sm font-bold ${
                    node.type === 'gateway' ? 'text-purple-600' :
                    node.type === 'router' ? 'text-blue-600' :
                    node.type === 'sensor' ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {node.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{node.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{node.type} Node</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
                
                {selectedNode === node.id && (
                  <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={() => copyNodeId(node.id)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy ID</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNode(null);
                        // TODO: Implement edit functionality
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleRemoveNode(node.name)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Node ID:</span>
                <span className="font-mono text-xs text-gray-600 truncate max-w-24">
                  {node.id}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Connections:</span>
                <span className="font-medium text-gray-900">{node.connections || 0}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  node.status === 'active' ? 'bg-green-100 text-green-800' :
                  node.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {node.status || 'unknown'}
                </span>
              </div>

              {Object.keys(node.capabilities || {}).length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Capabilities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.keys(node.capabilities).map((capability) => (
                      <span
                        key={capability}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredNodes.length === 0 && (
        <div className="text-center py-12">
          <Network className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No nodes found</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first node'
            }
          </p>
        </div>
      )}

      {/* Create Node Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Node</h2>
            
            <form onSubmit={handleCreateNode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  value={newNode.name}
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter node name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Type
                </label>
                <select
                  value={newNode.type}
                  onChange={(e) => setNewNode({ ...newNode, type: e.target.value })}
                  className="input-field"
                >
                  {nodeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {nodeTypes.find(t => t.value === newNode.type)?.description}
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Nodes Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect Nodes</h2>
            
            <form onSubmit={handleConnectNodes} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Node
                </label>
                <select
                  value={connectionData.sourceNode}
                  onChange={(e) => setConnectionData({ ...connectionData, sourceNode: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select source node</option>
                  {nodes.map(node => (
                    <option key={node.id} value={node.name}>{node.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Node
                </label>
                <select
                  value={connectionData.targetNode}
                  onChange={(e) => setConnectionData({ ...connectionData, targetNode: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select target node</option>
                  {nodes.map(node => (
                    <option key={node.id} value={node.name}>{node.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Connecting...' : 'Connect Nodes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeManagement;
