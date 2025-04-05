import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
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
  debt_date: string;
  debt_period: number;
  debt_sum: number;
  description: string;
}

const AddDebt = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DebtFormData>({
    debt_date: format(new Date(), "yyyy-MM-dd"),
    debt_period: 12,
    debt_sum: 0,
    description: "",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      // Create debt
      const debtResponse = await axios.post(
        `${API_URL}/debts`,
        {
          ...formData,
          debtor: id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Upload images if any
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((image) => {
          formData.append("images", image);
        });

        await axios.post(
          `${API_URL}/debts/${debtResponse.data.id}/images`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      toast({
        title: "Muvaffaqiyatli",
        description: "Nasiya qo'shildi",
      });
      navigate(-1);
    } catch (error) {
      console.error("Error adding debt:", error);
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Nasiya qo'shishda xatolik yuz berdi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);

    // Create preview URLs
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...newImageUrls]);
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
            <DropdownMenuItem className="cursor-pointer text-red-500">
              O'chirish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <label className="block text-sm text-gray-500">Sana</label>
            <Input
              type="date"
              value={formData.debt_date}
              onChange={(e) => handleInputChange("debt_date", e.target.value)}
              required
            />
          </div>
          <div className="bg-white rounded-lg p-4">
            <label className="block text-sm text-gray-500">Soat</label>
            <Input type="time" value={format(new Date(), "HH:mm")} disabled />
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
            onChange={(e) =>
              handleInputChange("debt_sum", parseFloat(e.target.value))
            }
            min={0}
            placeholder="5 845 000"
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
              <img
                key={index}
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
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
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-lg"
          disabled={isLoading}
        >
          Nasiyani so'ndirish
        </Button>
      </form>
    </div>
  );
};

export default AddDebt;
