import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ColumnSettingsDialog } from './ColumnSettingsDialogRefactored';

// Sample column list for testing
const testColumns = [
  'PositionId', 'Cusip', 'Isin', 'Issuer', 'Currency', 'Sector', 'Rating', 
  'MaturityDate', 'Coupon', 'Position', 'MarketValue', 'Price', 'YieldToMaturity', 
  'ModifiedDuration', 'Convexity', 'SpreadDuration', 'ZSpread', 'OaSpread'
];

export const ColumnSettingsTest: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState('PositionId');

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Column Settings</Button>
      
      <ColumnSettingsDialog
        open={open}
        onOpenChange={setOpen}
        columnList={testColumns}
        selectedColumn={selectedColumn}
        onSelectColumn={setSelectedColumn}
      />
    </div>
  );
};
