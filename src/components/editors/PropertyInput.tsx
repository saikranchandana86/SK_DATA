import React, { useState } from 'react';
import { Code2, Type } from 'lucide-react';
import { CodeEditor } from './CodeEditor';

interface PropertyInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  type?: 'text' | 'number' | 'textarea';
  placeholder?: string;
  tooltip?: string;
  supportsJS?: boolean;
}

export const PropertyInput: React.FC<PropertyInputProps> = ({
  value,
  onChange,
  label,
  type = 'text',
  placeholder,
  tooltip,
  supportsJS = true
}) => {
  const [isJSMode, setIsJSMode] = useState(
    typeof value === 'string' && value.trim().startsWith('{{') && value.trim().endsWith('}}')
  );

  const toggleMode = () => {
    if (!supportsJS) return;

    if (isJSMode) {
      const unwrapped = value.replace(/^\{\{/, '').replace(/\}\}$/, '').trim();
      onChange(unwrapped);
    } else {
      onChange(`{{ ${value} }}`);
    }
    setIsJSMode(!isJSMode);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-white">
          {label}
          {tooltip && (
            <span className="ml-1 text-xs text-gray-400" title={tooltip}>ⓘ</span>
          )}
        </label>
        {supportsJS && (
          <button
            onClick={toggleMode}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              isJSMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={isJSMode ? 'Switch to text mode' : 'Switch to JavaScript mode'}
          >
            {isJSMode ? <Code2 className="w-3 h-3" /> : <Type className="w-3 h-3" />}
            {isJSMode ? 'JS' : 'Abc'}
          </button>
        )}
      </div>

      {isJSMode && supportsJS ? (
        <CodeEditor
          value={value}
          onChange={onChange}
          language="javascript"
          height={type === 'textarea' ? 120 : 60}
          placeholder={placeholder || '// Write JavaScript expression'}
        />
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
          placeholder={placeholder}
        />
      )}

      {isJSMode && (
        <div className="mt-1 text-xs text-gray-400">
          <span className="font-mono">{'{{ }}'}</span> JavaScript expression mode. Access data with{' '}
          <span className="font-mono">apiName.data</span> or{' '}
          <span className="font-mono">queryName.data</span>
        </div>
      )}
    </div>
  );
};
