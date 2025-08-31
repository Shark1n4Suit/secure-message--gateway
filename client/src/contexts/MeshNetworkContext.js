import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// API base URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Initial state
const initialState = {
  nodes: [],
  topology: null,
  networkStats: null,
  securityStatus: null,
  messages: [],
  isConnected: false,
  isLoading: false,
  error: null,
  websocket: null
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NODES: 'SET_NODES',
  SET_TOPOLOGY: 'SET_TOPOLOGY',
  SET_NETWORK_STATS: 'SET_NETWORK_STATS',
  SET_SECURITY_STATUS: 'SET_SECURITY_STATUS',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_NODE: 'ADD_NODE',
  REMOVE_NODE: 'REMOVE_NODE',
  UPDATE_NODE: 'UPDATE_NODE',
  SET_WEBSOCKET: 'SET_WEBSOCKET',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_TOPOLOGY: 'UPDATE_TOPOLOGY'
};

// Reducer function
function meshNetworkReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ACTIONS.SET_NODES:
      return { ...state, nodes: action.payload, error: null };
    
    case ACTIONS.SET_TOPOLOGY:
      return { ...state, topology: action.payload, error: null };
    
    case ACTIONS.SET_NETWORK_STATS:
      return { ...state, networkStats: action.payload, error: null };
    
    case ACTIONS.SET_SECURITY_STATUS:
      return { ...state, securityStatus: action.payload, error: null };
    
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload, error: null };
    
    case ACTIONS.ADD_NODE:
      return { ...state, nodes: [...state.nodes, action.payload] };
    
    case ACTIONS.REMOVE_NODE:
      return { 
        ...state, 
        nodes: state.nodes.filter(node => node.name !== action.payload) 
      };
    
    case ACTIONS.UPDATE_NODE:
      return {
        ...state,
        nodes: state.nodes.map(node => 
          node.name === action.payload.name ? { ...node, ...action.payload } : node
        )
      };
    
    case ACTIONS.SET_WEBSOCKET:
      return { ...state, websocket: action.payload };
    
    case ACTIONS.SET_CONNECTION_STATUS:
      return { ...state, isConnected: action.payload };
    
    case ACTIONS.ADD_MESSAGE:
      return { 
        ...state, 
        messages: [action.payload, ...state.messages].slice(0, 100) 
      };
    
    case ACTIONS.UPDATE_TOPOLOGY:
      return { ...state, topology: action.payload };
    
    default:
      return state;
  }
}

// Create context
const MeshNetworkContext = createContext();

// Provider component
export function MeshNetworkProvider({ children }) {
  const [state, dispatch] = useReducer(meshNetworkReducer, initialState);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onopen = () => {
      dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: true });
      dispatch({ type: ACTIONS.SET_WEBSOCKET, payload: ws });
      
      // Subscribe to updates
      ws.send(JSON.stringify({ type: 'subscribe_to_updates' }));
      
      toast.success('Connected to mesh network');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onclose = () => {
      dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: false });
      toast.error('Disconnected from mesh network');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'WebSocket connection failed' });
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'node_created':
        dispatch({ type: ACTIONS.ADD_NODE, payload: data.node });
        toast.success(`Node '${data.node.name}' created successfully`);
        break;
      
      case 'node_removed':
        dispatch({ type: ACTIONS.REMOVE_NODE, payload: data.nodeName });
        toast.success(`Node '${data.nodeName}' removed successfully`);
        break;
      
      case 'nodes_connected':
        toast.success(`Nodes '${data.connection.source}' and '${data.connection.target}' connected`);
        // Refresh topology
        fetchTopology();
        break;
      
      case 'message_sent':
        dispatch({ type: ACTIONS.ADD_MESSAGE, payload: data.message });
        break;
      
      case 'message_broadcast':
        dispatch({ type: ACTIONS.ADD_MESSAGE, payload: data.message });
        break;
      
      case 'simulation_started':
        toast.success(`Simulation started: ${data.scenario}`);
        break;
      
      case 'simulation_stopped':
        toast.success('Simulation stopped');
        break;
      
      case 'scenario_loaded':
        toast.success(`Scenario '${data.scenario}' loaded successfully`);
        break;
      
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);

  // API functions
  const apiCall = useCallback(async (method, endpoint, data = null) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
      
      const config = {
        method,
        url: `${API_BASE}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axios(config);
      return response.data;
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Node management
  const createNode = useCallback(async (nodeData) => {
    const result = await apiCall('POST', '/nodes', nodeData);
    return result;
  }, [apiCall]);

  const removeNode = useCallback(async (nodeName) => {
    const result = await apiCall('DELETE', `/nodes/${nodeName}`);
    return result;
  }, [apiCall]);

  const connectNodes = useCallback(async (sourceNode, targetNode) => {
    const result = await apiCall('POST', '/nodes/connect', { sourceNode, targetNode });
    return result;
  }, [apiCall]);

  // Network operations
  const fetchNodes = useCallback(async () => {
    const result = await apiCall('GET', '/nodes');
    dispatch({ type: ACTIONS.SET_NODES, payload: result.nodes });
    return result.nodes;
  }, [apiCall]);

  const fetchTopology = useCallback(async () => {
    const result = await apiCall('GET', '/network/topology');
    dispatch({ type: ACTIONS.SET_TOPOLOGY, payload: result.topology });
    return result.topology;
  }, [apiCall]);

  const fetchNetworkStats = useCallback(async () => {
    const result = await apiCall('GET', '/network/stats');
    dispatch({ type: ACTIONS.SET_NETWORK_STATS, payload: result.stats });
    return result.stats;
  }, [apiCall]);

  const searchNodes = useCallback(async (query, type, capabilities) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (type) params.append('type', type);
    if (capabilities) params.append('capabilities', capabilities);
    
    const result = await apiCall('GET', `/network/search?${params.toString()}`);
    return result.results;
  }, [apiCall]);

  // Security operations
  const testSecurity = useCallback(async (testType, parameters) => {
    const result = await apiCall('POST', '/security/test', { testType, parameters });
    return result;
  }, [apiCall]);

  const simulateAttack = useCallback(async (attackType, parameters) => {
    const result = await apiCall('POST', '/security/attack', { attackType, parameters });
    return result;
  }, [apiCall]);

  const fetchSecurityStatus = useCallback(async () => {
    const result = await apiCall('GET', '/security/status');
    dispatch({ type: ACTIONS.SET_SECURITY_STATUS, payload: result.status });
    return result.status;
  }, [apiCall]);

  // Message operations
  const sendMessage = useCallback(async (fromNode, toNode, message, encryption = true) => {
    const result = await apiCall('POST', '/messages/send', { 
      fromNode, 
      toNode, 
      message, 
      encryption 
    });
    return result;
  }, [apiCall]);

  const broadcastMessage = useCallback(async (fromNode, message, encryption = true) => {
    const result = await apiCall('POST', '/messages/broadcast', { 
      fromNode, 
      message, 
      encryption 
    });
    return result;
  }, [apiCall]);

  const fetchMessages = useCallback(async (nodeName, limit = 100) => {
    const params = new URLSearchParams();
    if (nodeName) params.append('nodeName', nodeName);
    if (limit) params.append('limit', limit);
    
    const result = await apiCall('GET', `/messages?${params.toString()}`);
    dispatch({ type: ACTIONS.SET_MESSAGES, payload: result.messages });
    return result.messages;
  }, [apiCall]);

  // Simulation control
  const startSimulation = useCallback(async (scenario) => {
    const result = await apiCall('POST', '/simulation/start', { scenario });
    return result;
  }, [apiCall]);

  const stopSimulation = useCallback(async () => {
    const result = await apiCall('POST', '/simulation/stop');
    return result;
  }, [apiCall]);

  const loadScenario = useCallback(async (scenarioName) => {
    const result = await apiCall('POST', '/simulation/scenario', { scenarioName });
    return result;
  }, [apiCall]);

  // Health check
  const checkHealth = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/health`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchNodes(),
          fetchTopology(),
          fetchNetworkStats(),
          fetchSecurityStatus(),
          fetchMessages()
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    // Wait a bit for WebSocket connection to establish
    const timer = setTimeout(initializeData, 1000);
    return () => clearTimeout(timer);
  }, [fetchNodes, fetchTopology, fetchNetworkStats, fetchSecurityStatus, fetchMessages]);

  // Context value
  const value = {
    ...state,
    // Actions
    createNode,
    removeNode,
    connectNodes,
    fetchNodes,
    fetchTopology,
    fetchNetworkStats,
    searchNodes,
    testSecurity,
    simulateAttack,
    fetchSecurityStatus,
    sendMessage,
    broadcastMessage,
    fetchMessages,
    startSimulation,
    stopSimulation,
    loadScenario,
    checkHealth
  };

  return (
    <MeshNetworkContext.Provider value={value}>
      {children}
    </MeshNetworkContext.Provider>
  );
}

// Custom hook to use the context
export function useMeshNetwork() {
  const context = useContext(MeshNetworkContext);
  if (!context) {
    throw new Error('useMeshNetwork must be used within a MeshNetworkProvider');
  }
  return context;
}
