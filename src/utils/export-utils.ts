
import { ConsumptionData, CalculationResult, ConsumptionGroup, GroupedConsumptionData } from '@/types';

/**
 * Group consumption data by groupId
 */
export function groupConsumptionData(
  data: ConsumptionData[],
  groups: ConsumptionGroup[]
): GroupedConsumptionData {
  const result: GroupedConsumptionData = {};
  
  data.forEach(item => {
    const groupId = item.groupId || 'default';
    const group = groups.find(g => g.id === groupId);
    
    if (!result[groupId]) {
      result[groupId] = {
        name: group?.name || 'Altro',
        propertyType: group?.propertyType,
        propertyNumber: group?.propertyNumber,
        items: [],
        generalCounters: []
      };
    }
    
    if (item.isGeneral) {
      result[groupId].generalCounters!.push(item);
    } else {
      result[groupId].items.push(item);
    }
  });
  
  return result;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(result: CalculationResult): string {
  const rows: string[] = [];
  
  // Add headers
  rows.push('Group,Type,Name,kWh,Cost (€),Percentage (%),IsGeneral');
  
  // Group data
  const groupedOffice = groupConsumptionData(result.officeData, result.groups || []);
  const groupedAC = groupConsumptionData(result.acData, result.groups || []);
  
  // Add office data
  Object.entries(groupedOffice).forEach(([groupId, group]) => {
    group.items.forEach(entry => {
      rows.push(`${group.name},Office,${entry.name},${entry.kwh},${entry.cost},${entry.percentage},No`);
    });
    
    if (group.generalCounters && group.generalCounters.length > 0) {
      group.generalCounters.forEach(entry => {
        rows.push(`${group.name},Office,${entry.name},${entry.kwh},${entry.cost},${entry.percentage},Yes`);
      });
    }
  });
  
  // Add AC data
  Object.entries(groupedAC).forEach(([groupId, group]) => {
    group.items.forEach(entry => {
      rows.push(`${group.name},AC,${entry.name},${entry.kwh},${entry.cost},${entry.percentage},No`);
    });
    
    if (group.generalCounters && group.generalCounters.length > 0) {
      group.generalCounters.forEach(entry => {
        rows.push(`${group.name},AC,${entry.name},${entry.kwh},${entry.cost},${entry.percentage},Yes`);
      });
    }
  });
  
  // Add totals
  rows.push(`Total,Offices,All,${result.officeTotal},${result.officeBill.totalAmount},100,No`);
  rows.push(`Total,Air Conditioning,All,${result.acTotal},${result.acBill.totalAmount},100,No`);
  
  return rows.join('\n');
}

/**
 * Download data as a CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
