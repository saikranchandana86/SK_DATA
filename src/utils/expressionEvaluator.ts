/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EvaluationContext {
  components: any[];
  apis: any[];
  sqlQueries?: any[];
  globalState: Record<string, any>;
}

export function evaluateExpression(expression: string, context: EvaluationContext): any {
  if (!expression || typeof expression !== 'string') {
    return expression;
  }

  const expressionPattern = /\{\{([^}]+)\}\}/g;
  const matches = expression.match(expressionPattern);

  if (!matches) {
    return expression;
  }

  let result: any = expression;

  matches.forEach(match => {
    const code = match.slice(2, -2).trim();

    try {
      const evaluated = evaluateCode(code, context);

      if (matches.length === 1 && expression === match) {
        result = evaluated;
      } else {
        result = result.replace(match, String(evaluated ?? ''));
      }
    } catch (error) {
      console.error(`Error evaluating expression: ${code}`, error);
      result = result.replace(match, '');
    }
  });

  return result;
}

function evaluateCode(code: string, context: EvaluationContext): any {
  const parts = code.split('.');

  if (parts[0] === 'appsmith') {
    if (parts[1] === 'store') {
      return context.globalState[parts.slice(2).join('.')];
    }
  }

  const component = context.components.find(c => c.id === parts[0]);
  if (component) {
    return getComponentValue(component, parts.slice(1));
  }

  const api = context.apis.find(a => a.id === parts[0]);
  if (api) {
    return getApiValue(api, parts.slice(1));
  }

  const sql = context.sqlQueries?.find((s: any) => s.id === parts[0]);
  if (sql) {
    // allow references like Total_assets.data or Total_assets.result
    const key = parts[1];
    if (!key || key === 'result' || key === 'data') {
      return sql.result;
    }
    let value = sql.result;
    for (let i = 1; i < parts.length; i++) {
      value = value?.[parts[i]];
    }
    return value;
  }

  if (context.globalState[parts[0]] !== undefined) {
    let value = context.globalState[parts[0]];
    for (let i = 1; i < parts.length; i++) {
      value = value?.[parts[i]];
    }
    return value;
  }

  try {
    // Create local variable declarations for apis, sql queries and components so expressions
    // can reference them by id directly (e.g. {{Total_assets.data}})
    const decls: string[] = [];

    const toSafeVar = (name: string) => {
      // convert to a safe JS identifier
      let v = String(name).replace(/[^a-zA-Z0-9_$]/g, '_');
      if (/^[0-9]/.test(v)) v = '_' + v;
      return v;
    };

    if (context.apis && Array.isArray(context.apis)) {
      context.apis.forEach((a: any) => {
        try {
          const id = toSafeVar(a.id || 'api');
          // Extract the actual data from response.body if it exists
          const responseData = a.response?.body || a.response;
          const val = {
            data: responseData,
            response: responseData,
            isLoading: a.isLoading,
            error: a.error,
          };
          decls.push(`var ${id} = ${JSON.stringify(val)};`);
        } catch (err) {
          console.warn('Failed to serialize API data for', id, err);
          // ignore serialization issues
        }
      });
    }

    if (context.sqlQueries && Array.isArray(context.sqlQueries)) {
      context.sqlQueries.forEach((s: any) => {
        try {
          const id = toSafeVar(s.id || 'sql');
          const val = {
            data: s.result,
            result: s.result,
            isLoading: s.isLoading,
            error: s.error,
          };
          decls.push(`var ${id} = ${JSON.stringify(val)};`);
        } catch {
          // ignore
        }
      });
    }

    if (context.components && Array.isArray(context.components)) {
      context.components.forEach((c: any) => {
        try {
          const id = toSafeVar(c.id || 'component');
          const val = {
            props: c.props || {},
            type: c.type,
            id: c.id,
          };
          decls.push(`var ${id} = ${JSON.stringify(val)};`);
        } catch {
          // ignore
        }
      });
    }

    const funcBody = `${decls.join('\n')}\nreturn (${code});`;
    const fn = new Function('components', 'apis', 'sqlQueries', 'globalState', funcBody);
    return fn(context.components, context.apis, context.sqlQueries, context.globalState);
  } catch (error) {
    console.error('Failed to evaluate code:', code, error);
    return undefined;
  }
}

function getComponentValue(component: any, path: string[]): any {
  if (path.length === 0) {
    return component;
  }

  const firstKey = path[0];

  switch (component.type) {
    case 'input':
      if (firstKey === 'text' || firstKey === 'value') {
        return component.props.defaultText || '';
      }
      if (firstKey === 'isValid') {
        return component.props.isValid !== false;
      }
      break;

    case 'button':
      if (firstKey === 'isLoading') {
        return component.props.isLoading || false;
      }
      break;

    case 'select':
      if (firstKey === 'selectedOption' || firstKey === 'value') {
        return component.props.selectedValue;
      }
      break;

    case 'checkbox':
      if (firstKey === 'isChecked' || firstKey === 'value') {
        return component.props.isChecked || false;
      }
      break;

    case 'table':
      if (firstKey === 'selectedRow') {
        return component.props.selectedRow;
      }
      if (firstKey === 'selectedRows') {
        return component.props.selectedRows || [];
      }
      if (firstKey === 'tableData') {
        return component.props.tableData || [];
      }
      if (firstKey === 'pageNo') {
        return component.props.pageNo || 1;
      }
      if (firstKey === 'searchText') {
        return component.props.searchText || '';
      }
      break;
  }

  if (component.props[firstKey] !== undefined) {
    let value = component.props[firstKey];
    for (let i = 1; i < path.length; i++) {
      value = value?.[path[i]];
    }
    return value;
  }

  return undefined;
}

function getApiValue(api: any, path: string[]): any {
  if (path.length === 0) {
    return api;
  }

  const firstKey = path[0];

  if (firstKey === 'data') {
    // api.response might contain a nested body property
    let value = api.response?.body || api.response;
    for (let i = 1; i < path.length; i++) {
      value = value?.[path[i]];
    }
    return value;
  }

  if (firstKey === 'isLoading') {
    return api.isLoading || false;
  }

  if (firstKey === 'error') {
    return api.error;
  }

  if (firstKey === 'response') {
    let value = api.response?.body || api.response;
    for (let i = 1; i < path.length; i++) {
      value = value?.[path[i]];
    }
    return value;
  }

  return undefined;
}

export function hasExpressions(value: any): boolean {
  if (typeof value !== 'string') return false;
  return /\{\{[^}]+\}\}/.test(value);
}

export function evaluateObjectExpressions(obj: any, context: EvaluationContext): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return evaluateExpression(obj, context);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => evaluateObjectExpressions(item, context));
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = evaluateObjectExpressions(obj[key], context);
    }
    return result;
  }

  return obj;
}
