/**
 * DiscoveryProtocol - Node Discovery and Search Protocol
 * 
 * Implements secure node discovery, search, and announcement protocols
 * for the mesh network simulation.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

import { Logger } from '../utils/Logger.js';

export class DiscoveryProtocol {
  constructor(meshNetwork) {
    this.meshNetwork = meshNetwork;
    this.logger = new Logger();
    this.discoveryCache = new Map();
    this.searchIndex = new Map();
    this.isInitialized = false;
        
    // Discovery statistics
    this.discoveryStats = {
      nodesDiscovered: 0,
      searchesPerformed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastUpdated: new Date()
    };
        
    // Discovery intervals
    this.discoveryInterval = null;
    this.cacheCleanupInterval = null;
  }

  /**
     * Initialize the discovery protocol
     * Sets up discovery mechanisms and caching
     */
  async initialize() {
    try {
      this.logger.info('Initializing discovery protocol...');
            
      // Setup discovery mechanisms
      this.setupDiscoveryMechanisms();
            
      // Setup cache cleanup
      this.setupCacheCleanup();
            
      this.isInitialized = true;
      this.logger.success('Discovery protocol initialized successfully');
            
    } catch (error) {
      this.logger.error('Failed to initialize discovery protocol:', error.message);
      throw error;
    }
  }

  /**
     * Setup discovery mechanisms
     * Initializes periodic discovery and indexing
     */
  setupDiscoveryMechanisms() {
    this.logger.debug('Setting up discovery mechanisms...');
        
    // Start periodic discovery
    this.discoveryInterval = setInterval(() => {
      this.performPeriodicDiscovery();
    }, 30000); // Discover every 30 seconds
        
    this.logger.debug('Discovery mechanisms setup complete');
  }

  /**
     * Setup cache cleanup
     * Initializes periodic cache maintenance
     */
  setupCacheCleanup() {
    this.logger.debug('Setting up cache cleanup...');
        
    // Start cache cleanup
    this.cacheCleanupInterval = setInterval(() => {
      this.cleanupDiscoveryCache();
    }, 300000); // Cleanup every 5 minutes
        
    this.logger.debug('Cache cleanup setup complete');
  }

  /**
     * Announce node presence
     * Broadcasts node discovery information to the network
     */
  async announceNode(node) {
    try {
      if (!this.isInitialized) {
        throw new Error('Discovery protocol not initialized');
      }
            
      this.logger.info(`Announcing node: ${node.name}`);
            
      // Create discovery announcement
      const announcement = {
        type: 'node_announcement',
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        capabilities: node.capabilities,
        status: node.status,
        trustScore: node.trustScore,
        timestamp: new Date().toISOString(),
        signature: null // Will be added by security core
      };
            
      // Sign announcement
      if (node.identity && node.identity.rsaPrivateKey) {
        announcement.signature = await this.meshNetwork.securityCore.createSignature(
          JSON.stringify(announcement),
          node.identity.rsaPrivateKey
        );
      }
            
      // Broadcast announcement
      await this.meshNetwork.broadcastMessage(node, announcement);
            
      // Update discovery cache
      this.updateDiscoveryCache(node, announcement);
            
      // Update search index
      this.updateSearchIndex(node);
            
      this.logger.success(`Node announcement completed: ${node.name}`);
            
    } catch (error) {
      this.logger.error(`Node announcement failed for ${node.name}:`, error.message);
      throw error;
    }
  }

  /**
     * Announce node departure
     * Notifies network of node removal
     */
  async announceNodeDeparture(node) {
    try {
      this.logger.info(`Announcing node departure: ${node.name}`);
            
      // Create departure announcement
      const departure = {
        type: 'node_departure',
        nodeId: node.id,
        nodeName: node.name,
        timestamp: new Date().toISOString(),
        reason: 'shutdown'
      };
            
      // Broadcast departure
      await this.meshNetwork.broadcastMessage(node, departure);
            
      // Remove from discovery cache
      this.discoveryCache.delete(node.id);
            
      // Remove from search index
      this.removeFromSearchIndex(node);
            
      this.logger.success(`Node departure announced: ${node.name}`);
            
    } catch (error) {
      this.logger.error(`Node departure announcement failed for ${node.name}:`, error.message);
      throw error;
    }
  }

  /**
     * Search for nodes in the network
     * Implements secure node search with filtering capabilities
     */
  async searchNodes(query = {}, options = {}) {
    try {
      if (!this.isInitialized) {
        throw new Error('Discovery protocol not initialized');
      }
            
      this.logger.info('Performing node search...');
            
      // Check cache first
      const cacheKey = this.generateCacheKey(query);
      const cachedResults = this.discoveryCache.get(cacheKey);
            
      if (cachedResults && this.isCacheValid(cachedResults)) {
        this.discoveryStats.cacheHits++;
        this.logger.debug('Search results found in cache');
        return this.filterResults(cachedResults.results, query, options);
      }
            
      this.discoveryStats.cacheMisses++;
            
      // Perform fresh search
      const results = await this.performNodeSearch(query, options);
            
      // Cache results
      this.cacheSearchResults(cacheKey, results, query);
            
      // Update statistics
      this.discoveryStats.searchesPerformed++;
      this.discoveryStats.lastUpdated = new Date();
            
      this.logger.success(`Node search completed: ${results.length} results`);
      return results;
            
    } catch (error) {
      this.logger.error('Node search failed:', error.message);
      throw error;
    }
  }

  /**
     * Perform actual node search
     * Executes search based on query parameters
     */
  async performNodeSearch(query, options) {
    try {
      const results = [];
      const limit = options.limit || 50;
            
      // Get all nodes from mesh network
      const allNodes = Array.from(this.meshNetwork.nodes.values());
            
      for (const node of allNodes) {
        try {
          // Check if node matches query
          if (this.nodeMatchesQuery(node, query)) {
            const nodeInfo = this.createNodeInfo(node);
            results.push(nodeInfo);
                        
            // Check limit
            if (results.length >= limit) {
              break;
            }
          }
        } catch (error) {
          this.logger.warn(`Error processing node ${node.name}:`, error.message);
        }
      }
            
      // Sort results by relevance
      results.sort((a, b) => b.relevance - a.relevance);
            
      return results;
            
    } catch (error) {
      this.logger.error('Node search execution failed:', error.message);
      throw error;
    }
  }

  /**
     * Check if node matches search query
     * Implements query matching logic
     */
  nodeMatchesQuery(node, query) {
    try {
      // Name matching (partial match)
      if (query.name && !node.name.toLowerCase().includes(query.name.toLowerCase())) {
        return false;
      }
            
      // Type matching (exact match)
      if (query.type && node.type !== query.type) {
        return false;
      }
            
      // Capability matching
      if (query.capability) {
        const hasCapability = Object.values(node.capabilities).some(cap => 
          cap === true || (typeof cap === 'string' && cap.toLowerCase().includes(query.capability.toLowerCase()))
        );
        if (!hasCapability) {
          return false;
        }
      }
            
      // Status matching
      if (query.status && node.status !== query.status) {
        return false;
      }
            
      // Trust score matching
      if (query.minTrustScore && node.trustScore < query.minTrustScore) {
        return false;
      }
            
      return true;
            
    } catch (error) {
      this.logger.error(`Query matching failed for node ${node.name}:`, error.message);
      return false;
    }
  }

  /**
     * Create node information for search results
     * Formats node data for search response
     */
  createNodeInfo(node) {
    try {
      // Calculate relevance score
      const relevance = this.calculateRelevance(node);
            
      return {
        id: node.id,
        name: node.name,
        type: node.type,
        status: node.status,
        capabilities: node.capabilities,
        trustScore: node.trustScore,
        connections: node.connections.size,
        lastSeen: node.lastSeen,
        relevance,
        metadata: {
          createdAt: node.createdAt,
          uptime: node.uptime,
          messageStats: node.messageStats
        }
      };
            
    } catch (error) {
      this.logger.error(`Failed to create node info for ${node.name}:`, error.message);
      return null;
    }
  }

  /**
     * Calculate node relevance score
     * Determines how relevant a node is to search results
     */
  calculateRelevance(node) {
    try {
      let relevance = 0.5; // Base relevance
            
      // Trust score influence
      relevance += (node.trustScore / 100) * 0.3;
            
      // Connection count influence
      const maxConnections = 10; // Normalize to 0-1
      relevance += Math.min(node.connections.size / maxConnections, 1) * 0.2;
            
      // Status influence
      if (node.status === 'active') {
        relevance += 0.1;
      }
            
      // Capability influence
      const capabilityCount = Object.values(node.capabilities).filter(cap => cap === true).length;
      relevance += Math.min(capabilityCount / 6, 1) * 0.1;
            
      return Math.min(relevance, 1.0);
            
    } catch (error) {
      this.logger.error(`Relevance calculation failed for node ${node.name}:`, error.message);
      return 0.5;
    }
  }

  /**
     * Filter search results
     * Applies additional filtering and sorting
     */
  filterResults(results, query, options) {
    try {
      let filtered = [...results];
            
      // Apply additional filters
      if (options.excludeTypes) {
        filtered = filtered.filter(node => !options.excludeTypes.includes(node.type));
      }
            
      if (options.minConnections) {
        filtered = filtered.filter(node => node.connections >= options.minConnections);
      }
            
      if (options.maxConnections) {
        filtered = filtered.filter(node => node.connections <= options.maxConnections);
      }
            
      // Apply sorting
      if (options.sortBy) {
        filtered.sort((a, b) => {
          switch (options.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'type':
            return a.type.localeCompare(b.type);
          case 'trustScore':
            return b.trustScore - a.trustScore;
          case 'connections':
            return b.connections - a.connections;
          case 'relevance':
            return b.relevance - a.relevance;
          default:
            return 0;
          }
        });
      }
            
      // Apply limit
      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }
            
      return filtered;
            
    } catch (error) {
      this.logger.error('Result filtering failed:', error.message);
      return results;
    }
  }

  /**
     * Update discovery cache
     * Stores node information for quick retrieval
     */
  updateDiscoveryCache(node, announcement) {
    try {
      const cacheEntry = {
        node,
        announcement,
        cachedAt: new Date(),
        lastUpdated: new Date(),
        accessCount: 0
      };
            
      this.discoveryCache.set(node.id, cacheEntry);
            
      // Update search index
      this.updateSearchIndex(node);
            
    } catch (error) {
      this.logger.error(`Cache update failed for node ${node.name}:`, error.message);
    }
  }

  /**
     * Update search index
     * Maintains searchable index of node attributes
     */
  updateSearchIndex(node) {
    try {
      // Index by name
      if (!this.searchIndex.has('name')) {
        this.searchIndex.set('name', new Map());
      }
      this.searchIndex.get('name').set(node.name.toLowerCase(), node.id);
            
      // Index by type
      if (!this.searchIndex.has('type')) {
        this.searchIndex.set('type', new Map());
      }
      if (!this.searchIndex.get('type').has(node.type)) {
        this.searchIndex.get('type').set(node.type, new Set());
      }
      this.searchIndex.get('type').get(node.type).add(node.id);
            
      // Index by capabilities
      if (!this.searchIndex.has('capabilities')) {
        this.searchIndex.set('capabilities', new Map());
      }
      for (const [capability, value] of Object.entries(node.capabilities)) {
        if (value === true) {
          if (!this.searchIndex.get('capabilities').has(capability)) {
            this.searchIndex.get('capabilities').set(capability, new Set());
          }
          this.searchIndex.get('capabilities').get(capability).add(node.id);
        }
      }
            
    } catch (error) {
      this.logger.error(`Search index update failed for node ${node.name}:`, error.message);
    }
  }

  /**
     * Remove from search index
     * Cleans up index entries for removed nodes
     */
  removeFromSearchIndex(node) {
    try {
      // Remove from name index
      if (this.searchIndex.has('name')) {
        this.searchIndex.get('name').delete(node.name.toLowerCase());
      }
            
      // Remove from type index
      if (this.searchIndex.has('type') && this.searchIndex.get('type').has(node.type)) {
        this.searchIndex.get('type').get(node.type).delete(node.id);
      }
            
      // Remove from capabilities index
      if (this.searchIndex.has('capabilities')) {
        for (const [capability, nodes] of this.searchIndex.get('capabilities')) {
          nodes.delete(node.id);
        }
      }
            
    } catch (error) {
      this.logger.error(`Search index removal failed for node ${node.name}:`, error.message);
    }
  }

  /**
     * Generate cache key for query
     * Creates unique identifier for search queries
     */
  generateCacheKey(query) {
    try {
      const sortedQuery = Object.keys(query)
        .sort()
        .reduce((result, key) => {
          result[key] = query[key];
          return result;
        }, {});
            
      return JSON.stringify(sortedQuery);
            
    } catch (error) {
      this.logger.error('Cache key generation failed:', error.message);
      return JSON.stringify(query);
    }
  }

  /**
     * Check if cache entry is valid
     * Determines if cached results are still fresh
     */
  isCacheValid(cacheEntry) {
    try {
      const maxAge = 5 * 60 * 1000; // 5 minutes
      const now = new Date();
      const age = now - cacheEntry.cachedAt;
            
      return age < maxAge;
            
    } catch (error) {
      this.logger.error('Cache validation failed:', error.message);
      return false;
    }
  }

  /**
     * Cache search results
     * Stores search results for future use
     */
  cacheSearchResults(cacheKey, results, query) {
    try {
      const cacheEntry = {
        results,
        query,
        cachedAt: new Date(),
        accessCount: 0
      };
            
      this.discoveryCache.set(cacheKey, cacheEntry);
            
    } catch (error) {
      this.logger.error('Search result caching failed:', error.message);
    }
  }

  /**
     * Perform periodic discovery
     * Regularly updates node information
     */
  async performPeriodicDiscovery() {
    try {
      this.logger.debug('Performing periodic discovery...');
            
      // Update discovery cache with current node information
      for (const [nodeId, node] of this.meshNetwork.nodes) {
        if (this.discoveryCache.has(nodeId)) {
          const cacheEntry = this.discoveryCache.get(nodeId);
          cacheEntry.lastUpdated = new Date();
          cacheEntry.accessCount++;
        }
      }
            
      // Update statistics
      this.discoveryStats.nodesDiscovered = this.meshNetwork.nodes.size;
      this.discoveryStats.lastUpdated = new Date();
            
      this.logger.debug('Periodic discovery completed');
            
    } catch (error) {
      this.logger.error('Periodic discovery failed:', error.message);
    }
  }

  /**
     * Cleanup discovery cache
     * Removes stale cache entries
     */
  cleanupDiscoveryCache() {
    try {
      this.logger.debug('Cleaning up discovery cache...');
            
      const now = new Date();
      const maxAge = 30 * 60 * 1000; // 30 minutes
      let removedCount = 0;
            
      // Remove stale cache entries
      for (const [key, entry] of this.discoveryCache) {
        if (now - entry.cachedAt > maxAge) {
          this.discoveryCache.delete(key);
          removedCount++;
        }
      }
            
      if (removedCount > 0) {
        this.logger.debug(`Removed ${removedCount} stale cache entries`);
      }
            
    } catch (error) {
      this.logger.error('Cache cleanup failed:', error.message);
    }
  }

  /**
     * Get discovery statistics
     * Returns current discovery performance metrics
     */
  getDiscoveryStats() {
    return {
      ...this.discoveryStats,
      cacheSize: this.discoveryCache.size,
      searchIndexSize: this.searchIndex.size
    };
  }

  /**
     * Get cached node information
     * Returns node information from cache
     */
  getCachedNodeInfo(nodeId) {
    try {
      const cacheEntry = this.discoveryCache.get(nodeId);
      if (cacheEntry && this.isCacheValid(cacheEntry)) {
        cacheEntry.accessCount++;
        return cacheEntry.node;
      }
      return null;
            
    } catch (error) {
      this.logger.error(`Failed to get cached node info for ${nodeId}:`, error.message);
      return null;
    }
  }

  /**
     * Clear discovery cache
     * Removes all cached discovery information
     */
  clearDiscoveryCache() {
    try {
      const cacheSize = this.discoveryCache.size;
      this.discoveryCache.clear();
      this.searchIndex.clear();
            
      this.logger.info(`Discovery cache cleared: ${cacheSize} entries removed`);
      return cacheSize;
            
    } catch (error) {
      this.logger.error('Discovery cache clearing failed:', error.message);
      throw error;
    }
  }

  /**
     * Shutdown discovery protocol
     * Cleans up resources and stops discovery
     */
  async shutdown() {
    this.logger.info('Shutting down discovery protocol...');
        
    try {
      // Stop discovery intervals
      if (this.discoveryInterval) {
        clearInterval(this.discoveryInterval);
      }
            
      if (this.cacheCleanupInterval) {
        clearInterval(this.cacheCleanupInterval);
      }
            
      // Clear data structures
      this.discoveryCache.clear();
      this.searchIndex.clear();
            
      this.isInitialized = false;
      this.logger.success('Discovery protocol shutdown complete');
            
    } catch (error) {
      this.logger.error('Error during discovery protocol shutdown:', error.message);
      throw error;
    }
  }
}
