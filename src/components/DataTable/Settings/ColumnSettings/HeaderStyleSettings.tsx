import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import { ColumnState, HorizontalAlignment } from './types';

interface HeaderStyleSettingsProps {
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

const alignmentOptions = [
  { value: 'left', icon: <FormatAlignLeft /> },
  { value: 'center', icon: <FormatAlignCenter /> },
  { value: 'right', icon: <FormatAlignRight /> },
];

export const HeaderStyleSettings: React.FC<HeaderStyleSettingsProps> = ({ column, onChange }) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);

  // Helper to update header font properties
  const updateHeaderFont = (key: keyof typeof column.headerFont, value: any) => {
    const updatedColumn = {
      ...column,
      headerFont: {
        ...column.headerFont,
        [key]: value,
      },
    };
    onChange(updatedColumn);
  };

  // Helper to update header alignment
  const updateHeaderAlignment = (alignment: HorizontalAlignment) => {
    onChange({
      ...column,
      headerAlignment: alignment,
    });
  };

  // Helper to update header background color
  const updateHeaderBackgroundColor = (color: string) => {
    onChange({
      ...column,
      headerBackgroundColor: color,
    });
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Font Settings
      </Typography>
      
      <Grid container spacing={2}>
        {/* Font Family */}
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Font Family</InputLabel>
            <Select
              value={column.headerFont.family}
              label="Font Family"
              onChange={(e) => updateHeaderFont('family', e.target.value)}
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
              value={column.headerFont.size}
              label="Font Size"
              onChange={(e) => updateHeaderFont('size', Number(e.target.value))}
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
              value={column.headerFont.weight}
              label="Font Weight"
              onChange={(e) => updateHeaderFont('weight', e.target.value)}
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
                color={column.headerFont.weight === 'bold' ? 'primary' : 'default'}
                onClick={() => updateHeaderFont('weight', column.headerFont.weight === 'bold' ? 'normal' : 'bold')}
              >
                <FormatBold />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Italic">
              <IconButton
                color={column.headerFont.style === 'italic' ? 'primary' : 'default'}
                onClick={() => updateHeaderFont('style', column.headerFont.style === 'italic' ? 'normal' : 'italic')}
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
                backgroundColor: column.headerFont.color,
                cursor: 'pointer',
                mr: 1,
              }}
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
            />
            <Typography variant="body2">{column.headerFont.color}</Typography>
          </Box>
          {showTextColorPicker && (
            <Box sx={{ position: 'absolute', zIndex: 2 }}>
              <Box
                sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                onClick={() => setShowTextColorPicker(false)}
              />
              <SketchPicker
                color={column.headerFont.color}
                onChange={(color) => updateHeaderFont('color', color.hex)}
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
                backgroundColor: column.headerBackgroundColor,
                cursor: 'pointer',
                mr: 1,
              }}
              onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
            />
            <Typography variant="body2">{column.headerBackgroundColor}</Typography>
          </Box>
          {showBackgroundColorPicker && (
            <Box sx={{ position: 'absolute', zIndex: 2 }}>
              <Box
                sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
                onClick={() => setShowBackgroundColorPicker(false)}
              />
              <SketchPicker
                color={column.headerBackgroundColor}
                onChange={(color) => updateHeaderBackgroundColor(color.hex)}
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
            color={column.headerAlignment === option.value ? 'primary' : 'default'}
            onClick={() => updateHeaderAlignment(option.value as HorizontalAlignment)}
          >
            {option.icon}
          </IconButton>
        ))}
      </Box>
    </Box>
  );
}; 