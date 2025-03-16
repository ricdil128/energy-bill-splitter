
import React, { useState } from 'react';
import { useEnergy } from '@/context/EnergyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';

// Import refactored components
import EmptyResults from './results/EmptyResults';
import ResultsChart from './results/ResultsChart';
import ResultsTable from './results/ResultsTable';
import ChartControls from './results/ChartControls';
import ResultsSummary from './results/ResultsSummary';
import ExportButton from './results/ExportButton';

const ResultsDisplay: React.FC = () => {
  const { currentResult } = useEnergy();
  const [activeChartTab, setActiveChartTab] = useState('office');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  if (!currentResult) {
    return <EmptyResults />;
  }
  
  const { officeData, acData, officeBill, acBill, date, officeTotal, acTotal } = currentResult;
  
  // Get active data based on selected tab
  const getActiveData = () => activeChartTab === 'office' ? officeData : acData;
  
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium">Calculation Results</CardTitle>
          <span className="text-sm text-muted-foreground">
            {format(date, 'PPpp')}
          </span>
        </div>
        <CardDescription>
          Breakdown of costs by consumption
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-0">
        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeChartTab} onValueChange={setActiveChartTab} className="w-full">
            <ChartControls 
              activeTab={activeChartTab} 
              onTabChange={setActiveChartTab}
              chartType={chartType}
              onChartTypeChange={setChartType}
            />
            
            <TabsContent value="office" className="mt-0">
              <ResultsSummary 
                totalAmount={officeBill.totalAmount} 
                totalConsumption={officeTotal} 
              />
              <ResultsChart data={officeData} chartType={chartType} />
            </TabsContent>
            
            <TabsContent value="ac" className="mt-0">
              <ResultsSummary 
                totalAmount={acBill.totalAmount} 
                totalConsumption={acTotal} 
              />
              <ResultsChart data={acData} chartType={chartType} />
            </TabsContent>
          </Tabs>
        </div>
        
        <ResultsTable data={getActiveData()} />
      </CardContent>
      
      <CardFooter className="pt-4">
        <ExportButton result={currentResult} />
      </CardFooter>
    </Card>
  );
};

export default ResultsDisplay;
