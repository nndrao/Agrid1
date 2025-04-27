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
    textColor?: string | undefined;
    backgroundColor?: string | undefined;
    alignH?: string;
    borderStyle?: string | undefined;
    borderWidth?: number | undefined;
    borderColor?: string | undefined;
    borderSides?: string | undefined;
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
    width: '100%',
    justifyContent: 'flex-start',
    borderRadius: '0px', // Explicitly set border radius to 0
  };

  // Only apply color styles if explicitly defined (not undefined)
  if (styles.textColor !== undefined) {
    previewStyle.color = styles.textColor;
  }
  
  if (styles.backgroundColor !== undefined) {
    previewStyle.backgroundColor = styles.backgroundColor;
  }

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

  // Only apply border styles if all required properties are defined
  if (
    styles.borderStyle !== undefined && 
    styles.borderStyle !== 'None' && 
    styles.borderWidth !== undefined && 
    styles.borderWidth > 0 &&
    styles.borderColor !== undefined &&
    styles.borderSides !== undefined
  ) {
    const width = `${styles.borderWidth}px`;
    const color = styles.borderColor;
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

  // Use theme-based styling for the preview container
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