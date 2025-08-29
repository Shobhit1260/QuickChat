import React, { useEffect, useState } from 'react'
import LeftSideBar from './LeftSideBar'
import Chat from './Chat'

import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

function Home() {
    
    const [LeftSideBarData,setLeftSideBar]=useState({users:[],groups:[]} );
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
   const me = useSelector((state) => state?.me?.value);
   const savedtoken = localStorage.getItem("token");
   
    useEffect(()=>{
     const fetchLeftSideBarData=async()=>{ 
      const res1=await fetch("http://localhost:8000/v1/fetchusers",{
       method:"GET",
       headers:{
        "authorization":`Bearer ${savedtoken}`
       },
       credentials:"include"
      });

      const data=await res1.json();
      const users = data.users || [];
      const filteredUsers=users.filter((user)=>user._id !== me?._id);


      const res2=await fetch("http://localhost:8000/v1/fetchgroups",{
       method:"GET",
       headers:{
        "authorization":`Bearer ${savedtoken}`
       },
       credentials:"include"
      });
      const data2=await res2.json();
      const groups= data2.groups || [];
      setLeftSideBar({users: filteredUsers, groups});
     }
     fetchLeftSideBarData();
   },[]);

   useEffect(() => {
     const fetchUsers = async () => {
       const res = await fetch("http://localhost:8000/v1/fetchusers", {
         method: "GET",
         headers: {
           "authorization": `Bearer ${savedtoken}`
         },
         credentials: "include"
       });
       const users = await res.json();
       setUsers((prev) => ({ ...prev, users }));
     };
     fetchUsers();
   }, []);
  
 
  return (
     <div className='w-11/12 h-[700px] text-white rounded-lg flex justify-center items-center ' >
           <LeftSideBar leftSideBarData={LeftSideBarData}  /> 
           <Chat />
     </div>
  )
}

export default Home;



