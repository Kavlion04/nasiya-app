import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MoreVertical,
  Calendar,
  Home,
  User,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatUZCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import axios from "axios";
import dayjs from "dayjs";

const API_URL = "https://nasiya.takedaservice.uz/api";

interface PhoneNumber {
  id: string;
  phone_number: string;
}

interface Debtor {
  id: string;
  full_name: string;
  address: string;
  description: string;
  store: string;
  phone_numbers: PhoneNumber[];
  total_debt?: number;
}

interface Debt {
  id: string;
  debt_date: string;
  debt_time: string;
  debt_period: string;
  debt_sum: string;
  description: string;
}

const DebtorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [debtor, setDebtor] = useState<any>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchDebts = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/debts`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          skip: 0,
          take: 100,
          debtor_id: id,
        },
      });
      setDebts(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching debts:", error);
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Nasiyalarni yuklashda xatolik yuz berdi",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_URL}/debtor/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setDebtor(response.data.data);
        await fetchDebts();
      } catch (error) {
        console.error("Error fetching debtor:", error);
        toast({
          variant: "destructive",
          title: "Xato",
          description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleDebtClick = (debtId: string) => {
    navigate(`/debts/${debtId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!debtor) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Qarzdor topilmadi</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">{debtor.full_name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleFavorite}>
            <Star
              size={20}
              fill={isFavorite ? "#FFC107" : "none"}
              color={isFavorite ? "#FFC107" : "currentColor"}
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Tahrirlash</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="bg-blue-100 rounded-xl p-4 mb-4">
          <div className="text-sm text-gray-600">Umumiy nasiya:</div>
          <div className="text-xl font-semibold">
            {formatUZCurrency(
              debts.reduce((sum, debt) => sum + Number(debt.debt_sum), 0)
            )}{" "}
            so'm
          </div>
        </div>

        <div>
          <h2 className="text-base font-medium mb-3">Nasiyalar</h2>
          <div className="space-y-3">
            {debts.map((debt) => (
              <div
                key={debt.id}
                onClick={() => handleDebtClick(debt.id)}
                className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">
                      {dayjs(debt.debt_date).format("DD.MM.YYYY")}
                    </div>
                    <div className="text-sm text-gray-500">
                      Muddat: {debt.debt_period}
                    </div>
                    {debt.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {debt.description}
                      </div>
                    )}
                  </div>
                  <div className="text-blue-600 font-medium">
                    {formatUZCurrency(Number(debt.debt_sum))} so'm
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/debtors/${id}/add-debt`)}
        className="fixed bottom-40 right-20 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"
      >
        <Plus size={20} />
        <span>Qo'shish</span>
      </button>

      {isMobile && (
        <div className="grid grid-cols-4 border-t border-gray-200 bg-white mt-16">
          <Link
            to="/"
            className="flex flex-col items-center py-3 text-gray-500"
          >
            <Home size={20} />
            <span className="text-xs mt-1">Asosiy</span>
          </Link>
          <Link
            to="/debtors"
            className="flex flex-col items-center py-3 text-blue-500"
          >
            <User size={20} />
            <span className="text-xs mt-1">Qarzdorlar</span>
          </Link>
          <Link
            to="/calendar"
            className="flex flex-col items-center py-3 text-gray-500"
          >
            <Calendar size={20} />
            <span className="text-xs mt-1">Kalendar</span>
          </Link>
          <Link
            to="/settings"
            className="flex flex-col items-center py-3 text-gray-500"
          >
            <Settings size={20} />
            <span className="text-xs mt-1">Sozlamalar</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DebtorDetail;
