import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Canvas } from './Canvas';
import { ApiBuilder } from './ApiBuilder';
import { SqlEditor } from './SqlEditor';
import { DatasourceManager } from './DatasourceManager';
import { MonacoCodeEditor } from './editors/MonacoCodeEditor';

export const MainContent: React.FC = () => {
  const { activeTab } = useAppStore();

  return (
    <div className="flex-1 bg-gray-850 overflow-hidden">
      {activeTab === 'canvas' && <Canvas />}
      {activeTab === 'api' && <ApiBuilder />}
      {activeTab === 'sql' && <SqlEditor />}
      {activeTab === 'datasources' && <DatasourceManager />}
      {activeTab === 'code' && <MonacoCodeEditor />}
    </div>
  );
};