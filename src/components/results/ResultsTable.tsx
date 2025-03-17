
import React from 'react';
import { ConsumptionData } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultsTableProps {
  data: ConsumptionData[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
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
              <TableCell>{item.name}</TableCell>
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
