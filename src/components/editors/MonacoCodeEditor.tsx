import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  Code, 
  Copy, 
  Download, 
  Eye, 
  RefreshCw,
  FileText,
  Palette,
  Zap,
  Save,
  Play
} from 'lucide-react';

export const MonacoCodeEditor: React.FC = () => {
  const { generatedCode, generateCode, components, pages, currentPageId, updateComponent } = useAppStore();
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'javascript'>('html');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableCode, setEditableCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const currentPage = pages.find(p => p.id === currentPageId);

  React.useEffect(() => {
    setEditableCode(generatedCode[activeCodeTab] || '');
  }, [generatedCode, activeCodeTab]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    // Simulate code generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    generateCode();
    setIsGenerating(false);
  };

  const handleCopyCode = () => {
    const code = isEditing ? editableCode : generatedCode[activeCodeTab];
    navigator.clipboard.writeText(code);
  };

  const handleDownloadCode = () => {
    const code = isEditing ? editableCode : generatedCode[activeCodeTab];
    const extension = activeCodeTab === 'javascript' ? 'js' : activeCodeTab;
    const filename = `${currentPage?.name || 'page'}.${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const files = [
      { name: 'index.html', content: generatedCode.html },
      { name: 'styles.css', content: generatedCode.css },
      { name: 'script.js', content: generatedCode.javascript }
    ];

    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleSaveChanges = () => {
    // Apply changes back to components (simplified implementation)
    console.log('Saving changes:', editableCode);
    setIsEditing(false);
  };

  const handlePreviewChanges = () => {
    // Create a preview window with the edited code
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Code Preview</title>
          <style>${activeCodeTab === 'css' ? editableCode : generatedCode.css}</style>
        </head>
        <body>
          ${activeCodeTab === 'html' ? editableCode : generatedCode.html}
          <script>${activeCodeTab === 'javascript' ? editableCode : generatedCode.javascript}</script>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  const codeStats = {
    components: components.length,
    htmlLines: generatedCode.html.split('\n').length,
    cssLines: generatedCode.css.split('\n').length,
    jsLines: generatedCode.javascript.split('\n').length
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-medium">Code Editor</h2>
              <p className="text-sm text-gray-400">
                {currentPage?.name} - {codeStats.components} components
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{codeStats.htmlLines} HTML</span>
            </div>
            <div className="flex items-center gap-1">
              <Palette className="w-4 h-4" />
              <span>{codeStats.cssLines} CSS</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>{codeStats.jsLines} JS</span>
            </div>
          </div>
          
          <div className="w-px h-6 bg-gray-600"></div>
          
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Code'}
          </button>
          
          <button
            onClick={handleDownloadAll}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download All
          </button>
        </div>
      </div>

      {/* Code Tabs */}
      <div className="h-12 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-1">
          {[
            { id: 'html', label: 'HTML', icon: FileText },
            { id: 'css', label: 'CSS', icon: Palette },
            { id: 'javascript', label: 'JavaScript', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCodeTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCodeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing && (
            <>
              <button
                onClick={handlePreviewChanges}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Preview changes"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveChanges}
                className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded transition-colors"
                title="Save changes"
              >
                <Save className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={handleCopyCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-hidden">
        {!generatedCode.html && !generatedCode.css && !generatedCode.javascript ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Code Generated</h3>
              <p className="text-sm mb-4">Click "Generate Code" to create HTML, CSS, and JavaScript for your application</p>
              <button
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-md text-sm font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Code'}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full p-6">
            <div className="h-full bg-gray-800 rounded-lg overflow-hidden flex flex-col">
              {/* Editor Controls */}
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      isEditing 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {isEditing ? 'View Mode' : 'Edit Mode'}
                  </button>
                </div>
                
                <div className="text-xs text-gray-400">
                  {isEditing ? 'Editable' : 'Read-only'}
                </div>
              </div>
              
              {/* Code Editor */}
              <div className="flex-1 overflow-auto">
                {isEditing ? (
                  <textarea
                    value={editableCode}
                    onChange={(e) => setEditableCode(e.target.value)}
                    className="w-full h-full p-4 bg-transparent text-gray-300 font-mono text-sm resize-none outline-none"
                    style={{ minHeight: '100%' }}
                  />
                ) : (
                  <pre className="h-full overflow-auto p-4 text-sm font-mono text-gray-300 leading-relaxed">
                    <code className={`language-${activeCodeTab === 'javascript' ? 'js' : activeCodeTab}`}>
                      {generatedCode[activeCodeTab] || `// No ${activeCodeTab.toUpperCase()} code generated yet`}
                    </code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Code Preview */}
      {generatedCode.html && (
        <div className="h-12 border-t border-gray-700 flex items-center justify-between px-6 bg-gray-750">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Generated for: {currentPage?.name}</span>
            <span>•</span>
            <span>{components.length} components</span>
            <span>•</span>
            <span>
              {generatedCode.html.length + generatedCode.css.length + generatedCode.javascript.length} characters
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-400">Code ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};