import React, { useState } from 'react';
import { MessageSquare, Send, Lock, Unlock, Clock, User } from 'lucide-react';
import { useMeshNetwork } from '../contexts/MeshNetworkContext';

const MessageCenter = () => {
  const { nodes, messages, sendMessage, broadcastMessage, isConnected } = useMeshNetwork();
  const [messageType, setMessageType] = useState('direct');
  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [encryption, setEncryption] = useState(true);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!fromNode || !messageContent) return;
    
    try {
      if (messageType === 'direct' && !toNode) {
        alert('Please select a target node for direct messages');
        return;
      }
      
      if (messageType === 'direct') {
        await sendMessage(fromNode, toNode, messageContent, encryption);
      } else {
        await broadcastMessage(fromNode, messageContent, encryption);
      }
      
      // Clear form
      setMessageContent('');
      setToNode('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getMessageIcon = (encrypted) => {
    return encrypted ? (
      <Lock className="w-4 h-4 text-green-600" />
    ) : (
      <Unlock className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Center</h1>
          <p className="text-gray-600">Send encrypted messages between mesh network nodes</p>
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

      {/* Send Message Form */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Send Message</h2>
          <Send className="w-5 h-5 text-gray-400" />
        </div>
        
        <form onSubmit={handleSendMessage} className="space-y-4">
          {/* Message Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="direct"
                  checked={messageType === 'direct'}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Direct Message</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="broadcast"
                  checked={messageType === 'broadcast'}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Broadcast</span>
              </label>
            </div>
          </div>

          {/* From Node */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Node
            </label>
            <select
              value={fromNode}
              onChange={(e) => setFromNode(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select source node</option>
              {nodes.map(node => (
                <option key={node.id} value={node.name}>{node.name}</option>
              ))}
            </select>
          </div>

          {/* To Node (only for direct messages) */}
          {messageType === 'direct' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Node
              </label>
              <select
                value={toNode}
                onChange={(e) => setToNode(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select target node</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.name}>{node.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="input-field"
              rows={4}
              placeholder="Enter your message..."
              required
            />
          </div>

          {/* Encryption Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="encryption"
              checked={encryption}
              onChange={(e) => setEncryption(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="encryption" className="text-sm font-medium text-gray-700">
              Enable Encryption
            </label>
            {encryption ? (
              <Lock className="w-4 h-4 text-green-600" />
            ) : (
              <Unlock className="w-4 h-4 text-red-600" />
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!fromNode || !messageContent}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </button>
        </form>
      </div>

      {/* Message History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Message History</h2>
          <MessageSquare className="w-5 h-5 text-gray-400" />
        </div>
        
        {messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getMessageIcon(message.encrypted)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {message.from} {message.to && `→ ${message.to}`}
                    </p>
                    {message.encrypted && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Encrypted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{message.content}</p>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(message.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p>No messages yet</p>
            <p className="text-sm text-gray-400 mt-2">Send your first message to get started</p>
          </div>
        )}
      </div>

      {/* Message Statistics */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
            <p className="text-sm text-gray-500">Total Messages</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {messages.filter(m => m.encrypted).length}
            </p>
            <p className="text-sm text-gray-500">Encrypted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {messages.filter(m => !m.encrypted).length}
            </p>
            <p className="text-sm text-gray-500">Unencrypted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {messages.filter(m => m.to).length}
            </p>
            <p className="text-sm text-gray-500">Direct Messages</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
