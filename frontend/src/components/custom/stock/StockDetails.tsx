"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { StockDetailsProps } from './types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';

// Create a star rating component
const StarRating = ({ rating }: { rating: number }) => {
  // Convert rating to percentage (assuming rating is out of 10)
  const percentage = (rating / 10) * 100;
  
  return (
    <div className="star-rating">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`star ${star <= rating / 2 ? "" : "star-empty"}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        ))}
        <span className="ml-2 text-gray-600 font-medium">{rating}/10</span>
      </div>
    </div>
  );
};

// Create a recommendation status component
const RecommendationStatus = ({ recommendation }: { recommendation: string }) => {
  // Normalize recommendation text to handle variations
  const normalizedRec = recommendation.toLowerCase().trim();
  
  if (normalizedRec.includes("buy") || normalizedRec.includes("invest")) {
    return (
      <div className="recommendation-badge buy">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l6.75 6.75a.75.75 0 11-1.06 1.06l-5.47-5.47V19.5a.75.75 0 01-.75.75z" clipRule="evenodd" />
        </svg>
        Buy
      </div>
    );
  } else if (normalizedRec.includes("sell") || normalizedRec.includes("not") || normalizedRec.includes("avoid")) {
    return (
      <div className="recommendation-badge sell">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v13.19l5.47-5.47a.75.75 0 111.06 1.06l-6.75 6.75a.75.75 0 01-1.06 0l-6.75-6.75a.75.75 0 111.06-1.06l5.47 5.47V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
        Sell
      </div>
    );
  } else {
    return (
      <div className="recommendation-badge hold">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
        Hold
      </div>
    );
  }
};

const StockDetails: React.FC<StockDetailsProps> = ({
  selectedStock,
  selectedStockDetails,
  historicalData,
  buyFormData,
  loading,
  reportLoading,
  analysisResult,
  reportUrl,
  error,
  chartOptions,
  closeStockDetails,
  handleBuySubmit,
  handleInputChange,
  handleAnalysis,
  handleReport,
  getChartData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');
  const [extractedRating, setExtractedRating] = useState<number | null>(null);
  const [extractedRecommendation, setExtractedRecommendation] = useState<string | null>(null);

  // Extract rating and recommendation from analysis text
  useEffect(() => {
    if (analysisResult) {
      // Extract rating (format: "Rating: 6/10")
      const ratingMatch = analysisResult.match(/Rating:\s*(\d+)\/10/i);
      if (ratingMatch && ratingMatch[1]) {
        setExtractedRating(parseInt(ratingMatch[1], 10));
      }

      // Extract recommendation from Decision section
      const decisionMatch = analysisResult.match(/Decision:[\s\S]*?\*\*(.*?)\*\*/i);
      if (decisionMatch && decisionMatch[1]) {
        setExtractedRecommendation(decisionMatch[1]);
      }
    }
  }, [analysisResult]);

  return (
    <motion.div
      key={selectedStock.symbol}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={closeStockDetails}
    >
      <motion.div
        className="bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl w-full h-5/6 flex"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        {/* Main content area with scrolling */}
        <div className="flex-grow overflow-y-auto">
          <div className="sticky top-0 bg-white pb-0 z-10 border-b border-gray-200">
            <div className="flex justify-between items-center p-6">
              <div className="text-2xl font-bold text-gray-800">
                {selectedStock.symbol} - {selectedStockDetails.info?.companyName || selectedStock.companyName || selectedStock.symbol}
              </div>
              <button onClick={closeStockDetails} className="text-gray-500 hover:text-gray-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === 'analysis'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Analyse and Recommend
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg h-full">
                    <div className="text-lg font-semibold text-gray-800 mb-2">Price Information</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Latest Price</div>
                        <div className="text-2xl font-bold">₹{selectedStockDetails.priceInfo?.lastPrice.toFixed(2)}</div>
                        <div className={`text-sm ${(selectedStockDetails.priceInfo?.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(selectedStockDetails.priceInfo?.change || 0) >= 0 ? '+' : ''}{(selectedStockDetails.priceInfo?.change || 0).toFixed(2)} 
                          ({(selectedStockDetails.priceInfo?.pChange || 0) >= 0 ? '+' : ''}{(selectedStockDetails.priceInfo?.pChange || 0).toFixed(2)}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Previous Close</div>
                        <div className="text-lg">₹{selectedStockDetails.priceInfo?.previousClose.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Open / Close</div>
                        <div className="text-base">₹{selectedStockDetails.priceInfo?.open.toFixed(2)} / ₹{selectedStockDetails.priceInfo?.close.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">VWAP</div>
                        <div className="text-base">₹{selectedStockDetails.priceInfo?.vwap?.toFixed(2) || '-'}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-500 font-medium">Intraday High/Low</div>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ 
                              width: `${selectedStockDetails.priceInfo?.intraDayHighLow ? 
                                ((selectedStockDetails.priceInfo.lastPrice - selectedStockDetails.priceInfo.intraDayHighLow.min) / 
                                (selectedStockDetails.priceInfo.intraDayHighLow.max - selectedStockDetails.priceInfo.intraDayHighLow.min) * 100) : 50}%` 
                            }}></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>₹{selectedStockDetails.priceInfo?.intraDayHighLow?.min.toFixed(2) || '-'}</span>
                          <span>₹{selectedStockDetails.priceInfo?.intraDayHighLow?.max.toFixed(2) || '-'}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-500 font-medium">52 Week High/Low</div>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-600 h-2.5 rounded-full" style={{ 
                              width: `${selectedStockDetails.priceInfo?.weekHighLow ? 
                                ((selectedStockDetails.priceInfo.lastPrice - selectedStockDetails.priceInfo.weekHighLow.min) / 
                                (selectedStockDetails.priceInfo.weekHighLow.max - selectedStockDetails.priceInfo.weekHighLow.min) * 100) : 50}%` 
                            }}></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>₹{selectedStockDetails.priceInfo?.weekHighLow?.min.toFixed(2) || '-'}</span>
                          <span>₹{selectedStockDetails.priceInfo?.weekHighLow?.max.toFixed(2) || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 px-2 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg h-full">
                    <div className="text-lg font-semibold text-gray-800 mb-2">Trading Information</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Total Traded Volume</div>
                        <div className="text-base font-medium">
                          {(selectedStockDetails.priceInfo?.totalTradedVolume || 
                            selectedStockDetails.preOpenMarket?.totalTradedVolume)?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Buy Quantity</div>
                        <div className="text-base">
                          {(selectedStockDetails.priceInfo?.totalBuyQuantity || 
                            selectedStockDetails.preOpenMarket?.totalBuyQuantity)?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Sell Quantity</div>
                        <div className="text-base">
                          {(selectedStockDetails.priceInfo?.totalSellQuantity || 
                            selectedStockDetails.preOpenMarket?.totalSellQuantity)?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Industry</div>
                        <div className="text-base font-medium">
                          {selectedStockDetails.info?.industry || 
                            selectedStockDetails.industryInfo?.basicIndustry || 
                            selectedStockDetails.metadata?.industry || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">ISIN</div>
                        <div className="text-base">{selectedStockDetails.info?.isin || selectedStockDetails.metadata?.isin || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Series</div>
                        <div className="text-base">
                          {selectedStockDetails.metadata?.series || 
                            (selectedStockDetails.info?.activeSeries?.length ? selectedStockDetails.info.activeSeries[0] : 'N/A')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <div className="text-base">
                          {selectedStockDetails.metadata?.status ||
                            selectedStockDetails.securityInfo?.tradingStatus || 'N/A'}
                        </div>
                      </div>
                      {selectedStockDetails.securityInfo && (
                        <div>
                          <div className="text-sm text-gray-500">Face Value</div>
                          <div className="text-base">₹{selectedStockDetails.securityInfo.faceValue}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Price Chart (Last 3 Months)</h3>
                <div className="bg-white p-4 rounded-lg shadow-md" style={{ height: '400px' }}>
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading chart data...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {getChartData() ? (
                        <div className="h-full">
                          <Line data={getChartData()!} options={chartOptions} style={{ height: '100%' }} />
                          <div className="mt-2 text-xs text-gray-500 text-center">
                            {historicalData && historicalData.length > 0 
                              ? "Showing price history for the last 3 months. Hover over data points for details."
                              : "Showing simulated price history based on current price data. Actual historical data could not be loaded."}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-600 mb-1">No historical data available</p>
                            <p className="text-gray-500 text-sm">Historical price data could not be loaded for this stock</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg h-full">
                    <div className="text-lg font-semibold text-gray-800 mb-2">Security Information</div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedStockDetails.securityInfo && (
                        <>
                          <div>
                            <div className="text-sm text-gray-500">Board Status</div>
                            <div className="text-base">{selectedStockDetails.securityInfo.boardStatus}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Trading Segment</div>
                            <div className="text-base">{selectedStockDetails.securityInfo.tradingSegment}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Class of Share</div>
                            <div className="text-base">{selectedStockDetails.securityInfo.classOfShare}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Issued Size</div>
                            <div className="text-base">{selectedStockDetails.securityInfo.issuedSize.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Surveillance</div>
                            <div className="text-base">
                              {typeof selectedStockDetails.securityInfo.surveillance === 'object' 
                                ? (selectedStockDetails.securityInfo.surveillance?.surv 
                                    ? selectedStockDetails.securityInfo.surveillance.surv 
                                    : 'None')
                                : selectedStockDetails.securityInfo.surveillance || 'None'}
                            </div>
                            {typeof selectedStockDetails.securityInfo.surveillance === 'object' && 
                              selectedStockDetails.securityInfo.surveillance?.desc && (
                              <div className="text-xs text-gray-500 mt-1">
                                {selectedStockDetails.securityInfo.surveillance.desc}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Derivatives</div>
                            <div className="text-base">
                              {typeof selectedStockDetails.securityInfo.derivatives === 'object' 
                                ? JSON.stringify(selectedStockDetails.securityInfo.derivatives) 
                                : (selectedStockDetails.securityInfo.derivatives || 'None')}
                            </div>
                          </div>
                        </>
                      )}
                      {!selectedStockDetails.securityInfo && (
                        <div className="col-span-2 text-gray-500 italic">No security information available</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 px-2 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg h-full">
                    <div className="text-lg font-semibold text-gray-800 mb-2">Price Band Information</div>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedStockDetails.priceInfo && (
                        <>
                          <div>
                            <div className="text-sm text-gray-500">Lower Circuit Limit</div>
                            <div className="text-base">₹{typeof selectedStockDetails.priceInfo.lowerCP === 'number' ? selectedStockDetails.priceInfo.lowerCP.toFixed(2) : selectedStockDetails.priceInfo.lowerCP}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Upper Circuit Limit</div>
                            <div className="text-base">₹{typeof selectedStockDetails.priceInfo.upperCP === 'number' ? selectedStockDetails.priceInfo.upperCP.toFixed(2) : selectedStockDetails.priceInfo.upperCP}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Price Band</div>
                            <div className="text-base">{selectedStockDetails.priceInfo.pPriceBand}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Base Price</div>
                            <div className="text-base">₹{typeof selectedStockDetails.priceInfo.basePrice === 'number' ? selectedStockDetails.priceInfo.basePrice.toFixed(2) : selectedStockDetails.priceInfo.basePrice}</div>
                          </div>
                        </>
                      )}
                      {!selectedStockDetails.priceInfo && (
                        <div className="col-span-2 text-gray-500 italic">No price band information available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full px-2 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-lg font-semibold text-gray-800 mb-2">Market Statistics</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedStockDetails.preOpenMarket && (
                        <>
                          <div>
                            <div className="text-sm text-gray-500">Final Pre-Open Price</div>
                            <div className="text-base">₹{selectedStockDetails.preOpenMarket.finalPrice?.toFixed(2) || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Pre-Open Volume</div>
                            <div className="text-base">{selectedStockDetails.preOpenMarket.finalQuantity?.toLocaleString() || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">IEP</div>
                            <div className="text-base">₹{selectedStockDetails.preOpenMarket.IEP?.toFixed(2) || 'N/A'}</div>
                          </div>
                        </>
                      )}
                      {selectedStockDetails.securityInfo && selectedStockDetails.securityInfo.surveillance && (
                        <div>
                          <div className="text-sm text-gray-500">Surveillance</div>
                          <div className="text-base">
                            {typeof selectedStockDetails.securityInfo.surveillance === 'object' 
                              ? selectedStockDetails.securityInfo.surveillance.surv
                              : selectedStockDetails.securityInfo.surveillance}
                          </div>
                          {typeof selectedStockDetails.securityInfo.surveillance === 'object' && (
                            <div className="text-xs text-gray-500 mt-1">
                              {selectedStockDetails.securityInfo.surveillance.desc}
                            </div>
                          )}
                        </div>
                      )}
                      {selectedStockDetails.priceInfo?.weekHighLow && (
                        <>
                          <div>
                            <div className="text-sm text-gray-500">52W High Date</div>
                            <div className="text-base">{selectedStockDetails.priceInfo.weekHighLow.maxDate || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">52W Low Date</div>
                            <div className="text-base">{selectedStockDetails.priceInfo.weekHighLow.minDate || 'N/A'}</div>
                          </div>
                        </>
                      )}
                      {selectedStockDetails.info && (
                        <>
                          <div>
                            <div className="text-sm text-gray-500">Listing Date</div>
                            <div className="text-base">{selectedStockDetails.info.listingDate || selectedStockDetails.metadata?.listingDate || 'N/A'}</div>
                          </div>
                          {selectedStockDetails.info.isFNOSec !== undefined && (
                            <div>
                              <div className="text-sm text-gray-500">F&O Eligible</div>
                              <div className="text-base">{selectedStockDetails.info.isFNOSec ? 'Yes' : 'No'}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="p-6">
              {reportLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating Analysis Report...</p>
                    <p className="text-sm text-gray-500 mt-2">Creating a detailed PDF report for {selectedStock.symbol}.</p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing {selectedStock.symbol}...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments as we evaluate the stock performance.</p>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysisResult ? (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                          Analysis for {selectedStock.symbol} - {selectedStockDetails.info?.companyName || selectedStock.companyName || selectedStock.symbol}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Comprehensive evaluation of financial performance, market position, and investment recommendation
                        </p>
                      </div>
                      
                      <div className="p-6">
                        {/* Visual Summary Box */}
                        {(extractedRating !== null || extractedRecommendation !== null) && (
                          <div className="analysis-summary mb-6">
                            <div className="analysis-summary-title">Analysis Summary</div>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              {extractedRating !== null && (
                                <div className="mb-4 md:mb-0">
                                  <div className="text-sm text-gray-600 mb-1 font-medium">Rating</div>
                                  <StarRating rating={extractedRating} />
                                </div>
                              )}
                              {extractedRecommendation !== null && (
                                <div>
                                  <div className="text-sm text-gray-600 mb-1 font-medium">Recommendation</div>
                                  <RecommendationStatus recommendation={extractedRecommendation} />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="prose max-w-none markdown-content">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Add custom components for better styling
                              h3: ({node, ...props}) => {
                                const text = props.children?.toString() || '';
                                let className = '';
                                
                                if (text.includes('Overview')) className = 'section-overview';
                                else if (text.includes('Financial Performance')) className = 'section-financial';
                                else if (text.includes('Market Position')) className = 'section-market';
                                else if (text.includes('News and Events')) className = 'section-news';
                                else if (text.includes('Verdict')) className = 'section-verdict';
                                else if (text.includes('Decision')) className = 'section-decision';
                                
                                return <h3 className={className} {...props} />;
                              },
                              strong: ({node, ...props}) => {
                                const text = props.children?.toString() || '';
                                if (text.includes('Rating:')) {
                                  return <strong className="rating-value" {...props} />;
                                }
                                return <strong {...props} />;
                              },
                              p: ({node, ...props}) => {
                                const text = props.children?.toString() || '';
                                
                                // For paragraphs that contain the Rating with star/10 format
                                if (text.includes('Rating:') && text.includes('/10')) {
                                  const rating = text.match(/Rating:\s*(\d+)\/10/i);
                                  const numberRating = rating ? parseInt(rating[1], 10) : null;
                                  
                                  if (numberRating !== null) {
                                    // Extract the text before and after the rating
                                    const [beforeRating, afterRating] = text.split(/Rating:\s*\d+\/10/i);
                                    
                                    return (
                                      <div className="my-4">
                                        {beforeRating && <p>{beforeRating}</p>}
                                        <div className="my-2">
                                          <StarRating rating={numberRating} />
                                        </div>
                                        {afterRating && <p>{afterRating}</p>}
                                      </div>
                                    );
                                  }
                                }
                                
                                // For recommendations in the decision section
                                if (text.includes('Recommendation:')) {
                                  return <p className="recommendation-paragraph" {...props} />;
                                }
                                
                                // For paragraphs in decision section that contain "not invest", "invest", etc.
                                if (text.includes('Decision:') || (extractedRecommendation && text.includes(extractedRecommendation))) {
                                  const recommendation = extractedRecommendation;
                                  if (recommendation && text.includes(recommendation)) {
                                    return (
                                      <div className="my-4">
                                        <p>{text.replace(`**${recommendation}**`, '')}</p>
                                        <div className="my-2">
                                          <RecommendationStatus recommendation={recommendation} />
                                        </div>
                                      </div>
                                    );
                                  }
                                }
                                
                                return <p {...props} />;
                              }
                            }}
                          >
                            {analysisResult}
                          </ReactMarkdown>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
                          {reportUrl ? (
                            <a 
                              href={reportUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              Download PDF Report
                            </a>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReport();
                              }}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Generate PDF Report
                            </button>
                          )}
                          <button
                            onClick={() => handleAnalysis(selectedStock.symbol)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh Analysis
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
                      <p className="text-gray-500 mb-6">Click the button below to generate an analysis for {selectedStock.symbol}</p>
                      <button
                        onClick={() => handleAnalysis(selectedStock.symbol)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Generate Analysis
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar with buttons */}
        <div className="w-60 bg-gray-50 p-6 flex flex-col space-y-5 border-l border-gray-200">
          <div className="text-xl font-semibold text-gray-800 mb-2">Actions</div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBuySubmit(e);
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition-colors duration-300 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Buy Stock
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('analysis');
              if (!analysisResult) {
                handleAnalysis(selectedStock.symbol);
              }
            }}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-md transition-colors duration-300 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Analyse and Recommend
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReport();
            }}
            disabled={reportLoading}
            className={`w-full ${reportLoading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} text-white py-3 px-4 rounded-md transition-colors duration-300 flex items-center justify-center`}
          >
            {reportLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                </svg>
                Generate Report
              </>
            )}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-lg font-semibold text-gray-800 mb-4">Place Order</div>
            <div className="space-y-4">
              <div>
                <label htmlFor="shares" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  id="shares"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={buyFormData.shares}
                  onChange={handleInputChange}
                  min="1"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-lg font-medium">₹{selectedStockDetails.priceInfo?.lastPrice.toFixed(2)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-xl font-bold text-blue-600">
                  ₹{((selectedStockDetails.priceInfo?.lastPrice || 0) * buyFormData.shares).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StockDetails; 