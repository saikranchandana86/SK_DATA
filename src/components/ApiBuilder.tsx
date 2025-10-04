import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Play, 
  Save, 
  Copy, 
  Settings, 
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const methodColors = {
  GET: 'bg-green-600 hover:bg-green-700',
  POST: 'bg-blue-600 hover:bg-blue-700',
  PUT: 'bg-yellow-600 hover:bg-yellow-700',
  DELETE: 'bg-red-600 hover:bg-red-700',
  PATCH: 'bg-purple-600 hover:bg-purple-700',
};

export const ApiBuilder: React.FC = () => {
  const { selectedApi, updateApi, runApi, runApiWithAuth } = useAppStore();
  const [showHeaders, setShowHeaders] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  if (!selectedApi) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
            <Settings className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No API Selected</h3>
          <p className="text-sm">Select an API from the left panel or create a new one</p>
        </div>
      </div>
    );
  }

  const handleHeaderChange = (key: string, value: string) => {
    const newHeaders = { ...selectedApi.headers };
    if (value) {
      newHeaders[key] = value;
    } else {
      delete newHeaders[key];
    }
    updateApi(selectedApi.id, { headers: newHeaders });
  };

  const handleParamChange = (key: string, value: string) => {
    const newParams = { ...selectedApi.params };
    if (value) {
      newParams[key] = value;
    } else {
      delete newParams[key];
    }
    updateApi(selectedApi.id, { params: newParams });
  };

  const addParam = () => {
    const newParams = { ...selectedApi.params, '': '' };
    updateApi(selectedApi.id, { params: newParams });
  };

  const removeParam = (key: string) => {
    const newParams = { ...selectedApi.params };
    delete newParams[key];
    updateApi(selectedApi.id, { params: newParams });
  };

  const addHeader = () => {
    const newHeaders = { ...selectedApi.headers, '': '' };
    updateApi(selectedApi.id, { headers: newHeaders });
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...selectedApi.headers };
    delete newHeaders[key];
    updateApi(selectedApi.id, { headers: newHeaders });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedApi.method}
              onChange={(e) => updateApi(selectedApi.id, { method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' })}
              className={`px-3 py-1.5 rounded-md text-sm font-medium text-white border-none outline-none ${
                methodColors[selectedApi.method]
              }`}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input
              type="text"
              value={selectedApi.url}
              onChange={(e) => updateApi(selectedApi.id, { url: e.target.value })}
              className="flex-1 min-w-96 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm font-mono"
              placeholder="https://api.example.com/users?search={{inputName.text}}"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
                  <button
            onClick={() => {
              if (selectedApi.authentication && selectedApi.authentication.type && selectedApi.authentication.type !== 'none') {
                runApiWithAuth(selectedApi.id);
              } else {
                runApi(selectedApi.id);
              }
            }}
            disabled={selectedApi.isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {selectedApi.isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {selectedApi.isLoading ? 'Running...' : 'Send'}
          </button>
          <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Request Panel */}
        <div className="flex-1 border-r border-gray-700">
          <div className="h-12 border-b border-gray-700 flex items-center px-4">
            <h3 className="font-medium">Request</h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Headers Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowHeaders(!showHeaders)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  {showHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Headers ({Object.keys(selectedApi.headers || {}).length})
                </button>
                {showHeaders && (
                  <button
                    onClick={addHeader}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {showHeaders && (
                <div className="space-y-2">
                  {Object.entries(selectedApi.headers || {}).map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => {
                          const newHeaders = { ...selectedApi.headers };
                          delete newHeaders[key];
                          newHeaders[e.target.value] = value;
                          updateApi(selectedApi.id, { headers: newHeaders });
                        }}
                        placeholder="Header name"
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleHeaderChange(key, e.target.value)}
                        placeholder="Header value"
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                      <button
                        onClick={() => removeHeader(key)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Params Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => { /* noop - keep params visible */ }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300"
                >
                  Params ({Object.keys(selectedApi.params || {}).length})
                </button>
                <button
                  onClick={addParam}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {Object.entries(selectedApi.params || {}).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newParams = { ...selectedApi.params };
                        delete newParams[key];
                        newParams[e.target.value] = value;
                        updateApi(selectedApi.id, { params: newParams });
                      }}
                      placeholder="Param name"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleParamChange(key, e.target.value)}
                      placeholder="Param value"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                    <button
                      onClick={() => removeParam(key)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Authentication Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowAuth(!showAuth)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  {showAuth ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Authentication
                </button>
              </div>
              
              {showAuth && (
                <div className="space-y-3">
                  <select
                    value={selectedApi.authentication?.type || 'none'}
                    onChange={(e) => updateApi(selectedApi.id, {
                      authentication: { ...selectedApi.authentication, type: e.target.value as 'none' | 'bearer' | 'basic' | 'api-key' }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="none">No Authentication</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="api-key">API Key</option>
                  </select>
                  
                  {selectedApi.authentication?.type === 'bearer' && (
                    <input
                      type="text"
                      value={selectedApi.authentication?.token || ''}
                      onChange={(e) => updateApi(selectedApi.id, {
                        authentication: { ...(selectedApi.authentication || { type: 'none' }), token: e.target.value }
                      })}
                      placeholder="Bearer token"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Body Section */}
            {selectedApi.method !== 'GET' && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Request Body</h4>
                <textarea
                  value={selectedApi.body || ''}
                  onChange={(e) => updateApi(selectedApi.id, { body: e.target.value })}
                  placeholder="Enter request body (JSON)"
                  rows={10}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Response Panel */}
        <div className="flex-1">
          <div className="h-12 border-b border-gray-700 flex items-center px-4">
            <h3 className="font-medium">Response</h3>
          </div>
          
          <div className="p-4">
            {selectedApi.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-400">Running API...</p>
                </div>
              </div>
            ) : selectedApi.error ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2">Error</h4>
                <pre className="text-sm text-red-300 whitespace-pre-wrap">{selectedApi.error}</pre>
              </div>
            ) : selectedApi.response ? (
              <div className="bg-gray-750 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-green-400 font-medium">Response</h4>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-300">Status: <span className="font-medium text-white">{(selectedApi.response as any)?.status}</span></div>
                    <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {(selectedApi.response as any)?.headers && (
                  <div className="mb-3 bg-gray-800 p-2 rounded text-sm text-gray-300">
                    <div className="font-medium mb-1 text-gray-200">Headers</div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify((selectedApi.response as any).headers, null, 2)}</pre>
                  </div>
                )}
                <div className="bg-gray-800 p-3 rounded overflow-auto max-h-72">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">{JSON.stringify((selectedApi.response as any).body ?? (selectedApi.response as any), null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No response yet. Click "Send" to run the API.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};