'use client';
import { useState, useEffect, useRef } from 'react';
import { initSocket, UserInfo as SocketUserInfo } from '@/lib/socket';
import WelcomeScreen from '@/components/WelcomeScreen';
import UserInfoForm from '@/components/UserInfoForm';
import ChatWindow from '@/components/ChatWindow';
import MatchingModal from '@/components/MatchingModal';
import ChatSidebar from '@/components/ChatSidebar';

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

export type AppUserInfo = { 
  nickname: string;
  birthYear: number;
  gender: 'male' | 'female'; 
  region: string;
};

type PartnerInfo = { 
  partnerId: string;
  partnerInfo: SocketUserInfo;
};

type AppScreen = 'welcome' | 'userInfo' | 'chat';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [userInfo, setUserInfo] = useState<AppUserInfo | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [socket, setSocket] = useState<ReturnType<typeof initSocket> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mapping function: AppUserInfo → SocketUserInfo
  const mapUserInfo = (info: AppUserInfo): SocketUserInfo => ({
    nickname: info.nickname,
    gender: info.gender === 'male' ? 'nam' : 'nữ',
    birthYear: info.birthYear,
    location: info.region,
  });

  const handleWelcomeStart = () => {
    setCurrentScreen('userInfo');
  };

  const handleUserInfoSubmit = (info: AppUserInfo) => {
    const mappedInfo = mapUserInfo(info);
    setUserInfo(info);
    setCurrentScreen('chat');
    connectSocket(mappedInfo);
  };

  // Function để start new chat (sử dụng lại)
  const startNewChat = () => {
    setStatus('');  // Clear status cũ
    setIsSearching(true);
    startSearching();  // Emit 'startChat' để ghép mới
  };

  // connectSocket function (giữ nguyên)
  const connectSocket = (info: SocketUserInfo) => {
    const sock = initSocket(info);
    setSocket(sock);

    sock.on('connect', () => {
      console.log('Connected to server');
    });

    sock.on('userId', (data: { userId: string }) => {
      setCurrentUserId(data.userId);
    });

    sock.on('waiting', (data: { message: string }) => {
      setStatus(data.message);
      setIsSearching(true);
    });

    sock.on('matched', (data: PartnerInfo) => {
      setPartner(data);
      setCurrentConversationId(data.partnerId);
      setStatus(`Đã ghép với ${data.partnerInfo.nickname} (${data.partnerInfo.location})`);
      setIsSearching(false);
      setMessages([]);
    });

    sock.on('newMessage', (msg: { from: string; message: string; fileUrl?: string; type?: string }) => {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        content: msg.message,
        senderId: msg.from,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isMine: msg.from === currentUserId,
        type: (msg.type as Message['type']) || 'text',  // Fix: Type assertion an toàn
        fileUrl: msg.fileUrl,
      };
      setMessages(prev => [...prev, newMessage]);
    });

    sock.on('chatEnded', (data: { message: string }) => {
      setStatus(data.message);  // Giữ status để UI biết "kết thúc"
      setMessages([]);
      setPartner(null);
      setCurrentConversationId(null);
      setIsSearching(false);
      // Không auto-match, chờ user click button
    });

    sock.on('error', (data: { message: string }) => {
      setStatus(data.message);
      setIsSearching(false);
    });

    return () => {
      sock.off('connect');
      sock.off('userId');
      sock.off('waiting');
      sock.off('matched');
      sock.off('newMessage');
      sock.off('chatEnded');
      sock.off('error');
    };
  };

  // startSearching function (giữ nguyên)
  const startSearching = () => {
    if (socket && currentUserId) {
      socket.emit('startChat', { userId: currentUserId });
    } else {
      setTimeout(startSearching, 500);
    }
  };

  useEffect(() => {
    if (currentScreen === 'chat' && currentUserId) {
      startSearching();
    }
  }, [currentUserId, currentScreen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleExitChat = () => {
    if (socket && currentUserId) {
      socket.emit('endChat', { userId: currentUserId });
    }
    setCurrentConversationId(null);
    setMessages([]);
    setPartner(null);
    setStatus('Bạn đã kết thúc chat. Tìm bạn mới?');  // Custom status cho self-exit
    setIsSearching(false);
  };

  // handleSendMessage - Fix type assertion cho finalType
  const handleSendMessage = async (content: string, type: string = 'text', file?: File) => {
    if (!currentConversationId || !socket) return;

    try {
      let fileUrl: string | undefined;
      let finalType: Message['type'] = type as Message['type'];  // Khởi tạo với assertion
      let uploadedFileName: string | undefined;

      if (file && type !== 'text') {
        const uploadUrl = 'api/upload';  // Proxy qua Next.js
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
        }

        const uploadData = await uploadRes.json();
        fileUrl = uploadData.fileUrl;
        finalType = (uploadData.type as Message['type']) || type as Message['type'];  // Assertion cho uploadData.type
        uploadedFileName = uploadData.fileName;

        console.log('Upload success:', { fileUrl, finalType, uploadedFileName });
      }

      const localMessage: Message = {
        id: `msg_${Date.now()}`,
        content: content || '',
        senderId: currentUserId,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isMine: true,
        type: finalType,  // Bây giờ finalType khớp union type
        fileUrl,
        fileName: uploadedFileName || file?.name || content,
      };

      setMessages(prev => [...prev, localMessage]);

      socket.emit('sendMessage', {
        to: currentConversationId,
        message: content || '',
        fileUrl,
        type: finalType,
      });

      console.log('Message sent successfully:', localMessage);

    } catch (error: any) {
      console.error('Send message error:', error);
      alert(`Gửi thất bại: ${error.message}`);
    }
  };

  const handleInfoClick = () => {
    if (userInfo) {
      alert(`Thông tin của bạn:\n\nNickname: ${userInfo.nickname}\nNăm sinh: ${userInfo.birthYear}\nGiới tính: ${userInfo.gender === 'male' ? 'Nam' : 'Nữ'}\nKhu vực: ${userInfo.region}`);
    }
  };

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, []);

  if (currentScreen === 'welcome') {
    return <WelcomeScreen onStart={handleWelcomeStart} />;
  }

  if (currentScreen === 'userInfo') {
    return <UserInfoForm onSubmit={handleUserInfoSubmit} />;
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <ChatSidebar
        userId={currentUserId}
        isInChat={currentConversationId !== null}
        onSettingsClick={() => alert('Cài đặt')}
        onInfoClick={handleInfoClick}
        onSecurityClick={() => alert('Báo Xấu')}
        onExitClick={handleExitChat}
        isOpenOnMobile={sidebarOpen}
        setIsOpenOnMobile={setSidebarOpen}
      />
      <ChatWindow
        conversationId={currentConversationId}
        partnerName={partner?.partnerInfo.nickname || ''}
        messages={messages}
        status={status}
        onSendMessage={handleSendMessage}
        onStartNewChat={startNewChat}
        ontoggleSidebar={()=>setSidebarOpen(!sidebarOpen)}
      />
      <MatchingModal
        isSearching={isSearching}
        status={status}
        onCancel={handleExitChat}
      />
    </div>
  );
}