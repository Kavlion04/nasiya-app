import { Link } from "react-router-dom";
import { FaInstagram, FaTelegram, FaPhoneAlt } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const Helpful = () => {
  const phoneNumber = "+998918017715"; 

  const handlePhoneClick = () => {
    if (isMobile) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}`, "_blank");
    }
  };

  const handleInstagramClick = () => {
    const instaURL = "https://www.instagram.com/frontend_kavi"; 
    if (isMobile) {
      window.location.href = instaURL;
    } else {
      window.open(instaURL, "_blank");
    }
  };

  const handleTelegramClick = () => {
    const telegramURL = "https://t.me/frontend_kavlion"; 
    if (isMobile) {
      window.location.href = telegramURL;
    } else {
      window.open(telegramURL, "_blank");
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Link to="/settings" className="mr-4 text-gray-600 text-lg"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-semibold">Yordam</h1>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold">Biz doim siz bilan aloqadamiz</h2>
        <p className="text-gray-600 text-lg">
          Har qanday savollarga javob beramiz, buyurtma bilan yordam beramiz, istaklarni tinglaymiz.
        </p>
      </div>

      <div className="flex align-center gap-[70px]">
        <div className="flex flex-col items-center cursor-pointer" onClick={handleInstagramClick}>
          <FaInstagram size={50} className="text-pink-500" />
          <span className="mt-2 text-sm">Instagram</span>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={handleTelegramClick}>
          <FaTelegram size={50} className="text-blue-500" />
          <span className="mt-2 text-sm">Telegram</span>
        </div>

        
        <div className="flex flex-col items-center cursor-pointer" onClick={handlePhoneClick}>
          <FaPhoneAlt size={50} className="text-green-500" />
          <span className="mt-2 text-sm">Aloqa uchun</span>
        </div>
      </div>
    </div>
  );
};

export default Helpful;
