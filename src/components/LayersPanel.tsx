import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Layers, Eye, EyeOff } from 'lucide-react';

export const LayersPanel: React.FC = () => {
  const { components, selectedComponent, selectComponent } = useAppStore();

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5" />
        Layers
      </h3>

      <div className="space-y-2">
        {components.map((component) => (
          <div
            key={component.id}
            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
              selectedComponent?.id === component.id
                ? 'bg-blue-600'
                : 'hover:bg-gray-700'
            }`}
            onClick={() => selectComponent(component)}
          >
            <button className="text-gray-400 hover:text-white">
              <Eye className="w-4 h-4" />
            </button>
            <div className="flex-1 text-sm">
              <div className="font-medium capitalize">{component.type}</div>
              <div className="text-gray-400 text-xs">
                {Math.round(component.x)}, {Math.round(component.y)}
              </div>
            </div>
          </div>
        ))}
        
        {components.length === 0 && (
          <div className="text-gray-400 text-sm text-center py-4">
            No components yet. Drag from the library to get started.
          </div>
        )}
      </div>
    </div>
  );
};