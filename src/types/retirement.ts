export interface RetirementInputs {
  initialAmount: number;
  monthlyContribution: number;
  years: number;
  annualReturn: number;
}

export interface RetirementResults {
  savingsWithoutInterest: number;
  savingsWithInvestment: number;
  difference: number;
}

export interface ChartDataPoint {
  year: number;
  savings: number;
  investment: number;
}