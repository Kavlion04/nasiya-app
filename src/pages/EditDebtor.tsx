import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL = "https://nasiya.takedaservice.uz/api";

interface DebtorFormData {
  full_name: string;
  address: string;
  description: string;
  store: string;
  phone_numbers: string[];
}

const EditDebtor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<DebtorFormData>({
    full_name: "",
    address: "",
    description: "",
    store: "",
    phone_numbers: [""],
  });

  useEffect(() => {
    const fetchDebtor = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_URL}/debtor/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const debtorData = response.data.data;
        setFormData({
          full_name: debtorData.full_name,
          address: debtorData.address,
          description: debtorData.description,
          store: debtorData.store,
          phone_numbers:
            debtorData.phone_numbers.length > 0
              ? debtorData.phone_numbers
              : [""],
        });
      } catch (error) {
        console.error("Error fetching debtor:", error);
        toast({
          variant: "destructive",
          title: "Xato",
          description: "Mijoz ma'lumotlarini yuklab bo'lmadi",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebtor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone numbers
    const isValidPhoneNumbers = formData.phone_numbers.every((phone) =>
      phone.match(/^\+998[0-9]{9}$/)
    );

    if (!isValidPhoneNumbers) {
      toast({
        variant: "destructive",
        title: "Xato",
        description:
          "Telefon raqam(lar) noto'g'ri formatda. Format: +998XXXXXXXXX",
      });
      return;
    }

    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      const dataToSend = {
        ...formData,
        phone_numbers: formData.phone_numbers.filter(
          (phone) => phone.trim() !== ""
        ),
      };

      await axios.put(`${API_URL}/debtor/${id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast({
        title: "Muvaffaqiyatli",
        description: "Mijoz ma'lumotlari yangilandi",
      });
      navigate(`/debtors/${id}`);
    } catch (error) {
      console.error("Error updating debtor:", error);
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Mijoz ma'lumotlarini yangilab bo'lmadi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof DebtorFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      phone_numbers: prev.phone_numbers.map((phone, i) =>
        i === index ? value : phone
      ),
    }));
  };

  const addPhoneNumber = () => {
    setFormData((prev) => ({
      ...prev,
      phone_numbers: [...prev.phone_numbers, ""],
    }));
  };

  const removePhoneNumber = (index: number) => {
    if (formData.phone_numbers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        phone_numbers: prev.phone_numbers.filter((_, i) => i !== index),
      }));
    }
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
      <div className="p-4 bg-white border-b flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold">Mijozni tahrirlash</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 p-4 space-y-4 overflow-auto"
      >
        <div className="bg-white rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">To'liq ism</label>
            <Input
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder="To'liq ismni kiriting"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Manzil</label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Manzilni kiriting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Do'kon</label>
            <Input
              value={formData.store}
              onChange={(e) => handleInputChange("store", e.target.value)}
              placeholder="Do'kon nomini kiriting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Izoh</label>
            <Input
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Izoh kiriting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Telefon raqamlar
            </label>
            {formData.phone_numbers.map((phone, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={phone}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  placeholder="+998XXXXXXXXX"
                  className="flex-1"
                  pattern="^\+998[0-9]{9}$"
                  title="Format: +998XXXXXXXXX"
                />
                {formData.phone_numbers.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removePhoneNumber(index)}
                  >
                    O'chirish
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addPhoneNumber}
              className="w-full"
            >
              + Telefon raqam qo'shish
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isLoading}>
            Saqlash
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditDebtor;
