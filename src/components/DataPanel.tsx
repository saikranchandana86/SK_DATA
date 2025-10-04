import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Database, Globe, RefreshCw, Eye } from 'lucide-react';

export const DataPanel: React.FC = () => {
  const { apis, sqlQueries, globalState } = useAppStore();

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Data Inspector</h3>

      {/* Global State */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Global State</h4>
        <div className="bg-gray-750 rounded-lg p-3">
          {Object.keys(globalState).length > 0 ? (
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(globalState, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-400">No global state data</p>
          )}
        </div>
      </div>

      {/* API Responses */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">API Responses</h4>
        <div className="space-y-2">
          {apis.filter(api => api.response).map((api) => (
            <div key={api.id} className="bg-gray-750 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">{api.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  api.method === 'GET' ? 'bg-green-600' :
                  api.method === 'POST' ? 'bg-blue-600' :
                  api.method === 'PUT' ? 'bg-yellow-600' :
                  api.method === 'DELETE' ? 'bg-red-600' : 'bg-gray-600'
                }`}>
                  {api.method}
                </span>
              </div>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-auto">
                {JSON.stringify(api.response, null, 2)}
              </pre>
            </div>
          ))}
          {apis.filter(api => api.response).length === 0 && (
            <p className="text-sm text-gray-400">No API responses yet</p>
          )}
        </div>
      </div>

      {/* Query Results */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Query Results</h4>
        <div className="space-y-2">
          {sqlQueries.filter(query => query.result).map((query) => (
            <div key={query.id} className="bg-gray-750 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">{query.name}</span>
                <span className="px-2 py-0.5 bg-gray-600 rounded text-xs">
                  {query.result?.length || 0} rows
                </span>
              </div>
              <div className="max-h-32 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-600">
                      {query.result && query.result.length > 0 && Object.keys(query.result[0]).map((column) => (
                        <th key={column} className="text-left p-1 text-gray-400">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {query.result?.slice(0, 3).map((row, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="p-1 text-gray-300">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {query.result && query.result.length > 3 && (
                  <p className="text-xs text-gray-400 mt-1">
                    ... and {query.result.length - 3} more rows
                  </p>
                )}
              </div>
            </div>
          ))}
          {sqlQueries.filter(query => query.result).length === 0 && (
            <p className="text-sm text-gray-400">No query results yet</p>
          )}
        </div>
      </div>
    </div>
  );
};