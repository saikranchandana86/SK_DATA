import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { PropertiesPanel } from './PropertiesPanel';
import { DataPanel } from './DataPanel';
import { LogsPanel } from './LogsPanel';
import { SettingsPanel } from './SettingsPanel';
import { 
  Settings, 
  Database, 
  FileText,
  Cog,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { rightPanelTab, setRightPanelTab, selectedComponent, activeTab } = useAppStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const tabs = [
    { id: 'properties', label: 'Properties', icon: Settings, show: activeTab === 'canvas' && selectedComponent },
    { id: 'data', label: 'Data', icon: Database, show: true },
    { id: 'logs', label: 'Logs', icon: FileText, show: true },
    { id: 'settings', label: 'Settings', icon: Cog, show: true },
  ] as const;

  const visibleTabs = tabs.filter(tab => tab.show);

  if (visibleTabs.length === 0) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div className="w-12 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-1 p-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setRightPanelTab(tab.id);
                  setIsCollapsed(false);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  rightPanelTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  rightPanelTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {rightPanelTab === 'properties' && <PropertiesPanel />}
        {rightPanelTab === 'data' && <DataPanel />}
        {rightPanelTab === 'logs' && <LogsPanel />}
        {rightPanelTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
};