
import React, { useState, useEffect } from 'react';
import { useEnergy } from '@/context/EnergyContext';
import { CompanyInfo } from '@/types';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ImageUpload';
import { useForm } from 'react-hook-form';
import { Building, Building2, Users, Save } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const CompanyInfoManager: React.FC = () => {
  const { companyInfo, saveCompanyInfo } = useEnergy();
  const [activeTab, setActiveTab] = useState<'company' | 'condominium'>('company');
  
  // Form setup
  const form = useForm<CompanyInfo>({
    defaultValues: {
      id: '',
      name: '',
      type: 'company',
      address: '',
      vatNumber: '',
      administrator: {
        name: '',
        email: '',
        phone: ''
      },
      logoUrl: ''
    }
  });
  
  // Update form when companyInfo changes
  useEffect(() => {
    if (companyInfo) {
      form.reset({
        ...companyInfo,
        administrator: companyInfo.administrator || {
          name: '',
          email: '',
          phone: ''
        }
      });
      setActiveTab(companyInfo.type);
    }
  }, [companyInfo, form.reset]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'company' | 'condominium');
    form.setValue('type', value as 'company' | 'condominium');
  };
  
  // Handle form submission
  const onSubmit = async (data: CompanyInfo) => {
    try {
      // Ensure we have an ID
      if (!data.id) {
        data.id = uuidv4();
      }
      
      const success = await saveCompanyInfo(data);
      if (success) {
        toast.success(`${data.type === 'company' ? 'Azienda' : 'Condominio'} salvato con successo`);
      }
    } catch (error) {
      console.error('Error saving company info:', error);
      toast.error('Errore durante il salvataggio');
    }
  };
  
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" /> 
          Informazioni Azienda/Condominio
        </CardTitle>
        <CardDescription>
          Gestisci le informazioni dell'azienda o del condominio e dell'amministratore
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="company">
              <Building2 className="h-4 w-4 mr-2" /> Azienda
            </TabsTrigger>
            <TabsTrigger value="condominium">
              <Users className="h-4 w-4 mr-2" /> Condominio
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome {activeTab === 'company' ? 'Azienda' : 'Condominio'}</FormLabel>
                  <FormControl>
                    <Input placeholder={activeTab === 'company' ? "Es. Azienda Energia Srl" : "Es. Condominio Aurora"} {...field} />
                  </FormControl>
                  <FormDescription>
                    Il nome verrà visualizzato sui report e nelle intestazioni
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indirizzo</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Via Roma, 123 - Milano" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {activeTab === 'company' ? 'Partita IVA' : 'Codice Fiscale Condominio'}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={activeTab === 'company' ? "Es. IT12345678901" : "Es. 12345678901"} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="border p-4 rounded-md space-y-4 bg-muted/20">
              <h3 className="text-md font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Dati Amministratore
              </h3>
              
              <FormField
                control={form.control}
                name="administrator.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Amministratore</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. Mario Rossi" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="administrator.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Es. admin@condominio.it" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="administrator.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. +39 123 456 7890" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>
                    Il logo verrà visualizzato sui report
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Salva {activeTab === 'company' ? 'Azienda' : 'Condominio'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoManager;
