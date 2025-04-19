import React from 'react';
import { Button } from '@/components/ui/button';

interface FontStyleButtonsProps {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  onBoldChange: (value: boolean) => void;
  onItalicChange: (value: boolean) => void;
  onUnderlineChange: (value: boolean) => void;
}

export const FontStyleButtons: React.FC<FontStyleButtonsProps> = ({
  bold,
  italic,
  underline,
  onBoldChange,
  onItalicChange,
  onUnderlineChange
}) => {
  return (
    <div className="flex gap-1">
      <Button 
        variant={bold ? 'secondary' : 'outline'} 
        size="sm" 
        className="h-7 w-7" 
        onClick={() => onBoldChange(!bold)}
      >
        B
      </Button>
      <Button 
        variant={italic ? 'secondary' : 'outline'} 
        size="sm" 
        className="h-7 w-7" 
        onClick={() => onItalicChange(!italic)}
      >
        /
      </Button>
      <Button 
        variant={underline ? 'secondary' : 'outline'} 
        size="sm" 
        className="h-7 w-7" 
        onClick={() => onUnderlineChange(!underline)}
      >
        U
      </Button>
    </div>
  );
};
