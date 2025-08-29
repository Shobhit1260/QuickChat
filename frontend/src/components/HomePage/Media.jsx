import React, { useState } from "react";
import gallery_icon from "../../chat-app-assests/gallery_icon.svg";
import socket from "./socket.js";
import BASE from '../../api.js'
function Media({ me, userSelected, isGroup,chatHistory }) {
  const [preview, setPreview] = useState(false);
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [chats, setChats] = useState(chatHistory || []);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileURL(URL.createObjectURL(selectedFile)); 
      setPreview(true);
    }
  };

  const handleSend = async(e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);
    

    const res= await fetch(`${BASE}/v1/upload`, {
      method: "POST",
      headers: {
        Authorization:`Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
      credentials:"include"
    });
    const data=await res.json();
    const url = data.url; 
    setChats((prev) => [...prev, url]);
    socket.emit("sendPrivateMessage",{
      toUserId:me?._id,
      message:"",
      mediaKey:url,
      fromUserId:me?._id,  
    }) 
    socket.emit("sendPrivateMessage",{
      toUserId:userSelected?._id,
      message:"",
      mediaKey:url,
      fromUserId:me?._id,  
    }) 
     socket.emit("sendGroupMessage",{
      toUserId:me?._id,
      message:"",
      mediaKey:url,
      fromUserId:me?._id,  
    }) 
     socket.emit("sendGroupMessage",{
      toUserId:userSelected?._id,
      message:"",
      mediaKey:url,
      fromUserId:me?._id,  
    }) 
    
    setPreview(false);
    setFile(null);
    setFileURL(null);
  };

  return (
    <div>
      <form encType="multipart/form-data">
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={handleFileChange}
          name="media"
        />
        <label htmlFor="fileInput">
          <img src={gallery_icon} alt="gallery" />
        </label>
      </form>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>

            {file && file.type.startsWith("image/") && (
              <img src={fileURL} alt="preview" className="w-full h-auto" />
            )}

            {file && file.type.startsWith("video/") && (
              <video src={fileURL} controls className="w-full h-auto" />
            )}

            {file && file.type.startsWith("audio/") && (
              <audio src={fileURL} controls />
            )}

            <div className="flex justify-end mt-3 gap-3">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setPreview(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Media;
