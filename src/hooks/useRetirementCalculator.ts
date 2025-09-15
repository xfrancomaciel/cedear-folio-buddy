import { useState, useMemo } from 'react';
import { RetirementInputs, RetirementResults, ChartDataPoint } from '@/types/retirement';

export const useRetirementCalculator = () => {
  const [inputs, setInputs] = useState<RetirementInputs>({
    initialAmount: 10000,
    monthlyContribution: 500,
    years: 20,
    annualReturn: 10,
  });

  const results = useMemo((): RetirementResults => {
    const { initialAmount, monthlyContribution, years, annualReturn } = inputs;
    
    // Savings without interest (simple accumulation)
    const savingsWithoutInterest = initialAmount + (monthlyContribution * 12 * years);
    
    // Savings with investment (compound interest)
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = years * 12;
    
    // Future value of initial amount
    const futureValueInitial = initialAmount * Math.pow(1 + monthlyRate, totalMonths);
    
    // Future value of monthly contributions (annuity)
    const futureValueAnnuity = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    
    const savingsWithInvestment = futureValueInitial + futureValueAnnuity;
    const difference = savingsWithInvestment - savingsWithoutInterest;

    return {
      savingsWithoutInterest,
      savingsWithInvestment,
      difference,
    };
  }, [inputs]);

  const chartData = useMemo((): ChartDataPoint[] => {
    const { initialAmount, monthlyContribution, annualReturn } = inputs;
    const data: ChartDataPoint[] = [];
    const monthlyRate = annualReturn / 100 / 12;

    for (let year = 0; year <= inputs.years; year++) {
      const months = year * 12;
      
      // Simple savings calculation
      const savings = initialAmount + (monthlyContribution * months);
      
      // Investment calculation with compound interest
      let investment = initialAmount;
      if (year > 0) {
        // Future value of initial amount
        const futureValueInitial = initialAmount * Math.pow(1 + monthlyRate, months);
        
        // Future value of monthly contributions
        const futureValueAnnuity = monthlyContribution * 
          ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        
        investment = futureValueInitial + futureValueAnnuity;
      }

      data.push({
        year,
        savings,
        investment,
      });
    }

    return data;
  }, [inputs]);

  const updateInput = (field: keyof RetirementInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return {
    inputs,
    results,
    chartData,
    updateInput,
  };
};