import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CedearPriceData {
  symbol: string;
  px_bid: number;
  px_ask: number;
  q_bid: number;
  q_ask: number;
  v: number;
  c: number;
  pct_change: number;
}

interface ProcessedPrice {
  symbol: string;
  px_bid: number;
  px_ask: number;
  px_close: number;
  volume: number;
  pct_change: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting CEDEAR price update...');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // List of CEDEARs to track
    const TRACKED_CEDEARS = [
      'AAPL', 'NVDA', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NFLX',
      'DIS', 'BABA', 'GOLD', 'KO', 'PFE', 'XOM', 'JPM', 'V', 'JNJ',
      'WMT', 'PG', 'HD', 'UNH', 'MA', 'BAC', 'ABBV', 'LLY', 'AVGO',
      'COST', 'ORCL', 'NKE', 'MRK', 'TMO', 'ABT', 'DHR', 'VZ', 'ADBE',
      'CVX', 'ASML', 'TXN', 'ACN', 'QCOM', 'AMD', 'HON', 'CMCSA', 'NEE'
    ];

    // Fetch prices from data912.com
    console.log('Fetching CEDEAR prices from data912.com...');
    
    const response = await fetch('https://data912.com/live/arg_cedears', {
      method: 'GET',
      headers: {
        'User-Agent': 'CEDEAR-Folio-Buddy/1.0',
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawPrices: CedearPriceData[] = await response.json();
    console.log(`Fetched ${rawPrices.length} price entries`);

    // Filter and process prices
    const processedPrices: ProcessedPrice[] = rawPrices
      .filter(price => TRACKED_CEDEARS.includes(price.symbol))
      .filter(price => price.px_bid > 0 && price.px_ask > 0 && price.c > 0)
      .map(price => ({
        symbol: price.symbol.toUpperCase().trim(),
        px_bid: Number(price.px_bid.toFixed(4)),
        px_ask: Number(price.px_ask.toFixed(4)),
        px_close: Number(price.c.toFixed(4)),
        volume: Number(price.v.toFixed(2)),
        pct_change: Number(price.pct_change.toFixed(4))
      }))
      .reduce((acc, current) => {
        if (!acc.find(item => item.symbol === current.symbol)) {
          acc.push(current);
        }
        return acc;
      }, [] as ProcessedPrice[]);

    console.log(`Processed ${processedPrices.length} valid prices`);

    if (processedPrices.length === 0) {
      console.log('No valid prices to save');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No valid prices to save',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('cedear_prices')
      .insert(processedPrices)
      .select();

    if (error) {
      throw error;
    }

    console.log(`Successfully saved ${data?.length || 0} price records`);

    // Also update current_prices table for backward compatibility
    for (const price of processedPrices) {
      const { error: currentPriceError } = await supabase
        .from('current_prices')
        .upsert({
          ticker: price.symbol,
          precio_ars: price.px_close,
          usd_rate: 1000, // Default USD rate for now
        }, {
          onConflict: 'ticker'
        });

      if (currentPriceError) {
        console.error(`Error updating current_prices for ${price.symbol}:`, currentPriceError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed_count: processedPrices.length,
        saved_count: data?.length || 0,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in update-cedear-prices function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});