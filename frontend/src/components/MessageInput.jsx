import EmojiPicker from 'emoji-picker-react';
import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Smile, Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const [loading, setLoading] = useState(false); //
  const [showPicker, setShowPicker] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    setLoading(true);
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="p-4 w-full relative">
      
    {showPicker && (
    <div className="absolute bottom-20 left-4 z-50">
      <EmojiPicker
        onEmojiClick={(emojiData, event) => {
          event.stopPropagation();
          setText((prev) => prev + emojiData.emoji);
        }}
      />
    </div>
  )}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">

          <div className='flex items-center relative '>
            <button type="button" className='items-center'
            onClick={(e) => {
                e.stopPropagation();
                setShowPicker((v) => !v);
              }}>
              <Smile />
            </button>
          </div>

          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
                      >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn  btn-circle bg-primary hover:bg-primary/90 text-base-100 "
          disabled={!text.trim() && !imagePreview || loading}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
