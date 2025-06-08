"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Crypto {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

export default function CryptoPage() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/crypto");
        const data = await response.json();
        setCryptos(data.data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
    // Set up a refresh interval every 30 seconds
    const intervalId = setInterval(fetchCryptos, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredCryptos = cryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency with commas and 2 decimal places
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Format large numbers with abbreviations (K, M, B, T)
  const formatLargeNumber = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000000000) {
      return `$${(num / 1000000000000).toFixed(2)}T`;
    } else if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return formatCurrency(value);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Cryptocurrency Market
        </h1>
        <p className="text-gray-600">
          Real-time cryptocurrency prices and market data
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 relative"
      >
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by name or symbol"
          className="pl-10 border-blue-200 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-100"
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading cryptocurrency data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="whitespace-nowrap font-bold text-blue-800">
                    Rank
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-blue-800">
                    Name
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-blue-800">
                    Symbol
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-blue-800 text-right">
                    Price
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-blue-800 text-right">
                    24h Change
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-blue-800 text-right">
                    Market Cap
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-blue-800 text-right">
                    Volume (24h)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCryptos.slice(0, 50).map((crypto) => (
                  <TableRow
                    key={crypto.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-700">
                      {crypto.rank}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span className="text-gray-900">{crypto.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{crypto.symbol}</TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatCurrency(crypto.priceUsd)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        parseFloat(crypto.changePercent24Hr) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {parseFloat(crypto.changePercent24Hr) >= 0 ? "+" : ""}
                      {parseFloat(crypto.changePercent24Hr).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {formatLargeNumber(crypto.marketCapUsd)}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {formatLargeNumber(crypto.volumeUsd24Hr)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </div>
  );
} 