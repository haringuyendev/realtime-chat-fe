import { MessageCircle } from 'lucide-react';

type WelcomeScreenProps = {
  onStart: () => void;
};

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="text-center">
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl">
            <MessageCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 opacity-20 animate-ping"></div>
        </div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent" style={{ fontFamily: 'cursive' }}>
          Người Lạ Ơi!
        </h1>

        <p className="text-gray-600 mb-8 text-lg">Cài gì đây?</p>

        <button
          onClick={onStart}
          className="px-12 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Thử Xem Nào
        </button>

        <div className="mt-12 flex items-center justify-center gap-4">
          <button className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center text-white text-xl hover:bg-pink-600 transition-colors">
            🇻🇳
          </button>
          <button className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-xl hover:bg-gray-300 transition-colors">
            🇬🇧
          </button>
        </div>
      </div>
    </div>
  );
}
