import { Send, MoreVertical, Phone, Video as VideoIcon, Image as ImageIcon, Mic, Film, Paperclip, X, Video } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

type Message = {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isMine: boolean;
  type?: 'text' | 'image' | 'audio' | 'video' | 'file';
  fileUrl?: string;
  fileName?: string;
};

type ChatWindowProps = {
  conversationId: string | null;
  partnerName: string;
  messages: Message[];
  status?: string;
  onSendMessage: (content: string, type?: string, file?: File) => void;
  onStartNewChat?: () => void;
  ontoggleSidebar:() => void;
};


export default function ChatWindow({
  conversationId,
  partnerName,
  messages,
  status,
  onSendMessage,
  onStartNewChat,
  ontoggleSidebar,
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    //   const recorder = new MediaRecorder(stream);
    //   setMediaRecorder(recorder);

    //   recorder.ondataavailable = (event) => {
    //     if (event.data.size > 0) setRecordedChunks((prev) => [...prev, event.data]);
    //   };

    //   recorder.onstop = () => {
    //     const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
    //     const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
    //     onSendMessage('', 'audio', audioFile);  // Gửi file audio
    //     setRecordedChunks([]);  // Reset
    //   };
    // }).catch((err) => console.error('Mic access denied:', err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && conversationId) {
      onSendMessage(messageInput, 'text');
      setMessageInput('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file && conversationId) {
      onSendMessage('', type, file);
      e.target.value = '';
    }
  };

  const handleVoiceRecord = () => {
    if (!mediaRecorder) return;
    if (isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 30000);  // Max 30s
    }
  };

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'image':
        return (
          <div>
            {message.fileUrl ? (
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Image'}
                className="w-64 h-48 object-cover rounded-lg mb-2"
                onError={(e) => {  // Fallback nếu load fail
                  console.error('Image load error:', message.fileUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-64 h-48 bg-gray-300 rounded-lg mb-2 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-500" />
              </div>
            )}
            {message.fileName && <p className="text-xs text-gray-500">{message.fileName}</p>}
          </div>
        );

      case 'video':
        return (
          <div>
            {message.fileUrl ? (
              <video
                src={message.fileUrl}
                controls
                className="w-64 h-48 object-cover rounded-lg mb-2"
                onError={(e) => {
                  console.error('Video load error:', message.fileUrl);
                  (e.target as HTMLVideoElement).style.display = 'none';
                }}
              >
                Trình duyệt không hỗ trợ video.
              </video>
            ) : (
              <div className="w-64 h-48 bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                <Film className="w-12 h-12 text-white" />
              </div>
            )}
            {message.fileName && <p className="text-xs text-gray-500">{message.fileName}</p>}
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col">
            {message.fileUrl ? (
              <audio
                src={message.fileUrl}
                controls
                className="w-full mb-2"
                onError={(e) => {
                  console.error('Audio load error:', message.fileUrl);
                  (e.target as HTMLAudioElement).style.display = 'none';
                }}
              >
                Trình duyệt không hỗ trợ audio.
              </audio>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-5 h-5 text-gray-500" />
                <div className="flex-1 bg-gray-300 rounded-full h-2 w-32 animate-pulse"></div>
                <span className="text-xs text-gray-500">0:02</span>
              </div>
            )}
            {message.fileName && <p className="text-xs text-gray-500">{message.fileName}</p>}
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
            <Paperclip className="w-5 h-5 text-gray-500" />
            {message.fileUrl ? (
              <a
                href={message.fileUrl}
                download={message.fileName}
                className="text-sm text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {message.fileName || 'File'}
              </a>
            ) : (
              <span className="text-sm text-gray-600">{message.fileName || 'File'}</span>
            )}
          </div>
        );

      default:
        return <p className="break-words">{message.content}</p>;
    }
  };

  if (!conversationId) {
    const isChatEnded = status && (status.includes('kết thúc') || status.includes('ngắt kết nối'));

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat đã kết thúc</h2>
          <p className="text-gray-600 mb-4">
            {status || 'Cuộc trò chuyện đã kết thúc.'}
          </p>
          {isChatEnded && onStartNewChat && (  // Chỉ show button nếu chat ended và có handler
            <button
              onClick={onStartNewChat}
              className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mt-4"
            >
              Tìm bạn chat mới
            </button>
          )}
          {!isChatEnded && status && <p className="text-sm text-blue-600">{status}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
            {partnerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{partnerName}</h2>
            <p className="text-xs text-green-500">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={ontoggleSidebar} className="p-2 md:hidden rounded-full hover:bg-gray-100 transition-colors" disabled={!conversationId}>
            <MoreVertical className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Bắt đầu cuộc trò chuyện của bạn</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-3xl ${message.isMine
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-200 text-gray-900 rounded-bl-md'
                    }`}
                >
                  {renderMessage(message)}
                  <p
                    className={`text-xs mt-1 ${message.isMine ? 'text-blue-100' : 'text-gray-500'
                      }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Gửi hình ảnh"
            disabled={!conversationId}
          >
            <ImageIcon className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Gửi video"
            disabled={!conversationId}
          >
            <Film className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={handleVoiceRecord}
            className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-100' : 'hover:bg-gray-100'
              } disabled:opacity-50`}
            title="Ghi âm"
            disabled={!conversationId}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'text-red-600' : 'text-blue-600'}`} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Gửi file"
            disabled={!conversationId}
          >
            <Paperclip className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Aa"
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={!conversationId}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || !conversationId}
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'image')}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileSelect(e, 'video')}
          className="hidden"
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileSelect(e, 'audio')}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileSelect(e, 'file')}
          className="hidden"
        />
      </div>
    </div>
  );
}