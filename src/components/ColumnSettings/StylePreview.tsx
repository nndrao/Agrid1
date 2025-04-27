import React from 'react';

interface StylePreviewProps {
  label: string;
  value: string;
}

export const StylePreview: React.FC<StylePreviewProps> = ({ label, value }) => {
  return (
    <div className="mb-4">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="border border-border/80 rounded p-2 bg-white dark:bg-gray-800">
        {value}
      </div>
    </div>
  );
};