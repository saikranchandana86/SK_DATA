import React, { useState, useMemo, useEffect } from 'react';
import { ComponentData, TableProps } from '../../types';
import { ChevronUp, ChevronDown, Search, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { evaluateExpression } from '../../utils/expressionEvaluator';

interface TableComponentProps {
  component: ComponentData;
}

export const Table: React.FC<TableComponentProps> = ({ component }) => {
  const props = component.props as TableProps;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState(props.defaultSearchText || '');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [evaluatedData, setEvaluatedData] = useState<unknown[]>([]);
  const { components, apis, globalState, sqlQueries } = useAppStore();

  const baseStyle = {
    width: '100%',
    height: '100%',
    ...component.style,
  };

  // Sample data if no data provided
  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', salary: 75000, joinDate: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', salary: 65000, joinDate: '2023-02-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Inactive', salary: 70000, joinDate: '2023-03-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active', salary: 85000, joinDate: '2023-01-05' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Developer', status: 'Active', salary: 80000, joinDate: '2023-04-12' },
  ];

  // Evaluate tableData expression if it contains bindings
  useEffect(() => {
    if (props.tableData && typeof props.tableData === 'string') {
      // String binding like "{{getUsersAPI.data}}" or SQL reference like "{{Total_assets.data}}"
      const context = { components, apis, sqlQueries, globalState } as any;
      const result = evaluateExpression(props.tableData, context);
      setEvaluatedData(Array.isArray(result) ? result : []);
    } else if (Array.isArray(props.tableData)) {
      setEvaluatedData(props.tableData as unknown[]);
    } else {
      setEvaluatedData(sampleData as unknown[]);
    }
  }, [props.tableData, components, apis, globalState, sqlQueries]);

  const data = evaluatedData.length > 0 ? evaluatedData : sampleData;

  // Default columns if none provided
  const defaultColumns = [
    { id: 'name', label: 'Name', columnType: 'text' as const, isVisible: true, enableSort: true, enableFilter: true, width: 150, textColor: '#1F2937', textSize: 14, fontStyle: 'NORMAL' as const, horizontalAlignment: 'LEFT' as const, verticalAlignment: 'CENTER' as const, cellBackground: '', buttonColor: '', buttonVariant: 'PRIMARY' as const },
    { id: 'email', label: 'Email', columnType: 'text' as const, isVisible: true, enableSort: true, enableFilter: true, width: 200, textColor: '#1F2937', textSize: 14, fontStyle: 'NORMAL' as const, horizontalAlignment: 'LEFT' as const, verticalAlignment: 'CENTER' as const, cellBackground: '', buttonColor: '', buttonVariant: 'PRIMARY' as const },
    { id: 'role', label: 'Role', columnType: 'text' as const, isVisible: true, enableSort: true, enableFilter: true, width: 120, textColor: '#1F2937', textSize: 14, fontStyle: 'NORMAL' as const, horizontalAlignment: 'LEFT' as const, verticalAlignment: 'CENTER' as const, cellBackground: '', buttonColor: '', buttonVariant: 'PRIMARY' as const },
    { id: 'status', label: 'Status', columnType: 'text' as const, isVisible: true, enableSort: true, enableFilter: true, width: 100, textColor: '#1F2937', textSize: 14, fontStyle: 'NORMAL' as const, horizontalAlignment: 'LEFT' as const, verticalAlignment: 'CENTER' as const, cellBackground: '', buttonColor: '', buttonVariant: 'PRIMARY' as const }
  ];

  const columns = props.columns && props.columns.length > 0 ? props.columns : defaultColumns;

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || !props.enableClientSideSearch) return data;
    return data.filter(row => {
      const rowObj = row as Record<string, unknown>;
      return Object.values(rowObj).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm, props.enableClientSideSearch]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aObj = a as Record<string, unknown>;
      const bObj = b as Record<string, unknown>;
      const aValue = String(aObj[sortColumn as string] ?? '');
      const bValue = String(bObj[sortColumn as string] ?? '');

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!props.showPagination) return sortedData;
    
    const startIndex = (currentPage - 1) * props.defaultPageSize;
    return sortedData.slice(startIndex, startIndex + props.defaultPageSize);
  }, [sortedData, currentPage, props.showPagination, props.defaultPageSize]);

  const totalPages = Math.ceil(sortedData.length / props.defaultPageSize);

  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.enableSort) return;
    
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }

    // Execute onSort if provided (supports string JS or ActionConfig with type 'js')
    if (props.onSort) {
      try {
        const payload: unknown = props.onSort as unknown;
        const code = typeof payload === 'string' ? payload : (payload && (payload as any).type === 'js' ? (payload as any).target : undefined);
        if (typeof code === 'string') new Function('column', 'direction', code)(columnId, sortDirection);
      } catch (error) {
        console.error('Error executing onSort:', error);
      }
    }
  };

  const handleRowSelect = (index: number) => {
    if (!props.multiRowSelection) return;
    
    const newSelected = new Set(selectedRows);
    
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    
    setSelectedRows(newSelected);

    // Execute onRowSelected if provided
    if (props.onRowSelected) {
      try {
        const payload: unknown = props.onRowSelected as unknown;
        const code = typeof payload === 'string' ? payload : (payload && (payload as any).type === 'js' ? (payload as any).target : undefined);
        if (typeof code === 'string') {
          new Function('selectedRows', 'rowData', code)(
            Array.from(newSelected).map(i => paginatedData[i]),
            paginatedData[index]
          );
        }
      } catch (error) {
        console.error('Error executing onRowSelected:', error);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, i) => i)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const exportData = () => {
    const visibleColumns = columns.filter(col => col.isVisible);
    const csv = [
      visibleColumns.map(col => col.label).join(','),
      ...sortedData.map(row => {
        const r = row as Record<string, unknown>;
        return visibleColumns.map(col => String(r[col.id] || '')).join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCustomStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (props.borderColor) styles.borderColor = props.borderColor;
    if (props.borderWidth !== undefined) styles.borderWidth = `${props.borderWidth}px`;
    if (props.borderRadius !== undefined) styles.borderRadius = `${props.borderRadius}px`;
    if (props.boxShadow) styles.boxShadow = props.boxShadow;
    if (props.accentColor) (styles as any)['--accent-color'] = props.accentColor;
    
    return styles;
  };

  const execJS = (maybe: unknown, ...args: any[]) => {
    try {
      if (!maybe) return;
      if (typeof maybe === 'string') {
        const fn = new Function(...args.map((_, i) => `arg${i}`), maybe);
        return fn(...args);
      }
      if (typeof maybe === 'object' && (maybe as any).type === 'js' && typeof (maybe as any).target === 'string') {
        const fn = new Function(...args.map((_, i) => `arg${i}`), (maybe as any).target);
        return fn(...args);
      }
    } catch (e) {
      console.error('Error executing JS action', e);
    }
  };

  const getVariantClass = () => {
    switch (props.variant) {
      case 'VARIANT2':
        return 'table-variant-2';
      case 'VARIANT3':
        return 'table-variant-3';
      default:
        return 'table-variant-default';
    }
  };

  const visibleColumns = columns.filter(col => col.isVisible);

  if (!props.visible) return null;

  return (
    <div 
      style={{ ...baseStyle, ...getCustomStyles() }}
      className={`
        flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden
        ${getVariantClass()}
        ${props.animateLoading ? 'animate-pulse' : ''}
      `}
    >
      {/* Table Header with Search and Controls */}
      {(props.enableClientSideSearch || props.showPagination) && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {props.enableClientSideSearch && (
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={props.defaultSearchText || "Search..."}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (props.onSearchTextChanged) {
                        try {
                          new Function('searchText', props.onSearchTextChanged)(e.target.value);
                        } catch (error) {
                          console.error('Error executing onSearchTextChanged:', error);
                        }
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
              
              {selectedRows.size > 0 && (
                <div className="text-sm text-blue-600">
                  {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''} selected
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportData}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Export data"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              {props.showPagination && (
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * props.defaultPageSize) + 1} to{' '}
                  {Math.min(currentPage * props.defaultPageSize, sortedData.length)} of{' '}
                  {sortedData.length} entries
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              {props.multiRowSelection && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`
                    px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.enableSort ? 'cursor-pointer hover:bg-gray-100' : ''}
                    ${column.horizontalAlignment === 'CENTER' ? 'text-center' : 
                      column.horizontalAlignment === 'RIGHT' ? 'text-right' : 'text-left'}
                  `}
                  onClick={() => column.enableSort && handleSort(column.id)}
                  style={{ 
                    width: column.width ? `${column.width}px` : 'auto',
                    color: column.textColor,
                    fontSize: column.textSize ? `${column.textSize}px` : undefined,
                    fontStyle: column.fontStyle?.toLowerCase()
                  }}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.enableSort && sortColumn === column.id && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-3 h-3" /> : 
                        <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`
                  hover:bg-gray-50 transition-colors duration-150
                  ${selectedRows.has(index) ? 'bg-blue-50' : ''}
                `}
                style={{ backgroundColor: props.cellBackground }}
              >
                {props.multiRowSelection && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => handleRowSelect(index)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                
                {visibleColumns.map((column) => (
                  <td 
                    key={column.id} 
                    className={`
                      px-4 py-3 text-sm
                      ${column.horizontalAlignment === 'CENTER' ? 'text-center' : 
                        column.horizontalAlignment === 'RIGHT' ? 'text-right' : 'text-left'}
                      ${column.verticalAlignment === 'CENTER' ? 'align-middle' : 
                        column.verticalAlignment === 'BOTTOM' ? 'align-bottom' : 'align-top'}
                    `}
                    style={{ 
                      color: column.textColor || props.textColor,
                      fontSize: column.textSize || props.textSize ? `${column.textSize || props.textSize}px` : undefined,
                      fontStyle: (column.fontStyle || props.fontStyle)?.toLowerCase(),
                      backgroundColor: column.cellBackground
                    }}
                  >
                    {column.columnType === 'button' ? (
                      <button
                        onClick={() => {
                          if (column.onClick) {
                            try {
                              new Function('rowData', 'rowIndex', column.onClick)(row, index);
                            } catch (error) {
                              console.error('Error executing column onClick:', error);
                            }
                          }
                        }}
                        className={`
                          px-3 py-1 rounded text-sm font-medium transition-colors
                          ${column.buttonVariant === 'PRIMARY' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            column.buttonVariant === 'SECONDARY' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' :
                            'bg-transparent text-blue-600 hover:bg-blue-50'}
                        `}
                        style={{ backgroundColor: column.buttonColor }}
                      >
                        {column.iconName && <span className="mr-1">{column.iconName}</span>}
                        {row[column.id] || 'Action'}
                      </button>
                    ) : column.columnType === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={Boolean(row[column.id])}
                        onChange={() => {}}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    ) : column.columnType === 'image' ? (
                      <img 
                        src={row[column.id]} 
                        alt="" 
                        className="w-8 h-8 rounded object-cover" 
                      />
                    ) : column.columnType === 'url' ? (
                      <a 
                        href={row[column.id]} 
                        className="text-blue-600 hover:underline" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {row[column.id]}
                      </a>
                    ) : column.columnType === 'date' ? (
                      new Date(row[column.id]).toLocaleDateString()
                    ) : column.columnType === 'number' ? (
                      typeof row[column.id] === 'number' ? row[column.id].toLocaleString() : row[column.id]
                    ) : (
                      String(row[column.id] || '-')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {paginatedData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg mb-2">No data available</div>
            <div className="text-sm">
              {searchTerm ? 'No results match your search criteria' : 'No data to display'}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {props.showPagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  setCurrentPage(newPage);
                  if (props.onPageChange) {
                    try {
                      new Function('pageNumber', props.onPageChange)(newPage);
                    } catch (error) {
                      console.error('Error executing onPageChange:', error);
                    }
                  }
                }}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        if (props.onPageChange) {
                          try {
                            new Function('pageNumber', props.onPageChange)(page);
                          } catch (error) {
                            console.error('Error executing onPageChange:', error);
                          }
                        }
                      }}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => {
                  const newPage = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(newPage);
                  if (props.onPageChange) {
                    try {
                      new Function('pageNumber', props.onPageChange)(newPage);
                    } catch (error) {
                      console.error('Error executing onPageChange:', error);
                    }
                  }
                }}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};