import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Camera, Phone, Mail, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: 'Amirbek',
    phone: '+998 91 801 77 15',
    email: 'kavlion06@gmail.com',
    avatar: null ,
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (storedUser) {
      setUserData(storedUser);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem('userData', JSON.stringify(userData));
    alert("Ma'lumotlar saqlandi!");
  };

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserData((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
        localStorage.setItem('userData', JSON.stringify({ ...userData, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white">
        <div className="flex items-center">
          <Link to="/settings" className="mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold">Shaxsiy ma'lumotlar</h1>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="flex flex-col items-center justify-center my-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {userData.avatar ? (
                <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-500" />
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 w-8 h-8 bg-app-blue rounded-full flex items-center justify-center text-white shadow-sm"
              onClick={() => fileInputRef.current.click()}
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            className="text-lg font-bold text-center border-b-2 focus:outline-none"
          />
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 mb-1">Telefon raqami</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  className="border-b focus:outline-none"
                />
              </div>
              <CheckCircle2 size={16} className="text-app-green" />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 mb-1">Email</div>
            <div className="flex items-center">
              <Mail size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="border-b focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button type="button" onClick={handleSave} className="button-primary mt-8">
          Ma'lumotlarni saqlash
        </button>
      </div>
    </div>
  );
};

export default Profile;
