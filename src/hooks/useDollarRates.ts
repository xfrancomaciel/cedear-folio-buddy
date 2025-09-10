import { useQuery } from '@tanstack/react-query';

interface DollarRates {
  blue: number;
  official: number;
}

interface DollarApiResponse {
  blue: {
    ask: number;
  };
  ahorro: {
    ask: number;
  };
}

const fetchDollarRates = async (): Promise<DollarRates> => {
  const response = await fetch('https://criptoya.com/api/dolar');
  
  if (!response.ok) {
    throw new Error('Failed to fetch dollar rates');
  }
  
  const data: DollarApiResponse = await response.json();
  
  return {
    blue: data.blue.ask,
    official: data.ahorro.ask,
  };
};

export const useDollarRates = () => {
  return useQuery({
    queryKey: ['dollarRates'],
    queryFn: fetchDollarRates,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
};