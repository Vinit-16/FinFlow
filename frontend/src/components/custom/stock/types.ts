export interface NSEStock {
  symbol: string;
  companyName?: string;
  lastPrice?: number;
  change?: number;
  pChange?: number;
  totalTradedVolume?: number;
  dayHigh?: number;
  dayLow?: number;
  open?: number;
  previousClose?: number;
  yearHigh?: number;
  yearLow?: number;
  perChange365d?: number;
  perChange30d?: number;
  industry?: string;
}

export interface StockDetails {
  info?: {
    symbol: string;
    companyName?: string;
    industry?: string;
    activeSeries?: string[];
    isFNOSec?: boolean;
    isCASec?: boolean;
    isSLBSec?: boolean;
    isDebtSec?: boolean;
    isSuspended?: boolean;
    tempSuspendedSeries?: string[];
    isETFSec?: boolean;
    isDelisted?: boolean;
    isin?: string;
    slb_isin?: string;
    listingDate?: string;
    isMunicipalBond?: boolean;
    isHybridSymbol?: boolean;
    identifier?: string;
  };
  metadata?: {
    series?: string;
    symbol?: string;
    isin?: string;
    status?: string;
    listingDate?: string;
    industry?: string;
    lastUpdateTime?: string;
    pdSectorPe?: number;
    pdSymbolPe?: number;
    pdSectorInd?: string;
    pdSectorIndAll?: string[];
  };
  securityInfo?: {
    boardStatus: string;
    tradingStatus: string;
    tradingSegment: string;
    sessionNo: string;
    slb: string;
    classOfShare: string;
    derivatives: string;
    surveillance: string | {
      surv: string;
      desc: string;
    };
    faceValue: number;
    issuedSize: number;
  };
  industryInfo?: {
    macro?: string;
    sector?: string;
    industry?: string;
    basicIndustry?: string;
  };
  preOpenMarket?: {
    preopen?: Array<{
      price: number;
      buyQty: number;
      sellQty: number;
      iep?: boolean;
    }>;
    ato?: {
      buy: number;
      sell: number;
    };
    IEP?: number;
    totalTradedVolume?: number;
    finalPrice?: number;
    finalQuantity?: number;
    lastUpdateTime?: string;
    totalBuyQuantity?: number;
    totalSellQuantity?: number;
    atoBuyQty?: number;
    atoSellQty?: number;
    Change?: number;
    perChange?: number;
    prevClose?: number;
  };
  priceInfo?: {
    lastPrice: number;
    change: number;
    pChange: number;
    previousClose: number;
    open: number;
    close: number;
    vwap: number;
    stockIndClosePrice?: number;
    lowerCP: number | string;
    upperCP: number | string;
    pPriceBand: string;
    basePrice: number;
    totalTradedVolume?: number;
    totalBuyQuantity?: number;
    totalSellQuantity?: number;
    deliveryQuantity?: number;
    deliveryToTradedQuantity?: number;
    intraDayHighLow?: {
      min: number;
      max: number;
      value: number;
    };
    weekHighLow?: {
      min: number;
      max: number;
      minDate?: string;
      maxDate?: string;
      value: number;
    };
    iNavValue?: number | null;
    checkINAV?: boolean;
    tickSize?: number;
    ieq?: string;
  };
  sddDetails?: {
    SDDAuditor?: string;
    SDDStatus?: string;
  };
  currentMarketType?: string;
}

export interface HistoricalData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BuyFormData {
  shares: number;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    title: {
      display: boolean;
      text: string;
      color: string;
      font: {
        size: number;
        weight: 'normal' | 'bold' | 'lighter' | 'bolder';
      }
    };
    tooltip: {
      mode: 'index' | 'nearest' | 'point' | 'dataset' | 'x' | 'y';
      intersect: boolean;
    }
  };
  scales: {
    y: {
      beginAtZero: boolean;
      grid: {
        color: string;
      };
      ticks: {
        color: string;
      }
    };
    x: {
      grid: {
        display: boolean;
      };
      ticks: {
        color: string;
      }
    }
  };
  interaction: {
    mode: 'index' | 'nearest' | 'point' | 'dataset' | 'x' | 'y';
    axis: 'x' | 'y' | 'xy';
    intersect: boolean;
  }
}

export interface StockListProps {
  allStocks: NSEStock[];
  filteredStocks: NSEStock[];
  searchQuery: string;
  allStocksSymbols: string[];
  clearSearch: () => void;
  openStockDetails: (stock: NSEStock) => void;
  loadMoreStocks?: () => void;
}

export interface StockDetailsProps {
  selectedStock: NSEStock;
  selectedStockDetails: StockDetails;
  historicalData: HistoricalData[];
  buyFormData: BuyFormData;
  loading: boolean;
  reportLoading: boolean;
  analysisResult: any;
  reportUrl: string | null;
  error: string | null;
  chartOptions: ChartOptions;
  closeStockDetails: () => void;
  handleBuySubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAnalysis: (ticker: string) => Promise<void>;
  handleReport: () => Promise<void>;
  getChartData: () => any;
} 