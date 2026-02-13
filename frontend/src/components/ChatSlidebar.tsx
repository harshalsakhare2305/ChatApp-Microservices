import React, { useState } from "react";
import { User } from "../context/AppContext";
import Link from "next/link";
import {
  MessageCircle,
  Plus,
  X,
  Search,
  UserCircle,
  CornerUpLeft,
  CornerDownRight,
  LogOut,
} from "lucide-react";

interface ChatSlidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showAllUsers: boolean;
  setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
  users: User[] | null;
  loggedInUser: User | null;
  chats: any[] | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handleLogout:()=>void;
  createChat:(user:User)=>Promise<void>;
}

function ChatSlidebar({
  sidebarOpen,
  setSidebarOpen,
  showAllUsers,
  setShowAllUsers,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setSelectedUser,
  handleLogout,
  createChat,
}: ChatSlidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside
      className={`fixed z-20 sm:static top-0 left-0 h-screen w-80 bg-gray-900 border-r border-gray-700 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0 transition-transform duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="sm:hidden flex justify-end mb-2">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {showAllUsers ? "New Chat" : "Messages"}
            </h2>
          </div>

          <button
            onClick={() => setShowAllUsers((prev) => !prev)}
            className={`p-2.5 rounded-lg ${
              showAllUsers
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {showAllUsers ? <X size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-4 py-2">
        {showAllUsers ? (
          /* New Chat */
          <div className="space-y-4 h-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2 overflow-y-auto h-full pb-4">
              {users
                ?.filter(
                  (u) =>
                    u._id !== loggedInUser?._id &&
                    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((u) => (
                  <button
                    key={u._id}
                    className="w-full text-left p-4 rounded-lg border border-gray-700 hover:bg-gray-800"
                    onClick={()=>createChat(u)}>
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-6 h-6 text-gray-300" />
                      <span className="font-medium text-white truncate">
                        {u.name}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
          /* Chats */
          <div className="space-y-2 overflow-y-auto h-full pb-4">
            {chats.map((chat) => {
              const latestMessage = chat.chat.latestMessage;
              const isSelected = selectedUser === chat.chat._id;
              const isSentByMe =
                latestMessage?.sender === loggedInUser?._id;
              const unseenCount = chat.chat.unseenCount || 0;

              return (
                <button
                  key={chat.chat._id}
                  onClick={() => {
                    setSelectedUser(chat.chat._id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-lg border ${
                    isSelected
                      ? "bg-blue-600 border-blue-500"
                      : "border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                      <UserCircle className="w-7 h-7 text-gray-300" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-white truncate">
                          {chat.user.name}
                        </span>

                        {unseenCount > 0 && (
                          <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2">
                            {unseenCount > 99 ? "99+" : unseenCount}
                          </span>
                        )}
                      </div>

                      {latestMessage && (
                        <div className="flex items-center gap-2">
                          {isSentByMe ? (
                            <CornerUpLeft
                              size={14}
                              className="text-blue-400"
                            />
                          ) : (
                            <CornerDownRight
                              size={14}
                              className="text-green-400"
                            />
                          )}
                          <span className="text-sm text-gray-400 truncate">
                            {latestMessage.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-gray-400 font-medium">
              No conversations yet
            </p>
            <p className="text-sm text-gray-500">
              Start a new chat to begin messaging
            </p>
          </div>
        )}
      </div>

      {/* footer */}

      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link href={'/profile'} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
        <div className="p-1.5 bg-gray-700 rounded-lg">
            <UserCircle className="w-4 h-4 text-gray-300"/>
           
        </div>
        <span className="font-medium text-gray-300">Profile</span>
        </Link>

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-red-500 hover:text-white">
             <div className="p-1.5 bg-red-600 rounded-lg">
            <LogOut className="w-4 h-4 text-gray-300"/>
           
        </div>
        <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default ChatSlidebar;