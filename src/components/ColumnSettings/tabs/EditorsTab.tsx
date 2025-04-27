import React from 'react';
import { TabSection } from '../TabSection';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// This component doesn't need props yet
type EditorsTabProps = Record<string, never>;

export const EditorsTab: React.FC<EditorsTabProps> = () => {
  return (
    <TabSection 
      title="Editors" 
      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>}
    >
      <div className="flex flex-col gap-6">
        {/* Editor Types */}
        <div>
          <div className="font-semibold text-[14px] mb-2">Editor Type</div>
          <Select>
            <SelectTrigger className="h-8 text-[13px]">
              <SelectValue placeholder="Select editor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Editor</SelectItem>
              <SelectItem value="number">Number Editor</SelectItem>
              <SelectItem value="date">Date Editor</SelectItem>
              <SelectItem value="select">Select Editor</SelectItem>
              <SelectItem value="checkbox">Checkbox Editor</SelectItem>
              <SelectItem value="custom">Custom Editor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Editor Configuration */}
        <div>
          <div className="font-semibold text-[14px] mb-2">Editor Configuration</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Placeholder Text</label>
              <Input className="h-8 text-[13px]" placeholder="Enter placeholder..." />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Max Length</label>
              <Input type="number" className="h-8 text-[13px]" placeholder="255" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Read Only</label>
              <Switch />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Required</label>
              <Switch />
            </div>
          </div>
        </div>
        
        {/* Validation */}
        <div>
          <div className="font-semibold text-[14px] mb-2">Validation</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Validation Type</label>
              <Select>
                <SelectTrigger className="h-8 text-[13px]">
                  <SelectValue placeholder="Select validation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="regex">Regular Expression</SelectItem>
                  <SelectItem value="range">Range</SelectItem>
                  <SelectItem value="custom">Custom Function</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Error Message</label>
              <Input className="h-8 text-[13px]" placeholder="Invalid input" />
            </div>
          </div>
        </div>
      </div>
    </TabSection>
  );
};
