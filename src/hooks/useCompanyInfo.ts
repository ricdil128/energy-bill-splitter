
import { useState, useEffect } from 'react';
import { CompanyInfo } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'company-info-data';

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load company information
  useEffect(() => {
    async function loadCompanyInfo() {
      setIsLoading(true);
      
      try {
        if (user) {
          const { data, error } = await supabase
            .from('company_info')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            // PGRST116 is code for "no rows returned" which is expected if no company info exists yet
            throw error;
          }
          
          if (data) {
            setCompanyInfo({
              id: data.id,
              name: data.name,
              type: data.type,
              address: data.address,
              vatNumber: data.vat_number,
              administrator: data.administrator ? JSON.parse(data.administrator) : undefined,
              logoUrl: data.logo_url
            });
          } else {
            // Try to load from localStorage as fallback
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
              setCompanyInfo(JSON.parse(savedData));
            }
          }
        } else {
          // Load from localStorage if not authenticated
          const savedData = localStorage.getItem(STORAGE_KEY);
          if (savedData) {
            setCompanyInfo(JSON.parse(savedData));
          }
        }
      } catch (error) {
        console.error("Error loading company information:", error);
        toast.error("Impossibile caricare le informazioni dell'azienda/condominio");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCompanyInfo();
  }, [user]);

  // Save company information
  const saveCompanyInfo = async (info: CompanyInfo) => {
    try {
      const newId = info.id || uuidv4();
      const updatedInfo = { ...info, id: newId };
      
      if (user) {
        const dbData = {
          id: newId,
          name: info.name,
          type: info.type,
          address: info.address,
          vat_number: info.vatNumber,
          administrator: info.administrator ? JSON.stringify(info.administrator) : null,
          logo_url: info.logoUrl,
          user_id: user.id
        };
        
        const { error } = await supabase
          .from('company_info')
          .upsert(dbData, { onConflict: 'id' });
        
        if (error) throw error;
      }
      
      // Update local state
      setCompanyInfo(updatedInfo);
      
      // Save to localStorage as fallback
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInfo));
      
      toast.success("Informazioni aziendali salvate con successo");
      return true;
    } catch (error) {
      console.error("Error saving company information:", error);
      toast.error("Impossibile salvare le informazioni aziendali");
      return false;
    }
  };

  return {
    companyInfo,
    isLoading,
    saveCompanyInfo
  };
}
