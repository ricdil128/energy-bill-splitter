
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

const EmptyResults: React.FC = () => {
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
};

export default EmptyResults;
