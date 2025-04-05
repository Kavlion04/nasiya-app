import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Search,
  User,
  Star,
  Plus,
  Home,
  CalendarDays,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatUZCurrency } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";

const API_URL = "https://nasiya.takedaservice.uz/api";

interface PhoneNumber {
  id: string;
  phone_number: string;
}

interface Client {
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

const Clients = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [clientDebts, setClientDebts] = useState<{ [key: string]: Debt[] }>({});
  const navigate = useNavigate();

  const { data: clientsData, isLoading: isClientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${API_URL}/debtor`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching clients:", error);
        return { data: [] };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  useEffect(() => {
    const fetchAllDebts = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${API_URL}/debts`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            skip: 0,
            take: 1000, // Adjust this number based on your needs
          },
        });

        // Group debts by debtor ID
        const debtsMap: { [key: string]: Debt[] } = {};
        response.data.data.forEach((debt: Debt) => {
          if (!debtsMap[debt.debtor]) {
            debtsMap[debt.debtor] = [];
          }
          debtsMap[debt.debtor].push(debt);
        });
        setClientDebts(debtsMap);
      } catch (error) {
        console.error("Error fetching debts:", error);
        toast({
          variant: "destructive",
          title: "Xato",
          description: "Nasiyalarni yuklab bo'lmadi",
        });
      }
    };

    fetchAllDebts();
  }, []);

  const sortedClients = useMemo(() => {
    const clientsList: Client[] = Array.isArray(clientsData?.data)
      ? clientsData.data
      : [];

    const clientsWithDebts = clientsList.map((client) => {
      const clientDebtsList = clientDebts[client.id] || [];
      const totalDebt = clientDebtsList.reduce((sum, debt) => {
        const paidAmount = debt.paid_sum || 0;
        return sum + (debt.debt_sum - paidAmount);
      }, 0);

      return {
        ...client,
        total_debt: totalDebt,
      };
    });

    const filteredClients = clientsWithDebts.filter((client) =>
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filteredClients].sort((a, b) => {
      if (favoriteIds.has(a.id) && !favoriteIds.has(b.id)) return -1;
      if (!favoriteIds.has(a.id) && favoriteIds.has(b.id)) return 1;
      return (b.total_debt || 0) - (a.total_debt || 0);
    });
  }, [clientsData?.data, clientDebts, favoriteIds, searchQuery]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setFavoriteIds((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  return (
    <div
      className={`flex flex-col h-full bg-gray-50 ${
        !isMobile ? "w-full max-w-none" : ""
      }`}
    >
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Qidirish"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-72"
          />
        </div>
        <Button
          onClick={() => navigate("/debtors/create")}
          className="bg-blue-600 text-white"
        >
          + Nasiya qo'shish
        </Button>
      </div>

      <div className={`flex-1 p-4 overflow-auto ${!isMobile ? "px-8" : ""}`}>
        {isClientsLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-blue"></div>
          </div>
        ) : sortedClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Hech qanday natija topilmadi
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Boshqa parametrlar bilan qidirishni sinab ko'ring
            </p>
            <Button
              onClick={() => setSearchQuery("")}
              variant="outline"
              className="px-6"
            >
              Barcha mijozlarni ko'rish
            </Button>
          </div>
        ) : (
          <div className={`space-y-4 ${!isMobile ? "" : ""}`}>
            {sortedClients.map((client, index) => {
              const clientDebtsList = clientDebts[client.id] || [];
              const activeDebtsCount = clientDebtsList.length;

              return (
                <Link
                  to={`/debtors/${client.id}`}
                  key={client.id || index}
                  className="block"
                >
                  <div
                    className="glass-card p-4 animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <User size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{client.full_name}</h3>
                            <button
                              onClick={(e) => toggleFavorite(client.id, e)}
                              className="ml-2"
                            >
                              <Star
                                size={16}
                                fill={
                                  favoriteIds.has(client.id)
                                    ? "#FFC107"
                                    : "none"
                                }
                                color={
                                  favoriteIds.has(client.id)
                                    ? "#FFC107"
                                    : "currentColor"
                                }
                              />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 font-bold">
                            {client.store}
                          </p>
                          {client.phone_numbers[0] && (
                            <p className="text-sm text-blue-600">
                              {client.phone_numbers[0].phone_number}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Nasiya: {formatUZCurrency(client.total_debt || 0)}{" "}
                            so'm
                          </p>
                          {client.total_debt > 0 && (
                            <p className="text-sm text-purple-600 font-medium mt-1">
                              To'lanmagan: {formatUZCurrency(client.total_debt)}{" "}
                              so'm
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="sticky bottom-20 left-40">
        <Link
          to="/debtors/add"
          className="w-48 h-14 bg-app-blue rounded-full flex items-center justify-center text-white shadow-lg"
        >
          <Plus size={24} />
          <p>Qarzdor qo'shish</p>
        </Link>
      </div>

      <div className="grid grid-cols-4 mb-10 border-t border-gray-200 bg-white">
        <Link to="/" className="flex flex-col items-center py-3 text-gray-500">
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
          <CalendarDays size={20} />
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
    </div>
  );
};

export default Clients;
