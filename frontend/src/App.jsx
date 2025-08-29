import React, { useState } from 'react'
import { useAuth0 } from "@auth0/auth0-react";

import { Routes,Route } from 'react-router-dom'
import Home from './components/HomePage/Home'
import Profile from './components/ProfilePage/Profile'
import Login from './components/LoginPage/Login'
import bgImage from './chat-app-assests/bgImage.svg'

function App() {
  const { loginWithRedirect ,isAuthenticated} = useAuth0();

  const [selectedUser,setSelectedUser]=useState(false)
  return (

    <div className="object-center  h-screen w-full flex justify-center items-center p-12"
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
