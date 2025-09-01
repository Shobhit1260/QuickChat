import React, { useEffect, useMemo, useState } from 'react'
import { useAuth0 } from "@auth0/auth0-react";

import { Routes,Route } from 'react-router-dom'
import Home from './components/HomePage/Home'
import Profile from './components/ProfilePage/Profile'
import Login from './components/LoginPage/Login'
import bgImage from './chat-app-assests/bgImage.svg'

import {io} from 'socket.io-client';
import { useSelector } from 'react-redux';
import BASE from './api';

export const socket = io(BASE, { autoConnect: false });

function App() {
  const { loginWithRedirect ,isAuthenticated} = useAuth0();
  const [selectedUser,setSelectedUser]=useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const me = useSelector((state) => state?.me?.value);

  useEffect(() => {
    if (!me?._id) return;
    console.log("Establishing socket connection for user:", me._id);
     socket.auth = { userId: me?._id };  
     socket.connect();
    
    socket.emit("setup", me?._id);
    socket.on("online-users", (online) => setOnlineUsers(online));

    return () => {
      socket.disconnect();
    };
  }, [me,socket]);
 console.log("Socket connected:", socket.connected);
  return (

    <div className="object-cover  h-screen overflow-y-hidden overflow-x-hidden w-[100vw] flex justify-center items-center "
      style={{ backgroundImage: `url(${bgImage})` }}
      >
        
         <Routes>
             <Route path="/chat" element={<Home/>}></Route>
             <Route path="/profile" element={<Profile/>}></Route>
             <Route path="/" element={<Login/>}></Route>
         </Routes>
         
       

    </div>
  )
}

export default App
