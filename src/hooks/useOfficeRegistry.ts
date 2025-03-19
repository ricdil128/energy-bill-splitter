import { useState, useEffect } from 'react';
import { OfficeRegistry, ConsumptionType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './useAuth';

export function useOfficeRegistry() {
  const [registries, setRegistries] = useState<OfficeRegistry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Carica le anagrafiche dal database
  useEffect(() => {
    async function loadRegistries() {
      setIsLoading(true);
      
      try {
        if (user) {
          const { data, error } = await supabase
            .from('office_registry')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          // Converti i dati dal formato DB al formato dell'applicazione
          const formattedData: OfficeRegistry[] = data.map(item => ({
            id: item.id,
            consumptionId: item.consumption_id,
            consumptionType: item.consumption_type as ConsumptionType,
            groupId: item.group_id,
            companyName: item.company_name,
            contactPerson: item.contact_person,
            email: item.email,
            phone: item.phone,
            notes: item.notes
          }));
          
          setRegistries(formattedData);
        } else {
          // Carica dal localStorage se l'utente non è autenticato
          const savedData = localStorage.getItem('office-registry-data');
          if (savedData) {
            setRegistries(JSON.parse(savedData));
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento anagrafiche:", error);
        toast.error("Impossibile caricare le anagrafiche degli uffici");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadRegistries();
  }, [user]);

  // Salva le modifiche
  const saveRegistry = async (registry: OfficeRegistry) => {
    try {
      const isNew = !registry.id;
      const newId = registry.id || uuidv4();
      const updatedRegistry = { ...registry, id: newId };
      
      if (user) {
        const dbData = {
          id: isNew ? undefined : newId,
          consumption_id: registry.consumptionId,
          consumption_type: registry.consumptionType,
          group_id: registry.groupId,
          company_name: registry.companyName,
          contact_person: registry.contactPerson,
          email: registry.email,
          phone: registry.phone,
          notes: registry.notes,
          user_id: user.id
        };
        
        if (isNew) {
          const { error } = await supabase
            .from('office_registry')
            .insert(dbData);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('office_registry')
            .update(dbData)
            .eq('id', newId);
          
          if (error) throw error;
        }
      }
      
      // Aggiorna lo stato locale
      setRegistries(prev => {
        const newRegistries = isNew 
          ? [...prev, updatedRegistry]
          : prev.map(item => item.id === newId ? updatedRegistry : item);
        
        // Salva anche nel localStorage per l'uso offline
        localStorage.setItem('office-registry-data', JSON.stringify(newRegistries));
        return newRegistries;
      });
      
      toast.success(isNew ? "Anagrafica creata con successo" : "Anagrafica aggiornata con successo");
      return true;
    } catch (error) {
      console.error("Errore nel salvataggio dell'anagrafica:", error);
      toast.error("Impossibile salvare l'anagrafica");
      return false;
    }
  };

  // Elimina un'anagrafica
  const deleteRegistry = async (id: string) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('office_registry')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      }
      
      // Aggiorna lo stato locale
      setRegistries(prev => {
        const newRegistries = prev.filter(item => item.id !== id);
        localStorage.setItem('office-registry-data', JSON.stringify(newRegistries));
        return newRegistries;
      });
      
      toast.success("Anagrafica eliminata con successo");
      return true;
    } catch (error) {
      console.error("Errore nell'eliminazione dell'anagrafica:", error);
      toast.error("Impossibile eliminare l'anagrafica");
      return false;
    }
  };

  // Ottieni il nome dell'azienda per un consumo specifico
  const getCompanyName = (consumptionId: string, type?: ConsumptionType, defaultName?: string): string => {
    const registry = registries.find(r => 
      r.consumptionId === consumptionId && 
      (type ? r.consumptionType === type : true)
    );
    
    return registry?.companyName || defaultName || 'Senza nome';
  };

  // Ottieni l'anagrafica completa per un consumo specifico
  const getRegistryForConsumption = (consumptionId: string): OfficeRegistry | undefined => {
    return registries.find(r => r.consumptionId === consumptionId);
  };

  return {
    registries,
    isLoading,
    saveRegistry,
    deleteRegistry,
    getCompanyName,
    getRegistryForConsumption
  };
}
