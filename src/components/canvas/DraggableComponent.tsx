import React, { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { useAppStore } from '../../store/useAppStore';
import { ComponentData } from '../../types';
import { RenderComponent } from './RenderComponent';

interface DraggableComponentProps {
  component: ComponentData;
  isSelected: boolean;
  onSelect: () => void;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({ 
  component, 
  isSelected, 
  onSelect 
}) => {
  const { updateComponent, snapToGrid, gridSize } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);

  const [{ isDragSource }, drag] = useDrag({
    type: 'existing-component',
    item: { id: component.id, type: 'existing-component' },
    collect: (monitor) => ({
      isDragSource: monitor.isDragging(),
    }),
  });

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === componentRef.current || (e.target as HTMLElement).closest('.component-content')) {
      onSelect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - component.x,
        y: e.clientY - component.y,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isResizing) {
      const newX = Math.max(0, snapToGridValue(e.clientX - dragStart.x));
      const newY = Math.max(0, snapToGridValue(e.clientY - dragStart.y));
      
      updateComponent(component.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, isResizing]);

  const handleResize = (direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = component.width;
    const startHeight = component.height;
    const startPosX = component.x;
    const startPosY = component.y;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      if (direction.includes('right')) {
        newWidth = Math.max(50, snapToGridValue(startWidth + deltaX));
      }
      if (direction.includes('left')) {
        const widthChange = snapToGridValue(startWidth - deltaX);
        newWidth = Math.max(50, widthChange);
        newX = startPosX + (startWidth - newWidth);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(30, snapToGridValue(startHeight + deltaY));
      }
      if (direction.includes('top')) {
        const heightChange = snapToGridValue(startHeight - deltaY);
        newHeight = Math.max(30, heightChange);
        newY = startPosY + (startHeight - newHeight);
      }

      updateComponent(component.id, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={(node) => {
        componentRef.current = node;
        drag(node);
      }}
      className={`absolute transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-75 shadow-lg' : ''
      } ${isDragSource ? 'opacity-50' : ''} ${isDragging ? 'cursor-move' : 'cursor-pointer'}`}
      style={{
        left: component.x,
        top: component.y,
        width: component.width,
        height: component.height,
        zIndex: isSelected ? 1000 : isDragging ? 999 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="component-content w-full h-full">
        <RenderComponent component={component} />
      </div>

      {isSelected && (
        <>
          {/* Corner resize handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize shadow-sm hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => handleResize('top-left', e)}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize shadow-sm hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => handleResize('top-right', e)}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize shadow-sm hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => handleResize('bottom-left', e)}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-se-resize shadow-sm hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => handleResize('bottom-right', e)}
          />
          
          {/* Edge handles */}
          <div
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-blue-500 border border-white rounded cursor-n-resize shadow-sm hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => handleResize('top', e)}
          />
          <div
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-blue-500 border border-white rounded cursor-s-resize shadow-sm hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => handleResize('bottom', e)}
          />
          <div
            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-blue-500 border border-white rounded cursor-w-resize shadow-sm hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => handleResize('left', e)}
          />
          <div
            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-blue-500 border border-white rounded cursor-e-resize shadow-sm hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => handleResize('right', e)}
          />

          {/* Component info tooltip */}
          <div className="absolute -top-8 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {component.type} ({component.width}×{component.height})
          </div>
        </>
      )}
    </div>
  );
};