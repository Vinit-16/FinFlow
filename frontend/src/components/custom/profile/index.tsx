"use client"

import { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle,
  Target,
  BookUser
} from 'lucide-react';
import TopLoadingBar from 'react-top-loading-bar';

import {GoalsTab} from '@/components/ui/GoalsTab';
import {RiskToleranceTab} from '@/components/ui/RiskToleranceTab';
import {IncomeTab} from '@/components/ui/IncomeTab';
import {ExpensesTab} from '@/components/ui/ExpensesTab';
import {AssetsTab} from '@/components/ui/AssetsTab';

type TabType = 'goals' | 'risk' | 'income' | 'expenses' | 'assets';

const MyData = () => {
  const [activeTab, setActiveTab] = useState<TabType>('goals');
  const [progress, setProgress] = useState(0);

  const tabs = [
    { 
      id: 'goals' as TabType, 
      label: 'Goals', 
      icon: Target,
      activeColor: 'text-emerald-600',
      hoverColor: 'hover:text-emerald-500'
    },
    { 
      id: 'risk' as TabType, 
      label: 'Risk Tolerance', 
      icon: AlertTriangle,
      activeColor: 'text-yellow-600',
      hoverColor: 'hover:text-yellow-500'
    },
    { 
      id: 'income' as TabType, 
      label: 'Income', 
      icon: TrendingUp,
      activeColor: 'text-indigo-600',
      hoverColor: 'hover:text-indigo-500'
    },
    { 
      id: 'expenses' as TabType, 
      label: 'Expenses', 
      icon: TrendingDown,
      activeColor: 'text-red-600',
      hoverColor: 'hover:text-red-500'
    },
    { 
      id: 'assets' as TabType, 
      label: 'Assets', 
      icon: Wallet,
      activeColor: 'text-emerald-600',
      hoverColor: 'hover:text-emerald-500'
    },
  ];

  useEffect(() => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const newProgress = ((currentIndex + 1) / tabs.length) * 100;
    setProgress(newProgress);
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'goals':
        return <GoalsTab />;
      case 'risk':
        return <RiskToleranceTab />;
      case 'income':
        return <IncomeTab />;
      case 'expenses':
        return <ExpensesTab />;
      case 'assets':
        return <AssetsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <TopLoadingBar
        progress={progress}
        color="#4f46e5"
        height={4}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex space-x-1 rounded-xl bg-blue-100 p-1 mb-8 border border-blue-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? `bg-white ${tab.activeColor} shadow-sm border border-blue-200`
                    : `text-gray-600 ${tab.hoverColor} hover:bg-blue-50`
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? tab.activeColor : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MyData;



// "use client";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { TrendingUp, Goal, User, Save } from "lucide-react";

// export default function ProfilePage() {
//   const [activeTab, setActiveTab] = useState<"financial" | "risk" | "profile">("financial");
//   const [userId, setUserId] = useState<string>("");
//   const [token, setToken] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (!storedToken) {
//       router.push("/login");
//       return;
//     }
//     setToken(storedToken);
//     try {
//       const decoded = JSON.parse(atob(storedToken.split(".")[1]));
//       setUserId(decoded.userId);
//     } catch (error) {
//       console.error("Error decoding token:", error);
//       router.push("/login");
//     }
//   }, [router]);

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       {/* Tabs Navigation */}
//       <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
//         <TabButton
//           active={activeTab === "financial"}
//           onClick={() => setActiveTab("financial")}
//           icon={<Goal size={18} />}
//           label="Financial Goals"
//         />
//         <TabButton
//           active={activeTab === "risk"}
//           onClick={() => setActiveTab("risk")}
//           icon={<TrendingUp size={18} />}
//           label="Risk Tolerance"
//         />
//         <TabButton
//           active={activeTab === "profile"}
//           onClick={() => setActiveTab("profile")}
//           icon={<User size={18} />}
//           label="Profile Info"
//         />
//       </div>

//       {/* Tab Content */}
//       {activeTab === "financial" && <FinancialGoalsTab userId={userId} token={token} />}
//       {activeTab === "risk" && <RiskToleranceTab userId={userId} token={token} />}
//       {activeTab === "profile" && <ProfileInfoTab userId={userId} token={token} />}
//     </div>
//   );
// }

// const TabButton = ({ active, onClick, icon, label }) => (
//   <button
//     onClick={onClick}
//     className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
//       active
//         ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
//         : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
//     }`}
//   >
//     {icon}
//     <span className="font-medium">{label}</span>
//   </button>
// );

// const FinancialGoalsTab = ({ userId, token }) => {
//   const [financialGoals, setFinancialGoals] = useState<string[]>([]);
//   const [investmentHorizon, setInvestmentHorizon] = useState("");
//   const [updateMessage, setUpdateMessage] = useState("");

//   useEffect(() => {
//     axios
//       .get(`http://localhost:8000/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
//       .then((response) => {
//         setFinancialGoals(response.data.financialGoals || []);
//         setInvestmentHorizon(response.data.investmentHorizon || "");
//       })
//       .catch((error) => console.error("Error fetching data:", error));
//   }, [userId, token]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(
//         `http://localhost:8000/api/users/${userId}`,
//         { financialGoals, investmentHorizon },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setUpdateMessage("Financial goals updated successfully!");
//       setTimeout(() => setUpdateMessage(""), 3000);
//     } catch (error) {
//       setUpdateMessage("Error updating financial goals");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="space-y-4">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//           Financial Goals
//         </label>
//         <textarea
//           value={financialGoals.join(", ")}
//           onChange={(e) => setFinancialGoals(e.target.value.split(", "))}
//           className="w-full p-2 border border-gray-300 rounded-lg"
//           placeholder="Enter your financial goals"
//         />
//       </div>
//       <div className="space-y-4">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//           Investment Horizon
//         </label>
//         <select
//           value={investmentHorizon}
//           onChange={(e) => setInvestmentHorizon(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         >
//           <option value="">Select Investment Horizon</option>
//           <option value="Short-term (<3 years)">Short-term (3 years)</option>
//           <option value="Medium (3-7 years)">Medium (3-7 years)</option>
//           <option value="Long-term (7+ years)">Long-term (7+ years)</option>
//         </select>
//       </div>
//       <button
//         type="submit"
//         className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
//       >
//         <Save size={18} />
//         Save Financial Goals
//       </button>
//       {updateMessage && <p className="text-green-500">{updateMessage}</p>}
//     </form>
//   );
// };

// const RiskToleranceTab = ({ userId, token }) => {
//   const [riskTolerance, setRiskTolerance] = useState(3);
//   const [reactionToMarketFluctuations, setReactionToMarketFluctuations] = useState("");
//   const [assetAllocationPreference, setAssetAllocationPreference] = useState("");
//   const [updateMessage, setUpdateMessage] = useState("");

//   useEffect(() => {
//     axios
//       .get(`http://localhost:8000/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
//       .then((response) => {
//         setRiskTolerance(response.data.riskTolerance || 3);
//         setReactionToMarketFluctuations(response.data.reactionToMarketFluctuations || "");
//         setAssetAllocationPreference(response.data.assetAllocationPreference || "");
//       })
//       .catch((error) => console.error("Error fetching risk data:", error));
//   }, [userId, token]);

//   const handleUpdate = async () => {
//     try {
//       await axios.put(
//         `http://localhost:8000/api/users/${userId}`,
//         { riskTolerance, reactionToMarketFluctuations, assetAllocationPreference },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setUpdateMessage("Risk profile updated successfully!");
//     } catch (error) {
//       setUpdateMessage("Error updating risk profile");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="space-y-4">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//           Risk Tolerance (1-10)
//         </label>
//         <input
//           type="number"
//           min="1"
//           max="10"
//           value={riskTolerance}
//           onChange={(e) => setRiskTolerance(Number(e.target.value))}
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         />
//       </div>
//       <div className="space-y-4">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//           Reaction to Market Fluctuations
//         </label>
//         <select
//           value={reactionToMarketFluctuations}
//           onChange={(e) => setReactionToMarketFluctuations(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         >
//           <option value="">Select Reaction</option>
//           <option value="Sell everything">Sell everything</option>
//           <option value="Hold">Hold</option>
//           <option value="Buy more">Buy more</option>
//         </select>
//       </div>
//       <div className="space-y-4">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//           Asset Allocation Preference
//         </label>
//         <select
//           value={assetAllocationPreference}
//           onChange={(e) => setAssetAllocationPreference(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         >
//           <option value="">Select Preference</option>
//           <option value="High return, high risk">High return, high risk</option>
//           <option value="Balanced">Balanced</option>
//           <option value="Safe and steady">Safe and steady</option>
//         </select>
//       </div>
//       <button
//         onClick={handleUpdate}
//         className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
//       >
//         <Save size={18} />
//         Update Risk Profile
//       </button>
//       {updateMessage && <p className="text-green-500">{updateMessage}</p>}
//     </div>
//   );
// };

// const ProfileInfoTab = ({ userId, token }) => {
//   const [profileData, setProfileData] = useState({
//     age: "",
//     occupation: "",
//     annualIncome: "",
//     maritalStatus: "",
//     numberOfDependents: "",
//   });
//   const [updateMessage, setUpdateMessage] = useState("");

//   useEffect(() => {
//     axios
//       .get(`http://localhost:8000/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
//       .then((response) => setProfileData(response.data))
//       .catch((error) => console.error("Error fetching profile data:", error));
//   }, [userId, token]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(`http://localhost:8000/api/users/${userId}`, profileData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUpdateMessage("Profile updated successfully!");
//     } catch (error) {
//       setUpdateMessage("Error updating profile");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="space-y-4">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
//         <input
//           type="number"
//           value={profileData.age}
//           onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         />
//       </div>
//       <div className="space-y-4">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Occupation</label>
//         <input
//           type="text"
//           value={profileData.occupation}
//           onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         />
//       </div>
//       <div className="space-y-4">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Annual Income</label>
//         <input
//           type="number"
//           value={profileData.annualIncome}
//           onChange={(e) => setProfileData({ ...profileData, annualIncome: e.target.value })}
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         />
//       </div>
//       <button
//         type="submit"
//         className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
//       >
//         <Save size={18} />
//         Save Profile
//       </button>
//       {updateMessage && <p className="text-green-500">{updateMessage}</p>}
//     </form>
//   );
// };