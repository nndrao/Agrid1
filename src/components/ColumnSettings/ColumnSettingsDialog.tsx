import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TabsWrapper } from './TabsWrapper';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, Save, Trash2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';

import { ColumnList } from './ColumnList';
import { GeneralTab } from './tabs/GeneralTab';
import { HeaderTab } from './tabs/HeaderTab';
import { CellTab } from './tabs/CellTab';
import { FilterTab } from './tabs/FilterTab';
import { FormattersTab } from './tabs/FormattersTab';
import { EditorsTab } from './tabs/EditorsTab';
import { useColumnSettings } from './useColumnSettings';

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnList: string[];
  selectedColumn: string;
  onSelectColumn: (col: string) => void;
}

// Create a context for managing dialog interactions
const DialogInteractionContext = React.createContext({ isDialogOpen: false });

export const ColumnSettingsDialog: React.FC<ColumnSettingsDialogProps> = ({
  open,
  onOpenChange,
  columnList,
  selectedColumn,
  onSelectColumn
}) => {
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Profile management
  const [profilesOpen, setProfilesOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profilesVersion, setProfilesVersion] = useState(0);

  const {
    state,
    updateGeneral,
    updateHeader,
    updateCell,
    resetForColumn: resetColumnSettings,
    applySettingsToGrid,
    saveProfile,
    loadProfile,
    getProfiles,
    deleteProfile
  } = useColumnSettings(selectedColumn);

  // Memoize the resetForColumn function to prevent infinite loops
  const resetForColumn = useCallback((column: string) => {
    resetColumnSettings(column);
  }, [resetColumnSettings]);

  // Update state when selected column changes
  useEffect(() => {
    console.log('ColumnSettingsDialog: open =', open, 'selectedColumn =', selectedColumn);
    if (open && selectedColumn) {
      // Check if there's a saved profile for this column
      const savedProfilesJson = localStorage.getItem('columnSettingsProfiles') || '{}';
      const savedProfiles = JSON.parse(savedProfilesJson);

      // Look for a profile with the column name
      const profileName = `${selectedColumn}_settings`;

      if (savedProfiles[profileName]) {
        // Load the saved profile
        const success = loadProfile(profileName);
        if (success) {
          setSelectedProfile(profileName);
          console.log(`Loaded saved settings for column ${selectedColumn}`);

          // Apply the settings to the grid immediately
          setTimeout(() => {
            applySettingsToGrid(selectedColumn);
            console.log(`Applied saved settings for column ${selectedColumn}`);
          }, 100); // Small delay to ensure state is updated
        }
      } else {
        // No saved profile, reset to default
        resetForColumn(selectedColumn);
      }

      // Force refresh of available profiles
      setProfilesVersion(prev => prev + 1);
    }
  }, [selectedColumn, open, resetForColumn, loadProfile, applySettingsToGrid, setProfilesVersion]); // Now using memoized resetForColumn

  // Replace the current useEffect for handling focus and the global key listener with this:
  useEffect(() => {
    if (open && activeTab === "general") {
      // Schedule focus to run after the component has rendered
      const focusTimer = setTimeout(() => {
        try {
          // Use the Radix Dialog's built-in autofocus mechanism
          const headerNameInput = document.getElementById('header-name');
          if (headerNameInput) {
            console.log('Focusing header-name input');
            // Use the focusVisible option for better keyboard navigation
            (headerNameInput as HTMLInputElement).focus({preventScroll: true});
          }
        } catch (error) {
          console.error('Error focusing header-name input:', error);
        }
      }, 100);

      return () => clearTimeout(focusTimer);
    }
  }, [open, activeTab]);

  // Handle form submission
  const handleApplyChanges = useCallback(async () => {
    // Show applying state
    setIsApplying(true);

    try {
      // Store the header name for later use in toast
      const headerName = state.general.headerName;

      // Apply the changes to the grid
      const success = applySettingsToGrid(selectedColumn);

      if (success) {
        // Save the settings to a profile with the column name
        const profileName = `${selectedColumn}_settings`;
        saveProfile(profileName);

        // Increment version to refresh the profiles list
        setProfilesVersion(prev => prev + 1);

        toast({
          title: "Column settings updated",
          description: `Settings for "${headerName}" have been applied and saved.`,
          variant: "default",
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Error updating column",
          description: "There was a problem applying the column settings. Check the console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error applying column settings:", error);
      toast({
        title: "Error updating column",
        description: "An unexpected error occurred. Check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  }, [applySettingsToGrid, onOpenChange, selectedColumn, state.general.headerName, toast, setIsApplying, saveProfile, setProfilesVersion]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetForColumn(selectedColumn);
    toast({
      title: "Settings reset",
      description: `Column settings for "${selectedColumn}" have been reset.`,
      variant: "default",
    });
  }, [resetForColumn, selectedColumn, toast]);

  // Force refresh of available profiles

  // Get available profiles - re-fetch when profilesVersion changes
  const availableProfiles = useMemo(() => {
    // Using profilesVersion to trigger re-fetch when profiles change
    console.log('Fetching profiles (version:', profilesVersion, ')');
    const profiles = getProfiles();
    console.log('Available profiles in dialog:', profiles);
    return profiles;
  }, [getProfiles, profilesVersion]);

  // Handle save to profile
  const handleSaveToProfile = useCallback(() => {
    if (!newProfileName) {
      toast({
        title: "Profile name required",
        description: "Please enter a name for the profile.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      const success = saveProfile(newProfileName);

      if (success) {
        toast({
          title: "Profile saved",
          description: `Settings saved to profile "${newProfileName}".`,
          variant: "default",
        });
        setProfilesOpen(false);
        setNewProfileName('');
        // Increment version to refresh the profiles list
        setProfilesVersion(prev => prev + 1);
      } else {
        toast({
          title: "Error saving profile",
          description: "There was a problem saving the profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }, [newProfileName, saveProfile, toast, setProfilesVersion]);

  // Handle load from profile
  const handleLoadFromProfile = useCallback((profileName: string) => {
    try {
      const success = loadProfile(profileName);

      if (success) {
        // Apply the settings to the grid immediately
        setTimeout(() => {
          const applySuccess = applySettingsToGrid(selectedColumn);
          if (applySuccess) {
            console.log(`Applied settings from profile "${profileName}" to column ${selectedColumn}`);
          }
        }, 100); // Small delay to ensure state is updated

        toast({
          title: "Profile loaded",
          description: `Settings loaded from profile "${profileName}" and applied to the grid.`,
          variant: "default",
        });
        setSelectedProfile(profileName);
        setProfilesOpen(false);
      } else {
        toast({
          title: "Error loading profile",
          description: `Profile "${profileName}" not found.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error loading profile",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [loadProfile, toast, applySettingsToGrid, selectedColumn]);

  // Handle delete profile
  const handleDeleteProfile = useCallback((profileName: string) => {
    try {
      const success = deleteProfile(profileName);

      if (success) {
        toast({
          title: "Profile deleted",
          description: `Profile "${profileName}" has been deleted.`,
          variant: "default",
        });

        // If the deleted profile was selected, clear the selection
        if (selectedProfile === profileName) {
          setSelectedProfile(null);
        }

        // Increment version to refresh the profiles list
        setProfilesVersion(prev => prev + 1);
      } else {
        toast({
          title: "Error deleting profile",
          description: `Could not delete profile "${profileName}".`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error deleting profile",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [deleteProfile, selectedProfile, toast, setProfilesVersion]);

  return (
    <DialogInteractionContext.Provider value={{ isDialogOpen: open }}>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent
          className="p-4 sm:p-5 bg-background rounded-xl shadow-lg border border-border/80"
          style={{
            width: 800,
            minWidth: 800,
            maxWidth: 800,
            height: 840,
            maxHeight: 940,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}
          onPointerDownCapture={(e) => {
            // Prevent dialog from capturing specific events
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.closest('.ag-grid-contain, .column-settings-input-contain')) {
              e.stopPropagation();
            }
          }}
          onKeyDownCapture={(e) => {
            // Prevent keydown events from being captured by the dialog
            // for specific elements
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT') {
              e.stopPropagation();
            }
          }}
        >
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-[20px] font-semibold text-foreground flex items-center gap-2">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-primary"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9h10M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Column Settings: {state.general.headerName}
            </DialogTitle>
            <div className="text-[13px] text-muted-foreground mt-1">Configure display and behavior for this column</div>
          </DialogHeader>

          <div className="flex flex-row min-h-0 flex-1">
            {/* Sidebar */}
            <ColumnList
              columns={columnList}
              selectedColumn={selectedColumn}
              onSelectColumn={(column) => {
                if (column !== selectedColumn) {
                  // Update the selected column in the parent component
                  onSelectColumn(column);
                }
              }}
            />
            {/* Main Content */}
            <div className="flex-1 pl-6 overflow-y-hidden" style={{ maxHeight: 740 }}>
              <TabsWrapper
                state={state}
                updateGeneral={updateGeneral}
                updateHeader={updateHeader}
                updateCell={updateCell}
                selectedColumn={selectedColumn}
              />
            </div>
          </div>
          {/* Footer: match Expression Editor dialog */}
          <div className="flex justify-between border-t border-border/80" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onOpenChange(false)}
                disabled={isApplying}
              >
                Cancel
              </Button>

              {/* Profile Management */}
              <Popover open={profilesOpen} onOpenChange={setProfilesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={profilesOpen}
                    className="h-8 px-3 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground flex items-center gap-1"
                    disabled={isApplying}
                  >
                    <Save className="h-3.5 w-3.5" />
                    {selectedProfile ? `Profile: ${selectedProfile}` : "Profiles"}
                    <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search profiles..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No profiles found.</CommandEmpty>
                      <CommandGroup heading="Save Profile">
                        <div className="flex items-center px-2 py-1.5">
                          <Input
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            placeholder="Profile name"
                            className="h-8 text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-8 px-2"
                            onClick={handleSaveToProfile}
                            disabled={!newProfileName || isSavingProfile}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </CommandGroup>
                      {availableProfiles.length > 0 && (
                        <CommandGroup heading="Available Profiles">
                          {availableProfiles.map((profile) => (
                            <CommandItem
                              key={profile}
                              value={profile}
                              onSelect={() => handleLoadFromProfile(profile)}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                {selectedProfile === profile && (
                                  <Check className="mr-2 h-4 w-4 text-primary" />
                                )}
                                <span>{profile}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProfile(profile);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground"
                onClick={handleReset}
                disabled={isApplying}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="h-8 px-5 text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={handleApplyChanges}
                disabled={isApplying}
              >
                {isApplying ? "Applying..." : "Apply Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DialogInteractionContext.Provider>
  );
};
