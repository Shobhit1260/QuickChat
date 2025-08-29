import { useEffect, useState } from 'react';
import logo_icon from '../../chat-app-assests/logo_icon.svg';
import send_button from '../../chat-app-assests/send_button.svg';
import { useSelector } from 'react-redux';
import socket from './socket.js';
import Media from './Media.jsx';

function Chat() {
  const userSelected = useSelector((state) => state?.userSelected?.value);
  const me = useSelector((state) => state?.me?.value);
  console.log("me",me);
  const token = localStorage.getItem("token");
  console.log("token",token);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const isGroup = Array.isArray(userSelected?.members) && userSelected.members.length > 0;
  const groupId= isGroup?userSelected?._id:null;
  console.log("isGroup:", isGroup, "groupId:", groupId);
  // Connect socket only once on mount
  useEffect(() => {
    socket.connect();

    socket.on("online-users", (online) => {
      setOnlineUsers(online);
    });

   
  }, []);

  // Update auth when me changes
  useEffect(() => {
    if (!me?._id) return;
    socket.auth = { userId: me._id };
    socket.emit("setup", me._id);
  }, [me?._id]);
   // Send message
  const sendmsg = (e) => {
    
    e.preventDefault();
    if (!message.trim() || !me?._id || !userSelected?._id) return;

    const newMsg = {
      _id: Date.now(), 
      sender: me._id,
      receiver: userSelected._id,
      receiverModel: isGroup ? "Group" : "User",
      message,
      mediaKey:null,
      isRead: false
    };
   
    if (isGroup) {
      socket.emit("sendGroupMessage", {
        toGroupId: userSelected._id,
        message,
        mediaKey:"",
        fromUserId: me._id
      });
    } else {
      socket.emit("sendPrivateMessage", {
        toUserId: userSelected._id,
        message,
        mediaKey:"",
        fromUserId: me._id
      });
    }
    setChatHistory((prev) => [...prev, newMsg]);
    setMessage("");
   
  };

  // Join correct room when userSelected changes
  useEffect(() => {
    if (!me?._id || !userSelected?._id) return ;

    // Fetch chat history
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          isGroup?`http://localhost:8000/v1/fetchgrouphistory/${groupId}`:
          `http://localhost:8000/v1/fetchchathistory/${me._id}/${userSelected._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include'
          }
        );
        const data = await res.json();
        setChatHistory(data.messages || []);   
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };
    fetchHistory();

    socket.off("receivedPrivateMessage");
    socket.off("receivedGroupMessage");

    const handleReceive = (data) => {
      setChatHistory((prev) => [...prev, data]);
    };

    socket.on("receivedPrivateMessage", handleReceive);
    socket.on("receivedGroupMessage", handleReceive);

    return () => {
      socket.off("receivedPrivateMessage", handleReceive);
      socket.off("receivedGroupMessage", handleReceive);
    };
  }, [me?._id, userSelected?._id, token, isGroup]);
  
  const handleChange = (e) => setMessage(e.target.value);
  
  const getColorFromName = (name) => {
    const colors = ["#FF5733", "#33B5FF", "#28A745", "#FFC107", "#9C27B0", "#FF9800", "#00BCD4"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash % colors.length)];
  };

  return (
    <>
      {Object.keys(userSelected).length === 0 ? (
        <div className="w-1/2 h-full backdrop-blur-lg bg-white/10 flex flex-col gap-4 justify-center items-center rounded-r-xl">
          <img src={logo_icon} alt="logo" className="w-32" />
          <div className="text-2xl">Chat anytime, anywhere</div>
        </div>
      ) : (
        <div className="z-0 flex flex-col justify-between w-[600px] h-full backdrop-blur bg-white/10 rounded-r-lg">
          {/* Header */}
          <div className="flex h-16 justify-between items-center gap-4 p-4 backdrop-blur bg-white/30 rounded-r-lg">
            <div className="flex h-full justify-start items-center gap-2">
              {!isGroup ? (
                <img className="w-8 rounded-full" src={userSelected.picture} alt="user" />
              ) : (
                <div
                  className="w-8 rounded-full flex justify-center items-center"
                  style={{ backgroundColor: getColorFromName(userSelected.nickname) }}
                >
                  {userSelected.picture ? (
                    <img src={userSelected.picture} alt={userSelected.nickname} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold">
                      {userSelected.nickname.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              <div className="text-lg min-w-max">
                {userSelected.nickname}
                {!isGroup && onlineUsers.includes(userSelected?._id) && (
                  <div className="text-green-400">Online</div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-2 overflow-y-scroll h-[500px] px-2 py-4">
            {chatHistory.map((msg) => (
               console.log("msg",msg),
                <div key={msg._id } className={`flex gap-4 ${msg.sender._id && (msg.sender._id === me?._id ? "justify-end":"justify-start") || msg.sender && (msg.sender===me._id ? "justify-end":"justify-start")}`}>
                  <img src={msg.sender.picture || (msg.sender._id ? msg.sender.picture : me.picture)} alt="profile" className="aspect-[1/1] rounded-full w-8 h-8"/>
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-xl ${
                      msg.sender._id && (msg.sender._id === me?._id ? "bg-blue-500 text-white":"bg-gray-300 text-black") || msg.sender && (msg.sender===me._id ? "bg-blue-500 text-white":"bg-gray-300 text-black")
                    }`}
                  >
                    {msg.message.trim().length>0 ? <span>{msg.message}</span>: <img src={msg.mediaKey} alt="media" className='h-48 w-48'/>}
                  </div>
                </div>
              
            ))}
          </div>

          {/* Input */}
          <form className="flex gap-4 p-4" onSubmit={sendmsg}>
            <div className="flex rounded-2xl w-11/12 items-center bg-white/10 py-2 px-4">
              <input
                type="text"
                value={message}
                onChange={handleChange}
                placeholder="Send a message..."
                className="bg-transparent outline-none w-full"
              />
             <Media me={me} userSelected={userSelected} isGroup={isGroup} chatHistory={chatHistory}/>
              {/* <img src={gallery_icon} alt="gallery"/> */}
              
            </div>
            <button type="submit">
              <img src={send_button} alt="send" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chat;
