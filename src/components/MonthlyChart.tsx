
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnergy } from '@/context/EnergyContext';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';
import { Button } from './ui/button';
import { BarChart3, TrendingUp } from 'lucide-react';
import { GROUP_COLABORA1, GROUP_COLABORA2 } from '@/context/energy-context-types';

const MonthlyChart: React.FC = () => {
  const { results } = useEnergy();
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [activeGroup, setActiveGroup] = useState<string>('all');

  const getMonthlyData = () => {
    const monthlyMap = new Map<string, {
      month: string,
      officeTotal: number,
      acTotal: number,
      officeCost: number,
      acCost: number,
      officeColabora1: number,
      acColabora1: number,
      officeColabora2: number,
      acColabora2: number,
      generalAc1: number,
      generalAc2: number
    }>();

    results.forEach(result => {
      const monthStr = format(result.date, 'MMM yyyy');
      
      // Separa i dati per gruppo
      const officeColabora1 = result.officeData
        .filter(item => item.groupId === GROUP_COLABORA1 && !item.isGeneral)
        .reduce((sum, item) => sum + item.kwh, 0);
        
      const officeColabora2 = result.officeData
        .filter(item => item.groupId === GROUP_COLABORA2 && !item.isGeneral)
        .reduce((sum, item) => sum + item.kwh, 0);
        
      const acColabora1 = result.acData
        .filter(item => item.groupId === GROUP_COLABORA1 && !item.isGeneral)
        .reduce((sum, item) => sum + item.kwh, 0);
        
      const acColabora2 = result.acData
        .filter(item => item.groupId === GROUP_COLABORA2 && !item.isGeneral)
        .reduce((sum, item) => sum + item.kwh, 0);
        
      // Valori dei contatori generali
      const generalAc1 = result.acData
        .filter(item => item.groupId === GROUP_COLABORA1 && item.isGeneral)
        .reduce((sum, item) => sum + item.kwh, 0);
        
      const generalAc2 = result.acData
        .filter(item => item.groupId === GROUP_COLABORA2 && item.isGeneral)
        .reduce((sum, item) => sum + item.kwh, 0);
      
      if (monthlyMap.has(monthStr)) {
        const existing = monthlyMap.get(monthStr)!;
        monthlyMap.set(monthStr, {
          month: monthStr,
          officeTotal: existing.officeTotal + result.officeTotal,
          acTotal: existing.acTotal + result.acTotal,
          officeCost: existing.officeCost + result.officeBill.totalAmount,
          acCost: existing.acCost + result.acBill.totalAmount,
          officeColabora1: existing.officeColabora1 + officeColabora1,
          acColabora1: existing.acColabora1 + acColabora1,
          officeColabora2: existing.officeColabora2 + officeColabora2,
          acColabora2: existing.acColabora2 + acColabora2,
          generalAc1: existing.generalAc1 + generalAc1,
          generalAc2: existing.generalAc2 + generalAc2
        });
      } else {
        monthlyMap.set(monthStr, {
          month: monthStr,
          officeTotal: result.officeTotal,
          acTotal: result.acTotal,
          officeCost: result.officeBill.totalAmount,
          acCost: result.acBill.totalAmount,
          officeColabora1,
          acColabora1,
          officeColabora2,
          acColabora2,
          generalAc1,
          generalAc2
        });
      }
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const monthlyData = getMonthlyData();

  const formatTooltipValue = (value: number, name: string) => {
    return [`${value.toFixed(2)} ${name.includes('Cost') ? '€' : 'kWh'}`, name];
  };

  if (monthlyData.length === 0) {
    return (
      <Card className="shadow-sm h-full flex flex-col items-center justify-center text-center p-6">
        <CardContent>
          <div className="py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nessun dato storico</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Completa alcuni calcoli per vedere i trend di consumo mensili.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium">Trend di Consumo Mensile</CardTitle>
          <div className="space-x-1">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="h-8 w-8 p-0"
              title="Grafico a Barre"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
              className="h-8 w-8 p-0"
              title="Grafico Lineare"
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeGroup} onValueChange={setActiveGroup} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tutti</TabsTrigger>
            <TabsTrigger value={GROUP_COLABORA1}>Colabora 1</TabsTrigger>
            <TabsTrigger value={GROUP_COLABORA2}>Colabora 2</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Tabs defaultValue="consumption">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="consumption">Consumo (kWh)</TabsTrigger>
            <TabsTrigger value="cost">Costo (€)</TabsTrigger>
            <TabsTrigger value="general">Contatori Generali</TabsTrigger>
          </TabsList>

          <TabsContent value="consumption" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  {activeGroup === 'all' && (
                    <>
                      <Bar dataKey="officeTotal" name="Uffici (Totale)" fill="#0088FE" />
                      <Bar dataKey="acTotal" name="A/C (Totale)" fill="#00C49F" />
                    </>
                  )}
                  {activeGroup === GROUP_COLABORA1 && (
                    <>
                      <Bar dataKey="officeColabora1" name="Uffici Colabora 1" fill="#0088FE" />
                      <Bar dataKey="acColabora1" name="A/C Colabora 1" fill="#00C49F" />
                    </>
                  )}
                  {activeGroup === GROUP_COLABORA2 && (
                    <>
                      <Bar dataKey="officeColabora2" name="Uffici Colabora 2" fill="#0088FE" />
                      <Bar dataKey="acColabora2" name="A/C Colabora 2" fill="#00C49F" />
                    </>
                  )}
                </BarChart>
              ) : (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  {activeGroup === 'all' && (
                    <>
                      <Line type="monotone" dataKey="officeTotal" name="Uffici (Totale)" stroke="#0088FE" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="acTotal" name="A/C (Totale)" stroke="#00C49F" />
                    </>
                  )}
                  {activeGroup === GROUP_COLABORA1 && (
                    <>
                      <Line type="monotone" dataKey="officeColabora1" name="Uffici Colabora 1" stroke="#0088FE" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="acColabora1" name="A/C Colabora 1" stroke="#00C49F" />
                    </>
                  )}
                  {activeGroup === GROUP_COLABORA2 && (
                    <>
                      <Line type="monotone" dataKey="officeColabora2" name="Uffici Colabora 2" stroke="#0088FE" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="acColabora2" name="A/C Colabora 2" stroke="#00C49F" />
                    </>
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="cost" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  {activeGroup === 'all' && (
                    <>
                      <Bar dataKey="officeCost" name="Uffici (Totale)" fill="#0088FE" />
                      <Bar dataKey="acCost" name="A/C (Totale)" fill="#00C49F" />
                    </>
                  )}
                </BarChart>
              ) : (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  {activeGroup === 'all' && (
                    <>
                      <Line type="monotone" dataKey="officeCost" name="Uffici (Totale)" stroke="#0088FE" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="acCost" name="A/C (Totale)" stroke="#00C49F" />
                    </>
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="general" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  {activeGroup === 'all' && (
                    <>
                      <Bar dataKey="generalAc1" name="Contatore Gen. AC Colabora 1" fill="#8884d8" />
                      <Bar dataKey="generalAc2" name="Contatore Gen. AC Colabora 2" fill="#82ca9d" />
                      <Bar dataKey="acTotal" name="Somma A/C singoli" fill="#00C49F" />
                    </>
                  )}
                  {activeGroup === GROUP_COLABORA1 && (
                    <>
                      <Bar dataKey="generalAc1" name="Contatore Gen. AC Colabora 1" fill="#8884d8" />
                      <Bar dataKey="acColabora1" name="Somma A/C singoli Colabora 1" fill="#00C49F" />
                    </>
                  )}
                  {activeGroup === GROUP_COLABORA2 && (
                    <>
                      <Bar dataKey="generalAc2" name="Contatore Gen. AC Colabora 2" fill="#82ca9d" />
                      <Bar dataKey="acColabora2" name="Somma A/C singoli Colabora 2" fill="#00C49F" />
                    </>
                  )}
                </BarChart>
              ) : (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  {activeGroup === 'all' && (
                    <>
                      <Line type="monotone" dataKey="generalAc1" name="Contatore Gen. AC Colabora 1" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="generalAc2" name="Contatore Gen. AC Colabora 2" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="acTotal" name="Somma A/C singoli" stroke="#00C49F" />
                    </>
                  )}
                  {activeGroup === GROUP_COLABORA1 && (
                    <>
                      <Line type="monotone" dataKey="generalAc1" name="Contatore Gen. AC Colabora 1" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="acColabora1" name="Somma A/C singoli Colabora 1" stroke="#00C49F" />
                    </>
                  )}
                  {activeGroup === GROUP_COLABORA2 && (
                    <>
                      <Line type="monotone" dataKey="generalAc2" name="Contatore Gen. AC Colabora 2" stroke="#82ca9d" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="acColabora2" name="Somma A/C singoli Colabora 2" stroke="#00C49F" />
                    </>
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MonthlyChart;
