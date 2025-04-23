import { ColDef } from 'ag-grid-community';

export type ExpressionType = 
  | 'boolean'           // For conditional styling and filtering
  | 'aggregatedBoolean' // For group-level conditions
  | 'value'            // For value transformations
  | 'formatting'        // For display formatting
  | 'observable';       // For reactive behaviors

export interface Expression {
  id: string;
  name: string;
  type: ExpressionType;
  expression: string;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FunctionDefinition {
  name: string;
  category: FunctionCategory;
  description: string;
  syntax: string;
  parameters: ParameterDefinition[];
  returnType: string;
  example: string;
}

export type FunctionCategory =
  | 'aggregation'
  | 'mathematical'
  | 'statistical'
  | 'string'
  | 'date'
  | 'logical'
  | 'financial'
  | 'reference'
  | 'grid';

export interface ParameterDefinition {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: any;
  description: string;
}

export interface ExpressionEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (expression: Expression) => void;
  columnDefs: ColDef[];
  initialExpression?: Expression;
}

export interface ExpressionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExpressionEvaluationResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface ExpressionContext {
  columns: ColDef[];
  functions: FunctionDefinition[];
  savedExpressions: Expression[];
} 