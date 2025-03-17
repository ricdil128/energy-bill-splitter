
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConsumptionInput from '@/components/ConsumptionInput';
import BillInput from '@/components/BillInput';
import ResultsDisplay from '@/components/ResultsDisplay';
import MonthlyChart from '@/components/MonthlyChart';
import { useEnergy } from '@/context/EnergyContext';
import { Calculator, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { calculateResults } = useEnergy();
  
  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <h1 className="text-3xl font-medium mb-6">Ripartizione Bollette Energetiche</h1>
      
      <Tabs defaultValue="input" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="input">Inserimento Dati</TabsTrigger>
          <TabsTrigger value="charts">Grafici e Analisi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ConsumptionInput type="office" title="Consumo Uffici" />
            <ConsumptionInput type="ac" title="Consumo Aria Condizionata" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <BillInput type="office" title="Bolletta Ufficio" />
            <BillInput type="ac" title="Bolletta Aria Condizionata" />
          </div>
          
          <div className="mb-6">
            <Card className="shadow-sm border-transparent bg-primary text-primary-foreground">
              <CardContent className="flex justify-center items-center p-4">
                <Button 
                  onClick={calculateResults}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 transition-all"
                >
                  <Calculator className="mr-2 h-5 w-5" /> Calcola Ripartizione
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <ResultsDisplay />
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

export default Dashboard;
