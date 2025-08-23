/**
 * ConfigManager - Configuration Management System
 * 
 * Manages application configuration including environment variables, config files,
 * and security settings for the Secure Mesh CLI application.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

import { Logger } from '../utils/Logger.js';
import fs from 'fs/promises';
import path from 'path';

export class ConfigManager {
  constructor() {
    this.logger = new Logger();
    this.config = new Map();
    this.configFile = null;
    this.envPrefix = 'MESH_';
        
    this.loadDefaultConfig();
    this.loadEnvironmentConfig();
  }

  /**
     * Load default configuration values
     * Sets up sensible defaults for all configuration options
     */
  loadDefaultConfig() {
    this.logger.debug('Loading default configuration...');
        
    // Security configuration
    this.config.set('security.encryption_level', 256);
    this.config.set('security.cert_validation', true);
    this.config.set('security.trust_requirement', 'high');
    this.config.set('security.key_rotation_interval', 86400000); // 24 hours
    this.config.set('security.max_cert_age', 31536000000); // 1 year
    this.config.set('security.require_mutual_auth', true);
    this.config.set('security.replay_protection', true);
    this.config.set('security.forward_secrecy', true);
        
    // Network configuration
    this.config.set('network.max_nodes', 1000);
    this.config.set('network.simulation_speed', 'realtime');
    this.config.set('network.auto_discovery', true);
    this.config.set('network.connection_timeout', 30000); // 30 seconds
    this.config.set('network.heartbeat_interval', 5000); // 5 seconds
    this.config.set('network.max_message_size', 1048576); // 1 MB
        
    // CLI configuration
    this.config.set('cli.interactive_mode', true);
    this.config.set('cli.auto_complete', true);
    this.config.set('cli.command_history_size', 100);
    this.config.set('cli.output_format', 'table');
    this.config.set('cli.colors_enabled', true);
    this.config.set('cli.verbose_logging', false);
        
    // Logging configuration
    this.config.set('logging.level', 'info');
    this.config.set('logging.timestamp', true);
    this.config.set('logging.colors', true);
    this.config.set('logging.file_enabled', false);
    this.config.set('logging.file_path', './logs/mesh-cli.log');
    this.config.set('logging.max_file_size', 10485760); // 10 MB
    this.config.set('logging.max_files', 5);
        
    // Performance configuration
    this.config.set('performance.max_concurrent_operations', 10);
    this.config.set('performance.operation_timeout', 60000); // 1 minute
    this.config.set('performance.memory_limit', 536870912); // 512 MB
    this.config.set('performance.gc_interval', 300000); // 5 minutes
        
    // Development configuration
    this.config.set('dev.debug_mode', false);
    this.config.set('dev.test_mode', false);
    this.config.set('dev.mock_security', false);
    this.config.set('dev.auto_save_state', true);
        
    this.logger.debug('Default configuration loaded');
  }

  /**
     * Load configuration from environment variables
     * Overrides defaults with environment-specific values
     */
  loadEnvironmentConfig() {
    this.logger.debug('Loading environment configuration...');
        
    const envVars = process.env;
    let loadedCount = 0;
        
    for (const [key, value] of Object.entries(envVars)) {
      if (key.startsWith(this.envPrefix)) {
        const configKey = key.slice(this.envPrefix.length).toLowerCase().replace(/_/g, '.');
        const parsedValue = this.parseEnvironmentValue(value);
                
        this.config.set(configKey, parsedValue);
        loadedCount++;
      }
    }
        
    this.logger.debug(`Loaded ${loadedCount} environment variables`);
  }

  /**
     * Parse environment variable value
     * Converts string values to appropriate types
     */
  parseEnvironmentValue(value) {
    if (value === 'true' || value === 'false') {
      return value === 'true';
    }
        
    if (!isNaN(value) && value !== '') {
      const num = Number(value);
      return Number.isInteger(num) ? num : num;
    }
        
    if (value === 'null') {
      return null;
    }
        
    if (value === 'undefined') {
      return undefined;
    }
        
    return value;
  }

  /**
     * Load configuration from file
     * Supports JSON and YAML configuration files
     */
  async loadConfigFile(filePath) {
    try {
      this.logger.info(`Loading configuration from: ${filePath}`);
            
      const fullPath = path.resolve(filePath);
      const fileContent = await fs.readFile(fullPath, 'utf8');
            
      let configData;
      const ext = path.extname(filePath).toLowerCase();
            
      if (ext === '.json') {
        configData = JSON.parse(fileContent);
      } else if (ext === '.yaml' || ext === '.yml') {
        // Note: YAML parsing would require additional dependency
        this.logger.warn('YAML configuration files require yaml package. Using JSON for now.');
        return;
      } else {
        throw new Error(`Unsupported configuration file format: ${ext}`);
      }
            
      // Merge configuration data
      this.mergeConfig(configData);
      this.configFile = fullPath;
            
      this.logger.success(`Configuration loaded from: ${filePath}`);
            
    } catch (error) {
      this.logger.error(`Failed to load configuration file ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
     * Save configuration to file
     * Exports current configuration to JSON file
     */
  async saveConfigFile(filePath) {
    try {
      this.logger.info(`Saving configuration to: ${filePath}`);
            
      const fullPath = path.resolve(filePath);
      const configData = this.exportConfig();
            
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
            
      // Write configuration file
      await fs.writeFile(fullPath, JSON.stringify(configData, null, 2), 'utf8');
            
      this.logger.success(`Configuration saved to: ${filePath}`);
            
    } catch (error) {
      this.logger.error(`Failed to save configuration file ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
     * Merge configuration data
     * Recursively merges new configuration with existing values
     */
  mergeConfig(configData, prefix = '') {
    for (const [key, value] of Object.entries(configData)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
            
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.mergeConfig(value, fullKey);
      } else {
        this.config.set(fullKey, value);
      }
    }
  }

  /**
     * Export current configuration
     * Converts flat configuration to nested object structure
     */
  exportConfig() {
    const configData = {};
        
    for (const [key, value] of this.config) {
      const keys = key.split('.');
      let current = configData;
            
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!current[k]) {
          current[k] = {};
        }
        current = current[k];
      }
            
      current[keys[keys.length - 1]] = value;
    }
        
    return configData;
  }

  /**
     * Get configuration value
     * Retrieves value by dot-notation key with optional default
     */
  get(key, defaultValue = undefined) {
    if (this.config.has(key)) {
      return this.config.get(key);
    }
        
    return defaultValue;
  }

  /**
     * Set configuration value
     * Sets value by dot-notation key
     */
  set(key, value) {
    this.config.set(key, value);
    this.logger.debug(`Configuration updated: ${key} = ${value}`);
  }

  /**
     * Check if configuration key exists
     */
  has(key) {
    return this.config.has(key);
  }

  /**
     * Delete configuration key
     */
  delete(key) {
    const deleted = this.config.delete(key);
    if (deleted) {
      this.logger.debug(`Configuration deleted: ${key}`);
    }
    return deleted;
  }

  /**
     * Get all configuration keys
     */
  getKeys() {
    return Array.from(this.config.keys());
  }

  /**
     * Get configuration as object
     */
  getAll() {
    return this.exportConfig();
  }

  /**
     * Validate configuration
     * Checks for required values and validates data types
     */
  validateConfig() {
    this.logger.info('Validating configuration...');
        
    const errors = [];
    const warnings = [];
        
    // Security validation
    const encryptionLevel = this.get('security.encryption_level');
    if (![128, 192, 256].includes(encryptionLevel)) {
      errors.push('Invalid encryption level. Must be 128, 192, or 256.');
    }
        
    const trustRequirement = this.get('security.trust_requirement');
    if (!['low', 'medium', 'high'].includes(trustRequirement)) {
      errors.push('Invalid trust requirement. Must be low, medium, or high.');
    }
        
    // Network validation
    const maxNodes = this.get('network.max_nodes');
    if (maxNodes < 1 || maxNodes > 10000) {
      errors.push('Invalid max nodes. Must be between 1 and 10000.');
    }
        
    const simulationSpeed = this.get('network.simulation_speed');
    if (!['slow', 'normal', 'realtime', 'fast'].includes(simulationSpeed)) {
      warnings.push('Invalid simulation speed. Using default: realtime');
      this.set('network.simulation_speed', 'realtime');
    }
        
    // Performance validation
    const memoryLimit = this.get('performance.memory_limit');
    if (memoryLimit < 134217728) { // 128 MB
      warnings.push('Memory limit is very low. Consider increasing for production use.');
    }
        
    // Log results
    if (errors.length > 0) {
      this.logger.error('Configuration validation failed:');
      errors.forEach(error => this.logger.error(`  - ${error}`));
      throw new Error('Configuration validation failed');
    }
        
    if (warnings.length > 0) {
      this.logger.warn('Configuration validation warnings:');
      warnings.forEach(warning => this.logger.warn(`  - ${warning}`));
    }
        
    this.logger.success('Configuration validation passed');
  }

  /**
     * Reset configuration to defaults
     */
  resetToDefaults() {
    this.logger.info('Resetting configuration to defaults...');
        
    this.config.clear();
    this.loadDefaultConfig();
        
    this.logger.success('Configuration reset to defaults');
  }

  /**
     * Get security configuration
     * Returns all security-related settings
     */
  getSecurityConfig() {
    const securityKeys = this.getKeys().filter(key => key.startsWith('security.'));
    const securityConfig = {};
        
    securityKeys.forEach(key => {
      const shortKey = key.replace('security.', '');
      securityConfig[shortKey] = this.get(key);
    });
        
    return securityConfig;
  }

  /**
     * Get network configuration
     * Returns all network-related settings
     */
  getNetworkConfig() {
    const networkKeys = this.getKeys().filter(key => key.startsWith('network.'));
    const networkConfig = {};
        
    networkKeys.forEach(key => {
      const shortKey = key.replace('network.', '');
      networkConfig[shortKey] = this.get(key);
    });
        
    return networkConfig;
  }

  /**
     * Get CLI configuration
     * Returns all CLI-related settings
     */
  getCLIConfig() {
    const cliKeys = this.getKeys().filter(key => key.startsWith('cli.'));
    const cliConfig = {};
        
    cliKeys.forEach(key => {
      const shortKey = key.replace('cli.', '');
      cliConfig[shortKey] = this.get(key);
    });
        
    return cliConfig;
  }

  /**
     * Update configuration from command line arguments
     * Processes --config-* flags
     */
  updateFromCommandLine(args) {
    this.logger.debug('Processing command line configuration...');
        
    let updatedCount = 0;
        
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
            
      if (arg.startsWith('--config-')) {
        const configKey = arg.slice(9).replace(/-/g, '.');
        const value = args[i + 1];
                
        if (value && !value.startsWith('--')) {
          const parsedValue = this.parseEnvironmentValue(value);
          this.set(configKey, parsedValue);
          updatedCount++;
          i++; // Skip the value in next iteration
        }
      }
    }
        
    this.logger.debug(`Updated ${updatedCount} configuration values from command line`);
  }

  /**
     * Create configuration template
     * Generates a template configuration file
     */
  async createConfigTemplate(filePath) {
    try {
      this.logger.info(`Creating configuration template: ${filePath}`);
            
      const template = {
        security: {
          encryption_level: 256,
          cert_validation: true,
          trust_requirement: 'high',
          key_rotation_interval: 86400000,
          max_cert_age: 31536000000,
          require_mutual_auth: true,
          replay_protection: true,
          forward_secrecy: true
        },
        network: {
          max_nodes: 1000,
          simulation_speed: 'realtime',
          auto_discovery: true,
          connection_timeout: 30000,
          heartbeat_interval: 5000,
          max_message_size: 1048576
        },
        cli: {
          interactive_mode: true,
          auto_complete: true,
          command_history_size: 100,
          output_format: 'table',
          colors_enabled: true,
          verbose_logging: false
        },
        logging: {
          level: 'info',
          timestamp: true,
          colors: true,
          file_enabled: false,
          file_path: './logs/mesh-cli.log',
          max_file_size: 10485760,
          max_files: 5
        },
        performance: {
          max_concurrent_operations: 10,
          operation_timeout: 60000,
          memory_limit: 536870912,
          gc_interval: 300000
        },
        dev: {
          debug_mode: false,
          test_mode: false,
          mock_security: false,
          auto_save_state: true
        }
      };
            
      await this.saveConfigFile(filePath);
      this.logger.success(`Configuration template created: ${filePath}`);
            
    } catch (error) {
      this.logger.error('Failed to create configuration template:', error.message);
      throw error;
    }
  }

  /**
     * Get configuration summary
     * Returns a human-readable summary of current configuration
     */
  getConfigSummary() {
    const summary = {
      security: this.getSecurityConfig(),
      network: this.getNetworkConfig(),
      cli: this.getCLIConfig(),
      logging: {
        level: this.get('logging.level'),
        timestamp: this.get('logging.timestamp'),
        colors: this.get('logging.colors')
      },
      performance: {
        max_concurrent_operations: this.get('performance.max_concurrent_operations'),
        memory_limit: this.get('performance.memory_limit')
      }
    };
        
    return summary;
  }

  /**
     * Check if configuration is production-ready
     * Validates security and performance settings for production use
     */
  isProductionReady() {
    const securityConfig = this.getSecurityConfig();
    const performanceConfig = this.getPerformanceConfig();
        
    // Security checks
    if (securityConfig.encryption_level < 256) return false;
    if (securityConfig.trust_requirement !== 'high') return false;
    if (!securityConfig.cert_validation) return false;
    if (!securityConfig.require_mutual_auth) return false;
        
    // Performance checks
    if (performanceConfig.memory_limit < 268435456) return false; // 256 MB
        
    // Development checks
    if (this.get('dev.debug_mode')) return false;
    if (this.get('dev.test_mode')) return false;
    if (this.get('dev.mock_security')) return false;
        
    return true;
  }

  /**
     * Get performance configuration
     * Returns all performance-related settings
     */
  getPerformanceConfig() {
    const perfKeys = this.getKeys().filter(key => key.startsWith('performance.'));
    const perfConfig = {};
        
    perfKeys.forEach(key => {
      const shortKey = key.replace('performance.', '');
      perfConfig[shortKey] = this.get(key);
    });
        
    return perfConfig;
  }
}
