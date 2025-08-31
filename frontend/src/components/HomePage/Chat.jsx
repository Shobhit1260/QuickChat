import React, { useEffect, useState } from "react";
import logo_icon from "../../chat-app-assests/logo_icon.svg";
import send_button from "../../chat-app-assests/send_button.svg";
import { useSelector, useDispatch } from "react-redux";
import socket from "./socket.js";
import Media from "./Media.jsx";
import BASE from "../../api.js";
import { clearSelectedUser } from "../../Redux/UserSlice.js";
import { FaBackward } from "react-icons/fa6";
import { FaForward } from "react-icons/fa6";

function Chat({onBack,onRight}) {
  const dispatch = useDispatch();
  const userSelected = useSelector((state) => state?.userSelected?.value);
  const me = useSelector((state) => state?.me?.value);
  const token = localStorage.getItem("token");

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const isGroup =
    Array.isArray(userSelected?.members) && userSelected.members.length > 0;
  const groupId = isGroup ? userSelected?._id : null;

  useEffect(() => {
    socket.connect();
    socket.on("online-users", (online) => setOnlineUsers(online));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!me?._id) return;
    socket.auth = { userId: me._id };
    socket.emit("setup", me._id);
  }, [me?._id]);

  const sendmsg = (e) => {
    e.preventDefault();
    if (!message.trim() || !me?._id || !userSelected?._id) return;

    if (isGroup) {
      socket.emit("sendGroupMessage", {
        toGroupId: userSelected._id,
        message,
        mediaKey: "",
        fromUserId: me._id,
      });
    } else {
      socket.emit("sendPrivateMessage", {
        toUserId: userSelected._id,
        message,
        mediaKey: "",
        fromUserId: me._id,
      });
      socket.emit("sendPrivateMessage", {
        toUserId: me._id,
        message,
        mediaKey: "",
        fromUserId: me._id,
      });
    }

    setMessage("");
  };

  useEffect(() => {
    if (!me?._id || !userSelected?._id) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          isGroup
            ? `${BASE}/v1/fetchgrouphistory/${groupId}`
            : `${BASE}/v1/fetchchathistory/${me._id}/${userSelected._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );
        const data = await res.json();
        setChatHistory(data.messages || []);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    const handleReceive = (data) => {
      setChatHistory((prev) => [...prev, data]);
    };

    socket.off("receivedPrivateMessage");
    socket.off("receivedGroupMessage");
    socket.on("receivedPrivateMessage", handleReceive);
    socket.on("receivedGroupMessage", handleReceive);

    return () => {
      socket.off("receivedPrivateMessage", handleReceive);
      socket.off("receivedGroupMessage", handleReceive);
    };
  }, [me?._id, userSelected?._id, token, isGroup]);

  const handleChange = (e) => setMessage(e.target.value);

  const getColorFromName = (name) => {
    const colors = [
      "#FF5733",
      "#33B5FF",
      "#28A745",
      "#FFC107",
      "#9C27B0",
      "#FF9800",
      "#00BCD4",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash % colors.length)];
  };

  if (!userSelected || Object.keys(userSelected).length === 0) {
    return (
      <div className="w-full max-h-screen min-h-screen backdrop-blur-lg bg-white/10 flex flex-col gap-4 justify-center items-center rounded-r-xl">
        <img src={logo_icon} alt="logo" className="w-24 sm:w-32" />
        <div className="text-xl sm:text-2xl text-center px-4">
          Chat anytime, anywhere
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-screen min-h-screen justify-between md:w-full backdrop-blur bg-white/10 rounded-r-lg pb-4 pl-4 pr-4">
      
      <div className="flex h-14 sm:h-16 justify-between items-center gap-4 p-3 sm:p-4 backdrop-blur bg-white/30 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.innerWidth < 640) onBack();
              else dispatch(clearSelectedUser());
            }}
            className="sm:hidden p-1 rounded-full hover:bg-gray-200/40 text-white"
          >
            <FaBackward />
          </button>
          

          {!isGroup ? (
            <img
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              src={userSelected.picture}
              alt="user"
            />
          ) : (
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center"
              style={{ backgroundColor: getColorFromName(userSelected.nickname) }}
            >
              {userSelected.picture ? (
                <img
                  src={userSelected.picture}
                  alt={userSelected.nickname}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-white font-semibold text-sm sm:text-base">
                  {userSelected.nickname.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col w-full">
            <span className="text-xl text-white sm:text-lg font-semibold">
              {userSelected.nickname}
            </span>
            {!isGroup && onlineUsers.includes(userSelected?._id) && (
              <span className="text-green-400 text-xs">Online</span>
            )}
          </div>
          <button
            onClick={() => {
              if (window.innerWidth < 640) onRight();
              else dispatch(clearSelectedUser());
            }}
            className="sm:hidden p-1 rounded-full hover:bg-gray-200/40 text-white"
          >
            <FaForward />
          </button>
        </div>
        
        
      </div>

     
      <div className="flex flex-col min-h-screen gap-3 overflow-y-auto flex-1 px-2 py-3 sm:px-4 sm:py-4 scrollbar-thin scrollbar-thumb-gray-400">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : chatHistory.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No messages yet...</p>
        ) : (
          chatHistory.map((msg) => (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${
                msg.sender._id === me?._id || msg.sender === me._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <img
                src={msg.sender.picture || me.picture}
                alt="profile"
                className="rounded-full w-6 h-6 sm:w-8 sm:h-8"
              />
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm sm:text-base ${
                  msg.sender._id === me?._id || msg.sender === me._id
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-300 text-black rounded-bl-none"
                }`}
              >
                {msg.message?.trim() ? (
                  <span>{msg.message}</span>
                ) : msg.mediaKey ? (
                  <img
                    src={msg.mediaKey}
                    alt="media"
                    className="h-40 w-40 sm:h-48 sm:w-48 rounded-lg object-cover"
                  />
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        className="static bottom-12 flex justify-between items-center w-full p-2 sm:h-8 md:h-16 mb-2"
        onSubmit={sendmsg}
      >
        <div className="flex rounded-full w-full items-center bg-white/10 px-4">
          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Send a message..."
            className="bg-transparent outline-none w-full text-sm sm:text-base"
          />
          <Media
            me={me}
            userSelected={userSelected}
            isGroup={isGroup}
            chatHistory={chatHistory}
          />
        </div>
        <button
          type="submit"
          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full flex justify-center items-center w-12 h-12 md:w-12 md:h-12"
        >
          <img
            src={send_button}
            alt="send"
            className="w-5 rounded-full sm:w-full sm:h-full object-cover"
          />
        </button>
      </form>
    </div>
  );
}

export default Chat;
