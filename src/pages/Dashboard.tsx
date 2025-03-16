
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConsumptionInput from '@/components/ConsumptionInput';
import BillInput from '@/components/BillInput';
import ResultsDisplay from '@/components/ResultsDisplay';
import { useEnergy } from '@/context/EnergyContext';
import { Calculator } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { calculateResults } = useEnergy();
  
  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <h1 className="text-3xl font-medium mb-6">Energy Bill Splitter</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ConsumptionInput type="office" title="Office Consumption" />
        <ConsumptionInput type="ac" title="Air Conditioning Consumption" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <BillInput type="office" title="Office Bill" />
        <BillInput type="ac" title="Air Conditioning Bill" />
      </div>
      
      <div className="mb-6">
        <Card className="shadow-sm border-transparent bg-primary text-primary-foreground">
          <CardContent className="flex justify-center items-center p-4">
            <Button 
              onClick={calculateResults}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 transition-all"
            >
              <Calculator className="mr-2 h-5 w-5" /> Calculate Split
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <ResultsDisplay />
      </div>
    </div>
  );
};

export default Dashboard;
