import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SettingsSectionProps } from "../types";

export function AppearanceSection({ settings, onSettingChange }: SettingsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Theme</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Configure visual appearance
          </p>

          <div>
            <Label className="font-medium">Grid Theme</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Choose the grid theme
            </p>
            <Select
              value={settings.theme}
              onValueChange={(value) => onSettingChange('theme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ag-theme-quartz">Quartz</SelectItem>
                <SelectItem value="ag-theme-quartz-dark">Quartz Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Animate Rows</Label>
              <p className="text-sm text-muted-foreground">
                Enable row animations
              </p>
            </div>
            <Switch
              checked={settings.animateRows}
              onCheckedChange={(value) => onSettingChange('animateRows', value)}
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
              onCheckedChange={(value) => onSettingChange('enableBrowserTooltips', value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Clipboard</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Configure clipboard behavior
          </p>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Copy Rows to Clipboard</Label>
              <p className="text-sm text-muted-foreground">
                Allow copying rows to clipboard
              </p>
            </div>
            <Switch
              checked={!settings.suppressCopyRowsToClipboard}
              onCheckedChange={(value) => onSettingChange('suppressCopyRowsToClipboard', !value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Copy Single Cell Ranges</Label>
              <p className="text-sm text-muted-foreground">
                Allow copying single cell ranges
              </p>
            </div>
            <Switch
              checked={!settings.suppressCopySingleCellRanges}
              onCheckedChange={(value) => onSettingChange('suppressCopySingleCellRanges', !value)}
            />
          </div>

          <div>
            <Label className="font-medium">Clipboard Delimiter</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Character to separate cells when copying
            </p>
            <Input
              value={settings.clipboardDelimiter}
              onChange={(e) => onSettingChange('clipboardDelimiter', e.target.value)}
              placeholder="\t"
            />
          </div>
        </div>
      </div>
    </div>
  );
}