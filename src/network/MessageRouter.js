/**
 * MessageRouter - Message Routing and Delivery System
 * 
 * Handles message routing, delivery, and queuing in the mesh network
 * simulation, ensuring secure and reliable message transmission.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

import { Logger } from '../utils/Logger.js';

export class MessageRouter {
  constructor(meshNetwork) {
    this.meshNetwork = meshNetwork;
    this.logger = new Logger();
    this.messageQueue = [];
    this.deliveryQueue = [];
    this.failedMessages = [];
    this.isInitialized = false;
        
    // Routing statistics
    this.routingStats = {
      messagesRouted: 0,
      messagesDelivered: 0,
      messagesFailed: 0,
      averageDeliveryTime: 0,
      lastUpdated: new Date()
    };
        
    // Message processing
    this.processingInterval = null;
    this.deliveryInterval = null;
  }

  /**
     * Initialize the message router
     * Sets up message processing and delivery systems
     */
  async initialize() {
    try {
      this.logger.info('Initializing message router...');
            
      // Setup message processing
      this.setupMessageProcessing();
            
      // Setup message delivery
      this.setupMessageDelivery();
            
      this.isInitialized = true;
      this.logger.success('Message router initialized successfully');
            
    } catch (error) {
      this.logger.error('Failed to initialize message router:', error.message);
      throw error;
    }
  }

  /**
     * Setup message processing system
     * Initializes message queue processing
     */
  setupMessageProcessing() {
    this.logger.debug('Setting up message processing...');
        
    // Start message processor
    this.processingInterval = setInterval(() => {
      this.processMessageQueue();
    }, 50); // Process messages every 50ms
        
    this.logger.debug('Message processing setup complete');
  }

  /**
     * Setup message delivery system
     * Initializes message delivery processing
     */
  setupMessageDelivery() {
    this.logger.debug('Setting up message delivery...');
        
    // Start delivery processor
    this.deliveryInterval = setInterval(() => {
      this.processDeliveryQueue();
    }, 100); // Process delivery every 100ms
        
    this.logger.debug('Message delivery setup complete');
  }

  /**
     * Route message through the network
     * Processes and routes encrypted messages to their destinations
     */
  async routeMessage(message) {
    try {
      if (!this.isInitialized) {
        throw new Error('Message router not initialized');
      }
            
      this.logger.debug(`Routing message: ${message.id} (${message.sourceNode} -> ${message.targetNode})`);
            
      // Add routing metadata
      const routedMessage = {
        ...message,
        routedAt: new Date(),
        routingAttempts: 0,
        maxRoutingAttempts: 3
      };
            
      // Add to message queue for processing
      this.messageQueue.push(routedMessage);
            
      // Update statistics
      this.routingStats.messagesRouted++;
      this.routingStats.lastUpdated = new Date();
            
      this.logger.debug(`Message queued for routing: ${message.id}`);
            
    } catch (error) {
      this.logger.error('Message routing failed:', error.message);
      throw error;
    }
  }

  /**
     * Process message queue
     * Handles queued messages and determines routing paths
     */
  async processMessageQueue() {
    if (this.messageQueue.length === 0) {
      return;
    }
        
    const messages = this.messageQueue.splice(0, 5); // Process up to 5 messages
        
    for (const message of messages) {
      try {
        await this.processMessage(message);
      } catch (error) {
        this.logger.error(`Failed to process message ${message.id}:`, error.message);
        this.handleMessageFailure(message, error);
      }
    }
  }

  /**
     * Process individual message
     * Determines routing path and adds to delivery queue
     */
  async processMessage(message) {
    try {
      // Check if target node exists
      const targetNode = this.meshNetwork.nodes.get(message.targetNode);
      if (!targetNode) {
        throw new Error(`Target node not found: ${message.targetNode}`);
      }
            
      // Check if source node exists
      const sourceNode = this.meshNetwork.nodes.get(message.sourceNode);
      if (!sourceNode) {
        throw new Error(`Source node not found: ${message.sourceNode}`);
      }
            
      // Determine routing path
      const routingPath = await this.determineRoutingPath(message);
            
      if (!routingPath) {
        throw new Error('No valid routing path found');
      }
            
      // Create delivery task
      const deliveryTask = {
        message,
        routingPath,
        currentHop: 0,
        createdAt: new Date(),
        status: 'pending'
      };
            
      // Add to delivery queue
      this.deliveryQueue.push(deliveryTask);
            
      this.logger.debug(`Message ${message.id} queued for delivery via path: ${routingPath.join(' -> ')}`);
            
    } catch (error) {
      this.logger.error(`Message processing failed for ${message.id}:`, error.message);
      throw error;
    }
  }

  /**
     * Determine routing path for message
     * Finds optimal path from source to target
     */
  async determineRoutingPath(message) {
    try {
      const sourceNode = this.meshNetwork.nodes.get(message.sourceNode);
      const targetNode = this.meshNetwork.nodes.get(message.targetNode);
            
      if (!sourceNode || !targetNode) {
        return null;
      }
            
      // Check for direct connection
      const directConnection = this.meshNetwork.topologyManager.getConnection(
        message.sourceNode, 
        message.targetNode
      );
            
      if (directConnection) {
        return [message.sourceNode, message.targetNode];
      }
            
      // Find shortest path through topology
      const path = this.meshNetwork.topologyManager.findShortestPath(
        message.sourceNode, 
        message.targetNode
      );
            
      if (path) {
        // Convert node IDs to names
        const nodeNames = path.map(nodeId => {
          const node = this.meshNetwork.nodes.get(nodeId);
          return node ? node.name : nodeId;
        });
                
        return nodeNames;
      }
            
      // Fallback: try to find any path through connected nodes
      return this.findFallbackPath(message.sourceNode, message.targetNode);
            
    } catch (error) {
      this.logger.error('Routing path determination failed:', error.message);
      return null;
    }
  }

  /**
     * Find fallback routing path
     * Attempts to find any valid path when shortest path fails
     */
  findFallbackPath(sourceNodeName, targetNodeName) {
    try {
      const visited = new Set();
      const queue = [{ node: sourceNodeName, path: [sourceNodeName] }];
            
      while (queue.length > 0) {
        const { node, path } = queue.shift();
                
        if (node === targetNodeName) {
          return path;
        }
                
        if (visited.has(node)) {
          continue;
        }
                
        visited.add(node);
                
        // Get node connections
        const connections = this.meshNetwork.topologyManager.getNodeConnections(node);
                
        for (const connection of connections) {
          const nextNode = connection.sourceNode === node ? 
            connection.targetNode : connection.sourceNode;
                    
          if (!visited.has(nextNode)) {
            queue.push({
              node: nextNode,
              path: [...path, nextNode]
            });
          }
        }
      }
            
      return null;
            
    } catch (error) {
      this.logger.error('Fallback path finding failed:', error.message);
      return null;
    }
  }

  /**
     * Process delivery queue
     * Handles message delivery to target nodes
     */
  async processDeliveryQueue() {
    if (this.deliveryQueue.length === 0) {
      return;
    }
        
    const deliveryTasks = this.deliveryQueue.splice(0, 3); // Process up to 3 deliveries
        
    for (const task of deliveryTasks) {
      try {
        await this.processDeliveryTask(task);
      } catch (error) {
        this.logger.error(`Failed to process delivery task for message ${task.message.id}:`, error.message);
        this.handleDeliveryFailure(task, error);
      }
    }
  }

  /**
     * Process individual delivery task
     * Delivers message to next hop or final destination
     */
  async processDeliveryTask(task) {
    try {
      if (task.status !== 'pending') {
        return;
      }
            
      const { message, routingPath, currentHop } = task;
            
      // Check if we've reached the target
      if (currentHop >= routingPath.length - 1) {
        // Deliver to final destination
        await this.deliverMessage(message, routingPath[routingPath.length - 1]);
        task.status = 'delivered';
        return;
      }
            
      // Route to next hop
      const currentNode = routingPath[currentHop];
      const nextNode = routingPath[currentHop + 1];
            
      // For direct connections, skip intermediate routing
      if (routingPath.length === 2 && currentHop === 0) {
        // Direct connection - deliver immediately
        await this.deliverMessage(message, nextNode);
        task.status = 'delivered';
        return;
      }
            
      // Check if we can route through current node
      if (await this.canRouteThroughNode(currentNode, nextNode)) {
        // Forward message to next hop
        await this.forwardMessage(message, currentNode, nextNode);
        task.currentHop++;
      } else {
        // Try alternative routing
        const alternativePath = await this.findAlternativePath(message, currentNode, nextNode);
        if (alternativePath) {
          task.routingPath = alternativePath;
          task.currentHop = 0;
        } else {
          throw new Error(`Cannot route through node: ${currentNode}`);
        }
      }
            
    } catch (error) {
      this.logger.error('Delivery task processing failed:', error.message);
      throw error;
    }
  }

  /**
     * Check if message can be routed through a node
     * Validates routing capabilities and connections
     */
  async canRouteThroughNode(nodeName, nextNodeName) {
    try {
      const node = this.meshNetwork.nodes.get(nodeName);
      if (!node) {
        return false;
      }
            
      // Check if node has routing capability
      if (!node.capabilities.routing) {
        return false;
      }
            
      // Check if node is connected to next hop
      const connection = this.meshNetwork.topologyManager.getConnection(nodeName, nextNodeName);
      if (!connection) {
        return false;
      }
            
      // Check if node is active
      if (node.status !== 'active') {
        return false;
      }
            
      return true;
            
    } catch (error) {
      this.logger.error('Node routing capability check failed:', error.message);
      return false;
    }
  }

  /**
     * Forward message to next hop
     * Sends message through intermediate routing node
     */
  async forwardMessage(message, currentNodeName, nextNodeName) {
    try {
      this.logger.debug(`Forwarding message ${message.id} from ${currentNodeName} to ${nextNodeName}`);
            
      // Create forwarding message
      const forwardMessage = {
        ...message,
        forwarded: true,
        forwardPath: message.forwardPath ? [...message.forwardPath, currentNodeName] : [currentNodeName],
        forwardCount: (message.forwardCount || 0) + 1
      };
            
      // Send through mesh network
      const currentNode = this.meshNetwork.nodes.get(currentNodeName);
      const nextNode = this.meshNetwork.nodes.get(nextNodeName);
            
      if (currentNode && nextNode) {
        await this.meshNetwork.sendMessage(currentNode, nextNode, forwardMessage);
        this.logger.debug(`Message ${message.id} forwarded successfully`);
      }
            
    } catch (error) {
      this.logger.error('Message forwarding failed:', error.message);
      throw error;
    }
  }

  /**
     * Deliver message to final destination
     * Handles final message delivery to target node
     */
  async deliverMessage(message, targetNodeName) {
    try {
      this.logger.debug(`Delivering message ${message.id} to ${targetNodeName}`);
            
      const targetNode = this.meshNetwork.nodes.get(targetNodeName);
      if (!targetNode) {
        throw new Error(`Target node not found: ${targetNodeName}`);
      }
            
      // Deliver message to target node
      await targetNode.receiveMessage(message);
            
      // Update delivery statistics
      this.routingStats.messagesDelivered++;
      this.updateDeliveryStatistics(message);
            
      this.logger.success(`Message ${message.id} delivered successfully to ${targetNodeName}`);
            
    } catch (error) {
      this.logger.error('Message delivery failed:', error.message);
      throw error;
    }
  }

  /**
     * Find alternative routing path
     * Attempts to find alternative route when primary path fails
     */
  async findAlternativePath(message, currentNodeName, targetNodeName) {
    try {
      this.logger.debug(`Finding alternative path from ${currentNodeName} to ${targetNodeName}`);
            
      // Get all connections from current node
      const connections = this.meshNetwork.topologyManager.getNodeConnections(currentNodeName);
            
      // Try to find alternative route
      for (const connection of connections) {
        const nextNode = connection.sourceNode === currentNodeName ? 
          connection.targetNode : connection.sourceNode;
                
        if (nextNode !== targetNodeName) {
          // Check if this alternative path leads to target
          const alternativePath = this.meshNetwork.topologyManager.findShortestPath(nextNode, targetNodeName);
          if (alternativePath) {
            const nodeNames = alternativePath.map(nodeId => {
              const node = this.meshNetwork.nodes.get(nodeId);
              return node ? node.name : nodeId;
            });
                        
            return [currentNodeName, ...nodeNames];
          }
        }
      }
            
      return null;
            
    } catch (error) {
      this.logger.error('Alternative path finding failed:', error.message);
      return null;
    }
  }

  /**
     * Handle message processing failure
     * Manages failed message processing
     */
  handleMessageFailure(message, error) {
    try {
      this.logger.warn(`Message processing failed: ${message.id}`, error.message);
            
      // Increment routing attempts
      message.routingAttempts = (message.routingAttempts || 0) + 1;
            
      if (message.routingAttempts < message.maxRoutingAttempts) {
        // Retry processing
        this.messageQueue.push(message);
        this.logger.debug(`Message ${message.id} queued for retry (attempt ${message.routingAttempts})`);
      } else {
        // Mark as failed
        this.failedMessages.push({
          message,
          error: error.message,
          failedAt: new Date()
        });
                
        this.routingStats.messagesFailed++;
        this.logger.error(`Message ${message.id} failed permanently after ${message.routingAttempts} attempts`);
      }
            
    } catch (error) {
      this.logger.error('Message failure handling failed:', error.message);
    }
  }

  /**
     * Handle delivery failure
     * Manages failed message delivery
     */
  handleDeliveryFailure(task, error) {
    try {
      this.logger.warn(`Delivery failed for message: ${task.message.id}`, error.message);
            
      // Increment routing attempts
      task.message.routingAttempts = (task.message.routingAttempts || 0) + 1;
            
      if (task.message.routingAttempts < task.message.maxRoutingAttempts) {
        // Retry delivery
        task.status = 'pending';
        this.deliveryQueue.push(task);
        this.logger.debug(`Message ${task.message.id} queued for delivery retry`);
      } else {
        // Mark as failed
        this.failedMessages.push({
          message: task.message,
          error: error.message,
          failedAt: new Date(),
          routingPath: task.routingPath
        });
                
        this.routingStats.messagesFailed++;
        this.logger.error(`Message ${task.message.id} delivery failed permanently`);
      }
            
    } catch (error) {
      this.logger.error('Delivery failure handling failed:', error.message);
    }
  }

  /**
     * Update delivery statistics
     * Calculates and updates delivery performance metrics
     */
  updateDeliveryStatistics(message) {
    try {
      const deliveryTime = Date.now() - message.routedAt.getTime();
            
      // Update average delivery time
      const totalDelivered = this.routingStats.messagesDelivered;
      this.routingStats.averageDeliveryTime = 
                ((this.routingStats.averageDeliveryTime * (totalDelivered - 1)) + deliveryTime) / totalDelivered;
            
      this.routingStats.lastUpdated = new Date();
            
    } catch (error) {
      this.logger.error('Delivery statistics update failed:', error.message);
    }
  }

  /**
     * Get routing statistics
     * Returns current routing performance metrics
     */
  getRoutingStats() {
    return {
      ...this.routingStats,
      queueLength: this.messageQueue.length,
      deliveryQueueLength: this.deliveryQueue.length,
      failedMessagesCount: this.failedMessages.length
    };
  }

  /**
     * Get failed messages
     * Returns list of messages that failed to route or deliver
     */
  getFailedMessages() {
    return this.failedMessages.map(failure => ({
      messageId: failure.message.id,
      sourceNode: failure.message.sourceNode,
      targetNode: failure.message.targetNode,
      error: failure.error,
      failedAt: failure.failedAt,
      routingAttempts: failure.message.routingAttempts,
      routingPath: failure.routingPath
    }));
  }

  /**
     * Retry failed message
     * Attempts to reprocess a previously failed message
     */
  async retryFailedMessage(messageId) {
    try {
      const failureIndex = this.failedMessages.findIndex(f => f.message.id === messageId);
      if (failureIndex === -1) {
        throw new Error(`Failed message not found: ${messageId}`);
      }
            
      const failure = this.failedMessages.splice(failureIndex, 1)[0];
      const message = failure.message;
            
      // Reset routing attempts
      message.routingAttempts = 0;
            
      // Re-queue for processing
      this.messageQueue.push(message);
            
      this.logger.info(`Message ${messageId} queued for retry`);
            
    } catch (error) {
      this.logger.error(`Failed to retry message ${messageId}:`, error.message);
      throw error;
    }
  }

  /**
     * Clear failed messages
     * Removes all failed messages from the system
     */
  clearFailedMessages() {
    const count = this.failedMessages.length;
    this.failedMessages = [];
    this.routingStats.messagesFailed = 0;
        
    this.logger.info(`Cleared ${count} failed messages`);
    return count;
  }

  /**
     * Get message queue status
     * Returns current queue information
     */
  getQueueStatus() {
    return {
      messageQueue: {
        length: this.messageQueue.length,
        oldestMessage: this.messageQueue[0]?.routedAt || null
      },
      deliveryQueue: {
        length: this.deliveryQueue.length,
        pendingCount: this.deliveryQueue.filter(t => t.status === 'pending').length,
        deliveredCount: this.deliveryQueue.filter(t => t.status === 'delivered').length
      },
      failedMessages: {
        count: this.failedMessages.length,
        recentFailures: this.failedMessages.slice(-5)
      }
    };
  }

  /**
     * Shutdown message router
     * Cleans up resources and stops processing
     */
  async shutdown() {
    this.logger.info('Shutting down message router...');
        
    try {
      // Stop processing intervals
      if (this.processingInterval) {
        clearInterval(this.processingInterval);
      }
            
      if (this.deliveryInterval) {
        clearInterval(this.deliveryInterval);
      }
            
      // Clear queues
      this.messageQueue = [];
      this.deliveryQueue = [];
            
      this.isInitialized = false;
      this.logger.success('Message router shutdown complete');
            
    } catch (error) {
      this.logger.error('Error during message router shutdown:', error.message);
      throw error;
    }
  }
}
