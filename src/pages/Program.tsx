import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Star, ArrowLeft } from "lucide-react";
import logo from "../assets/LOGO.svg";

const Program = () => {
  const [rating, setRating] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const handleRate = () => {
    toast.success("Rahmat baholaganingiz uchun");
    setOpen(false);
    setRating(null);
  };

  return (
    <div className="flex flex-col h-full justify-between px-6 py-10 bg-white">
      <div>
        <div className="flex items-center justify-center mb-6 relative">
          <button
            onClick={() => window.history.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <h1 className="text-center text-xl font-semibold mb-2">Dastur haqida</h1>
        </div>
        <div className="  flex items-center justify-center">
          <span><img src={logo} alt="" /></span>
        </div>


        <div className="border-t my-4" />

        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-600">Dastur versiyasi</span>
          <button className="text-blue-500 font-medium">Yangilash</button>
        </div>
      </div>

      {/* Rate Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="w-full bg-blue-500 text-white py-3 rounded-xl text-sm font-semibold">
            Dasturga baho berish
          </button>
        </DialogTrigger>
        <DialogContent className="p-6 rounded-xl text-center max-w-sm">
          <h2 className="text-lg font-semibold mb-4">Dasturga baho bering</h2>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer ${rating && rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                  }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <button
            disabled={!rating}
            onClick={handleRate}
            className="w-full bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            Baholashni yakunlash
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Program;
