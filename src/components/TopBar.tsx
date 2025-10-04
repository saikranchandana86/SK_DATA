import React from 'react';
import { Play, Save, Download, Upload, Grid2x2 as Grid, Settings, Share2, Eye, Code, Database, FileCode, Globe } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface TopBarProps {
  onPreview: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onPreview }) => {
  const { activeTab, setActiveTab, pages, currentPageId } = useAppStore();
  const currentPage = pages.find(p => p.id === currentPageId);

  const tabs = [
    { id: 'canvas', label: 'Canvas', icon: Grid },
    { id: 'api', label: 'APIs', icon: Globe },
    { id: 'sql', label: 'Queries', icon: Database },
    { id: 'datasources', label: 'Datasources', icon: Database },
    { id: 'code', label: 'Code', icon: FileCode },
  ] as const;

  return (
    <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Grid className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-semibold">AppBuilder ⚙️</span>
        </div>
        
        {/* Main Navigation Tabs */}
        <div className="flex items-center bg-gray-750 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Page Info */}
        {activeTab === 'canvas' && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Page:</span>
            <span className="text-white font-medium">{currentPage?.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center gap-1.5">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center gap-1.5">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="w-px h-6 bg-gray-600"></div>

        {/* Preview and Deploy */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2 text-sm font-medium">
            <Share2 className="w-4 h-4" />
            Deploy
          </button>
        </div>

        {/* Settings */}
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};