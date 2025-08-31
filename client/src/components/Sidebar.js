import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Network, 
  Shield, 
  MessageSquare, 
  Play, 
  Settings,
  Wifi,
  Activity
} from 'lucide-react';
import { useMeshNetwork } from '../contexts/MeshNetworkContext';

const Sidebar = () => {
  const location = useLocation();
  const { isConnected, nodes, networkStats } = useMeshNetwork();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Node Management', href: '/nodes', icon: Network },
    { name: 'Network Topology', href: '/topology', icon: Wifi },
    { name: 'Security Testing', href: '/security', icon: Shield },
    { name: 'Message Center', href: '/messages', icon: MessageSquare },
    { name: 'Simulation Control', href: '/simulation', icon: Play },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Secure Mesh</h1>
            <p className="text-sm text-gray-400">Security Research Platform</p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Connection Status</span>
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {isConnected && networkStats && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Active Nodes:</span>
              <span className="text-white">{nodes.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Total Connections:</span>
              <span className="text-white">{networkStats?.totalConnections || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-400 text-center">
          <p>Built by Benjamin Morin</p>
          <p>Security Researcher & Consultant</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
