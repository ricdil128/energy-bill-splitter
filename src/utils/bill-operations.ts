
import { ConsumptionType, BillData, ThresholdAlert } from '@/types';

// Update bill amount
export const updateBillAmount = (
  type: ConsumptionType,
  currentBill: BillData,
  amount: number,
  groupId?: string,
  providerName?: string,
  billNumber?: string
): BillData => {
  return { 
    ...currentBill, 
    totalAmount: amount,
    groupId,
    providerName,
    billNumber
  };
};

// Format threshold data for storage
export const formatThresholdsForStorage = (
  thresholds: Record<string, number>
): ThresholdAlert[] => {
  return Object.entries(thresholds).map(([consumptionId, threshold]) => ({
    consumptionId,
    threshold,
    type: consumptionId.includes('ac') ? 'ac' as ConsumptionType : 'office' as ConsumptionType,
    active: true
  }));
};
