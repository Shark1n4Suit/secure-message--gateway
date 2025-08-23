#!/usr/bin/env node

/**
 * Secure Mesh CLI - Main Entry Point
 * 
 * This is the primary entry point for the Secure Mesh CLI application.
 * It initializes the security core, sets up the CLI interface, and
 * handles the main application lifecycle.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { SecurityCore } from './core/SecurityCore.js';
import { MeshNetwork } from './network/MeshNetwork.js';
import { CLIInterface } from './cli/CLIInterface.js';
import { Logger } from './utils/Logger.js';
import { ConfigManager } from './config/ConfigManager.js';

// Initialize configuration and security
const config = new ConfigManager();
const logger = new Logger();
const securityCore = new SecurityCore();
const meshNetwork = new MeshNetwork(securityCore);
const cli = new CLIInterface(meshNetwork);

/**
 * Main application initialization
 * Sets up security core, validates configuration, and starts CLI
 */
async function initializeApplication() {
  try {
    logger.info('Initializing Secure Mesh CLI...');
        
    // Validate security configuration
    await securityCore.initialize();
    logger.success('Security core initialized successfully');
        
    // Initialize mesh network
    await meshNetwork.initialize();
    logger.success('Mesh network simulation ready');
        
    // Start CLI interface
    await cli.start();
        
  } catch (error) {
    logger.error('Failed to initialize application:', error.message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 * Ensures proper cleanup of security resources and network connections
 */
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
        
    try {
      await meshNetwork.shutdown();
      await securityCore.shutdown();
      logger.success('Application shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error.message);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error.message);
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}

/**
 * Main application entry point
 */
async function main() {
  // Display banner
  console.log(chalk.blue.bold(`
╔══════════════════════════════════════════════════════════════╗
║                    SECURE MESH CLI                          ║
║              Offline Security Research Platform             ║
║                                                              ║
║              Built by Benjamin Morin                        ║
║              Security Researcher & Consultant               ║
╚══════════════════════════════════════════════════════════════╝
    `));

  // Setup graceful shutdown
  setupGracefulShutdown();
    
  // Initialize and start application
  await initializeApplication();
}

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Fatal error in main:', error.message);
    process.exit(1);
  });
}

export { main, initializeApplication };
