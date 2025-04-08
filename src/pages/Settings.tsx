import { Link } from 'react-router-dom';
import { useState } from 'react';
import { User, Home, CalendarDays, Settings as SettingsIcon, ChevronRight, UserCircle, CircleDollarSign, BellRing, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/image.svg'

const Settings = () => {
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white">
        <h1 className="text-xl font-semibold">Sozlamalar</h1>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-app-blue font-medium text-sm">Asosiy</h2>
            <Link to="/profile" className="block glass-card">
              <div className="settings-item">
                <div className="flex items-center ml-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <UserCircle size={18} className="text-app-blue" />
                  </div>
                  <span>Shaxsiy ma'lumotlar</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </Link>
            <div className="glass-card">
              <div className="settings-item">
                <div className="flex items-center ml-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CircleDollarSign size={18} className="text-green-600" />
                  </div>
                  <span>Kontraktlar</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-app-blue font-medium text-sm">Boshqa</h2>
            <div className="glass-card">
              <Link to="/program" className="block glass-card">
                <div className="settings-item">
                  <div className="flex items-center ml-3">
                    <div className="w-8 h-8 bg-app-blue rounded-full flex items-center justify-center mr-3">
                      <SettingsIcon size={18} className="text-white" />
                    </div>
                    <span>Dastur haqida</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-app-blue font-medium text-sm">Yordam</h2>
            <div className="glass-card">
              <Link to="/helpful" className="block glass-card">
                <div className="settings-item">
                  <div className="flex items-center ml-3">
                    <div className="w-8 h-8 bg-yellow-700 rounded-full flex items-center justify-center mr-3">
                      <HelpCircle size={18} className="text-white" />
                    </div>
                    <span>Yordam va ko'mak</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </Link>
              <Link to="/complaint" className="block glass-card">
                <div className="settings-item">
                  <div className="flex items-center ml-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <HelpCircle size={18} className="text-yellow-300" />
                    </div>
                    <span>Taklif va shikoyatlar</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </Link>
            </div>
          </div>

          <button
            className="w-full text-red-500 py-3 font-medium bg-white rounded-lg border border-gray-200"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="flex px-4 items-center">
              <LogOut size={18} className="mr-2" />
              <span>Chiqish</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 border-t mb-10 border-gray-200 bg-white">
        <Link to="/" className="flex flex-col items-center py-3 text-gray-500">
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
        <Link to="/settings" className="flex flex-col items-center py-3 text-app-blue">
          <SettingsIcon size={20} />
          <span className="text-xs mt-1">Sozlamalar</span>
        </Link>
      </div>

      {isModalOpen && (
        <div className="fixed  inset-0 z-50 overflow-hidden flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white absolute bottom-20 p-6 rounded-lg shadow-lg w-[500px]">
            <img className="mx-auto mb-4" src={logo} alt="" />
            <h2 className="text-lg text-center font-semibold text-black">Hisobdan chiqish</h2>
            <p className="text-gray-600 text-center mt-2">
              Siz haqiqatan hisobdan chiqmoqchimisz?
            </p>
            <div className="mt-4 flex justify-end space-x-3">

              <button
                className="px-4 py-2 text-blue-500 border border-gray-300 rounded-lg"
                onClick={handleLogout}
              >
                Ha,chiqish
              </button>
              <button
                className="px-4 py-2 bg-red-500 rounded-lg text-white"
                onClick={() => setIsModalOpen(false)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
