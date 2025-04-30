/**
 * Excel Format Parser
 * Parses Excel-style format strings into structured format sections
 */

import { FormatSection, ParsedExcelFormat, FormatCondition, FormatColor } from './types';

/**
 * Parse an Excel format string into structured format sections
 */
export function parseExcelFormat(formatString: string): ParsedExcelFormat {
  // Handle empty format
  if (!formatString || formatString.trim() === '') {
    return { sections: [{ format: 'General', isDefault: true }] };
  }

  // Split the format string into sections (separated by semicolons)
  const sectionStrings = splitFormatSections(formatString);
  
  // Parse each section
  const sections: FormatSection[] = sectionStrings.map((sectionStr, index) => {
    // The last section is the default if there are multiple sections
    const isDefault = sectionStrings.length > 1 && index === sectionStrings.length - 1 && 
                     !hasCondition(sectionStr);
    
    return parseFormatSection(sectionStr, isDefault);
  });

  return { sections };
}

/**
 * Split a format string into sections, respecting quoted strings
 */
function splitFormatSections(formatString: string): string[] {
  const sections: string[] = [];
  let currentSection = '';
  let inQuote = false;
  
  for (let i = 0; i < formatString.length; i++) {
    const char = formatString[i];
    
    // Handle quotes
    if (char === '"') {
      inQuote = !inQuote;
      currentSection += char;
      continue;
    }
    
    // Handle semicolons (section separators)
    if (char === ';' && !inQuote) {
      sections.push(currentSection);
      currentSection = '';
      continue;
    }
    
    // Add character to current section
    currentSection += char;
  }
  
  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // If no sections were found, use the entire string as a single section
  if (sections.length === 0) {
    sections.push(formatString);
  }
  
  return sections;
}

/**
 * Check if a section string has a condition
 */
function hasCondition(sectionStr: string): boolean {
  // Look for condition pattern [<operator><value>]
  return /^\s*\[(>|>=|<|<=|=|<>)/.test(sectionStr);
}

/**
 * Parse a single format section
 */
function parseFormatSection(sectionStr: string, isDefault = false): FormatSection {
  const section: FormatSection = {
    format: sectionStr,
    isDefault
  };
  
  // Extract condition if present
  const conditionMatch = sectionStr.match(/^\s*\[(>|>=|<|<=|=|<>)(-?\d+(\.\d+)?)\]/);
  if (conditionMatch) {
    section.condition = {
      operator: conditionMatch[1] as any,
      value: parseFloat(conditionMatch[2])
    };
    
    // Remove condition from format
    sectionStr = sectionStr.substring(conditionMatch[0].length);
  }
  
  // Extract color if present
  const colorMatch = sectionStr.match(/^\s*\[(Red|Green|Blue|Yellow|Cyan|Magenta|Black|White|Gray|Orange|Purple|Brown|#[0-9A-Fa-f]{3,6})\]/i);
  if (colorMatch) {
    const colorValue = colorMatch[1];
    section.color = {
      color: colorValue,
      isHex: colorValue.startsWith('#')
    };
    
    // Remove color from format
    sectionStr = sectionStr.substring(colorMatch[0].length);
  }
  
  // Extract prefix and suffix text (quoted strings)
  let format = sectionStr;
  const prefixMatch = format.match(/^"([^"]*?)"/);
  if (prefixMatch) {
    section.prefix = prefixMatch[1];
    format = format.substring(prefixMatch[0].length);
  }
  
  const suffixMatch = format.match(/"([^"]*?)"$/);
  if (suffixMatch) {
    section.suffix = suffixMatch[1];
    format = format.substring(0, format.length - suffixMatch[0].length);
  }
  
  // The remaining string is the actual number format
  section.format = format.trim();
  
  return section;
}

/**
 * Utility function to check if a value matches a condition
 */
export function matchesCondition(value: number, condition: FormatCondition): boolean {
  switch (condition.operator) {
    case '>': return value > condition.value;
    case '>=': return value >= condition.value;
    case '<': return value < condition.value;
    case '<=': return value <= condition.value;
    case '=': return value === condition.value;
    case '<>': return value !== condition.value;
    default: return false;
  }
}
