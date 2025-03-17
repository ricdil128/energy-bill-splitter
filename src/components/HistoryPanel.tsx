
import React from 'react';
import { useEnergy } from '@/context/EnergyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const HistoryPanel: React.FC = () => {
  const { results, loadResult, deleteResult } = useEnergy();
  
  if (results.length === 0) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <Clock className="h-5 w-5" /> Cronologia
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">Nessun calcolo ancora</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-medium">
          <Clock className="h-5 w-5" /> Cronologia Calcoli
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-350px)] max-h-[600px]">
          <div className="divide-y">
            {results.map((result) => (
              <div key={result.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      {format(result.date, 'PP')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {format(result.date, 'p')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {result.officeTotal.toFixed(0)} kWh
                    </Badge>
                    <span className="text-muted-foreground">+</span>
                    <Badge variant="outline" className="text-xs">
                      {result.acTotal.toFixed(0)} kWh
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Bollette: </span>
                    <span className="font-medium">{result.officeBill.totalAmount.toFixed(2)}€</span>
                    <span className="text-muted-foreground"> + </span>
                    <span className="font-medium">{result.acBill.totalAmount.toFixed(2)}€</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadResult(result.id)}
                      className="h-8 px-2"
                    >
                      <span className="sr-only">Carica</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive"
                        >
                          <span className="sr-only">Elimina</span>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare questo calcolo del {format(result.date, 'PP p')}?
                            Questa azione non può essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteResult(result.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
