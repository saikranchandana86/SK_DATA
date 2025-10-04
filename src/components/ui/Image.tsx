import React, { useState } from 'react';
import { ComponentData, ImageProps } from '../../types';
import { Download, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageComponentProps {
  component: ComponentData;
  isPreview?: boolean;
}

export const Image: React.FC<ImageComponentProps> = ({ component, isPreview = false }) => {
  const props = component.props as ImageProps;
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  const baseStyle = {
    width: '100%',
    height: '100%',
    ...component.style,
  };

  const getShapeClass = () => {
    switch (props.imageShape) {
      case 'CIRCLE':
        return 'rounded-full';
      case 'ROUNDED':
        return 'rounded-lg';
      default:
        return 'rounded-none';
    }
  };

  const getCustomStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (props.borderColor) styles.borderColor = props.borderColor;
    if (props.borderWidth !== undefined) styles.borderWidth = `${props.borderWidth}px`;
    if (props.borderRadius !== undefined) styles.borderRadius = `${props.borderRadius}px`;
    if (props.boxShadow) styles.boxShadow = props.boxShadow;
    
    return styles;
  };

  const handleClick = () => {
    if (!isPreview || !props.onClick) return;

    try {
      const func = new Function('component', 'event', props.onClick);
      func(component, event);
    } catch (error) {
      console.error('Error executing image onClick:', error);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleDownload = () => {
    if (!props.enableDownload || !props.image) return;
    
    const link = document.createElement('a');
    link.href = props.image;
    link.download = 'image';
    link.click();
  };

  const handleZoomIn = () => {
    if (zoomLevel < props.maxZoomLevel) {
      setZoomLevel(prev => Math.min(prev + 0.25, props.maxZoomLevel));
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.25) {
      setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
    }
  };

  const handleRotate = () => {
    if (props.enableRotation) {
      setRotation(prev => (prev + 90) % 360);
    }
  };

  if (!props.visible) return null;

  const imageSrc = props.image || props.defaultImage;
  const hasClickAction = props.onClick && isPreview;
  const showControls = isPreview && (props.enableDownload || props.enableRotation || props.maxZoomLevel > 1);

  return (
    <div 
      style={{ ...baseStyle, ...getCustomStyles() }}
      className={`
        relative overflow-hidden group
        ${getShapeClass()}
        ${props.animateLoading && imageLoading ? 'animate-pulse' : ''}
        ${hasClickAction ? 'cursor-pointer' : ''}
        ${props.showHoverPointer && isPreview ? 'hover:opacity-90' : ''}
        transition-all duration-200
      `}
    >
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {imageSrc && !imageError ? (
        <img
          src={imageSrc}
          alt="Image"
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={handleClick}
          className={`
            w-full h-full object-cover transition-all duration-200
            ${getShapeClass()}
            ${imageLoading ? 'opacity-0' : 'opacity-100'}
          `}
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        />
      ) : (
        <div className={`
          w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm border-2 border-dashed border-gray-300
          ${getShapeClass()}
        `}>
          {imageError ? 'Failed to load image' : 'No image selected'}
        </div>
      )}
      
      {/* Image Controls */}
      {showControls && !imageLoading && !imageError && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {props.maxZoomLevel > 1 && (
            <>
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.25}
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 disabled:opacity-50"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= props.maxZoomLevel}
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 disabled:opacity-50"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </>
          )}
          
          {props.enableRotation && (
            <button
              onClick={handleRotate}
              className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          )}
          
          {props.enableDownload && (
            <button
              onClick={handleDownload}
              className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Zoom Level Indicator */}
      {props.maxZoomLevel > 1 && zoomLevel !== 1 && !imageLoading && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {Math.round(zoomLevel * 100)}%
        </div>
      )}
    </div>
  );
};