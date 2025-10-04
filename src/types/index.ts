export interface ComponentData {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, any>;
  style: Record<string, any>;
  bindings?: Record<string, string>;
  events?: Record<string, ActionConfig>;
  customCSS?: string;
  customJS?: string;
  customHTML?: string;
}

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  icon: string;
  defaultProps: Record<string, any>;
  defaultStyle: Record<string, any>;
  defaultSize: { width: number; height: number };
  category: ComponentCategory;
  propertySchema: PropertySchema[];
}

export interface PropertySchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'textarea' | 'code' | 'url' | 'regex' | 'slider' | 'multiselect' | 'action';
  options?: string[] | { label: string; value: string }[];
  defaultValue?: any;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  section?: string;
  tooltip?: string;
  isJS?: boolean;
}

export type ComponentType = 
  | 'button'
  | 'input'
  | 'text'
  | 'image'
  | 'table'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'datepicker'
  | 'filepicker'
  | 'chart'
  | 'list'
  | 'container'
  | 'modal'
  | 'tabs'
  | 'customfunction'
  | 'currency'
  | 'phone'
  | 'richtext'
  | 'iconbutton'
  | 'buttongroup'
  | 'menu'
  | 'divider'
  | 'rating'
  | 'progress'
  | 'audio'
  | 'video'
  | 'map'
  | 'iframe'
  | 'card';

export interface CardProps {
  header: string;
  text: string;
  textColor: string;
  backgroundColor: string;
  queryId?: string;
  autoRefresh?: boolean;
  visible: boolean;
}

export interface CustomFunctionProps {
  html?: string;
  css?: string;
  javascript?: string;
  visible: boolean;
  animateLoading?: boolean;
  height?: number;
  props?: Record<string, any>;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  boxShadow?: string;
}

export type ComponentCategory = 'suggested' | 'inputs' | 'buttons' | 'display' | 'layout' | 'media' | 'lists';

// Action System
export interface ActionConfig {
  type: 'query' | 'js' | 'modal' | 'navigate' | 'alert' | 'download' | 'copy' | 'store' | 'remove' | 'none';
  target?: string;
  params?: Record<string, any>;
  confirmation?: {
    enabled: boolean;
    title?: string;
    message?: string;
  };
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: ActionConfig;
  onFailure?: ActionConfig;
}

// Button Properties (Appsmith-like)
export interface ButtonProps {
  // Basic
  label: string;
  tooltip?: string;
  visible: boolean;
  disabled: boolean;
  animateLoading: boolean;
  
  // Style
  variant: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  boxShadow: string;
  
  // Icon
  iconName?: string;
  iconAlign: 'left' | 'right';
  
  // Actions
  onClick?: ActionConfig;
  
  // Advanced
  googleRecaptchaKey?: string;
  googleRecaptchaVersion?: 'v2' | 'v3';
  disabledWhenInvalid: boolean;
  resetFormOnClick: boolean;
}

// Input Properties (Appsmith-like)
export interface InputProps {
  // Basic
  label: string;
  placeholder: string;
  defaultText: string;
  inputType: 'TEXT' | 'NUMBER' | 'PASSWORD' | 'EMAIL' | 'SEARCH' | 'PHONE' | 'CURRENCY';
  dataType: 'TEXT' | 'NUMBER' | 'DATE';
  visible: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  
  // Validation
  maxChars?: number;
  minNum?: number;
  maxNum?: number;
  regex?: string;
  errorMessage?: string;
  validationMessage?: string;
  
  // Behavior
  showStepArrows: boolean;
  allowCurrencyChange: boolean;
  decimalsInCurrency: number;
  defaultCurrency: string;
  phoneNumberCountryCode: string;
  autoFocus: boolean;
  spellCheck: boolean;
  resetOnSubmit: boolean;
  
  // Events
  onTextChanged?: ActionConfig;
  onFocusLost?: ActionConfig;
  onSubmit?: ActionConfig;
  
  // Style
  labelTextColor: string;
  labelTextSize: number;
  labelStyle: 'NORMAL' | 'ITALIC';
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  boxShadow: string;
  accentColor: string;
  backgroundColor: string;
}

// Text Properties (Appsmith-like)
export interface TextProps {
  // Basic
  text: string;
  textStyle: 'HEADING1' | 'HEADING2' | 'HEADING3' | 'BODY1' | 'BODY2' | 'CAPTION' | 'SUBTITLE1' | 'SUBTITLE2';
  textAlign: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY';
  textColor: string;
  fontSize: number;
  fontStyle: 'NORMAL' | 'ITALIC';
  fontWeight: 'NORMAL' | 'BOLD' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  visible: boolean;
  animateLoading: boolean;
  
  // Advanced
  overflow: 'NONE' | 'SCROLL' | 'TRUNCATE';
  shouldTruncate: boolean;
  
  // Style
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  boxShadow: string;
}

// Table Properties (Appsmith-like)
export interface TableProps {
  // Data
  tableData: any[];
  columns: TableColumn[];
  defaultSearchText: string;
  defaultSelectedRow: any;
  defaultPageSize: number;
  
  // Features
  showPagination: boolean;
  serverSidePagination: boolean;
  enableClientSideSearch: boolean;
  enableServerSideFiltering: boolean;
  multiRowSelection: boolean;
  defaultSelectedRows: any[];
  
  // Configuration
  primaryColumns: Record<string, TableColumn>;
  derivedColumns: Record<string, any>;
  columnOrder: string[];
  hiddenColumns: string[];
  frozenColumns: string[];
  columnWidths: Record<string, number>;
  sortOrder: { column: string; order: 'asc' | 'desc' }[];
  filters: any[];
  
  // Appearance
  visible: boolean;
  animateLoading: boolean;
  variant: 'DEFAULT' | 'VARIANT2' | 'VARIANT3';
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  boxShadow: string;
  accentColor: string;
  cellBackground: string;
  textColor: string;
  textSize: number;
  fontStyle: 'NORMAL' | 'ITALIC';
  horizontalAlignment: 'LEFT' | 'CENTER' | 'RIGHT';
  verticalAlignment: 'TOP' | 'CENTER' | 'BOTTOM';
  
  // Events
  onRowSelected?: ActionConfig;
  onPageChange?: ActionConfig;
  onSearchTextChanged?: ActionConfig;
  onSort?: ActionConfig;
}

export interface TableColumn {
  id: string;
  label: string;
  columnType: 'text' | 'number' | 'date' | 'image' | 'video' | 'url' | 'button' | 'menuButton' | 'iconButton' | 'select' | 'checkbox' | 'switch';
  computedValue?: string;
  isVisible: boolean;
  isDisabled: boolean;
  isCellVisible: boolean;
  isDerived: boolean;
  width: number;
  enableFilter: boolean;
  enableSort: boolean;
  sticky: '' | 'left' | 'right';
  textColor: string;
  textSize: number;
  fontStyle: 'NORMAL' | 'ITALIC';
  horizontalAlignment: 'LEFT' | 'CENTER' | 'RIGHT';
  verticalAlignment: 'TOP' | 'CENTER' | 'BOTTOM';
  cellBackground: string;
  buttonColor: string;
  buttonVariant: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  iconName?: string;
  menuItems?: any[];
  onClick?: ActionConfig;
}

// API and Data
export interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
  params?: Record<string, string>;
  authentication?: {
    type: 'none' | 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  transformer?: string;
  response?: any;
  isLoading?: boolean;
  error?: string;
  timeout?: number;
  retries?: number;
  confirmBeforeRun?: boolean;
}

export interface SqlQuery {
  id: string;
  name: string;
  query: string;
  datasource: string;
  result?: any[];
  isLoading?: boolean;
  error?: string;
  parameters?: Record<string, any>;
  timeout?: number;
  limit?: number;
  transformer?: string;
  confirmBeforeRun?: boolean;
}

export interface Datasource {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'rest-api' | 'graphql' | 'firebase' | 'supabase';
  config: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    url?: string;
    ssl?: boolean;
    apiKey?: string;
    projectId?: string;
  };
  isConnected?: boolean;
  lastTested?: Date;
}

export interface AppPage {
  id: string;
  name: string;
  components: ComponentData[];
  apis: string[];
  queries: string[];
  route?: string;
  isHomePage?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface GlobalState {
  [key: string]: any;
}

export interface CodeGeneration {
  html: string;
  css: string;
  javascript: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface AppSettings {
  theme: Theme;
  responsive: boolean;
  rtl: boolean;
  animations: boolean;
  debugMode: boolean;
}

export interface ChartSeries {
  title: string;
  color: string;
  data: string;
}

export interface ChartProps {
  title: string;
  chartType: 'line' | 'bar' | 'pie' | 'column' | 'area' | 'custom';
  chartData?: string;
  series: ChartSeries[];
  xAxisName: string;
  yAxisName: string;
  visible: boolean;
  animateLoading: boolean;
  allowScroll: boolean;
  showDataLabels: boolean;
  showLegend: boolean;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  customEChartsConfig?: string;
  customFusionChartsConfig?: string;
  labelOrientation: 'auto' | 'horizontal' | 'vertical' | 'slant';
  labelTextSize: number;
  gridLineColor: string;
  enableTooltip: boolean;
  onDataPointClick?: string;
}