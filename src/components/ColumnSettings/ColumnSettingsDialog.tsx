import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnList: string[];
  selectedColumn: string;
  onSelectColumn: (col: string) => void;
}

const columnTypes = ['Default', 'Number', 'String', 'Date'];
const pinnedPositions = ['Not pinned', 'Left', 'Right'];
const filterOptions = ['Enabled', 'Disabled'];
const filterTypes = ['Auto', 'Text', 'Number', 'Date'];
const fontFamilies = ['Arial', 'Calibri', 'Helvetica', 'Times New Roman'];
const fontSizes = ['12px', '14px', '16px', '18px', '20px'];
const fontWeights = ['Normal', 'Bold', 'Italic', 'Bold Italic'];
const borderStyles = ['Solid', 'Dashed', 'Dotted', 'Double', 'Groove', 'Ridge', 'Inset', 'Outset'];
const borderSides = ['All', 'Top', 'Right', 'Bottom', 'Left'];

const horizontalAligns = [
  { value: "left", icon: AlignLeft, label: "Left" },
  { value: "center", icon: AlignCenter, label: "Center" },
  { value: "right", icon: AlignRight, label: "Right" },
];

export const ColumnSettingsDialog: React.FC<ColumnSettingsDialogProps> = ({
  open,
  onOpenChange,
  columnList,
  selectedColumn,
  onSelectColumn
}) => {
  const [headerName, setHeaderName] = useState(selectedColumn);
  const [width, setWidth] = useState('120');
  const [columnType, setColumnType] = useState('Default');
  const [pinnedPosition, setPinnedPosition] = useState('Not pinned');
  const [filter, setFilter] = useState('Enabled');
  const [filterType, setFilterType] = useState('Auto');
  const [sortable, setSortable] = useState(true);
  const [resizable, setResizable] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [editable, setEditable] = useState(true);
  const [headerFontFamily, setHeaderFontFamily] = useState('Arial');
  const [headerFontSize, setHeaderFontSize] = useState('14px');
  const [headerFontWeight, setHeaderFontWeight] = useState('Normal');
  const [headerBold, setHeaderBold] = useState(false);
  const [headerItalic, setHeaderItalic] = useState(false);
  const [headerUnderline, setHeaderUnderline] = useState(false);
  const [headerTextColor, setHeaderTextColor] = useState('#000000');
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#FFFFFF');
  const [headerAlignH, setHeaderAlignH] = useState('left');
  const [headerBorderStyle, setHeaderBorderStyle] = useState('Solid');
  const [headerBorderWidth, setHeaderBorderWidth] = useState(1);
  const [headerBorderColor, setHeaderBorderColor] = useState('#000000');
  const [headerBorderSides, setHeaderBorderSides] = useState('All');
  const [cellFontFamily, setCellFontFamily] = useState('Arial');
  const [cellFontSize, setCellFontSize] = useState('14px');
  const [cellFontWeight, setCellFontWeight] = useState('Normal');
  const [cellBold, setCellBold] = useState(false);
  const [cellItalic, setCellItalic] = useState(false);
  const [cellUnderline, setCellUnderline] = useState(false);
  const [cellTextColor, setCellTextColor] = useState('#000000');
  const [cellBackgroundColor, setCellBackgroundColor] = useState('#FFFFFF');
  const [cellAlignH, setCellAlignH] = useState('left');
  const [cellBorderStyle, setCellBorderStyle] = useState('Solid');
  const [cellBorderWidth, setCellBorderWidth] = useState(1);
  const [cellBorderColor, setCellBorderColor] = useState('#000000');
  const [cellBorderSides, setCellBorderSides] = useState('All');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent
        className="p-4 sm:p-5 bg-background rounded-xl shadow-lg border border-border/80"
        style={{ width: 800, minWidth: 800, maxWidth: 800, height: 840, maxHeight: 940, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-[20px] font-semibold text-foreground flex items-center gap-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-primary"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9h10M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Column Settings
          </DialogTitle>
          <div className="text-[13px] text-muted-foreground mt-1">Configure display and behavior for this column</div>
        </DialogHeader>
        <div className="flex flex-row min-h-0 flex-1">
          {/* Sidebar */}
          <aside className="w-[210px] pr-6 border-r border-border/80 bg-card/80 flex flex-col gap-0 pt-2 pb-2">
            <div className="px-3 pb-2">
              <Input
                placeholder="Search columns..."
                className="h-8 text-[13px] bg-card border border-border/80 rounded placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-2">
              {columnList.map(col => (
                <Button
                  key={col}
                  variant={col === selectedColumn ? "secondary" : "ghost"}
                  size="sm"
                  className={`w-full justify-start gap-2 px-3 py-2 text-[13px] font-normal rounded-lg mb-1 ${col === selectedColumn ? 'font-semibold' : ''}`}
                  type="button"
                  onClick={() => onSelectColumn(col)}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>
                  {col}
                </Button>
              ))}
            </div>
          </aside>
          {/* Main Content */}
          <div className="flex-1 pl-6 overflow-y-hidden" style={{ maxHeight: 740 }}>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-2 gap-1 bg-card border border-border/80 rounded-lg p-1 h-9">
                <TabsTrigger value="general" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">General</TabsTrigger>
                <TabsTrigger value="header" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Header</TabsTrigger>
                <TabsTrigger value="cell" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Cell</TabsTrigger>
                <TabsTrigger value="filter" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Filter</TabsTrigger>
                <TabsTrigger value="formatters" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Formatters</TabsTrigger>
                <TabsTrigger value="editors" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Editors</TabsTrigger>
              </TabsList>
              {/* Tab Content Example for General */}
              <TabsContent value="general" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <Card className="bg-card border border-border/80 shadow-none rounded-lg mb-4">
                  <CardHeader className="px-4 pt-4 pb-2 flex flex-col gap-2 border-b">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg> General
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Header Name</label>
                      <Input value={headerName} onChange={e => setHeaderName(e.target.value)} className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Width</label>
                      <Input value={width} onChange={e => setWidth(e.target.value)} className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Type</label>
                      <Select value={columnType} onValueChange={setColumnType}>
                        <SelectTrigger className="h-8 text-[13px] bg-card border border-border/80 rounded">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {columnTypes.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Pinned</label>
                      <Select value={pinnedPosition} onValueChange={setPinnedPosition}>
                        <SelectTrigger className="h-8 text-[13px] bg-card border border-border/80 rounded">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pinnedPositions.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Filter</label>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="h-8 text-[13px] bg-card border border-border/80 rounded">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Filter Type</label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="h-8 text-[13px] bg-card border border-border/80 rounded">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {filterTypes.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Sortable</label>
                      <Switch checked={sortable} onCheckedChange={setSortable} className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Resizable</label>
                      <Switch checked={resizable} onCheckedChange={setResizable} className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Hidden</label>
                      <Switch checked={hidden} onCheckedChange={setHidden} className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium mb-1 text-muted-foreground">Editable</label>
                      <Switch checked={editable} onCheckedChange={setEditable} className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input" />
                    </div>
                  </CardContent>
                </Card>
                {/* Add further compact controls for General as needed */}
              </TabsContent>
              {/* Header Tab Content - ExpressionEditor style */}
              <TabsContent value="header" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <div className="bg-card border border-border/80 shadow-none rounded-lg mb-3 p-5">
                  {/* Preview */}
                  <div className="mb-4">
                    <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Preview</label>
                    <input disabled className="w-full h-7 rounded bg-muted-foreground/10 border border-border/80 px-2 text-[13px] text-muted-foreground" value="Header Preview" />
                  </div>
                  {/* Typography */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-foreground mb-1">Typography</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Font Family</label>
                        <Select value={headerFontFamily} onValueChange={setHeaderFontFamily}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontFamilies.map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Font Size</label>
                        <Select value={headerFontSize} onValueChange={setHeaderFontSize}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontSizes.map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Font Weight</label>
                        <Select value={headerFontWeight} onValueChange={setHeaderFontWeight}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontWeights.map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Style</label>
                        <div className="flex gap-1">
                          <Button variant={headerBold ? 'secondary' : 'outline'} size="sm" className="h-7 w-7" onClick={() => setHeaderBold(!headerBold)}>B</Button>
                          <Button variant={headerItalic ? 'secondary' : 'outline'} size="sm" className="h-7 w-7" onClick={() => setHeaderItalic(!headerItalic)}>/</Button>
                          <Button variant={headerUnderline ? 'secondary' : 'outline'} size="sm" className="h-7 w-7" onClick={() => setHeaderUnderline(!headerUnderline)}>U</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Colors */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-foreground mb-1">Colors</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Text Color</label>
                        <Input value={headerTextColor} onChange={e => setHeaderTextColor(e.target.value)} className="h-7 w-full text-[13px] bg-card border border-border/80 rounded" type="color" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Background</label>
                        <Input value={headerBackgroundColor} onChange={e => setHeaderBackgroundColor(e.target.value)} className="h-7 w-full text-[13px] bg-card border border-border/80 rounded" type="color" />
                      </div>
                    </div>
                  </div>
                  {/* Alignment */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-foreground mb-1">Alignment</div>
                    <div className="w-full flex gap-2">
                      <div className="flex w-full gap-2">
                        {horizontalAligns.map(({ value, icon: Icon, label }) => (
                          <Button
                            key={value}
                            type="button"
                            variant={headerAlignH === value ? "secondary" : "outline"}
                            size="icon"
                            className="flex-1 h-7 w-7 flex items-center justify-center"
                            onClick={() => setHeaderAlignH(value)}
                            aria-label={label}
                          >
                            <Icon className="w-4 h-4" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Borders */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-foreground mb-1">Borders</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Style</label>
                        <Select value={headerBorderStyle} onValueChange={setHeaderBorderStyle}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {borderStyles.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Width: {headerBorderWidth}px</label>
                        <Slider min={0} max={10} step={1} value={[headerBorderWidth]} onValueChange={([v]) => setHeaderBorderWidth(v)} className="h-7 w-full" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Color</label>
                        <Input value={headerBorderColor} onChange={e => setHeaderBorderColor(e.target.value)} className="h-7 w-full text-[13px] bg-card border border-border/80 rounded" type="color" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Sides</label>
                        <Select value={headerBorderSides} onValueChange={setHeaderBorderSides}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {borderSides.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              {/* Cell Tab Content - ExpressionEditor style */}
              <TabsContent value="cell" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <div className="bg-card border border-border/80 shadow-none rounded-lg mb-3 p-5">
                  {/* Preview */}
                  <div className="mb-4">
                    <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Preview</label>
                    <input disabled className="w-full h-7 rounded bg-muted-foreground/10 border border-border/80 px-2 text-[13px] text-muted-foreground" value="Cell Preview" />
                  </div>
                  {/* Typography */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-foreground mb-1">Typography</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Font Family</label>
                        <Select value={cellFontFamily} onValueChange={setCellFontFamily}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontFamilies.map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Font Size</label>
                        <Select value={cellFontSize} onValueChange={setCellFontSize}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontSizes.map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Font Weight</label>
                        <Select value={cellFontWeight} onValueChange={setCellFontWeight}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontWeights.map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Style</label>
                        <div className="flex gap-1">
                          <Button variant={cellBold ? 'secondary' : 'outline'} size="sm" className="h-7 w-7" onClick={() => setCellBold(!cellBold)}>B</Button>
                          <Button variant={cellItalic ? 'secondary' : 'outline'} size="sm" className="h-7 w-7" onClick={() => setCellItalic(!cellItalic)}>/</Button>
                          <Button variant={cellUnderline ? 'secondary' : 'outline'} size="sm" className="h-7 w-7" onClick={() => setCellUnderline(!cellUnderline)}>U</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Colors */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-foreground mb-1">Colors</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Text Color</label>
                        <Input value={cellTextColor} onChange={e => setCellTextColor(e.target.value)} className="h-7 w-full text-[13px] bg-card border border-border/80 rounded" type="color" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Background</label>
                        <Input value={cellBackgroundColor} onChange={e => setCellBackgroundColor(e.target.value)} className="h-7 w-full text-[13px] bg-card border border-border/80 rounded" type="color" />
                      </div>
                    </div>
                  </div>
                  {/* Alignment */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-foreground mb-1">Alignment</div>
                    <div className="w-full flex gap-2">
                      <div className="flex w-full gap-2">
                        {horizontalAligns.map(({ value, icon: Icon, label }) => (
                          <Button
                            key={value}
                            type="button"
                            variant={cellAlignH === value ? "secondary" : "outline"}
                            size="icon"
                            className="flex-1 h-7 w-7 flex items-center justify-center"
                            onClick={() => setCellAlignH(value)}
                            aria-label={label}
                          >
                            <Icon className="w-4 h-4" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Borders */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-foreground mb-1">Borders</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Style</label>
                        <Select value={cellBorderStyle} onValueChange={setCellBorderStyle}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {borderStyles.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Width: {cellBorderWidth}px</label>
                        <Slider min={0} max={10} step={1} value={[cellBorderWidth]} onValueChange={([v]) => setCellBorderWidth(v)} className="h-7 w-full" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Color</label>
                        <Input value={cellBorderColor} onChange={e => setCellBorderColor(e.target.value)} className="h-7 w-full text-[13px] bg-card border border-border/80 rounded" type="color" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-0.5 text-muted-foreground block">Sides</label>
                        <Select value={cellBorderSides} onValueChange={setCellBorderSides}>
                          <SelectTrigger className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {borderSides.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              {/* Filter Tab Content */}
              <TabsContent value="filter" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <Card className="bg-card border border-border/80 shadow-none rounded-lg mb-4">
                  <CardHeader className="px-4 pt-4 pb-2 flex flex-col gap-2 border-b">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg> Filter
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 flex flex-col gap-6">
                    <div>
                      <div className="font-semibold text-[14px] mb-2">Filter Type</div>
                      <Select>
                        <SelectTrigger className="h-8 text-[13px]">
                          <SelectValue placeholder="Select filter type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Filter</SelectItem>
                          <SelectItem value="number">Number Filter</SelectItem>
                          <SelectItem value="date">Date Filter</SelectItem>
                          <SelectItem value="set">Set Filter</SelectItem>
                          <SelectItem value="multi">Multi Filter</SelectItem>
                          <SelectItem value="custom">Custom Filter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Multi Filter Options */}
                    <div>
                      <div className="font-semibold text-[13px] mb-1">Multi Filter Configuration</div>
                      <div className="flex flex-col gap-3">
                        {/* List of filters */}
                        <div className="flex flex-col gap-2">
                          {/* Example filter rows - in real use, map over state */}
                          <div className="flex items-center gap-2">
                            <Select>
                              <SelectTrigger className="h-8 text-[13px] w-40">
                                <SelectValue placeholder="Select filter type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="set">Set</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="icon" variant="ghost" className="text-destructive" aria-label="Remove filter">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            </Button>
                          </div>
                          {/* Add filter button */}
                          <Button size="sm" variant="outline" className="w-fit mt-1">+ Add Filter</Button>
                        </div>
                        {/* Suppress Filter Buttons */}
                        <div className="flex items-center gap-2">
                          <Switch id="suppressFilterButtons" />
                          <label htmlFor="suppressFilterButtons" className="text-xs">Suppress Filter Buttons</label>
                        </div>
                        {/* Read Only */}
                        <div className="flex items-center gap-2">
                          <Switch id="readOnlyMultiFilter" />
                          <label htmlFor="readOnlyMultiFilter" className="text-xs">Read Only</label>
                        </div>
                      </div>
                    </div>
                    {/* Floating Filters Toggle */}
                    <div className="flex items-center gap-2 mt-6">
                      <Switch id="floatingFilters" />
                      <label htmlFor="floatingFilters" className="text-xs font-medium">Enable Floating Filters</label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Formatter Tab Content - Simplified */}
              <TabsContent value="formatters" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <Card className="bg-card border border-border/80 shadow-none rounded-lg mb-4">
                  <CardHeader className="px-4 pt-4 pb-2 flex flex-col gap-2 border-b">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg> Formatters
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 flex flex-col gap-6">
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
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Editors Tab Content */}
              <TabsContent value="editors" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <Card className="bg-card border border-border/80 shadow-none rounded-lg mb-4">
                  <CardHeader className="px-4 pt-4 pb-2 flex flex-col gap-2 border-b">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg> Editors
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 flex flex-col gap-6">
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* Footer: match Expression Editor dialog */}
        <div className="flex justify-between border-t border-border/80" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
          <Button variant="outline" className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground" onClick={() => onOpenChange(false)}>Cancel</Button>
          <div className="flex gap-2">
            <Button variant="outline" className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground">Reset</Button>
            <Button type="submit" className="h-8 px-5 text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" form="column-settings-form">Apply Changes</Button>
          </div>
        </div>
      </DialogContent>

    </Dialog>
  );
};
