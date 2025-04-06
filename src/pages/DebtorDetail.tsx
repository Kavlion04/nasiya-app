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
  debt_sum: string;
  total_debt_sum: string;
  next_payment_date: string;
  debt_period: number;
  description: string;
  debt_status: string;
  images: { image: string }[];
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
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
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg">{debtor.full_name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleFavorite}>
            <Star
              size={20}
              fill={isFavorite ? "#FFC107" : "none"}
              color={isFavorite ? "#FFC107" : "currentColor"}
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="p-1">
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-500">
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Total Debt Card */}
          <div className="bg-blue-100 rounded-xl p-4">
            <div className="text-sm text-gray-600">Umumiy nasiya:</div>
            <div className="text-xl font-semibold">
              {formatUZCurrency(
                debts.reduce((sum, debt) => sum + Number(debt.debt_sum), 0)
              )}{" "}
              so'm
            </div>
          </div>

          {/* Debts Section */}
          <div>
            <h2 className="text-base mb-3">Nasiyalar</h2>
            <div className="space-y-3">
              {debts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nasiyalar mavjud emas
                </div>
              ) : (
                debts.map((debt) => (
                  <div key={debt.id} className="bg-white rounded-xl p-4">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm text-gray-500">
                        {dayjs(debt.next_payment_date).format(
                          "MMM D, YYYY HH:mm"
                        )}
                      </div>
                      <div className="text-blue-500 font-medium">
                        {formatUZCurrency(Number(debt.debt_sum))} so'm
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      Keyingi to'lov:{" "}
                      {dayjs(debt.next_payment_date).format("DD.MM.YYYY")}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-purple-600 text-sm">
                        {formatUZCurrency(
                          Number(debt.total_debt_sum) - Number(debt.debt_sum)
                        )}{" "}
                        so'm
                      </div>
                      <div className="text-xs text-gray-500">
                        {debt.debt_status === "active" ? "Faol" : "Yopilgan"}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${
                            ((Number(debt.total_debt_sum) -
                              Number(debt.debt_sum)) /
                              Number(debt.total_debt_sum)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/debtors/${id}/add-debt`)}
        className="fixed bottom-[50px] right-0 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-lg"
      >
        <Plus size={20} />
        <span>Qo'shish</span>
      </button>

      {/* Bottom Navigation */}
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
