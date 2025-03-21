
import { ConsumptionData, ConsumptionType, ConsumptionGroup } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Group consumption data by group ID
export function groupConsumptionData(data: ConsumptionData[], groups: ConsumptionGroup[]) {
  const groupedData: Record<string, {
    name: string;
    propertyType?: string;
    propertyNumber?: string;
    numberOfUnits?: number;
    items: ConsumptionData[];
    generalCounters?: ConsumptionData[];
    parentGroupId?: string;
  }> = {};
  
  // Initialize with all groups
  groups.forEach(group => {
    groupedData[group.id] = {
      name: group.name,
      propertyType: group.propertyType,
      propertyNumber: group.propertyNumber,
      numberOfUnits: group.numberOfUnits,
      parentGroupId: group.parentGroupId,
      items: [],
      generalCounters: []
    };
  });
  
  // Group the data
  data.forEach(item => {
    const groupId = item.groupId || '';
    
    if (groupedData[groupId]) {
      if (item.isGeneral) {
        groupedData[groupId].generalCounters?.push(item);
      } else {
        groupedData[groupId].items.push(item);
      }
    }
  });
  
  return groupedData;
}

// Get items for a specific group
export const getGroupItems = (data: ConsumptionData[], groupId: string): ConsumptionData[] => {
  return data.filter(item => item.groupId === groupId && !item.isGeneral);
};

// Get general counters for a specific group
export const getGroupGeneralCounters = (data: ConsumptionData[], groupId: string): ConsumptionData[] => {
  return data.filter(item => item.groupId === groupId && item.isGeneral);
};

// Update an existing group
export const updateGroup = (
  groups: ConsumptionGroup[], 
  groupId: string, 
  data: Partial<ConsumptionGroup>
): ConsumptionGroup[] => {
  return groups.map(group => 
    group.id === groupId ? { ...group, ...data } : group
  );
};

// Add a new group
export const addGroup = (
  groups: ConsumptionGroup[],
  name: string, 
  type: ConsumptionType, 
  propertyType?: string, 
  propertyNumber?: string,
  numberOfUnits?: number,
  parentGroupId?: string
): { id: string; updatedGroups: ConsumptionGroup[] } => {
  const id = uuidv4();
  const newGroup: ConsumptionGroup = { 
    id, 
    name, 
    type,
    propertyType,
    propertyNumber,
    numberOfUnits,
    parentGroupId
  };
  
  const updatedGroups = [...groups, newGroup];
  
  return { id, updatedGroups };
};

// Delete a group
export const deleteGroup = (
  groups: ConsumptionGroup[], 
  officeData: ConsumptionData[], 
  acData: ConsumptionData[], 
  groupId: string
): { 
  success: boolean; 
  updatedGroups?: ConsumptionGroup[]; 
  updatedOfficeData?: ConsumptionData[]; 
  updatedAcData?: ConsumptionData[]; 
} => {
  // Check if group exists
  if (!groups.find(g => g.id === groupId)) {
    return { success: false };
  }
  
  // Filter out groups
  const updatedGroups = groups.filter(g => g.id !== groupId);
  
  // Filter out office data for this group
  const updatedOfficeData = officeData.filter(item => item.groupId !== groupId);
  
  // Filter out AC data for this group
  const updatedAcData = acData.filter(item => item.groupId !== groupId);
  
  return { 
    success: true, 
    updatedGroups, 
    updatedOfficeData, 
    updatedAcData 
  };
};
