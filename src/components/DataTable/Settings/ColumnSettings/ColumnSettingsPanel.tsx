import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import HeaderSettings from './HeaderSettings';
import FormattingSettings from './FormattingSettings';
import StyleSettings from './StyleSettings';
import FilterSettings from './FilterSettings';
import ComponentSettings from './ComponentSettings';
import { ColumnState } from './types';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColumnSettingsPanelProps {
  column: ColumnState;
  onColumnChange: (column: ColumnState) => void;
  sampleData?: any[];
}

const ColumnSettingsPanel: React.FC<ColumnSettingsPanelProps> = ({ 
  column, 
  onColumnChange,
  sampleData = []
}) => {
  const [activeTab, setActiveTab] = useState('header');
  
  useEffect(() => {
    console.log('ColumnSettingsPanel rendered with column:', column?.field);
  }, [column]);

  if (!column) {
    console.warn('No column provided to ColumnSettingsPanel');
    return <div className="p-6">No column selected</div>;
  }

  const handleColumnChange = (updatedColumn: ColumnState) => {
    console.log('Column updated:', updatedColumn?.field, updatedColumn);
    onColumnChange(updatedColumn);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium mb-1">
          Column Settings: {column.headerName || column.field}
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure how this column appears and behaves in the data table
        </p>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="px-4 pt-2 border-b justify-start">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="formatting">Formatting</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="filter">Filter</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <TabsContent value="header" className="p-0 mt-0">
            <HeaderSettings column={column} onColumnChange={handleColumnChange} />
          </TabsContent>
          
          <TabsContent value="formatting" className="p-0 mt-0">
            <FormattingSettings column={column} onColumnChange={handleColumnChange} />
          </TabsContent>
          
          <TabsContent value="style" className="p-0 mt-0">
            <StyleSettings column={column} onColumnChange={handleColumnChange} />
          </TabsContent>
          
          <TabsContent value="filter" className="p-0 mt-0">
            <FilterSettings column={column} onColumnChange={handleColumnChange} />
          </TabsContent>
          
          <TabsContent value="components" className="p-0 mt-0">
            <ComponentSettings column={column} onColumnChange={handleColumnChange} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default ColumnSettingsPanel; 