import React, { ReactNode } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface TabSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const TabSection: React.FC<TabSectionProps> = ({
  title,
  icon,
  children,
  className = ''
}) => {
  return (
    <Card className={`bg-card border border-border/80 shadow-none rounded-lg mb-4 ${className}`}>
      <CardHeader className="px-4 pt-4 pb-2 flex flex-col gap-2 border-b">
        <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
          {icon}
          {title}
        </div>
      </CardHeader>
      <CardContent className="py-4">
        {children}
      </CardContent>
    </Card>
  );
};
