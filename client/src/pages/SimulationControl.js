import React, { useState } from 'react';
import { Play, Square, Pause, RotateCcw, Settings, Clock, Activity } from 'lucide-react';
import { useMeshNetwork } from '../contexts/MeshNetworkContext';

const SimulationControl = () => {
  const { startSimulation, stopSimulation, loadScenario, isConnected } = useMeshNetwork();
  const [selectedScenario, setSelectedScenario] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [customParameters, setCustomParameters] = useState({
    nodeCount: 5,
    messageRate: 10,
    encryptionLevel: 'AES-256',
    attackProbability: 0.1
  });

  const scenarios = [
    { id: 'basic-mesh', name: 'Basic Mesh Network', description: 'Simple 5-node mesh network' },
    { id: 'secure-communication', name: 'Secure Communication', description: 'High-security mesh with encryption' },
    { id: 'attack-simulation', name: 'Attack Simulation', description: 'Network under various attack scenarios' },
    { id: 'load-testing', name: 'Load Testing', description: 'High-traffic network simulation' },
    { id: 'custom', name: 'Custom Scenario', description: 'User-defined parameters' }
  ];

  const handleStartSimulation = async () => {
    try {
      const scenario = selectedScenario === 'custom' ? 'custom' : selectedScenario;
      const parameters = selectedScenario === 'custom' ? customParameters : {};
      
      await startSimulation(scenario, parameters);
      setSimulationRunning(true);
    } catch (error) {
      console.error('Failed to start simulation:', error);
    }
  };

  const handleStopSimulation = async () => {
    try {
      await stopSimulation();
      setSimulationRunning(false);
    } catch (error) {
      console.error('Failed to stop simulation:', error);
    }
  };

  const handleLoadScenario = async () => {
    if (!selectedScenario) return;
    
    try {
      await loadScenario(selectedScenario);
    } catch (error) {
      console.error('Failed to load scenario:', error);
    }
  };

  const updateCustomParameter = (key, value) => {
    setCustomParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulation Control</h1>
          <p className="text-gray-600">Manage and control mesh network simulations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-600' : 'bg-red-600'
            }`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Simulation Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Simulation Status</h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            simulationRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              simulationRunning ? 'bg-green-600' : 'bg-gray-600'
            }`} />
            <span className="text-sm font-medium">
              {simulationRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Started: {simulationRunning ? 'Just now' : 'Not started'}</span>
          </div>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Scenario</h2>
          <Settings className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Simulation Scenario
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="input-field"
            >
              <option value="">Select a scenario...</option>
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedScenario && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {scenarios.find(s => s.id === selectedScenario)?.description}
              </p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={handleLoadScenario}
              disabled={!selectedScenario}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Load Scenario
            </button>
          </div>
        </div>
      </div>

      {/* Custom Parameters */}
      {selectedScenario === 'custom' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Node Count
              </label>
              <input
                type="number"
                value={customParameters.nodeCount}
                onChange={(e) => updateCustomParameter('nodeCount', parseInt(e.target.value))}
                className="input-field"
                min="2"
                max="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Rate (msg/s)
              </label>
              <input
                type="number"
                value={customParameters.messageRate}
                onChange={(e) => updateCustomParameter('messageRate', parseInt(e.target.value))}
                className="input-field"
                min="1"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encryption Level
              </label>
              <select
                value={customParameters.encryptionLevel}
                onChange={(e) => updateCustomParameter('encryptionLevel', e.target.value)}
                className="input-field"
              >
                <option value="AES-128">AES-128</option>
                <option value="AES-256">AES-256</option>
                <option value="AES-512">AES-512</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attack Probability
              </label>
              <input
                type="number"
                value={customParameters.attackProbability}
                onChange={(e) => updateCustomParameter('attackProbability', parseFloat(e.target.value))}
                className="input-field"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Simulation Controls */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Controls</h2>
        
        <div className="flex space-x-4">
          <button
            onClick={handleStartSimulation}
            disabled={!selectedScenario || simulationRunning}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Simulation
          </button>
          
          <button
            onClick={handleStopSimulation}
            disabled={!simulationRunning}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Simulation
          </button>
          
          <button
            onClick={() => setSimulationRunning(false)}
            className="btn-secondary"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </button>
        </div>
      </div>

      {/* Simulation Statistics */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Statistics</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Messages Sent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Nodes Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Attacks Detected</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">0s</p>
            <p className="text-sm text-gray-500">Runtime</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
            <Play className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Quick Start</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
            <RotateCcw className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Reset</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
            <Settings className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Configure</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200">
            <Activity className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">Monitor</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationControl;
