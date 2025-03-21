
import React, { useState } from 'react';
import { ConsumptionData, ConsumptionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { useEnergy } from '@/context/EnergyContext';
import { Building2, Cable, Zap, RefreshCw, EuroIcon, ServerIcon } from 'lucide-react';
import { GROUP_COLABORA1, GROUP_COLABORA2 } from '@/context/energy-context-types';
import { useOfficeRegistry } from '@/hooks/useOfficeRegistry';

interface ConsumptionInputProps {
  type: ConsumptionType;
  title?: string;
}

const ConsumptionInput: React.FC<ConsumptionInputProps> = ({ type, title }) => {
  const {
    officeData,
    acData,
    currentResult,
    updateConsumption,
    resetConsumptionData,
    groupedOfficeData,
    groupedAcData,
    getConsumptionTypeLabel
  } = useEnergy();
  
  const { getCompanyName } = useOfficeRegistry();
  
  const data = type === 'office' ? officeData : acData;
  const groupedData = type === 'office' ? groupedOfficeData : groupedAcData;
  const [activeTab, setActiveTab] = useState<string>('table');
  const [activeGroupTab, setActiveGroupTab] = useState<string>(GROUP_COLABORA1);
  
  const handleChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateConsumption(type, id, numValue);
    }
  };
  
  const handleBulkImport = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split('\n');
    let updated = 0;
    
    lines.forEach(line => {
      const [name, kwhStr] = line.split(',').map(s => s.trim());
      const kwh = parseFloat(kwhStr);
      
      if (name && !isNaN(kwh) && kwh >= 0) {
        const item = data.find(d => d.name.toLowerCase() === name.toLowerCase());
        if (item) {
          updateConsumption(type, item.id, kwh);
          updated++;
        }
      }
    });
    
    if (updated > 0) {
      toast.success(`Aggiornati ${updated} valori di consumo ${getConsumptionTypeLabel(type)}`);
    }
  };

  const getGroupTotal = (groupId: string) => {
    return data
      .filter(item => item.groupId === groupId && !item.isGeneral)
      .reduce((sum, item) => sum + item.kwh, 0);
  };
  
  const getGroupGeneralTotal = (groupId: string) => {
    return data
      .filter(item => item.groupId === groupId && item.isGeneral)
      .reduce((sum, item) => sum + item.kwh, 0);
  };
  
  const totalKwh = data
    .filter(item => !item.isGeneral)
    .reduce((sum, item) => sum + item.kwh, 0);
  
  const icon = type === 'office' ? <Building2 className="h-5 w-5" /> : <Cable className="h-5 w-5" />;
  
  const getCalculatedCost = (id: string) => {
    if (!currentResult) return null;
    
    const resultData = type === 'office' 
      ? currentResult.officeData 
      : currentResult.acData;
    
    const item = resultData.find(d => d.id === id);
    return item?.cost;
  };
  
  const getActiveGroupItems = () => {
    const groupItems = groupedData[activeGroupTab]?.items || [];
    return groupItems;
  };
  
  const getActiveGroupGeneralCounters = () => {
    return groupedData[activeGroupTab]?.generalCounters || [];
  };
  
  // Use the context-provided label or fallback to the provided title
  const displayTitle = title || getConsumptionTypeLabel(type);
  
  return (
    <Card className="shadow-sm transition-all duration-300 h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            {icon} {displayTitle}
          </CardTitle>
          <Badge variant="outline" className="px-2 py-1 text-sm">
            <Zap className="h-3.5 w-3.5 mr-1 inline-block" />
            Totale: {totalKwh.toFixed(2)} kWh
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs value={activeGroupTab} onValueChange={setActiveGroupTab} className="w-full mb-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value={GROUP_COLABORA1}>Colabora 1</TabsTrigger>
            <TabsTrigger value={GROUP_COLABORA2}>Colabora 2</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex justify-between mb-4">
          <Badge variant="secondary" className="px-2 py-1 text-sm">
            Gruppo: {activeGroupTab === GROUP_COLABORA1 ? 'Colabora 1' : 'Colabora 2'}
          </Badge>
          <Badge variant="outline" className="px-2 py-1 text-sm">
            <Zap className="h-3.5 w-3.5 mr-1 inline-block" />
            Totale Gruppo: {getGroupTotal(activeGroupTab).toFixed(2)} kWh
          </Badge>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="table">Tabella Dati</TabsTrigger>
            <TabsTrigger value="bulk">Importazione</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-0">
            <ScrollArea className="h-[350px] pr-4">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>kWh</TableHead>
                    <TableHead>Costo (€)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getActiveGroupItems().map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        {getCompanyName(item.id, type, item.name)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.kwh || ''}
                            onChange={(e) => handleChange(item.id, e.target.value)}
                            className="max-w-[100px]"
                          />
                          <span className="text-sm text-gray-500">kWh</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCalculatedCost(item.id) ? (
                            <div className="flex items-center">
                              <EuroIcon className="h-4 w-4 mr-1 text-green-600" />
                              <span>{getCalculatedCost(item.id)?.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-sm">N/D</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {type === 'ac' && getActiveGroupGeneralCounters().length > 0 && (
                    <>
                      <TableRow>
                        <TableCell colSpan={3} className="bg-muted/50">
                          <div className="flex items-center gap-2 font-medium">
                            <ServerIcon className="h-4 w-4" />
                            Contatori Generali
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {getActiveGroupGeneralCounters().map((item) => (
                        <TableRow key={item.id} className="group bg-muted/20">
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.kwh || ''}
                                onChange={(e) => handleChange(item.id, e.target.value)}
                                className="max-w-[100px]"
                              />
                              <span className="text-sm text-gray-500">kWh</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCalculatedCost(item.id) ? (
                                <div className="flex items-center">
                                  <EuroIcon className="h-4 w-4 mr-1 text-green-600" />
                                  <span>{getCalculatedCost(item.id)?.toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic text-sm">N/D</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {type === 'ac' && getActiveGroupGeneralCounters().length > 0 && (
                        <TableRow className="bg-muted/10">
                          <TableCell>Totale Contatori Generali</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 font-medium">
                              <span>{getGroupGeneralTotal(activeGroupTab).toFixed(2)} kWh</span>
                            </div>
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-0">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Incolla i dati in formato CSV: Nome, kWh (una voce per riga)
              </div>
              <textarea
                className="w-full h-[300px] p-3 border rounded-md text-sm font-mono bg-background resize-none"
                placeholder={`Esempio:\n${type === 'office' ? 'Ufficio' : 'AC'} 1, 120.5\n${type === 'office' ? 'Ufficio' : 'AC'} 2, 85.2`}
                onChange={handleBulkImport}
              />
              <div className="text-xs text-muted-foreground">
                Nota: I nomi devono corrispondere esattamente alle voci esistenti.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => resetConsumptionData(type, activeGroupTab as ConsumptionType)}
          className="flex items-center gap-1 ml-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Azzera Dati Gruppo
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConsumptionInput;
