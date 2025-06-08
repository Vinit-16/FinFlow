"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Home, Briefcase, GraduationCap, Heart, Target, ChevronRight, Plus, Trash2, X, Edit2, Clock } from 'lucide-react';

const financialGoalOptions = [
  { value: 'Retirement', label: 'Retirement', icon: Briefcase },
  { value: 'Child’s Education', label: 'Education', icon: GraduationCap },
  { value: 'Marriage', label: 'Marriage', icon: Heart },
  { value: 'House Purchase', label: 'House', icon: Home },
  { value: 'Wealth Building', label: 'Wealth', icon: Target },
  { value: 'Other', label: 'Other', icon: Target }
];

const investmentHorizonOptions = [
  { value: 'Short-term (less than 3 years)', label: 'Short-term (less than 3 years)' },
  { value: 'Medium (3-7 years)', label: 'Medium (3-7 years)' },
  { value: 'Long-term (7+ years)', label: 'Long-term (7+ years)' }
];

interface lProps {
  userId: string;
  token: string | null;
}

export const GoalsTab = () => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [investmentHorizon, setInvestmentHorizon] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [userId, setUserId] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/dashboard");
      return;
    }
    setToken(storedToken);
    try {
      const decoded = JSON.parse(atob(storedToken.split(".")[1]));
      setUserId(decoded.userId);
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (!token || !userId) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSelectedGoals(response.data.financialGoals || []);
        setInvestmentHorizon(response.data.investmentHorizon || '');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId, token]);

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await axios.put(
        `http://localhost:8000/api/users/${userId}`,
        {
          financialGoals: selectedGoals,
          investmentHorizon
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUpdateMessage('Profile updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      setUpdateMessage('Error updating profile');
      console.error('Update error:', error);
    }
  };

  const fillDemoData = () => {
    setSelectedGoals(['Retirement', 'House Purchase']);
    setInvestmentHorizon('Medium (3-7 years)');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Financial Planning</h2>
            <p className="mt-2 text-blue-100">Configure your financial objectives and investment horizon</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fillDemoData}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Load Demo Profile
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goals Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Select Financial Goals</h3>
          <div className="grid grid-cols-2 gap-4">
            {financialGoalOptions.map((goal) => {
              const isSelected = selectedGoals.includes(goal.value);
              const Icon = goal.icon;
              
              return (
                <motion.button
                  key={goal.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleGoalToggle(goal.value)}
                  className={`p-4 rounded-xl flex items-center space-x-3 transition-all ${
                    isSelected 
                      ? 'bg-blue-100 ring-2 ring-blue-400' 
                      : 'bg-blue-50 hover:bg-blue-100 border border-blue-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                    {goal.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Investment Horizon */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Investment Horizon</h3>
          <div className="space-y-4">
            <select
              value={investmentHorizon}
              onChange={(e) => setInvestmentHorizon(e.target.value)}
              className="w-full p-3 bg-blue-50 text-gray-800 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Investment Horizon</option>
              {investmentHorizonOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {investmentHorizon || 'Select an investment horizon to see strategy recommendations'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
        <div className="flex justify-between items-center">
          {updateMessage && (
            <div className={`text-sm ${
              updateMessage.includes('Error') ? 'text-red-500' : 'text-green-500'
            }`}>
              {updateMessage}
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            Update Profile
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};