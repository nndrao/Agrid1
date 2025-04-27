import React, { useState, useEffect, useRef } from 'react';
import { getFunctionsByCategory } from './functions';
import { cn } from '@/lib/utils';

interface Suggestion {
  type: 'function' | 'column' | 'operator';
  value: string;
  description?: string;
  syntax?: string;
}

interface AutoCompleteProps {
  value: string;
  cursorPosition: number;
  columnDefs: any[];
  onSelect: (suggestion: Suggestion) => void;
  className?: string;
}

export const AutoComplete: React.FC<AutoCompleteProps> = ({
  value,
  cursorPosition,
  columnDefs,
  onSelect,
  className
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const word = getCurrentWord(value, cursorPosition);
    if (!word) {
      setSuggestions([]);
      return;
    }

    const newSuggestions: Suggestion[] = [];

    // Function suggestions
    Object.values(getFunctionsByCategory).forEach(category => {
      category.forEach(fn => {
        if (fn.name.toLowerCase().includes(word.toLowerCase())) {
          newSuggestions.push({
            type: 'function',
            value: fn.name,
            description: fn.description,
            syntax: fn.syntax
          });
        }
      });
    });

    // Column suggestions
    columnDefs.forEach(col => {
      const field = col.field || col.colId;
      if (field.toLowerCase().includes(word.toLowerCase())) {
        newSuggestions.push({
          type: 'column',
          value: field,
          description: col.headerName || field
        });
      }
    });

    // Operator suggestions
    const operators = ['+', '-', '*', '/', '==', '!=', '>', '<', '>=', '<=', '&&', '||', 'IN'];
    operators.forEach(op => {
      if (op.includes(word)) {
        newSuggestions.push({
          type: 'operator',
          value: op
        });
      }
    });

    setSuggestions(newSuggestions);
    setSelectedIndex(0);
  }, [value, cursorPosition, columnDefs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setSuggestions([]);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedIndex, onSelect]);

  if (suggestions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute z-50 w-64 bg-background border rounded-md shadow-lg",
        "max-h-48 overflow-y-auto",
        className
      )}
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.type}-${suggestion.value}`}
          className={cn(
            "p-2 cursor-pointer hover:bg-accent",
            index === selectedIndex && "bg-accent"
          )}
          onClick={() => onSelect(suggestion)}
        >
          <div className="flex items-center justify-between">
            <span className={cn(
              "font-mono",
              suggestion.type === 'function' && "text-red-600",
              suggestion.type === 'column' && "text-orange-600",
              suggestion.type === 'operator' && "text-purple-600"
            )}>
              {suggestion.value}
            </span>
            {suggestion.syntax && (
              <span className="text-xs text-muted-foreground">
                {suggestion.syntax}
              </span>
            )}
          </div>
          {suggestion.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {suggestion.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

function getCurrentWord(text: string, cursorPosition: number): string {
  const beforeCursor = text.substring(0, cursorPosition);
  const words = beforeCursor.split(/[\s()[\]{},]/);
  return words[words.length - 1] || '';
} 