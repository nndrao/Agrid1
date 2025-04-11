import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  BorderTop,
  BorderRight,
  BorderBottom,
  BorderLeft,
  BorderAll,
  BorderClear,
  DeleteOutline,
  Add,
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import { 
  ColumnState, 
  BorderConfig, 
  ConditionalFormat,
  HorizontalAlignment
} from './types';

interface CellStyleSettingsProps {
  column: ColumnState;
  onChange: (column: ColumnState) => void;
}

const fontFamilies = [
  'Arial',
  'Calibri',
  'Courier New',
  'Georgia',
  'Helvetica',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
];

const fontSizes = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72
];

const fontWeights = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'bold', label: 'Bold' },
];

const borderStyles = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'double', label: 'Double' },
];

const borderWidths = [0, 1, 2, 3, 4, 5];

const alignmentOptions = [
  { value: 'left', icon: <FormatAlignLeft /> },
  { value: 'center', icon: <FormatAlignCenter /> },
  { value: 'right', icon: <FormatAlignRight /> },
];

const conditionOperators = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'lessThan', label: 'Less Than' },
  { value: 'lessThanOrEqual', label: 'Less Than or Equal' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does Not Contain' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
  { value: 'blank', label: 'Is Blank' },
  { value: 'notBlank', label: 'Is Not Blank' },
];

export const CellStyleSettings: React.FC<CellStyleSettingsProps> = ({ column, onChange }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeBorder, setActiveBorder] = useState<'top' | 'right' | 'bottom' | 'left' | 'all'>('all');
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [conditionalTextColorPicker, setConditionalTextColorPicker] = useState<number | null>(null);
  const [conditionalBgColorPicker, setConditionalBgColorPicker] = useState<number | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Helper to update cell font properties
  const updateCellFont = (key: keyof typeof column.cellFont, value: any) => {
    const updatedColumn = {
      ...column,
      cellFont: {
        ...column.cellFont,
        [key]: value,
      },
    };
    onChange(updatedColumn);
  };

  // Helper to update cell alignment
  const updateCellAlignment = (alignment: HorizontalAlignment) => {
    onChange({
      ...column,
      cellAlignment: alignment,
    });
  };

  // Helper to update cell background color
  const updateCellBackgroundColor = (color: string) => {
    onChange({
      ...column,
      cellBackgroundColor: color,
    });
  };

  // Helper to update cell borders
  const updateCellBorder = (property: keyof typeof column.cellBorders, key: keyof BorderConfig, value: any) => {
    // If "all" is selected, update all borders
    if (activeBorder === 'all') {
      const updatedBorders = {
        top: { ...column.cellBorders.top, [key]: value },
        right: { ...column.cellBorders.right, [key]: value },
        bottom: { ...column.cellBorders.bottom, [key]: value },
        left: { ...column.cellBorders.left, [key]: value },
      };
      
      onChange({
        ...column,
        cellBorders: updatedBorders,
      });
    } else {
      // Otherwise update only the selected border
      onChange({
        ...column,
        cellBorders: {
          ...column.cellBorders,
          [activeBorder]: {
            ...column.cellBorders[activeBorder],
            [key]: value,
          },
        },
      });
    }
  };

  // Helper to add a new conditional format
  const addConditionalFormat = () => {
    const newFormat: ConditionalFormat = {
      condition: {
        operator: 'equals',
        value: '',
      },
      backgroundColor: '#ffffff',
      textColor: '#000000',
      bold: false,
      italic: false,
    };
    
    onChange({
      ...column,
      conditionalFormats: [...column.conditionalFormats, newFormat],
    });
  };

  // Helper to update a conditional format
  const updateConditionalFormat = (index: number, key: string, value: any) => {
    const updatedFormats = [...column.conditionalFormats];
    
    if (key.includes('.')) {
      // Handle nested properties like 'condition.operator'
      const [parentKey, childKey] = key.split('.');
      updatedFormats[index] = {
        ...updatedFormats[index],
        [parentKey]: {
          ...updatedFormats[index][parentKey as keyof ConditionalFormat],
          [childKey]: value,
        },
      };
    } else {
      // Handle top level properties
      updatedFormats[index] = {
        ...updatedFormats[index],
        [key]: value,
      };
    }
    
    onChange({
      ...column,
      conditionalFormats: updatedFormats,
    });
  };

  // Helper to remove a conditional format
  const removeConditionalFormat = (index: number) => {
    const updatedFormats = [...column.conditionalFormats];
    updatedFormats.splice(index, 1);
    
    onChange({
      ...column,
      conditionalFormats: updatedFormats,
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="cell style settings tabs"
      >
        <Tab label="Default Styling" />
        <Tab label="Conditional Formatting" />
      </Tabs>
      
      {/* Default Styling Tab */}
      {activeTab === 0 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Font Settings
          </Typography>
          
          <Grid container spacing={2}>
            {/* Font Family */}
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={column.cellFont.family}
                  label="Font Family"
                  onChange={(e) => updateCellFont('family', e.target.value)}
                >
                  {fontFamilies.map((font) => (
                    <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Font Size */}
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Font Size</InputLabel>
                <Select
                  value={column.cellFont.size}
                  label="Font Size"
                  onChange={(e) => updateCellFont('size', Number(e.target.value))}
                >
                  {fontSizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Font Weight */}
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Font Weight</InputLabel>
                <Select
                  value={column.cellFont.weight}
                  label="Font Weight"
                  onChange={(e) => updateCellFont('weight', e.target.value)}
                >
                  {fontWeights.map((weight) => (
                    <MenuItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Text Style Buttons */}
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Tooltip title="Bold">
                  <IconButton
                    color={column.cellFont.weight === 'bold' ? 'primary' : 'default'}
                    onClick={() => updateCellFont('weight', column.cellFont.weight === 'bold' ? 'normal' : 'bold')}
                  >
                    <FormatBold />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Italic">
                  <IconButton
                    color={column.cellFont.style === 'italic' ? 'primary' : 'default'}
                    onClick={() => updateCellFont('style', column.cellFont.style === 'italic' ? 'normal' : 'italic')}
                  >
                    <FormatItalic />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            
            {/* Text Color */}
            <Grid item xs={6}>
              <Typography variant="body2" gutterBottom>
                Text Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 20,
                    border: '1px solid #ccc',
                    backgroundColor: column.cellFont.color,
                    cursor: 'pointer',
                    mr: 1,
                  }}
                  onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                />
                <Typography variant="body2">{column.cellFont.color}</Typography>
              </Box>
              {showTextColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2 }}>
                  <Box
                    sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                    onClick={() => setShowTextColorPicker(false)}
                  />
                  <SketchPicker
                    color={column.cellFont.color}
                    onChange={(color) => updateCellFont('color', color.hex)}
                  />
                </Box>
              )}
            </Grid>
            
            {/* Background Color */}
            <Grid item xs={6}>
              <Typography variant="body2" gutterBottom>
                Background Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 20,
                    border: '1px solid #ccc',
                    backgroundColor: column.cellBackgroundColor,
                    cursor: 'pointer',
                    mr: 1,
                  }}
                  onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
                />
                <Typography variant="body2">{column.cellBackgroundColor}</Typography>
              </Box>
              {showBackgroundColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2 }}>
                  <Box
                    sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                    onClick={() => setShowBackgroundColorPicker(false)}
                  />
                  <SketchPicker
                    color={column.cellBackgroundColor}
                    onChange={(color) => updateCellBackgroundColor(color.hex)}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Alignment
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {alignmentOptions.map((option) => (
              <IconButton
                key={option.value}
                color={column.cellAlignment === option.value ? 'primary' : 'default'}
                onClick={() => updateCellAlignment(option.value as HorizontalAlignment)}
              >
                {option.icon}
              </IconButton>
            ))}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Border Settings
          </Typography>
          
          <Grid container spacing={2}>
            {/* Border Selection */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="All Borders">
                  <IconButton
                    color={activeBorder === 'all' ? 'primary' : 'default'}
                    onClick={() => setActiveBorder('all')}
                  >
                    <BorderAll />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Top Border">
                  <IconButton
                    color={activeBorder === 'top' ? 'primary' : 'default'}
                    onClick={() => setActiveBorder('top')}
                  >
                    <BorderTop />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Right Border">
                  <IconButton
                    color={activeBorder === 'right' ? 'primary' : 'default'}
                    onClick={() => setActiveBorder('right')}
                  >
                    <BorderRight />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bottom Border">
                  <IconButton
                    color={activeBorder === 'bottom' ? 'primary' : 'default'}
                    onClick={() => setActiveBorder('bottom')}
                  >
                    <BorderBottom />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Left Border">
                  <IconButton
                    color={activeBorder === 'left' ? 'primary' : 'default'}
                    onClick={() => setActiveBorder('left')}
                  >
                    <BorderLeft />
                  </IconButton>
                </Tooltip>
                <Tooltip title="No Borders">
                  <IconButton onClick={() => updateCellBorder(activeBorder, 'style', 'none')}>
                    <BorderClear />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            
            {/* Border Style */}
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Border Style</InputLabel>
                <Select
                  value={activeBorder === 'all' ? column.cellBorders.top.style : column.cellBorders[activeBorder].style}
                  label="Border Style"
                  onChange={(e) => updateCellBorder(activeBorder, 'style', e.target.value)}
                >
                  {borderStyles.map((style) => (
                    <MenuItem key={style.value} value={style.value}>
                      {style.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Border Width */}
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Border Width</InputLabel>
                <Select
                  value={activeBorder === 'all' ? column.cellBorders.top.width : column.cellBorders[activeBorder].width}
                  label="Border Width"
                  onChange={(e) => updateCellBorder(activeBorder, 'width', Number(e.target.value))}
                >
                  {borderWidths.map((width) => (
                    <MenuItem key={width} value={width}>
                      {width}px
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Border Color */}
            <Grid item xs={4}>
              <Typography variant="body2" gutterBottom>
                Border Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 20,
                    border: '1px solid #ccc',
                    backgroundColor: activeBorder === 'all' ? column.cellBorders.top.color : column.cellBorders[activeBorder].color,
                    cursor: 'pointer',
                    mr: 1,
                  }}
                  onClick={() => setShowBorderColorPicker(!showBorderColorPicker)}
                />
                <Typography variant="body2">
                  {activeBorder === 'all' ? column.cellBorders.top.color : column.cellBorders[activeBorder].color}
                </Typography>
              </Box>
              {showBorderColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2 }}>
                  <Box
                    sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                    onClick={() => setShowBorderColorPicker(false)}
                  />
                  <SketchPicker
                    color={activeBorder === 'all' ? column.cellBorders.top.color : column.cellBorders[activeBorder].color}
                    onChange={(color) => updateCellBorder(activeBorder, 'color', color.hex)}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Conditional Formatting Tab */}
      {activeTab === 1 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Apply formatting based on cell values
          </Typography>
          
          {column.conditionalFormats.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No conditional formats configured. Click "Add Format Rule" to create one.
            </Typography>
          ) : (
            column.conditionalFormats.map((format, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Condition</InputLabel>
                      <Select
                        value={format.condition.operator}
                        label="Condition"
                        onChange={(e) => updateConditionalFormat(index, 'condition.operator', e.target.value)}
                      >
                        {conditionOperators.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6}>
                    {format.condition.operator !== 'blank' && format.condition.operator !== 'notBlank' && (
                      <TextField
                        fullWidth
                        size="small"
                        label="Value"
                        value={format.condition.value}
                        onChange={(e) => updateConditionalFormat(index, 'condition.value', e.target.value)}
                      />
                    )}
                  </Grid>
                  
                  <Grid item xs={2}>
                    <IconButton
                      color="error"
                      onClick={() => removeConditionalFormat(index)}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      Formatting to apply when condition is met:
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Text Color:
                      </Typography>
                      <Box
                        sx={{
                          width: 30,
                          height: 15,
                          border: '1px solid #ccc',
                          backgroundColor: format.textColor,
                          cursor: 'pointer',
                          mr: 1,
                        }}
                        onClick={() => setConditionalTextColorPicker(index)}
                      />
                    </Box>
                    {conditionalTextColorPicker === index && (
                      <Box sx={{ position: 'absolute', zIndex: 2 }}>
                        <Box
                          sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                          onClick={() => setConditionalTextColorPicker(null)}
                        />
                        <SketchPicker
                          color={format.textColor}
                          onChange={(color) => updateConditionalFormat(index, 'textColor', color.hex)}
                        />
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Background:
                      </Typography>
                      <Box
                        sx={{
                          width: 30,
                          height: 15,
                          border: '1px solid #ccc',
                          backgroundColor: format.backgroundColor,
                          cursor: 'pointer',
                          mr: 1,
                        }}
                        onClick={() => setConditionalBgColorPicker(index)}
                      />
                    </Box>
                    {conditionalBgColorPicker === index && (
                      <Box sx={{ position: 'absolute', zIndex: 2 }}>
                        <Box
                          sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                          onClick={() => setConditionalBgColorPicker(null)}
                        />
                        <SketchPicker
                          color={format.backgroundColor}
                          onChange={(color) => updateConditionalFormat(index, 'backgroundColor', color.hex)}
                        />
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={format.bold}
                          onChange={(e) => updateConditionalFormat(index, 'bold', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Bold"
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={format.italic}
                          onChange={(e) => updateConditionalFormat(index, 'italic', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Italic"
                    />
                  </Grid>
                </Grid>
              </Box>
            ))
          )}
          
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addConditionalFormat}
            sx={{ mt: 2 }}
          >
            Add Format Rule
          </Button>
        </Box>
      )}
    </Box>
  );
}; 