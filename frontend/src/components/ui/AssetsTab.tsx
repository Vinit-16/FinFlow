"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, Edit2, X, Building2, Briefcase, Car, Landmark, Coins, CreditCard } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  value: number;
  category: 'realestate' | 'investments' | 'vehicles' | 'bank' | 'cash' | 'other';
  purchaseDate?: string;
  appreciationRate?: number;
  notes?: string;
}

const categoryIcons = {
  realestate: Building2,
  investments: Briefcase,
  vehicles: Car,
  bank: Landmark,
  cash: Coins,
  other: CreditCard
};

const categoryColors = {
  realestate: 'emerald',
  investments: 'blue',
  vehicles: 'orange',
  bank: 'indigo',
  cash: 'green',
  other: 'gray'
};

export const AssetsTab = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  // Load assets from localStorage on component mount
  useEffect(() => {
    const savedAssets = localStorage.getItem('userAssets');
    if (savedAssets) {
      try {
        const parsedAssets = JSON.parse(savedAssets);
        setAssets(parsedAssets);
      } catch (error) {
        console.error('Error loading assets from localStorage:', error);
        setAssets([]);
      }
    }
  }, []);

  // Save assets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userAssets', JSON.stringify(assets));
  }, [assets]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    category: 'realestate',
    purchaseDate: '',
    appreciationRate: '',
    notes: ''
  });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      value: '',
      category: 'realestate',
      purchaseDate: '',
      appreciationRate: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (asset: Asset) => {
    setIsEditing(true);
    setSelectedAsset(asset.id);
    setFormData({
      name: asset.name,
      value: asset.value.toString(),
      category: asset.category,
      purchaseDate: asset.purchaseDate || '',
      appreciationRate: asset.appreciationRate?.toString() || '',
      notes: asset.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsset: Asset = {
      id: isEditing ? selectedAsset! : Math.random().toString(36).substr(2, 9),
      name: formData.name,
      value: parseFloat(formData.value),
      category: formData.category as Asset['category'],
      ...(formData.purchaseDate && { purchaseDate: formData.purchaseDate }),
      ...(formData.appreciationRate && { appreciationRate: parseFloat(formData.appreciationRate) }),
      ...(formData.notes && { notes: formData.notes })
    };

    if (isEditing) {
      setAssets(assets.map(asset => asset.id === selectedAsset ? newAsset : asset));
    } else {
      setAssets([...assets, newAsset]);
    }

    setIsModalOpen(false);
  };

  const fillDemoData = () => {
    const demoAssets = [
      {
        name: "3 BHK Apartment",
        value: "7500000",
        category: "realestate",
        purchaseDate: new Date().toISOString().split('T')[0],
        appreciationRate: "8",
        notes: "Prime location in city center, fully furnished"
      },
      {
        name: "Stock Portfolio",
        value: "1200000",
        category: "investments",
        purchaseDate: new Date().toISOString().split('T')[0],
        appreciationRate: "12",
        notes: "Diversified across blue-chip stocks"
      },
      {
        name: "Toyota Fortuner",
        value: "3500000",
        category: "vehicles",
        purchaseDate: new Date().toISOString().split('T')[0],
        appreciationRate: "-10",
        notes: "2022 Model, Premium Variant"
      },
      {
        name: "Fixed Deposits",
        value: "500000",
        category: "bank",
        purchaseDate: new Date().toISOString().split('T')[0],
        appreciationRate: "6.5",
        notes: "5-year term deposit"
      },
      {
        name: "Emergency Fund",
        value: "300000",
        category: "cash",
        purchaseDate: new Date().toISOString().split('T')[0],
        appreciationRate: "0",
        notes: "Liquid cash for emergencies"
      }
    ].map(asset => ({ ...asset, id: Math.random().toString(36).substr(2, 9), value: parseFloat(asset.value.toString()) }));
    setAssets(demoAssets);
    setIsModalOpen(false);
  };

  const getTotalAssetValue = () => {
    return assets.reduce((total, asset) => total + asset.value, 0);
  };

  const getCategoryTotal = (category: Asset['category']) => {
    return assets
      .filter(asset => asset.category === category)
      .reduce((total, asset) => total + asset.value, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAssetAllocation = () => {
    const total = getTotalAssetValue();
    return Object.keys(categoryIcons).map(category => ({
      category,
      percentage: ((getCategoryTotal(category as Asset['category']) / total) * 100).toFixed(1)
    }));
  };

  return (
    <div className="bg-blue-100 rounded-lg shadow-sm p-6 space-y-8 border border-blue-200">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Total Asset Value</h3>
          <div className="mt-4 flex items-baseline">
            <span className="text-3xl font-bold">{formatCurrency(getTotalAssetValue())}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-gray-600">Asset Categories</h4>
            <p className="mt-2 text-2xl font-semibold text-gray-800">
              {new Set(assets.map(a => a.category)).size}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-gray-600">Total Assets</h4>
            <p className="mt-2 text-2xl font-semibold text-gray-800">
              {assets.length}
            </p>
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Allocation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {getAssetAllocation().map(({ category, percentage }) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            const color = categoryColors[category as keyof typeof categoryColors];
            return (
              <div
                key={category}
                className={`p-4 rounded-xl bg-${color}-100`}
              >
                <div className={`p-2 rounded-lg bg-${color}-200 w-fit`}>
                  <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-600 capitalize">
                  {category}
                </p>
                <div className="mt-1 flex items-baseline space-x-2">
                  <p className="text-2xl font-semibold text-gray-800">
                    {percentage}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(getCategoryTotal(category as Asset['category']))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assets List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Assets List</h2>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Asset
          </button>
        </div>

        <div className="space-y-4">
          {assets.map((asset) => {
            const Icon = categoryIcons[asset.category];
            const color = categoryColors[asset.category];
            return (
              <div
                key={asset.id}
                className="bg-white border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg bg-${color}-100`}>
                      <Icon className={`h-6 w-6 text-${color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{asset.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {asset.category}
                        {asset.appreciationRate && (
                          <span className="ml-2 text-emerald-600">
                            +{asset.appreciationRate}% /year
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-gray-800">
                      {formatCurrency(asset.value)}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(asset)}
                        className="p-1 text-gray-500 hover:text-blue-500"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="p-1 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                {asset.notes && (
                  <p className="mt-2 text-sm text-gray-500">
                    {asset.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Asset' : 'Add New Asset'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 bg-white"
                >
                  {Object.keys(categoryIcons).map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Appreciation Rate % (Optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.appreciationRate}
                  onChange={(e) => setFormData({ ...formData, appreciationRate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 bg-white"
                  placeholder="e.g., 5.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 bg-white"rows={3}
                  placeholder="Add any additional information about this asset"
                  />
                  </div>
                  
                            <div className="flex justify-end space-x-4 mt-6">
                              <button
                                type="button"
                                onClick={fillDemoData}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                Demo Data
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-lg hover:from-emerald-500 hover:to-emerald-600"
                              >
                                {isEditing ? 'Save Changes' : 'Add Asset'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                  };
                  
                  