import React from 'react';
import { getFunctionByName } from './functions';
import { cn } from '@/lib/utils';

interface ParameterHintsProps {
  value: string;
  cursorPosition: number;
  className?: string;
}

export const ParameterHints: React.FC<ParameterHintsProps> = ({
  value,
  cursorPosition,
  className
}) => {
  const { functionName, currentParamIndex, params } = getFunctionContext(value, cursorPosition);
  if (!functionName || !params) return null;

  const funcDef = getFunctionByName(functionName);
  if (!funcDef) return null;

  return (
    <div className={cn(
      "absolute z-50 bg-background border rounded-md shadow-lg p-2",
      "max-w-md",
      className
    )}>
      <div className="font-mono text-sm">
        <span className="text-red-600">{functionName}</span>
        <span className="text-gray-600">(</span>
        {funcDef.parameters.map((param, index) => (
          <React.Fragment key={param.name}>
            {index > 0 && <span className="text-gray-600">, </span>}
            <span className={cn(
              index === currentParamIndex && "bg-accent px-1 rounded",
              param.optional && "text-gray-500"
            )}>
              {param.name}
              {param.optional && "?"}
            </span>
          </React.Fragment>
        ))}
        <span className="text-gray-600">)</span>
      </div>
      {funcDef.parameters[currentParamIndex] && (
        <div className="mt-1 text-xs text-muted-foreground">
          {funcDef.parameters[currentParamIndex].description}
        </div>
      )}
    </div>
  );
};

function getFunctionContext(text: string, cursorPosition: number): {
  functionName: string | null;
  currentParamIndex: number;
  params: string[] | null;
} {
  const beforeCursor = text.substring(0, cursorPosition);
  const afterCursor = text.substring(cursorPosition);

  // Find the last function call before cursor
  const functionCallMatch = beforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
  if (!functionCallMatch) return { functionName: null, currentParamIndex: 0, params: null };

  const functionName = functionCallMatch[1];
  const paramsStart = functionCallMatch.index! + functionCallMatch[0].length;
  const paramsText = beforeCursor.substring(paramsStart) + afterCursor;

  // Count commas to determine current parameter
  const currentParamIndex = (paramsText.match(/,/g) || []).length;

  // Extract parameters
  const params: string[] = [];
  let currentParam = '';
  let parenCount = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < paramsText.length; i++) {
    const char = paramsText[i];

    if (char === '"' || char === "'") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (char === ',' && parenCount === 0) {
        params.push(currentParam.trim());
        currentParam = '';
        continue;
      }
    }

    currentParam += char;
  }

  if (currentParam) {
    params.push(currentParam.trim());
  }

  return {
    functionName,
    currentParamIndex,
    params
  };
} 