import React, { useEffect, useState } from "react";
import LeftSideBar from "./LeftSideBar";
import Chat from "./Chat";
import BASE from "../../api.js";
import { useSelector } from "react-redux";
import RightSideBar from "./RightSideBar.jsx";

function Home() {
  const [LeftSideBarData, setLeftSideBar] = useState({ users: [], groups: [] });
  const [users, setUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const me = useSelector((state) => state?.me?.value);
  const savedtoken = localStorage.getItem("token");

  useEffect(() => {
    const fetchLeftSideBarData = async () => {
      const res1 = await fetch(`${BASE}/v1/fetchusers`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${savedtoken}`,
        },
        credentials: "include",
      });

      const data = await res1.json();
      const users = data.users || [];
      const filteredUsers = users.filter((user) => user._id !== me?._id);

      const res2 = await fetch(`${BASE}/v1/fetchgroups`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${savedtoken}`,
        },
        credentials: "include",
      });
      const data2 = await res2.json();
      const groups = data2.groups || [];
      setLeftSideBar({ users: filteredUsers, groups });
    };
    fetchLeftSideBarData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`${BASE}/v1/fetchusers`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${savedtoken}`,
        },
        credentials: "include",
      });
      const users = await res.json();
      setUsers((prev) => ({ ...prev, users }));
    };
    fetchUsers();
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-2 sm:px-6 py-4">
      <div className="w-full h-full max-w-7xl flex flex-col sm:flex-row bg-white/10 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        
        <div className="w-full sm:w-1/3 lg:w-1/4 h-[40vh] sm:h-full border-b sm:border-b-0 sm:border-r border-gray-700">
          <LeftSideBar leftSideBarData={LeftSideBarData} />
        </div>

       
        <div className="flex-1 h-full">
          <Chat />
        </div>
        <RightSideBar />
      </div>
    </div>
  );
}

export default Home;
