
import React from 'react';
import { BillData } from '@/types';

interface ResultsSummaryProps {
  totalAmount: number;
  totalConsumption: number;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({ totalAmount, totalConsumption }) => {
  return (
    <div className="mb-2 flex justify-between text-sm">
      <div>Totale: <span className="font-medium">{totalAmount.toFixed(2)} €</span></div>
      <div>Consumo: <span className="font-medium">{totalConsumption.toFixed(2)} kWh</span></div>
    </div>
  );
};

export default ResultsSummary;
