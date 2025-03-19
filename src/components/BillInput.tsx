
import React from 'react';
import { ConsumptionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Cable, CalendarIcon, FileText, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEnergy } from '@/context/EnergyContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface BillInputProps {
  type: ConsumptionType;
  title: string;
}

const BillInput: React.FC<BillInputProps> = ({ type, title }) => {
  const { officeBill, acBill, updateBillAmount } = useEnergy();
  
  const bill = type === 'office' ? officeBill : acBill;
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      updateBillAmount(type, value, bill.groupId, bill.providerName, bill.billNumber);
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBillAmount(type, bill.totalAmount, bill.groupId, e.target.value, bill.billNumber);
  };

  const handleBillNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBillAmount(type, bill.totalAmount, bill.groupId, bill.providerName, e.target.value);
  };
  
  const icon = type === 'office' ? <Building2 className="h-5 w-5" /> : <Cable className="h-5 w-5" />;
  
  return (
    <Card className="shadow-sm transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl font-medium">
          {icon} {title}
        </CardTitle>
        <CardDescription>
          Inserisci i dettagli della bolletta
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor={`${type}-amount`} className="text-sm font-medium">
            Importo Bolletta (€)
          </Label>
          <div className="relative">
            <Input
              id={`${type}-amount`}
              type="number"
              min="0"
              step="0.01"
              value={bill.totalAmount || ''}
              onChange={handleAmountChange}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor={`${type}-provider`} className="text-sm font-medium">
            Fornitore
          </Label>
          <div className="relative">
            <Input
              id={`${type}-provider`}
              type="text"
              placeholder="Es. Enel, ENI, A2A"
              value={bill.providerName || ''}
              onChange={handleProviderChange}
              className="pl-8"
            />
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor={`${type}-number`} className="text-sm font-medium">
            Numero Bolletta/Fattura
          </Label>
          <div className="relative">
            <Input
              id={`${type}-number`}
              type="text"
              placeholder="Es. 123456789"
              value={bill.billNumber || ''}
              onChange={handleBillNumberChange}
              className="pl-8"
            />
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Label htmlFor={`${type}-date`} className="text-sm font-medium">
            Data Bolletta
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !bill.billDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {bill.billDate ? format(bill.billDate, "PPP") : "Seleziona una data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={bill.billDate}
                onSelect={(date) => {
                  if (date) {
                    updateBillAmount(
                      type, 
                      bill.totalAmount, 
                      bill.groupId, 
                      bill.providerName, 
                      bill.billNumber
                    );
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillInput;
