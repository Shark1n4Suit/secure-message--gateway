/**
 * TopologyManager - Network Topology Management
 * 
 * Manages the mesh network topology, connection relationships, and provides
 * network analysis capabilities for the Secure Mesh CLI application.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

import { Logger } from '../utils/Logger.js';

export class TopologyManager {
  constructor(meshNetwork) {
    this.meshNetwork = meshNetwork;
    this.logger = new Logger();
    this.connections = new Map();
    this.nodes = new Map();
    this.topologyGraph = new Map();
    this.isInitialized = false;
        
    // Topology statistics
    this.topologyStats = {
      totalConnections: 0,
      averageConnectivity: 0,
      networkDiameter: 0,
      clusteringCoefficient: 0,
      lastUpdated: new Date()
    };
  }

  /**
     * Initialize the topology manager
     * Sets up topology tracking and analysis capabilities
     */
  async initialize() {
    try {
      this.logger.info('Initializing topology manager...');
            
      // Setup topology analysis
      this.setupTopologyAnalysis();
            
      this.isInitialized = true;
      this.logger.success('Topology manager initialized successfully');
            
    } catch (error) {
      this.logger.error('Failed to initialize topology manager:', error.message);
      throw error;
    }
  }

  /**
     * Setup topology analysis capabilities
     * Initializes algorithms for network analysis
     */
  setupTopologyAnalysis() {
    this.logger.debug('Setting up topology analysis...');
        
    // Initialize topology graph
    this.topologyGraph = new Map();
        
    // Setup periodic topology updates
    this.topologyUpdateInterval = setInterval(() => {
      this.updateTopologyStats();
    }, 10000); // Update every 10 seconds
        
    this.logger.debug('Topology analysis setup complete');
  }

  /**
     * Add a node to the topology
     * Registers node and initializes topology tracking
     */
  async addNode(node) {
    try {
      this.logger.debug(`Adding node to topology: ${node.name}`);
            
      // Store node reference by name (not ID) for CLI consistency
      this.nodes.set(node.name, node);
            
      // Initialize topology graph entry
      this.topologyGraph.set(node.name, new Set());
            
      this.logger.debug(`Node added to topology: ${node.name}`);
            
    } catch (error) {
      this.logger.error(`Failed to add node ${node.name} to topology:`, error.message);
      throw error;
    }
  }

  /**
     * Remove a node from the topology
     * Cleans up node and its connections
     */
  async removeNode(node) {
    try {
      this.logger.debug(`Removing node from topology: ${node.name}`);
            
      // Remove all connections involving this node
      const connectionsToRemove = [];
            
      for (const [connectionId, connection] of this.connections) {
        if (connection.sourceNode === node.name || connection.targetNode === node.name) {
          connectionsToRemove.push(connectionId);
        }
      }
            
      // Remove connections
      for (const connectionId of connectionsToRemove) {
        await this.removeConnection(connectionId);
      }
            
      // Remove node from topology
      this.nodes.delete(node.name);
      this.topologyGraph.delete(node.name);
            
      this.logger.debug(`Node removed from topology: ${node.name}`);
            
    } catch (error) {
      this.logger.error(`Failed to remove node ${node.name} from topology:`, error.message);
      throw error;
    }
  }

  /**
     * Add a connection to the topology
     * Tracks connection and updates topology graph
     */
  async addConnection(connection) {
    try {
      this.logger.debug(`Adding connection to topology: ${connection.sourceNode} <-> ${connection.targetNode}`);
            
      // Store connection
      this.connections.set(connection.id, connection);
            
      // Update topology graph
      const sourceNode = this.meshNetwork.nodes.get(connection.sourceNode);
      const targetNode = this.meshNetwork.nodes.get(connection.targetNode);
            
      if (sourceNode && targetNode) {
        // Add bidirectional edges
        if (!this.topologyGraph.has(connection.sourceNode)) {
          this.topologyGraph.set(connection.sourceNode, new Set());
        }
        if (!this.topologyGraph.has(connection.targetNode)) {
          this.topologyGraph.set(connection.targetNode, new Set());
        }
                
        this.topologyGraph.get(connection.sourceNode).add(connection.targetNode);
        this.topologyGraph.get(connection.targetNode).add(connection.sourceNode);
      }
            
      // Update statistics
      this.topologyStats.totalConnections = this.connections.size;
            
      this.logger.debug(`Connection added to topology: ${connection.id}`);
            
    } catch (error) {
      this.logger.error('Failed to add connection to topology:', error.message);
      throw error;
    }
  }

  /**
     * Remove a connection from the topology
     * Cleans up connection and updates topology graph
     */
  async removeConnection(connectionId) {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        this.logger.warn(`Connection not found: ${connectionId}`);
        return;
      }
            
      this.logger.debug(`Removing connection from topology: ${connection.sourceNode} <-> ${connection.targetNode}`);
            
      // Remove from topology graph
      if (this.topologyGraph.has(connection.sourceNode)) {
        this.topologyGraph.get(connection.sourceNode).delete(connection.targetNode);
      }
            
      if (this.topologyGraph.has(connection.targetNode)) {
        this.topologyGraph.get(connection.targetNode).delete(connection.sourceNode);
      }
            
      // Remove connection
      this.connections.delete(connectionId);
            
      // Update statistics
      this.topologyStats.totalConnections = this.connections.size;
            
      this.logger.debug(`Connection removed from topology: ${connectionId}`);
            
    } catch (error) {
      this.logger.error('Failed to remove connection from topology:', error.message);
      throw error;
    }
  }

  /**
     * Get connection between two nodes
     * Returns connection object if it exists
     */
  getConnection(sourceNodeName, targetNodeName) {
    for (const [connectionId, connection] of this.connections) {
      if ((connection.sourceNode === sourceNodeName && connection.targetNode === targetNodeName) ||
                (connection.sourceNode === targetNodeName && connection.targetNode === sourceNodeName)) {
        return connection;
      }
    }
    return null;
  }

  /**
     * Get all connections for a specific node
     * Returns array of connection objects
     */
  getNodeConnections(nodeName) {
    const nodeConnections = [];
        
    for (const [connectionId, connection] of this.connections) {
      if (connection.sourceNode === nodeName || connection.targetNode === nodeName) {
        nodeConnections.push(connection);
      }
    }
        
    return nodeConnections;
  }

  /**
     * Get network topology
     * Returns complete topology information
     */
  async getTopology() {
    try {
      this.logger.debug('Generating network topology...');
            
      const topology = {
        nodes: [],
        connections: [],
        statistics: this.topologyStats,
        graph: {},
        metadata: {
          generatedAt: new Date().toISOString(),
          totalNodes: this.nodes.size,
          totalConnections: this.connections.size
        }
      };
      
      // Update statistics before returning
      this.updateTopologyStats();
            
      // Add node information
      for (const [nodeName, node] of this.nodes) {
        topology.nodes.push({
          id: node.id,
          name: node.name,
          type: node.type,
          status: node.status,
          capabilities: node.capabilities,
          connections: this.topologyGraph.get(nodeName)?.size || 0,
          trustScore: node.trustScore
        });
      }
            
      // Add connection information
      for (const [connectionId, connection] of this.connections) {
        topology.connections.push({
          id: connectionId,
          sourceNode: connection.sourceNode,
          targetNode: connection.targetNode,
          type: connection.type,
          securityLevel: connection.securityLevel,
          establishedAt: connection.establishedAt,
          lastActivity: connection.lastActivity,
          messageCount: connection.messageCount,
          encryptionAlgorithm: connection.encryptionAlgorithm
        });
      }
            
      // Add graph representation
      for (const [nodeName, neighbors] of this.topologyGraph) {
        topology.graph[nodeName] = Array.from(neighbors);
      }
            
      this.logger.debug('Network topology generated successfully');
      return topology;
            
    } catch (error) {
      this.logger.error('Failed to generate network topology:', error.message);
      throw error;
    }
  }

  /**
     * Update topology statistics
     * Calculates network metrics and statistics
     */
  updateTopologyStats() {
    try {
      this.logger.debug('Updating topology statistics...');
            
      if (this.nodes.size === 0) {
        this.topologyStats = {
          totalNodes: 0,
          totalConnections: 0,
          averageConnectivity: 0,
          networkDiameter: 0,
          clusteringCoefficient: 0,
          lastUpdated: new Date()
        };
        return;
      }
            
      // Update node count
      this.topologyStats.totalNodes = this.nodes.size;
      this.topologyStats.totalConnections = this.connections.size;
            
      // Calculate average connectivity
      let totalConnections = 0;
      for (const [nodeName, neighbors] of this.topologyGraph) {
        totalConnections += neighbors.size;
      }
      this.topologyStats.averageConnectivity = totalConnections / this.nodes.size;
            
      // Calculate network diameter (approximate)
      this.topologyStats.networkDiameter = this.calculateNetworkDiameter();
            
      // Calculate clustering coefficient
      this.topologyStats.clusteringCoefficient = this.calculateClusteringCoefficient();
            
      // Update timestamp
      this.topologyStats.lastUpdated = new Date();
            
      this.logger.debug('Topology statistics updated successfully');
            
    } catch (error) {
      this.logger.error('Failed to update topology statistics:', error.message);
    }
  }

  /**
     * Calculate network diameter
     * Returns the longest shortest path between any two nodes
     */
  calculateNetworkDiameter() {
    try {
      if (this.nodes.size <= 1) {
        return 0;
      }
            
      let maxDiameter = 0;
            
      // Use Floyd-Warshall algorithm for all-pairs shortest paths
      const distances = this.floydWarshall();
            
      // Find maximum distance
      for (let i = 0; i < this.nodes.size; i++) {
        for (let j = 0; j < this.nodes.size; j++) {
          if (distances[i][j] !== Infinity && distances[i][j] > maxDiameter) {
            maxDiameter = distances[i][j];
          }
        }
      }
            
      return maxDiameter;
            
    } catch (error) {
      this.logger.error('Failed to calculate network diameter:', error.message);
      return 0;
    }
  }

  /**
     * Calculate clustering coefficient
     * Returns the average clustering coefficient of the network
     */
  calculateClusteringCoefficient() {
    try {
      if (this.nodes.size === 0) {
        return 0;
      }
            
      let totalClustering = 0;
      let validNodes = 0;
            
      for (const [nodeName, neighbors] of this.topologyGraph) {
        if (neighbors.size >= 2) {
          const clustering = this.calculateNodeClustering(nodeName, neighbors);
          totalClustering += clustering;
          validNodes++;
        }
      }
            
      return validNodes > 0 ? totalClustering / validNodes : 0;
            
    } catch (error) {
      this.logger.error('Failed to calculate clustering coefficient:', error.message);
      return 0;
    }
  }

  /**
     * Calculate clustering coefficient for a specific node
     * Returns the local clustering coefficient
     */
  calculateNodeClustering(nodeId, neighbors) {
    try {
      if (neighbors.size < 2) {
        return 0;
      }
            
      let triangles = 0;
      const neighborArray = Array.from(neighbors);
            
      // Count triangles (three connected nodes)
      for (let i = 0; i < neighborArray.length; i++) {
        for (let j = i + 1; j < neighborArray.length; j++) {
          const neighbor1 = neighborArray[i];
          const neighbor2 = neighborArray[j];
                    
          if (this.topologyGraph.get(neighbor1)?.has(neighbor2)) {
            triangles++;
          }
        }
      }
            
      const maxTriangles = (neighbors.size * (neighbors.size - 1)) / 2;
      return maxTriangles > 0 ? triangles / maxTriangles : 0;
            
    } catch (error) {
      this.logger.error(`Failed to calculate clustering for node ${nodeId}:`, error.message);
      return 0;
    }
  }

  /**
     * Floyd-Warshall algorithm for all-pairs shortest paths
     * Returns distance matrix between all nodes
     */
  floydWarshall() {
    try {
      const nodeIds = Array.from(this.nodes.keys());
      const n = nodeIds.length;
      const distances = Array(n).fill().map(() => Array(n).fill(Infinity));
            
      // Initialize distances
      for (let i = 0; i < n; i++) {
        distances[i][i] = 0;
      }
            
      // Set direct connections
      for (const [connectionId, connection] of this.connections) {
        const sourceIndex = nodeIds.indexOf(connection.sourceNode);
        const targetIndex = nodeIds.indexOf(connection.targetNode);
                
        if (sourceIndex !== -1 && targetIndex !== -1) {
          distances[sourceIndex][targetIndex] = 1;
          distances[targetIndex][sourceIndex] = 1;
        }
      }
            
      // Floyd-Warshall algorithm
      for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (distances[i][k] + distances[k][j] < distances[i][j]) {
              distances[i][j] = distances[i][k] + distances[k][j];
            }
          }
        }
      }
            
      return distances;
            
    } catch (error) {
      this.logger.error('Failed to execute Floyd-Warshall algorithm:', error.message);
      return [];
    }
  }

  /**
     * Find shortest path between two nodes
     * Returns array of node IDs representing the path
     */
  findShortestPath(sourceNodeName, targetNodeName) {
    try {
      const sourceNode = this.meshNetwork.nodes.get(sourceNodeName);
      const targetNode = this.meshNetwork.nodes.get(targetNodeName);
            
      if (!sourceNode || !targetNode) {
        return null;
      }
            
      // Use Dijkstra's algorithm
      const distances = new Map();
      const previous = new Map();
      const unvisited = new Set();
            
      // Initialize
      for (const [nodeId, node] of this.nodes) {
        distances.set(nodeId, Infinity);
        unvisited.add(nodeId);
      }
      distances.set(sourceNode.id, 0);
            
      while (unvisited.size > 0) {
        // Find unvisited node with minimum distance
        let current = null;
        let minDistance = Infinity;
                
        for (const nodeId of unvisited) {
          if (distances.get(nodeId) < minDistance) {
            minDistance = distances.get(nodeId);
            current = nodeId;
          }
        }
                
        if (current === null || minDistance === Infinity) {
          break;
        }
                
        unvisited.delete(current);
                
        // If we reached the target, we're done
        if (current === targetNode.id) {
          break;
        }
                
        // Update distances to neighbors
        const neighbors = this.topologyGraph.get(current) || new Set();
        for (const neighbor of neighbors) {
          if (unvisited.has(neighbor)) {
            const newDistance = distances.get(current) + 1;
            if (newDistance < distances.get(neighbor)) {
              distances.set(neighbor, newDistance);
              previous.set(neighbor, current);
            }
          }
        }
      }
            
      // Reconstruct path
      const path = [];
      let current = targetNode.id;
            
      while (current !== null) {
        path.unshift(current);
        current = previous.get(current);
      }
            
      return path.length > 1 ? path : null;
            
    } catch (error) {
      this.logger.error('Failed to find shortest path:', error.message);
      return null;
    }
  }

  /**
     * Get network connectivity analysis
     * Returns detailed connectivity information
     */
  getConnectivityAnalysis() {
    try {
      const analysis = {
        totalNodes: this.nodes.size,
        totalConnections: this.connections.size,
        averageConnectivity: this.topologyStats.averageConnectivity,
        networkDiameter: this.topologyStats.networkDiameter,
        clusteringCoefficient: this.topologyStats.clusteringCoefficient,
        isolatedNodes: 0,
        highlyConnectedNodes: 0,
        connectivityDistribution: {},
        lastUpdated: this.topologyStats.lastUpdated
      };
            
      // Analyze connectivity distribution
      for (const [nodeId, neighbors] of this.topologyGraph) {
        const connectivity = neighbors.size;
                
        if (connectivity === 0) {
          analysis.isolatedNodes++;
        } else if (connectivity >= 5) {
          analysis.highlyConnectedNodes++;
        }
                
        analysis.connectivityDistribution[connectivity] = 
                    (analysis.connectivityDistribution[connectivity] || 0) + 1;
      }
            
      return analysis;
            
    } catch (error) {
      this.logger.error('Failed to generate connectivity analysis:', error.message);
      return null;
    }
  }

  /**
     * Get total connections count
     */
  getTotalConnections() {
    return this.connections.size;
  }

  /**
     * Get average connectivity
     */
  getAverageConnectivity() {
    return this.topologyStats.averageConnectivity;
  }

  /**
     * Get network diameter
     */
  getNetworkDiameter() {
    return this.topologyStats.networkDiameter;
  }

  /**
     * Check if network is fully connected
     * Returns true if all nodes can reach each other
     */
  isNetworkFullyConnected() {
    try {
      if (this.nodes.size <= 1) {
        return true;
      }
            
      // Check if there's a path from first node to all others
      const firstNodeId = Array.from(this.nodes.keys())[0];
            
      for (const [nodeId, node] of this.nodes) {
        if (nodeId !== firstNodeId) {
          const path = this.findShortestPath(firstNodeId, nodeId);
          if (!path) {
            return false;
          }
        }
      }
            
      return true;
            
    } catch (error) {
      this.logger.error('Failed to check network connectivity:', error.message);
      return false;
    }
  }

  /**
     * Get network bottlenecks
     * Returns nodes that are critical for network connectivity
     */
  getNetworkBottlenecks() {
    try {
      const bottlenecks = [];
            
      for (const [nodeId, node] of this.nodes) {
        // Temporarily remove node
        const originalNeighbors = this.topologyGraph.get(nodeId);
        this.topologyGraph.set(nodeId, new Set());
                
        // Check if network becomes disconnected
        if (!this.isNetworkFullyConnected()) {
          bottlenecks.push({
            nodeId,
            nodeName: node.name,
            type: node.type,
            connections: originalNeighbors.size
          });
        }
                
        // Restore node
        this.topologyGraph.set(nodeId, originalNeighbors);
      }
            
      return bottlenecks;
            
    } catch (error) {
      this.logger.error('Failed to identify network bottlenecks:', error.message);
      return [];
    }
  }

  /**
     * Cleanup topology manager
     */
  async shutdown() {
    this.logger.info('Shutting down topology manager...');
        
    try {
      // Clear intervals
      if (this.topologyUpdateInterval) {
        clearInterval(this.topologyUpdateInterval);
      }
            
      // Clear data structures
      this.connections.clear();
      this.nodes.clear();
      this.topologyGraph.clear();
            
      this.isInitialized = false;
      this.logger.success('Topology manager shutdown complete');
            
    } catch (error) {
      this.logger.error('Error during topology manager shutdown:', error.message);
      throw error;
    }
  }
}
