import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  Checkbox,
  Paper,
  Divider,
} from '@mui/material';
import { ColumnState } from './types';

interface ValueFormattingSettingsProps {
  column: ColumnState;
  onChange: (column: ColumnState) => void;
  sampleData?: any[];
}

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
      id={`formatting-tabpanel-${index}`}
      aria-labelledby={`formatting-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Format types
const FORMAT_TYPES = {
  NUMBER: 'number',
  DATE: 'date',
  TEXT: 'text',
};

// Number formats
const numberFormats = [
  { value: 'decimal', label: 'Decimal (1,234.56)' },
  { value: 'integer', label: 'Integer (1,235)' },
  { value: 'percent', label: 'Percent (123.46%)' },
  { value: 'currency', label: 'Currency ($1,234.56)' },
  { value: 'scientific', label: 'Scientific (1.23E+3)' },
  { value: 'custom', label: 'Custom' },
];

// Date formats
const dateFormats = [
  { value: 'short', label: 'Short (MM/DD/YYYY)' },
  { value: 'medium', label: 'Medium (Mon DD, YYYY)' },
  { value: 'long', label: 'Long (Month DD, YYYY)' },
  { value: 'iso', label: 'ISO (YYYY-MM-DD)' },
  { value: 'time', label: 'Time (HH:MM:SS)' },
  { value: 'datetime', label: 'Date & Time (MM/DD/YYYY HH:MM)' },
  { value: 'custom', label: 'Custom' },
];

// Text formats
const textFormats = [
  { value: 'default', label: 'Default' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize Each Word' },
  { value: 'truncate', label: 'Truncate (with ellipsis)' },
];

// Currency options
const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CNY', label: 'CNY (¥)' },
];

export const ValueFormattingSettings: React.FC<ValueFormattingSettingsProps> = ({ 
  column, 
  onChange,
  sampleData = [] 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formatSettings, setFormatSettings] = useState(
    column.formatSettings || {
      numberFormat: 'decimal',
      decimalPlaces: 2,
      useThousandsSeparator: true,
      currencyCode: 'USD',
      dateFormat: 'medium',
      textFormat: 'default',
      maxLength: 50,
      trimWhitespace: true,
    }
  );
  const [formatType, setFormatType] = useState<'number' | 'date' | 'text'>(
    column.formatType || 'number'
  );
  const [previewValue, setPreviewValue] = useState<string>('');
  const [formattedPreview, setFormattedPreview] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');

  // Sample data for previews
  const sampleDataObj = {
    number: 12345.6789,
    date: new Date(),
    text: 'This is a Sample Text for Preview',
  };

  // Set initial preview based on format type
  useEffect(() => {
    const type = formatType || 'number';
    switch (type) {
      case 'number':
        setPreviewValue(String(sampleDataObj.number));
        break;
      case 'date':
        setPreviewValue(sampleDataObj.date.toISOString());
        break;
      case 'text':
        setPreviewValue(sampleDataObj.text);
        break;
    }
  }, [formatType]);

  // Update preview when settings change
  useEffect(() => {
    updateFormattedPreview();
  }, [formatSettings, previewValue, formatType]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const types = ['number', 'date', 'text'] as const;
    setFormatType(types[newValue]);
    
    // Update column state with the new format type
    const updatedColumn = {
      ...column,
      formatType: types[newValue],
      formatSettings: {
        ...formatSettings,
      },
    };
    onChange(updatedColumn);
  };

  const handleFormatSettingChange = (
    setting: string,
    value: string | number | boolean
  ) => {
    const newSettings = {
      ...formatSettings,
      [setting]: value,
    };
    
    setFormatSettings(newSettings);
    
    // Update column state with the new settings
    const updatedColumn = {
      ...column,
      formatType,
      formatSettings: newSettings,
    };
    onChange(updatedColumn);
  };

  const updateFormattedPreview = () => {
    setPreviewError('');
    
    try {
      switch (formatType) {
        case 'number':
          let num = parseFloat(previewValue);
          if (isNaN(num)) {
            setPreviewError('Invalid number');
            setFormattedPreview('');
            return;
          }
          
          switch (formatSettings.numberFormat) {
            case 'decimal':
              let formatted = num.toFixed(formatSettings.decimalPlaces || 2);
              if (formatSettings.useThousandsSeparator) {
                formatted = formatWithThousandsSeparator(formatted);
              }
              setFormattedPreview(formatted);
              break;
            case 'integer':
              let intFormatted = Math.round(num).toString();
              if (formatSettings.useThousandsSeparator) {
                intFormatted = formatWithThousandsSeparator(intFormatted);
              }
              setFormattedPreview(intFormatted);
              break;
            case 'percent':
              setFormattedPreview(`${(num * 100).toFixed(formatSettings.decimalPlaces || 2)}%`);
              break;
            case 'currency':
              let currencyFormatted = num.toFixed(formatSettings.decimalPlaces || 2);
              if (formatSettings.useThousandsSeparator) {
                currencyFormatted = formatWithThousandsSeparator(currencyFormatted);
              }
              
              const currencySymbol = getCurrencySymbol(formatSettings.currencyCode || 'USD');
              setFormattedPreview(`${currencySymbol}${currencyFormatted}`);
              break;
            case 'scientific':
              setFormattedPreview(num.toExponential(formatSettings.decimalPlaces || 2));
              break;
            default:
              setFormattedPreview(num.toString());
          }
          break;
          
        case 'date':
          let date: Date;
          try {
            date = new Date(previewValue);
            if (isNaN(date.getTime())) {
              throw new Error('Invalid date');
            }
          } catch (e) {
            setPreviewError('Invalid date format');
            setFormattedPreview('');
            return;
          }
          
          switch (formatSettings.dateFormat) {
            case 'short':
              setFormattedPreview(date.toLocaleDateString());
              break;
            case 'medium':
              setFormattedPreview(
                date.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              );
              break;
            case 'long':
              setFormattedPreview(
                date.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              );
              break;
            case 'iso':
              setFormattedPreview(date.toISOString());
              break;
            case 'time':
              setFormattedPreview(date.toLocaleTimeString());
              break;
            case 'datetime':
              setFormattedPreview(date.toLocaleString());
              break;
            case 'custom':
              if (formatSettings.customDateFormat) {
                // Simple custom format implementation
                // For a real app, use a library like date-fns or moment.js
                let format = formatSettings.customDateFormat;
                format = format.replace('YYYY', date.getFullYear().toString());
                format = format.replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'));
                format = format.replace('DD', date.getDate().toString().padStart(2, '0'));
                format = format.replace('HH', date.getHours().toString().padStart(2, '0'));
                format = format.replace('mm', date.getMinutes().toString().padStart(2, '0'));
                format = format.replace('ss', date.getSeconds().toString().padStart(2, '0'));
                setFormattedPreview(format);
              } else {
                setFormattedPreview(date.toLocaleString());
              }
              break;
            default:
              setFormattedPreview(date.toLocaleString());
          }
          break;
          
        case 'text':
          let text = previewValue;
          switch (formatSettings.textFormat) {
            case 'uppercase':
              setFormattedPreview(text.toUpperCase());
              break;
            case 'lowercase':
              setFormattedPreview(text.toLowerCase());
              break;
            case 'capitalize':
              setFormattedPreview(
                text
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ')
              );
              break;
            case 'truncate':
              const maxLength = formatSettings.maxLength || 50;
              if (text.length > maxLength) {
                setFormattedPreview(text.substring(0, maxLength) + '...');
              } else {
                setFormattedPreview(text);
              }
              break;
            default:
              setFormattedPreview(formatSettings.trimWhitespace ? text.trim() : text);
          }
          break;
      }
    } catch (e) {
      setPreviewError('Error formatting value');
      setFormattedPreview('');
    }
  };

  const formatWithThousandsSeparator = (numStr: string) => {
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'CNY': return '¥';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewValue(e.target.value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Value Formatting
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="formatting tabs">
        <Tab label="Number" id="formatting-tab-0" aria-controls="formatting-tabpanel-0" />
        <Tab label="Date" id="formatting-tab-1" aria-controls="formatting-tabpanel-1" />
        <Tab label="Text" id="formatting-tab-2" aria-controls="formatting-tabpanel-2" />
      </Tabs>

      {/* Number Formatting */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="number-format-label">Format Type</InputLabel>
              <Select
                labelId="number-format-label"
                value={formatSettings.numberFormat || 'decimal'}
                label="Format Type"
                onChange={(e) => handleFormatSettingChange('numberFormat', e.target.value)}
              >
                <MenuItem value="decimal">Decimal</MenuItem>
                <MenuItem value="integer">Integer</MenuItem>
                <MenuItem value="percent">Percentage</MenuItem>
                <MenuItem value="currency">Currency</MenuItem>
                <MenuItem value="scientific">Scientific</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formatSettings.numberFormat !== 'integer' && (
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Decimal Places"
                value={formatSettings.decimalPlaces || 2}
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 10 }}
                onChange={(e) => 
                  handleFormatSettingChange('decimalPlaces', parseInt(e.target.value, 10))
                }
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formatSettings.useThousandsSeparator || false}
                  onChange={(e) => 
                    handleFormatSettingChange('useThousandsSeparator', e.target.checked)
                  }
                />
              }
              label="Use Thousands Separator"
            />
          </Grid>

          {formatSettings.numberFormat === 'currency' && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="currency-code-label">Currency</InputLabel>
                <Select
                  labelId="currency-code-label"
                  value={formatSettings.currencyCode || 'USD'}
                  label="Currency"
                  onChange={(e) => handleFormatSettingChange('currencyCode', e.target.value)}
                >
                  <MenuItem value="USD">US Dollar ($)</MenuItem>
                  <MenuItem value="EUR">Euro (€)</MenuItem>
                  <MenuItem value="GBP">British Pound (£)</MenuItem>
                  <MenuItem value="JPY">Japanese Yen (¥)</MenuItem>
                  <MenuItem value="CNY">Chinese Yuan (¥)</MenuItem>
                  <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Date Formatting */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="date-format-label">Date Format</InputLabel>
              <Select
                labelId="date-format-label"
                value={formatSettings.dateFormat || 'medium'}
                label="Date Format"
                onChange={(e) => handleFormatSettingChange('dateFormat', e.target.value)}
              >
                <MenuItem value="short">Short (e.g., 9/1/2023)</MenuItem>
                <MenuItem value="medium">Medium (e.g., Sep 1, 2023)</MenuItem>
                <MenuItem value="long">Long (e.g., September 1, 2023)</MenuItem>
                <MenuItem value="iso">ISO (e.g., 2023-09-01T12:00:00.000Z)</MenuItem>
                <MenuItem value="time">Time only (e.g., 12:00:00 PM)</MenuItem>
                <MenuItem value="datetime">Date and Time (e.g., Sep 1, 2023, 12:00:00 PM)</MenuItem>
                <MenuItem value="custom">Custom Format</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formatSettings.dateFormat === 'custom' && (
            <Grid item xs={12}>
              <TextField
                label="Custom Format"
                value={formatSettings.customDateFormat || 'YYYY-MM-DD HH:mm:ss'}
                fullWidth
                margin="normal"
                helperText="Use: YYYY (year), MM (month), DD (day), HH (hour), mm (minute), ss (second)"
                onChange={(e) => 
                  handleFormatSettingChange('customDateFormat', e.target.value)
                }
              />
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Text Formatting */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="text-format-label">Text Format</InputLabel>
              <Select
                labelId="text-format-label"
                value={formatSettings.textFormat || 'default'}
                label="Text Format"
                onChange={(e) => handleFormatSettingChange('textFormat', e.target.value)}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="uppercase">UPPERCASE</MenuItem>
                <MenuItem value="lowercase">lowercase</MenuItem>
                <MenuItem value="capitalize">Capitalize Each Word</MenuItem>
                <MenuItem value="truncate">Truncate</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formatSettings.textFormat === 'truncate' && (
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Max Length"
                value={formatSettings.maxLength || 50}
                fullWidth
                margin="normal"
                inputProps={{ min: 1, max: 1000 }}
                onChange={(e) => 
                  handleFormatSettingChange('maxLength', parseInt(e.target.value, 10))
                }
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formatSettings.trimWhitespace || false}
                  onChange={(e) => 
                    handleFormatSettingChange('trimWhitespace', e.target.checked)
                  }
                />
              }
              label="Trim Whitespace"
            />
          </Grid>
        </Grid>
      </TabPanel>

      <Divider sx={{ my: 3 }} />

      {/* Preview Section */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Preview
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sample Value"
              value={previewValue}
              fullWidth
              margin="normal"
              onChange={handlePreviewChange}
              helperText={`Enter a sample ${formatType} value to see formatting`}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                mt: 2,
                minHeight: '56px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme => theme.palette.grey[50],
              }}
            >
              {previewError ? (
                <Typography color="error">{previewError}</Typography>
              ) : (
                <Typography>{formattedPreview}</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}; 