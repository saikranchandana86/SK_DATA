import React, { useEffect, useRef, useState } from 'react';
import { ComponentData, CustomFunctionProps } from '../../types';
import { AlertTriangle, Code } from 'lucide-react';

interface CustomFunctionComponentProps {
  component: ComponentData;
  isPreview?: boolean;
}

export const CustomFunction: React.FC<CustomFunctionComponentProps> = ({ 
  component, 
  isPreview = false 
}) => {
  const props = component.props as CustomFunctionProps;
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const baseStyle = {
    width: '100%',
    height: props.height ? `${props.height}px` : '100%',
    ...component.style,
  };

  useEffect(() => {
    if (!containerRef.current || !isPreview) return;

    const executeCustomCode = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Clear previous content
        containerRef.current!.innerHTML = '';

        // Create a sandboxed container for the custom component
        const wrapper = document.createElement('div');
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'hidden';

        // Inject HTML
        if (props.html) {
          wrapper.innerHTML = props.html;
        }

        // Inject CSS with scoping
        if (props.css) {
          const style = document.createElement('style');
          style.textContent = `
            .custom-function-${component.id} {
              ${props.css}
            }
            .custom-function-${component.id} * {
              box-sizing: border-box;
            }
          `;
          wrapper.appendChild(style);
          wrapper.className = `custom-function-${component.id}`;
        }

        // Inject JavaScript with error handling
        if (props.javascript) {
          const script = document.createElement('script');
          script.textContent = `
            (function() {
              try {
                // Provide access to component props
                const props = ${JSON.stringify(props.props || {})};
                const componentId = '${component.id}';
                
                // Execute custom JavaScript
                ${props.javascript}
              } catch (error) {
                console.error('Custom function error:', error);
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = 'color: red; padding: 10px; background: #fee; border: 1px solid #fcc; border-radius: 4px; font-size: 12px;';
                errorDiv.textContent = 'JavaScript Error: ' + error.message;
                document.querySelector('.custom-function-${component.id}').appendChild(errorDiv);
              }
            })();
          `;
          wrapper.appendChild(script);
        }

        containerRef.current.appendChild(wrapper);

      } catch (error) {
        console.error('Error rendering custom function:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    executeCustomCode();
  }, [props.html, props.css, props.javascript, props.props, component.id, isPreview]);

  const getCustomStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (props.borderColor) styles.borderColor = props.borderColor;
    if (props.borderWidth !== undefined) styles.borderWidth = `${props.borderWidth}px`;
    if (props.borderRadius !== undefined) styles.borderRadius = `${props.borderRadius}px`;
    if (props.boxShadow) styles.boxShadow = props.boxShadow;
    
    return styles;
  };

  if (!props.visible) return null;

  if (!isPreview) {
    return (
      <div 
        style={{ ...baseStyle, ...getCustomStyles() }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center text-purple-600"
      >
        <div className="text-center p-4">
          <Code className="w-8 h-8 mx-auto mb-2" />
          <div className="font-medium">Custom Function</div>
          <div className="text-sm mt-1 opacity-75">Preview to see output</div>
          {(props.html || props.css || props.javascript) && (
            <div className="text-xs mt-2 space-y-1">
              {props.html && <div>✓ HTML</div>}
              {props.css && <div>✓ CSS</div>}
              {props.javascript && <div>✓ JavaScript</div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        style={{ ...baseStyle, ...getCustomStyles() }}
        className="bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading custom function...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        style={{ ...baseStyle, ...getCustomStyles() }}
        className="bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-600 p-4"
      >
        <div className="text-center">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium mb-1">Execution Error</div>
          <div className="text-sm opacity-75">{error}</div>
        </div>
      </div>
    );
  }

  if (!props.html && !props.css && !props.javascript) {
    return (
      <div 
        style={{ ...baseStyle, ...getCustomStyles() }}
        className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500"
      >
        <div className="text-center p-4">
          <Code className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm">No code provided</div>
          <div className="text-xs mt-1 opacity-75">Add HTML, CSS, or JavaScript to get started</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ ...baseStyle, ...getCustomStyles() }}
      className={`custom-function-container overflow-hidden ${props.animateLoading ? 'animate-pulse' : ''}`}
    />
  );
};