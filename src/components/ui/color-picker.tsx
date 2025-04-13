import React, { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface ColorPickerProps {
  color?: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ color = '#000000', onChange, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [opacity, setOpacity] = useState(100);

  const handleColorChange = (newColor: string) => {
    // Convert hex to rgba if opacity is not 100%
    if (opacity < 100) {
      const r = parseInt(newColor.slice(1, 3), 16);
      const g = parseInt(newColor.slice(3, 5), 16);
      const b = parseInt(newColor.slice(5, 7), 16);
      onChange(`rgba(${r}, ${g}, ${b}, ${opacity / 100})`);
    } else {
      onChange(newColor);
    }
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      onChange(`rgba(${r}, ${g}, ${b}, ${value / 100})`);
    } else if (color.startsWith('rgba')) {
      const [r, g, b] = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
      onChange(`rgba(${r}, ${g}, ${b}, ${value / 100})`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('flex items-center gap-2', className)}>
          <div
            className="w-8 h-8 rounded-md border cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => setOpen(true)}
          />
          <HexColorInput
            color={color.startsWith('rgba') ? color : color.slice(0, 7)}
            onChange={handleColorChange}
            className="w-20 h-8 px-2 text-sm border rounded-md"
            prefixed
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 space-y-4">
        <HexColorPicker
          color={color.startsWith('rgba') ? color : color.slice(0, 7)}
          onChange={handleColorChange}
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Opacity</span>
            <span className="text-sm">{opacity}%</span>
          </div>
          <Slider
            value={[opacity]}
            onValueChange={([value]) => handleOpacityChange(value)}
            max={100}
            step={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
} 