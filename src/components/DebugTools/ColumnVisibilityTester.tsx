import React from 'react';
import { Button } from '@/components/ui/button';
import { useGridStore } from '@/store/gridStore';

export const ColumnVisibilityTester: React.FC = () => {
  const { debugColumnVisibility, testSaveLoadColumnVisibility, forceApplyColumnVisibility } = useGridStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={debugColumnVisibility}
        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900"
      >
        Debug Column Visibility
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={testSaveLoadColumnVisibility}
        className="bg-blue-100 hover:bg-blue-200 text-blue-900"
      >
        Test Save/Load Visibility
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={forceApplyColumnVisibility}
        className="bg-red-100 hover:bg-red-200 text-red-900"
      >
        Force Apply Visibility
      </Button>
    </div>
  );
};
