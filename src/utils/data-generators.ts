
import { ConsumptionData, ConsumptionType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate initial consumption data with default values
 */
export function generateInitialConsumptionData(
  count: number,
  type: ConsumptionType,
  groupId: string,
  groupName: string
): ConsumptionData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    name: `${groupName} ${i + 1}`,
    kwh: 0,
    cost: 0,
    percentage: 0,
    groupId,
    squareMeters: 0,
    thousandthQuota: 0
  }));
}

/**
 * Generate general counters for AC
 */
export function generateGeneralCounters(
  count: number,
  groupId: string,
  groupName: string
): ConsumptionData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    name: `Contatore Generale ${groupName} ${count > 1 ? (i + 1) : ''}`,
    kwh: 0,
    cost: 0,
    percentage: 0,
    groupId,
    isGeneral: true
  }));
}
