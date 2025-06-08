import { useState, useEffect } from 'react';
import { TrendingUp, ShieldAlert, BarChart } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface RiskLevel {
  value: number;
  label: string;
  description: string;
  color: string;
  icon: JSX.Element;
  strategy: string[];
}

const riskLevels: RiskLevel[] = [
  {
    value: 1,
    label: 'Conservative',
    description: 'Focus on preserving capital with minimal risk tolerance',
    color: 'bg-blue-500',
    icon: <ShieldAlert className="h-6 w-6 text-blue-500" />,
    strategy: [
      'Majority in bonds and fixed-income securities',
      'High-quality, investment-grade investments',
      'Capital preservation is the primary goal',
      'Suitable for short-term financial goals'
    ]
  },
  {
    value: 2,
    label: 'Moderately Conservative',
    description: 'Emphasis on stability with some growth potential',
    color: 'bg-cyan-500',
    icon: <ShieldAlert className="h-6 w-6 text-cyan-500" />,
    strategy: [
      'Mix of bonds and some stocks (60/40)',
      'Focus on blue-chip stocks',
      'Regular income generation',
      'Balance between growth and security'
    ]
  },
  {
    value: 3,
    label: 'Moderate',
    description: 'Balanced approach between growth and security',
    color: 'bg-green-500',
    icon: <BarChart className="h-6 w-6 text-green-500" />,
    strategy: [
      'Equal mix of stocks and bonds',
      'Diversified portfolio across sectors',
      'Moderate growth with reasonable risk',
      'Medium to long-term investment horizon'
    ]
  },
  {
    value: 4,
    label: 'Moderately Aggressive',
    description: 'Higher risk tolerance for potentially greater returns',
    color: 'bg-orange-500',
    icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
    strategy: [
      'Higher allocation to stocks (70-80%)',
      'Some exposure to international markets',
      'Acceptance of market volatility',
      'Long-term growth focus'
    ]
  },
  {
    value: 5,
    label: 'Aggressive',
    description: 'Maximum growth potential with highest risk tolerance',
    color: 'bg-red-500',
    icon: <TrendingUp className="h-6 w-6 text-red-500" />,
    strategy: [
      'Predominantly stocks and growth investments',
      'Global market exposure',
      'Comfortable with significant volatility',
      'Very long-term investment horizon'
    ]
  }
];

export const RiskToleranceTab = () => {
  const [userId, setUserId] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const [selectedRisk, setSelectedRisk] = useState<number>(3);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
    const fetchRiskProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const backendRisk = response.data.riskTolerance || 6;
        setSelectedRisk(Math.round(backendRisk / 2));
      } catch (error) {
        console.error('Error fetching risk profile:', error);
      }
    };

    if (userId && token) {
      fetchRiskProfile();
    }
  }, [userId, token]);

  const handleUpdateRisk = async () => {
    if (!token) return;

    setIsUpdating(true);
    setUpdateMessage('');

    try {
      await axios.put(
        `http://localhost:8000/api/users/${userId}`,
        { riskTolerance: selectedRisk * 2 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUpdateMessage('Risk profile updated successfully!');
    } catch (error) {
      console.error('Error updating risk profile:', error);
      setUpdateMessage('Failed to update risk profile');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const currentRiskLevel = riskLevels.find(level => level.value === selectedRisk)!;

  return (
    <div className="bg-blue-50 rounded-lg shadow-sm p-6 space-y-8 border border-blue-100">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Risk Tolerance Profile</h2>
        <p className="mt-2 text-gray-600">
          Adjust your risk tolerance level to match your investment goals and comfort with market volatility.
        </p>
      </div>

      {/* Risk Slider */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Conservative</span>
          <span className="text-sm font-medium text-gray-600">Aggressive</span>
        </div>
      
        {/* Custom 5-Point Slider */}
        <div className="relative">
          {/* Slider Track */}
          <div className="h-2 bg-blue-100 rounded-full">
            <div 
              className="absolute h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((selectedRisk - 1) / 4) * 100}%`,
                background: `linear-gradient(to right, ${riskLevels.slice(0, selectedRisk).map(level => level.color.replace('bg-', '')).join(', ')})`
              }}
            />
          </div>

          {/* Slider Points */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1">
            {riskLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedRisk(level.value)}
                className={`w-4 h-4 rounded-full transition-all duration-300 -ml-2 first:ml-0 last:ml-0 ${
                  selectedRisk >= level.value 
                    ? level.color + ' ring-4 ring-opacity-30 ' + level.color.replace('bg-', 'ring-')
                    : 'bg-blue-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Selected Risk Level Label */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200">
            {currentRiskLevel.icon}
            <span className="font-semibold text-gray-800">
              {currentRiskLevel.label}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Level Details */}
      <div className="mt-8 p-6 bg-white rounded-xl border border-blue-200">
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Profile Description
            </h3>
            <p className="text-gray-600">
              {currentRiskLevel.description}
            </p>
          </div>

          {/* Investment Strategy */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Recommended Investment Strategy
            </h3>
            <div className="grid gap-3">
              {currentRiskLevel.strategy.map((point, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${currentRiskLevel.color}`} />
                  <p className="text-gray-600">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Update button and message */}
      <div className="flex justify-end mt-6 items-center gap-4">
        {updateMessage && (
          <span className={`text-sm ${
            updateMessage.includes('success') ? 'text-green-500' : 'text-red-500'
          }`}>
            {updateMessage}
          </span>
        )}
        
        <button
          onClick={handleUpdateRisk}
          disabled={isUpdating}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white 
            hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all"
        >
          {isUpdating ? 'Updating...' : 'Update Risk Profile'}
        </button>
      </div>
    </div>
  );
};