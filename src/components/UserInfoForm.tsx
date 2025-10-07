import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppUserInfo } from '@/app/page';

type UserInfoFormProps = {
  onSubmit: (userInfo: AppUserInfo) => void;
};

export default function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [nickname, setNickname] = useState('');
  const [birthYear, setBirthYear] = useState(2000);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [region, setRegion] = useState('Hồ Chí Minh');

  const regions = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh'];

  const handleSubmit = () => {
    if (nickname.trim() && gender && birthYear >= 1950 && birthYear <= 2010 && region) {
      onSubmit({ nickname, birthYear, gender, region });
    } else {
      alert('Vui lòng điền đầy đủ thông tin!');
    }
  };

  const decreaseYear = () => {
    if (birthYear > 1950) setBirthYear(birthYear - 1);
  };

  const increaseYear = () => {
    if (birthYear < 2010) setBirthYear(birthYear + 1);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Giới tính của bạn là...
        </h2>

        <div className="mb-8">
          <div className="flex justify-center gap-4 mb-8"> 
            <button
              onClick={() => setGender('female')}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all flex-1 ${
                gender === 'female'
                  ? 'bg-gradient-to-br from-pink-400 to-pink-500 text-white scale-110 shadow-lg'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              <div className="text-4xl mb-2">👗</div>  
              <span className="text-xs font-medium">Nữ</span>
            </button>

            <button
              onClick={() => setGender('male')}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all flex-1 ${
                gender === 'male'
                  ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white scale-110 shadow-lg'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              <div className="text-4xl mb-2">👔</div>
              <span className="text-xs font-medium">Nam</span>
            </button>

            <button  
              onClick={() => setGender(null)}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all flex-1 ${
                gender === null
                  ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white scale-110 shadow-lg'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              <div className="text-4xl mb-2">🤷</div>
              <span className="text-xs font-medium">Khác</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-center text-gray-700 font-medium mb-3">
            Tên bạn là...
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nhập nickname"
            className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-center text-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block text-center text-gray-700 font-medium mb-1">
            Bạn sinh năm nào?
          </label>
          <p className="text-center text-sm text-gray-500 mb-3">
            Để tui tìm người phù hợp theo lứa tuổi của bạn
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={decreaseYear}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-4xl font-bold text-gray-800 w-32 text-center">
              {birthYear}
            </span>
            <button
              onClick={increaseYear}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-center text-gray-700 font-medium mb-1">
            Bạn ở tỉnh/thành phố nào?
          </label>
          <p className="text-center text-sm text-gray-500 mb-3">
            Để tui tìm người gần khu vực của bạn
          </p>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-center text-xl font-semibold text-gray-800 bg-transparent cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!nickname.trim() || !gender || birthYear < 1950 || birthYear > 2010 || !region}
          className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Ok
        </button>
      </div>
    </div>
  );
}