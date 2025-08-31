import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Zap, Target } from 'lucide-react';
import { useMeshNetwork } from '../contexts/MeshNetworkContext';

const SecurityTesting = () => {
  const { securityStatus, testSecurity, simulateAttack, isConnected } = useMeshNetwork();
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedAttack, setSelectedAttack] = useState('');

  const securityTests = [
    { id: 'encryption', name: 'Encryption Strength', description: 'Test encryption algorithms and key strength' },
    { id: 'certificate', name: 'Certificate Validation', description: 'Validate SSL/TLS certificates' },
    { id: 'authentication', name: 'Authentication', description: 'Test authentication mechanisms' },
    { id: 'authorization', name: 'Authorization', description: 'Test access control policies' }
  ];

  const attackTypes = [
    { id: 'man-in-middle', name: 'Man-in-the-Middle', description: 'Simulate MITM attack' },
    { id: 'replay', name: 'Replay Attack', description: 'Simulate message replay' },
    { id: 'brute-force', name: 'Brute Force', description: 'Test password strength' },
    { id: 'dos', name: 'Denial of Service', description: 'Simulate DoS attack' }
  ];

  const handleRunTest = async () => {
    if (!selectedTest) return;
    try {
      await testSecurity(selectedTest, {});
    } catch (error) {
      console.error('Security test failed:', error);
    }
  };

  const handleSimulateAttack = async () => {
    if (!selectedAttack) return;
    try {
      await simulateAttack(selectedAttack, {});
    } catch (error) {
      console.error('Attack simulation failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Testing</h1>
          <p className="text-gray-600">Test and validate your mesh network security</p>
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

      {/* Security Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Security Status</h2>
          <Shield className="w-5 h-5 text-gray-400" />
        </div>
        
        {securityStatus ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">AES-{securityStatus.encryptionLevel || '256'}</p>
              <p className="text-sm text-gray-500">Encryption</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{securityStatus.activeThreats || 0}</p>
              <p className="text-sm text-gray-500">Active Threats</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{securityStatus.vulnerabilities || 0}</p>
              <p className="text-sm text-gray-500">Vulnerabilities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {securityStatus.certificateValidation ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-gray-500">Cert Validation</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p>No security data available</p>
          </div>
        )}
      </div>

      {/* Security Tests */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Security Tests</h2>
          <CheckCircle className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Security Test
            </label>
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a test...</option>
              {securityTests.map(test => (
                <option key={test.id} value={test.id}>
                  {test.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedTest && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {securityTests.find(t => t.id === selectedTest)?.description}
              </p>
            </div>
          )}
          
          <button
            onClick={handleRunTest}
            disabled={!selectedTest}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run Security Test
          </button>
        </div>
      </div>

      {/* Attack Simulation */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Attack Simulation</h2>
          <Target className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Attack Type
            </label>
            <select
              value={selectedAttack}
              onChange={(e) => setSelectedAttack(e.target.value)}
              className="input-field"
            >
              <option value="">Choose an attack...</option>
              {attackTypes.map(attack => (
                <option key={attack.id} value={attack.id}>
                  {attack.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedAttack && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                {attackTypes.find(a => a.id === selectedAttack)?.description}
              </p>
            </div>
          )}
          
          <button
            onClick={handleSimulateAttack}
            disabled={!selectedAttack}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simulate Attack
          </button>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Recommendations</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Regular Security Audits</p>
              <p className="text-xs text-yellow-700">Perform security tests monthly</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Strong Encryption</p>
              <p className="text-xs text-green-700">Use AES-256 for all communications</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Real-time Monitoring</p>
              <p className="text-xs text-blue-700">Monitor network for suspicious activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTesting;
