import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ComponentLibrary } from './ComponentLibrary';
import { PagesPanel } from './PagesPanel';
import { QueriesPanel } from './QueriesPanel';
import { ApisPanel } from './ApisPanel';
import { LayersPanel } from './LayersPanel';
import { 
  Layers, 
  FileText, 
  Database, 
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const LeftPanel: React.FC = () => {
  const { leftPanelTab, setLeftPanelTab, activeTab } = useAppStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const tabs = [
    { id: 'components', label: 'Components', icon: Layers, show: activeTab === 'canvas' },
    { id: 'pages', label: 'Pages', icon: FileText, show: true },
    { id: 'queries', label: 'Queries', icon: Database, show: true },
    { id: 'apis', label: 'APIs', icon: Globe, show: true },
    { id: 'layers', label: 'Layers', icon: Layers, show: activeTab === 'canvas' },
  ] as const;

  const visibleTabs = tabs.filter(tab => tab.show);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-1 p-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setLeftPanelTab(tab.id);
                  setIsCollapsed(false);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  leftPanelTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setLeftPanelTab(tab.id)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  leftPanelTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
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
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {leftPanelTab === 'components' && <ComponentLibrary />}
        {leftPanelTab === 'pages' && <PagesPanel />}
        {leftPanelTab === 'layers' && <LayersPanel />}
        {leftPanelTab === 'queries' && <QueriesPanel />}
        {leftPanelTab === 'apis' && <ApisPanel />}
      </div>
    </div>
  );
};