"use client";

import React from 'react';
import { StockListProps } from './types';

const StockList: React.FC<StockListProps> = ({
  filteredStocks,
  searchQuery,
  allStocksSymbols,
  clearSearch,
  openStockDetails,
  loadMoreStocks
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-x-auto mb-6">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-700">
          {searchQuery ? (
            <>Search Results for "<span className="font-semibold">{searchQuery}</span>"</>
          ) : (
            'Top 30 Stocks (Alphabetical)'
          )}
        </h2>
        <p className="text-sm text-gray-500">
          {searchQuery 
            ? `Found ${filteredStocks.length} match${filteredStocks.length !== 1 ? 'es' : ''}`
            : `Showing 30 of ${allStocksSymbols.length} stocks`
          }
        </p>
      </div>
      
      {!searchQuery && (
        <div className="px-4 py-2 bg-blue-50 text-sm text-blue-700 border-b border-blue-100">
          <span className="font-medium">Note:</span> Only 30 stocks are shown initially to improve performance. 
          Search for specific stocks by symbol, company name, or industry.
        </div>
      )}
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day Range</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredStocks.map((stock, index) => (
            <tr 
              key={`${stock.symbol}-${index}`}
              className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              onClick={() => openStockDetails(stock)}
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{stock.symbol}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={stock.companyName || stock.symbol}>
                {stock.companyName || stock.symbol}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{stock.industry || 'N/A'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">₹{(stock.lastPrice || 0).toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  (stock.pChange || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {(stock.pChange || 0) >= 0 ? '↑' : '↓'} {Math.abs(stock.pChange || 0).toFixed(2)}%
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                ₹{(stock.dayLow || 0).toFixed(2)} - ₹{(stock.dayHigh || 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openStockDetails(stock);
                  }}
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredStocks.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <p className="mb-2">No stocks found matching your search criteria.</p>
          <p className="text-sm">Try a different search term or check the symbol spelling.</p>
        </div>
      )}
      
      {searchQuery && filteredStocks.length > 0 && (
        <div className="p-4 text-center border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Found {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
          {allStocksSymbols.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).length > filteredStocks.length && (
            <div className="mt-2">
              <button 
                onClick={loadMoreStocks}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                Load More Results
              </button>
              <div className="mt-1 text-xs text-gray-500">
                There may be more matches. Click to load more stocks.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockList; 