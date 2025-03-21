
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConsumptionInput from '@/components/ConsumptionInput';
import BillInput from '@/components/BillInput';
import ResultsDisplay from '@/components/ResultsDisplay';
import MonthlyChart from '@/components/MonthlyChart';
import OfficeRegistryManager from '@/components/OfficeRegistryManager';
import CompanyInfoManager from '@/components/CompanyInfoManager';
import PDFReportGenerator from '@/components/PDFReportGenerator';
import ConsumptionTypeSettings from '@/components/settings/ConsumptionTypeSettings';
import { useEnergy } from '@/context/EnergyContext';
import { Calculator, BarChart3, Users, FileText, Building, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { calculateResults, companyInfo, getConsumptionTypeLabel } = useEnergy();
  
  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <h1 className="text-3xl font-medium mb-2">
        {companyInfo?.name ? companyInfo.name : 'Ripartizione Bollette Energetiche'}
      </h1>
      {companyInfo?.administrator?.name && (
        <p className="text-sm text-muted-foreground mb-6">
          Gestito da: {companyInfo.administrator.name}
        </p>
      )}
      
      <Tabs defaultValue="input" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="input">Inserimento Dati</TabsTrigger>
          <TabsTrigger value="registry">Anagrafica</TabsTrigger>
          <TabsTrigger value="company">Azienda/Condominio</TabsTrigger>
          <TabsTrigger value="reports">Report PDF</TabsTrigger>
          <TabsTrigger value="charts">Grafici e Analisi</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ConsumptionInput type="office" />
            <ConsumptionInput type="ac" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <BillInput type="office" title={`Bolletta ${getConsumptionTypeLabel('office')}`} />
            <BillInput type="ac" title={`Bolletta ${getConsumptionTypeLabel('ac')}`} />
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
        
        <TabsContent value="registry">
          <div className="mb-8">
            <OfficeRegistryManager />
          </div>
        </TabsContent>
        
        <TabsContent value="company">
          <div className="mb-8">
            <CompanyInfoManager />
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="mb-8">
            <PDFReportGenerator />
          </div>
        </TabsContent>
        
        <TabsContent value="charts">
          <div className="mb-8">
            <MonthlyChart />
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConsumptionTypeSettings />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
