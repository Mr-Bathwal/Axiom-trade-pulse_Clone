import { Token } from '@/store/tokensSlice';

// Generate mock 24h price data for charts
export function generateChartData(token: Token): { time: string; value: number }[] {
  const now = Date.now();
  const dataPoints = 24; // 24 hours
  const data: { time: string; value: number }[] = [];
  
  const basePrice = token.price;
  const change = token.priceChange24h / 100; // Convert percentage to decimal
  const volatility = Math.abs(change) * 0.3; // Volatility factor
  
  for (let i = 0; i < dataPoints; i++) {
    const time = new Date(now - (dataPoints - i) * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Generate price with trend
    const progress = i / dataPoints;
    const trendEffect = basePrice * change * progress;
    const randomWalk = (Math.random() - 0.5) * basePrice * volatility;
    const value = basePrice - trendEffect + randomWalk;
    
    data.push({
      time,
      value: Math.max(value, basePrice * 0.8), // Prevent negative prices
    });
  }
  
  return data;
}

// Generate longer historical data for detail view
export function generateHistoricalData(token: Token, days: number = 30): { time: string; value: number }[] {
  const now = Date.now();
  const data: { time: string; value: number }[] = [];
  
  const basePrice = token.price;
  const change = token.priceChange24h / 100;
  const volatility = Math.abs(change) * 0.5;
  
  for (let i = 0; i < days; i++) {
    const time = new Date(now - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const progress = i / days;
    const trendEffect = basePrice * change * progress;
    const randomWalk = (Math.random() - 0.5) * basePrice * volatility;
    const value = basePrice - trendEffect + randomWalk;
    
    data.push({
      time,
      value: Math.max(value, basePrice * 0.5),
    });
  }
  
  return data;
}
