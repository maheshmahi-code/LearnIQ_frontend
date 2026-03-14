import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { chatAPI } from "../services/apiService";
import { useAuth } from "../context/AuthContext";

export default function Community() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data } = await chatAPI.getMessages("global");
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.log("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 3 seconds for new messages to simulate real-time chat
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const optimistic = {
      _id: Date.now().toString(),
      content: newMessage,
      sender: {
        _id: user?._id || user?.id,
        name: user?.name,
      },
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");

    try {
      await chatAPI.sendMessage("global", { content: optimistic.content });
      fetchMessages();
    } catch (error) {
      console.log("Failed to send message:", error);
      // Remove optimistic message if failed
      setMessages((prev) => prev.filter((msg) => msg._id !== optimistic._id));
    }
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#efeae2] relative overflow-hidden font-sans">
      
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239ca3af' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 z-10 scrollbar-hide">
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
          {messages.map((msg, index) => {
            const senderId = String(msg.sender?._id || msg.sender?.id || msg.sender);
            const myId = String(user?._id || user?.id);
            const isMe = senderId === myId;
            
            // Checking if previous message is from same sender to chain bubbles
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevSenderId = prevMsg ? String(prevMsg.sender?._id || prevMsg.sender?.id || prevMsg.sender) : null;
            const isFirstInChain = prevSenderId !== senderId;

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"} ${isFirstInChain ? "mt-3" : "mt-1"}`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] md:max-w-[70%] px-3 pt-2 pb-1 text-[15px] shadow-sm relative flex flex-col
                  ${isMe
                      ? "bg-[#005c4b] text-white rounded-lg rounded-tr-none" 
                      : "bg-white text-gray-800 rounded-lg rounded-tl-none"
                    }`}
                >
                  {/* Sender Name if not me and first in chain */}
                  {!isMe && isFirstInChain && (
                    <span className="text-xs font-bold text-blue-500 mb-1">
                      {msg.sender?.name || "Unknown User"}
                    </span>
                  )}

                  {/* Message Content */}
                  <div className="flex flex-wrap items-end gap-2">
                    <p className="whitespace-pre-wrap leading-relaxed break-words pr-2">
                      {msg.content}
                    </p>

                    {/* Time + Ticks */}
                    <div className="flex items-center gap-1 text-[10px] ml-auto shrink-0 opacity-80 mt-1 pb-[2px]">
                      <span className={`${isMe ? "text-gray-300" : "text-gray-500"}`}>{formatTime(msg.createdAt)}</span>

                      {isMe && (
                        <svg viewBox="0 0 16 15" width="16" height="15" className="text-[#53bdeb] fill-current">
                          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.32.32 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] px-4 py-3 z-10 w-full transition-all">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-end gap-2"
        >
          <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-1 min-h-[44px] shadow-sm border border-gray-200 focus-within:ring-1 focus-within:ring-green-500">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message"
              className="flex-1 max-h-32 bg-transparent outline-none resize-none py-2.5 text-[#111b21] leading-relaxed placeholder-gray-500 overflow-y-auto"
              rows={1}
            />
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-11 h-11 shrink-0 rounded-full bg-[#00a884] flex items-center justify-center shadow-md text-white transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#008f6f]"
          >
            <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" className="fill-current ml-1">
              <path d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}