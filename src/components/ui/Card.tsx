import React, { useEffect, useState, useRef } from 'react';
import { ComponentData } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface CardProps {
  component: ComponentData;
  isPreview?: boolean;
}

export const Card: React.FC<CardProps> = ({ component }) => {
  const props = component.props as Record<string, unknown>;
  const header = String(props['header'] ?? '');
  const text = String(props['text'] ?? '');
  const titleColor = String(props['titleColor'] ?? '#111827');
  const textColor = String(props['textColor'] ?? '#374151');
  const backgroundColor = String(props['backgroundColor'] ?? '#ffffff');
  const queryIdProp = String(props['queryId'] ?? '');
  const visible = props['visible'] === undefined ? true : Boolean(props['visible']);
  const autoRefresh = props['autoRefresh'] === undefined ? false : Boolean(props['autoRefresh']);
  const autoRefreshInterval = Number(props['autoRefreshInterval'] ?? 30); // seconds

  const { sqlQueries, runSqlQuery } = useAppStore();
  const [queryResult, setQueryResult] = useState<unknown[] | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    function updateFromStore() {
      const q = sqlQueries.find((s) => s.id === queryIdProp);
      if (q && q.result !== undefined) {
        if (mounted) setQueryResult(q.result as unknown[]);
      } else {
        if (mounted) setQueryResult(null);
      }
    }

    updateFromStore();

    return () => { mounted = false; };
  }, [queryIdProp, sqlQueries]);

  // Auto-refresh logic
  useEffect(() => {
    // clear any existing interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (autoRefresh && queryIdProp) {
      const ms = Math.max(1000, Math.floor(autoRefreshInterval) * 1000);
      const id = window.setInterval(() => {
        runSqlQuery(queryIdProp).catch(() => {});
      }, ms);
      intervalRef.current = id as unknown as number;
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, autoRefreshInterval, queryIdProp, runSqlQuery]);

  const onManualRefresh = async () => {
    if (!queryIdProp) return;
    try {
      await runSqlQuery(queryIdProp);
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  // render query result as a small table when possible
  const renderResult = () => {
    if (!queryResult) return null;

    if (Array.isArray(queryResult)) {
      if (queryResult.length === 0) return <div className="text-xs text-gray-500">[]</div>;

      const first = queryResult[0] as Record<string, unknown>;
      if (typeof first === 'object' && first !== null) {
        const columns = Object.keys(first).slice(0, 6);
        return (
          <div className="overflow-auto">
            <table className="w-full text-xs table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {columns.map((col) => (
                    <th key={col} className="p-1 text-left text-gray-600 border-b">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResult.slice(0, 6).map((value, idx) => {
                  const row = value as Record<string, unknown>;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      {columns.map((col) => (
                        <td key={col} className="p-1 align-top text-gray-700 border-b">{String(row?.[col] ?? '')}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }

      // array of primitives
      return (
        <ul className="list-disc pl-4 text-xs text-gray-700">
          {queryResult.slice(0, 8).map((v, i) => (
            <li key={i}>{String(v)}</li>
          ))}
        </ul>
      );
    }

    // fallback for objects or other shapes
    return <pre className="text-xs max-h-40 overflow-auto bg-gray-50 p-2 rounded">{JSON.stringify(queryResult, null, 2)}</pre>;
  };

  const boundQuery = sqlQueries.find((s) => s.id === queryIdProp);

  return (
    <div className="rounded-lg border border-gray-200 shadow-sm bg-white" style={{ backgroundColor }}>
      {/* header bar with small drag handle */}
      <div className="flex items-center justify-center pt-2">
        <div className="w-8 h-2 bg-gray-100 rounded-t-md flex items-center justify-center">
          <div className="w-1 h-1 bg-gray-300 rounded-full mr-0.5" />
          <div className="w-1 h-1 bg-gray-300 rounded-full mr-0.5" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>

      <div className="p-3">
        <div className="mb-2">
          <div className="text-sm font-semibold" style={{ color: titleColor }}>{header || 'Card'}</div>
          <div className="text-xs" style={{ color: textColor }}>{text}</div>
        </div>

        <div className="min-h-[56px]">
          {boundQuery && boundQuery.isLoading ? (
            <div className="text-xs text-gray-500">Loading...</div>
          ) : (
            renderResult()
          )}
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">{boundQuery ? `Query: ${boundQuery.name}` : 'No query bound'}</div>
          <div className="flex items-center space-x-2">
            <button
              className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
              onClick={onManualRefresh}
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
