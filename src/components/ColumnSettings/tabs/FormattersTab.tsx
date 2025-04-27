import React from 'react';
import { TabSection } from '../TabSection';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// This component doesn't need props yet
type FormattersTabProps = Record<string, never>;

export const FormattersTab: React.FC<FormattersTabProps> = () => {
  return (
    <TabSection 
      title="Formatters" 
      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>}
    >
      <div className="flex flex-col gap-6">
        {/* Formatter Type Selection */}
        <div>
          <div className="font-semibold text-[14px] mb-2">Formatter Type</div>
          <Select>
            <SelectTrigger className="h-8 text-[13px]">
              <SelectValue placeholder="Select formatter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="percent">Percentage</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="datetime">Date & Time</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground mt-2">Select the type of formatter to apply to this column</div>
        </div>

        {/* Common Format Options */}
        <div>
          <div className="font-semibold text-[14px] mb-2">Format Options</div>
          <div className="space-y-4">
            {/* Number Format Options */}
            <div className="border border-border/80 rounded-md p-3">
              <div className="text-xs font-medium mb-2">Number Options</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Decimal Places</label>
                  <Input type="number" min={0} max={10} className="h-8 text-[13px]" placeholder="2" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Use Thousands Separator</label>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Date Format Options */}
            <div className="border border-border/80 rounded-md p-3">
              <div className="text-xs font-medium mb-2">Date Options</div>
              <div>
                <label className="block text-xs font-medium mb-1">Date Format</label>
                <Select>
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (MM/DD/YYYY)</SelectItem>
                    <SelectItem value="medium">Medium (Mon DD, YYYY)</SelectItem>
                    <SelectItem value="long">Long (Monday, Month DD, YYYY)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Text Format Options */}
            <div className="border border-border/80 rounded-md p-3">
              <div className="text-xs font-medium mb-2">Text Options</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Case</label>
                  <Select>
                    <SelectTrigger className="h-8 text-[13px]">
                      <SelectValue placeholder="Text case" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Change</SelectItem>
                      <SelectItem value="upper">UPPERCASE</SelectItem>
                      <SelectItem value="lower">lowercase</SelectItem>
                      <SelectItem value="title">Title Case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Max Length</label>
                  <Input type="number" className="h-8 text-[13px]" placeholder="No limit" />
                </div>
              </div>
            </div>

            {/* Boolean Format Options */}
            <div className="border border-border/80 rounded-md p-3">
              <div className="text-xs font-medium mb-2">Boolean Options</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">True Display</label>
                  <Input className="h-8 text-[13px]" placeholder="Yes" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">False Display</label>
                  <Input className="h-8 text-[13px]" placeholder="No" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <div className="font-semibold text-[14px] mb-2">Advanced Options</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Apply Conditional Formatting</label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Use Custom Formatter Function</label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Format Empty Values</label>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </TabSection>
  );
};
