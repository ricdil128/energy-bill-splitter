
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HistoryPanel from '@/components/HistoryPanel';
import ResultsDisplay from '@/components/ResultsDisplay';
import MonthlyChart from '@/components/MonthlyChart';

const History: React.FC = () => {
  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <h1 className="text-3xl font-medium mb-6">Cronologia Calcoli</h1>
      
      <Tabs defaultValue="details" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="charts">Grafici e Analisi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <HistoryPanel />
            </div>
            <div className="lg:col-span-2">
              <ResultsDisplay />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="charts">
          <div className="mb-8">
            <MonthlyChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
