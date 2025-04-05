import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { format } from "date-fns";

const API_URL = "https://nasiya.takedaservice.uz/api";

interface DebtFormData {
  debt_period: number;
  debt_sum: string;
  description: string;
  debt_time: string;
}

const DebtDetail = () => {
  const { debtorId, debtId } = useParams<{
    debtorId: string;
    debtId: string;
  }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DebtFormData>({
    debt_period: 12,
    debt_sum: "0",
    description: "",
    debt_time: format(new Date(), "HH:mm"),
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    const fetchDebt = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_URL}/debts/${debtId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const debtData = response.data.data;
        const debtDate = new Date(debtData.debt_date);

        setDate(format(debtDate, "yyyy-MM-dd"));
        setFormData({
          debt_period: debtData.debt_period,
          debt_sum: debtData.debt_sum.toString(),
          description: debtData.description || "",
          debt_time: format(debtDate, "HH:mm"),
        });

        if (debtData.images && debtData.images.length > 0) {
          setImageUrls(debtData.images);
        }
      } catch (error) {
        console.error("Error fetching debt:", error);
        toast({
          variant: "destructive",
          title: "Xato",
          description: "Ma'lumotlarni yuklab bo'lmadi",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebt();
  }, [debtId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedImages.length + imageUrls.length < 1) {
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Kamida 1 ta rasm kiritish kerak",
      });
      return;
    }

    if (selectedImages.length + imageUrls.length > 2) {
      toast({
        variant: "destructive",
        title: "Xato",
        description: "2 tadan ortiq rasm kiritib bo'lmaydi",
      });
      return;
    }

    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      // Update debt
      await axios.put(
        `${API_URL}/debts/${debtId}`,
        {
          ...formData,
          debt_sum: parseFloat(formData.debt_sum).toFixed(2),
          debtor: debtorId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Upload new images if any
      if (selectedImages.length > 0) {
        const formDataImages = new FormData();
        selectedImages.forEach((image) => {
          formDataImages.append("image", image);
        });

        await axios.post(`${API_URL}/images-of-debts`, formDataImages, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      toast({
        title: "Muvaffaqiyatli",
        description: "Nasiya ma'lumotlari yangilandi",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating debt:", error);
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Nasiya ma'lumotlarini yangilab bo'lmadi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + selectedImages.length + imageUrls.length > 2) {
      toast({
        variant: "destructive",
        title: "Xato",
        description: "2 tadan ortiq rasm kiritib bo'lmaydi",
      });
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);

    // Create preview URLs
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...newImageUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    field: keyof DebtFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-blue"></div>
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
          <h1 className="text-xl font-semibold">Batafsil</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              Tahrirlash
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-500">
              O'chirish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="flex-1 p-4 space-y-4 overflow-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <label className="block text-sm text-gray-500">Sana</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="bg-white rounded-lg p-4">
              <label className="block text-sm text-gray-500">Soat</label>
              <Input
                type="time"
                value={formData.debt_time}
                onChange={(e) => handleInputChange("debt_time", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <label className="block text-sm text-gray-500">Muddat</label>
            <Input
              type="number"
              value={formData.debt_period}
              onChange={(e) =>
                handleInputChange("debt_period", parseInt(e.target.value))
              }
              min={1}
              placeholder="12 oy"
              required
            />
          </div>

          <div className="bg-white rounded-lg p-4">
            <label className="block text-sm text-gray-500">Summa miqdori</label>
            <Input
              type="number"
              value={formData.debt_sum}
              onChange={(e) => handleInputChange("debt_sum", e.target.value)}
              min={0}
              step="0.01"
              placeholder="5845000.00"
              required
            />
            <span className="text-sm text-gray-500 mt-1">so'm</span>
          </div>

          <div className="bg-white rounded-lg p-4">
            <label className="block text-sm text-gray-500">Elatma</label>
            <Input
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Iphone 14 Pro, boshlangi'ch to'lovi bor"
            />
          </div>

          <div className="bg-white rounded-lg p-4">
            <label className="block text-sm text-gray-500 mb-2">
              Rasm biriktirish
            </label>
            <div className="grid grid-cols-2 gap-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            {imageUrls.length < 2 && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="mt-2 block w-full py-2 text-center text-blue-600 cursor-pointer"
                >
                  + Rasm qo'shish
                </label>
              </>
            )}
          </div>

          <div className="flex justify-end gap-4 sticky bottom-0 bg-gray-50 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white"
              disabled={isLoading}
            >
              Saqlash
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex-1 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-500">Sana</div>
              <div className="font-medium">
                {format(new Date(date), "dd.MM.yyyy")}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-500">Soat</div>
              <div className="font-medium">{formData.debt_time}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Muddat</div>
            <div className="font-medium">{formData.debt_period} oy</div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Summa miqdori</div>
            <div className="font-medium">
              {parseFloat(formData.debt_sum).toLocaleString()} so'm
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Elatma</div>
            <div className="font-medium">{formData.description}</div>
          </div>

          {imageUrls.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-2">Rasmlar</div>
              <div className="grid grid-cols-2 gap-2">
                {imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => setIsEditing(true)}
            className="w-full bg-blue-600 text-white py-4 rounded-lg"
          >
            Tahrirlash
          </Button>
        </div>
      )}
    </div>
  );
};

export default DebtDetail;
