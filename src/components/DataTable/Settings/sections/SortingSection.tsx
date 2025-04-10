import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SettingsSectionProps } from "../types";

export function SortingSection({ settings, onSettingChange }: SettingsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Sort Options</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Configure sorting behavior
          </p>

          <div>
            <Label className="font-medium">Multi-Sort Key</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Key to hold for multi-column sorting
            </p>
            <Select
              value={settings.multiSortKey}
              onValueChange={(value) => onSettingChange('multiSortKey', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ctrl">Ctrl/Cmd</SelectItem>
                <SelectItem value="shift">Shift</SelectItem>
                <SelectItem value="alt">Alt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Accented Sort</Label>
              <p className="text-sm text-muted-foreground">
                Consider accents when sorting
              </p>
            </div>
            <Switch
              checked={settings.accentedSort}
              onCheckedChange={(value) => onSettingChange('accentedSort', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Show Unsort Icon</Label>
              <p className="text-sm text-muted-foreground">
                Display icon for unsorted state
              </p>
            </div>
            <Switch
              checked={settings.unSortIcon}
              onCheckedChange={(value) => onSettingChange('unSortIcon', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}