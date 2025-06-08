"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts';
import MutualFundsFilter from './MutualFundsFilter';

// Chart components
const ReturnsChart = ({ fund }: { fund: MutualFund }) => {
  const data = [
    { name: '1Y', value: fund.returns_1year || 0 },
    { name: '3Y', value: fund.returns_3year || 0 },
    { name: '5Y', value: fund.returns_5year || 0 },
  ];

  const barColors = data.map(item => item.value >= 0 ? '#4ade80' : '#f87171');

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `${value}%`} />
        <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Return']} />
        <Bar dataKey="value" fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={barColors[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Add a new chart component for benchmark comparison
const BenchmarkComparisonChart = ({ fund }: { fund: MutualFund }) => {
  // Assume benchmark returns are slightly lower than fund returns (in a real app, this would come from API)
  const benchmarkReturn1Y = fund.returns_1year * 0.9;
  const benchmarkReturn3Y = fund.returns_3year * 0.9;
  
  const data = [
    { name: '1 Month', fund: fund.returns_1month || 0, benchmark: fund.returns_1month * 0.9 || 0 },
    { name: '3 Months', fund: fund.returns_3month || 0, benchmark: fund.returns_3month * 0.9 || 0 },
    { name: '6 Months', fund: fund.returns_6month || 0, benchmark: fund.returns_6month * 0.9 || 0 },
    { name: '1 Year', fund: fund.returns_1year || 0, benchmark: benchmarkReturn1Y || 0 }
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `${value}%`} />
        <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`, '']} />
        <Legend />
        <Bar dataKey="fund" name={`${fund.s_name} (Fund)`} fill="#8884d8" />
        <Bar dataKey="benchmark" name="Index Benchmark" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const PortfolioCompositionChart = ({ fund }: { fund: MutualFund }) => {
  const data = [
    { name: 'Large Cap', value: fund.lcap || 0 },
    { name: 'Mid Cap', value: fund.mcap || 0 },
    { name: 'Small Cap', value: fund.scap || 0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Allocation']} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const HistoricalPerformanceChart = ({ fund }: { fund: MutualFund }) => {
  // This is a simulated historical performance based on available returns
  // In a real app, you would fetch actual historical NAV data
  const generateSimulatedData = () => {
    const oneYearReturn = fund.returns_1year || 0;
    const threeYearReturn = fund.returns_3year || 0;
    const fiveYearReturn = fund.returns_5year || 0;
    
    // Create monthly data points
    const data = [];
    const currentNAV = fund.navrs;
    
    // Last 12 months (1Y)
    for (let i = 12; i > 0; i--) {
      const monthlyReturn = oneYearReturn / 12;
      const monthsAgo = i;
      const estimatedNAV = currentNAV / (1 + (oneYearReturn / 100) * (12 - monthsAgo) / 12);
      
      data.push({
        month: `${monthsAgo}m ago`,
        nav: parseFloat(estimatedNAV.toFixed(2)),
      });
    }
    
    // Current month
    data.push({
      month: 'Current',
      nav: currentNAV,
    });
    
    return data;
  };

  const data = generateSimulatedData();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip formatter={(value) => [`₹${value}`, 'NAV']} />
        <Line type="monotone" dataKey="nav" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Add a new component for risk-return analysis
const RiskReturnScatterChart = ({ fund }: { fund: MutualFund }) => {
  // Generate some comparative data for illustration
  // In a real app, this would come from API with data for multiple funds
  const data = [
    { name: 'This Fund', risk: fund.betax_returns || 1, return: fund.returns_3year || 0 },
    { name: 'Peer 1', risk: fund.betax_returns * 0.8, return: fund.returns_3year * 0.7 },
    { name: 'Peer 2', risk: fund.betax_returns * 1.1, return: fund.returns_3year * 0.9 },
    { name: 'Peer 3', risk: fund.betax_returns * 0.9, return: fund.returns_3year * 1.1 },
    { name: 'Peer 4', risk: fund.betax_returns * 1.2, return: fund.returns_3year * 1.2 },
    { name: 'Benchmark', risk: 1, return: fund.returns_3year * 0.8 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="risk" name="Risk (Beta)" unit="" />
        <YAxis type="number" dataKey="return" name="Return (3Y)" unit="%" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} 
          formatter={(value: any) => {
            return value.toString().includes('.') ? `${Number(value).toFixed(2)}` : value;
          }}
          labelFormatter={(label) => 'Risk-Return Analysis'}
        />
        <Legend />
        <Scatter name="Funds" data={data} fill="#8884d8">
          {data.map((entry, index) => {
            const color = entry.name === 'This Fund' ? '#ff7300' : 
                        entry.name === 'Benchmark' ? '#00C49F' : '#8884d8';
            const size = entry.name === 'This Fund' ? 100 : 60;
            
            return (
              <Cell key={`cell-${index}`} fill={color} />
            );
          })}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

interface MutualFund {
  s_name: string;
  s_name1: string;
  classification: string;
  fund_house: string;
  navrs: number;
  returns_1year: number;
  returns_3year: number;
  returns_5year: number;
  minimum_investment: number;
  expenceratio: number;
  aumtotal: number;
  rupeevest_rating: string;
  highest_sector: string;
  fund_manager: string;
  exitload_remarks: string;
  no_of_stocks: number;
  lcap: number;
  mcap: number;
  scap: number;
  inception_date: string;
  turnover_ratio: number;
  returns_1month: number;
  returns_3month: number;
  returns_6month: number;
  betax_returns: number;
  alphax_returns: number;
  sharpex_returns: number;
}

// Define filter interfaces
interface Filters {
  category: string[];
  fundHouse: string[];
  rating: string[];
  riskLevel: string[];
  minReturn1Y: number | null;
  maxExpenseRatio: number | null;
  minInvestment: number | null;
}

export default function MutualFundsPage() {
  // State declarations
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [filteredFunds, setFilteredFunds] = useState<MutualFund[]>([]);
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [quantity, setQuantity] = useState<number>(1000);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'composition' | 'details'>('overview');
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Memoize the helper function to avoid recreating it on every render
  const areFundArraysDifferent = useCallback((prev: MutualFund[], next: MutualFund[]): boolean => {
    if (prev.length !== next.length) return true;
    // Just compare IDs or names to reduce comparison overhead
    return prev.some((fund, index) => fund.s_name !== next[index].s_name);
  }, []);
  
  // Memoize the filter change handler to avoid creating a new function on each render
  const handleFilterChange = useCallback((funds: MutualFund[]) => {
    // Skip during server-side rendering
    if (!hasMounted || isInitialRender) return;
    
    // Use functional updates with deep comparison
    setFilteredFunds(prevFunds => {
      if (!areFundArraysDifferent(prevFunds, funds)) {
        return prevFunds; // Return the previous reference if no change
      }
      return funds; // Return the new array if there's a change
    });
  }, [isInitialRender, areFundArraysDifferent, hasMounted]);

  // Handle client-side mounting
  useEffect(() => {
    setHasMounted(true);
    setIsInitialRender(false);
  }, []);
  
  // Fetch mutual funds data
  useEffect(() => {
    const fetchMutualFunds = async () => {
      try {
        const response = await axios.get('http://localhost:8000/mutual-funds');
        if (response.data && response.data.schemedata) {
          setMutualFunds(response.data.schemedata);
          setFilteredFunds(response.data.schemedata);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mutual funds:', error);
        setLoading(false);
      }
    };

    fetchMutualFunds();
  }, []);

  const handleFundClick = (fund: MutualFund) => {
    setSelectedFund(fund);
    setIsBuying(false);
  };

  const handleBuy = () => {
    setIsBuying(true);
  };

  const handleConfirmBuy = () => {
    alert(`Order placed for ₹${quantity} of ${selectedFund?.s_name}`);
    setIsBuying(false);
    setSelectedFund(null);
  };

  const getRiskLevel = (fund: MutualFund) => {
    if (!fund) return 'Medium';
    
    // Determine risk level based on equity composition
    if (fund.lcap > 70) {
      return 'Low';
    } else if (fund.scap > 30) {
      return 'High';
    } else {
      return 'Medium';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  // Return a loading state or null during server-side rendering
  if (!hasMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Mutual Funds | Investment Platform</title>
        <meta name="description" content="Browse and invest in top mutual funds" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mutual Funds</h1>
        <p className="text-gray-600 mb-4">Invest in professionally managed portfolios of securities</p>
        
        {/* Search and Filter Component */}
        <MutualFundsFilter 
          allFunds={mutualFunds} 
          onFilterChange={handleFilterChange} 
          getRiskLevel={getRiskLevel} 
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {filteredFunds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredFunds.map((fund, index) => {
                  const riskLevel = getRiskLevel(fund);
                  return (
                    <div
                      key={index}
                      onClick={() => handleFundClick(fund)}
                      className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${selectedFund === fund ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <h2 className="text-xl font-semibold text-gray-800 line-clamp-2">{fund.s_name}</h2>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                            riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {riskLevel} Risk
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">{fund.classification}</p>
                        <p className="text-gray-500 text-xs mt-1">{fund.fund_house}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              ₹{typeof fund.navrs === 'number' ? fund.navrs.toFixed(2) : '0.00'}
                            </div>
                            <div className="text-xs text-gray-500">NAV</div>
                          </div>
                          <div>
                            <div className={`font-medium text-right ${fund.returns_1year > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(fund.returns_1year)}
                            </div>
                            <div className="text-xs text-gray-500">1Y Return</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-6">
                <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No mutual funds found</h3>
                <p className="text-gray-500 text-center">
                  Try adjusting your search or filter criteria to find mutual funds.
                </p>
              </div>
            )}
          </>
        )}

        {/* Selected Fund Modal */}
        {selectedFund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {!isBuying ? (
                <>
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedFund.s_name}</h2>
                        <p className="text-gray-600">{selectedFund.classification}</p>
                        <p className="text-gray-500 text-sm">{selectedFund.fund_house}</p>
                      </div>
                      <button
                        onClick={() => setSelectedFund(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Key Metrics Summary */}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className={`text-xl font-bold ${selectedFund.returns_1year > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(selectedFund.returns_1year)}
                        </div>
                        <div className="text-sm text-gray-500">1Y Return</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-gray-800">₹{selectedFund.navrs.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Current NAV</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-gray-800">{selectedFund.rupeevest_rating}</div>
                        <div className="text-sm text-gray-500">Rating</div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-6 border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          onClick={() => setActiveTab('overview')}
                          className={`${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                          Overview
                        </button>
                        <button
                          onClick={() => setActiveTab('performance')}
                          className={`${activeTab === 'performance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                          Performance
                        </button>
                        <button
                          onClick={() => setActiveTab('composition')}
                          className={`${activeTab === 'composition' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                          Portfolio Composition
                        </button>
                        <button
                          onClick={() => setActiveTab('details')}
                          className={`${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                          Fund Details
                        </button>
                      </nav>
                    </div>

                    {/* Tab content */}
                    <div className="mt-6">
                      {activeTab === 'overview' && (
                        <div>
                          <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Fund Summary</h3>
                            <p className="text-gray-600">
                              {selectedFund.s_name} is a {selectedFund.classification.toLowerCase()} fund managed by {selectedFund.fund_manager} at {selectedFund.fund_house}. 
                              The fund primarily invests in the {selectedFund.highest_sector} sector with a portfolio of {selectedFund.no_of_stocks} stocks.
                            </p>
                          </div>

                          <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Fund vs Benchmark Performance</h3>
                            <BenchmarkComparisonChart fund={selectedFund} />
                          </div>

                          <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Risk vs Return (Compared to Peers)</h3>
                            <RiskReturnScatterChart fund={selectedFund} />
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-medium text-gray-700 mb-2">Key Information</h3>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">NAV</span>
                                    <span className="font-medium">₹{selectedFund.navrs.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Min. Investment</span>
                                    <span className="font-medium">₹{selectedFund.minimum_investment}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Expense Ratio</span>
                                    <span className="font-medium">{selectedFund.expenceratio}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Fund Manager</span>
                                    <span className="font-medium">{selectedFund.fund_manager}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-700 mb-2">Portfolio Allocation</h3>
                              <div className="bg-gray-50 p-4 rounded-lg h-full flex items-center justify-center">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-[#0088FE] mr-2"></div>
                                  <span className="text-sm mr-3">Large Cap: {selectedFund.lcap}%</span>
                                  <div className="w-3 h-3 rounded-full bg-[#00C49F] mr-2"></div>
                                  <span className="text-sm mr-3">Mid Cap: {selectedFund.mcap}%</span>
                                  <div className="w-3 h-3 rounded-full bg-[#FFBB28] mr-2"></div>
                                  <span className="text-sm">Small Cap: {selectedFund.scap}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'performance' && (
                        <div>
                          <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Returns Comparison</h3>
                            <ReturnsChart fund={selectedFund} />
                          </div>

                          <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Historical NAV Trend</h3>
                            <HistoricalPerformanceChart fund={selectedFund} />
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Returns</h3>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-sm text-gray-500 mb-1">1 Month</h4>
                                <p className={`font-medium ${selectedFund.returns_1month > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercentage(selectedFund.returns_1month)}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm text-gray-500 mb-1">3 Months</h4>
                                <p className={`font-medium ${selectedFund.returns_3month > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercentage(selectedFund.returns_3month)}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm text-gray-500 mb-1">6 Months</h4>
                                <p className={`font-medium ${selectedFund.returns_6month > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercentage(selectedFund.returns_6month)}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm text-gray-500 mb-1">1 Year</h4>
                                <p className={`font-medium ${selectedFund.returns_1year > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercentage(selectedFund.returns_1year)}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm text-gray-500 mb-1">3 Years</h4>
                                <p className={`font-medium ${selectedFund.returns_3year > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercentage(selectedFund.returns_3year)}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm text-gray-500 mb-1">5 Years</h4>
                                <p className={`font-medium ${selectedFund.returns_5year > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercentage(selectedFund.returns_5year)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'composition' && (
                        <div>
                          <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Portfolio Breakdown</h3>
                            <PortfolioCompositionChart fund={selectedFund} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-medium text-gray-700 mb-2">Asset Allocation</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Large Cap</span>
                                  <span className="font-medium">{selectedFund.lcap}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Mid Cap</span>
                                  <span className="font-medium">{selectedFund.mcap}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Small Cap</span>
                                  <span className="font-medium">{selectedFund.scap}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-medium text-gray-700 mb-2">Portfolio Metrics</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Number of Stocks</span>
                                  <span className="font-medium">{selectedFund.no_of_stocks}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Top Sector</span>
                                  <span className="font-medium">{selectedFund.highest_sector}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Turnover Ratio</span>
                                  <span className="font-medium">{selectedFund.turnover_ratio}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'details' && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-medium text-gray-700 mb-2">Fund Details</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">NAV</span>
                                  <span className="font-medium">₹{selectedFund.navrs.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">AUM</span>
                                  <span className="font-medium">{formatCurrency(selectedFund.aumtotal)} Cr</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Expense Ratio</span>
                                  <span className="font-medium">{selectedFund.expenceratio}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Min. Investment</span>
                                  <span className="font-medium">₹{selectedFund.minimum_investment}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Exit Load</span>
                                  <span className="font-medium">{selectedFund.exitload_remarks}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium text-gray-700 mb-2">Additional Information</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Fund Manager</span>
                                  <span className="font-medium">{selectedFund.fund_manager}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Inception Date</span>
                                  <span className="font-medium">{new Date(selectedFund.inception_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Rupeevest Rating</span>
                                  <span className="font-medium">{selectedFund.rupeevest_rating}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Beta</span>
                                  <span className="font-medium">{selectedFund.betax_returns}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Alpha</span>
                                  <span className="font-medium">{selectedFund.alphax_returns}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Sharpe Ratio</span>
                                  <span className="font-medium">{selectedFund.sharpex_returns}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleBuy}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                      >
                        Invest Now
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Invest in {selectedFund.s_name}</h3>
                    <button
                      onClick={() => setIsBuying(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Investment Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min={selectedFund.minimum_investment}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Minimum investment: ₹{selectedFund.minimum_investment}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">You'll get approximately</span>
                      <span className="font-bold text-blue-700">
                        {(quantity / selectedFund.navrs).toFixed(3)} units
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsBuying(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmBuy}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Confirm Investment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}