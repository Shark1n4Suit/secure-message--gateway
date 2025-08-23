/**
 * NetworkVisualizer - Network Topology Visualization
 * 
 * Provides various formats for visualizing the mesh network topology,
 * including ASCII art, graph formats, and structured data.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

import chalk from 'chalk';

export class NetworkVisualizer {
  constructor() {
    this.maxWidth = process.stdout.columns || 120;
    this.maxHeight = process.stdout.rows || 30;
  }

  /**
     * Output topology in ASCII format
     * Creates a visual ASCII representation of the network
     */
  outputAsciiFormat(topology) {
    try {
      console.log(chalk.blue.bold('\nNetwork Topology Visualization'));
      console.log(chalk.gray('═'.repeat(this.maxWidth)));
            
      if (!topology || !topology.nodes || topology.nodes.length === 0) {
        console.log(chalk.yellow('No nodes in network'));
        return;
      }
            
      // Display network statistics
      this.displayTopologyStats(topology.statistics);
            
      // Display nodes
      this.displayNodes(topology.nodes);
            
      // Display connections
      this.displayConnections(topology.connections);
            
      // Display graph structure
      this.displayGraphStructure(topology.graph);
            
    } catch (error) {
      console.error(chalk.red('Topology visualization failed:'), error.message);
    }
  }

  /**
     * Display topology statistics
     * Shows network metrics and health information
     */
  displayTopologyStats(stats) {
    if (!stats) return;
        
    console.log(chalk.cyan.bold('\n📊 Network Statistics:'));
    console.log(chalk.gray('─'.repeat(40)));
        
    const statsData = [
      ['Total Nodes', stats.totalNodes || 0],
      ['Total Connections', stats.totalConnections || 0],
      ['Average Connectivity', (stats.averageConnectivity || 0).toFixed(2)],
      ['Network Diameter', stats.networkDiameter || 0],
      ['Clustering Coefficient', (stats.clusteringCoefficient || 0).toFixed(3)]
    ];
        
    statsData.forEach(([label, value]) => {
      console.log(`${chalk.blue(label.padEnd(20))}: ${chalk.white(value)}`);
    });
        
    if (stats.lastUpdated) {
      console.log(`${chalk.blue('Last Updated'.padEnd(20))}: ${chalk.gray(new Date(stats.lastUpdated).toLocaleString())}`);
    }
  }

  /**
     * Display nodes information
     * Shows all nodes in the network with their details
     */
  displayNodes(nodes) {
    if (!nodes || nodes.length === 0) return;
        
    console.log(chalk.cyan.bold('\n🖥️  Network Nodes:'));
    console.log(chalk.gray('─'.repeat(this.maxWidth)));
        
    // Group nodes by type
    const nodesByType = this.groupNodesByType(nodes);
        
    for (const [type, typeNodes] of Object.entries(nodesByType)) {
      console.log(chalk.yellow.bold(`\n${type.toUpperCase()} Nodes (${typeNodes.length}):`));
            
      typeNodes.forEach((node, index) => {
        const statusColor = this.getStatusColor(node.status);
        const trustColor = this.getTrustColor(node.trustScore);
                
        console.log(`${chalk.gray(`${(index + 1).toString().padStart(2)}.`)} ${chalk.white.bold(node.name.padEnd(15))} ` +
                    `${statusColor(node.status.padEnd(10))} ` +
                    `${trustColor(`Trust: ${node.trustScore}`.padEnd(15))} ` +
                    `${chalk.cyan(`Conn: ${node.connections}`.padEnd(10))} ` +
                    `${chalk.magenta(`ID: ${node.id.substring(0, 8)}...`)}`);
                
        // Show capabilities if verbose
        if (node.capabilities) {
          const capabilities = Object.entries(node.capabilities)
            .filter(([_, enabled]) => enabled)
            .map(([cap, _]) => cap)
            .join(', ');
                    
          if (capabilities) {
            console.log(`${chalk.gray('    ')}${chalk.green('Capabilities:')} ${capabilities}`);
          }
        }
      });
    }
  }

  /**
     * Display connections information
     * Shows all connections between nodes
     */
  displayConnections(connections) {
    if (!connections || connections.length === 0) return;
        
    console.log(chalk.cyan.bold('\n🔗 Network Connections:'));
    console.log(chalk.gray('─'.repeat(this.maxWidth)));
        
    // Group connections by type
    const connectionsByType = this.groupConnectionsByType(connections);
        
    for (const [type, typeConnections] of Object.entries(connectionsByType)) {
      console.log(chalk.yellow.bold(`\n${type.toUpperCase()} Connections (${typeConnections.length}):`));
            
      typeConnections.forEach((conn, index) => {
        const securityColor = this.getSecurityColor(conn.securityLevel);
        const age = this.getConnectionAge(conn.establishedAt);
                
        console.log(`${chalk.gray(`${(index + 1).toString().padStart(2)}.`)} ` +
                    `${chalk.white.bold(conn.sourceNode.padEnd(15))} ` +
                    `${chalk.gray('⟷')} ` +
                    `${chalk.white.bold(conn.targetNode.padEnd(15))} ` +
                    `${securityColor(conn.securityLevel.padEnd(10))} ` +
                    `${chalk.cyan(`Age: ${age}`.padEnd(15))} ` +
                    `${chalk.magenta(`ID: ${conn.id.substring(0, 8)}...`)}`);
                
        // Show additional connection details
        if (conn.messageCount > 0) {
          console.log(`${chalk.gray('    ')}${chalk.blue('Messages:')} ${conn.messageCount} | ` +
                        `${chalk.green('Algorithm:')} ${conn.encryptionAlgorithm}`);
        }
      });
    }
  }

  /**
     * Display graph structure
     * Shows the network as a graph with node relationships
     */
  displayGraphStructure(graph) {
    if (!graph || Object.keys(graph).length === 0) return;
        
    console.log(chalk.cyan.bold('\n🌐 Network Graph Structure:'));
    console.log(chalk.gray('─'.repeat(this.maxWidth)));
        
    // Create adjacency list representation
    const adjacencyList = this.createAdjacencyList(graph);
        
    // Display in a tree-like format
    this.displayGraphTree(adjacencyList);
  }

  /**
     * Display graph as tree structure
     * Shows hierarchical view of network connections
     */
  displayGraphTree(adjacencyList) {
    try {
      const visited = new Set();
      const startNode = Object.keys(adjacencyList)[0];
            
      if (!startNode) return;
            
      this.displayGraphNode(startNode, adjacencyList, visited, '', true);
            
    } catch (error) {
      console.log(chalk.yellow('Graph tree display failed, showing adjacency list instead'));
      this.displayAdjacencyList(adjacencyList);
    }
  }

  /**
     * Display individual graph node
     * Recursively displays node and its connections
     */
  displayGraphNode(nodeId, adjacencyList, visited, prefix, isLast) {
    if (visited.has(nodeId)) return;
        
    visited.add(nodeId);
        
    const node = this.getNodeById(nodeId);
    const nodeName = node ? node.name : nodeId;
    const connections = adjacencyList[nodeId] || [];
        
    // Display node
    const connector = isLast ? '└── ' : '├── ';
    const nodeColor = this.getNodeTypeColor(node?.type);
    console.log(`${prefix}${connector}${nodeColor(nodeName)}`);
        
    // Display connections
    const newPrefix = prefix + (isLast ? '    ' : '│   ');
        
    connections.forEach((neighborId, index) => {
      const isLastNeighbor = index === connections.length - 1;
      this.displayGraphNode(neighborId, adjacencyList, visited, newPrefix, isLastNeighbor);
    });
  }

  /**
     * Display adjacency list
     * Shows simple list of node connections
     */
  displayAdjacencyList(adjacencyList) {
    for (const [nodeId, neighbors] of Object.entries(adjacencyList)) {
      const node = this.getNodeById(nodeId);
      const nodeName = node ? node.name : nodeId;
            
      console.log(`${chalk.white.bold(nodeName)} ${chalk.gray('→')} ` +
                `${neighbors.map(n => {
                  const neighbor = this.getNodeById(n);
                  return neighbor ? neighbor.name : n;
                }).join(chalk.gray(', '))}`);
    }
  }

  /**
     * Output topology in graph format
     * Creates a graph representation suitable for external tools
     */
  outputGraphFormat(topology) {
    try {
      console.log(chalk.blue.bold('\nGraph Format Output:'));
      console.log(chalk.gray('═'.repeat(this.maxWidth)));
            
      // Generate DOT format (Graphviz)
      const dotFormat = this.generateDotFormat(topology);
      console.log(chalk.cyan('DOT Format (Graphviz):'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(dotFormat);
            
      // Generate JSON format
      const jsonFormat = this.generateJsonFormat(topology);
      console.log(chalk.cyan('\nJSON Format:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(JSON.stringify(jsonFormat, null, 2));
            
    } catch (error) {
      console.error(chalk.red('Graph format output failed:'), error.message);
    }
  }

  /**
     * Generate DOT format for Graphviz
     * Creates DOT language representation of the network
     */
  generateDotFormat(topology) {
    try {
      let dot = 'digraph MeshNetwork {\n';
      dot += '  rankdir=LR;\n';
      dot += '  node [shape=box, style=filled];\n\n';
            
      // Add nodes
      if (topology.nodes) {
        for (const node of topology.nodes) {
          const color = this.getNodeTypeColor(node.type);
          const fillcolor = this.getNodeFillColor(node.type);
                    
          dot += `  "${node.name}" [label="${node.name}\\n${node.type}", fillcolor="${fillcolor}", color="${color}"];\n`;
        }
      }
            
      dot += '\n';
            
      // Add edges
      if (topology.connections) {
        for (const conn of topology.connections) {
          const edgeColor = this.getConnectionEdgeColor(conn.securityLevel);
          dot += `  "${conn.sourceNode}" -> "${conn.targetNode}" [color="${edgeColor}", label="${conn.type}"];\n`;
        }
      }
            
      dot += '}\n';
      return dot;
            
    } catch (error) {
      return `// Error generating DOT format: ${error.message}`;
    }
  }

  /**
     * Generate JSON format
     * Creates structured JSON representation
     */
  generateJsonFormat(topology) {
    try {
      return {
        metadata: {
          generatedAt: new Date().toISOString(),
          format: 'network-topology',
          version: '1.0.0'
        },
        statistics: topology.statistics || {},
        nodes: topology.nodes || [],
        connections: topology.connections || [],
        graph: topology.graph || {}
      };
            
    } catch (error) {
      return { error: `Failed to generate JSON format: ${error.message}` };
    }
  }

  /**
     * Group nodes by type
     * Organizes nodes into type-based groups
     */
  groupNodesByType(nodes) {
    const groups = {};
        
    nodes.forEach(node => {
      const type = node.type || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(node);
    });
        
    return groups;
  }

  /**
     * Group connections by type
     * Organizes connections into type-based groups
     */
  groupConnectionsByType(connections) {
    const groups = {};
        
    connections.forEach(conn => {
      const type = conn.type || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(conn);
    });
        
    return groups;
  }

  /**
     * Create adjacency list
     * Converts graph structure to adjacency list format
     */
  createAdjacencyList(graph) {
    const adjacencyList = {};
        
    for (const [nodeId, neighbors] of Object.entries(graph)) {
      adjacencyList[nodeId] = Array.from(neighbors);
    }
        
    return adjacencyList;
  }

  /**
     * Get node by ID
     * Retrieves node information from topology
     */
  getNodeById(nodeId) {
    // This would need access to the full topology data
    // For now, return null - this should be implemented based on actual data structure
    return null;
  }

  /**
     * Get status color
     * Returns appropriate color for node status
     */
  getStatusColor(status) {
    switch (status?.toLowerCase()) {
    case 'active':
      return chalk.green;
    case 'inactive':
      return chalk.red;
    case 'shutdown':
      return chalk.gray;
    default:
      return chalk.yellow;
    }
  }

  /**
     * Get trust color
     * Returns appropriate color for trust score
     */
  getTrustColor(score) {
    if (score >= 80) return chalk.green;
    if (score >= 60) return chalk.yellow;
    if (score >= 40) return chalk.orange;
    return chalk.red;
  }

  /**
     * Get security color
     * Returns appropriate color for security level
     */
  getSecurityColor(level) {
    switch (level?.toLowerCase()) {
    case 'high':
      return chalk.green;
    case 'medium':
      return chalk.yellow;
    case 'low':
      return chalk.red;
    default:
      return chalk.gray;
    }
  }

  /**
     * Get node type color
     * Returns appropriate color for node type
     */
  getNodeTypeColor(type) {
    switch (type?.toLowerCase()) {
    case 'gateway':
      return chalk.blue;
    case 'router':
      return chalk.cyan;
    case 'standard':
      return chalk.white;
    default:
      return chalk.gray;
    }
  }

  /**
     * Get node fill color for DOT format
     * Returns appropriate fill color for node type
     */
  getNodeFillColor(type) {
    switch (type?.toLowerCase()) {
    case 'gateway':
      return 'lightblue';
    case 'router':
      return 'lightcyan';
    case 'standard':
      return 'lightgray';
    default:
      return 'white';
    }
  }

  /**
     * Get connection edge color for DOT format
     * Returns appropriate edge color for security level
     */
  getConnectionEdgeColor(level) {
    switch (level?.toLowerCase()) {
    case 'high':
      return 'green';
    case 'medium':
      return 'orange';
    case 'low':
      return 'red';
    default:
      return 'black';
    }
  }

  /**
     * Get connection age
     * Returns human-readable age of connection
     */
  getConnectionAge(establishedAt) {
    if (!establishedAt) return 'Unknown';
        
    const now = new Date();
    const established = new Date(establishedAt);
    const diffMs = now - established;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
        
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMins > 0) return `${diffMins}m`;
    return '<1m';
  }

  /**
     * Set display dimensions
     * Updates maximum width and height for display
     */
  setDisplayDimensions(width, height) {
    this.maxWidth = width || process.stdout.columns || 120;
    this.maxHeight = height || process.stdout.rows || 30;
  }

  /**
     * Get display dimensions
     * Returns current display dimensions
     */
  getDisplayDimensions() {
    return {
      maxWidth: this.maxWidth,
      maxHeight: this.maxHeight
    };
  }
}
