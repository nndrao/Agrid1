import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DataTable } from "@/components/DataTable/data-table";
import { Toaster } from "@/components/ui/toaster";
import { useMemo } from "react";

// Generate realistic fixed income position data
function generateFixedIncomeData(rowCount: number) {
  const issuers = ['US Treasury', 'German Bund', 'UK Gilt', 'JGB', 'French OAT', 'Italian BTP', 'Spanish Bono'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
  const ratings = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-'];
  const sectors = ['Government', 'Agency', 'Supranational', 'Corporate', 'Municipal'];
  
  const data = [];
  
  for (let i = 0; i < rowCount; i++) {
    const maturityDate = new Date(Date.now() + Math.random() * 10 * 365 * 24 * 60 * 60 * 1000);
    const coupon = (Math.random() * 5 + 0.5).toFixed(3);
    const yieldToMaturity = (parseFloat(coupon) + (Math.random() * 2 - 1)).toFixed(3);
    const price = (100 + (Math.random() * 10 - 5)).toFixed(2);
    const position = Math.floor(Math.random() * 10000000);
    
    const row = {
      // Position Details
      positionId: `POS${(1000000 + i).toString()}`,
      cusip: Math.random().toString(36).substring(2, 11).toUpperCase(),
      isin: `US${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      issuer: issuers[Math.floor(Math.random() * issuers.length)],
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      rating: ratings[Math.floor(Math.random() * ratings.length)],
      maturityDate: maturityDate.toISOString().split('T')[0],
      coupon: parseFloat(coupon),
      position: position,
      marketValue: position * (parseFloat(price) / 100),
      
      // Pricing
      price: parseFloat(price),
      yieldToMaturity: parseFloat(yieldToMaturity),
      modifiedDuration: (Math.random() * 10 + 1).toFixed(2),
      convexity: (Math.random() * 1).toFixed(4),
      spreadDuration: (Math.random() * 8 + 1).toFixed(2),
      zSpread: Math.floor(Math.random() * 200),
      oaSpread: Math.floor(Math.random() * 180),
      assetSwapSpread: Math.floor(Math.random() * 150),
      
      // Risk Metrics
      dv01: (Math.random() * 1000).toFixed(2),
      cr01: (Math.random() * 500).toFixed(2),
      var95: (Math.random() * 1000000).toFixed(2),
      cvar95: (Math.random() * 1200000).toFixed(2),
      expectedShortfall: (Math.random() * 1500000).toFixed(2),
      betaToIndex: (Math.random() * 0.4 + 0.8).toFixed(3),
      
      // Performance
      mtd_pnl: (Math.random() * 200000 - 100000).toFixed(2),
      ytd_pnl: (Math.random() * 1000000 - 500000).toFixed(2),
      mtd_return: (Math.random() * 4 - 2).toFixed(2),
      ytd_return: (Math.random() * 10 - 5).toFixed(2),
      
      // Trading
      tradedPrice: (parseFloat(price) + (Math.random() * 2 - 1)).toFixed(2),
      tradedSpread: Math.floor(Math.random() * 100),
      tradeDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      settlementDate: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      // Liquidity
      bidSize: Math.floor(Math.random() * 10000000),
      askSize: Math.floor(Math.random() * 10000000),
      bidSpread: Math.floor(Math.random() * 50),
      askSpread: Math.floor(Math.random() * 50),
      averageDailyVolume: Math.floor(Math.random() * 50000000),
      
      // Credit Risk
      probabilityOfDefault: (Math.random() * 0.05).toFixed(4),
      lossGivenDefault: (Math.random() * 0.6 + 0.2).toFixed(2),
      expectedLoss: (Math.random() * 0.03).toFixed(4),
      
      // Portfolio Analytics
      contributionToReturn: (Math.random() * 0.2 - 0.1).toFixed(4),
      contributionToDuration: (Math.random() * 0.5).toFixed(4),
      contributionToSpread: (Math.random() * 0.3).toFixed(4),
      contributionToVar: (Math.random() * 0.4).toFixed(4),
      
      // ESG Metrics
      esgScore: Math.floor(Math.random() * 100),
      environmentalScore: Math.floor(Math.random() * 100),
      socialScore: Math.floor(Math.random() * 100),
      governanceScore: Math.floor(Math.random() * 100),
      carbonIntensity: Math.floor(Math.random() * 1000),
      
      // Regulatory
      rwa: Math.floor(Math.random() * 1000000),
      capitalCharge: (Math.random() * 100000).toFixed(2),
      leverageExposure: Math.floor(Math.random() * 2000000),
      
      // Stress Testing
      stress_parallel_up: (Math.random() * -1000000).toFixed(2),
      stress_parallel_down: (Math.random() * 1000000).toFixed(2),
      stress_steepener: (Math.random() * 500000 - 250000).toFixed(2),
      stress_flattener: (Math.random() * 500000 - 250000).toFixed(2),
      stress_credit_widening: (Math.random() * -800000).toFixed(2),
      
      // Settlement
      custodian: ['JPM', 'State Street', 'BNY Mellon', 'Northern Trust'][Math.floor(Math.random() * 4)],
      accountNumber: `ACC${Math.random().toString().substring(2, 10)}`,
      settlementStatus: ['Settled', 'Pending', 'Failed'][Math.floor(Math.random() * 3)],
    };
    
    data.push(row);
  }
  
  return data;
}

function App() {
  const data = useMemo(() => generateFixedIncomeData(1000), []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <div className="flex h-screen flex-col overflow-hidden">
          <Header />
          <main className="flex-1 container mx-auto p-5">
            <DataTable data={data} />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;