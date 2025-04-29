import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GeneralTab } from './tabs/GeneralTab';
import { HeaderTab } from './tabs/HeaderTab';
import { CellTab } from './tabs/CellTab';
import { FilterTab } from './tabs/FilterTab';
import { EditorsTab } from './tabs/EditorsTab';
import { ColumnSettingsState } from './useColumnSettings';

interface TabsWrapperProps {
  state: ColumnSettingsState;
  updateGeneral: (updates: Partial<ColumnSettingsState['general']>) => void;
  updateHeader: (updates: Partial<ColumnSettingsState['header']>) => void;
  updateCell: (updates: Partial<ColumnSettingsState['cell']>) => void;
  selectedColumn: string;
}

export const TabsWrapper: React.FC<TabsWrapperProps> = ({
  state,
  updateGeneral,
  updateHeader,
  updateCell,
  selectedColumn
}) => {
  const [activeTab, setActiveTab] = useState("general");

  // Update local state only when the parent state changes
  // We don't need a separate local state that duplicates the parent state
  // Instead, we'll use the parent state directly
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('TabsWrapper: state prop changed', state);
    }
  }, [state]);

  // Create wrapper functions for updates - memoized to prevent unnecessary rerenders
  // These functions now only update the parent state and don't maintain a duplicate local state
  const handleUpdateGeneral = useCallback((updates: Partial<ColumnSettingsState['general']>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('TabsWrapper: handleUpdateGeneral', updates);
    }
    updateGeneral(updates);
  }, [updateGeneral]);

  const handleUpdateHeader = useCallback((updates: Partial<ColumnSettingsState['header']>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('TabsWrapper: handleUpdateHeader', updates);
    }
    updateHeader(updates);
  }, [updateHeader]);

  const handleUpdateCell = useCallback((updates: Partial<ColumnSettingsState['cell']>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('TabsWrapper: handleUpdateCell', updates);
    }
    updateCell(updates);
  }, [updateCell]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="mb-2 gap-1 bg-card border border-border/80 rounded-lg p-1 h-9">
        <TabsTrigger value="general" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">General</TabsTrigger>
        <TabsTrigger value="header" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Header</TabsTrigger>
        <TabsTrigger value="cell" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Cell</TabsTrigger>
        <TabsTrigger value="filter" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Filter</TabsTrigger>
        <TabsTrigger value="editors" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Editors</TabsTrigger>
      </TabsList>

      {/* Tab Contents */}
      <TabsContent
        value="general"
        className="pt-1 overflow-y-auto"
        style={{ maxHeight: 680 }}
        onFocus={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <GeneralTab
          settings={state.general}
          onUpdate={handleUpdateGeneral}
          selectedColumn={selectedColumn}
        />
      </TabsContent>

      <TabsContent
        value="header"
        className="pt-1 overflow-y-auto"
        style={{ maxHeight: 680 }}
        onFocus={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <HeaderTab
          settings={state.header}
          onUpdate={handleUpdateHeader}
        />
      </TabsContent>

      <TabsContent
        value="cell"
        className="pt-1 overflow-y-auto"
        style={{ maxHeight: 680 }}
        onFocus={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <CellTab
          settings={state.cell}
          onUpdate={handleUpdateCell}
        />
      </TabsContent>

      <TabsContent
        value="filter"
        className="pt-1 overflow-y-auto"
        style={{ maxHeight: 680 }}
        onFocus={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <FilterTab />
      </TabsContent>


      <TabsContent
        value="editors"
        className="pt-1 overflow-y-auto"
        style={{ maxHeight: 680 }}
        onFocus={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <EditorsTab />
      </TabsContent>
      {/* End of Tab Contents */}
    </Tabs>
  );
};
