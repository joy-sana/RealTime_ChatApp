import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { Download } from "lucide-react";

const downloadImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-image-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading image:", err);
    alert("Failed to download image");
  }
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    notificationSoundEnabled, // ✅ added from store
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const notificationAudio = useRef(new Audio("sound/notification.mp3")); // ✅ audio ref

  // Initial message fetch + subscriptions
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll + Play Sound Logic
  useEffect(() => {
    if (messageEndRef.current && messages?.length) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });

      const latestMsg = messages[messages.length - 1];
      const isIncoming = latestMsg?.senderId !== authUser._id;

      if (isIncoming && notificationSoundEnabled) {
        notificationAudio.current.play().catch((e) =>
          console.log("Sound play blocked:", e)
        );
      }
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div
              className={`chat-bubble flex flex-col ${
                message.senderId === authUser._id
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content"
              }`}
            >
              {message.image && (
                <div className="relative sm:max-w-[200px] mb-2">
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="rounded-md w-full"
                  />
                  <button
                    onClick={() => downloadImage(message.image)}
                    className="absolute top-1 right-1 bg-white bg-opacity-70 hover:bg-opacity-100 p-1 rounded-md text-sm"
                    title="Download image"
                  >
                    <Download />
                  </button>
                </div>
              )}
              {message.text && <p>{message.text}</p>}

              {message.senderId === authUser._id && (
                <span className="text-xs text-gray-500 text-right mt-1">
                  {message.status === "sent" && "✓"}
                  {message.status === "delivered" && "✓✓"}
                  {message.status === "read" && (
                    <span className="text-base-300">✓✓</span>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
