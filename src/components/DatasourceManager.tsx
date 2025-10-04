import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Plus, 
  Database, 
  Settings, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Loader,
  Globe
} from 'lucide-react';
import { nanoid } from 'nanoid';

const datasourceIcons = {
  postgresql: Database,
  mysql: Database,
  mongodb: Database,
  'rest-api': Globe,
  graphql: Globe,
};

const datasourceColors = {
  postgresql: 'text-blue-400 bg-blue-400/10',
  mysql: 'text-orange-400 bg-orange-400/10',
  mongodb: 'text-green-400 bg-green-400/10',
  'rest-api': 'text-purple-400 bg-purple-400/10',
  graphql: 'text-pink-400 bg-pink-400/10',
};

export const DatasourceManager: React.FC = () => {
  const { 
    datasources, 
    selectedDatasource,
    addDatasource, 
    updateDatasource,
    deleteDatasource, 
    selectDatasource,
    testDatasourceConnection
  } = useAppStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDatasource, setNewDatasource] = useState({
    name: '',
    type: 'postgresql' as const,
    config: {
      host: '',
      port: 5432,
      database: '',
      username: '',
      password: '',
      ssl: false
    }
  });
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const handleAddDatasource = () => {
    if (newDatasource.name.trim()) {
      const datasource = {
        id: nanoid(),
        ...newDatasource,
        name: newDatasource.name.trim()
      };
      addDatasource(datasource);
      setNewDatasource({
        name: '',
        type: 'postgresql',
        config: {
          host: '',
          port: 5432,
          database: '',
          username: '',
          password: '',
          ssl: false
        }
      });
      setShowAddForm(false);
      selectDatasource(datasource);
    }
  };

  const handleTestConnection = async (datasourceId: string) => {
    setTestingConnection(datasourceId);
    await testDatasourceConnection(datasourceId);
    setTestingConnection(null);
  };

  return (
    <div className="h-full flex">
      {/* Datasources List */}
      <div className="w-80 border-r border-gray-700 bg-gray-800">
        <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4">
          <h3 className="font-medium">Datasources</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto">
          {datasources.map((datasource) => {
            const Icon = datasourceIcons[datasource.type];
            return (
              <div
                key={datasource.id}
                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedDatasource?.id === datasource.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
                onClick={() => selectDatasource(datasource)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">{datasource.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${datasourceColors[datasource.type]}`}>
                      {datasource.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {datasource.isConnected === true ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : datasource.isConnected === false ? (
                      <XCircle className="w-3 h-3 text-red-400" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-500" />
                    )}
                    <span className="text-xs opacity-75">
                      {datasource.config.host || 'Not configured'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDatasource(datasource.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {datasources.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No datasources yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-blue-400 hover:text-blue-300 text-sm mt-1"
              >
                Add your first datasource
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="flex-1">
        {showAddForm ? (
          <div className="h-full p-6">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-6">Add New Datasource</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={newDatasource.name}
                    onChange={(e) => setNewDatasource({ ...newDatasource, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="My Database"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newDatasource.type}
                    onChange={(e) => setNewDatasource({ ...newDatasource, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">MongoDB</option>
                    <option value="rest-api">REST API</option>
                    <option value="graphql">GraphQL</option>
                  </select>
                </div>

                {(newDatasource.type === 'postgresql' || newDatasource.type === 'mysql') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Host</label>
                        <input
                          type="text"
                          value={newDatasource.config.host}
                          onChange={(e) => setNewDatasource({
                            ...newDatasource,
                            config: { ...newDatasource.config, host: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          placeholder="localhost"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Port</label>
                        <input
                          type="number"
                          value={newDatasource.config.port}
                          onChange={(e) => setNewDatasource({
                            ...newDatasource,
                            config: { ...newDatasource.config, port: Number(e.target.value) }
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Database</label>
                      <input
                        type="text"
                        value={newDatasource.config.database}
                        onChange={(e) => setNewDatasource({
                          ...newDatasource,
                          config: { ...newDatasource.config, database: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="myapp"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <input
                          type="text"
                          value={newDatasource.config.username}
                          onChange={(e) => setNewDatasource({
                            ...newDatasource,
                            config: { ...newDatasource.config, username: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                          type="password"
                          value={newDatasource.config.password}
                          onChange={(e) => setNewDatasource({
                            ...newDatasource,
                            config: { ...newDatasource.config, password: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newDatasource.config.ssl}
                          onChange={(e) => setNewDatasource({
                            ...newDatasource,
                            config: { ...newDatasource.config, ssl: e.target.checked }
                          })}
                        />
                        <span className="text-sm">Use SSL</span>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddDatasource}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                  >
                    Add Datasource
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : selectedDatasource ? (
          <div className="h-full p-6">
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${datasourceColors[selectedDatasource.type]}`}>
                    {React.createElement(datasourceIcons[selectedDatasource.type], { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedDatasource.name}</h2>
                    <p className="text-sm text-gray-400 capitalize">{selectedDatasource.type}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleTestConnection(selectedDatasource.id)}
                  disabled={testingConnection === selectedDatasource.id}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  {testingConnection === selectedDatasource.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : selectedDatasource.isConnected ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Settings className="w-4 h-4" />
                  )}
                  {testingConnection === selectedDatasource.id ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-4">Configuration</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Host:</span>
                    <span>{selectedDatasource.config.host || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Port:</span>
                    <span>{selectedDatasource.config.port || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database:</span>
                    <span>{selectedDatasource.config.database || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Username:</span>
                    <span>{selectedDatasource.config.username || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SSL:</span>
                    <span>{selectedDatasource.config.ssl ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-4">Connection Status</h3>
                <div className="flex items-center gap-3">
                  {selectedDatasource.isConnected === true ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">Connected</span>
                    </>
                  ) : selectedDatasource.isConnected === false ? (
                    <>
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400">Connection failed</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-gray-500" />
                      <span className="text-gray-400">Not tested</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Datasource Selected</h3>
              <p className="text-sm">Select a datasource from the left panel or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};