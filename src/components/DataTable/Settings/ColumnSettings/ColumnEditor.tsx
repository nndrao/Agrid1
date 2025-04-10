import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import type { ColumnState } from "./types";

const systemFonts = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Times",
  "Courier New",
  "Courier",
  "Verdana",
  "Georgia",
  "Palatino",
  "Garamond",
  "Bookman",
  "Trebuchet MS",
  "Arial Black",
  "Impact"
];

const borderStyles = [
  { label: "None", value: "none" },
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "Double", value: "double" }
];

interface BorderEditorProps {
  label: string;
  border: {
    width: number;
    style: string;
    color: string;
  };
  onChange: (border: { width: number; style: string; color: string }) => void;
}

function BorderEditor({ label, border, onChange }: BorderEditorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Width</Label>
          <Input
            type="number"
            value={border.width}
            onChange={(e) => onChange({ ...border, width: parseInt(e.target.value) })}
            min={0}
            max={10}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs">Style</Label>
          <Select value={border.style} onValueChange={(value) => onChange({ ...border, style: value })}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {borderStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Color</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-full"
                style={{ backgroundColor: border.color }}
              >
                <span className="sr-only">Pick color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <HexColorPicker
                color={border.color}
                onChange={(color) => onChange({ ...border, color })}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

interface FontSettingsProps {
  settings: {
    family: string;
    size: number;
    weight: string;
    style: string;
    color: string;
  };
  onChange: (settings: any) => void;
}

function FontSettings({ settings, onChange }: FontSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Font Family</Label>
        <Select value={settings.family} onValueChange={(value) => onChange({ ...settings, family: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {systemFonts.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Font Size (px)</Label>
        <div className="flex items-center space-x-4">
          <Slider
            value={[settings.size]}
            onValueChange={([value]) => onChange({ ...settings, size: value })}
            min={8}
            max={32}
            step={1}
            className="flex-1"
          />
          <span className="w-12 text-sm tabular-nums">{settings.size}px</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Font Weight</Label>
          <Select value={settings.weight} onValueChange={(value) => onChange({ ...settings, weight: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Font Style</Label>
          <Select value={settings.style} onValueChange={(value) => onChange({ ...settings, style: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="italic">Italic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Text Color</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              style={{ backgroundColor: settings.color }}
            >
              <span className="sr-only">Pick color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <HexColorPicker
              color={settings.color}
              onChange={(color) => onChange({ ...settings, color })}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

interface ColumnEditorProps {
  columnId: string;
  state: ColumnState;
  onChange: (changes: Partial<ColumnState>) => void;
}

export function ColumnEditor({ columnId, state, onChange }: ColumnEditorProps) {
  return (
    <div className="p-4">
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="header" className="flex-1">Header</TabsTrigger>
          <TabsTrigger value="cell" className="flex-1">Cell</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div>
              <Label>Field Name</Label>
              <Input
                value={state.field}
                onChange={(e) => onChange({ field: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Header Name</Label>
              <Input
                value={state.headerName}
                onChange={(e) => onChange({ headerName: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Width</Label>
              <div className="flex items-center space-x-4 mt-1.5">
                <Slider
                  value={[state.width]}
                  onValueChange={([value]) => onChange({ width: value })}
                  min={50}
                  max={1000}
                  step={1}
                  className="flex-1"
                />
                <span className="w-16 text-sm tabular-nums text-muted-foreground">
                  {state.width}px
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Visible</Label>
                <p className="text-sm text-muted-foreground">
                  Show or hide this column
                </p>
              </div>
              <Switch
                checked={state.visible}
                onCheckedChange={(checked) => onChange({ visible: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Resizable</Label>
                <p className="text-sm text-muted-foreground">
                  Allow column resizing
                </p>
              </div>
              <Switch
                checked={state.resizable}
                onCheckedChange={(checked) => onChange({ resizable: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sortable</Label>
                <p className="text-sm text-muted-foreground">
                  Allow column sorting
                </p>
              </div>
              <Switch
                checked={state.sortable}
                onCheckedChange={(checked) => onChange({ sortable: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Filterable</Label>
                <p className="text-sm text-muted-foreground">
                  Enable column filtering
                </p>
              </div>
              <Switch
                checked={state.filter !== false}
                onCheckedChange={(checked) => onChange({ filter: checked })}
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label>Pin Position</Label>
            <Select
              value={state.pinned || "none"}
              onValueChange={(value) => onChange({ pinned: value === "none" ? null : value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unpinned</SelectItem>
                <SelectItem value="left">Pin Left</SelectItem>
                <SelectItem value="right">Pin Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="header" className="space-y-6 mt-4">
          <div>
            <Label className="text-base font-semibold">Header Appearance</Label>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Text Alignment</Label>
                <Select
                  value={state.headerAlignment}
                  onValueChange={(value) => onChange({ headerAlignment: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Background Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      style={{ backgroundColor: state.headerBackgroundColor }}
                    >
                      <span className="sr-only">Pick color</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <HexColorPicker
                      color={state.headerBackgroundColor}
                      onChange={(color) => onChange({ headerBackgroundColor: color })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <FontSettings
                settings={state.headerFont}
                onChange={(settings) => onChange({ headerFont: settings })}
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-semibold">Header Borders</Label>
            <div className="mt-4 space-y-4">
              <BorderEditor
                label="Top Border"
                border={state.headerBorders.top}
                onChange={(border) => onChange({
                  headerBorders: { ...state.headerBorders, top: border }
                })}
              />
              <BorderEditor
                label="Right Border"
                border={state.headerBorders.right}
                onChange={(border) => onChange({
                  headerBorders: { ...state.headerBorders, right: border }
                })}
              />
              <BorderEditor
                label="Bottom Border"
                border={state.headerBorders.bottom}
                onChange={(border) => onChange({
                  headerBorders: { ...state.headerBorders, bottom: border }
                })}
              />
              <BorderEditor
                label="Left Border"
                border={state.headerBorders.left}
                onChange={(border) => onChange({
                  headerBorders: { ...state.headerBorders, left: border }
                })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cell" className="space-y-6 mt-4">
          <div>
            <Label className="text-base font-semibold">Cell Appearance</Label>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Horizontal Alignment</Label>
                <Select
                  value={state.cellAlignment.horizontal}
                  onValueChange={(value) => onChange({
                    cellAlignment: { ...state.cellAlignment, horizontal: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vertical Alignment</Label>
                <Select
                  value={state.cellAlignment.vertical}
                  onValueChange={(value) => onChange({
                    cellAlignment: { ...state.cellAlignment, vertical: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="middle">Middle</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Background Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      style={{ backgroundColor: state.cellBackgroundColor }}
                    >
                      <span className="sr-only">Pick color</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <HexColorPicker
                      color={state.cellBackgroundColor}
                      onChange={(color) => onChange({ cellBackgroundColor: color })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <FontSettings
                settings={state.cellFont}
                onChange={(settings) => onChange({ cellFont: settings })}
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-semibold">Cell Borders</Label>
            <div className="mt-4 space-y-4">
              <BorderEditor
                label="Top Border"
                border={state.cellBorders.top}
                onChange={(border) => onChange({
                  cellBorders: { ...state.cellBorders, top: border }
                })}
              />
              <BorderEditor
                label="Right Border"
                border={state.cellBorders.right}
                onChange={(border) => onChange({
                  cellBorders: { ...state.cellBorders, right: border }
                })}
              />
              <BorderEditor
                label="Bottom Border"
                border={state.cellBorders.bottom}
                onChange={(border) => onChange({
                  cellBorders: { ...state.cellBorders, bottom: border }
                })}
              />
              <BorderEditor
                label="Left Border"
                border={state.cellBorders.left}
                onChange={(border) => onChange({
                  cellBorders: { ...state.cellBorders, left: border }
                })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}