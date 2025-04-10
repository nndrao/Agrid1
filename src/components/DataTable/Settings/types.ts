export interface GridSettings {
  // Display and Layout
  rowHeight: number;
  headerHeight: number;
  pivotHeaderHeight: number;
  pivotGroupHeaderHeight: number;
  floatingFiltersHeight: number;
  suppressRowHoverHighlight: boolean;
  suppressCellSelection: boolean;
  suppressRowClickSelection: boolean;
  suppressScrollOnNewData: boolean;
  suppressColumnVirtualisation: boolean;
  suppressRowVirtualisation: boolean;
  domLayout: 'normal' | 'autoHeight' | 'print';
  ensureDomOrder: boolean;

  // Data and State
  pagination: boolean;
  paginationPageSize: number;
  cacheBlockSize: number;
  enableRangeSelection: boolean;
  enableRangeHandle: boolean;
  enableFillHandle: boolean;
  suppressRowDrag: boolean;
  suppressMovableColumns: boolean;

  // Selection
  rowSelection: 'single' | 'multiple';
  rowMultiSelectWithClick: boolean;
  rowDeselection: boolean;
  suppressRowDeselection: boolean;
  groupSelectsChildren: boolean;
  groupSelectsFiltered: boolean;

  // Editing
  editType: 'fullRow' | 'singleClick' | 'doubleClick';
  singleClickEdit: boolean;
  suppressClickEdit: boolean;
  enterMovesDown: boolean;
  enterMovesDownAfterEdit: boolean;
  undoRedoCellEditing: boolean;
  undoRedoCellEditingLimit: number;

  // Filtering
  floatingFilter: boolean;
  suppressMenuHide: boolean;
  quickFilterText: string;
  cacheQuickFilter: boolean;

  // Appearance
  theme: string;
  animateRows: boolean;
  enableBrowserTooltips: boolean;
  suppressContextMenu: boolean;
  suppressCopyRowsToClipboard: boolean;
  suppressCopySingleCellRanges: boolean;
  clipboardDelimiter: string;
  enableCellTextSelection: boolean;

  // Row Grouping
  groupDefaultExpanded: number;
  groupDisplayType: 'singleColumn' | 'multipleColumns' | 'groupRows' | 'custom';
  groupIncludeFooter: boolean;
  groupIncludeTotalFooter: boolean;
  showOpenedGroup: boolean;
  rowGroupPanelShow: boolean;
  enableRowGroup: boolean;
  suppressDragLeaveHidesColumns: boolean;

  // Sorting
  sortingOrder: string[];
  multiSortKey: string;
  accentedSort: boolean;
  unSortIcon: boolean;

  // Advanced Filtering
  excludeChildrenWhenTreeDataFiltering: boolean;
}

export interface SettingsSectionProps {
  settings: GridSettings;
  onSettingChange: <K extends keyof GridSettings>(key: K, value: GridSettings[K]) => void;
}