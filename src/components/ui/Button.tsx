import React, { useState } from 'react';
import { ComponentData, ButtonProps, ActionConfig } from '../../types';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface ButtonComponentProps {
  component: ComponentData;
  isPreview?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonComponentProps> = ({ 
  component, 
  isPreview = false, 
  onClick 
}) => {
  const props = component.props as ButtonProps;
  const [isLoading, setIsLoading] = useState(false);
  const { runApi, runSqlQuery, updateGlobalState, components, apis, sqlQueries, deleteComponent } = useAppStore();
  
  const baseStyle = {
    width: '100%',
    height: '100%',
    ...component.style,
  };

  const getVariantStyles = () => {
    const baseClasses = 'font-medium rounded transition-all duration-200 flex items-center justify-center gap-2 border focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';
    
    switch (props.variant) {
      case 'PRIMARY':
        return `${baseClasses} text-white shadow-sm hover:shadow-md focus:ring-blue-500 hover:opacity-90`;
      case 'SECONDARY':
        return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-500`;
      case 'TERTIARY':
        return `${baseClasses} bg-transparent text-blue-600 border-transparent hover:bg-blue-50 focus:ring-blue-500`;
      default:
        return `${baseClasses} text-white shadow-sm hover:shadow-md focus:ring-blue-500 hover:opacity-90`;
    }
  };

  const getSizeStyles = () => {
    switch (props.size) {
      case 'SMALL':
        return 'px-3 py-1.5 text-sm';
      case 'LARGE':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getCustomStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (props.backgroundColor) styles.backgroundColor = props.backgroundColor;
    if (props.color) styles.color = props.color;
    if (props.borderColor) styles.borderColor = props.borderColor;
    if (props.borderWidth !== undefined) styles.borderWidth = `${props.borderWidth}px`;
    if (props.borderRadius !== undefined) styles.borderRadius = `${props.borderRadius}px`;
    if (props.boxShadow) styles.boxShadow = props.boxShadow;
    
    return styles;
  };

  const executeAction = async (action: ActionConfig) => {
    if (!action || action.type === 'none') return;
    let didRunSuccess = false;

    try {
      switch (action.type) {
        case 'query':
          if (action.target) {
            setIsLoading(true);
            // If target refers to an API id, run API; if it's a SQL query id, run SQL
            const apiTarget = apis?.find(a => a.id === action.target);
            const sqlTarget = sqlQueries?.find(q => q.id === action.target);

            if (apiTarget) {
              await runApi(action.target);
            } else if (sqlTarget) {
              await runSqlQuery(action.target);
            } else {
              console.warn('Query target not found:', action.target);
            }

            setIsLoading(false);
            if (action.onSuccess) {
              didRunSuccess = true;
              await executeAction(action.onSuccess);
            }
          }
          break;
          
        case 'js':
          if (action.target) {
            // Execute JavaScript code with helper functions and context
            const helpers = {
              components,
              apis,
              sqlQueries,
              updateGlobalState,
              runApi,
              runSqlQuery,
              navigate: (url: string) => { window.location.href = url; },
              showAlert: (msg: string) => { alert(msg); },
              copyToClipboard: async (text: string) => { try { await navigator.clipboard.writeText(text); } catch(e){ console.error(e); } },
              download: (url: string, filename?: string) => {
                const link = document.createElement('a');
                link.href = url;
                link.download = filename || '';
                document.body.appendChild(link);
                link.click();
                link.remove();
              }
            };

            try {
              const func = new Function('helpers', action.target);
              // Pass helpers object so users can call helpers.runApi(...)
              func(helpers);
            } catch (_e) {
              console.error('Error executing JS action:', _e);
            }
          }
          break;
          
        case 'alert':
          alert(action.params?.message || 'Alert triggered');
          if (action.onSuccess) { didRunSuccess = true; await executeAction(action.onSuccess); }
          break;
          
        case 'navigate':
          if (action.target) {
            window.location.href = action.target;
          }
          if (action.onSuccess) { didRunSuccess = true; await executeAction(action.onSuccess); }
          break;
          
        case 'modal':
          // Trigger a custom event so the app can show a modal with the given id/params
          try {
            window.dispatchEvent(new CustomEvent('app:showModal', { detail: { target: action.target, params: action.params } }));
          } catch {
            // Fallback to alert
            if (action.params?.message) alert(action.params.message);
            else console.log('Show modal:', action.target, action.params);
          }
          if (action.onSuccess) { didRunSuccess = true; await executeAction(action.onSuccess); }
          break;
          
        case 'store':
          if (action.target && action.params?.value) {
            updateGlobalState(action.target, action.params.value);
          }
          if (action.onSuccess) { didRunSuccess = true; await executeAction(action.onSuccess); }
          break;
          
        case 'copy':
          if (action.params?.text) {
            try { await navigator.clipboard.writeText(action.params.text); } catch (_e) { console.error(_e); }
          }
          if (action.onSuccess) { didRunSuccess = true; await executeAction(action.onSuccess); }
          break;
          
        case 'download':
          if (action.params?.url) {
            const link = document.createElement('a');
            link.href = action.params.url;
            link.download = action.params.filename || 'download';
            link.click();
          }
          if (action.onSuccess) { didRunSuccess = true; await executeAction(action.onSuccess); }
          break;
        case 'remove':
          // Delete a component from canvas. If target is 'self' or empty, delete this component
          try {
            const targetId = action.target === 'self' || !action.target ? component.id : action.target;
            deleteComponent(targetId);
          } catch (err) {
            console.error('Error deleting component:', err);
          }
          if (action.onSuccess) { didRunSuccess = true; await executeAction(action.onSuccess); }
          break;
      }
    } catch (error) {
      console.error('Error executing action:', error);
      if (action.onFailure) {
        await executeAction(action.onFailure);
      }
      return;
    }

    // Call onSuccess if not already called inside the switch
    if (action.onSuccess && !didRunSuccess) {
      await executeAction(action.onSuccess);
    }
  };

  const handleClick = async () => {
    if (props.disabled || isLoading) return;
    
    if (props.animateLoading) {
      setIsLoading(true);
    }
    
    if (props.onClick) {
      await executeAction(props.onClick);
    } else {
      onClick?.();
    }
    
    if (props.animateLoading) {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  // Prevent click bubbling to parent editors so properties remain visible
  const handleWrapperClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();
  };

  if (!props.visible) return null;

  return (
    <button 
      style={{ ...baseStyle, ...getCustomStyles() }}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isLoading ? 'opacity-75' : ''}
      `}
      disabled={!isPreview || props.disabled || isLoading}
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onClickCapture={handleWrapperClick}
      title={props.tooltip}
    >
      {(isLoading && props.animateLoading) && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {props.iconName && props.iconAlign === 'left' && (
        <span className="text-lg">{props.iconName}</span>
      )}
      <span>{props.label || 'Button'}</span>
      {props.iconName && props.iconAlign === 'right' && (
        <span className="text-lg">{props.iconName}</span>
      )}
    </button>
  );
};