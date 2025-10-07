import { useState } from 'react';
import { User, Settings, Info, Shield, LogOut, Menu, X } from 'lucide-react';

type ChatSidebarProps = {
  userId: string;
  isInChat: boolean;
  isOpenOnMobile: boolean;
  onSettingsClick: () => void;
  onInfoClick: () => void;
  onSecurityClick?: () => void;
  onExitClick?: () => void;
  setIsOpenOnMobile: (isOpen: boolean) => void;
};

export default function ChatSidebar({
  userId,
  isInChat,
  isOpenOnMobile,
  onSettingsClick,
  onInfoClick,
  onSecurityClick,
  onExitClick,
  setIsOpenOnMobile,
}: ChatSidebarProps) {

  const baseMenuItems = [
    { icon: User, label: `ID: ${userId}`, onClick: () => {} },
    { icon: Info, label: 'Thông tin', onClick: onInfoClick },
    { icon: Settings, label: 'Cài đặt', onClick: onSettingsClick },
  ];

  const chatMenuItems = isInChat
    ? [
        { icon: Shield, label: 'Báo Xấu', onClick: onSecurityClick || (() => {}) },
        { icon: LogOut, label: 'Thoát trò chuyện', onClick: onExitClick || (() => {}) },
      ]
    : [];

  const menuItems = [...baseMenuItems, ...chatMenuItems];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-gray-200 flex flex-col h-full border-r border-gray-300 transform transition-transform duration-300 ease-in-out ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:w-72 z-40`}
      >
        <div className="flex-1 py-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpenOnMobile(false); // Đóng sidebar sau khi click trên mobile
              }}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-300 transition-colors text-left"
            >
              <item.icon className="w-5 h-5 text-gray-700" />
              <span className="text-gray-800 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay khi sidebar mở trên mobile */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpenOnMobile(false)}
        ></div>
      )}
    </>
  );
}