
import React from 'react';
import HistoryPanel from '@/components/HistoryPanel';
import ResultsDisplay from '@/components/ResultsDisplay';

const History: React.FC = () => {
  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <h1 className="text-3xl font-medium mb-6">Calculation History</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HistoryPanel />
        </div>
        <div className="lg:col-span-2">
          <ResultsDisplay />
        </div>
      </div>
    </div>
  );
};

export default History;
