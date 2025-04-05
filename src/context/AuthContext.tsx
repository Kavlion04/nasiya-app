import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { loginUser } from '../services/loginApi';

type User = {
  id: string;
  username: string;
  role: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isPinAuthenticated: boolean;
  isLoading: boolean;
  pinAttempts: number;
  blockUntil: Date | null;
  login: (username: string, password: string) => Promise<boolean>;
  verifyPin: (pin: string) => boolean;
  logout: () => Promise<void>;
  resetPinAttempts: () => void;
};

const PIN = '1111'; 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [blockUntil, setBlockUntil] = useState<Date | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const userData = {
            id: '1',
            username: 'admin',
            role: 'admin',
            name: 'Admin User'
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          
          const pinVerified = sessionStorage.getItem('pinVerified');
          if (pinVerified === 'true') {
            setIsPinAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, hashed_password: string) => {
    try {
      setIsLoading(true);
      const response = await loginUser({ login: username, hashed_password: hashed_password });
      const userData = response.user;
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPin = (pin: string) => {
    if (blockUntil && new Date() < blockUntil) {
      return false;
    }

    if (blockUntil && new Date() > blockUntil) {
      setBlockUntil(null);
      setPinAttempts(0);
    }

    if (pin === PIN) {
      setIsPinAuthenticated(true);
      setPinAttempts(0);
      setBlockUntil(null);
      sessionStorage.setItem('pinVerified', 'true');
      return true;
    } else {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      
      if (newAttempts >= 8) {
        const blockTime = new Date();
        blockTime.setMinutes(blockTime.getMinutes() + 3);
        setBlockUntil(blockTime);
        toast({
          title: "Too many incorrect attempts",
          description: "Please try again after 3 minutes",
          variant: "destructive",
        });
      } else if (newAttempts >= 4) {
        const blockTime = new Date();
        blockTime.setSeconds(blockTime.getSeconds() + 30);
        setBlockUntil(blockTime);
        toast({
          title: "Too many incorrect attempts",
          description: "Please try again after 30 seconds",
          variant: "destructive",
        });
      }
      
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('pinVerified');
      setUser(null);
      setIsAuthenticated(false);
      setIsPinAuthenticated(false);
    }
  };

  const resetPinAttempts = () => {
    setPinAttempts(0);
    setBlockUntil(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isPinAuthenticated,
        isLoading,
        pinAttempts,
        blockUntil,
        login,
        verifyPin,
        logout,
        resetPinAttempts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
