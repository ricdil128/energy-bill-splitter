
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

const EmptyResults: React.FC = () => {
  return (
    <Card className="shadow-sm h-full flex flex-col items-center justify-center text-center p-6">
      <CardContent>
        <div className="py-12">
          <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nessun risultato di calcolo</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Inserisci i dati di consumo per uffici e aria condizionata, poi clicca "Calcola" per vedere i risultati qui.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyResults;
