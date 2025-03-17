
import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Cable, PieChart, BarChart3 } from 'lucide-react';

interface ChartControlsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  chartType: 'pie' | 'bar';
  onChartTypeChange: (type: 'pie' | 'bar') => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({ 
  activeTab, 
  onTabChange, 
  chartType, 
  onChartTypeChange 
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <TabsList>
        <TabsTrigger value="office" className="flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" /> Uffici
        </TabsTrigger>
        <TabsTrigger value="ac" className="flex items-center gap-1">
          <Cable className="h-3.5 w-3.5" /> Aria Condizionata
        </TabsTrigger>
      </TabsList>
      
      <div className="space-x-1">
        <Button
          variant={chartType === 'pie' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChartTypeChange('pie')}
          className="h-8 w-8 p-0"
        >
          <PieChart className="h-4 w-4" />
        </Button>
        <Button
          variant={chartType === 'bar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChartTypeChange('bar')}
          className="h-8 w-8 p-0"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChartControls;
