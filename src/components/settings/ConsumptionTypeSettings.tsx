
import React, { useEffect } from 'react';
import { useEnergy } from '@/context/EnergyContext';
import { ConsumptionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface FormValues {
  officeLabel: string;
  acLabel: string;
}

const ConsumptionTypeSettings: React.FC = () => {
  const { consumptionTypeLabels, updateConsumptionTypeLabel } = useEnergy();
  
  const form = useForm<FormValues>({
    defaultValues: {
      officeLabel: consumptionTypeLabels.office,
      acLabel: consumptionTypeLabels.ac
    }
  });
  
  // Aggiorna il form quando cambiano i valori esterni
  useEffect(() => {
    form.reset({
      officeLabel: consumptionTypeLabels.office,
      acLabel: consumptionTypeLabels.ac
    });
  }, [consumptionTypeLabels, form]);
  
  const onSubmit = (values: FormValues) => {
    if (values.officeLabel.trim() && values.acLabel.trim()) {
      updateConsumptionTypeLabel('office', values.officeLabel.trim());
      updateConsumptionTypeLabel('ac', values.acLabel.trim());
      
      // Mostra toast di conferma
      toast.success('Impostazioni salvate con successo', {
        description: 'Le etichette dei tipi di consumo sono state aggiornate',
        icon: <Check className="h-4 w-4 text-green-500" />
      });
    } else {
      toast.error('Entrambe le etichette devono essere compilate');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalizza Tipi di Consumo</CardTitle>
        <CardDescription>
          Personalizza le etichette utilizzate per i diversi tipi di consumo energetico
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="officeLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etichetta per "Uffici"</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Es. Uffici, Appartamenti, Unità..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="acLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etichetta per "Aria Condizionata"</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Es. Aria Condizionata, Riscaldamento, Servizi Comuni..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              <Save className="mr-2 h-4 w-4" /> Salva Modifiche
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ConsumptionTypeSettings;
