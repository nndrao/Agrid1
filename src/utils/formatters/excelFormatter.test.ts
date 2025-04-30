/**
 * Tests for the Excel Formatter
 */

import { formatExcelValue } from './excelFormatter';
import { parseExcelFormat } from './formatParser';

// Test the format parser
describe('parseExcelFormat', () => {
  test('parses a simple format', () => {
    const result = parseExcelFormat('#,##0.00');
    expect(result.sections.length).toBe(1);
    expect(result.sections[0].format).toBe('#,##0.00');
  });
  
  test('parses a format with condition', () => {
    const result = parseExcelFormat('[>0]#,##0.00;[<0]-#,##0.00;0');
    expect(result.sections.length).toBe(3);
    expect(result.sections[0].condition?.operator).toBe('>');
    expect(result.sections[0].condition?.value).toBe(0);
    expect(result.sections[1].condition?.operator).toBe('<');
    expect(result.sections[1].condition?.value).toBe(0);
    expect(result.sections[2].format).toBe('0');
  });
  
  test('parses a format with color', () => {
    const result = parseExcelFormat('[Red]#,##0.00;[Blue]-#,##0.00;[Green]0');
    expect(result.sections.length).toBe(3);
    expect(result.sections[0].color?.color).toBe('Red');
    expect(result.sections[1].color?.color).toBe('Blue');
    expect(result.sections[2].color?.color).toBe('Green');
  });
  
  test('parses a format with hex color', () => {
    const result = parseExcelFormat('[#FF0000]#,##0.00');
    expect(result.sections.length).toBe(1);
    expect(result.sections[0].color?.color).toBe('#FF0000');
    expect(result.sections[0].color?.isHex).toBe(true);
  });
  
  test('parses a format with prefix and suffix', () => {
    const result = parseExcelFormat('"$"#,##0.00" USD"');
    expect(result.sections.length).toBe(1);
    expect(result.sections[0].prefix).toBe('$');
    expect(result.sections[0].format).toBe('#,##0.00');
    expect(result.sections[0].suffix).toBe(' USD');
  });
  
  test('parses a complex format', () => {
    const result = parseExcelFormat('[>0][Green]"▲"$#,##0.00;[<0][Red]"▼"$#,##0.00;$0.00');
    expect(result.sections.length).toBe(3);
    expect(result.sections[0].condition?.operator).toBe('>');
    expect(result.sections[0].condition?.value).toBe(0);
    expect(result.sections[0].color?.color).toBe('Green');
    expect(result.sections[0].prefix).toBe('▲');
    expect(result.sections[0].format).toBe('$#,##0.00');
  });
});

// Test the formatter
describe('formatExcelValue', () => {
  test('formats a simple number', () => {
    const result = formatExcelValue({ value: 1234.56 }, '#,##0.00');
    expect(result.text).toBe('1,234.56');
  });
  
  test('formats a currency value', () => {
    const result = formatExcelValue({ value: 1234.56 }, '$#,##0.00');
    expect(result.text).toBe('$1,234.56');
  });
  
  test('formats a percentage', () => {
    const result = formatExcelValue({ value: 0.1234 }, '0.00%');
    expect(result.text).toBe('12.34%');
  });
  
  test('formats with condition - positive value', () => {
    const result = formatExcelValue({ value: 1234.56 }, '[>0]#,##0.00;[<0]-#,##0.00;0');
    expect(result.text).toBe('1,234.56');
  });
  
  test('formats with condition - negative value', () => {
    const result = formatExcelValue({ value: -1234.56 }, '[>0]#,##0.00;[<0]-#,##0.00;0');
    expect(result.text).toBe('-1,234.56');
  });
  
  test('formats with color', () => {
    const result = formatExcelValue({ value: 1234.56 }, '[Red]#,##0.00');
    expect(result.text).toBe('1,234.56');
    expect(result.color).toBe('Red');
  });
  
  test('formats with prefix and suffix', () => {
    const result = formatExcelValue({ value: 1234.56 }, '"$"#,##0.00" USD"');
    expect(result.text).toBe('$1,234.56 USD');
  });
  
  // Test the complex format strings from the requirements
  
  test('formats with color & conditionals', () => {
    // Green up arrow for positive, red down arrow for negative
    const format = '[>0][Green]"▲"$#,##0.00;[<0][Red]"▼"$#,##0.00;$0.00';
    
    const positiveResult = formatExcelValue({ value: 1234.56 }, format);
    expect(positiveResult.text).toBe('▲$1,234.56');
    expect(positiveResult.color).toBe('Green');
    
    const negativeResult = formatExcelValue({ value: -1234.56 }, format);
    expect(negativeResult.text).toBe('▼$1,234.56');
    expect(negativeResult.color).toBe('Red');
    
    const zeroResult = formatExcelValue({ value: 0 }, format);
    expect(zeroResult.text).toBe('$0.00');
  });
  
  test('formats with status indicators', () => {
    // Green checkmark for 1, red X for 0, N/A for others
    const format = '[=1][Green]"✓";[=0][Red]"✗";"N/A"';
    
    const oneResult = formatExcelValue({ value: 1 }, format);
    expect(oneResult.text).toBe('✓');
    expect(oneResult.color).toBe('Green');
    
    const zeroResult = formatExcelValue({ value: 0 }, format);
    expect(zeroResult.text).toBe('✗');
    expect(zeroResult.color).toBe('Red');
    
    const otherResult = formatExcelValue({ value: 2 }, format);
    expect(otherResult.text).toBe('N/A');
  });
  
  test('formats with score ranges', () => {
    // Custom colors based on score ranges
    const format = '[>=90][#00BB00]0"%";[>=70][#0070C0]0"%";[Red]0"%"';
    
    const highResult = formatExcelValue({ value: 95 }, format);
    expect(highResult.text).toBe('95%');
    expect(highResult.color).toBe('#00BB00');
    
    const mediumResult = formatExcelValue({ value: 75 }, format);
    expect(mediumResult.text).toBe('75%');
    expect(mediumResult.color).toBe('#0070C0');
    
    const lowResult = formatExcelValue({ value: 65 }, format);
    expect(lowResult.text).toBe('65%');
    expect(lowResult.color).toBe('Red');
  });
  
  test('formats with KPI indicators', () => {
    // Different colors and messages based on performance vs target
    const format = '[>100][Green]"✓ Above Target";[=100][Blue]"= On Target";[Red]"✗ Below Target"';
    
    const aboveResult = formatExcelValue({ value: 110 }, format);
    expect(aboveResult.text).toBe('✓ Above Target');
    expect(aboveResult.color).toBe('Green');
    
    const onResult = formatExcelValue({ value: 100 }, format);
    expect(onResult.text).toBe('= On Target');
    expect(onResult.color).toBe('Blue');
    
    const belowResult = formatExcelValue({ value: 90 }, format);
    expect(belowResult.text).toBe('✗ Below Target');
    expect(belowResult.color).toBe('Red');
  });
  
  test('formats with simple heatmap', () => {
    // Traffic light color coding for percentages
    const format = '[>0.7][#009900]0.0%;[>0.3][#FFCC00]0.0%;[#FF0000]0.0%';
    
    const highResult = formatExcelValue({ value: 0.8 }, format);
    expect(highResult.text).toBe('80.0%');
    expect(highResult.color).toBe('#009900');
    
    const mediumResult = formatExcelValue({ value: 0.5 }, format);
    expect(mediumResult.text).toBe('50.0%');
    expect(mediumResult.color).toBe('#FFCC00');
    
    const lowResult = formatExcelValue({ value: 0.2 }, format);
    expect(lowResult.text).toBe('20.0%');
    expect(lowResult.color).toBe('#FF0000');
  });
  
  test('formats with text and values', () => {
    // Add text with value
    const valueFormat = '{value} units';
    const valueResult = formatExcelValue({ value: 42 }, valueFormat);
    expect(valueResult.text).toBe('42 units');
    
    // Currency with suffix
    const currencyFormat = '"$"#,##0.00" USD"';
    const currencyResult = formatExcelValue({ value: 1234.56 }, currencyFormat);
    expect(currencyResult.text).toBe('$1,234.56 USD');
    
    // Conditional prefix
    const conditionalFormat = '[>1000]"High: "$#,##0.00;$#,##0.00';
    const highResult = formatExcelValue({ value: 1234.56 }, conditionalFormat);
    expect(highResult.text).toBe('High: $1,234.56');
    
    const lowResult = formatExcelValue({ value: 123.45 }, conditionalFormat);
    expect(lowResult.text).toBe('$123.45');
  });
});
