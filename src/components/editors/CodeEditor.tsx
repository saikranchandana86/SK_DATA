import React from 'react';
import Editor from '@monaco-editor/react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'html' | 'css' | 'javascript' | 'json';
  height?: number | string;
  label?: string;
  placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  height = 200,
  label,
  placeholder
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: 'on' as const,
    roundedSelection: true,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on' as const,
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    contextmenu: true,
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    renderLineHighlight: 'line' as const
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 p-4' : ''}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-white">{label}</label>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}
      <div className="border border-gray-600 rounded-md overflow-hidden bg-gray-800">
        <Editor
          height={isFullscreen ? 'calc(100vh - 120px)' : height}
          defaultLanguage={language}
          language={language}
          value={value}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-full bg-gray-800">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        />
      </div>
      {placeholder && !value && (
        <div className="absolute top-10 left-4 text-gray-500 text-sm pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};
