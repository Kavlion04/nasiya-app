import { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryMedium,
  BatteryLow,
  BatteryCharging,
} from 'lucide-react';
import { useNetwork } from '@/context/NetworkContext';

const StatusBar = () => {
  const { isOnline } = useNetwork();
  const [time, setTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  // Soatni yangilab turish
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Real batareya darajasini olish va zaryad holatini tekshirish
  useEffect(() => {
    const getBatteryInfo = async () => {
      const nav: any = navigator as any;

      if ('getBattery' in nav) {
        const battery = await nav.getBattery();

        const updateBatteryInfo = () => {
          setBatteryLevel(Math.floor(battery.level * 100));
          setIsCharging(battery.charging);
        };

        updateBatteryInfo();
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);

        return () => {
          battery.removeEventListener('levelchange', updateBatteryInfo);
          battery.removeEventListener('chargingchange', updateBatteryInfo);
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
          {isCharging ? (
            <BatteryCharging size={18} className="text-app-green" />
          ) : batteryLevel > 80 ? (
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
