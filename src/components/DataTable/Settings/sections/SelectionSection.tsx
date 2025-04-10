import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SettingsSectionProps } from "../types";

export function SelectionSection({ settings, onSettingChange }: SettingsSectionProps) {
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
              onValueChange={(value) => onSettingChange('rowSelection', value as 'single' | 'multiple')}
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
              onCheckedChange={(value) => onSettingChange('rowMultiSelectWithClick', value)}
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
              onCheckedChange={(value) => onSettingChange('enableRangeSelection', value)}
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
              onCheckedChange={(value) => onSettingChange('enableRangeHandle', value)}
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
              onCheckedChange={(value) => onSettingChange('enableFillHandle', value)}
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
              onCheckedChange={(value) => onSettingChange('rowDeselection', value)}
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
              onCheckedChange={(value) => onSettingChange('suppressRowDeselection', value)}
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
              onCheckedChange={(value) => onSettingChange('groupSelectsChildren', value)}
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
              onCheckedChange={(value) => onSettingChange('groupSelectsFiltered', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}