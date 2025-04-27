import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';

interface ExpressionEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ExpressionEditor = forwardRef<HTMLTextAreaElement, ExpressionEditorProps>(({
  value,
  onChange,
  className
}, ref) => {
  const localRef = useRef<HTMLTextAreaElement>(null);
  
  // Forward the textarea ref to the parent component
  useImperativeHandle(ref, () => localRef.current!);

  useEffect(() => {
    if (localRef.current && document.activeElement !== localRef.current) {
      localRef.current.value = value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      // Insert tab at cursor position
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position directly - no need for setTimeout
      // React will handle this during the next render cycle
      if (localRef.current) {
        try {
          requestAnimationFrame(() => {
            if (localRef.current) {
              localRef.current.selectionStart = localRef.current.selectionEnd = start + 2;
              localRef.current.focus();
            }
          });
        } catch (error) {
          console.warn('Error setting cursor position:', error);
        }
      }
    }
  };

  return (
    <div className={cn("w-full h-full", className)}>
      <textarea
        ref={localRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="w-full h-full resize-none p-3 font-mono text-sm outline-none border-none bg-transparent"
        placeholder="Enter your expression here..."
        style={{ 
          caretColor: 'currentColor',
          lineHeight: 1.5
        }}
      />
    </div>
  );
}); 