import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SimpleColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export function SimpleColorPicker({ label, color = '#000000', onChange }: SimpleColorPickerProps) {
  const [currentColor, setCurrentColor] = useState(color || '#000000');
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [rgb, setRgb] = useState<{r: number, g: number, b: number}>({r: 0, g: 0, b: 0});
  
  const hueRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const isDraggingHue = useRef(false);
  const isDraggingSaturation = useRef(false);

  // Convert hex to HSL on mount and when color prop changes
  useEffect(() => {
    if (color && color.startsWith('#')) {
      const { h, s, l, r, g, b } = hexToHsl(color);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      setRgb({r, g, b});
      setCurrentColor(color);
    }
  }, [color]);

  // Convert HSL to hex when HSL values change
  useEffect(() => {
    const hexColor = hslToHex(hue, saturation, lightness);
    setCurrentColor(hexColor);
    const rgbValues = hslToRgb(hue, saturation, lightness);
    setRgb(rgbValues);
  }, [hue, saturation, lightness]);

  // Convert RGB to hex when RGB values change
  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    let numValue = parseInt(value);
    if (isNaN(numValue)) numValue = 0;
    if (numValue < 0) numValue = 0;
    if (numValue > 255) numValue = 255;
    
    const newRgb = { ...rgb, [channel]: numValue };
    setRgb(newRgb);
    
    const hexColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setCurrentColor(hexColor);
    
    // Update HSL values
    const { h, s, l } = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
    setHue(h);
    setSaturation(s);
    setLightness(l);
    
    onChange(hexColor);
  };

  // Handle color change directly from input
  const handleColorChange = (newColor: string) => {
    if (newColor.startsWith('#')) {
      setCurrentColor(newColor);
      
      const { h, s, l, r, g, b } = hexToHsl(newColor);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      setRgb({r, g, b});
      
      onChange(newColor);
    }
  };

  // Handle hue slider drag
  const handleHueDrag = (e: React.MouseEvent | MouseEvent) => {
    if (hueRef.current && isDraggingHue.current) {
      const rect = hueRef.current.getBoundingClientRect();
      const width = rect.width;
      const offsetX = e.clientX - rect.left;
      const newHue = Math.max(0, Math.min(359, Math.round((offsetX / width) * 360)));
      setHue(newHue);
      
      // When hue changes, update the color and trigger onChange
      const hexColor = hslToHex(newHue, saturation, lightness);
      setCurrentColor(hexColor);
      onChange(hexColor);
    }
  };

  // Handle saturation/lightness box drag
  const handleSaturationDrag = (e: React.MouseEvent | MouseEvent) => {
    if (saturationRef.current && isDraggingSaturation.current) {
      const rect = saturationRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      const offsetX = Math.max(0, Math.min(width, e.clientX - rect.left));
      const offsetY = Math.max(0, Math.min(height, e.clientY - rect.top));
      
      const newSaturation = Math.round((offsetX / width) * 100);
      // Invert lightness so top is lighter (100%) and bottom is darker (0%)
      const newLightness = Math.round(100 - (offsetY / height) * 100);
      
      setSaturation(newSaturation);
      setLightness(newLightness);
      
      // When saturation/lightness changes, update the color and trigger onChange
      const hexColor = hslToHex(hue, newSaturation, newLightness);
      setCurrentColor(hexColor);
      onChange(hexColor);
    }
  };

  // Setup mouse move and mouse up handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleHueDrag(e);
      handleSaturationDrag(e);
    };
    
    const handleMouseUp = () => {
      isDraggingHue.current = false;
      isDraggingSaturation.current = false;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [hue, saturation, lightness]);

  // Helper: Convert hex to HSL
  const hexToHsl = (hex: string) => {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h = Math.round(h * 60);
    }
    
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return { 
      h, s, l,
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Helper: Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    h = h % 360;
    s = s / 100;
    l = l / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    // Convert to hex
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Helper: Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    h = h % 360;
    s = s / 100;
    l = l / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return { r, g, b };
  };

  // Helper: Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Helper: Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h = Math.round(h * 60);
    }
    
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return { h, s, l };
  };

  // Helper function to determine if text should be white or black based on background color
  const getContrastColor = (hexColor: string): string => {
    // Default to black if not a valid hex color
    if (!hexColor || !hexColor.startsWith('#')) return '#000000';
    
    try {
      // Convert hex to RGB
      const r = parseInt(hexColor.substring(1, 3), 16);
      const g = parseInt(hexColor.substring(3, 5), 16);
      const b = parseInt(hexColor.substring(5, 7), 16);
      
      // Calculate brightness (YIQ equation)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // Return white or black based on brightness
      return brightness > 128 ? '#000000' : '#FFFFFF';
    } catch (e) {
      return '#000000';
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={`color-${label}`} className="text-sm">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            id={`color-${label}`} 
            variant="outline" 
            className="w-[60px] h-[28px] p-0 border"
            style={{ 
              backgroundColor: currentColor,
              color: getContrastColor(currentColor)
            }}
          >
            <span className="text-xs" style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.3)' }}>
              {currentColor}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0 shadow-lg" side="right">
          <div className="p-0">
            {/* Color saturation/lightness selector */}
            <div 
              ref={saturationRef}
              className="relative w-full h-[180px] cursor-crosshair"
              style={{ 
                backgroundColor: `hsl(${hue}, 100%, 50%)`,
                backgroundImage: `
                  linear-gradient(to right, #fff 0%, transparent 100%),
                  linear-gradient(to top, #000 0%, transparent 100%)
                `
              }}
              onMouseDown={(e) => {
                isDraggingSaturation.current = true;
                handleSaturationDrag(e);
              }}
            >
              {/* Selection indicator */}
              <div 
                className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-2 -translate-y-2 pointer-events-none shadow-sm"
                style={{ 
                  left: `${saturation}%`,
                  top: `${100 - lightness}%`
                }}
              />
            </div>
            
            {/* Hue slider */}
            <div 
              ref={hueRef}
              className="relative w-full h-6 mt-2 cursor-pointer"
              style={{ 
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
              onMouseDown={(e) => {
                isDraggingHue.current = true;
                handleHueDrag(e);
              }}
            >
              {/* Hue slider indicator */}
              <div 
                className="absolute w-2 h-full border-2 border-white -translate-x-1 pointer-events-none"
                style={{ left: `${(hue / 360) * 100}%` }}
              />
            </div>
            
            {/* RGB Inputs */}
            <div className="flex p-2 bg-gray-900 justify-between items-center">
              <div className="flex items-center space-x-1">
                <Label htmlFor="r-value" className="text-xs text-white w-2">R</Label>
                <Input 
                  id="r-value" 
                  value={rgb.r} 
                  onChange={(e) => handleRgbChange('r', e.target.value)}
                  className="h-7 w-12 text-xs text-white bg-gray-800 border-gray-700"
                />
              </div>
              <div className="flex items-center space-x-1">
                <Label htmlFor="g-value" className="text-xs text-white w-2">G</Label>
                <Input 
                  id="g-value" 
                  value={rgb.g} 
                  onChange={(e) => handleRgbChange('g', e.target.value)}
                  className="h-7 w-12 text-xs text-white bg-gray-800 border-gray-700"
                />
              </div>
              <div className="flex items-center space-x-1">
                <Label htmlFor="b-value" className="text-xs text-white w-2">B</Label>
                <Input 
                  id="b-value" 
                  value={rgb.b} 
                  onChange={(e) => handleRgbChange('b', e.target.value)}
                  className="h-7 w-12 text-xs text-white bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}