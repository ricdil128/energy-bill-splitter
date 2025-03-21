
import React from 'react';
import { useEnergy } from '@/context/EnergyContext';
import { ConsumptionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const ConsumptionTypeSettings: React.FC = () => {
  const { consumptionTypeLabels, updateConsumptionTypeLabel } = useEnergy();
  const [officeLabel, setOfficeLabel] = React.useState(consumptionTypeLabels.office);
  const [acLabel, setAcLabel] = React.useState(consumptionTypeLabels.ac);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (officeLabel.trim() && acLabel.trim()) {
      updateConsumptionTypeLabel('office', officeLabel.trim());
      updateConsumptionTypeLabel('ac', acLabel.trim());
      toast.success('Etichette dei tipi di consumo aggiornate');
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="officeLabel">Etichetta per "Uffici"</Label>
            <Input
              id="officeLabel"
              value={officeLabel}
              onChange={(e) => setOfficeLabel(e.target.value)}
              placeholder="Es. Uffici, Appartamenti, Unità..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="acLabel">Etichetta per "Aria Condizionata"</Label>
            <Input
              id="acLabel"
              value={acLabel}
              onChange={(e) => setAcLabel(e.target.value)}
              placeholder="Es. Aria Condizionata, Riscaldamento, Servizi Comuni..."
            />
          </div>
          
          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" /> Salva Modifiche
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConsumptionTypeSettings;
