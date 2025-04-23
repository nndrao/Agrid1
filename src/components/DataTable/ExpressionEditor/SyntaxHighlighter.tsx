import React, { useEffect, useRef, useState } from 'react';
import { TokenType } from './parser';
import { getFunctionByName } from './functions';
import { cn } from '@/lib/utils';
import { AutoComplete } from './AutoComplete';
import { ParameterHints } from './ParameterHints';

interface SyntaxHighlighterProps {
  value: string;
  onChange: (value: string) => void;
  columnDefs: any[];
  className?: string;
}

const tokenColors: Record<TokenType, string> = {
  identifier: 'text-gray-900',
  number: 'text-blue-600',
  string: 'text-green-600',
  operator: 'text-purple-600',
  function: 'text-red-600',
  column: 'text-orange-600',
  parenthesis: 'text-gray-600',
  comma: 'text-gray-600'
};

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  value,
  onChange,
  columnDefs,
  className
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAutoComplete, setShowAutoComplete] = useState(false);

  useEffect(() => {
    if (!textareaRef.current || !highlightRef.current) return;

    const updateHighlight = () => {
      const textarea = textareaRef.current!;
      const highlight = highlightRef.current!;

      // Get textarea styles
      const styles = window.getComputedStyle(textarea);
      highlight.style.fontFamily = styles.fontFamily;
      highlight.style.fontSize = styles.fontSize;
      highlight.style.lineHeight = styles.lineHeight;
      highlight.style.padding = styles.padding;
      highlight.style.width = styles.width;
      highlight.style.height = styles.height;
      highlight.style.whiteSpace = styles.whiteSpace;
      highlight.style.wordWrap = styles.wordWrap;

      // Tokenize and highlight
      const tokens = tokenize(value);
      highlight.innerHTML = tokens
        .map(token => `<span class="${tokenColors[token.type]}">${escapeHtml(token.value)}</span>`)
        .join('');
    };

    updateHighlight();
  }, [value]);

  const handleScroll = () => {
    if (!textareaRef.current || !highlightRef.current) return;
    highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  const handleCursorPosition = () => {
    if (!textareaRef.current) return;
    setCursorPosition(textareaRef.current.selectionStart);
    setShowAutoComplete(true);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(end);
    const word = getCurrentWord(value, start);
    const newValue = beforeCursor.substring(0, beforeCursor.length - word.length) + 
                    suggestion.value + 
                    afterCursor;

    onChange(newValue);
    setShowAutoComplete(false);

    // Move cursor after inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = start - word.length + suggestion.value.length;
        textareaRef.current.selectionStart = newCursorPosition;
        textareaRef.current.selectionEnd = newCursorPosition;
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="relative">
      <div
        ref={highlightRef}
        className={cn(
          "absolute inset-0 overflow-auto whitespace-pre-wrap break-words",
          "pointer-events-none bg-transparent",
          className
        )}
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyUp={handleCursorPosition}
        onClick={handleCursorPosition}
        className={cn(
          "relative w-full h-full p-2 bg-transparent text-transparent caret-black",
          "resize-none outline-none",
          className
        )}
      />
      {showAutoComplete && (
        <AutoComplete
          value={value}
          cursorPosition={cursorPosition}
          columnDefs={columnDefs}
          onSelect={handleSuggestionSelect}
          className="mt-1"
        />
      )}
      <ParameterHints
        value={value}
        cursorPosition={cursorPosition}
        className="mt-1"
      />
    </div>
  );
};

function tokenize(text: string): Array<{ type: TokenType; value: string }> {
  const tokens: Array<{ type: TokenType; value: string }> = [];
  const regex = /(\s+)|([a-zA-Z_][a-zA-Z0-9_]*)|(\d+(?:\.\d+)?)|(['"][^'"]*['"])|([+\-*/=<>!&|]+)|([(),])|(\[[^\]]+\])/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) continue; // Skip whitespace

    let type: TokenType = 'identifier';
    let value = match[0];

    if (match[2]) {
      type = 'identifier';
      if (getFunctionByName(value)) {
        type = 'function';
      }
    } else if (match[3]) {
      type = 'number';
    } else if (match[4]) {
      type = 'string';
      value = value.slice(1, -1); // Remove quotes
    } else if (match[5]) {
      type = 'operator';
    } else if (match[6]) {
      type = 'parenthesis';
    } else if (match[7]) {
      type = 'column';
      value = value.slice(1, -1); // Remove brackets
    }

    tokens.push({ type, value });
  }

  return tokens;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getCurrentWord(text: string, cursorPosition: number): string {
  const beforeCursor = text.substring(0, cursorPosition);
  const words = beforeCursor.split(/[\s()[\]{},]/);
  return words[words.length - 1] || '';
} 