
import React, { useState } from 'react';
import { useEnergy } from '@/context/EnergyContext';
import { exportToCSV, downloadCSV } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Building2, Cable, Download, PieChart, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, PieChart as RechartsSimplePieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#83a6ed', '#8dd1e1', '#a4e2c6', '#d6e685', '#fddaec', '#f28cb1', '#a78dc1'];

const ResultsDisplay: React.FC = () => {
  const { currentResult } = useEnergy();
  const [activeChartTab, setActiveChartTab] = useState('office');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  if (!currentResult) {
    return (
      <Card className="shadow-sm h-full flex flex-col items-center justify-center text-center p-6">
        <CardContent>
          <div className="py-12">
            <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No calculation results yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Enter your consumption data for offices and air conditioning, then click "Calculate" to see results here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { officeData, acData, officeBill, acBill, date } = currentResult;
  
  const handleExportCSV = () => {
    const csvContent = exportToCSV(currentResult);
    const fileName = `energy-bill-split-${format(date, 'yyyy-MM-dd')}.csv`;
    downloadCSV(csvContent, fileName);
  };
  
  // Format data for charts
  const getActiveData = () => activeChartTab === 'office' ? officeData : acData;
  
  const renderChart = () => {
    const data = getActiveData();
    
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RechartsSimplePieChart>
            <Pie
              data={data}
              dataKey="kwh"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} kWh`, 'Consumption']} />
            <Legend />
          </RechartsSimplePieChart>
        </ResponsiveContainer>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} kWh`, 'Consumption']} />
          <Legend />
          <Bar dataKey="kwh" name="Consumption (kWh)" fill="#0088FE" />
          <Bar dataKey="cost" name="Cost (€)" fill="#00C49F" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
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
            <div className="flex justify-between items-center mb-2">
              <TabsList>
                <TabsTrigger value="office" className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> Offices
                </TabsTrigger>
                <TabsTrigger value="ac" className="flex items-center gap-1">
                  <Cable className="h-3.5 w-3.5" /> Air Conditioning
                </TabsTrigger>
              </TabsList>
              
              <div className="space-x-1">
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                  className="h-8 w-8 p-0"
                >
                  <PieChart className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="h-8 w-8 p-0"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TabsContent value="office" className="mt-0">
              <div className="mb-2 flex justify-between text-sm">
                <div>Total: <span className="font-medium">{officeBill.totalAmount.toFixed(2)} €</span></div>
                <div>Consumption: <span className="font-medium">{currentResult.officeTotal.toFixed(2)} kWh</span></div>
              </div>
              {renderChart()}
            </TabsContent>
            
            <TabsContent value="ac" className="mt-0">
              <div className="mb-2 flex justify-between text-sm">
                <div>Total: <span className="font-medium">{acBill.totalAmount.toFixed(2)} €</span></div>
                <div>Consumption: <span className="font-medium">{currentResult.acTotal.toFixed(2)} kWh</span></div>
              </div>
              {renderChart()}
            </TabsContent>
          </Tabs>
        </div>
        
        <ScrollArea className="h-[200px] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>kWh</TableHead>
                <TableHead>Cost (€)</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getActiveData().map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.kwh.toFixed(2)}</TableCell>
                  <TableCell>{item.cost?.toFixed(2) || 0}</TableCell>
                  <TableCell>{item.percentage?.toFixed(2) || 0}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportCSV}
          className="flex items-center gap-1 ml-auto"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResultsDisplay;
