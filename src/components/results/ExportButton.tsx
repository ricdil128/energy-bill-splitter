
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { CalculationResult } from '@/types';
import { exportToCSV, downloadCSV } from '@/utils/calculations';
import { format } from 'date-fns';

interface ExportButtonProps {
  result: CalculationResult;
}

const ExportButton: React.FC<ExportButtonProps> = ({ result }) => {
  const handleExportCSV = () => {
    const csvContent = exportToCSV(result);
    const fileName = `energy-bill-split-${format(result.date, 'yyyy-MM-dd')}.csv`;
    downloadCSV(csvContent, fileName);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExportCSV}
      className="flex items-center gap-1 ml-auto"
    >
      <Download className="h-3.5 w-3.5" /> Export CSV
    </Button>
  );
};

export default ExportButton;
