import React from 'react';
import { FileText, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  source?: string;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(),
    level: 'info',
    message: 'Application started successfully',
    source: 'System'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 60000),
    level: 'success',
    message: 'API call to /users completed in 245ms',
    source: 'API'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 120000),
    level: 'warning',
    message: 'Component "Button1" has no click handler defined',
    source: 'Canvas'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 180000),
    level: 'error',
    message: 'Failed to connect to database: Connection timeout',
    source: 'Database'
  }
];

const levelIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

const levelColors = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
};

export const LogsPanel: React.FC = () => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Logs
        </h3>
        <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {mockLogs.map((log) => {
          const Icon = levelIcons[log.level];
          return (
            <div key={log.id} className="bg-gray-750 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${levelColors[log.level]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{log.message}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{log.timestamp.toLocaleTimeString()}</span>
                    {log.source && (
                      <>
                        <span>•</span>
                        <span>{log.source}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mockLogs.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No logs yet</p>
        </div>
      )}
    </div>
  );
};