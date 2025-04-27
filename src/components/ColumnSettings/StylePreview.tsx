import React from 'react';

interface StylePreviewProps {
  label: string;
  value: string;
  styles?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textColor?: string;
    backgroundColor?: string;
    alignH?: string;
    borderStyle?: string;
    borderWidth?: number;
    borderColor?: string;
    borderSides?: string;
  };
}

export const StylePreview: React.FC<StylePreviewProps> = ({ label, value, styles = {} }) => {
  // Create dynamic style object
  const previewStyle: React.CSSProperties = {
    fontFamily: styles.fontFamily || 'inherit',
    fontSize: styles.fontSize || 'inherit',
    fontWeight: styles.bold ? 'bold' : styles.fontWeight || 'normal',
    fontStyle: styles.italic ? 'italic' : 'normal',
    textDecoration: styles.underline ? 'underline' : 'none',
    color: styles.textColor || 'inherit',
    backgroundColor: styles.backgroundColor || 'inherit',
    width: '100%',
    justifyContent: 'flex-start',
    borderRadius: '0px',
  };

  // Map alignH values to CSS text-align and justify-content values
  if (styles.alignH) {
    if (styles.alignH === 'left' || styles.alignH === 'Left') {
      previewStyle.textAlign = 'left';
      previewStyle.justifyContent = 'flex-start';
    } else if (styles.alignH === 'center' || styles.alignH === 'Center') {
      previewStyle.textAlign = 'center';
      previewStyle.justifyContent = 'center';
    } else if (styles.alignH === 'right' || styles.alignH === 'Right') {
      previewStyle.textAlign = 'right';
      previewStyle.justifyContent = 'flex-end';
    }
  }

  // Add border styles
  if (styles.borderStyle && styles.borderStyle !== 'None' && styles.borderWidth && styles.borderWidth > 0) {
    const width = `${styles.borderWidth}px`;
    const color = styles.borderColor || '#000000';
    const style = styles.borderStyle === 'Solid' ? 'solid' : 
                  styles.borderStyle === 'Dashed' ? 'dashed' : 
                  styles.borderStyle === 'Dotted' ? 'dotted' : 'solid';
                  
    if (styles.borderSides === 'All') {
      previewStyle.border = `${width} ${style} ${color}`;
    } else if (styles.borderSides === 'Horizontal') {
      previewStyle.borderTop = `${width} ${style} ${color}`;
      previewStyle.borderBottom = `${width} ${style} ${color}`;
    } else if (styles.borderSides === 'Vertical') {
      previewStyle.borderLeft = `${width} ${style} ${color}`;
      previewStyle.borderRight = `${width} ${style} ${color}`;
    } else if (styles.borderSides === 'Top') {
      previewStyle.borderTop = `${width} ${style} ${color}`;
    } else if (styles.borderSides === 'Bottom') {
      previewStyle.borderBottom = `${width} ${style} ${color}`;
    } else if (styles.borderSides === 'Left') {
      previewStyle.borderLeft = `${width} ${style} ${color}`;
    } else if (styles.borderSides === 'Right') {
      previewStyle.borderRight = `${width} ${style} ${color}`;
    }
  }

  return (
    <div className="mb-3">
      <div 
        className="border border-border/80 h-7 px-2 flex items-center text-[13px]"
        style={previewStyle}
      >
        {value}
      </div>
    </div>
  );
};