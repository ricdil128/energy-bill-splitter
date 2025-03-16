
import React, { useState } from 'react';
import { ConsumptionData, ConsumptionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
import { Building2, Cable, Zap, RefreshCw, AlertCircle } from 'lucide-react';

interface ConsumptionInputProps {
  type: ConsumptionType;
  title: string;
}

const ConsumptionInput: React.FC<ConsumptionInputProps> = ({ type, title }) => {
  const {
    officeData,
    acData,
    thresholds,
    updateConsumption,
    setThreshold,
    resetConsumptionData,
  } = useEnergy();
  
  const data = type === 'office' ? officeData : acData;
  const [activeTab, setActiveTab] = useState<string>('table');
  
  // Handle consumption change
  const handleChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateConsumption(type, id, numValue);
    }
  };
  
  // Handle threshold change
  const handleThresholdChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setThreshold(type, id, numValue);
    }
  };
  
  // Handle bulk import
  const handleBulkImport = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split('\n');
    let updated = 0;
    
    lines.forEach(line => {
      const [name, kwhStr] = line.split(',').map(s => s.trim());
      const kwh = parseFloat(kwhStr);
      
      if (name && !isNaN(kwh) && kwh >= 0) {
        // Find the item by name
        const item = data.find(d => d.name.toLowerCase() === name.toLowerCase());
        if (item) {
          updateConsumption(type, item.id, kwh);
          updated++;
        }
      }
    });
    
    if (updated > 0) {
      toast.success(`Updated ${updated} ${type} consumption values`);
    }
  };

  // Total kWh
  const totalKwh = data.reduce((sum, item) => sum + item.kwh, 0);
  
  const icon = type === 'office' ? <Building2 className="h-5 w-5" /> : <Cable className="h-5 w-5" />;
  
  return (
    <Card className="shadow-sm transition-all duration-300 h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            {icon} {title}
          </CardTitle>
          <Badge variant="outline" className="px-2 py-1 text-sm">
            <Zap className="h-3.5 w-3.5 mr-1 inline-block" />
            Total: {totalKwh.toFixed(2)} kWh
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="table">Table Input</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>kWh</TableHead>
                    <TableHead>Threshold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="group">
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
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={thresholds[item.id] || ''}
                            onChange={(e) => handleThresholdChange(item.id, e.target.value)}
                            className="max-w-[100px]"
                            placeholder="Alert"
                          />
                          {thresholds[item.id] && item.kwh > thresholds[item.id] && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-0">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Paste data in CSV format: Name, kWh (one entry per line)
              </div>
              <textarea
                className="w-full h-[300px] p-3 border rounded-md text-sm font-mono bg-background resize-none"
                placeholder={`Example:\n${type === 'office' ? 'Office' : 'AC'} 1, 120.5\n${type === 'office' ? 'Office' : 'AC'} 2, 85.2`}
                onChange={handleBulkImport}
              />
              <div className="text-xs text-muted-foreground">
                Note: Names must match exactly with the existing entries.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => resetConsumptionData(type)}
          className="flex items-center gap-1 ml-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reset Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConsumptionInput;
