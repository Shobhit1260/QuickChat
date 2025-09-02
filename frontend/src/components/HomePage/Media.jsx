import React, { useState } from "react";
import gallery_icon from "../../chat-app-assests/gallery_icon.svg";
import {socket} from "../../App.jsx";
import BASE from "../../api.js";
import { createPortal } from "react-dom";
function Media({ me, userSelected, isGroup, chatHistory }) {
  const [preview, setPreview] = useState(false);
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [chats, setChats] = useState(chatHistory || []);
  const [isSending, setIsSending] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileURL(URL.createObjectURL(selectedFile));
      setPreview(true);
    }
  };
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsSending(true);

    const formData = new FormData();
    formData.append("media", file);

    try {
      const res = await fetch(`${BASE}/v1/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      const url = data.url;
      const type=data.type;

      
      setChats((prev) => [...prev, { url, status: "sending" }]);

      
      const payload = {
        message: "",
        mediaKey: url,
        
        fromUserId: me?._id,
      };
      
     
      if (isGroup) {
        socket.emit("sendGroupMessage", {
          ...payload,
          toGroupId: userSelected?._id,

        });
       
      } else {
        socket.emit("sendPrivateMessage", {
          ...payload,
          toUserId: userSelected?._id,
        });
        socket.emit("sendPrivateMessage", {
          ...payload,
          toUserId: me?._id,
        });
      }

     
      setChats((prev) =>
        prev.map((chat) =>
          chat.url === url ? { ...chat, status: "sent" } : chat
        )
      );
    } catch (error) {
      console.error("Upload error:", error);
      setChats((prev) =>
        prev.map((chat) =>
          chat.url === fileURL ? { ...chat, status: "failed" } : chat
        )
      );
   } 
    finally {
      setIsSending(false);
      setPreview(false);
      setFile(null);
      setFileURL(null);
    }
  };

  return (
    <div className="flex items-center ">
     
      <form encType="multipart/form-data">
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={handleFileChange}
          name="media"
          accept="image/*,video/*,audio/*"
        />
        <label
  htmlFor="fileInput"
  className="cursor-pointer p-2 rounded-full transition"
>
  <img
    src={gallery_icon}
    alt="gallery"
    className="w-6 h-6 hover:brightness-75"
  />
</label>
      </form>

     
      {preview &&
  createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center ">
      <div className="bg-white p-5 rounded-2xl max-w-md w-full shadow-lg animate-fadeIn">
        <h2 className="text-lg font-semibold mb-3">Preview</h2>

        <div className="rounded-lg max-h-[60vh] mb-4">
          {file && file.type.startsWith("image/") && (
            <img src={fileURL} alt="preview" className="w-full h-auto object-fill" />
          )}
          {file && file.type.startsWith("video/") && (
            <video src={fileURL} controls className="w-full h-auto object-fill" />
          )}
          {file && file.type.startsWith("audio/") && (
            <audio src={fileURL} controls className="w-full" />
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition disabled:opacity-50"
            onClick={() => setPreview(false)}
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-blue-300"
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                Sending...
              </>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}


      
      
    </div>
  );
}

export default Media;
