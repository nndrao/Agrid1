import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { ExpressionEditor } from '@/components/ExpressionEditor/ExpressionEditor';
import { ColumnSettingsDialog } from '@/components/ColumnSettings/ColumnSettingsDialogRefactored';
import { Column } from 'ag-grid-community';

// Default values for fallbacks
const defaultDensity = 2;
const defaultFontSize = 13;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  User,
  UserPlus,
  Trash2,
  Edit2,
  Plus,
  AlignJustify,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGridStore } from '@/store/gridStore';
import { monospacefonts } from '@/lib/fonts';

export function DataTableToolbar() {
  const { setTheme } = useTheme();
  const [fontOpen, setFontOpen] = useState(false);
  const [profilesOpen, setProfilesOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [expressionEditorOpen, setExpressionEditorOpen] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [columnList, setColumnList] = useState<string[]>([]);

  // Get store data and actions
  const {
    profiles,
    settings,
    gridApi,
    createProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    updateSettings,
    saveSettingsToProfile,
    getActiveProfile,
    importProfile,
    getColumnSettings,
    saveColumnSettings
  } = useGridStore();

  // Initialize column list when the grid API is available - optimized to reduce re-renders
  useEffect(() => {
    if (!gridApi || typeof gridApi.getAllDisplayedColumns !== 'function') {
      return;
    }

    try {
      // Get all columns from grid API directly
      const columns = gridApi.getAllDisplayedColumns();
      if (!columns || columns.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('No columns returned from getAllDisplayedColumns');
        }
        return;
      }

      // Extract column fields
      const fields = columns.map((col: Column) => col.getColId());

      // Use functional update to avoid dependency on columnList
      setColumnList(prevList => {
        // Only update if columns have changed
        if (fields.length !== prevList.length ||
            !fields.every((field: string, i: number) => prevList[i] === field)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Updating column list - found', fields.length, 'columns');
          }

          // Update selected column if needed
          if (!selectedColumn || !fields.includes(selectedColumn)) {
            setSelectedColumn(fields[0]);
          }

          return fields;
        }
        return prevList;
      });
    } catch (error) {
      console.error('Error getting columns from grid API:', error);
    }
  // Only depend on gridApi changes to prevent unnecessary re-renders
  }, [gridApi, selectedColumn]);

  // Current active profile
  const activeProfile = getActiveProfile();

  // Log for debugging only in development
  if (process.env.NODE_ENV === 'development') {
    console.log("Current settings in toolbar:", {
      fontSize: settings?.fontSize,
      density: settings?.density
    });
  }

  // Ensure activeProfile has default values if somehow missing
  if (!activeProfile) {
    console.error('Active profile not found');
  }

  // State for profile creation/editing
  const [editingProfile, setEditingProfile] = useState<typeof activeProfile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [tempFont, setTempFont] = useState(settings?.font || monospacefonts[0]);
  const [tempFontSize, setTempFontSize] = useState(settings?.fontSize || defaultFontSize);
  const [tempDensity, setTempDensity] = useState(settings?.density || defaultDensity);

  // Import toast for notifications
  const { toast } = useToast();

  // Save profile handling
  const handleSaveProfile = () => {
    // Gather all current settings
    const profileName = newProfileName.trim() || (editingProfile ? editingProfile.name : `Profile ${profiles.length + 1}`);
    const timestamp = Date.now();

    // Get all current grid state from gridApi if available
    let columnsState = null, filterState = null, sortState = null, rowGroupState = null, pivotState = null, chartState = null;
    if (gridApi) {
      try { columnsState = gridApi.getColumnState ? gridApi.getColumnState() : null; } catch {}
      try { filterState = gridApi.getFilterModel ? gridApi.getFilterModel() : null; } catch {}
      try { sortState = gridApi.getSortModel ? gridApi.getSortModel() : null; } catch {}
      try { rowGroupState = gridApi.getRowGroupColumns ? gridApi.getRowGroupColumns() : null; } catch {}
      try { pivotState = gridApi.getPivotColumns ? gridApi.getPivotColumns() : null; } catch {}
      try { chartState = gridApi.getChartModels ? gridApi.getChartModels() : null; } catch {}
    }

    // Always include column settings profiles from store settings
    const columnSettingsProfiles = settings?.columnSettingsProfiles || {};
    const themeMode = settings?.themeMode || 'system';

    // Construct the new or updated profile object
    const baseProfile = {
      name: profileName,
      font: tempFont,
      fontSize: tempFontSize,
      density: tempDensity,
      columnsState,
      filterState,
      sortState,
      rowGroupState,
      pivotState,
      chartState,
      columnSettingsProfiles,
      themeMode,
      updatedAt: timestamp
    };

    if (editingProfile) {
      // Update existing profile atomically (DO NOT update settings or trigger grid refresh)
      updateProfile(editingProfile.id, { ...baseProfile });
      toast({
        title: 'Profile Updated',
        description: `Profile "${profileName}" has been updated`,
        variant: 'default',
      });
    } else {
      // Create new profile atomically
      const id = `profile-${timestamp}`;
      createProfile({ ...baseProfile, id, createdAt: timestamp });
      toast({
        title: 'Profile Created',
        description: `New profile "${profileName}" has been created`,
        variant: 'default',
      });
    }

    // Do NOT update settings or activeProfileId here!
    // If user wants to apply the new profile, they must explicitly select it (or you can auto-select if desired)

    // Reset and close dialog
    setProfileDialogOpen(false);
    setEditingProfile(null);
    setNewProfileName('');
  };

  // Delete profile handling
  const handleDeleteProfile = (profileId: string) => {
    // Find the profile name before deleting
    const profileToDelete = profiles.find(p => p.id === profileId);
    const profileName = profileToDelete?.name || 'Unknown';

    // Delete the profile
    deleteProfile(profileId);

    // Show toast notification
    toast({
      title: 'Profile Deleted',
      description: `Profile "${profileName}" has been deleted`,
      variant: 'default',
    });
  };

  // Edit profile
  const handleEditProfile = (profile: typeof activeProfile) => {
    if (profile.isDefault) return; // Cannot edit default profile

    setEditingProfile(profile);
    setNewProfileName(profile.name);
    setTempFont(profile.font);
    setTempFontSize(profile.fontSize);
    setTempDensity(profile.density);
    setProfileDialogOpen(true);
  };

  // Create new profile
  const handleNewProfile = () => {
    setEditingProfile(null);
    setNewProfileName('');
    setTempFont(settings.font);
    setTempFontSize(settings.fontSize);
    setTempDensity(settings.density);
    setProfileDialogOpen(true);
  };

  // Apply profile
  const handleApplyProfile = (profileId: string) => {
    // Find the profile name before applying
    const profileToApply = profiles.find(p => p.id === profileId);
    const profileName = profileToApply?.name || 'Unknown';

    // Apply the profile
    selectProfile(profileId);

    // Show toast notification
    toast({
      title: 'Profile Applied',
      description: `Profile "${profileName}" has been applied`,
      variant: 'default',
    });
  };

  // Refs for debouncing
  const debounceTimers = useRef<Record<string, number>>({});
  // Local state for smoother slider interactions
  const [localFontSize, setLocalFontSize] = useState(settings?.fontSize || defaultFontSize);
  const [localDensity, setLocalDensity] = useState(settings?.density || defaultDensity);

  // Memoize the CSS update function to avoid recreating it on every render
  const updateCssVariables = useCallback((fontSize?: number, density?: number) => {
    // Update font size CSS variable
    if (fontSize !== undefined) {
      document.documentElement.style.setProperty('--ag-font-size', `${fontSize}px`);
    }

    // Update density CSS variables
    if (density !== undefined) {
      const spacingValue = 4 + (density - 1) * 4;
      document.documentElement.style.setProperty('--ag-grid-size', `${spacingValue}px`);
      document.documentElement.style.setProperty('--ag-list-item-height', `${spacingValue * 6}px`);
      document.documentElement.style.setProperty('--ag-row-height', `${spacingValue * 6}px`);
      document.documentElement.style.setProperty('--ag-header-height', `${spacingValue * 7}px`);
      document.documentElement.style.setProperty('--ag-cell-horizontal-padding', `${spacingValue * 1.5}px`);
    }
  }, []);

  // Sync local state with settings when they change
  useEffect(() => {
    // Update local state for font size
    if (settings?.fontSize !== undefined) {
      setLocalFontSize(settings.fontSize);
    }

    // Update local state for density
    if (settings?.density !== undefined) {
      setLocalDensity(settings.density);
    }

    // Apply CSS variables in a single batch
    updateCssVariables(settings?.fontSize, settings?.density);
  }, [settings?.fontSize, settings?.density, updateCssVariables]);

  // Update a single setting with debounce - optimized to reduce duplicate code
  const handleUpdateSetting = useCallback((key: string, value: string | number | boolean | { name: string; value: string }) => {
    // Update local state for immediate UI feedback
    if (key === 'fontSize') {
      setLocalFontSize(value as number);
      // Update CSS for font size
      updateCssVariables(value as number, undefined);
    } else if (key === 'density') {
      setLocalDensity(value as number);
      // Update CSS for density
      updateCssVariables(undefined, value as number);
    }

    // Clear any existing timer
    if (debounceTimers.current[key]) {
      window.clearTimeout(debounceTimers.current[key]);
    }

    // Set a new timer to update the store
    debounceTimers.current[key] = window.setTimeout(() => {
      // Only update the store after a delay to prevent excessive renders
      updateSettings({ [key]: value });
      if (process.env.NODE_ENV === 'development') {
        console.log(`Updated setting in store: ${key} = ${value}`);
      }
    }, 200); // 200ms debounce for better performance
  }, [updateSettings, updateCssVariables]);

  // Get display name for density value
  const getDensityLabel = (densityValue: number): string => {
    if (densityValue <= 1.25) return 'Compact';
    if (densityValue >= 2.75) return 'Spacious';
    return 'Normal';
  };

  return (
    <div className="flex h-[60px] items-center justify-between border-b bg-gray-50/50 px-4 dark:bg-gray-800/50">
      <ExpressionEditor open={expressionEditorOpen} onOpenChange={setExpressionEditorOpen} />
      <div className="flex items-center space-x-2">
        {/* Profile Section */}
        <div className="flex items-center space-x-2">
          {/* Profile Selector */}
          <Popover open={profilesOpen} onOpenChange={setProfilesOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={profilesOpen}
                className="w-[150px] justify-between"
              >
                <User className="mr-2 h-4 w-4" />
                {activeProfile?.name || 'Default'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search profiles..." />
                <CommandEmpty>No profile found.</CommandEmpty>
                <CommandGroup heading="Profiles">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between px-2 py-1 hover:bg-muted">
                      <div
                        className="flex items-center flex-1 cursor-pointer"
                        onClick={() => {
                          handleApplyProfile(profile.id);
                          setProfilesOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            activeProfile?.id === profile.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <span>{profile.name}</span>
                      </div>
                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mr-1"
                          onClick={() => handleEditProfile(profile)}
                          disabled={profile.isDefault}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteProfile(profile.id)}
                          disabled={profile.isDefault}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CommandGroup>
                <div className="p-1 border-t">
                  <div
                    className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-muted"
                    onClick={() => {
                      handleNewProfile();
                      setProfilesOpen(false);
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Create New Profile</span>
                  </div>
                </div>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Save Profile Button */}
          <Button
            variant="outline"
            size="icon"
            title={activeProfile?.isDefault ? "Save as New Profile" : "Save Current Profile"}
            onClick={() => {
              if (activeProfile?.isDefault) {
                handleNewProfile();
              } else {
                // Save current settings to active profile
                saveSettingsToProfile();

                // Show toast notification
                toast({
                  title: 'Settings Saved',
                  description: `Settings saved to profile "${activeProfile.name}"`,
                  variant: 'default',
                });
              }
            }}
            /* Always enabled */
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>

        {/* Font Selector */}
        <Popover open={fontOpen} onOpenChange={setFontOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              aria-expanded={fontOpen}
              className="w-[150px] justify-between"
            >
              <Type className="mr-2 h-4 w-4" />
              <span className="truncate">{settings?.font?.name || 'Select Font'}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command value={settings?.font?.value || ''} shouldFilter={false}>
              <CommandInput placeholder="Search font..." />
              <CommandEmpty>No font found.</CommandEmpty>
              <CommandGroup>
                {monospacefonts.map((font) => (
                  <CommandItem
                    key={font.value}
                    value={font.name.toLowerCase()}
                    onSelect={() => {
                      handleUpdateSetting('font', font);
                      setFontOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        settings?.font?.value === font.value
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

        <div className="border-l h-8 mx-1"></div>





        {/* Density Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" title="Grid Density">
              <AlignJustify className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2">
            <div className="px-2 pb-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="density" className="text-xs font-medium">Grid Density</Label>
                <span className="text-xs text-muted-foreground">{getDensityLabel(localDensity)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                <Slider
                  id="density"
                  min={1}
                  max={3}
                  step={0.25}
                  value={[localDensity]}
                  onValueChange={([value]) => {
                    // Use a local state to handle the change smoothly
                    handleUpdateSetting('density', value);
                  }}
                />
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <Separator className="my-2" />
            <div className="px-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="font-size" className="text-xs font-medium">Font Size</Label>
                <span className="text-xs text-muted-foreground">{localFontSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                <Slider
                  id="font-size"
                  min={10}
                  max={18}
                  step={1}
                  value={[localFontSize]}
                  onValueChange={([value]) => {
                    handleUpdateSetting('fontSize', value);
                  }}
                />
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
            <DropdownMenuItem asChild>
              <label className="flex w-full cursor-pointer items-center">
                <FileInput className="mr-2 h-4 w-4" />
                <span>Import Settings</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    try {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const content = event.target?.result as string;
                            if (!content) {
                              console.error('Failed to import profile: Empty file');
                              return;
                            }

                            // Try to parse the JSON first to validate
                            try {
                              JSON.parse(content);
                            } catch (parseError) {
                              console.error('Failed to import profile: Invalid JSON', parseError);
                              return;
                            }

                            // Import the profile
                            const success = importProfile(content);
                            if (success) {
                              console.log('Profile imported successfully');
                              // You could add a toast notification here
                            } else {
                              console.error('Failed to import profile: Invalid profile data');
                              // You could add an error toast notification here
                            }
                          } catch (error) {
                            console.error('Error during profile import:', error);
                          }
                        };

                        reader.onerror = () => {
                          console.error('Failed to read file');
                        };

                        reader.readAsText(file);
                      }

                      // Reset the input
                      if (e.target) {
                        e.target.value = '';
                      }
                    } catch (error) {
                      console.error('Error handling file import:', error);
                    }
                  }}
                />
              </label>
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
            <DropdownMenuItem onClick={() => setExpressionEditorOpen(true)}>
              <span>Expression Editor</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setColumnSettingsOpen(true)}>
              Column Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Edit/Create Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? `Edit Profile: ${editingProfile.name}` : 'Create New Profile'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile-name" className="text-right">
                Name
              </Label>
              <Input
                id="profile-name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder={editingProfile ? editingProfile.name : `Profile ${profiles.length + 1}`}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile-font" className="text-right">
                Font
              </Label>
              <div className="col-span-3">
                <select
                  id="profile-font"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={tempFont.value}
                  onChange={(e) => {
                    const selected = monospacefonts.find(f => f.value === e.target.value);
                    if (selected) setTempFont(selected);
                  }}
                >
                  {monospacefonts.map((font) => (
                    <option key={font.value} value={font.value}>{font.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile-font-size" className="text-right">
                Font Size
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  id="profile-font-size"
                  min={10}
                  max={18}
                  step={1}
                  value={[tempFontSize]}
                  onValueChange={([value]) => setTempFontSize(value)}
                  className="flex-1"
                />
                <span className="w-10 text-sm">{tempFontSize}px</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile-density" className="text-right">
                Density
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  id="profile-density"
                  min={1}
                  max={3}
                  step={0.25}
                  value={[tempDensity]}
                  onValueChange={([value]) => setTempDensity(value)}
                  className="flex-1"
                />
                <span className="w-20 text-sm">{getDensityLabel(tempDensity)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              {editingProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ColumnSettingsDialog
        open={columnSettingsOpen}
        onOpenChange={setColumnSettingsOpen}
        columnList={columnList}
        selectedColumn={selectedColumn}
        onSelectColumn={setSelectedColumn}
      />
    </div>
  );
}