# Excel-Style Formatter for AG-Grid

This module provides a comprehensive Excel-style formatter that can handle complex format strings with conditions, colors, and text formatting. It is designed to be used with AG-Grid but can also be used independently.

## Features

- **Conditional Formatting**: Apply different formats based on the value
- **Color Formatting**: Apply colors to values based on conditions
- **Text Formatting**: Add prefixes and suffixes to values
- **Number Formatting**: Format numbers with decimal places, thousands separators, etc.
- **Currency Formatting**: Format values as currency with symbols
- **Percentage Formatting**: Format values as percentages
- **Date Formatting**: Format dates in various formats
- **Custom Formatting**: Create custom formats with complex patterns

## Supported Format Strings

The formatter supports a wide range of Excel-style format strings, including:

### Color & Conditionals
```
[>0][Green]"▲"$#,##0.00;[<0][Red]"▼"$#,##0.00;$0.00
```
Green up arrow for positive, red down arrow for negative

### Status Indicators
```
[=1][Green]"✓";[=0][Red]"✗";"N/A"
```
Green checkmark for 1, red X for 0, N/A for others

### Score Ranges
```
[>=90][#00BB00]0"%";[>=70][#0070C0]0"%";[Red]0"%"
```
Custom colors based on score ranges:
- ≥90% in green
- ≥70% in blue
- Others in red

### KPI Indicators
```
[>100][Green]"✓ Above Target";[=100][Blue]"= On Target";[Red]"✗ Below Target"
```
Different colors and messages based on performance vs target

### Simple Heatmap
```
[>0.7][#009900]0.0%;[>0.3][#FFCC00]0.0%;[#FF0000]0.0%
```
Traffic light color coding for percentages:
- Green (>70%)
- Yellow (>30%)
- Red (≤30%)

### Text with Values
```
{value} units - Add text with value
"$"#,##0.00" USD" - Currency with suffix
[>1000]"High: "$#,##0.00;$#,##0.00 - Conditional prefix
```

## Usage

### Basic Usage

```typescript
import { formatExcelValue } from '@/utils/formatters';

// Format a value with a format string
const result = formatExcelValue({ value: 1234.56 }, '#,##0.00');
console.log(result.text); // '1,234.56'

// Format a value with a conditional format
const conditionalResult = formatExcelValue(
  { value: 1234.56 }, 
  '[>1000][Green]"High: "$#,##0.00;$#,##0.00'
);
console.log(conditionalResult.text); // 'High: $1,234.56'
console.log(conditionalResult.color); // 'Green'
```

### AG-Grid Integration

```typescript
import { createAgGridCellRenderer } from '@/utils/formatters';

// Create a column definition with a formatter
const colDef = {
  field: 'price',
  headerName: 'Price',
  cellRenderer: createAgGridCellRenderer(
    '[>0][Green]"▲"$#,##0.00;[<0][Red]"▼"$#,##0.00;$0.00'
  )
};
```

### Creating a Reusable Formatter

```typescript
import { createExcelFormatter } from '@/utils/formatters';

// Create a reusable formatter
const priceFormatter = createExcelFormatter(
  '[>0][Green]"▲"$#,##0.00;[<0][Red]"▼"$#,##0.00;$0.00'
);

// Use the formatter
const result = priceFormatter({ value: 1234.56 });
console.log(result.text); // '▲$1,234.56'
console.log(result.color); // 'Green'
```

## Integration with GridStore

The formatter can be integrated with the existing GridStore by using the `formatterIntegration.ts` module:

```typescript
import { createFormatterFromSettings, applyFormatterToColDef } from '@/store/modules/formatterIntegration';

// Create a formatter from settings
const formatter = createFormatterFromSettings(colId, formatterSettings);

// Apply a formatter to a column definition
applyFormatterToColDef(colDef, formatterSettings);
```

## Architecture

The formatter is composed of several modules:

- **excelFormatter.ts**: The main formatter that handles the formatting of values
- **formatParser.ts**: Parses Excel-style format strings into structured format sections
- **numberFormatter.ts**: Handles the formatting of numbers according to format patterns
- **agGridIntegration.ts**: Provides utilities for integrating with AG-Grid
- **types.ts**: Defines the types used by the formatter
- **formatterIntegration.ts**: Provides integration with the GridStore

## Testing

The formatter includes a comprehensive test suite that verifies the functionality of the parser and formatter with various format strings.

To run the tests:

```bash
npm test
```
