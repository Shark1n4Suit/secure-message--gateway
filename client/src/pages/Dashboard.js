import React, { useEffect } from 'react';
import { 
  Network, 
  Shield, 
  MessageSquare, 
  Activity, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Play
} from 'lucide-react';
import { useMeshNetwork } from '../contexts/MeshNetworkContext';

const Dashboard = () => {
  const { 
    nodes, 
    networkStats, 
    securityStatus, 
    messages, 
    isConnected,
    fetchNetworkStats,
    fetchSecurityStatus
  } = useMeshNetwork();

  useEffect(() => {
    if (isConnected) {
      fetchNetworkStats();
      fetchSecurityStatus();
    }
  }, [isConnected, fetchNetworkStats, fetchSecurityStatus]);

  const getSecurityScore = () => {
    if (!securityStatus) return 0;
    // Calculate security score based on various factors
    let score = 100;
    if (securityStatus.vulnerabilities > 0) score -= 20;
    if (securityStatus.encryptionLevel < 256) score -= 15;
    if (!securityStatus.certificateValidation) score -= 25;
    return Math.max(0, score);
  };

  const getSecurityColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const recentMessages = messages.slice(0, 5);
  const topNodes = nodes
    .sort((a, b) => (b.connections || 0) - (a.connections || 0))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Secure Mesh Network Overview</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Nodes */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Nodes</p>
              <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Network className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Connections */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Connections</p>
              <p className="text-2xl font-bold text-gray-900">
                {networkStats?.totalConnections || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Security Score */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-bold ${getSecurityColor(getSecurityScore())}`}>
                  {getSecurityScore()}%
                </p>
                {getSecurityIcon(getSecurityScore())}
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Messages Today */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages Today</p>
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Network Activity</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          {networkStats ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Network Health</span>
                <span className={`text-sm font-medium ${
                  networkStats.health === 'excellent' ? 'text-green-600' :
                  networkStats.health === 'good' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {networkStats.health?.charAt(0).toUpperCase() + networkStats.health?.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Latency</span>
                <span className="text-sm font-medium text-gray-900">
                  {networkStats.averageLatency || 'N/A'} ms
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Message Throughput</span>
                <span className="text-sm font-medium text-gray-900">
                  {networkStats.messageThroughput || 'N/A'} msg/s
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No network data available</p>
            </div>
          )}
        </div>

        {/* Security Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Security Status</h2>
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          
          {securityStatus ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Encryption Level</span>
                <span className="text-sm font-medium text-gray-900">
                  AES-{securityStatus.encryptionLevel || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Certificate Validation</span>
                <span className={`text-sm font-medium ${
                  securityStatus.certificateValidation ? 'text-green-600' : 'text-red-600'
                }`}>
                  {securityStatus.certificateValidation ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Threats</span>
                <span className="text-sm font-medium text-gray-900">
                  {securityStatus.activeThreats || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Security Scan</span>
                <span className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {securityStatus.lastScan ? new Date(securityStatus.lastScan).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No security data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          
          {recentMessages.length > 0 ? (
            <div className="space-y-3">
              {recentMessages.map((message, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {message.from} → {message.to}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{message.content}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No messages yet</p>
            </div>
          )}
        </div>

        {/* Top Connected Nodes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Connected Nodes</h2>
            <Network className="w-5 h-5 text-gray-400" />
          </div>
          
          {topNodes.length > 0 ? (
            <div className="space-y-3">
              {topNodes.map((node, index) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {node.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{node.name}</p>
                      <p className="text-xs text-gray-500">{node.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{node.connections || 0}</p>
                    <p className="text-xs text-gray-500">connections</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Network className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No nodes available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
            <Network className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Create Node</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
            <Wifi className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Connect Nodes</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
            <Shield className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Security Test</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200">
            <Play className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">Start Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
