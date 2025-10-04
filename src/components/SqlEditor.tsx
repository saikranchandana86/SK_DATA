import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Play, 
  Save, 
  Copy, 
  Database, 
  Table,
  Download,
  RefreshCw
} from 'lucide-react';

export const SqlEditor: React.FC = () => {
  const { selectedQuery, updateSqlQuery, runSqlQuery, datasources } = useAppStore();
  const [activeTab, setActiveTab] = useState<'query' | 'result'>('query');

  if (!selectedQuery) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Query Selected</h3>
          <p className="text-sm">Select a query from the left panel or create a new one</p>
        </div>
      </div>
    );
  }

  const datasource = datasources.find(ds => ds.id === selectedQuery.datasource);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-medium">{selectedQuery.name}</h2>
              <p className="text-sm text-gray-400">
                {datasource?.name} ({datasource?.type})
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => runSqlQuery(selectedQuery.id)}
            disabled={selectedQuery.isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {selectedQuery.isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {selectedQuery.isLoading ? 'Running...' : 'Run Query'}
          </button>
          <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="h-12 border-b border-gray-700 flex items-center px-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('query')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'query'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Query
          </button>
          <button
            onClick={() => setActiveTab('result')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'result'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Results
            {selectedQuery.result && (
              <span className="ml-2 px-2 py-0.5 bg-gray-600 rounded-full text-xs">
                {selectedQuery.result.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'query' ? (
          <div className="h-full p-6">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">SQL Query</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Connected to:</span>
                  <span className="text-white">{datasource?.name}</span>
                </div>
              </div>
              
              <textarea
                value={selectedQuery.query}
                onChange={(e) => updateSqlQuery(selectedQuery.id, { query: e.target.value })}
                placeholder="Enter your SQL query here..."
                className="flex-1 w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                style={{ minHeight: '300px' }}
              />
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Press Ctrl+Enter to run query
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">
                    Format
                  </button>
                  <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full p-6">
            {selectedQuery.isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-400">Executing query...</p>
                </div>
              </div>
            ) : selectedQuery.error ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2">Query Error</h4>
                <pre className="text-sm text-red-300 whitespace-pre-wrap">{selectedQuery.error}</pre>
              </div>
            ) : selectedQuery.result ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium">Query Results</h3>
                    <span className="px-2 py-1 bg-green-600 rounded text-sm">
                      {selectedQuery.result.length} rows
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
                  <div className="overflow-auto h-full">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-750 sticky top-0">
                        <tr>
                          {selectedQuery.result.length > 0 && Object.keys(selectedQuery.result[0]).map((column) => (
                            <th key={column} className="text-left p-3 font-medium text-gray-300 border-b border-gray-600">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuery.result.map((row, index) => (
                          <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="p-3 text-gray-300">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results yet. Run your query to see data.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};