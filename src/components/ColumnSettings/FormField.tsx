import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  className = '',
  children
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label 
        htmlFor={htmlFor} 
        className="text-xs font-medium mb-1 text-muted-foreground block"
      >
        {label}
      </label>
      {children}
    </div>
  );
};
