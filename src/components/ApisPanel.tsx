import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Globe, Play, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

const methodColors = {
  GET: 'text-green-400 bg-green-400/10',
  POST: 'text-blue-400 bg-blue-400/10',
  PUT: 'text-yellow-400 bg-yellow-400/10',
  DELETE: 'text-red-400 bg-red-400/10',
  PATCH: 'text-purple-400 bg-purple-400/10',
};

export const ApisPanel: React.FC = () => {
  const { 
    apis, 
    selectedApi,
    addApi, 
    deleteApi, 
    selectApi,
    runApi,
    setActiveTab
  } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApiName, setNewApiName] = useState('');
  const [newApiMethod, setNewApiMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [newApiUrl, setNewApiUrl] = useState('');

  const handleAddApi = () => {
    if (newApiName.trim() && newApiUrl.trim()) {
      const newApi = {
        id: nanoid(),
        name: newApiName.trim(),
        method: newApiMethod,
        url: newApiUrl.trim(),
        headers: {
          'Content-Type': 'application/json'
        },
        authentication: {
          type: 'none' as const
        }
      };
      addApi(newApi);
      setNewApiName('');
      setNewApiUrl('');
      setNewApiMethod('GET');
      setShowAddForm(false);
      selectApi(newApi);
      setActiveTab('api');
    }
  };

  const handleRunApi = (apiId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    runApi(apiId);
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">APIs</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add API Form */}
      {showAddForm && (
        <div className="mb-4 p-3 bg-gray-750 rounded-lg">
          <input
            type="text"
            value={newApiName}
            onChange={(e) => setNewApiName(e.target.value)}
            placeholder="API name"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm mb-2"
            autoFocus
          />
          <div className="flex gap-2 mb-2">
            <select
              value={newApiMethod}
              onChange={(e) => setNewApiMethod(e.target.value as any)}
              className="p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input
              type="text"
              value={newApiUrl}
              onChange={(e) => setNewApiUrl(e.target.value)}
              placeholder="https://api.example.com/users"
              className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddApi}
              disabled={!newApiName.trim() || !newApiUrl.trim()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewApiName('');
                setNewApiUrl('');
                setNewApiMethod('GET');
              }}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* APIs List */}
      <div className="space-y-2">
        {apis.map((api) => (
          <div
            key={api.id}
            className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
              selectedApi?.id === api.id
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-gray-300'
            }`}
            onClick={() => {
              selectApi(api);
              setActiveTab('api');
            }}
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium truncate">{api.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${methodColors[api.method]}`}>
                  {api.method}
                </span>
              </div>
              <div className="text-xs opacity-75 truncate">{api.url}</div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleRunApi(api.id, e)}
                disabled={api.isLoading}
                className="p-1 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
                title="Run API"
              >
                <Play className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteApi(api.id);
                }}
                className="p-1 hover:bg-red-600 rounded transition-colors text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {api.isLoading && (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        ))}
      </div>

      {apis.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No APIs yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-blue-400 hover:text-blue-300 text-sm mt-1"
          >
            Create your first API
          </button>
        </div>
      )}
    </div>
  );
};