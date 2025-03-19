
import React, { useState, useEffect } from 'react';
import { useEnergy } from '@/context/EnergyContext';
import { useOfficeRegistry } from '@/hooks/useOfficeRegistry';
import { OfficeRegistry, ConsumptionType } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, 
  Cable, 
  Users, 
  Phone, 
  Mail, 
  FileEdit, 
  Trash2, 
  Plus 
} from 'lucide-react';
import { GROUP_COLABORA1, GROUP_COLABORA2 } from '@/context/energy-context-types';
import { v4 as uuidv4 } from 'uuid';

const OfficeRegistryManager: React.FC = () => {
  const { officeData, acData } = useEnergy();
  const { registries, saveRegistry, deleteRegistry, getCompanyName } = useOfficeRegistry();
  const [activeTab, setActiveTab] = useState<string>('office');
  const [activeGroupTab, setActiveGroupTab] = useState<string>(GROUP_COLABORA1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRegistry, setSelectedRegistry] = useState<OfficeRegistry | null>(null);
  
  // Ottieni dati per la scheda attiva
  const getData = () => {
    const type = activeTab as ConsumptionType;
    const groupId = activeGroupTab;
    
    const data = type === 'office' ? officeData : acData;
    return data.filter(item => 
      item.groupId === groupId && 
      !item.isGeneral
    );
  };
  
  // Gestisci il click su Modifica
  const handleEdit = (consumptionId: string) => {
    const type = activeTab as ConsumptionType;
    const groupId = activeGroupTab;
    
    // Cerca l'anagrafica esistente
    const existing = registries.find(r => 
      r.consumptionId === consumptionId && 
      r.consumptionType === type
    );
    
    // Cerca il consumo per ottenere il nome predefinito
    const consumption = (type === 'office' ? officeData : acData)
      .find(item => item.id === consumptionId);
    
    if (existing) {
      setSelectedRegistry(existing);
    } else if (consumption) {
      setSelectedRegistry({
        id: '',
        consumptionId: consumption.id,
        consumptionType: type,
        groupId: groupId,
        companyName: consumption.name
      });
    }
    
    setDialogOpen(true);
  };
  
  // Gestisci il salvataggio dell'anagrafica
  const handleSave = async () => {
    if (selectedRegistry) {
      const success = await saveRegistry(selectedRegistry);
      if (success) {
        setDialogOpen(false);
        setSelectedRegistry(null);
      }
    }
  };
  
  // Gestisci l'eliminazione dell'anagrafica
  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa anagrafica?')) {
      await deleteRegistry(id);
    }
  };
  
  // Gestisci il cambiamento dei campi del form
  const handleChange = (field: keyof OfficeRegistry, value: string) => {
    if (selectedRegistry) {
      setSelectedRegistry({
        ...selectedRegistry,
        [field]: value
      });
    }
  };
  
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Anagrafica Uffici
        </CardTitle>
        <CardDescription>
          Gestisci le informazioni sugli uffici e le aziende
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="office">
              <Building2 className="h-4 w-4 mr-2" /> Uffici
            </TabsTrigger>
            <TabsTrigger value="ac">
              <Cable className="h-4 w-4 mr-2" /> Aria Condizionata
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Tabs value={activeGroupTab} onValueChange={setActiveGroupTab} className="w-full mb-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value={GROUP_COLABORA1}>Colabora 1</TabsTrigger>
            <TabsTrigger value={GROUP_COLABORA2}>Colabora 2</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <ScrollArea className="h-[400px] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Default</TableHead>
                <TableHead>Nome Azienda</TableHead>
                <TableHead>Contatti</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getData().map((item) => {
                const registry = registries.find(r => 
                  r.consumptionId === item.id && 
                  r.consumptionType === activeTab
                );
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {registry?.companyName || 
                        <span className="text-muted-foreground italic">Non impostato</span>
                      }
                    </TableCell>
                    <TableCell>
                      {registry?.contactPerson ? (
                        <div className="flex flex-col space-y-1 text-sm">
                          <span>{registry.contactPerson}</span>
                          {registry.email && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Mail className="h-3 w-3 mr-1" /> {registry.email}
                            </span>
                          )}
                          {registry.phone && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" /> {registry.phone}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Nessun contatto</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item.id)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        {registry && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(registry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifica Anagrafica</DialogTitle>
            <DialogDescription>
              Inserisci le informazioni dell'azienda o della persona che occupa questo spazio.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistry && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Nome Azienda</Label>
                <Input
                  id="companyName"
                  value={selectedRegistry.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Persona di Contatto</Label>
                <Input
                  id="contactPerson"
                  value={selectedRegistry.contactPerson || ''}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={selectedRegistry.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={selectedRegistry.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={selectedRegistry.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OfficeRegistryManager;
