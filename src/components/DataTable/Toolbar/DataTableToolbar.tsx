import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Type,
  Check,
  ChevronsUpDown,
  Settings,
  Save,
  Copy,
  FileInput,
  FileOutput,
  Keyboard,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Sliders,
  Columns,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const monospacefonts = [
  { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { name: 'Fira Code', value: "'Fira Code', monospace" },
  { name: 'Source Code Pro', value: "'Source Code Pro', monospace" },
  { name: 'IBM Plex Mono', value: "'IBM Plex Mono', monospace" },
  { name: 'Roboto Mono', value: "'Roboto Mono', monospace" },
];

interface DataTableToolbarProps {
  selectedFont: typeof monospacefonts[0];
  onFontChange: (font: typeof monospacefonts[0]) => void;
  onOpenGeneralSettings: () => void;
  onOpenColumnSettings: () => void;
}

export function DataTableToolbar({
  selectedFont,
  onFontChange,
  onOpenGeneralSettings,
  onOpenColumnSettings,
}: DataTableToolbarProps) {
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-[60px] items-center justify-between border-b bg-gray-50/50 px-4 dark:bg-gray-800/50">
      {/* Font Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            <Type className="mr-2 h-4 w-4" />
            {selectedFont.name}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command value={selectedFont.value} shouldFilter={false}>
            <CommandInput placeholder="Search font..." />
            <CommandEmpty>No font found.</CommandEmpty>
            <CommandGroup>
              {monospacefonts.map((font) => (
                <CommandItem
                  key={font.value}
                  value={font.name.toLowerCase()}
                  onSelect={() => {
                    onFontChange(font);
                    document.documentElement.style.setProperty(
                      '--ag-font-family',
                      font.value
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedFont.value === font.value
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  <span style={{ fontFamily: font.value }}>
                    {font.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Settings Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onOpenGeneralSettings}>
              <Sliders className="mr-2 h-4 w-4" />
              <span>General Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenColumnSettings}>
              <Columns className="mr-2 h-4 w-4" />
              <span>Column Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Save className="mr-2 h-4 w-4" />
              <span>Save Layout</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Layout</span>
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <FileInput className="mr-2 h-4 w-4" />
              <span>Import Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileOutput className="mr-2 h-4 w-4" />
              <span>Export Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Monitor className="mr-2 h-4 w-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}