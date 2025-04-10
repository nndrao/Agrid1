import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MonitorSmartphone,
  Database,
  MousePointer2,
  Edit3,
  Filter,
  Palette,
  FolderKanban,
  ArrowDownWideNarrow,
  Settings2,
  Save,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { SettingsSidebar } from "./SettingsSidebar";
import {
  DisplaySection,
  DataSection,
  SelectionSection,
  EditingSection,
  FilteringSection,
  AppearanceSection,
  GroupingSection,
  SortingSection,
} from "./sections";
import type { GridSettings } from "./types";
import { cn } from "@/lib/utils";

const sections = [
  { id: 'display', icon: MonitorSmartphone, label: 'Display & Layout', description: 'Configure visual layout and display options' },
  { id: 'data', icon: Database, label: 'Data & State', description: 'Manage data handling and state persistence' },
  { id: 'selection', icon: MousePointer2, label: 'Selection', description: 'Set up row and cell selection behavior' },
  { id: 'editing', icon: Edit3, label: 'Editing', description: 'Configure cell editing and validation' },
  { id: 'filtering', icon: Filter, label: 'Filtering', description: 'Customize filtering and search options' },
  { id: 'appearance', icon: Palette, label: 'Appearance', description: 'Adjust visual styling and themes' },
  { id: 'grouping', icon: FolderKanban, label: 'Row Grouping', description: 'Set up row grouping and aggregation' },
  { id: 'sorting', icon: ArrowDownWideNarrow, label: 'Sorting', description: 'Configure sorting behavior and options' },
];

interface GeneralSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplySettings?: (settings: GridSettings) => void;
}

export function GeneralSettingsDialog({ 
  open, 
  onOpenChange,
  onApplySettings 
}: GeneralSettingsDialogProps) {
  const [activeSection, setActiveSection] = useState('display');
  const [hasChanges, setHasChanges] = useState(false);
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
    setHasChanges(true);
  };

  const handleApply = () => {
    onApplySettings?.(settings);
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      // TODO: Show confirmation dialog
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const currentSection = sections.find(s => s.id === activeSection);

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'display':
        return <DisplaySection settings={settings} onSettingChange={handleSettingChange} />;
      case 'data':
        return <DataSection settings={settings} onSettingChange={handleSettingChange} />;
      case 'selection':
        return <SelectionSection settings={settings} onSettingChange={handleSettingChange} />;
      case 'editing':
        return <EditingSection settings={settings} onSettingChange={handleSettingChange} />;
      case 'filtering':
        return <FilteringSection settings={settings} onSettingChange={handleSettingChange} />;
      case 'appearance':
        return <AppearanceSection settings={settings} onSettingChange={handleSettingChange} />;
      case 'grouping':
        return <GroupingSection settings={settings} onSettingChange={handleSettingChange} />;
      case 'sorting':
        return <SortingSection settings={settings} onSettingChange={handleSettingChange} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[900px] p-0" hideCloseButton>
        <div className="flex h-[600px]">
          <SettingsSidebar
            sections={sections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between py-2 px-3 border-b bg-muted/40">
              <div className="flex items-center space-x-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-[14px] text-muted-foreground">Settings</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <h3 className="text-[14px] font-medium">{currentSection?.label}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 text-[14px]">
                {renderSectionContent()}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between py-2 px-3 border-t bg-muted/40">
              <div className="flex items-center space-x-2">
                {hasChanges && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-[14px] py-0">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  size="sm"
                  className="text-[14px]"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApply}
                  size="sm"
                  disabled={!hasChanges}
                  className="text-[14px]"
                >
                  <Save className="mr-2 h-3 w-3" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}