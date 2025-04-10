import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SettingsSectionProps } from "../types";

export function DisplaySection({ settings, onSettingChange }: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Row Height Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
            <span className="text-[12px] font-medium text-primary">Rh</span>
          </div>
          <div>
            <h4 className="text-[14px] font-medium">Row Height</h4>
            <p className="text-[12px] text-muted-foreground">
              Adjust the height of grid rows in pixels
            </p>
          </div>
        </div>
        <div className="pl-8">
          <div className="flex items-center space-x-4">
            <Slider
              value={[settings.rowHeight]}
              onValueChange={([value]) => onSettingChange('rowHeight', value)}
              min={24}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="w-12 text-[12px] tabular-nums text-muted-foreground">
              {settings.rowHeight}px
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Header Height Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
            <span className="text-[12px] font-medium text-primary">Hh</span>
          </div>
          <div>
            <h4 className="text-[14px] font-medium">Header Height</h4>
            <p className="text-[12px] text-muted-foreground">
              Set the height of column headers
            </p>
          </div>
        </div>
        <div className="pl-8">
          <div className="flex items-center space-x-4">
            <Slider
              value={[settings.headerHeight]}
              onValueChange={([value]) => onSettingChange('headerHeight', value)}
              min={24}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="w-12 text-[12px] tabular-nums text-muted-foreground">
              {settings.headerHeight}px
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* DOM Layout Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
            <span className="text-[12px] font-medium text-primary">DL</span>
          </div>
          <div>
            <h4 className="text-[14px] font-medium">DOM Layout</h4>
            <p className="text-[12px] text-muted-foreground">
              Choose how the grid DOM is structured
            </p>
          </div>
        </div>
        <div className="pl-8">
          <Select
            value={settings.domLayout}
            onValueChange={(value) => onSettingChange('domLayout', value as 'normal' | 'autoHeight' | 'print')}
          >
            <SelectTrigger className="w-[180px] text-[14px]">
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

      <Separator />

      {/* Display Options */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
            <span className="text-[12px] font-medium text-primary">DO</span>
          </div>
          <div>
            <h4 className="text-[14px] font-medium">Display Options</h4>
            <p className="text-[12px] text-muted-foreground">
              Configure grid display behavior
            </p>
          </div>
        </div>
        <div className="pl-8 space-y-3">
          <div className="flex items-center justify-between group">
            <div>
              <Label className="text-[14px] font-medium">Row Hover Highlight</Label>
              <p className="text-[12px] text-muted-foreground">
                Highlight rows on mouse hover
              </p>
            </div>
            <Switch
              checked={!settings.suppressRowHoverHighlight}
              onCheckedChange={(value) => onSettingChange('suppressRowHoverHighlight', !value)}
            />
          </div>

          <div className="flex items-center justify-between group">
            <div>
              <Label className="text-[14px] font-medium">Cell Selection</Label>
              <p className="text-[12px] text-muted-foreground">
                Allow selecting individual cells
              </p>
            </div>
            <Switch
              checked={!settings.suppressCellSelection}
              onCheckedChange={(value) => onSettingChange('suppressCellSelection', !value)}
            />
          </div>

          <div className="flex items-center justify-between group">
            <div>
              <Label className="text-[14px] font-medium">Row Click Selection</Label>
              <p className="text-[12px] text-muted-foreground">
                Select rows by clicking
              </p>
            </div>
            <Switch
              checked={!settings.suppressRowClickSelection}
              onCheckedChange={(value) => onSettingChange('suppressRowClickSelection', !value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}