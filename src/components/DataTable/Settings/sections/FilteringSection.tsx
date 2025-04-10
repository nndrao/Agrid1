import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { SettingsSectionProps } from "../types";

export function FilteringSection({ settings, onSettingChange }: SettingsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Filter UI</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Configure filter interface options
          </p>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Floating Filter</Label>
              <p className="text-sm text-muted-foreground">
                Show floating filter inputs
              </p>
            </div>
            <Switch
              checked={settings.floatingFilter}
              onCheckedChange={(value) => onSettingChange('floatingFilter', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Keep Menu Visible</Label>
              <p className="text-sm text-muted-foreground">
                Prevent filter menu from hiding
              </p>
            </div>
            <Switch
              checked={settings.suppressMenuHide}
              onCheckedChange={(value) => onSettingChange('suppressMenuHide', value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Quick Filter</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Configure quick filter settings
          </p>

          <div>
            <Label className="font-medium">Default Text</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Initial quick filter text
            </p>
            <Input
              value={settings.quickFilterText}
              onChange={(e) => onSettingChange('quickFilterText', e.target.value)}
              placeholder="Enter filter text..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Cache Quick Filter</Label>
              <p className="text-sm text-muted-foreground">
                Cache quick filter results
              </p>
            </div>
            <Switch
              checked={settings.cacheQuickFilter}
              onCheckedChange={(value) => onSettingChange('cacheQuickFilter', value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Advanced Filtering</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Configure advanced filter behavior
          </p>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Exclude Children in Tree Data</Label>
              <p className="text-sm text-muted-foreground">
                Filter out child nodes in tree data
              </p>
            </div>
            <Switch
              checked={settings.excludeChildrenWhenTreeDataFiltering}
              onCheckedChange={(value) => onSettingChange('excludeChildrenWhenTreeDataFiltering', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}