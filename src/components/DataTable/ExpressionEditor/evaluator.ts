import { ParseNode } from './parser';
import { FunctionDefinition, ExpressionContext } from './types';
import { getFunctionByName } from './functions';

export class ExpressionEvaluator {
  constructor(private context: ExpressionContext) {}

  public evaluate(node: ParseNode, rowData: any): any {
    switch (node.type) {
      case 'literal':
        return this.evaluateLiteral(node);
      case 'column':
        return this.evaluateColumn(node, rowData);
      case 'function':
        return this.evaluateFunction(node, rowData);
      case 'operation':
        return this.evaluateOperation(node, rowData);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private evaluateLiteral(node: ParseNode): any {
    // Try to parse as number first
    const num = Number(node.value);
    if (!isNaN(num)) return num;
    
    // Return as string
    return node.value;
  }

  private evaluateColumn(node: ParseNode, rowData: any): any {
    const columnName = node.value;
    if (!rowData || !(columnName in rowData)) {
      throw new Error(`Column ${columnName} not found in row data`);
    }
    return rowData[columnName];
  }

  private evaluateFunction(node: ParseNode, rowData: any): any {
    const funcName = node.value;
    const funcDef = getFunctionByName(funcName);
    
    if (!funcDef) {
      throw new Error(`Function ${funcName} not found`);
    }

    const args = node.children?.map(child => this.evaluate(child, rowData)) || [];
    
    // Validate argument count
    const requiredParams = funcDef.parameters.filter(p => !p.optional).length;
    if (args.length < requiredParams) {
      throw new Error(`Function ${funcName} requires at least ${requiredParams} arguments`);
    }

    // Apply default values for optional parameters
    const optionalParams = funcDef.parameters.filter(p => p.optional);
    for (let i = 0; i < optionalParams.length; i++) {
      if (args.length <= requiredParams + i) {
        args.push(optionalParams[i].defaultValue);
      }
    }

    // Execute the function
    return this.executeFunction(funcDef, args, rowData);
  }

  private evaluateOperation(node: ParseNode, rowData: any): any {
    if (!node.children || node.children.length !== 2) {
      throw new Error('Operation requires exactly two operands');
    }

    const left = this.evaluate(node.children[0], rowData);
    const right = this.evaluate(node.children[1], rowData);
    const operator = node.operator;

    switch (operator) {
      // Arithmetic operators
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;

      // Comparison operators
      case '==': return left == right;
      case '!=': return left != right;
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;

      // Logical operators
      case '&&': return left && right;
      case '||': return left || right;

      // Special operators
      case 'IN': 
        if (!Array.isArray(right)) {
          throw new Error('IN operator requires an array as right operand');
        }
        return right.includes(left);

      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  private executeFunction(funcDef: FunctionDefinition, args: any[], rowData: any): any {
    switch (funcDef.name) {
      // String functions
      case 'CONCAT':
        return args.join('');
      case 'SUBSTRING':
        return args[0].substring(args[1], args[2]);

      // Numeric functions
      case 'ROUND':
        return Math.round(args[0] * Math.pow(10, args[1] || 0)) / Math.pow(10, args[1] || 0);
      case 'SUM':
        if (args[1]) {
          return this.context.columns
            .filter(col => this.evaluate({ type: 'operation', operator: '==', children: [
              { type: 'column', value: col.field },
              { type: 'literal', value: args[1] }
            ]}, rowData))
            .reduce((sum, col) => sum + (rowData[col.field] || 0), 0);
        }
        return args[0];

      // Date functions
      case 'DATE_DIFF':
        const date1 = new Date(args[0]);
        const date2 = new Date(args[1]);
        const unit = args[2] || 'days';
        const diff = date1.getTime() - date2.getTime();
        switch (unit) {
          case 'days': return Math.floor(diff / (1000 * 60 * 60 * 24));
          case 'months': return (date1.getFullYear() - date2.getFullYear()) * 12 + 
                              (date1.getMonth() - date2.getMonth());
          case 'years': return date1.getFullYear() - date2.getFullYear();
          default: throw new Error(`Unknown date unit: ${unit}`);
        }
      case 'FORMAT_DATE':
        const date = new Date(args[0]);
        const pattern = args[1];
        // Simple date formatting - can be enhanced with a proper date formatting library
        return pattern
          .replace('YYYY', date.getFullYear().toString())
          .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
          .replace('DD', date.getDate().toString().padStart(2, '0'));

      // Logical functions
      case 'IIF':
        return args[0] ? args[1] : args[2];
      case 'IN':
        return args[1].includes(args[0]);

      // Grid functions
      case 'CELL':
        return rowData[args[0]];
      case 'ROW':
        return rowData;

      default:
        throw new Error(`Function ${funcDef.name} not implemented`);
    }
  }
} 