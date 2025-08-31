import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NodeManagement from './pages/NodeManagement';
import NetworkTopology from './pages/NetworkTopology';
import SecurityTesting from './pages/SecurityTesting';
import MessageCenter from './pages/MessageCenter';
import SimulationControl from './pages/SimulationControl';
import { MeshNetworkProvider } from './contexts/MeshNetworkContext';

function App() {
  return (
    <MeshNetworkProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/nodes" element={<NodeManagement />} />
              <Route path="/topology" element={<NetworkTopology />} />
              <Route path="/security" element={<SecurityTesting />} />
              <Route path="/messages" element={<MessageCenter />} />
              <Route path="/simulation" element={<SimulationControl />} />
            </Routes>
          </main>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </MeshNetworkProvider>
  );
}

export default App;
