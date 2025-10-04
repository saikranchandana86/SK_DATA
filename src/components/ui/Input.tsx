import React, { useState, useEffect } from 'react';
import { ComponentData, InputProps, ActionConfig } from '../../types';
import { Eye, EyeOff, Search, DollarSign, Phone } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface InputComponentProps {
  component: ComponentData;
  isPreview?: boolean;
  onChange?: (value: string) => void;
}

export const Input: React.FC<InputComponentProps> = ({
  component,
  isPreview = false,
  onChange
}) => {
  const props = component.props as InputProps;
  const [value, setValue] = useState(props.defaultText || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { runApi, updateGlobalState, updateComponent, components } = useAppStore();

  const baseStyle = {
    width: '100%',
    height: '100%',
    ...component.style,
  };

  useEffect(() => {
    validateInput(value);
  }, [value, props]);

  const executeAction = async (action: ActionConfig, inputValue?: string) => {
    if (!action || action.type === 'none') return;

    try {
      switch (action.type) {
        case 'query':
          if (action.target) {
            await runApi(action.target);
          }
          break;
          
        case 'js':
          if (action.target) {
            const func = new Function('value', 'components', 'updateGlobalState', action.target);
            func(inputValue || value, components, updateGlobalState);
          }
          break;
          
        case 'store':
          if (action.target) {
            updateGlobalState(action.target, inputValue || value);
          }
          break;
      }
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const validateInput = (inputValue: string) => {
    let valid = true;
    let message = '';

    // Required validation
    if (props.required && !inputValue.trim()) {
      valid = false;
      message = 'This field is required';
    }

    // Max characters validation
    if (valid && props.maxChars && inputValue.length > props.maxChars) {
      valid = false;
      message = `Maximum ${props.maxChars} characters allowed`;
    }

    // Number validation
    if (valid && props.inputType === 'NUMBER' && inputValue) {
      const numValue = Number(inputValue);
      if (isNaN(numValue)) {
        valid = false;
        message = 'Please enter a valid number';
      } else {
        if (props.minNum !== undefined && numValue < props.minNum) {
          valid = false;
          message = `Minimum value is ${props.minNum}`;
        }
        if (props.maxNum !== undefined && numValue > props.maxNum) {
          valid = false;
          message = `Maximum value is ${props.maxNum}`;
        }
      }
    }

    // Email validation
    if (valid && props.inputType === 'EMAIL' && inputValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        valid = false;
        message = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (valid && props.inputType === 'PHONE' && inputValue) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(inputValue.replace(/\s/g, ''))) {
        valid = false;
        message = 'Please enter a valid phone number';
      }
    }

    // Regex validation
    if (valid && props.regex && inputValue) {
      try {
        const regex = new RegExp(props.regex);
        if (!regex.test(inputValue)) {
          valid = false;
          message = props.errorMessage || 'Invalid format';
        }
      } catch (error) {
        console.error('Invalid regex pattern:', error);
      }
    }

    setIsValid(valid);
    setErrorMessage(message);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Enforce max characters
    if (props.maxChars && newValue.length > props.maxChars) {
      return;
    }

    setValue(newValue);
    onChange?.(newValue);

    // Update component state in store so other components can access it
    updateComponent(component.id, {
      props: {
        ...component.props,
        defaultText: newValue,
        currentValue: newValue
      }
    });

    // Execute onTextChanged if provided
    if (props.onTextChanged && isPreview) {
      await executeAction(props.onTextChanged, newValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = async () => {
    setIsFocused(false);
    
    // Execute onFocusLost if provided
    if (props.onFocusLost && isPreview) {
      await executeAction(props.onFocusLost);
    }
  };

  const handleSubmit = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && props.onSubmit && isPreview) {
      await executeAction(props.onSubmit);
    }
  };

  const getInputType = () => {
    switch (props.inputType) {
      case 'PASSWORD':
        return showPassword ? 'text' : 'password';
      case 'EMAIL':
        return 'email';
      case 'NUMBER':
        return 'number';
      case 'SEARCH':
        return 'search';
      case 'PHONE':
        return 'tel';
      case 'CURRENCY':
        return 'number';
      default:
        return 'text';
    }
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

  const renderPrefix = () => {
    if (props.inputType === 'SEARCH') {
      return <Search className="h-4 w-4 text-gray-400" />;
    }
    if (props.inputType === 'CURRENCY') {
      return <DollarSign className="h-4 w-4 text-gray-400" />;
    }
    if (props.inputType === 'PHONE') {
      return <Phone className="h-4 w-4 text-gray-400" />;
    }
    return null;
  };

  if (!props.visible) return null;

  return (
    <div style={baseStyle} className="flex flex-col">
      {props.label && (
        <label 
          className="text-sm font-medium mb-1"
          style={{
            color: props.labelTextColor || '#374151',
            fontSize: props.labelTextSize ? `${props.labelTextSize}px` : undefined,
            fontStyle: props.labelStyle?.toLowerCase()
          }}
        >
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative flex-1">
        {renderPrefix() && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {renderPrefix()}
          </div>
        )}
        
        <input
          type={getInputType()}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleSubmit}
          placeholder={props.placeholder}
          disabled={props.disabled}
          readOnly={props.readOnly}
          maxLength={props.maxChars}
          min={props.inputType === 'NUMBER' ? props.minNum : undefined}
          max={props.inputType === 'NUMBER' ? props.maxNum : undefined}
          spellCheck={props.spellCheck}
          autoFocus={props.autoFocus && isPreview}
          style={getCustomStyles()}
          className={`
            flex-1 px-3 py-2 border rounded-md text-sm transition-colors duration-200
            ${renderPrefix() ? 'pl-10' : ''}
            ${props.inputType === 'PASSWORD' ? 'pr-10' : ''}
            ${isValid 
              ? `border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${isFocused ? 'ring-1 ring-blue-500 border-blue-500' : ''}` 
              : 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            }
            ${props.disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
            ${props.readOnly ? 'bg-gray-50' : ''}
            outline-none
          `}
        />
        
        {props.inputType === 'PASSWORD' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
        
        {props.showStepArrows && props.inputType === 'NUMBER' && (
          <div className="absolute inset-y-0 right-0 flex flex-col">
            <button
              type="button"
              onClick={() => setValue(String(Number(value || 0) + 1))}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => setValue(String(Number(value || 0) - 1))}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600"
            >
              ▼
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <div>
          {!isValid && errorMessage && (
            <span className="text-xs text-red-500">{errorMessage}</span>
          )}
          {props.validationMessage && isValid && (
            <span className="text-xs text-green-500">{props.validationMessage}</span>
          )}
        </div>
        
        {props.maxChars && (
          <span className={`text-xs ${value.length > props.maxChars * 0.8 ? 'text-orange-500' : 'text-gray-400'}`}>
            {value.length}/{props.maxChars}
          </span>
        )}
      </div>
    </div>
  );
};