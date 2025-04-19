import React from 'react';
import { Button } from '@/components/ui/button';
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

const horizontalAligns = [
  { value: "left", icon: AlignLeft, label: "Left" },
  { value: "center", icon: AlignCenter, label: "Center" },
  { value: "right", icon: AlignRight, label: "Right" },
];

interface AlignmentButtonsProps {
  value: string;
  onChange: (value: string) => void;
}

export const AlignmentButtons: React.FC<AlignmentButtonsProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="w-full flex gap-2">
      <div className="flex w-full gap-2">
        {horizontalAligns.map(({ value: alignValue, icon: Icon, label }) => (
          <Button
            key={alignValue}
            type="button"
            variant={value === alignValue ? "secondary" : "outline"}
            size="icon"
            className="flex-1 h-7 w-7 flex items-center justify-center"
            onClick={() => onChange(alignValue)}
            aria-label={label}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
    </div>
  );
};
