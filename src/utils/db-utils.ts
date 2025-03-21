
import { supabase } from '@/integrations/supabase/client';
import { ConsumptionGroup, ThresholdAlert, CalculationResult } from '@/types';
import { STORAGE_KEY_GROUPS, STORAGE_KEY_THRESHOLDS } from '@/constants/storage-keys';

// Save consumption groups to Supabase
export const saveGroupsToSupabase = async (
  groups: ConsumptionGroup[], 
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('consumption_groups')
      .upsert(
        groups.map(group => ({
          id: group.id,
          name: group.name,
          type: group.type,
          property_type: group.propertyType,
          property_number: group.propertyNumber,
          number_of_units: group.numberOfUnits,
          parent_group_id: group.parentGroupId,
          user_id: userId
        })),
        { onConflict: 'id' }
      );
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving groups to Supabase:', error);
    return false;
  }
};

// Save threshold alerts to Supabase
export const saveThresholdsToSupabase = async (
  thresholds: ThresholdAlert[],
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('thresholds')
      .upsert(
        thresholds.map(alert => ({
          consumption_id: alert.consumptionId,
          consumption_type: alert.type,
          threshold_value: alert.threshold,
          active: alert.active,
          user_id: userId
        })),
        { onConflict: 'consumption_id' }
      );
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving thresholds to Supabase:', error);
    return false;
  }
};

// Save calculation result to Supabase
export const saveCalculationResultToSupabase = async (
  result: CalculationResult,
  userId: string
): Promise<boolean> => {
  try {
    // Prepare data for Supabase (as JSON)
    const dbData = {
      date: result.date.toISOString(),
      office_total: result.officeTotal,
      ac_total: result.acTotal,
      office_data: JSON.stringify(result.officeData),
      ac_data: JSON.stringify(result.acData),
      office_bill: JSON.stringify(result.officeBill),
      ac_bill: JSON.stringify(result.acBill),
      month: result.month,
      groups: JSON.stringify(result.groups),
      user_id: userId
    };
    
    // Insert into database
    const { error } = await supabase
      .from('calculation_results')
      .insert(dbData);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving calculation to Supabase:', error);
    return false;
  }
};

// Load consumption groups from Supabase
export const loadGroupsFromSupabase = async (userId: string): Promise<ConsumptionGroup[]> => {
  try {
    const { data, error } = await supabase
      .from('consumption_groups')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(group => ({
      id: group.id,
      name: group.name,
      type: group.type as any,
      propertyType: group.property_type,
      propertyNumber: group.property_number,
      numberOfUnits: group.number_of_units,
      parentGroupId: group.parent_group_id
    }));
  } catch (error) {
    console.error('Error loading groups from Supabase:', error);
    return [];
  }
};

// Load calculation results from Supabase
export const loadResultsFromSupabase = async (userId: string): Promise<CalculationResult[]> => {
  try {
    const { data, error } = await supabase
      .from('calculation_results')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(result => ({
      id: result.id,
      date: new Date(result.date || new Date()),
      officeTotal: result.office_total,
      acTotal: result.ac_total,
      officeData: result.office_data as any,
      acData: result.ac_data as any,
      officeBill: result.office_bill as any,
      acBill: result.ac_bill as any,
      month: result.month || '',
      groups: result.groups as any || []
    }));
  } catch (error) {
    console.error('Error loading results from Supabase:', error);
    return [];
  }
};

// Load thresholds from Supabase
export const loadThresholdsFromSupabase = async (userId: string): Promise<ThresholdAlert[]> => {
  try {
    const { data, error } = await supabase
      .from('thresholds')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(threshold => ({
      type: threshold.consumption_type as any,
      consumptionId: threshold.consumption_id,
      threshold: threshold.threshold_value,
      active: threshold.active || true
    }));
  } catch (error) {
    console.error('Error loading thresholds from Supabase:', error);
    return [];
  }
};
