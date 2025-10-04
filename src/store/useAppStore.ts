import { create } from 'zustand';
import { ComponentData, ComponentType, ApiEndpoint, SqlQuery, Datasource, AppPage, GlobalState, CodeGeneration, AppSettings, Theme } from '../types';
import { evaluateExpression, evaluateObjectExpressions } from '../utils/expressionEvaluator';

const STORAGE_KEY = 'MY_FLOW_01_APP_STATE_v1';

function loadPersistedState(): Partial<Pick<AppState, 'pages' | 'components' | 'apis' | 'sqlQueries' | 'datasources' | 'currentPageId' | 'settings' | 'globalState' | 'generatedCode'>> | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePersistedState(state: Pick<AppState, 'pages' | 'components' | 'apis' | 'sqlQueries' | 'datasources' | 'currentPageId' | 'settings' | 'globalState' | 'generatedCode'>) {
  try {
    if (typeof window === 'undefined') return;
    const toSave = {
      pages: state.pages,
      components: state.components,
      apis: state.apis,
      sqlQueries: state.sqlQueries,
      datasources: state.datasources,
      currentPageId: state.currentPageId,
      settings: state.settings,
      globalState: state.globalState,
      generatedCode: state.generatedCode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

const defaultTheme: Theme = {
  id: 'default',
  name: 'Default',
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#1F2937',
    textSecondary: '#6B7280'
  },
  fonts: {
    primary: 'Inter, sans-serif',
    secondary: 'JetBrains Mono, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
};

interface AppState {
  // UI State
  activeTab: 'canvas' | 'api' | 'sql' | 'datasources' | 'code';
  leftPanelTab: 'components' | 'pages' | 'queries' | 'apis' | 'layers';
  rightPanelTab: 'properties' | 'data' | 'logs' | 'settings';
  
  // Canvas State
  components: ComponentData[];
  selectedComponent: ComponentData | null;
  draggedComponent: ComponentType | null;
  canvasScale: number;
  gridSize: number;
  snapToGrid: boolean;
  
  // Pages
  pages: AppPage[];
  currentPageId: string;
  
  // API State
  apis: ApiEndpoint[];
  selectedApi: ApiEndpoint | null;
  
  // SQL State
  sqlQueries: SqlQuery[];
  selectedQuery: SqlQuery | null;
  
  // Datasources
  datasources: Datasource[];
  selectedDatasource: Datasource | null;
  
  // Code Generation
  generatedCode: CodeGeneration;
  
  // Global State
  globalState: GlobalState;
  
  // App Settings
  settings: AppSettings;
  
  // Actions
  setActiveTab: (tab: 'canvas' | 'api' | 'sql' | 'datasources' | 'code') => void;
  setLeftPanelTab: (tab: 'components' | 'pages' | 'queries' | 'apis' | 'layers') => void;
  setRightPanelTab: (tab: 'properties' | 'data' | 'logs' | 'settings') => void;
  
  // Component Actions
  addComponent: (component: ComponentData) => void;
  updateComponent: (id: string, updates: Partial<ComponentData>) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  selectComponent: (component: ComponentData | null) => void;
  setDraggedComponent: (component: ComponentType | null) => void;
  setCanvasScale: (scale: number) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  resizeComponent: (id: string, width: number, height: number) => void;
  updateAppSettings: (updates: { gridSize?: number; snapToGrid?: boolean }) => void;
  
  // Page Actions
  addPage: (page: AppPage) => void;
  updatePage: (id: string, updates: Partial<AppPage>) => void;
  deletePage: (id: string) => void;
  duplicatePage: (id: string) => void;
  setCurrentPage: (id: string) => void;
  
  // API Actions
  addApi: (api: ApiEndpoint) => void;
  updateApi: (id: string, updates: Partial<ApiEndpoint>) => void;
  deleteApi: (id: string) => void;
  duplicateApi: (id: string) => void;
  selectApi: (api: ApiEndpoint | null) => void;
  runApi: (id: string) => Promise<void>;
  runApiWithAuth: (id: string) => Promise<void>;
  addDemoApi: () => void;
  
  // SQL Actions
  addSqlQuery: (query: SqlQuery) => void;
  updateSqlQuery: (id: string, updates: Partial<SqlQuery>) => void;
  deleteSqlQuery: (id: string) => void;
  duplicateSqlQuery: (id: string) => void;
  selectSqlQuery: (query: SqlQuery | null) => void;
  runSqlQuery: (id: string) => Promise<void>;
  
  // Datasource Actions
  addDatasource: (datasource: Datasource) => void;
  updateDatasource: (id: string, updates: Partial<Datasource>) => void;
  deleteDatasource: (id: string) => void;
  selectDatasource: (datasource: Datasource | null) => void;
  testDatasourceConnection: (id: string) => Promise<boolean>;
  
  // Code Generation Actions
  generateCode: () => void;
  
  // Global State Actions
  updateGlobalState: (key: string, value: unknown) => void;
  
  // Settings Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateTheme: (theme: Theme) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const persisted = loadPersistedState();

  return {
  // UI State
  activeTab: 'canvas',
  leftPanelTab: 'components',
  rightPanelTab: 'properties',
  
  // Canvas State
  // If persisted components exist use them, otherwise try to load components from the persisted current page
  components: persisted?.components ?? (persisted?.pages?.find(p => p.id === persisted?.currentPageId)?.components ?? []),
  selectedComponent: null,
  draggedComponent: null,
  canvasScale: 1,
  gridSize: 20,
  snapToGrid: true,
  
  // Pages
  pages: persisted?.pages || [{
    id: 'page-1',
    name: 'Home',
    components: [],
    apis: [],
    queries: [],
    route: '/',
    isHomePage: true,
    seo: {
      title: 'Home Page',
      description: 'Welcome to our application'
    }
  }],
  currentPageId: persisted?.currentPageId || 'page-1',
  
  // API State
  apis: persisted?.apis || [],
  selectedApi: null,
  
  // SQL State
  sqlQueries: persisted?.sqlQueries || [],
  selectedQuery: null,
  
  // Datasources
  datasources: persisted?.datasources || [],
  selectedDatasource: null,
  
  // Code Generation
  generatedCode: {
    html: persisted?.generatedCode?.html || '',
    css: persisted?.generatedCode?.css || '',
    javascript: persisted?.generatedCode?.javascript || ''
  },
  
  // Global State
  globalState: persisted?.globalState || {},
  
  // App Settings
  settings: {
    theme: persisted?.settings?.theme || defaultTheme,
    responsive: true,
    rtl: false,
    animations: true,
    debugMode: false
  },
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  
  // Component Actions
  addComponent: (component) =>
    set((state) => ({
      components: [...state.components, component],
    })),

  updateComponent: (id, updates) =>
    set((state) => ({
      components: state.components.map((comp) =>
        comp.id === id ? { ...comp, ...updates } : comp
      ),
      selectedComponent:
        state.selectedComponent?.id === id
          ? { ...state.selectedComponent, ...updates }
          : state.selectedComponent,
    })),

  deleteComponent: (id) =>
    set((state) => ({
      components: state.components.filter((comp) => comp.id !== id),
      selectedComponent:
        state.selectedComponent?.id === id ? null : state.selectedComponent,
    })),

  duplicateComponent: (id) =>
    set((state) => {
      const component = state.components.find(c => c.id === id);
      if (!component) return state;
      
      const newComponent = {
        ...component,
        id: `${component.id}-copy-${Date.now()}`,
        x: component.x + 20,
        y: component.y + 20
      };
      
      return {
        components: [...state.components, newComponent]
      };
    }),

  selectComponent: (component) =>
    set({ selectedComponent: component }),

  setDraggedComponent: (component) =>
    set({ draggedComponent: component }),

  setCanvasScale: (scale) =>
    set({ canvasScale: scale }),

  updateAppSettings: (updates) =>
    set((state) => ({
      gridSize: updates.gridSize !== undefined ? updates.gridSize : state.gridSize,
      snapToGrid: updates.snapToGrid !== undefined ? updates.snapToGrid : state.snapToGrid,
    })),

  moveComponent: (id, x, y) =>
    set((state) => ({
      components: state.components.map((comp) =>
        comp.id === id ? { ...comp, x, y } : comp
      ),
    })),

  resizeComponent: (id, width, height) =>
    set((state) => ({
      components: state.components.map((comp) =>
        comp.id === id ? { ...comp, width, height } : comp
      ),
    })),
  
  // Page Actions
  addPage: (page) =>
    set((state) => {
      // persist current components back into the previous page
      const pagesSaved = state.pages.map((p) =>
        p.id === state.currentPageId ? { ...p, components: state.components } : p
      );

      const newPage: AppPage = {
        id: page.id || `page-${Date.now()}`,
        name: page.name || 'Untitled',
        components: page.components || [],
        apis: page.apis || [],
        queries: page.queries || [],
        route:
          page.route || `/${(page.name || 'page').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        isHomePage: page.isHomePage || false,
        seo: page.seo || { title: page.name || 'Untitled', description: '' },
      };

      return {
        pages: [...pagesSaved, newPage],
        currentPageId: newPage.id,
        // switch to new page and set its components (usually empty)
        components: newPage.components || [],
      };
    }),
  
  updatePage: (id, updates) =>
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === id ? { ...page, ...updates } : page
      ),
    })),
  
  deletePage: (id) =>
    set((state) => {
      const remaining = state.pages.filter((page) => page.id !== id);
      let newCurrent = state.currentPageId;
      let newComponents = state.components;

      if (state.currentPageId === id) {
        // we're deleting the current page — pick the first remaining page and load its components
        newCurrent = remaining[0]?.id || '';
        newComponents = remaining[0]?.components || [];
      }

      return {
        pages: remaining,
        currentPageId: newCurrent,
        components: newComponents,
      };
    }),

  duplicatePage: (id) =>
    set((state) => {
      // persist current components back into the current page before duplicating
      const pagesSaved = state.pages.map((p) =>
        p.id === state.currentPageId ? { ...p, components: state.components } : p
      );

      const page = pagesSaved.find(p => p.id === id);
      if (!page) return state;

      const newPage = {
        ...page,
        id: `${page.id}-copy-${Date.now()}`,
        name: `${page.name} Copy`,
        route: `${page.route}-copy`,
        isHomePage: false
      };

      return {
        pages: [...pagesSaved, newPage],
        // switch to the duplicated page and load its components
        currentPageId: newPage.id,
        components: newPage.components || [],
      };
    }),
  
  setCurrentPage: (id) =>
    set((state) => {
      // persist current components into the page we are leaving
      const pagesSaved = state.pages.map((p) =>
        p.id === state.currentPageId ? { ...p, components: state.components } : p
      );

      const page = pagesSaved.find(p => p.id === id);
      return {
        pages: pagesSaved,
        currentPageId: id,
        components: page ? page.components || [] : [],
      };
    }),
  
  // API Actions
  addApi: (api) =>
    set((state) => ({
      apis: [...state.apis, api],
    })),
  
  updateApi: (id, updates) =>
    set((state) => ({
      apis: state.apis.map((api) =>
        api.id === id ? { ...api, ...updates } : api
      ),
      selectedApi:
        state.selectedApi?.id === id
          ? { ...state.selectedApi, ...updates }
          : state.selectedApi,
    })),
  
  deleteApi: (id) =>
    set((state) => ({
      apis: state.apis.filter((api) => api.id !== id),
      selectedApi: state.selectedApi?.id === id ? null : state.selectedApi,
    })),

  duplicateApi: (id) =>
    set((state) => {
      const api = state.apis.find(a => a.id === id);
      if (!api) return state;
      
      const newApi = {
        ...api,
        id: `${api.id}-copy-${Date.now()}`,
        name: `${api.name} Copy`
      };
      
      return {
        apis: [...state.apis, newApi]
      };
    }),
  
  selectApi: (api) =>
    set({ selectedApi: api }),
  
  runApi: async (id: string) => {
    const state = get();
    const api = state.apis.find(a => a.id === id);
    if (!api) return;

    set((state) => ({
      apis: state.apis.map((a) =>
        a.id === id ? { ...a, isLoading: true, error: undefined } : a
      ),
    }));

    try {
      const context = {
        components: state.components,
        apis: state.apis,
        sqlQueries: state.sqlQueries,
        globalState: state.globalState
      };

      // Evaluate URL with expressions
      let finalUrl = evaluateExpression(api.url, context);

      // Evaluate params
      const params = api.params ? evaluateObjectExpressions(api.params, context) : {};

      // Add params to URL if GET request
      if (api.method === 'GET' && Object.keys(params).length > 0) {
        const urlObj = new URL(finalUrl);
        Object.entries(params).forEach(([key, value]) => {
          urlObj.searchParams.append(key, String(value));
        });
        finalUrl = urlObj.toString();
      }

      // Evaluate headers
      const headers = evaluateObjectExpressions(api.headers, context);

      // Evaluate body (ensure we only work with strings)
      let body: string | undefined = typeof api.body === 'string' ? api.body : undefined;
      if (body) {
        const evaluated = evaluateExpression(body, context);
        if (typeof evaluated === 'object') {
          body = JSON.stringify(evaluated);
        } else {
          body = String(evaluated ?? '');
        }
      }

      // Make the actual API call
      const response = await fetch(finalUrl, {
        method: api.method,
        headers,
        body: api.method !== 'GET' && body ? body : undefined
      });

      // Try to parse JSON, but fallback to text
      let data: unknown;
      try {
        data = await response.json();
      } catch (_err) {
        data = await response.text();
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      set((state) => ({
        apis: state.apis.map((a) =>
          a.id === id
            ? {
                ...a,
                isLoading: false,
                response: {
                  status: response.status,
                  headers: responseHeaders,
                  body: data,
                },
              }
            : a
        ),
      }));
    } catch (err) {
      set((state) => ({
        apis: state.apis.map((a) =>
          a.id === id ? { ...a, isLoading: false, error: (err as Error).message } : a
        ),
      }));
    }
  },
  
  // Add demo API for search users example
  addDemoApi: () => {
    const demoApi = {
      id: 'getUsersAPI',
      name: 'Get Users API',
      method: 'GET' as const,
      url: 'https://reqres.in/api/users',
      headers: {
        'Content-Type': 'application/json'
      },
      authentication: {
        type: 'none' as const
      }
    };
    
    set((state) => ({
      apis: [...state.apis, demoApi]
    }));
  },
  
  runApiWithAuth: async (id: string) => {
    const state = get();
    const api = state.apis.find(a => a.id === id);
    if (!api) return;
    
    set((state) => ({
      apis: state.apis.map((a) =>
        a.id === id ? { ...a, isLoading: true, error: undefined } : a
      ),
    }));
    
    try {
      // Build evaluation context and evaluate expressions in URL/params/headers/body
      const context = {
        components: state.components,
        apis: state.apis,
        sqlQueries: state.sqlQueries,
        globalState: state.globalState
      };

      let finalUrl = evaluateExpression(api.url, context);
      const params = api.params ? evaluateObjectExpressions(api.params, context) : {};

      if (api.method === 'GET' && Object.keys(params).length > 0) {
        const urlObj = new URL(finalUrl);
        Object.entries(params).forEach(([key, value]) => {
          urlObj.searchParams.append(key, String(value));
        });
        finalUrl = urlObj.toString();
      }

      // Evaluate headers and body
      const evaluatedHeaders = evaluateObjectExpressions(api.headers, context);
      let body: string | undefined = typeof api.body === 'string' ? api.body : undefined;
      if (body) {
        const evaluated = evaluateExpression(body, context);
        if (typeof evaluated === 'object') {
          body = JSON.stringify(evaluated);
        } else {
          body = String(evaluated ?? '');
        }
      }

      const headers: Record<string, string> = { ...(evaluatedHeaders || {}) };
      if (api.authentication?.type === 'bearer' && api.authentication.token) {
        headers['Authorization'] = `Bearer ${api.authentication.token}`;
      } else if (api.authentication?.type === 'api-key' && api.authentication.apiKey) {
        headers[api.authentication.apiKeyHeader || 'X-API-Key'] = api.authentication.apiKey;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), api.timeout || 30000);

      const response = await fetch(finalUrl, {
        method: api.method,
        headers,
        body: api.method !== 'GET' && body ? body : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: unknown;
      try {
        data = await response.json();
      } catch (_err) {
        data = await response.text();
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      set((state) => ({
        apis: state.apis.map((a) =>
          a.id === id
            ? {
                ...a,
                isLoading: false,
                response: {
                  status: response.status,
                  headers: responseHeaders,
                  body: data,
                },
              }
            : a
        ),
      }));
      } catch (err) {
      set((state) => ({
        apis: state.apis.map((a) =>
          a.id === id ? { ...a, isLoading: false, error: (err as Error).message } : a
        ),
      }));
    }
  },
  
  // SQL Actions
  addSqlQuery: (query) =>
    set((state) => ({
      sqlQueries: [...state.sqlQueries, query],
    })),
  
  updateSqlQuery: (id, updates) =>
    set((state) => ({
      sqlQueries: state.sqlQueries.map((query) =>
        query.id === id ? { ...query, ...updates } : query
      ),
      selectedQuery:
        state.selectedQuery?.id === id
          ? { ...state.selectedQuery, ...updates }
          : state.selectedQuery,
    })),
  
  deleteSqlQuery: (id) =>
    set((state) => ({
      sqlQueries: state.sqlQueries.filter((query) => query.id !== id),
      selectedQuery: state.selectedQuery?.id === id ? null : state.selectedQuery,
    })),

  duplicateSqlQuery: (id) =>
    set((state) => {
      const query = state.sqlQueries.find(q => q.id === id);
      if (!query) return state;
      
      const newQuery = {
        ...query,
        id: `${query.id}-copy-${Date.now()}`,
        name: `${query.name} Copy`
      };
      
      return {
        sqlQueries: [...state.sqlQueries, newQuery]
      };
    }),
  
  selectSqlQuery: (query) =>
    set({ selectedQuery: query }),
  
  runSqlQuery: async (id: string) => {
    const state = get();
    const query = state.sqlQueries.find(q => q.id === id);
    if (!query) return;
    
    set((state) => ({
      sqlQueries: state.sqlQueries.map((q) =>
        q.id === id ? { ...q, isLoading: true, error: undefined } : q
      ),
    }));
    
    try {
      // Simulate SQL query execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      const mockResult = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', created_at: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', created_at: '2024-01-16' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', created_at: '2024-01-17' },
      ];
      
      set((state) => ({
        sqlQueries: state.sqlQueries.map((q) =>
          q.id === id ? { ...q, isLoading: false, result: mockResult } : q
        ),
      }));
    } catch (_error) {
      set((state) => ({
        sqlQueries: state.sqlQueries.map((q) =>
          q.id === id ? { ...q, isLoading: false, error: (_error as Error).message } : q
        ),
      }));
    }
  },
  
  // Datasource Actions
  addDatasource: (datasource) =>
    set((state) => ({
      datasources: [...state.datasources, datasource],
    })),
  
  updateDatasource: (id, updates) =>
    set((state) => ({
      datasources: state.datasources.map((ds) =>
        ds.id === id ? { ...ds, ...updates } : ds
      ),
      selectedDatasource:
        state.selectedDatasource?.id === id
          ? { ...state.selectedDatasource, ...updates }
          : state.selectedDatasource,
    })),
  
  deleteDatasource: (id) =>
    set((state) => ({
      datasources: state.datasources.filter((ds) => ds.id !== id),
      selectedDatasource: state.selectedDatasource?.id === id ? null : state.selectedDatasource,
    })),
  
  selectDatasource: (datasource) =>
    set({ selectedDatasource: datasource }),
  
  testDatasourceConnection: async (id: string) => {
    const state = get();
    const datasource = state.datasources.find(ds => ds.id === id);
    if (!datasource) return false;
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      set((state) => ({
        datasources: state.datasources.map((ds) =>
          ds.id === id ? { ...ds, isConnected: true, lastTested: new Date() } : ds
        ),
      }));
      
      return true;
    } catch {
      set((state) => ({
        datasources: state.datasources.map((ds) =>
          ds.id === id ? { ...ds, isConnected: false, lastTested: new Date() } : ds
        ),
      }));
      
      return false;
    }
  },
  
  // Code Generation Actions
  generateCode: () => {
    const state = get();
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    if (!currentPage) return;
    
    // Generate HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentPage.seo?.title || currentPage.name}</title>
    <meta name="description" content="${currentPage.seo?.description || ''}">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
${state.components.map(component => `        <div class="component component-${component.type}" style="position: absolute; left: ${component.x}px; top: ${component.y}px; width: ${component.width}px; height: ${component.height}px;">
            ${generateComponentHTML(component)}
        </div>`).join('\n')}
    </div>
    <script src="script.js"></script>
</body>
</html>`;

    // Generate CSS
    const css = `/* Generated CSS */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${state.settings.theme.fonts.primary};
    background-color: ${state.settings.theme.colors.background};
    color: ${state.settings.theme.colors.text};
}

#app {
    position: relative;
    min-height: 100vh;
}

.component {
    position: absolute;
}

${state.components.map(component => generateComponentCSS(component)).join('\n')}`;

    // Generate JavaScript
    const javascript = `// Generated JavaScript
class AppBuilder {
    constructor() {
        this.state = ${JSON.stringify(state.globalState, null, 4)};
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadData();
    }
    
    bindEvents() {
        // Event bindings for components
${state.components.filter(c => c.events).map(component => 
    Object.entries(component.events || {}).map(([event, handler]) => 
        `        document.querySelector('[data-component-id="${component.id}"]')?.addEventListener('${event}', ${handler});`
    ).join('\n')
).join('\n')}
    }
    
    async loadData() {
        // API calls
${state.apis.map(api => `        // ${api.name}
        try {
            const response = await fetch('${api.url}', {
                method: '${api.method}',
                headers: ${JSON.stringify(api.headers, null, 16)}
            });
            const data = await response.json();
            this.state.${api.name.toLowerCase().replace(/\s+/g, '_')} = data;
        } catch (error) {
            console.error('Error loading ${api.name}:', error);
        }`).join('\n\n')}
    }
    
    updateComponent(id, data) {
        const element = document.querySelector(\`[data-component-id="\${id}"]\`);
        if (element) {
            // Update component with new data
            this.renderComponent(element, data);
        }
    }
    
    renderComponent(element, data) {
        // Component rendering logic
        element.innerHTML = JSON.stringify(data);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new AppBuilder();
});`;

    set({
      generatedCode: {
        html,
        css,
        javascript
      }
    });
  },
  
  // Global State Actions
  updateGlobalState: (key, value) =>
    set((state) => ({
      globalState: { ...state.globalState, [key]: value },
    })),
  
  // Settings Actions
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates }
    })),
  
  updateTheme: (theme) =>
    set((state) => ({
      settings: { ...state.settings, theme }
    })),
  };
});

// Persist store to localStorage on changes
if (typeof window !== 'undefined') {
  useAppStore.subscribe((state) => {
    savePersistedState({
      pages: state.pages,
      components: state.components,
      apis: state.apis,
      sqlQueries: state.sqlQueries,
      datasources: state.datasources,
      currentPageId: state.currentPageId,
      settings: state.settings,
      globalState: state.globalState,
      generatedCode: state.generatedCode,
    });
  });
}

// Helper functions for code generation
function generateComponentHTML(component: ComponentData): string {
  switch (component.type) {
    case 'button':
      return `<button data-component-id="${component.id}">${component.props.text || 'Button'}</button>`;
    case 'input':
      return `<input data-component-id="${component.id}" type="${component.props.type || 'text'}" placeholder="${component.props.placeholder || ''}" />`;
    case 'text':
      return `<div data-component-id="${component.id}">${component.props.content || 'Text'}</div>`;
    case 'image':
      return `<img data-component-id="${component.id}" src="${component.props.src || ''}" alt="${component.props.alt || ''}" />`;
    default:
      return `<div data-component-id="${component.id}">Component</div>`;
  }
}

function generateComponentCSS(component: ComponentData): string {
  const styles = Object.entries(component.style)
    .map(([key, value]) => `    ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
    .join('\n');
  
  return `[data-component-id="${component.id}"] {
${styles}
}`;
}