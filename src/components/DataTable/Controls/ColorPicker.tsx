import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export const ColorPicker = ({ color, onChange, disabled = false }: ColorPickerProps) => {
  const [open, setOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(color || '#ffffff');

  // Update internal state when prop changes
  useEffect(() => {
    setCurrentColor(color || '#ffffff');
  }, [color]);

  // Update parent when color changes, after making sure it's a valid hex color
  const handleColorChange = (newColor: string) => {
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
      setCurrentColor(newColor);
      onChange(newColor);
    } else if (newColor === '') {
      setCurrentColor('');
      onChange('');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            disabled={disabled}
            className="w-10 h-10 p-0 border-2"
            style={{ backgroundColor: currentColor || '#ffffff' }}
          >
            <span className="sr-only">Pick a color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker 
            color={currentColor || '#ffffff'} 
            onChange={handleColorChange}
          />
          <div className="flex items-center mt-2">
            <Input
              value={currentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </PopoverContent>
      </Popover>
      
      <Input
        type="text"
        value={currentColor}
        onChange={(e) => handleColorChange(e.target.value)}
        className="w-24 h-8"
        placeholder="#RRGGBB"
        disabled={disabled}
      />
    </div>
  );
}; 