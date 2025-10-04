import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { MainContent } from './components/MainContent';
import { RightPanel } from './components/RightPanel';
import { PreviewModal } from './components/PreviewModal';

function App() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <TopBar onPreview={() => setShowPreview(true)} />
        
        <div className="flex flex-1 overflow-hidden">
          <LeftPanel />
          <MainContent />
          <RightPanel />
        </div>

        {showPreview && (
          <PreviewModal onClose={() => setShowPreview(false)} />
        )}
      </div>
    </DndProvider>
  );
}

export default App;