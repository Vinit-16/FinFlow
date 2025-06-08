"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import modularized components
import StockList from './StockList';
import StockDetails from './StockDetails';
import { NSEStock, StockDetails as StockDetailsType, HistoricalData, BuyFormData, ChartOptions } from './types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockPage: React.FC = () => {
  const [allStocks, setAllStocks] = useState<NSEStock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<NSEStock[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<NSEStock | null>(null);
  const [selectedStockDetails, setSelectedStockDetails] = useState<StockDetailsType | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [buyFormData, setBuyFormData] = useState<BuyFormData>({ shares: 1 });
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Cache to store already fetched stock details to avoid redundant API calls
  const [stockDetailsCache, setStockDetailsCache] = useState<Record<string, any>>({});
  const [historicalDataCache, setHistoricalDataCache] = useState<Record<string, HistoricalData[]>>({});
  const [allStocksSymbols, setAllStocksSymbols] = useState<string[]>([]);

  useEffect(() => {
    fetchAllStocks();
  }, []);

  useEffect(() => {
    // Filter stocks based on search query
    if (searchQuery.trim() === '') {
      // When no search query, just show the initially loaded stocks
      setFilteredStocks(allStocks);
    } else {
      const query = searchQuery.toLowerCase();
      
      // Filter from already loaded stocks
      const filteredStocksArray = allStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query) || 
        (stock.companyName && stock.companyName.toLowerCase().includes(query)) ||
        (stock.industry && stock.industry.toLowerCase().includes(query))
      );
      
      // Check if we need to search the full stock symbol list for matches not yet loaded
      const hasMatchingStocksNotLoaded = allStocksSymbols.some(symbol => 
        symbol.toLowerCase().includes(query) && 
        !allStocks.some(stock => stock.symbol === symbol)
      );
      
      if (hasMatchingStocksNotLoaded) {
        // We'll handle this in the search submit function rather than dynamically loading here
        // This prevents too many API calls while typing
      }
      
      setFilteredStocks(filteredStocksArray);
    }
  }, [searchQuery, allStocks, allStocksSymbols]);

  const fetchAllStocks = async () => {
    setPageLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/test/nse-all-symbols');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Create a Set to ensure unique symbols and maintain the original order
        const uniqueSymbolsSet = new Set<string>();
        
        // Add each symbol to the set, which automatically removes duplicates
        data.data.forEach((symbol: any) => {
          if (typeof symbol === 'string') {
            uniqueSymbolsSet.add(symbol);
          }
        });
        
        // Convert the set back to an array and sort alphabetically
        const allStockSymbols = Array.from(uniqueSymbolsSet).sort();
        
        // Save all stock symbols for search functionality
        setAllStocksSymbols(allStockSymbols);
        
        // Only fetch details for the first 30 to show initially
        const initialStockSymbols = allStockSymbols.slice(0, 30);
        
        // Fetch basic details for these 30 stocks
        const stocksWithDetailsPromises = initialStockSymbols.map(async (stock: string) => {
          try {
            // Check if we already have cached details for this stock
            if (stockDetailsCache[stock]) {
              const cachedDetails = stockDetailsCache[stock];
              return {
                symbol: stock,
                companyName: cachedDetails.info?.companyName || stock,
                lastPrice: cachedDetails.priceInfo?.lastPrice || 0,
                change: cachedDetails.priceInfo?.change || 0,
                pChange: cachedDetails.priceInfo?.pChange || 0,
                totalTradedVolume: cachedDetails.priceInfo?.totalTradedVolume || 0,
                dayHigh: cachedDetails.priceInfo?.intraDayHighLow?.max || 0,
                dayLow: cachedDetails.priceInfo?.intraDayHighLow?.min || 0,
                open: cachedDetails.priceInfo?.open || 0,
                previousClose: cachedDetails.priceInfo?.previousClose || 0,
                industry: cachedDetails.info?.industry || 'N/A'
              };
            }
            
            // If not cached, fetch from API
            const detailsResponse = await fetch(`http://localhost:8000/api/test/nse-details/${stock}`);
            const detailsData = await detailsResponse.json();
            
            if (detailsData.success && detailsData.data) {
              // Cache the full response for future use
              setStockDetailsCache(prev => ({
                ...prev,
                [stock]: detailsData.data
              }));
              
              const { info, priceInfo } = detailsData.data;
              return {
                symbol: stock,
                companyName: info?.companyName || stock,
                lastPrice: priceInfo?.lastPrice || 0,
                change: priceInfo?.change || 0,
                pChange: priceInfo?.pChange || 0,
                totalTradedVolume: priceInfo?.totalTradedVolume || 0,
                dayHigh: priceInfo?.intraDayHighLow?.max || 0,
                dayLow: priceInfo?.intraDayHighLow?.min || 0,
                open: priceInfo?.open || 0,
                previousClose: priceInfo?.previousClose || 0,
                industry: info?.industry || 'N/A'
              };
            } else {
              return {
                symbol: stock,
                companyName: stock
              };
            }
          } catch (error) {
            console.error(`Error fetching details for ${stock}:`, error);
            return {
              symbol: stock,
              companyName: stock
            };
          }
        });
        
        // Wait for all promises to resolve
        const stocksWithDetails = await Promise.all(stocksWithDetailsPromises);
        
        // Create a Map to ensure unique stocks and maintain order
        const uniqueStocksMap = new Map<string, NSEStock>();
        
        // Add each stock to the map with the symbol as key
        stocksWithDetails.forEach(stock => {
          uniqueStocksMap.set(stock.symbol, stock);
        });
        
        // Convert the map values back to an array and sort by symbol
        const uniqueStocks = Array.from(uniqueStocksMap.values())
          .sort((a, b) => a.symbol.localeCompare(b.symbol));
        
        setAllStocks(uniqueStocks);
        setFilteredStocks(uniqueStocks);
      } else {
        throw new Error('Failed to fetch stock symbols');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stocks');
      console.error('Error fetching stocks:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const searchStock = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Find exact or close matches in the full symbol list
        const exactMatches = allStocksSymbols.filter(symbol => 
          symbol.toLowerCase() === query.toLowerCase()
        );
        
        const partialMatches = allStocksSymbols.filter(symbol => 
          symbol.toLowerCase().includes(query.toLowerCase()) && 
          !exactMatches.includes(symbol)
        );
        
      // Prioritize exact matches, then include partial matches
        const matchingSymbols = [...exactMatches, ...partialMatches.slice(0, 5)];
        
        if (matchingSymbols.length > 0) {
        // Fetch details for all matching symbols that aren't already loaded
        const symbolsToFetch = matchingSymbols.filter(
          symbol => !allStocks.some(stock => stock.symbol === symbol)
        );
        
        if (symbolsToFetch.length > 0) {
          // Fetch details for symbols we don't have yet
          const stocksWithDetailsPromises = symbolsToFetch.map(async (stock: string) => {
            try {
              // Check if we already have cached details for this stock
              if (stockDetailsCache[stock]) {
                const cachedDetails = stockDetailsCache[stock];
                return {
                  symbol: stock,
                  companyName: cachedDetails.info?.companyName || stock,
                  lastPrice: cachedDetails.priceInfo?.lastPrice || 0,
                  change: cachedDetails.priceInfo?.change || 0,
                  pChange: cachedDetails.priceInfo?.pChange || 0,
                  totalTradedVolume: cachedDetails.priceInfo?.totalTradedVolume || 0,
                  dayHigh: cachedDetails.priceInfo?.intraDayHighLow?.max || 0,
                  dayLow: cachedDetails.priceInfo?.intraDayHighLow?.min || 0,
                  open: cachedDetails.priceInfo?.open || 0,
                  previousClose: cachedDetails.priceInfo?.previousClose || 0,
                  industry: cachedDetails.info?.industry || 'N/A'
                };
              }
              
              // If not cached, fetch from API
              const detailsResponse = await fetch(`http://localhost:8000/api/test/nse-details/${stock}`);
          const detailsData = await detailsResponse.json();
          
          if (detailsData.success && detailsData.data) {
                // Cache the full response for future use
            setStockDetailsCache(prev => ({
              ...prev,
                  [stock]: detailsData.data
            }));
            
            const { info, priceInfo } = detailsData.data;
                return {
                  symbol: stock,
                  companyName: info?.companyName || stock,
              lastPrice: priceInfo?.lastPrice || 0,
              change: priceInfo?.change || 0,
              pChange: priceInfo?.pChange || 0,
              totalTradedVolume: priceInfo?.totalTradedVolume || 0,
              dayHigh: priceInfo?.intraDayHighLow?.max || 0,
              dayLow: priceInfo?.intraDayHighLow?.min || 0,
              open: priceInfo?.open || 0,
              previousClose: priceInfo?.previousClose || 0,
              industry: info?.industry || 'N/A'
            };
              } else {
                return {
                  symbol: stock,
                  companyName: stock
                };
              }
            } catch (error) {
              console.error(`Error fetching details for ${stock}:`, error);
              return {
                symbol: stock,
                companyName: stock
              };
            }
          });
          
          // Wait for all promises to resolve
          const newStocks = await Promise.all(stocksWithDetailsPromises);
          
          // Add new stocks to allStocks
            setAllStocks(prev => {
            const updatedStocks = [...prev];
            
            newStocks.forEach(newStock => {
              // Only add if it doesn't already exist
              if (!updatedStocks.some(s => s.symbol === newStock.symbol)) {
                updatedStocks.push(newStock);
              }
            });
            
            // Sort alphabetically
            return updatedStocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
          });
        }
        
        // If user specified an exact stock, open its details
        if (exactMatches.length === 1) {
          // Find the stock in our updated list
          setTimeout(() => {
            const exactStock = allStocks.find(stock => stock.symbol === exactMatches[0]);
            if (exactStock) {
              openStockDetails(exactStock);
            setSearchQuery('');
          }
          }, 500); // Small delay to ensure state updates have processed
        } else {
          // Otherwise update the search query to filter the list
          setSearchQuery(query);
        }
      } else {
        // Try direct API call if no matches in our list
        try {
        const detailsResponse = await fetch(`http://localhost:8000/api/test/nse-details/${query}`);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.success && detailsData.data) {
          // Cache the details
          setStockDetailsCache(prev => ({
            ...prev,
            [query]: detailsData.data
          }));
          
          const { info, priceInfo } = detailsData.data;
          const newStock = {
            symbol: query,
            companyName: info?.companyName || query,
            lastPrice: priceInfo?.lastPrice || 0,
            change: priceInfo?.change || 0,
            pChange: priceInfo?.pChange || 0,
            totalTradedVolume: priceInfo?.totalTradedVolume || 0,
            dayHigh: priceInfo?.intraDayHighLow?.max || 0,
            dayLow: priceInfo?.intraDayHighLow?.min || 0,
            open: priceInfo?.open || 0,
            previousClose: priceInfo?.previousClose || 0,
            industry: info?.industry || 'N/A'
          };
          
            // Add to the stocks list
          setAllStocks(prev => {
              if (prev.some(s => s.symbol === newStock.symbol)) return prev;
              return [...prev, newStock].sort((a, b) => a.symbol.localeCompare(b.symbol));
          });
          
          // Set the selected stock
            setTimeout(() => {
          openStockDetails(newStock);
          setSearchQuery('');
            }, 300);
          } else {
            // No exact match found, update search query to show filtered results
            setSearchQuery(query);
            setError('No exact match found. Showing available results.');
        }
      } catch (error) {
          console.error('Error with direct API call:', error);
      setSearchQuery(query);
          setError('No exact match found. Showing available results.');
        }
      }
    } catch (err: any) {
      setError('Stock not found. Please try a different search.');
      console.error('Error searching stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchStock(searchQuery);
  };

  const fetchStockDetails = async (symbol: string) => {
    // If we already have cached details and it's not stale, use it
    if (stockDetailsCache[symbol]) {
      console.log("Using cached stock details for:", symbol);
      setSelectedStockDetails(stockDetailsCache[symbol]);
      
      // Check if we have cached historical data
      if (historicalDataCache[symbol]) {
        console.log("Using cached historical data for:", symbol);
        setHistoricalData(historicalDataCache[symbol]);
        return;
      }
      
      // Only fetch historical data if not cached
      fetchHistoricalData(symbol);
      return;
    }
    
    // If not cached, fetch from API
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/test/nse-details/${symbol}`);
      const data = await response.json();
      
      if (data.success) {
        console.log("Fresh stock details fetched for:", symbol);
        
        // Cache the details for future use
        setStockDetailsCache(prev => ({
          ...prev,
          [symbol]: data.data
        }));
        
        setSelectedStockDetails(data.data);
        fetchHistoricalData(symbol);
      } else {
        throw new Error(`Failed to fetch details for ${symbol}`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to fetch details for ${symbol}`);
      console.error(`Error fetching stock details for ${symbol}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (symbol: string) => {
    // Check if we have cached historical data
    if (historicalDataCache[symbol]) {
      console.log("Using cached historical data for:", symbol);
      setHistoricalData(historicalDataCache[symbol]);
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Fetching historical data for ${symbol}...`);
      // Modify endpoint to specifically request only 3 months of data
      const response = await fetch(`http://localhost:8000/api/test/nse-historical/${symbol}?period=3m`);
      const responseData = await response.json();
      
      console.log("Historical data API response structure:", JSON.stringify(responseData).substring(0, 300) + "...");
      
      let dataToProcess: any[] = [];
      
      // Check various possible response structures
      if (responseData.success && Array.isArray(responseData.data)) {
        console.log(`Received ${responseData.data.length} data points for ${symbol}`);
        dataToProcess = responseData.data;
      } else if (responseData.success && responseData.data && typeof responseData.data === 'object') {
        // Handle nested data structure - looks for arrays
        const possibleArrays = Object.values(responseData.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          // Use the largest array as our data
          dataToProcess = possibleArrays.reduce((a, b) => (a as any[]).length > (b as any[]).length ? a : b) as any[];
          console.log(`Found nested data array with ${dataToProcess.length} items`);
        }
      } else if (Array.isArray(responseData)) {
        // If the response itself is an array
        dataToProcess = responseData;
        console.log(`Response is a direct array with ${dataToProcess.length} items`);
      }
      
      if (dataToProcess.length > 0) {
        // Process and validate the data, limiting to last 90 days (approx 3 months)
        const validHistoricalData = processHistoricalData(dataToProcess).slice(-90);
        console.log(`Processed ${validHistoricalData.length} valid data points for chart`);
        
        if (validHistoricalData.length > 0) {
          console.log("Sample processed data point:", validHistoricalData[0]);
        }
        
        // Cache the processed data
        setHistoricalDataCache(prev => ({
          ...prev,
          [symbol]: validHistoricalData
        }));
        
        setHistoricalData(validHistoricalData);
      } else {
        console.error(`No historical data available for ${symbol} or invalid format`);
        // Set empty array to avoid endless loading state
        setHistoricalData([]);
      }
    } catch (err: any) {
      console.error(`Error fetching historical data for ${symbol}:`, err);
      // Set empty array to avoid endless loading state
      setHistoricalData([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to process and validate historical data
  const processHistoricalData = (data: any[]): HistoricalData[] => {
    // Check if the data contains the structure from the sample
    if (data.length > 0 && 'CH_SYMBOL' in data[0]) {
      // Process data in the format from the provided sample
      return data.map((item: any) => {
        // Extract date from CH_TIMESTAMP or mTIMESTAMP
        let timestamp = item.CH_TIMESTAMP || item.mTIMESTAMP;
        
        // If it's in format 'DD-MMM-YYYY' or similar, convert it
        if (typeof timestamp === 'string') {
          // Try to create a valid date object
          const date = new Date(timestamp);
          if (!isNaN(date.getTime())) {
            timestamp = date.toISOString();
          } else {
            // Try parsing different formats
            // For format like "10-Dec-2019"
            if (item.mTIMESTAMP) {
              const parts = item.mTIMESTAMP.split('-');
              if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const monthStr = parts[1];
                const year = parseInt(parts[2]);
                
                const months: Record<string, number> = {
                  'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                  'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                };
                
                if (!isNaN(day) && !isNaN(year) && months[monthStr] !== undefined) {
                  timestamp = new Date(year, months[monthStr], day).toISOString();
                }
              }
            } else if (item.CH_TIMESTAMP && item.CH_TIMESTAMP.includes('-')) {
              // For format like "2019-12-10"
              const dateParts = item.CH_TIMESTAMP.split('-');
              if (dateParts.length === 3) {
                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
                const day = parseInt(dateParts[2]);
                
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                  timestamp = new Date(year, month, day).toISOString();
                }
              }
            }
          }
        }
        
        // If there's a TIMESTAMP field with a valid date string, use that
        if (item.TIMESTAMP && typeof item.TIMESTAMP === 'string') {
          const date = new Date(item.TIMESTAMP);
          if (!isNaN(date.getTime())) {
            timestamp = date.toISOString();
          }
        }
        
        return {
          timestamp: timestamp,
          open: item.CH_OPENING_PRICE || 0,
          high: item.CH_TRADE_HIGH_PRICE || 0,
          low: item.CH_TRADE_LOW_PRICE || 0,
          close: item.CH_CLOSING_PRICE || 0,
          volume: item.CH_TOT_TRADED_QTY || 0
        };
      });
    }
    
    // Fallback to the original data format processing
    return data
      .filter((item: any) => item && item.timestamp) // Filter out null/undefined entries
      .map((item: any) => {
        // Ensure timestamp is in a consistent format
        let timestamp = item.timestamp;
        if (typeof timestamp === 'string') {
          // If timestamp is already a string, ensure it's a valid date
          const date = new Date(timestamp);
          if (isNaN(date.getTime())) {
            // If it's not a valid date, try to extract date from string formats like "dd-MMM-yyyy" or others
            const parts = timestamp.split(/[-/]/);
            if (parts.length >= 3) {
              // Try different date formats - convert strings to numbers
              const year = parseInt(parts[2]);
              const month = parseInt(parts[1]) - 1;  // JS months are 0-indexed
              const day = parseInt(parts[0]);
              
              if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                timestamp = new Date(year, month, day).toISOString();
              } else {
                // As a fallback, use current date minus some days
                const randomDaysBack = Math.floor(Math.random() * 30);
                const fallbackDate = new Date();
                fallbackDate.setDate(fallbackDate.getDate() - randomDaysBack);
                timestamp = fallbackDate.toISOString();
              }
            } else {
              // As a fallback, use current date minus some days
              const randomDaysBack = Math.floor(Math.random() * 30);
              const fallbackDate = new Date();
              fallbackDate.setDate(fallbackDate.getDate() - randomDaysBack);
              timestamp = fallbackDate.toISOString();
            }
          }
        } else {
          // If timestamp is a number (e.g. unix timestamp), convert to ISO string
          timestamp = new Date(timestamp).toISOString();
        }
        
        return {
          ...item,
          timestamp,
          // Ensure all numeric values are numbers
          open: typeof item.open === 'number' ? item.open : parseFloat(item.open) || 0,
          high: typeof item.high === 'number' ? item.high : parseFloat(item.high) || 0,
          low: typeof item.low === 'number' ? item.low : parseFloat(item.low) || 0,
          close: typeof item.close === 'number' ? item.close : parseFloat(item.close) || 0,
          volume: typeof item.volume === 'number' ? item.volume : parseFloat(item.volume) || 0
        };
      });
  };

  const handleAnalysis = async (ticker: string) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      // Format the ticker properly, adding .NS if not present
      if (!ticker.endsWith('.NS')) {
        ticker = `${ticker}.NS`;
      }
      
      // Show loading toast
      toast.loading(`Analyzing ${ticker}...`, { id: 'analysis-toast' });
      
      // Create form data
      const formData = new FormData();
      formData.append('ticker', ticker);
      
      const response = await fetch('http://localhost:5000/analyse-stock', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("Analysis result:", data.analysis);
        toast.dismiss('analysis-toast');
        toast.success(`Analysis completed for ${ticker}`);
        setAnalysisResult(data.analysis);
      } else {
        toast.dismiss('analysis-toast');
        const errorMsg = data.error || 'Failed to analyze stock.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('Error analyzing stock:', err);
      toast.dismiss('analysis-toast');
      const errorMsg = err.message || 'An unexpected error occurred during analysis.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!selectedStock?.symbol) {
      toast.error("Please select a valid stock symbol");
      return;
    }

    try {
      setReportLoading(true);
      setError(null);
      
      // Format the ticker properly, adding .NS if not present
      let ticker = selectedStock.symbol;
      if (!ticker.endsWith('.NS')) {
        ticker = `${ticker}.NS`;
      }
      
      // Create form data with the ticker
      const formData = new FormData();
      formData.append('ticker', ticker);
      
      // Show toast that report generation is in progress
      toast.loading(`Generating report for ${ticker}...`, { id: 'report-toast' });
      
      // Make request to the Flask endpoint
      const response = await fetch('http://localhost:5000/generate-stock-report', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = 'Failed to generate report';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `Failed to generate report: ${response.statusText}`;
        }
        toast.dismiss('report-toast');
        throw new Error(errorMessage);
      }
      
      // Response is OK, get the PDF blob
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${ticker}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Dismiss loading toast and show success message
      toast.dismiss('report-toast');
      toast.success(`Report for ${ticker} has been downloaded`);
      
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate stock report');
      toast.error(err.message || 'Failed to generate stock report');
    } finally {
      setReportLoading(false);
    }
  };

  const openStockDetails = (stock: NSEStock) => {
    setSelectedStock(stock);
    setAnalysisResult(null);
    setReportUrl(null);
    setError(null);
    fetchStockDetails(stock.symbol);
  };

  const closeStockDetails = () => {
    setSelectedStock(null);
    setSelectedStockDetails(null);
    setHistoricalData([]);
    setBuyFormData({ shares: 1 });
    setAnalysisResult(null);
    setReportUrl(null);
    setError(null);
  };

  const handleBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    alert(`Buy order submitted for ${buyFormData.shares} shares of ${selectedStock.symbol} at ₹${selectedStockDetails?.priceInfo?.lastPrice.toFixed(2) || 0}`);
    closeStockDetails();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyFormData({ ...buyFormData, shares: parseInt(e.target.value) || 1 });
  };

  const getChartData = () => {
    console.log(`Getting chart data, historical data length: ${historicalData?.length || 0}`);

    // If we have valid historical data, use it
    if (historicalData && historicalData.length > 0) {
      console.log(`Preparing chart data from ${historicalData.length} data points`);

      // Sort data chronologically
      const sortedData = [...historicalData].sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Ensure we're not overloading the chart with too many points
      // Take approximately 30 data points (one data point every 3 days for 3 months)
      const dataPointInterval = Math.max(1, Math.floor(sortedData.length / 30));
      const sampledData = sortedData.filter((_, index) => index % dataPointInterval === 0);
      
      console.log(`Using ${sampledData.length} sampled data points for chart display with interval ${dataPointInterval}`);
      
      // Format the date labels appropriately
      const formatDate = (dateStr: string) => {
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            return 'Invalid date';
          }
          
          // For a 3-month chart, showing day and month is appropriate
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) {
          console.error("Error formatting date:", e);
          return 'Invalid date';
        }
      };
      
      return {
        labels: sampledData.map(item => formatDate(item.timestamp)),
        datasets: [
          {
            label: 'Close Price',
            data: sampledData.map(item => item.close),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true,
            order: 1
          },
          {
            label: 'Open Price',
            data: sampledData.map(item => item.open),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.2)',
            tension: 0.1,
            fill: false,
            order: 2
          },
          {
            label: 'High Price',
            data: sampledData.map(item => item.high),
            borderColor: 'rgba(34, 197, 94, 0.8)',
            borderWidth: 1,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            pointRadius: 0,
            tension: 0.1,
            fill: false,
            order: 3
          },
          {
            label: 'Low Price',
            data: sampledData.map(item => item.low),
            borderColor: 'rgba(239, 68, 68, 0.8)',
            borderWidth: 1,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            pointRadius: 0,
            tension: 0.1,
            fill: false,
            order: 4
          }
        ],
      };
    } 
    
    // If no valid historical data, generate fallback dummy data
    else if (selectedStock && selectedStockDetails) {
      console.log("No historical data available, generating fallback dummy data");
      
      // Get current price data to base the dummy chart on
      const currentPrice = selectedStockDetails.priceInfo?.lastPrice || 100;
      const dayLow = selectedStockDetails.priceInfo?.intraDayHighLow?.min || currentPrice * 0.95;
      const dayHigh = selectedStockDetails.priceInfo?.intraDayHighLow?.max || currentPrice * 1.05;
      
      // Calculate price range for realistic fluctuations
      const priceRange = (dayHigh - dayLow) || currentPrice * 0.1;
      
      // Generate dates for the last 90 days (3 months)
      const dates = [];
      const prices = [];
      const opens = [];
      const highs = [];
      const lows = [];
      
      // Start date 90 days ago
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      
      // Generate 30 data points for a 3-month period
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (i * 3)); // Every 3 days
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Generate semi-realistic price movements
        // Start around 90-110% of current price
        let basePrice = currentPrice * (0.9 + Math.random() * 0.2);
        
        if (i > 0) {
          // Make prices somewhat follow the previous day with some randomness
          basePrice = prices[i-1] * (0.98 + Math.random() * 0.04);
        }
        
        // Generate daily high/low around the base price
        const dayVariation = priceRange * 0.3;
        const open = basePrice * (0.99 + Math.random() * 0.02);
        const high = basePrice + (Math.random() * dayVariation);
        const low = basePrice - (Math.random() * dayVariation);
        const close = basePrice * (0.99 + Math.random() * 0.02);
        
        opens.push(open);
        highs.push(high);
        lows.push(low);
        prices.push(close);
      }
      
      // Ensure the last price matches the current price for realism
      prices[prices.length - 1] = currentPrice;
      
      return {
        labels: dates,
        datasets: [
          {
            label: 'Close Price (Simulated)',
            data: prices,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
            fill: true,
            order: 1
          },
          {
            label: 'Open Price (Simulated)',
            data: opens,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.2)',
            tension: 0.3,
            fill: false,
            order: 2
          },
          {
            label: 'High Price (Simulated)',
            data: highs,
            borderColor: 'rgba(34, 197, 94, 0.8)',
            borderWidth: 1,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            pointRadius: 0,
            tension: 0.3,
            fill: false,
            order: 3
          },
          {
            label: 'Low Price (Simulated)',
            data: lows,
            borderColor: 'rgba(239, 68, 68, 0.8)',
            borderWidth: 1,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            pointRadius: 0,
            tension: 0.3,
            fill: false,
            order: 4
          }
        ],
      };
    }
    
    return null;
  };

  // Chart options for the stock price chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price History (Last 3 Months)',
        color: '#374151',
        font: {
          size: 16,
          weight: 'bold' as 'bold',
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { 
                style: 'currency', 
                currency: 'INR',
                minimumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value: any) {
            return '₹' + value.toFixed(2);
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (pageLoading) {
    return (
      <div className="bg-gray-100 min-h-screen py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading stocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-3xl font-bold text-gray-800 mb-4">Stock Market</div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Search by stock symbol, company name, or industry..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
                  </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Search
            </button>
          </form>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-500">
              Searching for: "{searchQuery}" 
              <button
                onClick={clearSearch}
                className="ml-2 text-blue-500 hover:text-blue-700 underline focus:outline-none"
              >
                Clear Search
              </button>
                </div>
          )}
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-lg">Loading...</p>
                  </div>
                </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
              </div>
        )}
        
        {reportUrl && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">Report generated successfully!</span>
            <a
              href={reportUrl}
              download={`${selectedStock?.symbol}_report.pdf`}
              className="ml-2 text-green-700 underline"
            >
              Download Report
            </a>
          </div>
        )}

        <StockList
          allStocks={allStocks}
          filteredStocks={filteredStocks}
          searchQuery={searchQuery}
          allStocksSymbols={allStocksSymbols}
          clearSearch={clearSearch}
          openStockDetails={openStockDetails}
          loadMoreStocks={() => {
            if (searchQuery && searchQuery.trim() !== '') {
              searchStock(searchQuery);
            }
          }}
        />

        {selectedStock && selectedStockDetails && (
          <StockDetails
            selectedStock={selectedStock}
            selectedStockDetails={selectedStockDetails}
            historicalData={historicalData}
            buyFormData={buyFormData}
            loading={loading}
            reportLoading={reportLoading}
            analysisResult={analysisResult}
            reportUrl={reportUrl}
            error={error}
            chartOptions={chartOptions}
            closeStockDetails={closeStockDetails}
            handleBuySubmit={handleBuySubmit}
            handleInputChange={handleInputChange}
            handleAnalysis={handleAnalysis}
            handleReport={handleReport}
            getChartData={getChartData}
          />
    )}
  </div>
</div>
);
};

export default StockPage;