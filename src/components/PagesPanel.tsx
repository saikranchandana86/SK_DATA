import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, FileText, MoreVertical, Edit2, Trash2, Copy } from 'lucide-react';
import { nanoid } from 'nanoid';

export const PagesPanel: React.FC = () => {
  const { 
    pages, 
    currentPageId, 
    addPage, 
    deletePage, 
    setCurrentPage,
    updatePage 
  } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddPage = () => {
    if (newPageName.trim()) {
      const newPage = {
        id: nanoid(),
        name: newPageName.trim(),
        components: [],
        apis: [],
        queries: []
      };
      addPage(newPage);
      setNewPageName('');
      setShowAddForm(false);
    }
  };

  const handleEditPage = (pageId: string, newName: string) => {
    if (newName.trim()) {
      updatePage(pageId, { name: newName.trim() });
    }
    setEditingPageId(null);
    setEditingName('');
  };

  const startEditing = (pageId: string, currentName: string) => {
    setEditingPageId(pageId);
    setEditingName(currentName);
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Pages</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Page Form */}
      {showAddForm && (
        <div className="mb-4 p-3 bg-gray-750 rounded-lg">
          <input
            type="text"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="Page name"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm mb-2"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleAddPage()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddPage}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewPageName('');
              }}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="space-y-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
              currentPageId === page.id
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-gray-300'
            }`}
            onClick={() => setCurrentPage(page.id)}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            
            {editingPageId === page.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-1 bg-transparent border-b border-gray-400 text-sm outline-none"
                autoFocus
                onBlur={() => handleEditPage(page.id, editingName)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleEditPage(page.id, editingName);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 text-sm font-medium truncate">
                {page.name}
              </span>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(page.id, page.name);
                }}
                className="p-1 hover:bg-gray-600 rounded transition-colors"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(page.id);
                  }}
                  className="p-1 hover:bg-red-600 rounded transition-colors text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No pages yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-blue-400 hover:text-blue-300 text-sm mt-1"
          >
            Create your first page
          </button>
        </div>
      )}
    </div>
  );
};