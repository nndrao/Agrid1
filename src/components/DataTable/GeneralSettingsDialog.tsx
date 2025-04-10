import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Settings2,
  ChevronRight,
  MonitorSmartphone,
  Database,
  MousePointer2,
  Edit3,
  Filter,
  Palette,
  FolderKanban,
  ArrowDownWideNarrow,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface GridSettings {
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

interface GeneralSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplySettings?: (settings: GridSettings) => void;
}

const sections = [
  { id: 'display', icon: MonitorSmartphone, label: 'Display & Layout' },
  { id: 'data', icon: Database, label: 'Data & State' },
  { id: 'selection', icon: MousePointer2, label: 'Selection' },
  { id: 'editing', icon: Edit3, label: 'Editing' },
  { id: 'filtering', icon: Filter, label: 'Filtering' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'grouping', icon: FolderKanban, label: 'Row Grouping' },
  { id: 'sorting', icon: ArrowDownWideNarrow, label: 'Sorting' },
];

export function GeneralSettingsDialog({ 
  open, 
  onOpenChange,
  onApplySettings 
}: GeneralSettingsDialogProps) {
  const [activeSection, setActiveSection] = useState('display');
  const [settings, setSettings] = useState<GridSettings>({
    // Display and Layout
    rowHeight: 48,
    headerHeight: 45,
    pivotHeaderHeight: 32,
    pivotGroupHeaderHeight: 32,
    floatingFiltersHeight: 32,
    suppressRowHoverHighlight: false,
    suppressCellSelection: false,
    suppressRowClickSelection: false,
    suppressScrollOnNewData: false,
    suppressColumnVirtualisation: false,
    suppressRowVirtualisation: false,
    domLayout: 'normal',
    ensureDomOrder: false,

    // Data and State
    pagination: true,
    paginationPageSize: 100,
    cacheBlockSize: 100,
    enableRangeSelection: true,
    enableRangeHandle: true,
    enableFillHandle: true,
    suppressRowDrag: false,
    suppressMovableColumns: false,

    // Selection
    rowSelection: 'multiple',
    rowMultiSelectWithClick: false,
    rowDeselection: true,
    suppressRowDeselection: false,
    groupSelectsChildren: true,
    groupSelectsFiltered: true,

    // Editing
    editType: 'doubleClick',
    singleClickEdit: false,
    suppressClickEdit: false,
    enterMovesDown: true,
    enterMovesDownAfterEdit: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 10,

    // Filtering
    floatingFilter: true,
    suppressMenuHide: false,
    quickFilterText: '',
    cacheQuickFilter: true,

    // Appearance
    theme: 'ag-theme-quartz',
    animateRows: true,
    enableBrowserTooltips: false,
    suppressContextMenu: false,
    suppressCopyRowsToClipboard: false,
    suppressCopySingleCellRanges: false,
    clipboardDelimiter: '\t',
    enableCellTextSelection: true,

    // Row Grouping
    groupDefaultExpanded: 0,
    groupDisplayType: 'groupRows',
    groupIncludeFooter: false,
    groupIncludeTotalFooter: false,
    showOpenedGroup: true,
    rowGroupPanelShow: true,
    enableRowGroup: true,
    suppressDragLeaveHidesColumns: false,

    // Sorting
    sortingOrder: ['asc', 'desc', null],
    multiSortKey: 'ctrl',
    accentedSort: false,
    unSortIcon: false,

    // Advanced Filtering
    excludeChildrenWhenTreeDataFiltering: false,
  });

  const handleSettingChange = <K extends keyof GridSettings>(
    key: K,
    value: GridSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onApplySettings?.(settings);
    onOpenChange(false);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'display':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Row Height</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Adjust the height of grid rows in pixels
                  </p>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.rowHeight]}
                      onValueChange={([value]) => handleSettingChange('rowHeight', value)}
                      min={24}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm">{settings.rowHeight}px</span>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Header Height</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Set the height of column headers
                  </p>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.headerHeight]}
                      onValueChange={([value]) => handleSettingChange('headerHeight', value)}
                      min={24}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm">{settings.headerHeight}px</span>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">DOM Layout</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose how the grid DOM is structured
                  </p>
                  <Select
                    value={settings.domLayout}
                    onValueChange={(value) => handleSettingChange('domLayout', value as 'normal' | 'autoHeight' | 'print')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="autoHeight">Auto Height</SelectItem>
                      <SelectItem value="print">Print</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Display Options</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure grid display behavior
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Row Hover Highlight</Label>
                      <p className="text-sm text-muted-foreground">
                        Highlight rows on mouse hover
                      </p>
                    </div>
                    <Switch
                      checked={!settings.suppressRowHoverHighlight}
                      onCheckedChange={(value) => handleSettingChange('suppressRowHoverHighlight', !value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Cell Selection</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow selecting individual cells
                      </p>
                    </div>
                    <Switch
                      checked={!settings.suppressCellSelection}
                      onCheckedChange={(value) => handleSettingChange('suppressCellSelection', !value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Row Click Selection</Label>
                      <p className="text-sm text-muted-foreground">
                        Select rows by clicking
                      </p>
                    </div>
                    <Switch
                      checked={!settings.suppressRowClickSelection}
                      onCheckedChange={(value) => handleSettingChange('suppressRowClickSelection', !value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Pagination</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure pagination settings
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Enable Pagination</Label>
                    <p className="text-sm text-muted-foreground">
                      Split data into pages
                    </p>
                  </div>
                  <Switch
                    checked={settings.pagination}
                    onCheckedChange={(value) => handleSettingChange('pagination', value)}
                  />
                </div>

                <div>
                  <Label className="font-medium">Page Size</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Number of rows per page
                  </p>
                  <Input
                    type="number"
                    value={settings.paginationPageSize}
                    onChange={(e) => handleSettingChange('paginationPageSize', parseInt(e.target.value))}
                    min={1}
                  />
                </div>

                <div>
                  <Label className="font-medium">Cache Block Size</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Number of rows to load at once for infinite scrolling
                  </p>
                  <Input
                    type="number"
                    value={settings.cacheBlockSize}
                    onChange={(e) => handleSettingChange('cacheBlockSize', parseInt(e.target.value))}
                    min={1}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Movement Options</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure row and column movement
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Row Drag</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow dragging rows
                    </p>
                  </div>
                  <Switch
                    checked={!settings.suppressRowDrag}
                    onCheckedChange={(value) => handleSettingChange('suppressRowDrag', !value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Movable Columns</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow reordering columns
                    </p>
                  </div>
                  <Switch
                    checked={!settings.suppressMovableColumns}
                    onCheckedChange={(value) => handleSettingChange('suppressMovableColumns', !value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'selection':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Selection Mode</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure row selection behavior
                </p>

                <div>
                  <Label className="font-medium">Selection Type</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose how rows can be selected
                  </p>
                  <Select
                    value={settings.rowSelection}
                    onValueChange={(value) => handleSettingChange('rowSelection', value as 'single' | 'multiple')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Row</SelectItem>
                      <SelectItem value="multiple">Multiple Rows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Multi-Select with Click</Label>
                    <p className="text-sm text-muted-foreground">
                      Select multiple rows with single click
                    </p>
                  </div>
                  <Switch
                    checked={settings.rowMultiSelectWithClick}
                    onCheckedChange={(value) => handleSettingChange('rowMultiSelectWithClick', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Range Selection</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure range selection features
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Enable Range Selection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow selecting cell ranges
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableRangeSelection}
                    onCheckedChange={(value) => handleSettingChange('enableRangeSelection', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Range Handle</Label>
                    <p className="text-sm text-muted-foreground">
                      Show range selection handle
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableRangeHandle}
                    onCheckedChange={(value) => handleSettingChange('enableRangeHandle', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Fill Handle</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable fill handle for drag-fill
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableFillHandle}
                    onCheckedChange={(value) => handleSettingChange('enableFillHandle', value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Deselection</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure row deselection behavior
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Allow Deselection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow deselecting rows
                    </p>
                  </div>
                  <Switch
                    checked={settings.rowDeselection}
                    onCheckedChange={(value) => handleSettingChange('rowDeselection', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Suppress Deselection</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent row deselection
                    </p>
                  </div>
                  <Switch
                    checked={settings.suppressRowDeselection}
                    onCheckedChange={(value) => handleSettingChange('suppressRowDeselection', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Group Selection</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure group selection behavior
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Select Children</Label>
                    <p className="text-sm text-muted-foreground">
                      Select all children when group is selected
                    </p>
                  </div>
                  <Switch
                    checked={settings.groupSelectsChildren}
                    onCheckedChange={(value) => handleSettingChange('groupSelectsChildren', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Select Filtered</Label>
                    <p className="text-sm text-muted-foreground">
                      Include filtered rows in group selection
                    </p>
                  </div>
                  <Switch
                    checked={settings.groupSelectsFiltered}
                    onCheckedChange={(value) => handleSettingChange('groupSelectsFiltered', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'editing':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Edit Mode</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure cell editing behavior
                </p>

                <div>
                  <Label className="font-medium">Edit Type</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose how cells enter edit mode
                  </p>
                  <Select
                    value={settings.editType}
                    onValueChange={(value) => handleSettingChange('editType', value as 'fullRow' | 'singleClick' | 'doubleClick')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullRow">Full Row</SelectItem>
                      <SelectItem value="singleClick">Single Click</SelectItem>
                      <SelectItem value="doubleClick">Double Click</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Single Click Edit</Label>
                    <p className="text-sm text-muted-foreground">
                      Enter edit mode with single click
                    </p>
                  </div>
                  <Switch
                    checked={settings.singleClickEdit}
                    onCheckedChange={(value) => handleSettingChange('singleClickEdit', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Suppress Click Edit</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent click editing
                    </p>
                  </div>
                  <Switch
                    checked={settings.suppressClickEdit}
                    onCheckedChange={(value) => handleSettingChange('suppressClickEdit', value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Navigation</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure editing navigation
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Enter Moves Down</Label>
                    <p className="text-sm text-muted-foreground">
                      Move down on Enter key
                    </p>
                  </div>
                  <Switch
                    checked={settings.enterMovesDown}
                    onCheckedChange={(value) => handleSettingChange('enterMovesDown', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Enter Moves Down After Edit</Label>
                    <p className="text-sm text-muted-foreground">
                      Move down after editing
                    </p>
                  </div>
                  <Switch
                    checked={settings.enterMovesDownAfterEdit}
                    onCheckedChange={(value) => handleSettingChange('enterMovesDownAfterEdit', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Undo/Redo</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure undo/redo functionality
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Enable Undo/Redo</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow undoing and redoing edits
                    </p>
                  </div>
                  <Switch
                    checked={settings.undoRedoCellEditing}
                    onCheckedChange={(value) => handleSettingChange('undoRedoCellEditing', value)}
                  />
                </div>

                <div>
                  <Label className="font-medium">Undo/Redo Steps</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Number of undo/redo steps to keep
                  </p>
                  <Input
                    type="number"
                    value={settings.undoRedoCellEditingLimit}
                    onChange={(e) => handleSettingChange('undoRedoCellEditingLimit', parseInt(e.target.value))}
                    min={1}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'filtering':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Filter UI</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure filter interface options
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Floating Filter</Label>
                    <p className="text-sm text-muted-foreground">
                      Show floating filter inputs
                    </p>
                  </div>
                  <Switch
                    checked={settings.floatingFilter}
                    onCheckedChange={(value) => handleSettingChange('floatingFilter', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Keep Menu Visible</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent filter menu from hiding
                    </p>
                  </div>
                  <Switch
                    checked={settings.suppressMenuHide}
                    onCheckedChange={(value) => handleSettingChange('suppressMenuHide', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Quick Filter</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure quick filter settings
                </p>

                <div>
                  <Label className="font-medium">Default Text</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Initial quick filter text
                  </p>
                  <Input
                    value={settings.quickFilterText}
                    onChange={(e) => handleSettingChange('quickFilterText', e.target.value)}
                    placeholder="Enter filter text..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Cache Quick Filter</Label>
                    <p className="text-sm text-muted-foreground">
                      Cache quick filter results
                    </p>
                  </div>
                  <Switch
                    checked={settings.cacheQuickFilter}
                    onCheckedChange={(value) => handleSettingChange('cacheQuickFilter', value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Advanced Filtering</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure advanced filter behavior
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Exclude Children in Tree Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Filter out child nodes in tree data
                    </p>
                  </div>
                  <Switch
                    checked={settings.excludeChildrenWhenTreeDataFiltering}
                    onCheckedChange={(value) => handleSettingChange('excludeChildrenWhenTreeDataFiltering', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Visual Effects</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure visual appearance
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Animate Rows</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable row animations
                    </p>
                  </div>
                  <Switch
                    checked={settings.animateRows}
                    onCheckedChange={(value) => handleSettingChange('animateRows', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Browser Tooltips</Label>
                    <p className="text-sm text-muted-foreground">
                      Use browser native tooltips
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableBrowserTooltips}
                    onCheckedChange={(value) => handleSettingChange('enableBrowserTooltips', value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Context Menu</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure context menu behavior
                </p>

                <div className="flex items-center justify-between">
                  <div