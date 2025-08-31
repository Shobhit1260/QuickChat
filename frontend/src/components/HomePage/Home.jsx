import React, { useEffect, useState } from "react";
import LeftSideBar from "./LeftSideBar";
import Chat from "./Chat";
import RightSideBar from "./RightSideBar.jsx";
import CreateGroupModal from "./CreateGroupModal.jsx";
import BASE from "../../api.js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function Home() {
  const [leftSideBarData, setLeftSideBarData] = useState({ users: [], groups: [] });
  const me = useSelector((state) => state?.me?.value);
  const savedtoken = localStorage.getItem("token");

  const [activeView, setActiveView] = useState("left");
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [memberSelected, setMemberSelected] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  useEffect(() => {
    const fetchLeftSideBarData = async () => {
      try {
        const res1 = await fetch(`${BASE}/v1/fetchusers`, {
          headers: { authorization: `Bearer ${savedtoken}` },
          credentials: "include",
        });
        const data1 = await res1.json();
        const users = (data1.users || []).filter((user) => user._id !== me?._id);

        const res2 = await fetch(`${BASE}/v1/fetchgroups`, {
          headers: { authorization: `Bearer ${savedtoken}` },
          credentials: "include",
        });
        const data2 = await res2.json();
        const groups = data2.groups || [];
         console.log("Fetched groups:", groups);
        setLeftSideBarData({ users, groups });
      } catch (err) {
        console.error("Error fetching sidebar data:", err);
      }
    };

    fetchLeftSideBarData();
  }, [me?._id, savedtoken]);

  const changeHandler = (e) => {
    const userId = e.target.id;
    if (e.target.checked) {
      setMemberSelected((prev) => [...prev, userId]);
    } else {
      setMemberSelected((prev) => prev.filter((id) => id !== userId));
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return toast.error("Please enter a group name");
    if (memberSelected.length === 0) return toast.error("Please select members");

    setIsCreatingGroup(true);
    try {
      const res = await fetch(`${BASE}/v1/creategroup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${savedtoken}`,
        },
        body: JSON.stringify({ nickname: groupName.trim(), membersId: memberSelected }),
      });
      const data = await res.json();
      if (!data.success) toast.error(data.message || "Failed to create group");
      else {
        setShowGroupModal(false);
        setGroupName("");
        setMemberSelected([]);
        toast.success(data.message || "Group created successfully");

        setLeftSideBarData((prev) => ({
          ...prev,
          groups: [...prev.groups, data.group],
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-2 sm:px-6 py-4 md:m-4">
      
      <div className="md:hidden w-full h-screen flex flex-col sm:flex-row bg-white/10 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl sm:overflow-hidden overflow-y-scroll border border-gray-700 md:m-4">
         {
          activeView==="left" ?
        <div
          className={`w-full md:w-1/4 h-screen sm:h-full border-b sm:border-b-0 sm:border-r border-gray-700  md:block `}>
         <LeftSideBar
            leftSideBarData={leftSideBarData}
            onOpenGroupModal={() => setShowGroupModal(true)}
            onRight={() => setActiveView("chat")}
          /> 
          </div>:null
         }

        {
           activeView==="chat" ? 
           <div 
           className={`flex-1 md:h-full w-full md:w-1/2 `}>
          <Chat onBack={() => setActiveView("left")} onRight={() => setActiveView("right")}  
          />
           </div> : null 
        }


       {
         activeView==="right"?  
         <div
          className={`md:w-1/4 border-l border-gray-700`}
        >
          <RightSideBar onBack={()=>setActiveView("chat")} />
        </div> : null
       }

      <div className="hidden w-full h-screen md:flex-row bg-white/10 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl sm:overflow-hidden overflow-y-scroll border border-gray-700 md:m-4">
       <div
          className={`w-full md:w-1/4 h-screen sm:h-full border-b sm:border-b-0 sm:border-r border-gray-700  md:block `}>
         <LeftSideBar
            leftSideBarData={leftSideBarData}
            onOpenGroupModal={() => setShowGroupModal(true)}
            onRight={() => setActiveView("chat")}
          /> 
        </div>  
         <div 
           className={`flex-1 md:h-full w-full md:w-1/2 `}>
          <Chat onBack={() => setActiveView("left")} onRight={() => setActiveView("right")}  
          />
          </div>
          <div
          className={`md:w-1/4 border-l border-gray-700`}
        >
          <RightSideBar onBack={()=>setActiveView("chat")} />
        </div> 
        </div>
    
      <CreateGroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        groupName={groupName}
        setGroupName={setGroupName}
        memberSelected={memberSelected}
        setMemberSelected={setMemberSelected}
        changeHandler={changeHandler}
        isCreatingGroup={isCreatingGroup}
        createGroup={createGroup}
        leftSideBarData={leftSideBarData}
      />
    </div>
  </div>
  );
}

export default Home;
