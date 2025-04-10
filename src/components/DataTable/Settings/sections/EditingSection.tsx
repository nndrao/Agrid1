import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SettingsSectionProps } from "../types";

export function EditingSection({ settings, onSettingChange }: SettingsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Edit Mode</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Configure cell editing behavior
          </p>

          <div>
            <Label className="font-medium">Edit Type</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Choose how cells enter edit mode
            </p>
            <Select
              value={settings.editType}
              onValueChange={(value) => onSettingChange('editType', value as 'fullRow' | 'singleClick' | 'doubleClick')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fullRow">Full Row</SelectItem>
                <SelectItem value="singleClick">Single Click</SelectItem>
                <SelectItem value="doubleClick">Double Click</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Single Click Edit</Label>
              <p className="text-sm text-muted-foreground">
                Enter edit mode with single click
              </p>
            </div>
            <Switch
              checked={settings.singleClickEdit}
              onCheckedChange={(value) => onSettingChange('singleClickEdit', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Suppress Click Edit</Label>
              <p className="text-sm text-muted-foreground">
                Prevent click editing
              </p>
            </div>
            <Switch
              checked={settings.suppressClickEdit}
              onCheckedChange={(value) => onSettingChange('suppressClickEdit', value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Navigation</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Configure editing navigation
          </p>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enter Moves Down</Label>
              <p className="text-sm text-muted-foreground">
                Move down on Enter key
              </p>
            </div>
            <Switch
              checked={settings.enterMovesDown}
              onCheckedChange={(value) => onSettingChange('enterMovesDown', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enter Moves Down After Edit</Label>
              <p className="text-sm text-muted-foreground">
                Move down after editing
              </p>
            </div>
            <Switch
              checked={settings.enterMovesDownAfterEdit}
              onCheckedChange={(value) => onSettingChange('enterMovesDownAfterEdit', value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Undo/Redo</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Configure undo/redo functionality
          </p>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enable Undo/Redo</Label>
              <p className="text-sm text-muted-foreground">
                Allow undoing and redoing edits
              </p>
            </div>
            <Switch
              checked={settings.undoRedoCellEditing}
              onCheckedChange={(value) => onSettingChange('undoRedoCellEditing', value)}
            />
          </div>

          <div>
            <Label className="font-medium">Undo/Redo Steps</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Number of undo/redo steps to keep
            </p>
            <Input
              type="number"
              value={settings.undoRedoCellEditingLimit}
              onChange={(e) => onSettingChange('undoRedoCellEditingLimit', parseInt(e.target.value))}
              min={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}