import React from 'react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <div className={cn('space-y-4 p-4 bg-card rounded-lg border', className)}>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
} 