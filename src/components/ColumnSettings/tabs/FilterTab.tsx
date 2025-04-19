import React from 'react';
import { TabSection } from '../TabSection';
import { FormField } from '../FormField';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface FilterTabProps {
  // We'll add proper state management for this tab in a future step
}

export const FilterTab: React.FC<FilterTabProps> = () => {
  return (
    <TabSection 
      title="Filter" 
      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>}
    >
      <div className="flex flex-col gap-6">
        <div>
          <div className="font-semibold text-[14px] mb-2">Filter Type</div>
          <Select>
            <SelectTrigger className="h-8 text-[13px]">
              <SelectValue placeholder="Select filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Filter</SelectItem>
              <SelectItem value="number">Number Filter</SelectItem>
              <SelectItem value="date">Date Filter</SelectItem>
              <SelectItem value="set">Set Filter</SelectItem>
              <SelectItem value="multi">Multi Filter</SelectItem>
              <SelectItem value="custom">Custom Filter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Multi Filter Options */}
        <div>
          <div className="font-semibold text-[13px] mb-1">Multi Filter Configuration</div>
          <div className="flex flex-col gap-3">
            {/* List of filters */}
            <div className="flex flex-col gap-2">
              {/* Example filter rows - in real use, map over state */}
              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="h-8 text-[13px] w-40">
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" className="text-destructive" aria-label="Remove filter">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </Button>
              </div>
              {/* Add filter button */}
              <Button size="sm" variant="outline" className="w-fit mt-1">+ Add Filter</Button>
            </div>
            {/* Suppress Filter Buttons */}
            <div className="flex items-center gap-2">
              <Switch id="suppressFilterButtons" />
              <label htmlFor="suppressFilterButtons" className="text-xs">Suppress Filter Buttons</label>
            </div>
            {/* Read Only */}
            <div className="flex items-center gap-2">
              <Switch id="readOnlyMultiFilter" />
              <label htmlFor="readOnlyMultiFilter" className="text-xs">Read Only</label>
            </div>
          </div>
        </div>
        {/* Floating Filters Toggle */}
        <div className="flex items-center gap-2 mt-6">
          <Switch id="floatingFilters" />
          <label htmlFor="floatingFilters" className="text-xs font-medium">Enable Floating Filters</label>
        </div>
      </div>
    </TabSection>
  );
};
