import { Price } from "@/types/price";

export const pricingData: Price[] = [
  {
    id: "price_finflow_basic",
    unit_amount: 15 * 100, // $15.00
    nickname: "Starter",
    offers: [
      "Track up to 5 Connections (Stocks, Funds, Crypto)",
      "Real-time Portfolio Updates",
      "Basic Performance Analytics",
      "Email Support for all the customer to have good user experience",
    ],
  },
  {
    id: "price_finflow_premium",
    unit_amount: 35 * 100, // $35.00
    nickname: "Growth",
    offers: [
      "Track up to 25 Connections (Stocks, Funds, Crypto)",
      "Real-time Portfolio Updates",
      "Advanced Performance Analytics",
      "Automated Portfolio Rebalancing (Basic Rules)",
    ],
  },
  {
    id: "price_finflow_business",
    unit_amount: 79 * 100, // $79.00
    nickname: "Pro",
    offers: [
      "Unlimited Connections (Stocks, Funds, Crypto)",
      "Real-time Portfolio Updates",
      "Comprehensive Performance Analytics",
      "Advanced Automated Portfolio Rebalancing (Custom Rules)",
    ],
  },
];