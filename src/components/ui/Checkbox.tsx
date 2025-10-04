import React from 'react';
import { ComponentData, CheckboxProps } from '../../types';
import { Check, Minus } from 'lucide-react';

interface CheckboxComponentProps {
  component: ComponentData;
  isPreview?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxComponentProps> = ({ 
  component, 
  isPreview = false, 
  onChange 
}) => {
  const props = component.props as CheckboxProps;
  
  const baseStyle = {
    width: '100%',
    height: '100%',
    ...component.style,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPreview || props.disabled) return;
    
    const checked = e.target.checked;
    onChange?.(checked);

    // Execute onCheckChange if provided
    if (props.onCheckChange) {
      try {
        new Function('isChecked', props.onCheckChange)(checked);
      } catch (error) {
        console.error('Error executing onCheckChange:', error);
      }
    }
  };

  const getCustomStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (props.accentColor) {
      styles.setProperty?.('--accent-color', props.accentColor);
    }
    if (props.borderRadius !== undefined) {
      styles.borderRadius = `${props.borderRadius}px`;
    }
    
    return styles;
  };

  if (!props.visible) return null;

  return (
    <div style={baseStyle} className="flex items-center">
      <label 
        className={`flex items-center gap-2 cursor-pointer ${props.alignWidget === 'RIGHT' ? 'flex-row-reverse' : ''}`}
      >
        <div className="relative">
          <input
            type="checkbox"
            checked={props.defaultCheckedState}
            onChange={handleChange}
            disabled={!isPreview || props.disabled}
            required={props.required}
            className="sr-only"
          />
          
          <div
            style={getCustomStyles()}
            className={`
              w-5 h-5 border-2 rounded flex items-center justify-center
              transition-all duration-200
              ${props.defaultCheckedState
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300 hover:border-gray-400'
              }
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${props.animateLoading ? 'animate-pulse' : ''}
            `}
          >
            {props.defaultCheckedState && (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
        
        {props.label && (
          <span 
            className={`text-sm ${props.disabled ? 'text-gray-400' : 'text-gray-700'}`}
            style={{
              color: props.labelTextColor,
              fontSize: props.labelTextSize ? `${props.labelTextSize}px` : undefined,
              fontStyle: props.labelStyle?.toLowerCase()
            }}
          >
            {props.label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        )}
      </label>
    </div>
  );
};