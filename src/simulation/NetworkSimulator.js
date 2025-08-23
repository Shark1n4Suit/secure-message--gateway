/**
 * NetworkSimulator - Mesh Network Simulation Environment
 * 
 * Manages the overall simulation environment, including simulation speed,
 * time management, and scenario orchestration.
 * 
 * @author Benjamin Morin
 * @version 1.0.0
 */

import { Logger } from '../utils/Logger.js';

export class NetworkSimulator {
  constructor(meshNetwork) {
    this.meshNetwork = meshNetwork;
    this.logger = new Logger();
    this.simulationSpeed = 'realtime';
    this.isRunning = false;
    this.simulationTime = 0;
    this.startTime = null;
    this.scenarios = new Map();
    this.currentScenario = null;
  }

  /**
     * Initialize the simulator
     */
  async initialize() {
    try {
      this.logger.info('Initializing network simulator...');
      this.startTime = Date.now();
      this.isRunning = true;
      this.logger.success('Network simulator initialized');
    } catch (error) {
      this.logger.error('Simulator initialization failed:', error.message);
      throw error;
    }
  }

  /**
     * Set simulation speed
     */
  setSimulationSpeed(speed) {
    const validSpeeds = ['slow', 'normal', 'realtime', 'fast'];
    if (validSpeeds.includes(speed)) {
      this.simulationSpeed = speed;
      this.logger.info(`Simulation speed set to: ${speed}`);
    } else {
      this.logger.warn(`Invalid simulation speed: ${speed}`);
    }
  }

  /**
     * Get simulation status
     */
  getSimulationStatus() {
    return {
      isRunning: this.isRunning,
      simulationSpeed: this.simulationSpeed,
      simulationTime: this.simulationTime,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      currentScenario: this.currentScenario
    };
  }

  /**
     * Shutdown simulator
     */
  async shutdown() {
    this.logger.info('Shutting down network simulator...');
    this.isRunning = false;
    this.logger.success('Network simulator shutdown complete');
  }
}
