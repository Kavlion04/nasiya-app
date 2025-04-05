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
  debt_period: number;
  debt_sum: number;
  description: string;
  debtor: string;
  paid_sum?: number;
}

const DebtorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [debtor, setDebtor] = useState<Debtor | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchDebtorAndDebts = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem("accessToken");

        // Fetch debtor details
        const debtorResponse = await axios.get(`${API_URL}/debtor/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Fetch debts for this debtor
        const debtsResponse = await axios.get(`${API_URL}/debts`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            skip: 0,
            take: 100,
            debtor_id: id,
          },
        });

        const debtorData = debtorResponse.data.data;
        const allDebts = debtsResponse.data.data;

        // No need to filter since API already returns filtered debts
        // Filter debts for this debtor
        const debtorDebts = allDebts.filter((debt: Debt) => debt.debtor === id);

        // Calculate total debt
        const totalDebt = debtorDebts.reduce((sum: number, debt: Debt) => {
          const paidAmount = debt.paid_sum || 0;
          return sum + (debt.debt_sum - paidAmount);
        }, 0);

        setDebtor({
          ...debtorData,
          total_debt: totalDebt,
        });
        setDebts(debtorDebts);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Xato",
          description: "Ma'lumotlarni yuklab bo'lmadi",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebtorAndDebts();
  }, [id]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-blue"></div>
      </div>
    );
  }

  if (!debtor) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-xl font-medium mb-4">Mijoz topilmadi</div>
        <Button onClick={() => navigate("/debtors")}>Barcha mijozlar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">{debtor.full_name}</h1>
        </div>
        <div className="flex items-center">
          <button onClick={toggleFavorite} className="mr-2">
            <Star
              size={20}
              fill={isFavorite ? "#FFC107" : "none"}
              color={isFavorite ? "#FFC107" : "currentColor"}
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <Star className="mr-2 h-4 w-4" />
                <span>Sevimlilarga qo'shish</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate(`/debtors/${id}/edit`)}
              >
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-500">
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-auto flex-1 p-4 space-y-4">
        <div className="flex space-x-2">
          <div
            className={`flex-1 rounded-lg ${
              debtor.total_debt ? "bg-blue-100" : "bg-white"
            } p-4`}
          >
            <div className="text-sm text-gray-500">Umumiy nasiya:</div>
            <div
              className={`text-xl font-bold ${
                debtor.total_debt ? "text-blue-700" : ""
              }`}
            >
              {formatUZCurrency(debtor.total_debt || 0)} so'm
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg p-4">
            <div
              className="text-sm text-center cursor-pointer"
              onClick={() => navigate(`/debtors/${id}/edit`)}
            >
              Tahrirlash
            </div>
            <div className="text-center cursor-pointer text-red-500">
              O'chirish
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h2 className="font-medium mb-4">Faol nasiyalar</h2>
          {debts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                Hech qanday nasiya mavjud emas
              </div>
              <div className="text-sm text-gray-400">
                Nasiya yaratish uchun pastdagi "+" tugmasini bosing
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {debts.map((debt) => {
                const paidAmount = debt.paid_sum || 0;
                const progress = (paidAmount / debt.debt_sum) * 100;

                return (
                  <div
                    key={debt.id}
                    className="border-b pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                    onClick={() => navigate(`/debtors/${id}/debts/${debt.id}`)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-500">
                        {new Date(debt.debt_date).toLocaleDateString("uz-UZ")}{" "}
                        {new Date(debt.debt_date).toLocaleTimeString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="font-medium">
                        {formatUZCurrency(debt.debt_sum)} so'm
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>Muddat: {debt.debt_period} oy</span>
                    </div>

                    {debt.debt_sum > 0 && (
                      <div className="flex items-center text-sm mb-1">
                        <span className="mr-2 text-purple-600 font-medium">
                          {formatUZCurrency(paidAmount)} so'm
                        </span>
                      </div>
                    )}

                    {debt.debt_sum > 0 && (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Debt Button */}
      <div className="fixed bottom-20 right-20">
        <Link
          to={`/debtors/${id}/add-debt`}
          className="h-14 bg-app-blue rounded-full w-full p-4 flex items-center justify-center text-white shadow-lg"
        >
          <Plus size={24} />
          Nasiya qo'shish
        </Link>
      </div>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <div className="grid grid-cols-4 border-t border-gray-200 bg-white">
          <Link
            to="/"
            className="flex flex-col items-center py-3 text-gray-500"
          >
            <Home size={20} />
            <span className="text-xs mt-1">Asosiy</span>
          </Link>
          <Link
            to="/debtors"
            className="flex flex-col items-center py-3 text-app-blue"
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
