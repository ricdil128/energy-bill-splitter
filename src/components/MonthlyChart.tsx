
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
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';
import { Button } from './ui/button';
import { BarChart3, TrendingUp } from 'lucide-react';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

const MonthlyChart: React.FC = () => {
  const { results } = useEnergy();
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const getMonthlyData = () => {
    const monthlyMap = new Map<string, {
      month: string,
      officeTotal: number,
      acTotal: number,
      officeCost: number,
      acCost: number
    }>();

    results.forEach(result => {
      const monthStr = format(result.date, 'MMM yyyy');
      
      if (monthlyMap.has(monthStr)) {
        const existing = monthlyMap.get(monthStr)!;
        monthlyMap.set(monthStr, {
          month: monthStr,
          officeTotal: existing.officeTotal + result.officeTotal,
          acTotal: existing.acTotal + result.acTotal,
          officeCost: existing.officeCost + result.officeBill.totalAmount,
          acCost: existing.acCost + result.acBill.totalAmount
        });
      } else {
        monthlyMap.set(monthStr, {
          month: monthStr,
          officeTotal: result.officeTotal,
          acTotal: result.acTotal,
          officeCost: result.officeBill.totalAmount,
          acCost: result.acBill.totalAmount
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

  const formatTooltipValue = (value: ValueType, name: NameType, props: TooltipProps) => {
    if (typeof value === 'number') {
      return [`${value.toFixed(2)} ${props.unit || ''}`, name];
    }
    return [value, name];
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
        <Tabs defaultValue="consumption">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="consumption">Consumo (kWh)</TabsTrigger>
            <TabsTrigger value="cost">Costo (€)</TabsTrigger>
          </TabsList>

          <TabsContent value="consumption" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} ${name.includes('Cost') ? '€' : 'kWh'}`,
                    name
                  ]} />
                  <Legend />
                  <Bar dataKey="officeTotal" name="Uffici" fill="#0088FE" />
                  <Bar dataKey="acTotal" name="A/C" fill="#00C49F" />
                </BarChart>
              ) : (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} ${name.includes('Cost') ? '€' : 'kWh'}`,
                    name
                  ]} />
                  <Legend />
                  <Line type="monotone" dataKey="officeTotal" name="Uffici" stroke="#0088FE" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="acTotal" name="A/C" stroke="#00C49F" />
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
                  <Tooltip formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} ${name.includes('Cost') ? '€' : 'kWh'}`,
                    name
                  ]} />
                  <Legend />
                  <Bar dataKey="officeCost" name="Uffici" fill="#0088FE" />
                  <Bar dataKey="acCost" name="A/C" fill="#00C49F" />
                </BarChart>
              ) : (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} ${name.includes('Cost') ? '€' : 'kWh'}`,
                    name
                  ]} />
                  <Legend />
                  <Line type="monotone" dataKey="officeCost" name="Uffici" stroke="#0088FE" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="acCost" name="A/C" stroke="#00C49F" />
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
