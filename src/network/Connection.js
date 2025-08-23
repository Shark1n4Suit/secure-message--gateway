/**
 * Connection - Secure Connection Between Nodes
 * 
 * Represents a secure connection between two nodes in the mesh network,
 * including cryptographic state and connection metadata.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

import { Logger } from '../utils/Logger.js';
import { v4 as uuidv4 } from 'uuid';

export class Connection {
  constructor(sourceNode, targetNode, type = 'secure') {
    this.id = uuidv4();
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
    this.type = type;
    this.status = 'establishing';
    this.establishedAt = null;
    this.lastActivity = new Date();
    this.messageCount = 0;
    this.securityLevel = 'high';
    this.encryptionAlgorithm = 'AES-256-GCM';
    this.logger = new Logger().child(`CONN:${this.id.substring(0, 8)}`);
  }

  /**
     * Establish connection
     */
  async establish() {
    try {
      this.logger.info('Establishing connection...');
      this.status = 'established';
      this.establishedAt = new Date();
      this.logger.success('Connection established');
    } catch (error) {
      this.logger.error('Connection establishment failed:', error.message);
      throw error;
    }
  }

  /**
     * Update activity
     */
  updateActivity() {
    this.lastActivity = new Date();
    this.messageCount++;
  }

  /**
     * Close connection
     */
  async close() {
    this.logger.info('Closing connection...');
    this.status = 'closed';
    this.logger.success('Connection closed');
  }
}
