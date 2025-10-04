import React from 'react';
import { ComponentData } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Text } from '../ui/Text';
import { Image } from '../ui/Image';
import { Table } from '../ui/Table';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { CustomFunction } from '../ui/CustomFunction';
import { Card } from '../ui/Card';
import { FilePicker } from '../ui/FilePicker';
import { Chart } from '../ui/Chart';

interface RenderComponentProps {
  component: ComponentData;
  isPreview?: boolean;
}

export const RenderComponent: React.FC<RenderComponentProps> = ({ 
  component, 
  isPreview = false 
}) => {
  // Apply custom CSS if provided
  const customStyle = component.customCSS ? {
    ...component.style,
  } : component.style;

  const componentProps = {
    component: { ...component, style: customStyle },
    isPreview
  };

  // Execute custom JavaScript if provided and in preview mode
  React.useEffect(() => {
    if (isPreview && component.customJS) {
      try {
        const func = new Function('component', component.customJS);
        func(component);
      } catch (error) {
        console.error('Error executing custom JS for component:', component.id, error);
      }
    }
  }, [component, isPreview]);

  switch (component.type) {
    case 'button':
      return <Button {...componentProps} />;
    
    case 'input':
      return <Input {...componentProps} />;
    
    case 'text':
      return <Text {...componentProps} />;
    
    case 'image':
      return <Image {...componentProps} />;
    
    case 'table':
      return <Table {...componentProps} />;
    
    case 'select':
      return <Select {...componentProps} />;
    
    case 'checkbox':
      return <Checkbox {...componentProps} />;
    
    case 'customfunction':
      return <CustomFunction {...componentProps} />;

    case 'card':
      return <Card {...componentProps} />;

    case 'filepicker':
      return <FilePicker {...componentProps} />;

    case 'chart':
      return <Chart {...componentProps} />;

    // Add more component cases as needed
  case 'currency':
  case 'datepicker':
  case 'phone':
    case 'richtext':
    case 'iconbutton':
    case 'buttongroup':
    case 'menu':
    case 'divider':
    case 'rating':
    case 'progress':
    case 'audio':
    case 'video':
    case 'map':
    case 'iframe':
      return (
        <div 
          style={customStyle}
          className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center text-blue-600 text-sm p-4"
        >
          <div className="text-center">
            <div className="font-medium capitalize">{component.type}</div>
            <div className="text-xs mt-1 opacity-75">Component coming soon</div>
          </div>
        </div>
      );

    default:
      return (
        <div 
          style={customStyle}
          className="bg-red-50 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center text-red-600 text-sm p-4"
        >
          <div className="text-center">
            <div className="font-medium">Unknown Component</div>
            <div className="text-xs mt-1 opacity-75">{component.type}</div>
          </div>
        </div>
      );
  }
};