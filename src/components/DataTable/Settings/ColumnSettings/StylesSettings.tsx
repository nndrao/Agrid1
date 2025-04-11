import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, TextField, Select, MenuItem, 
  FormControl, InputLabel, Grid, Divider, Paper, Button, Popover } from '@mui/material';
import { ColumnState } from './types';
import { ChromePicker } from 'react-color';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`styles-tabpanel-${index}`}
      aria-labelledby={`styles-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface StylesSettingsProps {
  columnState: ColumnState;
  onColumnStateChange: (columnState: ColumnState) => void;
}

const StylesSettings: React.FC<StylesSettingsProps> = ({ 
  columnState, 
  onColumnStateChange 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [headerColorPickerOpen, setHeaderColorPickerOpen] = useState<string | null>(null);
  const [cellColorPickerOpen, setCellColorPickerOpen] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Initialize header styles with defaults if not set
  useEffect(() => {
    if (!columnState.headerStyles) {
      onColumnStateChange({
        ...columnState,
        headerStyles: {
          backgroundColor: '#f5f5f5',
          textColor: '#333333',
          fontWeight: 'bold',
          fontSize: 14,
          textAlign: 'left',
          fontStyle: 'normal'
        }
      });
    }
  }, [columnState, onColumnStateChange]);

  // Initialize cell styles with defaults if not set
  useEffect(() => {
    if (!columnState.cellStyles) {
      onColumnStateChange({
        ...columnState,
        cellStyles: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontWeight: 'normal',
          fontSize: 14,
          textAlign: 'left',
          fontStyle: 'normal',
          padding: 8,
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: '#e0e0e0'
        }
      });
    }
  }, [columnState, onColumnStateChange]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleHeaderStyleChange = (field: string, value: string | number) => {
    onColumnStateChange({
      ...columnState,
      headerStyles: {
        ...columnState.headerStyles,
        [field]: value
      }
    });
  };

  const handleCellStyleChange = (field: string, value: string | number) => {
    onColumnStateChange({
      ...columnState,
      cellStyles: {
        ...columnState.cellStyles,
        [field]: value
      }
    });
  };

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>, type: string, field: string) => {
    setAnchorEl(event.currentTarget);
    if (type === 'header') {
      setHeaderColorPickerOpen(field);
    } else {
      setCellColorPickerOpen(field);
    }
  };

  const handleColorPickerClose = () => {
    setHeaderColorPickerOpen(null);
    setCellColorPickerOpen(null);
    setAnchorEl(null);
  };

  const handleHeaderColorChange = (color: any, field: string) => {
    handleHeaderStyleChange(field, color.hex);
  };

  const handleCellColorChange = (color: any, field: string) => {
    handleCellStyleChange(field, color.hex);
  };

  const textAlignOptions = ['left', 'center', 'right'];
  const fontStyleOptions = ['normal', 'italic', 'oblique'];
  const fontWeightOptions = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
  const borderStyleOptions = ['none', 'solid', 'dashed', 'dotted', 'double'];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="styles settings tabs">
          <Tab label="Header Styles" id="styles-tab-0" aria-controls="styles-tabpanel-0" />
          <Tab label="Cell Styles" id="styles-tab-1" aria-controls="styles-tabpanel-1" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Typography variant="h6" gutterBottom>
          Header Styles
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              onClick={(e) => handleColorPickerOpen(e, 'header', 'backgroundColor')}
              sx={{ 
                height: '56px', 
                width: '100%', 
                mb: 2,
                backgroundColor: columnState.headerStyles?.backgroundColor || '#f5f5f5',
                color: '#000000',
                '&:hover': {
                  backgroundColor: columnState.headerStyles?.backgroundColor || '#f5f5f5',
                  opacity: 0.9
                }
              }}
            >
              Background Color
            </Button>
            
            <Button
              variant="outlined"
              onClick={(e) => handleColorPickerOpen(e, 'header', 'textColor')}
              sx={{ 
                height: '56px', 
                width: '100%',
                mb: 2,
                backgroundColor: columnState.headerStyles?.textColor || '#333333',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: columnState.headerStyles?.textColor || '#333333',
                  opacity: 0.9
                }
              }}
            >
              Text Color
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="header-font-weight-label">Font Weight</InputLabel>
              <Select
                labelId="header-font-weight-label"
                value={columnState.headerStyles?.fontWeight || 'bold'}
                label="Font Weight"
                onChange={(e) => handleHeaderStyleChange('fontWeight', e.target.value)}
              >
                {fontWeightOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Font Size"
              type="number"
              value={columnState.headerStyles?.fontSize || 14}
              onChange={(e) => handleHeaderStyleChange('fontSize', Number(e.target.value))}
              InputProps={{ inputProps: { min: 8, max: 32 } }}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="header-text-align-label">Text Align</InputLabel>
              <Select
                labelId="header-text-align-label"
                value={columnState.headerStyles?.textAlign || 'left'}
                label="Text Align"
                onChange={(e) => handleHeaderStyleChange('textAlign', e.target.value)}
              >
                {textAlignOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="header-font-style-label">Font Style</InputLabel>
              <Select
                labelId="header-font-style-label"
                value={columnState.headerStyles?.fontStyle || 'normal'}
                label="Font Style"
                onChange={(e) => handleHeaderStyleChange('fontStyle', e.target.value)}
              >
                {fontStyleOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Preview
            </Typography>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                backgroundColor: columnState.headerStyles?.backgroundColor || '#f5f5f5',
                color: columnState.headerStyles?.textColor || '#333333',
                fontWeight: columnState.headerStyles?.fontWeight || 'bold',
                fontSize: `${columnState.headerStyles?.fontSize || 14}px`,
                textAlign: columnState.headerStyles?.textAlign as any || 'left',
                fontStyle: columnState.headerStyles?.fontStyle as any || 'normal'
              }}
            >
              {columnState.title || columnState.field}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom>
          Cell Styles
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              onClick={(e) => handleColorPickerOpen(e, 'cell', 'backgroundColor')}
              sx={{ 
                height: '56px', 
                width: '100%', 
                mb: 2,
                backgroundColor: columnState.cellStyles?.backgroundColor || '#ffffff',
                color: '#000000',
                '&:hover': {
                  backgroundColor: columnState.cellStyles?.backgroundColor || '#ffffff',
                  opacity: 0.9
                }
              }}
            >
              Background Color
            </Button>
            
            <Button
              variant="outlined"
              onClick={(e) => handleColorPickerOpen(e, 'cell', 'textColor')}
              sx={{ 
                height: '56px', 
                width: '100%',
                mb: 2,
                backgroundColor: columnState.cellStyles?.textColor || '#000000',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: columnState.cellStyles?.textColor || '#000000',
                  opacity: 0.9
                }
              }}
            >
              Text Color
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="cell-font-weight-label">Font Weight</InputLabel>
              <Select
                labelId="cell-font-weight-label"
                value={columnState.cellStyles?.fontWeight || 'normal'}
                label="Font Weight"
                onChange={(e) => handleCellStyleChange('fontWeight', e.target.value)}
              >
                {fontWeightOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Font Size"
              type="number"
              value={columnState.cellStyles?.fontSize || 14}
              onChange={(e) => handleCellStyleChange('fontSize', Number(e.target.value))}
              InputProps={{ inputProps: { min: 8, max: 32 } }}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="cell-text-align-label">Text Align</InputLabel>
              <Select
                labelId="cell-text-align-label"
                value={columnState.cellStyles?.textAlign || 'left'}
                label="Text Align"
                onChange={(e) => handleCellStyleChange('textAlign', e.target.value)}
              >
                {textAlignOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="cell-font-style-label">Font Style</InputLabel>
              <Select
                labelId="cell-font-style-label"
                value={columnState.cellStyles?.fontStyle || 'normal'}
                label="Font Style"
                onChange={(e) => handleCellStyleChange('fontStyle', e.target.value)}
              >
                {fontStyleOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Padding"
              type="number"
              value={columnState.cellStyles?.padding || 8}
              onChange={(e) => handleCellStyleChange('padding', Number(e.target.value))}
              InputProps={{ inputProps: { min: 0, max: 24 } }}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="cell-border-style-label">Border Style</InputLabel>
              <Select
                labelId="cell-border-style-label"
                value={columnState.cellStyles?.borderStyle || 'solid'}
                label="Border Style"
                onChange={(e) => handleCellStyleChange('borderStyle', e.target.value)}
              >
                {borderStyleOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Border Width"
              type="number"
              value={columnState.cellStyles?.borderWidth || 1}
              onChange={(e) => handleCellStyleChange('borderWidth', Number(e.target.value))}
              InputProps={{ inputProps: { min: 0, max: 10 } }}
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="outlined"
              onClick={(e) => handleColorPickerOpen(e, 'cell', 'borderColor')}
              sx={{ 
                height: '56px', 
                width: '100%',
                mb: 2,
                borderColor: columnState.cellStyles?.borderColor || '#e0e0e0',
                borderWidth: 2,
                color: '#000000'
              }}
            >
              Border Color
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Preview
            </Typography>
            <Paper 
              elevation={1} 
              sx={{ 
                p: columnState.cellStyles?.padding || 8, 
                backgroundColor: columnState.cellStyles?.backgroundColor || '#ffffff',
                color: columnState.cellStyles?.textColor || '#000000',
                fontWeight: columnState.cellStyles?.fontWeight || 'normal',
                fontSize: `${columnState.cellStyles?.fontSize || 14}px`,
                textAlign: columnState.cellStyles?.textAlign as any || 'left',
                fontStyle: columnState.cellStyles?.fontStyle as any || 'normal',
                border: columnState.cellStyles?.borderStyle !== 'none' 
                  ? `${columnState.cellStyles?.borderWidth || 1}px ${columnState.cellStyles?.borderStyle || 'solid'} ${columnState.cellStyles?.borderColor || '#e0e0e0'}`
                  : 'none'
              }}
            >
              Sample Cell Value
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <Popover
        open={Boolean(headerColorPickerOpen) || Boolean(cellColorPickerOpen)}
        anchorEl={anchorEl}
        onClose={handleColorPickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 1 }}>
          {headerColorPickerOpen && (
            <ChromePicker 
              color={columnState.headerStyles?.[headerColorPickerOpen as keyof typeof columnState.headerStyles] as string || '#f5f5f5'} 
              onChange={(color) => handleHeaderColorChange(color, headerColorPickerOpen)}
              disableAlpha
            />
          )}
          {cellColorPickerOpen && (
            <ChromePicker 
              color={columnState.cellStyles?.[cellColorPickerOpen as keyof typeof columnState.cellStyles] as string || '#ffffff'} 
              onChange={(color) => handleCellColorChange(color, cellColorPickerOpen)}
              disableAlpha
            />
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default StylesSettings; 