import { useState } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { ArrowLeft } from "lucide-react";

const Complaint = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.warning("Iltimos, xabar yozing!", { position: "top-right" });
      return;
    }
    if (message.length > 500) {
      toast.warning("Xabar 500 ta belgidan oshmasligi kerak!", { position: "top-right" });
      return;
    }
    localStorage.setItem("complaintMessage", message);

    toast.success("Xabaringiz yuborildi!", { position: "top-right" });

    setMessage(""); 
  };

  return (
    <div className="p-4">
      <Toaster position="top-right" richColors expand={true} />

      <div className="flex items-center mb-4">
        <Link to="/settings" className="mr-4 text-gray-600 text-lg"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-semibold">Taklif va shikoyatlar</h1>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold">Odatda bu yerga kamdan-kam kelishadi 😊</h2>
        <p className="text-gray-600">
          Dastur haqida taklif yoki shikoyatlaringiz bo‘lsa, bizga yozing. 
          Albatta, sizning fikringiz biz uchun juda muhim.
        </p>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium">Taklif va shikoyat</label>
        <textarea
          className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={5}
          placeholder="Xabar yozing..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
      >
        Yuborish
      </button>
    </div>
  );
};

export default Complaint;
