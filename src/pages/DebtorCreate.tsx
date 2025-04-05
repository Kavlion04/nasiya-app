import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Star, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface ImagePreview {
  file: File;
  preview: string;
  url?: string;
}

const DebtorCreate = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DebtorFormData>({
    full_name: "",
    address: "",
    description: "",
    store: "string",
    phone_numbers: [""],
  });
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone numbers
    const validPhoneNumbers = formData.phone_numbers.filter(
      (phone) => phone.trim() !== ""
    );
    if (validPhoneNumbers.length === 0) {
      toast({
        variant: "destructive",
        title: "Xato",
        description: "Kamida bitta telefon raqam kiritish kerak",
      });
      return;
    }

    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      // Format phone numbers to match API requirements
      const formattedPhoneNumbers = validPhoneNumbers.map((phone) => {
        const cleanPhone = phone.replace(/\s+/g, "");
        return cleanPhone.startsWith("+998") ? cleanPhone : `+998${cleanPhone}`;
      });

      const response = await axios.post(
        `${API_URL}/debtor`,
        {
          full_name: formData.full_name,
          address: formData.address,
          description: formData.description || "",
          store: formData.store || "string",
          phone_numbers: formattedPhoneNumbers,
          images: selectedImages.map(() => ({
            image: "https://nasiya.takedaservice.uz/api/images-of-debtors/1",
          })),
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
          description: "Qarzdor muvaffaqiyatli qo'shildi",
        });
        navigate("/debtors");
      }
    } catch (error: any) {
      console.error("Error creating debtor:", error);
      toast({
        variant: "destructive",
        title: "Xato",
        description:
          error.response?.data?.error?.message || "Qarzdorni qo'shib bo'lmadi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...formData.phone_numbers];
    // Remove any non-digit characters except +
    const cleanValue = value.replace(/[^\d+]/g, "");
    newPhoneNumbers[index] = cleanValue;
    setFormData((prev) => ({
      ...prev,
      phone_numbers: newPhoneNumbers,
    }));
  };

  const addPhoneNumber = () => {
    if (formData.phone_numbers.length < 2) {
      setFormData((prev) => ({
        ...prev,
        phone_numbers: [...prev.phone_numbers, ""],
      }));
    }
  };

  const removePhoneNumber = (index: number) => {
    if (formData.phone_numbers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        phone_numbers: prev.phone_numbers.filter((_, i) => i !== index),
      }));
    }
  };

  const handleImageSelect = async (index: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input
      fileInputRef.current.dataset.index = index.toString();
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = parseInt(e.target.dataset.index || "0");

    if (file) {
      try {
        // Create preview immediately
        const preview = URL.createObjectURL(file);

        // Update UI immediately with preview and set dummy URL
        setSelectedImages((prev) => {
          const newImages = [...prev];
          newImages[index] = {
            file,
            preview,
            url: "https://nasiya.takedaservice.uz/api/images-of-debtors/1",
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

  const renderStep1 = () => (
    <>
      <div className="p-4 bg-white border-b">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-medium">Mijoz yaratish</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Ismi <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="Test Testov"
              required
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Telefon raqami <span className="text-red-500">*</span>
            </label>
            {formData.phone_numbers.map((phone, index) => (
              <div key={index} className="mb-2">
                <Input
                  value={phone}
                  onChange={(e) =>
                    handlePhoneNumberChange(index, e.target.value)
                  }
                  placeholder="+998 91 123 45 67"
                  required
                  className="bg-gray-50"
                />
              </div>
            ))}
            {formData.phone_numbers.length < 2 && (
              <button
                onClick={addPhoneNumber}
                className="text-blue-500 text-sm flex items-center"
              >
                <span>+ Ko'proq qo'shish</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Yashash manzili</label>
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Yashnabod, Kadisheva b. 53, 56-uy"
              className="bg-gray-50"
            />
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
              placeholder="Affiristarga qoldi kunim"
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
          Saqlash
        </Button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setStep(1)} className="mr-4">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold">Mijoz yaratish</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-auto flex-1">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Ismi <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.full_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, full_name: e.target.value }))
            }
            placeholder="Ismini kiriting"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Telefon raqami <span className="text-red-500">*</span>
          </label>
          {formData.phone_numbers.map((phone, index) => (
            <div key={index} className="mb-2">
              <Input value={phone} readOnly />
            </div>
          ))}
          <button
            onClick={addPhoneNumber}
            className="text-blue-500 text-sm flex items-center"
          >
            <span>+ Koʻproq qoʻshish</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Yashash manzili</label>
          <Input value={formData.address} readOnly />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Eslatma</label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Affiristarqa qoldi kunim"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Rasm biriktirish</label>
          <div className="grid grid-cols-3 gap-2">
            <div className="relative border rounded-md overflow-hidden">
              <img
                src="/lovable-uploads/950fd513-dc59-456f-bcfd-926765877e8e.png"
                alt="Document 1"
                className="w-full h-20 object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs p-1">
                2 zamin
              </div>
            </div>
            <div className="relative border rounded-md overflow-hidden">
              <img
                src="/lovable-uploads/21b28884-3664-4379-b27f-a9f28f6a0bb6.png"
                alt="Document 2"
                className="w-full h-20 object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs p-1">
                2 guvohnoma
              </div>
            </div>
            <div className="relative border rounded-md overflow-hidden">
              <img
                src="/lovable-uploads/35503fc4-ca7f-490a-af7c-6ca1d29d7431.png"
                alt="Document 3"
                className="w-full h-20 object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs p-1">
                2 shartnoma
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <Button onClick={handleSubmit} className="w-full py-6">
          Saqlash
        </Button>
      </div>
    </>
  );

  const renderStep3 = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-8">
        <svg
          width="42"
          height="32"
          viewBox="0 0 42 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.25 25.2812L3.9375 14.9688L0 18.9062L14.25 33.1562L42 5.40625L38.0625 1.46875L14.25 25.2812Z"
            fill="white"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-blue-500 mb-4">Ajoyib!</h1>
      <p className="text-gray-600 mb-8">Muvaffaqiyatli so'ndirildi</p>
      <Button onClick={() => navigate("/debtors")} className="w-full py-6">
        Ortga
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default DebtorCreate;
