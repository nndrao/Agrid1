// Get random unique indices for sampling
function getRandomIndices(max: number, count: number): number[] {
  const indices = new Set<number>();
  while (indices.size < Math.min(count, max)) {
    indices.add(Math.floor(Math.random() * max));
  }
  return Array.from(indices);
}

// Get sample values for a field from random rows
function getSampleValues(data: any[], field: string, sampleSize: number = 20): any[] {
  const indices = getRandomIndices(data.length, sampleSize);
  return indices.map(i => data[i][field]).filter(val => val !== null && val !== undefined);
}

// Infer type from multiple samples
function inferColumnTypeFromSamples(samples: any[]): string {
  if (!samples.length) return 'string';

  // Count type occurrences
  const typeCount = samples.reduce((acc, value) => {
    let type = 'string';

    if (typeof value === 'number') {
      type = Number.isInteger(value) ? 'number' : 'numericColumn';
    } else if (typeof value === 'boolean') {
      type = 'boolean';
    } else if (value instanceof Date) {
      type = 'date';
    } else if (typeof value === 'string') {
      // Check for date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(value)) {
        type = 'date';
      } else {
        // Check for numeric format (including currency and percentages)
        const numberRegex = /^[-+]?[\d,]*\.?\d+%?$/;
        const currencyRegex = /^[$€£¥][-+]?[\d,]*\.?\d+$/;
        if (numberRegex.test(value) || currencyRegex.test(value)) {
          type = 'numericColumn';
        }
      }
    }

    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get the most common type
  const [mostCommonType] = Object.entries(typeCount)
    .sort(([, a], [, b]) => b - a)[0] || ['string'];

  return mostCommonType;
}

// Detect if a field is likely an ID field
function isIdField(field: string, samples: any[]): boolean {
  const lowercaseField = field.toLowerCase();
  if (lowercaseField.includes('id') || lowercaseField.includes('code')) {
    // Check if values are unique
    const uniqueValues = new Set(samples);
    return uniqueValues.size === samples.length;
  }
  return false;
}

export function generateColumnDefs(data: any[]): any[] {
  if (!data || data.length === 0) return [];

  const sampleRow = data[0];
  const columnDefs = Object.keys(sampleRow).map(field => {
    // Get samples for this field
    const samples = getSampleValues(data, field);
    const inferredType = inferColumnTypeFromSamples(samples);
    const isIdentifier = isIdField(field, samples);

    const baseColDef = {
      field,
      headerName: field
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      sortable: true,
      filter: true,
      resizable: true,
      // Make ID columns fixed width and not flexible
      ...(isIdentifier && { flex: 0, width: 120 })
    };

    if (inferredType === 'numericColumn') {
      return {
        ...baseColDef,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter'
      };
    }

    if (inferredType === 'date') {
      return {
        ...baseColDef,
        filter: 'agDateColumnFilter'
      };
    }

    if (inferredType === 'boolean') {
      return {
        ...baseColDef,
        cellRenderer: 'agCheckboxCellRenderer'
      };
    }

    return {
      ...baseColDef,
      type: inferredType
    };
  });

  return columnDefs;
}