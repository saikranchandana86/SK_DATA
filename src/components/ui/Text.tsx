import React from 'react';
import { ComponentData, TextProps } from '../../types';

interface TextComponentProps {
  component: ComponentData;
  isPreview?: boolean;
}

export const Text: React.FC<TextComponentProps> = ({ component, isPreview = false }) => {
  const props = component.props as TextProps;
  
  const baseStyle = {
    width: '100%',
    height: '100%',
    ...component.style,
  };

  const getTextStyleClasses = () => {
    switch (props.textStyle) {
      case 'HEADING1':
        return 'text-4xl font-bold';
      case 'HEADING2':
        return 'text-3xl font-bold';
      case 'HEADING3':
        return 'text-2xl font-semibold';
      case 'BODY1':
        return 'text-base';
      case 'BODY2':
        return 'text-sm';
      case 'CAPTION':
        return 'text-xs';
      case 'SUBTITLE1':
        return 'text-lg font-medium';
      case 'SUBTITLE2':
        return 'text-base font-medium';
      default:
        return 'text-base';
    }
  };

  const getAlignmentClass = () => {
    switch (props.textAlign) {
      case 'CENTER':
        return 'text-center';
      case 'RIGHT':
        return 'text-right';
      case 'JUSTIFY':
        return 'text-justify';
      default:
        return 'text-left';
    }
  };

  const getOverflowClass = () => {
    switch (props.overflow) {
      case 'SCROLL':
        return 'overflow-auto';
      case 'TRUNCATE':
        return 'truncate';
      default:
        return 'overflow-visible';
    }
  };

  const getCustomStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (props.textColor) styles.color = props.textColor;
    if (props.fontSize) styles.fontSize = `${props.fontSize}px`;
    if (props.fontWeight) styles.fontWeight = props.fontWeight;
    if (props.fontStyle) styles.fontStyle = props.fontStyle.toLowerCase();
    if (props.backgroundColor) styles.backgroundColor = props.backgroundColor;
    if (props.borderColor) styles.borderColor = props.borderColor;
    if (props.borderWidth !== undefined) styles.borderWidth = `${props.borderWidth}px`;
    if (props.borderRadius !== undefined) styles.borderRadius = `${props.borderRadius}px`;
    if (props.boxShadow) styles.boxShadow = props.boxShadow;
    
    return styles;
  };

  if (!props.visible) return null;

  const content = props.text || 'Text content';

  return (
    <div 
      style={{ ...baseStyle, ...getCustomStyles() }}
      className={`
        flex items-center
        ${getTextStyleClasses()}
        ${getAlignmentClass()}
        ${getOverflowClass()}
        ${props.shouldTruncate ? 'truncate' : ''}
        ${props.animateLoading ? 'animate-pulse' : ''}
        transition-all duration-200
      `}
    >
      {content}
    </div>
  );
};