import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Settings, Palette, Code, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { ActionConfig } from '../../types';
import { CodeEditor } from '../editors/CodeEditor';
import { ChartSeriesEditor } from '../editors/ChartSeriesEditor';

export const PropertiesPanel: React.FC = () => {
  const { selectedComponent, updateComponent, apis, sqlQueries, deleteComponent, selectComponent } = useAppStore();
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'actions'>('content');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'general']));

  if (!selectedComponent) {
    return (
      <div className="p-4 h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: unknown) => {
    updateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [property]: value
      }
    });
  };

  const handleStyleChange = (property: string, value: unknown) => {
    updateComponent(selectedComponent.id, {
      style: {
        ...selectedComponent.style,
  [property]: value as unknown
      }
    });
  };

  const handleActionChange = (eventName: string, action: ActionConfig) => {
    updateComponent(selectedComponent.id, {
      events: {
        ...selectedComponent.events,
        [eventName]: action
      }
    });
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderColorPicker = (label: string, value: string, onChange: (value: string) => void) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 border-2 border-gray-600 rounded cursor-pointer bg-gray-700"
          />
        </div>
        <input
          type="text"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const renderSection = (title: string, sectionId: string, children: React.ReactNode) => {
    const isExpanded = expandedSections.has(sectionId);
    
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionId)}
          className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <span>{title}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {isExpanded && (
          <div className="mt-2 pl-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderActionEditor = (eventName: string, label: string) => {
    const currentAction = selectedComponent.events?.[eventName] || { type: 'none' };
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          {label}
          <span className="ml-1 px-1 py-0.5 bg-blue-600 text-xs rounded">JS</span>
        </label>
        
        <div className="space-y-2">
          <select
            value={currentAction.type}
            onChange={(e) => handleActionChange(eventName, { ...currentAction, type: e.target.value as 'none'|'query'|'js'|'navigate'|'alert'|'modal'|'store'|'copy'|'download'|'remove' })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="none">No action</option>
            <option value="remove">Delete component</option>
            <option value="query">Execute a query</option>
            <option value="js">Execute a JS function</option>
            <option value="navigate">Navigate to</option>
            <option value="alert">Show alert</option>
            <option value="modal">Show modal</option>
            <option value="store">Store value</option>
            <option value="copy">Copy to clipboard</option>
            <option value="download">Download</option>
          </select>
          
          {currentAction.type === 'query' && (
            <select
              value={currentAction.target || ''}
              onChange={(e) => handleActionChange(eventName, { ...currentAction, target: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Select API / Query</option>
              {apis.map(api => (
                <option key={`api-${api.id}`} value={api.id}>API: {api.name}</option>
              ))}
              {sqlQueries.map(q => (
                <option key={`sql-${q.id}`} value={q.id}>SQL: {q.name}</option>
              ))}
            </select>
          )}
          
          {currentAction.type === 'js' && (
            <textarea
              value={currentAction.target || ''}
              onChange={(e) => handleActionChange(eventName, { ...currentAction, target: e.target.value })}
              placeholder="// Write your JavaScript code here"
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm font-mono focus:outline-none focus:border-blue-500 resize-none"
            />
          )}
          
          {currentAction.type === 'navigate' && (
            <input
              type="text"
              value={currentAction.target || ''}
              onChange={(e) => handleActionChange(eventName, { ...currentAction, target: e.target.value })}
              placeholder="Enter URL or page name"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          )}
          
          {currentAction.type === 'alert' && (
            <input
              type="text"
              value={currentAction.params?.message || ''}
              onChange={(e) => handleActionChange(eventName, { 
                ...currentAction, 
                params: { ...currentAction.params, message: e.target.value }
              })}
              placeholder="Alert message"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          )}
          
          {currentAction.type === 'store' && (
            <div className="space-y-2">
              <input
                type="text"
                value={currentAction.target || ''}
                onChange={(e) => handleActionChange(eventName, { ...currentAction, target: e.target.value })}
                placeholder="Variable name"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={currentAction.params?.value || ''}
                onChange={(e) => handleActionChange(eventName, { 
                  ...currentAction, 
                  params: { ...currentAction.params, value: e.target.value }
                })}
                placeholder="Value to store"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
        
        {/* Callbacks */}
        {currentAction.type !== 'none' && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="text-xs text-gray-400 mb-2">Callbacks</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">On success</span>
                <button className="text-blue-400 hover:text-blue-300">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">On failure</span>
                <button className="text-blue-400 hover:text-blue-300">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPropertyEditor = (key: string, label: string, type: string, value: unknown, options?: string[]) => {
    switch (type) {
      case 'text':
      case 'url':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">{label}</label>
            <input
              type="text"
              value={String(value ?? '')}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">{label}</label>
            <textarea
              value={String(value ?? '')}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        );
      
      case 'number':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">{label}</label>
            <input
              type="number"
              value={value !== undefined && value !== null ? String(value) : '0'}
              onChange={(e) => handlePropertyChange(key, Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        );
      
      case 'boolean':
        return (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handlePropertyChange(key, e.target.checked)}
                className="rounded border-gray-500 text-blue-600 focus:ring-blue-500 bg-gray-700"
              />
              <span className="text-sm font-medium text-white">{label}</span>
            </label>
          </div>
        );
      
      case 'select':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">{label}</label>
            <select
              value={String(value ?? '')}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      case 'color':
        return renderColorPicker(label, String(value ?? '#000000'), (newValue) => handlePropertyChange(key, newValue));
      
      default:
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">{label}</label>
            <input
              type="text"
              value={String(value ?? '')}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        );
    }
  };

  const renderComponentProperties = () => {
    const { type, props } = selectedComponent;

    switch (type) {
      case 'button':
        return (
          <div className="space-y-4">
            {renderSection('Basic', 'basic', (
              <div>
                {renderPropertyEditor('label', 'Label', 'text', props.label)}
                {renderPropertyEditor('tooltip', 'Tooltip', 'text', props.tooltip)}
              </div>
            ))}
            
            {renderSection('General', 'general', (
              <div>
                {renderPropertyEditor('visible', 'Visible', 'boolean', props.visible)}
                {renderPropertyEditor('disabled', 'Disabled', 'boolean', props.disabled)}
                {renderPropertyEditor('animateLoading', 'Animate Loading', 'boolean', props.animateLoading)}
              </div>
            ))}
            
            {renderSection('Validation', 'validation', (
              <div>
                {renderPropertyEditor('disabledWhenInvalid', 'Disabled When Invalid', 'boolean', props.disabledWhenInvalid)}
                {renderPropertyEditor('resetFormOnClick', 'Reset Form On Click', 'boolean', props.resetFormOnClick)}
              </div>
            ))}
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            {renderSection('Basic', 'basic', (
              <div>
                {renderPropertyEditor('label', 'Label', 'text', props.label)}
                {renderPropertyEditor('placeholder', 'Placeholder', 'text', props.placeholder)}
                {renderPropertyEditor('defaultText', 'Default Text', 'text', props.defaultText)}
                {renderPropertyEditor('inputType', 'Data Type', 'select', props.inputType, ['TEXT', 'NUMBER', 'PASSWORD', 'EMAIL', 'SEARCH', 'PHONE', 'CURRENCY'])}
              </div>
            ))}
            
            {renderSection('General', 'general', (
              <div>
                {renderPropertyEditor('visible', 'Visible', 'boolean', props.visible)}
                {renderPropertyEditor('disabled', 'Disabled', 'boolean', props.disabled)}
                {renderPropertyEditor('readOnly', 'Read Only', 'boolean', props.readOnly)}
                {renderPropertyEditor('required', 'Required', 'boolean', props.required)}
                {renderPropertyEditor('spellCheck', 'Spell Check', 'boolean', props.spellCheck)}
                {renderPropertyEditor('autoFocus', 'Auto Focus', 'boolean', props.autoFocus)}
              </div>
            ))}
            
            {renderSection('Validation', 'validation', (
              <div>
                {renderPropertyEditor('maxChars', 'Max Characters', 'number', props.maxChars)}
                {renderPropertyEditor('regex', 'Regex', 'text', props.regex)}
                {renderPropertyEditor('errorMessage', 'Error Message', 'text', props.errorMessage)}
                {renderPropertyEditor('validationMessage', 'Valid Message', 'text', props.validationMessage)}
              </div>
            ))}
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            {renderSection('Content', 'basic', (
              <div>
                {renderPropertyEditor('header', 'Header', 'text', props.header)}
                {renderPropertyEditor('text', 'Text', 'textarea', props.text)}
              </div>
            ))}

            {renderSection('Style', 'general', (
              <div>
                {renderPropertyEditor('textColor', 'Text Color', 'color', props.textColor)}
                {renderPropertyEditor('backgroundColor', 'Background Color', 'color', props.backgroundColor)}
              </div>
            ))}

            {renderSection('Data', 'data', (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Bind SQL Query</label>
                <select
                  value={props.queryId || ''}
                  onChange={(e) => handlePropertyChange('queryId', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Query --</option>
                  {sqlQueries.map(q => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(props.autoRefresh)}
                      onChange={(e) => handlePropertyChange('autoRefresh', e.target.checked)}
                      className="rounded border-gray-500 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <span className="text-sm text-white">Auto refresh</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Interval (s)</label>
                    <input
                      type="number"
                      value={props.autoRefreshInterval ?? 30}
                      onChange={(e) => handlePropertyChange('autoRefreshInterval', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {props.queryId && (
                  <div className="mt-3 text-xs text-gray-300">
                    <div className="font-medium mb-1">Query Preview</div>
                    <pre className="text-xs max-h-40 overflow-auto bg-gray-800 p-2 rounded">
                      {JSON.stringify(sqlQueries.find(s => s.id === props.queryId)?.result || 'No result yet', null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            {renderSection('Basic', 'basic', (
              <div>
                {renderPropertyEditor('text', 'Text', 'textarea', props.text)}
                {renderPropertyEditor('textStyle', 'Text Style', 'select', props.textStyle, ['HEADING1', 'HEADING2', 'HEADING3', 'BODY1', 'BODY2', 'CAPTION', 'SUBTITLE1', 'SUBTITLE2'])}
                {renderPropertyEditor('textAlign', 'Text Align', 'select', props.textAlign, ['LEFT', 'CENTER', 'RIGHT', 'JUSTIFY'])}
              </div>
            ))}
            
            {renderSection('General', 'general', (
              <div>
                {renderPropertyEditor('visible', 'Visible', 'boolean', props.visible)}
                {renderPropertyEditor('animateLoading', 'Animate Loading', 'boolean', props.animateLoading)}
                {renderPropertyEditor('overflow', 'Overflow', 'select', props.overflow, ['NONE', 'SCROLL', 'TRUNCATE'])}
                {renderPropertyEditor('shouldTruncate', 'Should Truncate', 'boolean', props.shouldTruncate)}
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            {renderSection('Data', 'data', (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Table Data
                    <span className="ml-1 px-1 py-0.5 bg-blue-600 text-xs rounded">JS</span>
                  </label>
                  <textarea
                    value={typeof props.tableData === 'string' ? props.tableData : ''}
                    onChange={(e) => handlePropertyChange('tableData', e.target.value)}
                    placeholder="{{getUsersAPI.data}} or {{getUsersAPI.data.data}}"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm font-mono focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Bind to API response using {'{{'} {'}}'} syntax
                  </p>
                </div>
              </div>
            ))}

            {renderSection('Basic', 'basic', (
              <div>
                {renderPropertyEditor('defaultSearchText', 'Default Search Text', 'text', props.defaultSearchText)}
                {renderPropertyEditor('defaultPageSize', 'Default Page Size', 'number', props.defaultPageSize)}
              </div>
            ))}

            {renderSection('General', 'general', (
              <div>
                {renderPropertyEditor('visible', 'Visible', 'boolean', props.visible)}
                {renderPropertyEditor('showPagination', 'Show Pagination', 'boolean', props.showPagination)}
                {renderPropertyEditor('enableClientSideSearch', 'Enable Client Side Search', 'boolean', props.enableClientSideSearch)}
                {renderPropertyEditor('multiRowSelection', 'Multi Row Selection', 'boolean', props.multiRowSelection)}
                {renderPropertyEditor('animateLoading', 'Animate Loading', 'boolean', props.animateLoading)}
              </div>
            ))}
          </div>
        );

        case 'filepicker':
          return (
            <div className="space-y-4">
              {renderSection('Content', 'basic', (
                <div>
                  {renderPropertyEditor('label', 'Label', 'text', props.label)}
                  {renderPropertyEditor('placeholder', 'Placeholder', 'text', props.placeholder)}
                  {renderPropertyEditor('multiple', 'Allow Multiple', 'boolean', props.multiple)}
                  {renderPropertyEditor('acceptedTypes', 'Accepted Types (comma separated)', 'text', props.acceptedTypes)}
                  {renderPropertyEditor('maxFileSizeMB', 'Max file size (MB)', 'number', props.maxFileSizeMB)}
                </div>
              ))}

              {renderSection('General', 'general', (
                <div>
                  {renderPropertyEditor('visible', 'Visible', 'boolean', props.visible)}
                  {renderPropertyEditor('disabled', 'Disabled', 'boolean', props.disabled)}
                </div>
              ))}
            </div>
          );

      case 'customfunction':
        return (
          <div className="space-y-4">
            {renderSection('HTML', 'html', (
              <div>
                <CodeEditor
                  value={props.html || ''}
                  onChange={(value) => handlePropertyChange('html', value)}
                  language="html"
                  height={200}
                  label="HTML Code"
                  placeholder="<!-- Write your HTML here -->"
                />
              </div>
            ))}

            {renderSection('CSS', 'css', (
              <div>
                <CodeEditor
                  value={props.css || ''}
                  onChange={(value) => handlePropertyChange('css', value)}
                  language="css"
                  height={200}
                  label="CSS Code"
                  placeholder="/* Write your CSS here */"
                />
              </div>
            ))}

            {renderSection('JavaScript', 'javascript', (
              <div>
                <CodeEditor
                  value={props.javascript || ''}
                  onChange={(value) => handlePropertyChange('javascript', value)}
                  language="javascript"
                  height={250}
                  label="JavaScript Code"
                  placeholder="// Write your JavaScript code here
// You can access:
// - props: component props
// - componentId: unique component identifier
// - APIs: {{apiName.data}}
// - Queries: {{queryName.data}}"
                />
              </div>
            ))}

            {renderSection('General', 'general', (
              <div>
                {renderPropertyEditor('visible', 'Visible', 'boolean', props.visible)}
                {renderPropertyEditor('animateLoading', 'Animate Loading', 'boolean', props.animateLoading)}
                {renderPropertyEditor('height', 'Height (px)', 'number', props.height)}
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <div className="space-y-4">
            {renderSection('Data', 'data', (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Chart Type
                  </label>
                  <select
                    value={props.chartType || 'column'}
                    onChange={(e) => handlePropertyChange('chartType', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="column">Column chart</option>
                    <option value="bar">Bar chart</option>
                    <option value="line">Line chart</option>
                    <option value="area">Area chart</option>
                    <option value="pie">Pie chart</option>
                    <option value="custom">Custom EChart</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">Chart series</label>
                  {(props.series || []).map((series: any, index: number) => (
                    <div key={index} className="mb-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">Series {index + 1}</span>
                        <button
                          onClick={() => {
                            const newSeries = [...(props.series || [])];
                            newSeries.splice(index, 1);
                            handlePropertyChange('series', newSeries);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={series.title || ''}
                          onChange={(e) => {
                            const newSeries = [...(props.series || [])];
                            newSeries[index] = { ...series, title: e.target.value };
                            handlePropertyChange('series', newSeries);
                          }}
                          placeholder="Series title"
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        />

                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 text-xs text-gray-300">
                            Color:
                            <input
                              type="color"
                              value={series.color || '#3b82f6'}
                              onChange={(e) => {
                                const newSeries = [...(props.series || [])];
                                newSeries[index] = { ...series, color: e.target.value };
                                handlePropertyChange('series', newSeries);
                              }}
                              className="w-8 h-6 border border-gray-500 rounded cursor-pointer bg-gray-600"
                            />
                          </label>
                          <label className="flex items-center gap-1 text-xs text-gray-300">
                            <input
                              type="checkbox"
                              checked={true}
                              className="rounded border-gray-500"
                            />
                            Full color picker
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-300 mb-1">
                            Series data
                            <span className="ml-1 px-1 py-0.5 bg-blue-600 text-xs rounded">JS</span>
                          </label>
                          <ChartSeriesEditor
                            value={series.data || ''}
                            onChange={(value) => {
                              const newSeries = [...(props.series || [])];
                              newSeries[index] = { ...series, data: value };
                              handlePropertyChange('series', newSeries);
                            }}
                            placeholder="Type {{ to see available APIs and queries"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            💡 Type <code className="bg-gray-700 px-1 rounded">{'{{'}</code> for autocomplete • Format: <code className="bg-gray-700 px-1 rounded">[{'{'}x: "label", y: value{'}'}]</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newSeries = [...(props.series || []), { title: 'Series', color: '#3b82f6', data: '[]' }];
                      handlePropertyChange('series', newSeries);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add series
                  </button>
                </div>
              </div>
            ))}

            {renderSection('General', 'general', (
              <div>
                {renderPropertyEditor('title', 'Title', 'text', props.title)}
                {renderPropertyEditor('visible', 'Visible', 'boolean', props.visible)}
                {renderPropertyEditor('xAxisName', 'X-Axis Name', 'text', props.xAxisName)}
                {renderPropertyEditor('yAxisName', 'Y-Axis Name', 'text', props.yAxisName)}
                {renderPropertyEditor('showDataLabels', 'Show Data Labels', 'boolean', props.showDataLabels)}
                {renderPropertyEditor('showLegend', 'Show Legend', 'boolean', props.showLegend)}
                {renderPropertyEditor('legendPosition', 'Legend Position', 'select', props.legendPosition, ['top', 'bottom', 'left', 'right'])}
                {renderPropertyEditor('enableTooltip', 'Enable Tooltip', 'boolean', props.enableTooltip)}
              </div>
            ))}

            {renderSection('Style', 'style', (
              <div>
                {renderPropertyEditor('labelOrientation', 'Label Orientation', 'select', props.labelOrientation, ['auto', 'horizontal', 'vertical', 'slant'])}
                {renderPropertyEditor('labelTextSize', 'Label Text Size', 'number', props.labelTextSize)}
                {renderColorPicker('Grid Line Color', props.gridLineColor || '#e5e7eb', (value) => handlePropertyChange('gridLineColor', value))}
                {renderColorPicker('Background Color', props.backgroundColor || '#ffffff', (value) => handlePropertyChange('backgroundColor', value))}
                {renderColorPicker('Border Color', props.borderColor || '#e5e7eb', (value) => handlePropertyChange('borderColor', value))}
                {renderPropertyEditor('borderWidth', 'Border Width', 'number', props.borderWidth)}
                {renderPropertyEditor('borderRadius', 'Border Radius', 'number', props.borderRadius)}
              </div>
            ))}

            {props.chartType === 'custom' && renderSection('Custom Configuration', 'custom', (
              <div>
                <CodeEditor
                  value={props.customEChartsConfig || ''}
                  onChange={(value) => handlePropertyChange('customEChartsConfig', value)}
                  language="javascript"
                  height={300}
                  label="ECharts Configuration"
                  placeholder={`{
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: {{Query1.data}},
    type: 'line'
  }]
}`}
                />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Properties for {type} component coming soon</p>
          </div>
        );
    }
  };

  const renderStyleEditor = () => (
    <div className="space-y-4">
      {renderSection('Position', 'position', (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Width</label>
            <input
              type="number"
              value={selectedComponent.width}
              onChange={(e) => updateComponent(selectedComponent.id, { width: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Height</label>
            <input
              type="number"
              value={selectedComponent.height}
              onChange={(e) => updateComponent(selectedComponent.id, { height: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">X Position</label>
            <input
              type="number"
              value={selectedComponent.x}
              onChange={(e) => updateComponent(selectedComponent.id, { x: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Y Position</label>
            <input
              type="number"
              value={selectedComponent.y}
              onChange={(e) => updateComponent(selectedComponent.id, { y: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      ))}

      {renderSection('Colors', 'colors', (
        <div>
          {renderColorPicker('Background Color', selectedComponent.style?.backgroundColor, (value) => handleStyleChange('backgroundColor', value))}
          {renderColorPicker('Border Color', selectedComponent.style?.borderColor, (value) => handleStyleChange('borderColor', value))}
          {renderColorPicker('Text Color', selectedComponent.style?.color, (value) => handleStyleChange('color', value))}
        </div>
      ))}

      {renderSection('Border & Shadow', 'border', (
        <div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Border Width</label>
            <input
              type="number"
              value={selectedComponent.style?.borderWidth || 0}
              onChange={(e) => handleStyleChange('borderWidth', `${e.target.value}px`)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Border Radius</label>
            <input
              type="number"
              value={selectedComponent.style?.borderRadius || 0}
              onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Box Shadow</label>
            <input
              type="text"
              value={selectedComponent.style?.boxShadow || ''}
              onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
              placeholder="0 2px 4px rgba(0,0,0,0.1)"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderActionsEditor = () => {
    const { type } = selectedComponent;
    
    return (
      <div className="space-y-4">
        {type === 'button' && renderActionEditor('onClick', 'onClick')}
        {type === 'input' && (
          <>
            {renderActionEditor('onTextChanged', 'onTextChanged')}
            {renderActionEditor('onFocusLost', 'onFocusLost')}
            {renderActionEditor('onSubmit', 'onSubmit')}
          </>
        )}
        {type === 'table' && (
          <>
            {renderActionEditor('onRowSelected', 'onRowSelected')}
            {renderActionEditor('onPageChange', 'onPageChange')}
            {renderActionEditor('onSearchTextChanged', 'onSearchTextChanged')}
          </>
        )}
        {type === 'filepicker' && (
          <>
            {renderActionEditor('onUpload', 'onUpload')}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{selectedComponent.type}</h3>
          <div className="flex items-center gap-2">
            <button className="p-1 text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
            <button
              title="Delete component"
              onClick={() => {
                // confirm deletion
                if (typeof window !== 'undefined' && window.confirm('Delete this component from the canvas?')) {
                  deleteComponent(selectedComponent.id);
                  selectComponent(null);
                }
              }}
              className="p-1 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for controls, labels etc"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'content', label: 'Content', icon: Settings },
          { id: 'style', label: 'Style', icon: Palette },
          { id: 'actions', label: 'Actions', icon: Code }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'content' | 'style' | 'actions')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && renderComponentProperties()}
        {activeTab === 'style' && renderStyleEditor()}
        {activeTab === 'actions' && renderActionsEditor()}
      </div>
    </div>
  );
};