import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface SettingsItemProps {
  label: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export function SettingsItem({ label, children, description, className }: SettingsItemProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        {children}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
} 