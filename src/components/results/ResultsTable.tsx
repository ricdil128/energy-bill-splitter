
import React from 'react';
import { ConsumptionData, ConsumptionType } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOfficeRegistry } from '@/hooks/useOfficeRegistry';
import { useEnergy } from '@/context/EnergyContext';

interface ResultsTableProps {
  data: ConsumptionData[];
  type?: ConsumptionType;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, type }) => {
  const { getCompanyName } = useOfficeRegistry();
  const { getConsumptionTypeLabel } = useEnergy();
  
  return (
    <ScrollArea className="h-[200px] pr-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>kWh</TableHead>
            <TableHead>Costo (€)</TableHead>
            <TableHead>Percentuale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {getCompanyName(item.id, item.type as ConsumptionType, item.name)}
              </TableCell>
              <TableCell>{item.kwh.toFixed(2)}</TableCell>
              <TableCell>{item.cost?.toFixed(2) || 0}</TableCell>
              <TableCell>{item.percentage?.toFixed(2) || 0}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default ResultsTable;
