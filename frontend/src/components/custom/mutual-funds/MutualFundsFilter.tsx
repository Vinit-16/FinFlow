import { useState, useEffect, useMemo, useCallback } from 'react';

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

interface MutualFundsFilterProps {
  allFunds: MutualFund[];
  onFilterChange: (funds: MutualFund[]) => void;
  getRiskLevel: (fund: MutualFund) => 'Low' | 'Medium' | 'High';
}

export default function MutualFundsFilter({ allFunds, onFilterChange, getRiskLevel }: MutualFundsFilterProps) {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    category: [],
    fundHouse: [],
    rating: [],
    riskLevel: [],
    minReturn1Y: null,
    maxExpenseRatio: null,
    minInvestment: null,
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('default');
  const [hasMounted, setHasMounted] = useState(false);
  
  // Extract unique categories, fund houses, and ratings for filter options
  const categories = useMemo(() => {
    if (allFunds.length === 0) return [];
    return Array.from(new Set(allFunds.map(fund => fund.classification))).sort();
  }, [allFunds]);

  const fundHouses = useMemo(() => {
    if (allFunds.length === 0) return [];
    return Array.from(new Set(allFunds.map(fund => fund.fund_house))).sort();
  }, [allFunds]);

  const ratings = useMemo(() => {
    if (allFunds.length === 0) return [];
    return Array.from(new Set(allFunds.map(fund => fund.rupeevest_rating))).sort();
  }, [allFunds]);
  
  // Memoize filtered results to avoid recalculation on every render
  const filteredFunds = useMemo(() => {
    if (!hasMounted || allFunds.length === 0) return [];
    
    let result = [...allFunds];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(fund => 
        fund.s_name.toLowerCase().includes(term) || 
        fund.fund_house.toLowerCase().includes(term)
      );
    }

    // Apply category filters
    if (filters.category.length > 0) {
      result = result.filter(fund => filters.category.includes(fund.classification));
    }

    // Apply fund house filters
    if (filters.fundHouse.length > 0) {
      result = result.filter(fund => filters.fundHouse.includes(fund.fund_house));
    }

    // Apply rating filters
    if (filters.rating.length > 0) {
      result = result.filter(fund => filters.rating.includes(fund.rupeevest_rating));
    }

    // Apply risk level filters
    if (filters.riskLevel.length > 0) {
      result = result.filter(fund => {
        const risk = getRiskLevel(fund);
        return filters.riskLevel.includes(risk);
      });
    }

    // Apply minimum 1Y return filter
    if (filters.minReturn1Y !== null) {
      result = result.filter(fund => fund.returns_1year >= (filters.minReturn1Y || 0));
    }

    // Apply maximum expense ratio filter
    if (filters.maxExpenseRatio !== null) {
      result = result.filter(fund => fund.expenceratio <= (filters.maxExpenseRatio || 3));
    }

    // Apply minimum investment filter
    if (filters.minInvestment !== null) {
      result = result.filter(fund => fund.minimum_investment <= (filters.minInvestment || 5000));
    }

    // Apply sorting
    switch(sortOption) {
      case 'returns_high':
        return [...result].sort((a, b) => (b.returns_1year || 0) - (a.returns_1year || 0));
      case 'returns_low':
        return [...result].sort((a, b) => (a.returns_1year || 0) - (b.returns_1year || 0));
      case 'nav_high':
        return [...result].sort((a, b) => b.navrs - a.navrs);
      case 'nav_low':
        return [...result].sort((a, b) => a.navrs - b.navrs);
      case 'rating_high':
        return [...result].sort((a, b) => {
          const ratingA = a.rupeevest_rating === 'Unrated' ? 0 : parseInt(a.rupeevest_rating);
          const ratingB = b.rupeevest_rating === 'Unrated' ? 0 : parseInt(b.rupeevest_rating);
          return ratingB - ratingA;
        });
      default:
        return result;
    }
  }, [allFunds, searchTerm, filters, sortOption, getRiskLevel, hasMounted]);
  
  // Handle client-side mounting
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // Use useEffect with the memoized result to notify parent component
  useEffect(() => {
    // Only run after initial mount and when we have filtered funds
    if (!hasMounted || filteredFunds.length === 0) return;
    
    // Ensure it only runs when needed
    const timeoutId = setTimeout(() => {
      onFilterChange(filteredFunds);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [filteredFunds, hasMounted, onFilterChange]);

  // Toggle filter selection
  const toggleFilter = (type: keyof Filters, value: string) => {
    setFilters(prev => {
      const current = prev[type] as string[];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      
      return {
        ...prev,
        [type]: updated
      };
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: [],
      fundHouse: [],
      rating: [],
      riskLevel: [],
      minReturn1Y: null,
      maxExpenseRatio: null,
      minInvestment: null,
    });
    setSearchTerm('');
    setSortOption('default');
  };

  const activeFilterCount = Object.values(filters).flat().filter(Boolean).length;

  // Server-side rendering check - return a placeholder during SSR
  if (!hasMounted) {
    return <div className="mb-6">Loading filters...</div>;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search funds by name or fund house..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters {activeFilterCount > 0 && 
              <span className="ml-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {activeFilterCount}
              </span>
            }
          </button>
          {(activeFilterCount > 0 || searchTerm) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 animate-fade-in">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Filter Mutual Funds</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Fund Category</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={filters.category.includes(category)}
                      onChange={() => toggleFilter('category', category)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700 overflow-hidden text-ellipsis">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Fund House Filter */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Fund House</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fundHouses.map((house) => (
                  <div key={house} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`house-${house}`}
                      checked={filters.fundHouse.includes(house)}
                      onChange={() => toggleFilter('fundHouse', house)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`house-${house}`} className="ml-2 text-sm text-gray-700 overflow-hidden text-ellipsis">
                      {house}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Level Filter */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Risk Level</h3>
              <div className="space-y-2">
                {['Low', 'Medium', 'High'].map((risk) => (
                  <div key={risk} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`risk-${risk}`}
                      checked={filters.riskLevel.includes(risk)}
                      onChange={() => toggleFilter('riskLevel', risk)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`risk-${risk}`} className="ml-2 text-sm text-gray-700">
                      {risk}
                    </label>
                  </div>
                ))}
              </div>

              {/* Rating Filter */}
              <h3 className="font-medium text-gray-700 mb-2 mt-4">Rating</h3>
              <div className="space-y-2">
                {ratings.filter(r => r !== "Unrated").map((rating) => (
                  <div key={rating} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`rating-${rating}`}
                      checked={filters.rating.includes(rating)}
                      onChange={() => toggleFilter('rating', rating)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`rating-${rating}`} className="ml-2 text-sm text-gray-700">
                      {rating} Star
                    </label>
                  </div>
                ))}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rating-unrated"
                    checked={filters.rating.includes("Unrated")}
                    onChange={() => toggleFilter('rating', "Unrated")}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="rating-unrated" className="ml-2 text-sm text-gray-700">
                    Unrated
                  </label>
                </div>
              </div>
            </div>

            {/* Slider Filters */}
            <div>
              {/* Return Filter */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Minimum 1Y Return</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={filters.minReturn1Y || 0}
                    onChange={(e) => setFilters({...filters, minReturn1Y: Number(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 min-w-[60px]">
                    {filters.minReturn1Y !== null ? `${filters.minReturn1Y}%` : '0%'}
                  </span>
                </div>
              </div>

              {/* Expense Ratio Filter */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Max Expense Ratio</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={filters.maxExpenseRatio || 3}
                    onChange={(e) => setFilters({...filters, maxExpenseRatio: Number(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 min-w-[60px]">
                    {filters.maxExpenseRatio !== null ? `${filters.maxExpenseRatio}%` : '3%'}
                  </span>
                </div>
              </div>

              {/* Min Investment Filter */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Max Min.Investment</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={filters.minInvestment || 5000}
                    onChange={(e) => setFilters({...filters, minInvestment: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={500}>₹500</option>
                    <option value={1000}>₹1,000</option>
                    <option value={5000}>₹5,000</option>
                    <option value={10000}>₹10,000</option>
                    <option value={25000}>₹25,000</option>
                    <option value={50000}>₹50,000</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{allFunds.length}</span> funds
          {(activeFilterCount > 0 || searchTerm) && ' (filtered)'}
        </p>
        
        <div className="flex items-center text-sm text-gray-500">
          <span>Sort by:</span>
          <select 
            className="ml-2 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="returns_high">Returns (High to Low)</option>
            <option value="returns_low">Returns (Low to High)</option>
            <option value="nav_high">NAV (High to Low)</option>
            <option value="nav_low">NAV (Low to High)</option>
            <option value="rating_high">Rating (High to Low)</option>
          </select>
        </div>
      </div>
    </div>
  );
} 