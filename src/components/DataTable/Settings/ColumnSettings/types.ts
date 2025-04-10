export interface BorderSettings {
  width: number;
  style: string;
  color: string;
}

export interface BordersConfig {
  top: BorderSettings;
  right: BorderSettings;
  bottom: BorderSettings;
  left: BorderSettings;
}

export interface FontSettings {
  family: string;
  size: number;
  weight: string;
  style: string;
  color: string;
}

export interface CellAlignment {
  horizontal: 'left' | 'center' | 'right';
  vertical: 'top' | 'middle' | 'bottom';
}

export interface ColumnDefinition {
  id: string;
  field: string;
  headerName?: string;
  children: ColumnDefinition[];
  hidden?: boolean;
}

export interface ColumnState {
  visible: boolean;
  width: number;
  pinned: string | null;
  sort: string | null;
  position: number;
  headerName: string;
  field: string;
  filter: boolean;
  resizable: boolean;
  sortable: boolean;
  
  // Header customization
  headerAlignment: 'left' | 'center' | 'right';
  headerBackgroundColor: string;
  headerFont: FontSettings;
  headerBorders: BordersConfig;
  
  // Cell customization
  cellAlignment: CellAlignment;
  cellBackgroundColor: string;
  cellFont: FontSettings;
  cellBorders: BordersConfig;
}

export interface SettingsSectionProps {
  settings: any;
  onSettingChange: (key: string, value: any) => void;
}