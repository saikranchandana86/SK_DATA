import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Database, Play, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

export const QueriesPanel: React.FC = () => {
  const { 
    sqlQueries, 
    selectedQuery,
    datasources,
    addSqlQuery, 
    deleteSqlQuery, 
    selectSqlQuery,
    updateSqlQuery,
    runSqlQuery,
    setActiveTab
  } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQueryName, setNewQueryName] = useState('');
  const [selectedDatasource, setSelectedDatasource] = useState('');

  const handleAddQuery = () => {
    if (newQueryName.trim() && selectedDatasource) {
      const newQuery = {
        id: nanoid(),
        name: newQueryName.trim(),
        query: 'SELECT * FROM users LIMIT 10;',
        datasource: selectedDatasource,
        parameters: {}
      };
      addSqlQuery(newQuery);
      setNewQueryName('');
      setSelectedDatasource('');
      setShowAddForm(false);
      selectSqlQuery(newQuery);
      setActiveTab('sql');
    }
  };

  const handleRunQuery = (queryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    runSqlQuery(queryId);
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">SQL Queries</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Query Form */}
      {showAddForm && (
        <div className="mb-4 p-3 bg-gray-750 rounded-lg">
          <input
            type="text"
            value={newQueryName}
            onChange={(e) => setNewQueryName(e.target.value)}
            placeholder="Query name"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm mb-2"
            autoFocus
          />
          <select
            value={selectedDatasource}
            onChange={(e) => setSelectedDatasource(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm mb-2"
          >
            <option value="">Select datasource</option>
            {datasources.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name} ({ds.type})
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAddQuery}
              disabled={!newQueryName.trim() || !selectedDatasource}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewQueryName('');
                setSelectedDatasource('');
              }}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Queries List */}
      <div className="space-y-2">
        {sqlQueries.map((query) => {
          const datasource = datasources.find(ds => ds.id === query.datasource);
          return (
            <div
              key={query.id}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                selectedQuery?.id === query.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
              onClick={() => {
                selectSqlQuery(query);
                setActiveTab('sql');
              }}
            >
              <Database className="w-4 h-4 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{query.name}</div>
                <div className="text-xs opacity-75 truncate">
                  {datasource?.name || 'Unknown datasource'}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleRunQuery(query.id, e)}
                  disabled={query.isLoading}
                  className="p-1 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
                  title="Run query"
                >
                  <Play className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSqlQuery(query.id);
                  }}
                  className="p-1 hover:bg-red-600 rounded transition-colors text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {query.isLoading && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          );
        })}
      </div>

      {sqlQueries.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No queries yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-blue-400 hover:text-blue-300 text-sm mt-1"
          >
            Create your first query
          </button>
        </div>
      )}
    </div>
  );
};