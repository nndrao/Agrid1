import { FunctionDefinition } from './types';

export const functionCategories = [
  'aggregation',
  'mathematical',
  'string',
  'date',
  'logical',
  'grid',
  'statistical',
  'financial'
] as const;

export type FunctionCategory = typeof functionCategories[number];

export interface FunctionDefinition {
  name: string;
  category: FunctionCategory;
  description: string;
  syntax: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }[];
  returnType: string;
  example: string;
}

export const coreFunctions: FunctionDefinition[] = [
  // Aggregation Functions
  {
    name: 'SUM',
    category: 'aggregation',
    description: 'Calculates the sum of numeric values in a column or range',
    syntax: 'SUM(column)',
    parameters: [
      {
        name: 'column',
        type: 'number[]',
        description: 'The column or range to sum'
      }
    ],
    returnType: 'number',
    example: 'SUM(product.price) // Returns total price of all products'
  },
  {
    name: 'AVERAGE',
    category: 'aggregation',
    description: 'Calculates the average of numeric values',
    syntax: 'AVERAGE(column)',
    parameters: [
      {
        name: 'column',
        type: 'number[]',
        description: 'The column or range to average'
      }
    ],
    returnType: 'number',
    example: 'AVERAGE(product.price) // Returns average price'
  },
  {
    name: 'COUNT',
    category: 'aggregation',
    description: 'Counts the number of non-empty values',
    syntax: 'COUNT(column)',
    parameters: [
      {
        name: 'column',
        type: 'any[]',
        description: 'The column or range to count'
      }
    ],
    returnType: 'number',
    example: 'COUNT(product.id) // Returns total number of products'
  },
  {
    name: 'MIN',
    category: 'aggregation',
    description: 'Returns the minimum value in a range',
    syntax: 'MIN(column)',
    parameters: [
      {
        name: 'column',
        type: 'number[]',
        description: 'The column or range to evaluate'
      }
    ],
    returnType: 'number',
    example: 'MIN(product.price) // Returns lowest price'
  },
  {
    name: 'MAX',
    category: 'aggregation',
    description: 'Returns the maximum value in a range',
    syntax: 'MAX(column)',
    parameters: [
      {
        name: 'column',
        type: 'number[]',
        description: 'The column or range to evaluate'
      }
    ],
    returnType: 'number',
    example: 'MAX(product.price) // Returns highest price'
  },
  {
    name: 'COUNTIF',
    category: 'aggregation',
    description: 'Counts cells that meet a condition',
    syntax: 'COUNTIF(column, condition)',
    parameters: [
      {
        name: 'column',
        type: 'any[]',
        description: 'The column or range to count'
      },
      {
        name: 'condition',
        type: 'boolean',
        description: 'The condition to test'
      }
    ],
    returnType: 'number',
    example: 'COUNTIF(product.price, price > 100) // Count products over $100'
  },

  // Mathematical Functions
  {
    name: 'ABS',
    category: 'mathematical',
    description: 'Returns the absolute value of a number',
    syntax: 'ABS(number)',
    parameters: [
      {
        name: 'number',
        type: 'number',
        description: 'The number to get absolute value of'
      }
    ],
    returnType: 'number',
    example: 'ABS(product.change) // Returns absolute value of change'
  },
  {
    name: 'ROUND',
    category: 'mathematical',
    description: 'Rounds a number to specified decimal places',
    syntax: 'ROUND(number, decimals)',
    parameters: [
      {
        name: 'number',
        type: 'number',
        description: 'The number to round'
      },
      {
        name: 'decimals',
        type: 'number',
        description: 'Number of decimal places',
        optional: true
      }
    ],
    returnType: 'number',
    example: 'ROUND(product.price, 2) // Rounds price to 2 decimal places'
  },
  {
    name: 'POWER',
    category: 'mathematical',
    description: 'Returns a number raised to a power',
    syntax: 'POWER(number, power)',
    parameters: [
      {
        name: 'number',
        type: 'number',
        description: 'The base number'
      },
      {
        name: 'power',
        type: 'number',
        description: 'The exponent'
      }
    ],
    returnType: 'number',
    example: 'POWER(product.value, 2) // Square of value'
  },
  {
    name: 'SQRT',
    category: 'mathematical',
    description: 'Returns the square root of a number',
    syntax: 'SQRT(number)',
    parameters: [
      {
        name: 'number',
        type: 'number',
        description: 'The number to get square root of'
      }
    ],
    returnType: 'number',
    example: 'SQRT(product.variance) // Square root of variance'
  },
  {
    name: 'LOG',
    category: 'mathematical',
    description: 'Returns the natural logarithm of a number',
    syntax: 'LOG(number)',
    parameters: [
      {
        name: 'number',
        type: 'number',
        description: 'The number to get logarithm of'
      }
    ],
    returnType: 'number',
    example: 'LOG(product.value) // Natural logarithm of value'
  },

  // String Functions
  {
    name: 'CONCAT',
    category: 'string',
    description: 'Concatenates two or more text strings',
    syntax: 'CONCAT(text1, text2, ...)',
    parameters: [
      {
        name: 'text1',
        type: 'string',
        description: 'First text to concatenate'
      },
      {
        name: 'text2',
        type: 'string',
        description: 'Second text to concatenate'
      }
    ],
    returnType: 'string',
    example: 'CONCAT(product.issuer, " - ", product.cusip) // Combines issuer and cusip'
  },
  {
    name: 'UPPER',
    category: 'string',
    description: 'Converts text to uppercase',
    syntax: 'UPPER(text)',
    parameters: [
      {
        name: 'text',
        type: 'string',
        description: 'The text to convert'
      }
    ],
    returnType: 'string',
    example: 'UPPER(product.issuer) // Converts issuer to uppercase'
  },
  {
    name: 'LOWER',
    category: 'string',
    description: 'Converts text to lowercase',
    syntax: 'LOWER(text)',
    parameters: [
      {
        name: 'text',
        type: 'string',
        description: 'The text to convert'
      }
    ],
    returnType: 'string',
    example: 'LOWER(product.issuer) // Converts issuer to lowercase'
  },
  {
    name: 'TRIM',
    category: 'string',
    description: 'Removes leading and trailing spaces',
    syntax: 'TRIM(text)',
    parameters: [
      {
        name: 'text',
        type: 'string',
        description: 'The text to trim'
      }
    ],
    returnType: 'string',
    example: 'TRIM(product.name) // Removes extra spaces'
  },
  {
    name: 'SUBSTRING',
    category: 'string',
    description: 'Extracts characters from a text string',
    syntax: 'SUBSTRING(text, start, length)',
    parameters: [
      {
        name: 'text',
        type: 'string',
        description: 'The source text'
      },
      {
        name: 'start',
        type: 'number',
        description: 'Starting position'
      },
      {
        name: 'length',
        type: 'number',
        description: 'Number of characters',
        optional: true
      }
    ],
    returnType: 'string',
    example: 'SUBSTRING(product.cusip, 0, 3) // First 3 characters of cusip'
  },

  // Date Functions
  {
    name: 'TODAY',
    category: 'date',
    description: 'Returns the current date',
    syntax: 'TODAY()',
    parameters: [],
    returnType: 'date',
    example: 'TODAY() // Returns current date'
  },
  {
    name: 'DATEDIFF',
    category: 'date',
    description: 'Calculates the difference between two dates in days',
    syntax: 'DATEDIFF(date1, date2)',
    parameters: [
      {
        name: 'date1',
        type: 'date',
        description: 'First date'
      },
      {
        name: 'date2',
        type: 'date',
        description: 'Second date'
      }
    ],
    returnType: 'number',
    example: 'DATEDIFF(product.maturityDate, TODAY()) // Days until maturity'
  },
  {
    name: 'DATEADD',
    category: 'date',
    description: 'Adds a specified number of intervals to a date',
    syntax: 'DATEADD(date, number, interval)',
    parameters: [
      {
        name: 'date',
        type: 'date',
        description: 'The date to modify'
      },
      {
        name: 'number',
        type: 'number',
        description: 'Number of intervals to add'
      },
      {
        name: 'interval',
        type: 'string',
        description: 'Interval type (days, months, years)'
      }
    ],
    returnType: 'date',
    example: 'DATEADD(product.settlementDate, 2, "days") // Settlement + 2 days'
  },
  {
    name: 'YEAR',
    category: 'date',
    description: 'Extracts the year from a date',
    syntax: 'YEAR(date)',
    parameters: [
      {
        name: 'date',
        type: 'date',
        description: 'The date to extract from'
      }
    ],
    returnType: 'number',
    example: 'YEAR(product.maturityDate) // Year of maturity'
  },
  {
    name: 'MONTH',
    category: 'date',
    description: 'Extracts the month from a date',
    syntax: 'MONTH(date)',
    parameters: [
      {
        name: 'date',
        type: 'date',
        description: 'The date to extract from'
      }
    ],
    returnType: 'number',
    example: 'MONTH(product.maturityDate) // Month of maturity'
  },

  // Logical Functions
  {
    name: 'IF',
    category: 'logical',
    description: 'Returns one value if condition is true, another if false',
    syntax: 'IF(condition, value_if_true, value_if_false)',
    parameters: [
      {
        name: 'condition',
        type: 'boolean',
        description: 'The condition to test'
      },
      {
        name: 'value_if_true',
        type: 'any',
        description: 'Value to return if condition is true'
      },
      {
        name: 'value_if_false',
        type: 'any',
        description: 'Value to return if condition is false'
      }
    ],
    returnType: 'any',
    example: 'IF(product.price > 100, "High", "Low") // Returns "High" if price > 100'
  },
  {
    name: 'AND',
    category: 'logical',
    description: 'Returns true if all conditions are true',
    syntax: 'AND(condition1, condition2, ...)',
    parameters: [
      {
        name: 'condition1',
        type: 'boolean',
        description: 'First condition'
      },
      {
        name: 'condition2',
        type: 'boolean',
        description: 'Second condition'
      }
    ],
    returnType: 'boolean',
    example: 'AND(product.price > 100, product.rating = "AAA") // Both conditions must be true'
  },
  {
    name: 'OR',
    category: 'logical',
    description: 'Returns true if any condition is true',
    syntax: 'OR(condition1, condition2, ...)',
    parameters: [
      {
        name: 'condition1',
        type: 'boolean',
        description: 'First condition'
      },
      {
        name: 'condition2',
        type: 'boolean',
        description: 'Second condition'
      }
    ],
    returnType: 'boolean',
    example: 'OR(product.rating = "AAA", product.rating = "AA") // Either condition can be true'
  },
  {
    name: 'NOT',
    category: 'logical',
    description: 'Reverses the value of a condition',
    syntax: 'NOT(condition)',
    parameters: [
      {
        name: 'condition',
        type: 'boolean',
        description: 'The condition to negate'
      }
    ],
    returnType: 'boolean',
    example: 'NOT(product.price < 100) // True if price is not less than 100'
  },

  // Grid Functions
  {
    name: 'LOOKUP',
    category: 'grid',
    description: 'Looks up a value in another column based on a match',
    syntax: 'LOOKUP(value, lookup_column, result_column)',
    parameters: [
      {
        name: 'value',
        type: 'any',
        description: 'Value to look up'
      },
      {
        name: 'lookup_column',
        type: 'any[]',
        description: 'Column to search in'
      },
      {
        name: 'result_column',
        type: 'any[]',
        description: 'Column to return value from'
      }
    ],
    returnType: 'any',
    example: 'LOOKUP(product.cusip, reference.cusip, reference.rating) // Looks up rating by cusip'
  },
  {
    name: 'VLOOKUP',
    category: 'grid',
    description: 'Vertical lookup in a table',
    syntax: 'VLOOKUP(value, table, column_index)',
    parameters: [
      {
        name: 'value',
        type: 'any',
        description: 'Value to look up'
      },
      {
        name: 'table',
        type: 'any[][]',
        description: 'Table to search in'
      },
      {
        name: 'column_index',
        type: 'number',
        description: 'Column index to return'
      }
    ],
    returnType: 'any',
    example: 'VLOOKUP(product.cusip, referenceTable, 2) // Looks up value in second column'
  },
  {
    name: 'INDEX',
    category: 'grid',
    description: 'Returns value at specific position in range',
    syntax: 'INDEX(range, row_num)',
    parameters: [
      {
        name: 'range',
        type: 'any[]',
        description: 'Range to search in'
      },
      {
        name: 'row_num',
        type: 'number',
        description: 'Row number to return'
      }
    ],
    returnType: 'any',
    example: 'INDEX(product.prices, 0) // Returns first price in array'
  },

  // Statistical Functions
  {
    name: 'STDEV',
    category: 'statistical',
    description: 'Calculates the standard deviation of a range',
    syntax: 'STDEV(column)',
    parameters: [
      {
        name: 'column',
        type: 'number[]',
        description: 'Column of numbers'
      }
    ],
    returnType: 'number',
    example: 'STDEV(product.returns) // Calculates standard deviation of returns'
  },
  {
    name: 'VARIANCE',
    category: 'statistical',
    description: 'Calculates the variance of a range',
    syntax: 'VARIANCE(column)',
    parameters: [
      {
        name: 'column',
        type: 'number[]',
        description: 'Column of numbers'
      }
    ],
    returnType: 'number',
    example: 'VARIANCE(product.returns) // Calculates variance of returns'
  },
  {
    name: 'MEDIAN',
    category: 'statistical',
    description: 'Returns the median of a range',
    syntax: 'MEDIAN(column)',
    parameters: [
      {
        name: 'column',
        type: 'number[]',
        description: 'Column of numbers'
      }
    ],
    returnType: 'number',
    example: 'MEDIAN(product.prices) // Middle value of prices'
  },
  {
    name: 'PERCENTILE',
    category: 'statistical',
    description: 'Returns the k-th percentile of a range',
    syntax: 'PERCENTILE(column, k)',
    parameters: [
      {
        name: 'column',
        type: 'number[]',
        description: 'Column of numbers'
      },
      {
        name: 'k',
        type: 'number',
        description: 'Percentile value (0-1)'
      }
    ],
    returnType: 'number',
    example: 'PERCENTILE(product.returns, 0.95) // 95th percentile of returns'
  },

  // Financial Functions
  {
    name: 'NPV',
    category: 'financial',
    description: 'Calculates Net Present Value of cash flows',
    syntax: 'NPV(rate, cashflows)',
    parameters: [
      {
        name: 'rate',
        type: 'number',
        description: 'Discount rate per period'
      },
      {
        name: 'cashflows',
        type: 'number[]',
        description: 'Array of cash flows'
      }
    ],
    returnType: 'number',
    example: 'NPV(0.1, product.cashflows) // Calculates NPV with 10% discount rate'
  },
  {
    name: 'IRR',
    category: 'financial',
    description: 'Calculates Internal Rate of Return',
    syntax: 'IRR(cashflows)',
    parameters: [
      {
        name: 'cashflows',
        type: 'number[]',
        description: 'Array of cash flows'
      }
    ],
    returnType: 'number',
    example: 'IRR(product.cashflows) // Internal rate of return'
  },
  {
    name: 'PV',
    category: 'financial',
    description: 'Calculates Present Value',
    syntax: 'PV(rate, nper, pmt, fv)',
    parameters: [
      {
        name: 'rate',
        type: 'number',
        description: 'Interest rate per period'
      },
      {
        name: 'nper',
        type: 'number',
        description: 'Total number of periods'
      },
      {
        name: 'pmt',
        type: 'number',
        description: 'Payment per period'
      },
      {
        name: 'fv',
        type: 'number',
        description: 'Future value',
        optional: true
      }
    ],
    returnType: 'number',
    example: 'PV(0.05, 10, -1000, 0) // Present value of payments'
  },
  {
    name: 'FV',
    category: 'financial',
    description: 'Calculates Future Value',
    syntax: 'FV(rate, nper, pmt, pv)',
    parameters: [
      {
        name: 'rate',
        type: 'number',
        description: 'Interest rate per period'
      },
      {
        name: 'nper',
        type: 'number',
        description: 'Total number of periods'
      },
      {
        name: 'pmt',
        type: 'number',
        description: 'Payment per period'
      },
      {
        name: 'pv',
        type: 'number',
        description: 'Present value',
        optional: true
      }
    ],
    returnType: 'number',
    example: 'FV(0.05, 10, -1000, 0) // Future value of payments'
  },
  {
    name: 'DURATION',
    category: 'financial',
    description: 'Calculates Modified Duration of a bond',
    syntax: 'DURATION(settlement, maturity, coupon, yield, freq)',
    parameters: [
      {
        name: 'settlement',
        type: 'date',
        description: 'Settlement date'
      },
      {
        name: 'maturity',
        type: 'date',
        description: 'Maturity date'
      },
      {
        name: 'coupon',
        type: 'number',
        description: 'Annual coupon rate'
      },
      {
        name: 'yield',
        type: 'number',
        description: 'Annual yield'
      },
      {
        name: 'freq',
        type: 'number',
        description: 'Payments per year'
      }
    ],
    returnType: 'number',
    example: 'DURATION(product.settlement, product.maturity, 0.05, 0.06, 2) // Bond duration'
  }
];

export function getFunctionsByCategory(category: FunctionCategory): FunctionDefinition[] {
  return coreFunctions.filter(fn => fn.category === category);
}

export function getFunctionByName(name: string): FunctionDefinition | undefined {
  return coreFunctions.find(fn => fn.name === name);
} 