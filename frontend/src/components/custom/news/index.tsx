"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Clock,
  ExternalLink,
  Search,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

const categories = [
  "All",
  "Markets",
  "Economy",
  "Corporate",
  "Policy",
  "Stocks",
  "Cryptocurrency",
];

const MoneyPulse = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- UPDATED fetchNews Function ---
  const fetchNews = async (category: string) => {
    setLoading(true);
    setError(""); // Clear previous errors
    setNews([]); // Clear previous news while loading new category

    // Define generic error message for the user
    const GENERIC_ERROR_MESSAGE = "Could not load news at this time. Please try again later.";

    try {
      const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
      if (!apiKey) {
        // Log specific error for developer, throw generic
        console.error("Configuration Error: GNews API key is not configured.");
        throw new Error("API key missing"); // Throw simple error to be caught
      }

      const searchTerm =
        category === "All"
          ? "indian finance"
          : `indian ${category.toLowerCase()}`;
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(
          searchTerm
        )}&lang=en&country=in&max=12&apikey=${apiKey}`
      );

      // Check for network/HTTP errors (4xx, 5xx)
      if (!response.ok) {
         const errorText = await response.text();
         // Log specific error for developer
         console.error("API HTTP Error:", response.status, response.statusText, errorText);
         // Throw simple error to be caught
         throw new Error(`HTTP status ${response.status}`);
      }

      const data = await response.json();

      // Check for errors within the API's JSON response
      if (data.errors) {
        // Log specific error for developer
        console.error("GNews API Error Response:", data.errors);
         // Throw simple error to be caught
        throw new Error("API returned errors");
      }

      // Success: Set news data
      setNews(data.articles || []);

    } catch (err: unknown) {
       // Log the actual caught error (could be from fetch, JSON parsing, or our thrown errors)
       console.error("Detailed error during fetchNews:", err);

       // Set the generic error message for the UI
       setError(GENERIC_ERROR_MESSAGE);

       // Ensure news is cleared on error
       setNews([]);
    } finally {
      setLoading(false);
    }
  };
  // --- END of UPDATED fetchNews Function ---


  useEffect(() => {
    fetchNews(selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const filteredNews = news.filter(
    (article) =>
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) {
        return "Just now";
        } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago`;
        } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
        } else if (diffInDays === 1) {
         return "1 day ago";
        } else {
        return `${diffInDays} days ago`;
        }
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid date";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cyan-100 to-emerald-100 py-10"> {/* Adjusted gradient colors */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Money Pulse</h1>
            <p className="text-lg text-gray-600">
              Your daily digest of Indian financial news and market insights.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4   ">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search news articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition duration-150 ease-in-out"
              />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto justify-center md:justify-end">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                      setSelectedCategory(category);
                      setSearchQuery('');
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap border ${
                    selectedCategory === category
                      ? "bg-indigo-100 text-indigo-700 border-indigo-300 shadow-sm"
                      : "text-gray-700 bg-white border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
              <span className="ml-3 text-lg text-gray-700">Loading news...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16 px-4">
              {/* Displaying the generic error message from the state */}
              <p className="text-red-700 bg-red-100 p-4 rounded-lg border border-red-300 shadow-sm">
                {error}
              </p>
            </div>
          )}

          {/* News Grid */}
          {!loading && !error && filteredNews.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((article, index) => (
                <motion.div
                  key={article.url || index}
                  className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200/80 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {article.image ? (
                    <div className="aspect-w-16 aspect-h-9 relative">
                       <img
                        src={article.image}
                        alt={article.title || "News article image"}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                                target.style.display = 'none';
                                if (!parent.querySelector('.img-placeholder')) {
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'img-placeholder absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-xs';
                                    placeholder.innerText = 'Image unavailable';
                                    parent.appendChild(placeholder);
                                }
                            }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image Available</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center space-x-3 text-xs text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      <div className="flex items-center min-w-0">
                        <Globe className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate" title={article.source.name}>{article.source.name || 'Unknown Source'}</span>
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 leading-snug">
                      {article.title || "Untitled Article"}
                    </h2>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-grow">
                      {article.description || "No description available."}
                    </p>
                    <div className="mt-auto pt-2">
                        <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                        Read full article <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* No Results State */}
          {!loading && !error && filteredNews.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">
                No news articles found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoneyPulse;