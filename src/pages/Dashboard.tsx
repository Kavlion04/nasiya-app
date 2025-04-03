import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Plus, Home, CalendarDays, Settings } from 'lucide-react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from '@/context/AuthContext';
import { stores } from '@/services/api';

interface DebtStats {
  totalDebt: number;
  monthlyDebt: number;
  remaining: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<DebtStats>({
    totalDebt: 0,
    monthlyDebt: 0,
    remaining: 0
  });

  const [profile, setProfile] = useState({
    username: 'nickname',
    avatar: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await stores.getStatistics();
        setStats({
          totalDebt: data.totalDebt || 135214000,
          monthlyDebt: data.monthlyDebt || 25,
          remaining: data.remaining || 101
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          totalDebt: 135214000,
          monthlyDebt: 25,
          remaining: 101
        });
      }
    };

    fetchStats();

    // LocalStorage'dan foydalanuvchi ma'lumotlarini olish
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (storedUser) {
      setProfile({
        username: storedUser.username || 'nickname',
        avatar: storedUser.avatar || null,
      });
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50">
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div>
              <p className="font-semibold">{profile.username}</p>
            </div>
          </div>
          <Link to={"/calendar"}>
            <div className="text-gray-400">
              <CalendarDays size={24} />
            </div>
          </Link>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="glass-card p-4 mb-6 animate-scale-in bg-[#30AF49]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Umumiy qarzdorlik</span>
            <span className="text-xs text-white bg-app-green px-2 py-1 rounded-full">Shu oy</span>
          </div>
          <div className="flex items-center">
            <div className="text-xl text-white font-bold mb-1">
              {isVisible ? formatCurrency(stats.totalDebt) : "************"}{" "}
              <span className="text-sm font-normal">so'm</span>
            </div>
            <div onClick={() => setIsVisible(!isVisible)} className="ml-10 pt-1 cursor-pointer">
              {isVisible ? (
                <FaEyeSlash size={20} className="text-white" />
              ) : (
                <FaEye size={20} className="text-white" />
              )}
            </div>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-app-green rounded-full"
              style={{ width: `${Math.min(stats.monthlyDebt / 100 * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-sm text-gray-500 mb-2">Kunlik qarzdorlik</h3>
            <div className="text-2xl text-red-600 font-semibold">{stats.monthlyDebt}</div>
          </div>
          <div className="glass-card p-4 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-sm text-gray-500 mb-2">Mijoslar soni</h3>
            <div className="text-2xl text-green-500 font-semibold">{stats.remaining}</div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-3">Hamyonimgiz</h2>

        <div className="glass-card p-4 mb-4 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Mablag'ingiz</p>
              <h3 className="text-xl font-bold">
                {stats.totalDebt > 300000 ? 300000 : formatCurrency(stats.totalDebt)} <span className="text-sm font-normal">so'm</span>
              </h3>
            </div>
            <button className="w-8 h-8 bg-app-blue rounded-full flex items-center justify-center text-white">
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 mb-10 border-t border-gray-200">
        <Link to="/" className="flex flex-col items-center py-3 text-app-blue">
          <Home size={20} />
          <span className="text-xs mt-1">Asosiy</span>
        </Link>
        <Link to="/debtors" className="flex flex-col items-center py-3 text-gray-500">
          <User size={20} />
          <span className="text-xs mt-1">Qarzdorlar</span>
        </Link>
        <Link to="/calendar" className="flex flex-col items-center py-3 text-gray-500">
          <CalendarDays size={20} />
          <span className="text-xs mt-1">Kalendar</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center py-3 text-gray-500">
          <Settings size={20} />
          <span className="text-xs mt-1">Sozlamalar</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
