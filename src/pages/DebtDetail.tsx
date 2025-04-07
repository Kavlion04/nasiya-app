import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import dayjs from "dayjs";
import { formatUZCurrency } from "@/lib/utils";

const API_URL = "https://nasiya.takedaservice.uz/api";

interface Debt {
  id: string;
  debt_date: string;
  debt_time: string;
  debt_period: number;
  debt_sum: string;
  description: string;
  images: string[];
}

const DebtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [debt, setDebt] = useState<Debt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDebt, setEditedDebt] = useState<Debt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDebtDetail = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/debts/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const debtData = response.data;
      if (debtData) {
        // Format date and time
        const date = dayjs(debtData.debt_date);
        debtData.debt_date = date.isValid()
          ? date.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD");

        const time = dayjs(debtData.debt_time, "HH:mm");
        debtData.debt_time = time.isValid()
          ? time.format("HH:mm")
          : dayjs().format("HH:mm");

        // Ensure debt_period is a number
        debtData.debt_period = Number(debtData.debt_period) || 1;

        // Format debt_sum
        debtData.debt_sum = debtData.debt_sum || "0";
      }

      setDebt(debtData);
      setEditedDebt(debtData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching debt detail:", error);
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Nasiya ma'lumotlarini yuklashda xatolik yuz berdi",
      });
    }
  };

  useEffect(() => {
    fetchDebtDetail();
  }, [id]);

  const handleSave = async () => {
    if (!editedDebt) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      const dataToSend = {
        debt_date: editedDebt.debt_date,
        debt_period: Number(editedDebt.debt_period),
        debt_sum: editedDebt.debt_sum,
        description: editedDebt.description || "",
      };

      await axios.put(`${API_URL}/debts/${id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setDebt(editedDebt);
      setIsEditing(false);
      toast({
        title: "Muvaffaqiyatli",
        description: "Nasiya ma'lumotlari yangilandi",
      });

      fetchDebtDetail();
    } catch (error: any) {
      console.error("Error updating debt:", error);
      toast({
        variant: "destructive",
        title: "Xato",
        description:
          error.response?.data?.error?.message ||
          "Nasiyani yangilashda xatolik yuz berdi",
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Nasiyani o'chirishni xohlaysizmi?")) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(`${API_URL}/debts/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast({
        title: "Muvaffaqiyatli",
        description: "Nasiya o'chirildi",
      });
      navigate(-1);
    } catch (error) {
      console.error("Error deleting debt:", error);
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Nasiyani o'chirishda xatolik yuz berdi",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl">Batafsil</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={24} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setIsEditing(true)}
              className="cursor-pointer"
            >
              Tahrirlash
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 cursor-pointer"
            >
              O'chirish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        <div className="space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Sana</div>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedDebt?.debt_date || dayjs().format("YYYY-MM-DD")}
                  onChange={(e) =>
                    setEditedDebt((prev) => ({
                      ...prev!,
                      debt_date: e.target.value,
                    }))
                  }
                />
              ) : (
                <div className="text-base">
                  {dayjs(debt?.debt_date).format("DD.MM.YYYY")}
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Soat</div>
              <div className="text-base">{debt?.debt_time}</div>
            </div>
          </div>

          {/* Period */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Muddat</div>
            {isEditing ? (
              <Select
                value={editedDebt?.debt_period?.toString()}
                onValueChange={(value) =>
                  setEditedDebt((prev) => ({
                    ...prev!,
                    debt_period: Number(value),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Oyni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month} oy
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-base">{debt?.debt_period} oy</div>
            )}
          </div>

          {/* Amount */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Summa miqdori</div>
            {isEditing ? (
              <Input
                type="number"
                value={editedDebt?.debt_sum}
                onChange={(e) =>
                  setEditedDebt((prev) => ({
                    ...prev!,
                    debt_sum: e.target.value,
                  }))
                }
              />
            ) : (
              <div className="text-base text-blue-600">
                {formatUZCurrency(Number(debt?.debt_sum))} so'm
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Eslatma</div>
            {isEditing ? (
              <Input
                value={editedDebt?.description}
                onChange={(e) =>
                  setEditedDebt((prev) => ({
                    ...prev!,
                    description: e.target.value,
                  }))
                }
              />
            ) : (
              <div className="text-base">{debt?.description || "-"}</div>
            )}
          </div>

          {/* Images */}
          {debt?.images && debt.images.length > 0 && (
            <div>
              <div className="text-sm text-gray-500 mb-2">Rasm biriktirish</div>
              <div className="grid grid-cols-2 gap-4">
                {debt.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Rasm ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!isEditing && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 mb-4"
            onClick={() => setIsEditing(true)}
          >
            Nasiyani so'ndirish
          </Button>
        )}

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex space-x-4 mt-6 mb-4">
            <Button
              onClick={() => {
                setEditedDebt(debt);
                setIsEditing(false);
              }}
              variant="outline"
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Saqlash
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtDetail;
