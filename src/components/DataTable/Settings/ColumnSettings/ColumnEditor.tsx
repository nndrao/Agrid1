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
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from "lucide-react";
import type { ColumnState } from "./types";
import { useState } from "react";

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

function ColorInput({ color, onChange }: { color: string; onChange: (color: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Input 
        value={color} 
        onChange={(e) => onChange(e.target.value)}
        className="font-mono"
      />
      <Popover>
        <PopoverTrigger asChild>
          <div
            className="h-8 w-8 rounded border cursor-pointer"
            style={{ backgroundColor: color }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end">
          <HexColorPicker
            color={color}
            onChange={onChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function FontSettings({ settings, onChange }: FontSettingsProps) {
  const weightOptions = [
    { label: 'Regular', value: 'normal' },
    { label: 'Medium', value: 'medium' },
    { label: 'Bold', value: 'bold' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Font Weight</Label>
          <Select 
            value={settings.weight} 
            onValueChange={(value) => onChange({ ...settings, weight: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weightOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Font Size</Label>
          <Select 
            value={settings.size.toString()} 
            onValueChange={(value) => onChange({ ...settings, size: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 25 }, (_, i) => i + 8).map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">Text Style</Label>
        </div>
        <div className="flex gap-1">
          <Button 
            variant={settings.weight === 'bold' ? "default" : "outline"} 
            size="icon"
            className="h-8 w-8"
            onClick={() => onChange({ 
              ...settings, 
              weight: settings.weight === 'bold' ? 'normal' : 'bold' 
            })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant={settings.style === 'italic' ? "default" : "outline"} 
            size="icon"
            className="h-8 w-8"
            onClick={() => onChange({ 
              ...settings, 
              style: settings.style === 'italic' ? 'normal' : 'italic' 
            })}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AlignmentControls({ alignment, onChange }: { 
  alignment: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-1">
      <Button 
        variant={alignment === 'left' ? "default" : "outline"} 
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange('left')}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button 
        variant={alignment === 'center' ? "default" : "outline"} 
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange('center')}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button 
        variant={alignment === 'right' ? "default" : "outline"} 
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange('right')}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StyleBorderEditor({ 
  borders, 
  onChange 
}: {
  borders: {
    top: { width: number; style: string; color: string };
    right: { width: number; style: string; color: string };
    bottom: { width: number; style: string; color: string };
    left: { width: number; style: string; color: string };
  };
  onChange: (borders: any) => void;
}) {
  const [selectedSide, setSelectedSide] = useState<'top' | 'right' | 'bottom' | 'left'>('bottom');
  const border = borders[selectedSide];

  const updateBorder = (updatedBorder: typeof border) => {
    onChange({
      ...borders,
      [selectedSide]: updatedBorder
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Border Side</Label>
        <div className="flex gap-1 mb-3">
          <Button 
            variant={selectedSide === 'top' ? "default" : "outline"} 
            size="sm"
            className="flex-1"
            onClick={() => setSelectedSide('top')}
          >
            Top
          </Button>
          <Button 
            variant={selectedSide === 'right' ? "default" : "outline"} 
            size="sm"
            className="flex-1"
            onClick={() => setSelectedSide('right')}
          >
            Right
          </Button>
          <Button 
            variant={selectedSide === 'bottom' ? "default" : "outline"} 
            size="sm"
            className="flex-1"
            onClick={() => setSelectedSide('bottom')}
          >
            Bottom
          </Button>
          <Button 
            variant={selectedSide === 'left' ? "default" : "outline"} 
            size="sm"
            className="flex-1"
            onClick={() => setSelectedSide('left')}
          >
            Left
          </Button>
        </div>
      </div>
      
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Border Style</Label>
        <div className="flex items-center gap-2">
          <Select value={border.style} onValueChange={(value) => updateBorder({ ...border, style: value })}>
            <SelectTrigger className="w-[80px]">
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
          <div className="flex items-center gap-1">
            <Input
              type="text"
              value={`${border.width}px`}
              onChange={(e) => {
                const value = parseInt(e.target.value.replace('px', ''));
                if (!isNaN(value)) {
                  updateBorder({ ...border, width: value });
                }
              }}
              className="w-[60px]"
            />
          </div>
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <div
                  className="h-6 w-6 rounded border cursor-pointer"
                  style={{ backgroundColor: border.color }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <HexColorPicker
                  color={border.color}
                  onChange={(color) => updateBorder({ ...border, color })}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="mt-2 p-3 border rounded-md">
        <div 
          className="h-12 w-full bg-background"
          style={{
            borderTop: borders.top.style !== 'none' ? `${borders.top.width}px ${borders.top.style} ${borders.top.color}` : 'none',
            borderRight: borders.right.style !== 'none' ? `${borders.right.width}px ${borders.right.style} ${borders.right.color}` : 'none',
            borderBottom: borders.bottom.style !== 'none' ? `${borders.bottom.width}px ${borders.bottom.style} ${borders.bottom.color}` : 'none',
            borderLeft: borders.left.style !== 'none' ? `${borders.left.width}px ${borders.left.style} ${borders.left.color}` : 'none'
          }}
        >
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Border Preview
          </div>
        </div>
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

        <TabsContent value="header" className="mt-4">
          <Tabs defaultValue="typography" className="w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">Header Styling</h3>
            </div>
            <TabsList className="mb-3 grid grid-cols-3 h-9">
              <TabsTrigger value="typography" className="text-xs">Typography</TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">Colors</TabsTrigger>
              <TabsTrigger value="border" className="text-xs">Borders</TabsTrigger>
            </TabsList>

            <TabsContent value="typography" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Font Weight</Label>
                  <Select 
                    value={state.headerFont.weight} 
                    onValueChange={(value) => onChange({ 
                      headerFont: { ...state.headerFont, weight: value } 
                    })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Regular</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Font Size</Label>
                  <Select 
                    value={state.headerFont.size.toString()} 
                    onValueChange={(value) => onChange({ 
                      headerFont: { ...state.headerFont, size: parseInt(value) } 
                    })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 17 }, (_, i) => i + 8).map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Text Style</Label>
                  <Label className="text-xs text-muted-foreground">Text Alignment</Label>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-1">
                    <Button 
                      variant={state.headerFont.weight === 'bold' ? "default" : "outline"} 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onChange({ 
                        headerFont: { 
                          ...state.headerFont, 
                          weight: state.headerFont.weight === 'bold' ? 'normal' : 'bold' 
                        }
                      })}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={state.headerFont.style === 'italic' ? "default" : "outline"} 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onChange({ 
                        headerFont: { 
                          ...state.headerFont, 
                          style: state.headerFont.style === 'italic' ? 'normal' : 'italic' 
                        }
                      })}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </div>
                  <AlignmentControls 
                    alignment={state.headerAlignment}
                    onChange={(headerAlignment) => onChange({ headerAlignment })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Text Color</Label>
                <ColorInput 
                  color={state.headerFont.color}
                  onChange={(color) => onChange({ 
                    headerFont: { ...state.headerFont, color } 
                  })}
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Background Color</Label>
                <ColorInput 
                  color={state.headerBackgroundColor}
                  onChange={(headerBackgroundColor) => onChange({ headerBackgroundColor })}
                />
              </div>

              <div className="mt-5 border rounded-md overflow-hidden">
                <div
                  className="p-4 flex items-center justify-center"
                  style={{
                    backgroundColor: state.headerBackgroundColor,
                    color: state.headerFont.color,
                    fontWeight: state.headerFont.weight,
                    fontStyle: state.headerFont.style,
                    fontSize: `${state.headerFont.size}px`,
                    textAlign: state.headerAlignment,
                    borderBottom: state.headerBorders.bottom.style !== 'none' ? 
                      `${state.headerBorders.bottom.width}px ${state.headerBorders.bottom.style} ${state.headerBorders.bottom.color}` : 'none'
                  }}
                >
                  Header Preview
                </div>
              </div>
            </TabsContent>

            <TabsContent value="border" className="space-y-3">
              <StyleBorderEditor
                borders={state.headerBorders}
                onChange={(headerBorders) => onChange({ headerBorders })}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="cell" className="mt-4">
          <Tabs defaultValue="typography" className="w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">Cell Styling</h3>
            </div>
            <TabsList className="mb-3 grid grid-cols-3 h-9">
              <TabsTrigger value="typography" className="text-xs">Typography</TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">Colors</TabsTrigger>
              <TabsTrigger value="border" className="text-xs">Borders</TabsTrigger>
            </TabsList>

            <TabsContent value="typography" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Font Weight</Label>
                  <Select 
                    value={state.cellFont.weight} 
                    onValueChange={(value) => onChange({ 
                      cellFont: { ...state.cellFont, weight: value } 
                    })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Regular</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Font Size</Label>
                  <Select 
                    value={state.cellFont.size.toString()} 
                    onValueChange={(value) => onChange({ 
                      cellFont: { ...state.cellFont, size: parseInt(value) } 
                    })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 17 }, (_, i) => i + 8).map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Text Style</Label>
                  <Label className="text-xs text-muted-foreground">Text Alignment</Label>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-1">
                    <Button 
                      variant={state.cellFont.weight === 'bold' ? "default" : "outline"} 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onChange({ 
                        cellFont: { 
                          ...state.cellFont, 
                          weight: state.cellFont.weight === 'bold' ? 'normal' : 'bold' 
                        }
                      })}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={state.cellFont.style === 'italic' ? "default" : "outline"} 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onChange({ 
                        cellFont: { 
                          ...state.cellFont, 
                          style: state.cellFont.style === 'italic' ? 'normal' : 'italic' 
                        }
                      })}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </div>
                  <AlignmentControls 
                    alignment={state.cellAlignment.horizontal}
                    onChange={(horizontal) => 
                      onChange({ 
                        cellAlignment: { 
                          ...state.cellAlignment, 
                          horizontal 
                        } 
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Text Color</Label>
                <ColorInput 
                  color={state.cellFont.color}
                  onChange={(color) => onChange({ 
                    cellFont: { ...state.cellFont, color } 
                  })}
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Background Color</Label>
                <ColorInput 
                  color={state.cellBackgroundColor}
                  onChange={(cellBackgroundColor) => onChange({ cellBackgroundColor })}
                />
              </div>

              <div className="mt-5 border rounded-md overflow-hidden">
                <div
                  className="p-4 flex items-center justify-center"
                  style={{
                    backgroundColor: state.cellBackgroundColor,
                    color: state.cellFont.color,
                    fontWeight: state.cellFont.weight,
                    fontStyle: state.cellFont.style,
                    fontSize: `${state.cellFont.size}px`,
                    textAlign: state.cellAlignment.horizontal,
                    borderBottom: state.cellBorders.bottom.style !== 'none' ? 
                      `${state.cellBorders.bottom.width}px ${state.cellBorders.bottom.style} ${state.cellBorders.bottom.color}` : 'none'
                  }}
                >
                  Cell Content Preview
                </div>
              </div>
            </TabsContent>

            <TabsContent value="border" className="space-y-3">
              <StyleBorderEditor
                borders={state.cellBorders}
                onChange={(cellBorders) => onChange({ cellBorders })}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}