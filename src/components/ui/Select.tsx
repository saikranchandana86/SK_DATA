import React, { useState, useRef, useEffect } from 'react';
import { ComponentData, SelectProps } from '../../types';
import { ChevronDown, X, Search, Check } from 'lucide-react';

interface SelectComponentProps {
  component: ComponentData;
  isPreview?: boolean;
  onChange?: (value: any) => void;
}

export const Select: React.FC<SelectComponentProps> = ({ 
  component, 
  isPreview = false, 
  onChange 
}) => {
  const props = component.props as SelectProps;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<any[]>(
    props.isMultiSelect 
      ? (Array.isArray(props.defaultOptionValue) ? props.defaultOptionValue : [])
      : (props.defaultOptionValue ? [props.defaultOptionValue] : [])
  );
  const selectRef = useRef<HTMLDivElement>(null);

  const baseStyle = {
    width: '100%',
    height: '100%',
    ...component.style,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = props.options.filter(option =>
    !props.isFilterable || 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionClick = (optionValue: any) => {
    let newValues: any[];
    
    if (props.isMultiSelect) {
      if (selectedValues.includes(optionValue)) {
        newValues = selectedValues.filter(v => v !== optionValue);
      } else {
        newValues = [...selectedValues, optionValue];
      }
    } else {
      newValues = [optionValue];
      setIsOpen(false);
    }
    
    setSelectedValues(newValues);
    onChange?.(props.isMultiSelect ? newValues : newValues[0] || null);

    // Execute onOptionChange if provided
    if (props.onOptionChange) {
      try {
        new Function('selectedOption', 'selectedOptions', props.onOptionChange)(
          newValues[newValues.length - 1],
          newValues
        );
      } catch (error) {
        console.error('Error executing onOptionChange:', error);
      }
    }
  };

  const handleSelectAll = () => {
    if (!props.isMultiSelect || !props.allowSelectAll) return;
    
    const allValues = filteredOptions.map(opt => opt.value);
    setSelectedValues(allValues);
    onChange?.(allValues);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValues([]);
    onChange?.(props.isMultiSelect ? [] : null);
  };

  const handleDropdownToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen && props.onDropdownOpen) {
      try {
        new Function(props.onDropdownOpen)();
      } catch (error) {
        console.error('Error executing onDropdownOpen:', error);
      }
    } else if (!newIsOpen && props.onDropdownClose) {
      try {
        new Function(props.onDropdownClose)();
      } catch (error) {
        console.error('Error executing onDropdownClose:', error);
      }
    }
  };

  const getDisplayValue = () => {
    if (selectedValues.length === 0) {
      return props.placeholder || 'Select...';
    }
    
    if (props.isMultiSelect) {
      if (selectedValues.length === 1) {
        const option = props.options.find(opt => opt.value === selectedValues[0]);
        return option?.label || selectedValues[0];
      }
      return `${selectedValues.length} items selected`;
    }
    
    const option = props.options.find(opt => opt.value === selectedValues[0]);
    return option?.label || selectedValues[0];
  };

  const getCustomStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (props.borderColor) styles.borderColor = props.borderColor;
    if (props.borderWidth !== undefined) styles.borderWidth = `${props.borderWidth}px`;
    if (props.borderRadius !== undefined) styles.borderRadius = `${props.borderRadius}px`;
    if (props.boxShadow) styles.boxShadow = props.boxShadow;
    if (props.backgroundColor) styles.backgroundColor = props.backgroundColor;
    
    return styles;
  };

  if (!props.visible) return null;

  return (
    <div style={baseStyle} className="flex flex-col">
      {props.label && (
        <label 
          className="text-sm font-medium mb-1"
          style={{ 
            color: props.labelTextColor,
            fontSize: props.labelTextSize ? `${props.labelTextSize}px` : undefined,
            fontStyle: props.labelStyle?.toLowerCase()
          }}
        >
          {props.label}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <div
          style={getCustomStyles()}
          className={`
            flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer
            transition-colors duration-200
            ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}
            ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
            ${props.animateLoading ? 'animate-pulse' : ''}
          `}
          onClick={() => !props.disabled && handleDropdownToggle()}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
              {getDisplayValue()}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {selectedValues.length > 0 && !props.disabled && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
            
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            {props.isFilterable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto">
              {props.isMultiSelect && props.allowSelectAll && filteredOptions.length > 1 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100"
                  onClick={handleSelectAll}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.length === filteredOptions.length}
                    onChange={() => {}}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Select All</span>
                </div>
              )}
              
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {props.isFilterable && searchTerm ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                      ${selectedValues.includes(option.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    `}
                    onClick={() => !option.disabled && handleOptionClick(option.value)}
                  >
                    {props.isMultiSelect && (
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option.value)}
                        onChange={() => {}}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                    
                    {option.icon && (
                      <span className="text-lg">{option.icon}</span>
                    )}
                    
                    <span className="flex-1">{option.label}</span>
                    
                    {option.color && (
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    
                    {!props.isMultiSelect && selectedValues.includes(option.value) && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {props.isMultiSelect && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map(value => {
            const option = props.options.find(opt => opt.value === value);
            return (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {option?.label || value}
                <button
                  onClick={() => handleOptionClick(value)}
                  className="hover:bg-blue-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};