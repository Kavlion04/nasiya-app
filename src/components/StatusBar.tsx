import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Battery, BatteryMedium, BatteryLow } from 'lucide-react';
import { useNetwork } from '@/context/NetworkContext';

const StatusBar = () => {
  const { isOnline } = useNetwork();
  const [time, setTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);

  // Soatni yangilab turish
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Real batareya darajasini olish
  useEffect(() => {
    const getBatteryInfo = async () => {
      const nav: any = navigator as any;

      if ('getBattery' in nav) {
        const battery = await nav.getBattery();

        const updateBatteryLevel = () => {
          setBatteryLevel(Math.floor(battery.level * 100));
        };

        updateBatteryLevel(); 
        battery.addEventListener('levelchange', updateBatteryLevel);

        return () => {
          battery.removeEventListener('levelchange', updateBatteryLevel);
        };
      }
    };

    getBatteryInfo();
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="status-bar">
      <div className="text-sm font-semibold">{formattedTime}</div>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi size={16} className="text-app-blue" />
        ) : (
          <WifiOff size={16} className="text-app-gray" />
        )}

        <div className="flex items-center gap-1">
          {batteryLevel > 80 ? (
            <Battery size={18} className="text-app-green" />
          ) : batteryLevel > 30 ? (
            <BatteryMedium size={18} className="text-app-green" />
          ) : (
            <BatteryLow size={18} className="text-app-red" />
          )}
          <span className="text-xs">{batteryLevel}%</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
