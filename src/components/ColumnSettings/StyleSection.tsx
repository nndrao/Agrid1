import React, { ReactNode } from 'react';

interface StyleSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const StyleSection: React.FC<StyleSectionProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="text-xs font-bold text-foreground mb-1">{title}</div>
      {children}
    </div>
  );
};
