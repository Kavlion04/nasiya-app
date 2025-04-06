import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import dayjs from "dayjs";

const API_URL = "https://nasiya.takedaservice.uz/api";

interface ImagePreview {
  file: File;
  preview: string;
  url?: string;
}

interface DebtFormData {
  next_payment_date: string;
  debt_period: number;
  debt_sum: string;
  total_debt_sum: string;
  description: string;
}

const AddDebt = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<DebtFormData>({
    next_payment_date: dayjs().format("YYYY-MM-DD"),
    debt_period: 1,
    debt_sum: "",
    total_debt_sum: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.debt_sum) {
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Nasiya summasini kiriting",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Kamida bitta rasm yuklang",
      });
      return;
    }

    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      // Create debt with image URLs
      const response = await axios.post(
        `${API_URL}/debts`,
        {
          next_payment_date: formData.next_payment_date,
          debt_period: formData.debt_period,
          debt_sum: formData.debt_sum,
          total_debt_sum: formData.total_debt_sum || formData.debt_sum,
          description: formData.description || "string",
          images: [
            {
              image:
                "https://static.vecteezy.com/vite/assets/photo-masthead-375-BoK_p8LG.webp",
            },
            {
              image:
                "https://static.vecteezy.com/vite/assets/photo-masthead-375-BoK_p8LG.webp",
            },
          ],
          debtor: id,
          debt_status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        toast({
          title: "Muvaffaqiyatli",
          description: "Nasiya muvaffaqiyatli qo'shildi",
        });
        navigate(`/debtors/${id}`);
      }
    } catch (error: any) {
      console.error("Error creating debt:", error);
      toast({
        variant: "destructive",
        title: "Xato",
        description:
          error.response?.data?.message ||
          error.message ||
          "Nasiyani qo'shib bo'lmadi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = async (index: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.dataset.index = index.toString();
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = parseInt(e.target.dataset.index || "0");

    if (file) {
      try {
        const preview = URL.createObjectURL(file);
        setSelectedImages((prev) => {
          const newImages = [...prev];
          newImages[index] = {
            file,
            preview,
          };
          return newImages;
        });

        toast({
          title: "Muvaffaqiyatli",
          description: "Rasm qo'shildi",
        });
      } catch (error: any) {
        console.error("Error handling image:", error);
        toast({
          variant: "destructive",
          title: "Xato",
          description: "Rasmni qayta ishlashda xatolik yuz berdi",
        });
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      if (newImages[index]?.preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      delete newImages[index];
      return [...newImages];
    });
  };

  const handleSetToday = () => {
    setFormData((prev) => ({
      ...prev,
      next_payment_date: dayjs().format("YYYY-MM-DD"),
    }));
  };

  const renderImageUpload = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Rasm biriktirish</label>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1].map((index) => (
          <div key={index} className="relative">
            {selectedImages[index] ? (
              <div className="relative border rounded-md overflow-hidden bg-gray-50">
                <img
                  src={selectedImages[index].preview}
                  alt={`Selected ${index + 1}`}
                  className="w-full h-[120px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white text-gray-600 rounded-full"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Rasm {index + 1}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleImageSelect(index)}
                className="border rounded-md h-[120px] w-full flex flex-col items-center justify-center gap-1 bg-gray-50"
              >
                <ImageIcon size={24} className="text-gray-400" />
                <span className="text-xs text-gray-500">Rasm {index + 1}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 bg-white border-b">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-medium">Nasiya yaratish</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Summa miqdori <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.debt_sum}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  debt_sum: e.target.value.replace(/\D/g, ""),
                  total_debt_sum: e.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder="5845000"
              required
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Sana</label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={formData.next_payment_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    next_payment_date: e.target.value,
                  }))
                }
                className="bg-gray-50 flex-1"
              />
              <Button
                type="button"
                onClick={handleSetToday}
                variant="outline"
                className="whitespace-nowrap"
              >
                Bugun
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Muddat</label>
            <select
              value={formData.debt_period}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  debt_period: parseInt(e.target.value),
                }))
              }
              className="w-full bg-gray-50 border rounded-md px-3 py-2"
            >
              <option value={1}>1 oy</option>
              <option value={2}>2 oy</option>
              <option value={3}>3 oy</option>
              <option value={4}>4 oy</option>
              <option value={5}>5 oy</option>
              <option value={6}>6 oy</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Elatma</label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Elatma qo'shish..."
              className="bg-gray-50"
            />
          </div>

          {renderImageUpload()}
        </div>
      </div>

      <div className="p-4">
        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? "Yuklanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default AddDebt;
