import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GeneralTab } from './tabs/GeneralTab';
import { HeaderTab } from './tabs/HeaderTab';
import { CellTab } from './tabs/CellTab';
import { FilterTab } from './tabs/FilterTab';
import { FormattersTab } from './tabs/FormattersTab';
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
  const [localState, setLocalState] = useState<ColumnSettingsState>(state);

  // Update local state when props change
  useEffect(() => {
    console.log('TabsWrapper: state prop changed', state);
    // Create a deep copy of the state to avoid reference issues
    const stateCopy = JSON.parse(JSON.stringify(state));
    setLocalState(stateCopy);
  }, [state]);

  // Create wrapper functions for updates
  const handleUpdateGeneral = (updates: Partial<ColumnSettingsState['general']>) => {
    console.log('TabsWrapper: handleUpdateGeneral', updates);
    // Update local state first
    setLocalState(prev => {
      // Create a deep copy of the previous state to avoid reference issues
      const prevCopy = JSON.parse(JSON.stringify(prev));
      return {
        ...prevCopy,
        general: {
          ...prevCopy.general,
          ...updates
        }
      };
    });
    // Then update parent state
    updateGeneral(updates);
  };

  const handleUpdateHeader = (updates: Partial<ColumnSettingsState['header']>) => {
    console.log('TabsWrapper: handleUpdateHeader', updates);
    // Update local state first
    setLocalState(prev => {
      // Create a deep copy of the previous state to avoid reference issues
      const prevCopy = JSON.parse(JSON.stringify(prev));
      return {
        ...prevCopy,
        header: {
          ...prevCopy.header,
          ...updates
        }
      };
    });
    // Then update parent state
    updateHeader(updates);
  };

  const handleUpdateCell = (updates: Partial<ColumnSettingsState['cell']>) => {
    console.log('TabsWrapper: handleUpdateCell', updates);
    // Update local state first
    setLocalState(prev => {
      // Create a deep copy of the previous state to avoid reference issues
      const prevCopy = JSON.parse(JSON.stringify(prev));
      return {
        ...prevCopy,
        cell: {
          ...prevCopy.cell,
          ...updates
        }
      };
    });
    // Then update parent state
    updateCell(updates);
  };

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
        <TabsTrigger value="formatters" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Formatters</TabsTrigger>
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
          settings={localState.general}
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
          settings={localState.header}
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
          settings={localState.cell}
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
        value="formatters"
        className="pt-1 overflow-y-auto"
        style={{ maxHeight: 680 }}
        onFocus={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <FormattersTab />
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
