import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Settings, Palette, Monitor, Smartphone, Tablet, Globe, Zap, Eye, Grid2x2 as Grid, Move, RotateCcw } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, canvasScale, setCanvasScale, gridSize, snapToGrid, updateSettings: updateAppSettings } = useAppStore();

  const themes = [
    {
      id: 'light',
      name: 'Light',
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#1F2937',
        textSecondary: '#6B7280'
      }
    },
    {
      id: 'dark',
      name: 'Dark',
      colors: {
        primary: '#60A5FA',
        secondary: '#9CA3AF',
        accent: '#34D399',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB',
        textSecondary: '#D1D5DB'
      }
    },
    {
      id: 'blue',
      name: 'Blue',
      colors: {
        primary: '#2563EB',
        secondary: '#64748B',
        accent: '#0EA5E9',
        background: '#F8FAFC',
        surface: '#F1F5F9',
        text: '#0F172A',
        textSecondary: '#475569'
      }
    }
  ];

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5" />
        Settings
      </h3>

      <div className="space-y-6">
        {/* Canvas Settings */}
        <div className="bg-gray-750 p-4 rounded-lg">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Canvas
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Zoom Level</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.25"
                  max="2"
                  step="0.25"
                  value={canvasScale}
                  onChange={(e) => setCanvasScale(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm w-12 text-right">{Math.round(canvasScale * 100)}%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Grid Size</label>
              <select
                value={gridSize}
                onChange={(e) => updateAppSettings({ gridSize: Number(e.target.value) })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value={10}>10px</option>
                <option value={20}>20px</option>
                <option value={25}>25px</option>
                <option value={50}>50px</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => updateAppSettings({ snapToGrid: e.target.checked })}
                />
                <span className="text-sm">Snap to Grid</span>
              </label>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-gray-750 p-4 rounded-lg">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </h4>
          
          <div className="space-y-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  settings.theme.id === theme.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => updateSettings({ ...settings, theme: { ...settings.theme, ...theme } })}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{theme.name}</span>
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-400"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-400"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-400"
                      style={{ backgroundColor: theme.colors.background }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Settings */}
        <div className="bg-gray-750 p-4 rounded-lg">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Responsive Design
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.responsive}
                  onChange={(e) => updateSettings({ ...settings, responsive: e.target.checked })}
                />
                <span className="text-sm">Enable Responsive Design</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center gap-1 p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                <Monitor className="w-5 h-5" />
                <span className="text-xs">Desktop</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                <Tablet className="w-5 h-5" />
                <span className="text-xs">Tablet</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">Mobile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="bg-gray-750 p-4 rounded-lg">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.animations}
                  onChange={(e) => updateSettings({ ...settings, animations: e.target.checked })}
                />
                <span className="text-sm">Enable Animations</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) => updateSettings({ ...settings, debugMode: e.target.checked })}
                />
                <span className="text-sm">Debug Mode</span>
              </label>
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="bg-gray-750 p-4 rounded-lg">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Accessibility
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.rtl}
                  onChange={(e) => updateSettings({ ...settings, rtl: e.target.checked })}
                />
                <span className="text-sm">Right-to-Left (RTL)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <select
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reset Settings */}
        <div className="bg-gray-750 p-4 rounded-lg">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </h4>
          
          <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors">
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
};