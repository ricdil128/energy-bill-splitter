
  // Helper method to get general counters for a specific group
  const getGroupGeneralCounters = (type: ConsumptionType, groupId: string): ConsumptionData[] => {
    const data = type === 'office' ? officeData : acData;
    return data.filter(item => item.groupId === groupId && item.isGeneral);
  };
