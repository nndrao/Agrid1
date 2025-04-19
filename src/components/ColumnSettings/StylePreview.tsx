import React from 'react';

interface StylePreviewProps {
  label: string;
  value?: string;
}

export const StylePreview: React.FC<StylePreviewProps> = ({
  label,
  value = "Preview"
}) => {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium mb-0.5 text-muted-foreground block">{label}</label>
      <input 
        disabled 
        className="w-full h-7 rounded bg-muted-foreground/10 border border-border/80 px-2 text-[13px] text-muted-foreground" 
        value={value} 
      />
    </div>
  );
};
