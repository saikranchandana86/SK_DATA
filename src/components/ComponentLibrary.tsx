import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useAppStore } from '../store/useAppStore';
import { ComponentDefinition } from '../types';
import { componentDefinitions } from '../config/componentDefinitions';
import { ChevronDown, Search, Star, Table as TableIcon, Type as TypeIcon, DollarSign, Calendar, UploadCloud, Phone, FileText, MousePointer, Image as ImageIcon, CheckSquare, Code } from 'lucide-react';

// iconMap removed (not used)

interface DraggableComponentItemProps {
  definition: ComponentDefinition;
}

const DraggableCompactItem: React.FC<DraggableComponentItemProps> = ({ definition }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { componentType: definition.type, definition },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  // Compact previews use simplified icon-like placeholders; no full preview component required

  // Map component types to lucide icons for compact preview
  const componentIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    table: TableIcon,
    input: TypeIcon,
    text: TypeIcon,
    select: ChevronDown,
    currency: DollarSign,
    datepicker: Calendar,
    filepicker: UploadCloud,
    phone: Phone,
    richtext: FileText,
    button: MousePointer,
    iconbutton: Star,
    image: ImageIcon,
    checkbox: CheckSquare,
    customfunction: Code,
  };

  const renderMini = () => {
    const Icon = componentIconMap[definition.type] || null;
    if (Icon) {
      return (
        <div className="w-12 h-8 rounded-md flex items-center justify-center border border-blue-300 bg-white text-blue-800">
          <Icon className="w-5 h-5" />
        </div>
      );
    }

    // Fallback small placeholder
    return <div className="w-12 h-8 rounded-md bg-white border border-gray-100" />;
  };

  return (
    <div
      ref={drag}
      className={`flex flex-col items-center justify-between gap-1 p-2 rounded-md cursor-move transition-all duration-150 text-center bg-white border border-gray-100 ${
        isDragging ? 'opacity-60' : 'hover:shadow-sm hover:border-gray-200'
      }`}
      title={definition.name}
      role="button"
      tabIndex={0}
      style={{ height: 84 }}
    >
      <div className="w-full h-10 flex items-center justify-center">{renderMini()}</div>
      <div className="w-full mt-1 text-xs text-gray-600 truncate">{definition.name}</div>
    </div>
  );
};

export const ComponentLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { addDemoApi } = useAppStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['suggested', 'inputs', 'buttons', 'display'])
  );

  const categories = [
    { id: 'suggested', name: 'Suggested', icon: Star },
    { id: 'inputs', name: 'Inputs', icon: Star },
    { id: 'buttons', name: 'Buttons', icon: Star },
    { id: 'display', name: 'Display', icon: Star }
  ];

  // Add demo API on component mount
  React.useEffect(() => {
    addDemoApi();
  }, [addDemoApi]);

  const filteredComponents = componentDefinitions.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="p-3 h-full overflow-y-auto bg-white">
      <div className="mb-3">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Components</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search UI elements"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const categoryComponents = filteredComponents.filter(
            (component) => component.category === category.id
          );

          if (categoryComponents.length === 0) return null;

          const IconComponent = category.icon;
          const isExpanded = expandedCategories.has(category.id);

          return (
            <div key={category.id} className="space-y-1 pb-2 border-b border-gray-50">
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex items-center justify-between w-full px-2 py-1 text-left text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-md"
              >
                  <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-blue-800" />
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-400">({categoryComponents.length})</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="ml-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryComponents.map((component) => (
                      <DraggableCompactItem key={component.type} definition={component} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No components found</p>
        </div>
      )}
    </div>
  );
};