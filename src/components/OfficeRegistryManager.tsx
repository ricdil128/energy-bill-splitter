
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
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  Cable, 
  Users, 
  Phone, 
  Mail, 
  FileEdit, 
  Trash2, 
  Plus,
  Home,
  BedDouble 
} from 'lucide-react';
import { GROUP_COLABORA1, GROUP_COLABORA2 } from '@/context/energy-context-types';
import { v4 as uuidv4 } from 'uuid';

const OfficeRegistryManager: React.FC = () => {
  const { officeData, acData, groups, updateGroup } = useEnergy();
  const { registries, saveRegistry, deleteRegistry, getCompanyName } = useOfficeRegistry();
  const [activeTab, setActiveTab] = useState<string>('office');
  const [activeGroupTab, setActiveGroupTab] = useState<string>(GROUP_COLABORA1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRegistry, setSelectedRegistry] = useState<OfficeRegistry | null>(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<{id: string, name: string, propertyType: string, propertyNumber: string} | null>(null);
  
  // Get data for the active tab
  const getData = () => {
    const type = activeTab as ConsumptionType;
    const groupId = activeGroupTab;
    
    const data = type === 'office' ? officeData : acData;
    return data.filter(item => 
      item.groupId === groupId && 
      !item.isGeneral
    );
  };
  
  // Handle edit click
  const handleEdit = (consumptionId: string) => {
    const type = activeTab as ConsumptionType;
    const groupId = activeGroupTab;
    
    // Look for existing registry
    const existing = registries.find(r => 
      r.consumptionId === consumptionId && 
      r.consumptionType === type
    );
    
    // Look for consumption to get default name
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
        companyName: consumption.name,
        isOwner: true,
        squareMeters: consumption.squareMeters,
        thousandthQuota: consumption.thousandthQuota
      });
    }
    
    setDialogOpen(true);
  };
  
  // Handle registry save
  const handleSave = async () => {
    if (selectedRegistry) {
      const success = await saveRegistry(selectedRegistry);
      if (success) {
        setDialogOpen(false);
        setSelectedRegistry(null);
      }
    }
  };
  
  // Handle registry delete
  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa anagrafica?')) {
      await deleteRegistry(id);
    }
  };
  
  // Handle form field change
  const handleChange = (field: keyof OfficeRegistry, value: string | boolean | number) => {
    if (selectedRegistry) {
      setSelectedRegistry({
        ...selectedRegistry,
        [field]: value
      });
    }
  };
  
  // Handle property edit dialog
  const handleEditProperty = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    
    if (group) {
      setSelectedProperty({
        id: group.id,
        name: group.name,
        propertyType: group.propertyType || '',
        propertyNumber: group.propertyNumber || ''
      });
      setPropertyDialogOpen(true);
    }
  };
  
  // Handle property save
  const handleSaveProperty = () => {
    if (selectedProperty) {
      updateGroup(selectedProperty.id, {
        name: selectedProperty.name,
        propertyType: selectedProperty.propertyType,
        propertyNumber: selectedProperty.propertyNumber
      });
      setPropertyDialogOpen(false);
      setSelectedProperty(null);
    }
  };
  
  // Get property display name
  const getPropertyDisplayName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group && group.propertyType && group.propertyNumber) {
      return `${group.propertyType} ${group.propertyNumber} - ${group.name}`;
    }
    return group?.name || groupId;
  };
  
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Anagrafica Utenze e Proprietà
        </CardTitle>
        <CardDescription>
          Gestisci le informazioni sulle utenze, proprietà e gruppi di fabbricati
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Proprietà</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditProperty(activeGroupTab)}
              className="flex items-center gap-1"
            >
              <FileEdit className="h-3.5 w-3.5" /> Modifica Proprietà
            </Button>
          </div>
          <TabsList className="grid grid-cols-2 mb-4">
            {groups.map(group => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.propertyType && group.propertyNumber ? (
                  <div className="flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    <span>
                      {group.propertyType} {group.propertyNumber} - {group.name}
                    </span>
                  </div>
                ) : (
                  group.name
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <ScrollArea className="h-[400px] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utenza</TableHead>
                <TableHead>Azienda/Inquilino</TableHead>
                <TableHead>Dettagli</TableHead>
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
                      {registry?.isOwner && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900 dark:text-blue-300">
                          Proprietario
                        </span>
                      )}
                      {registry && !registry.isOwner && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 dark:bg-amber-900 dark:text-amber-300">
                          Affittuario
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1 text-sm">
                        {registry?.contactPerson && (
                          <span>{registry.contactPerson}</span>
                        )}
                        {registry?.squareMeters ? (
                          <span className="text-xs text-muted-foreground">
                            <BedDouble className="h-3 w-3 inline mr-1" /> 
                            {registry.squareMeters} m²
                          </span>
                        ) : null}
                        {registry?.thousandthQuota ? (
                          <span className="text-xs text-muted-foreground">
                            Millesimi: {registry.thousandthQuota}
                          </span>
                        ) : null}
                        {registry?.email && (
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" /> {registry.email}
                          </span>
                        )}
                        {registry?.phone && (
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" /> {registry.phone}
                          </span>
                        )}
                      </div>
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
            <DialogTitle>Modifica Anagrafica Utenza</DialogTitle>
            <DialogDescription>
              Inserisci le informazioni dell'azienda o della persona che occupa questo spazio.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistry && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Nome Azienda/Inquilino</Label>
                <Input
                  id="companyName"
                  value={selectedRegistry.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isOwner"
                  checked={selectedRegistry.isOwner}
                  onCheckedChange={(checked) => handleChange('isOwner', checked)}
                />
                <Label htmlFor="isOwner">Proprietario</Label>
                <span className="text-muted-foreground text-sm ml-2">
                  {selectedRegistry.isOwner ? 'Proprietario' : 'Affittuario'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="squareMeters">Metri Quadri</Label>
                  <Input
                    id="squareMeters"
                    type="number"
                    value={selectedRegistry.squareMeters || ''}
                    onChange={(e) => handleChange('squareMeters', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="thousandthQuota">Quota Millesimale</Label>
                  <Input
                    id="thousandthQuota"
                    type="number"
                    value={selectedRegistry.thousandthQuota || ''}
                    onChange={(e) => handleChange('thousandthQuota', parseFloat(e.target.value))}
                  />
                </div>
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
      
      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifica Proprietà</DialogTitle>
            <DialogDescription>
              Configura le informazioni della proprietà o del gruppo di fabbricati.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="propertyType">Tipo Proprietà</Label>
                <Input
                  id="propertyType"
                  placeholder="Es. Palazzina, Uffici, Fabbricato"
                  value={selectedProperty.propertyType}
                  onChange={(e) => setSelectedProperty({
                    ...selectedProperty,
                    propertyType: e.target.value
                  })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="propertyNumber">Numero</Label>
                <Input
                  id="propertyNumber"
                  placeholder="Es. 1, 2, A, B"
                  value={selectedProperty.propertyNumber}
                  onChange={(e) => setSelectedProperty({
                    ...selectedProperty,
                    propertyNumber: e.target.value
                  })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="propertyName">Nome Proprietà</Label>
                <Input
                  id="propertyName"
                  placeholder="Es. Residenza Mare, Uffici Centro"
                  value={selectedProperty.name}
                  onChange={(e) => setSelectedProperty({
                    ...selectedProperty,
                    name: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPropertyDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSaveProperty}>
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OfficeRegistryManager;
