import React, { useState, useEffect } from "react";
import favicon from "../../chat-app-assests/favicon.svg";
import Menu from "../../chat-app-assests/menu_icon.png";
import search_icon from "../../chat-app-assests/search_icon.png";
import { setSelectedUser, clearSelectedUser } from "../../Redux/UserSlice.js";
import { useSelector, useDispatch } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import BASE from "../../api.js";
import EditProfileModal from "./EditProfile.jsx";
import { FaForward } from "react-icons/fa6";

function LeftSideBar({ leftSideBarData , onOpenGroupModal,onRight}) {
  const dispatch = useDispatch();
  const { logout } = useAuth0();

  const selectedUser = useSelector((state) => state?.userSelected?.value);
  const me = useSelector((state) => state?.me?.value);
  const token = localStorage.getItem("token");

  const [menu, setMenu] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

 

  const isGroup = Array.isArray(me?.members) && me.members.length > 0;
  const type = isGroup ? "group" : "user";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menu && !event.target.closest(".menu-container")) {
        setMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menu]);

  const filteredUsers =
    leftSideBarData.users?.filter((user) =>
      user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const filteredGroups =
    leftSideBarData.groups?.filter(
      (group) =>
        
        group.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      dispatch(clearSelectedUser());
      logout({
        logoutParams: { returnTo: window.location.origin },
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  };

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

    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const handleUserSelect = (user) => {
    dispatch(setSelectedUser(user));
    setMenu(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full sm:w-[320px] md:w-full h-screen px-4 py-4 bg-gradient-to-b from-gray-900/90 to-gray-800/90 text-white rounded-l-2xl backdrop-blur-lg">
   
      <div className="flex justify-between items-center p-2 w-full">
        <div className="flex gap-2 items-center">
          <img
            src={favicon}
            className="w-8 h-8 rounded-full object-cover"
            alt="logo"
          />
          <p className="text-lg font-bold tracking-wide">Quick Chat</p>
        </div>

       
        <div className="relative menu-container">
          <img
            src={Menu}
            alt="menu"
            onClick={() => setMenu(!menu)}
            className="w-6 h-6 cursor-pointer hover:opacity-70 transition-all"
          />

          {menu && (
            <div className="z-50 absolute top-8 right-0 p-4 rounded-xl bg-white/95 text-gray-800 shadow-lg flex flex-col gap-3 w-44 animate-slideDown">
              <button
                className="text-left hover:text-blue-600 transition-colors"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
              <button
                className="text-left hover:text-blue-600 transition-colors"
                onClick={() => {
                  onOpenGroupModal();
                  setMenu(false);
                }}
              >
                👥 Create Group
              </button>
              <button
                className="text-left hover:text-blue-600 transition-colors"
                onClick={() => {
                  setIsEditProfileOpen(true);
                  setMenu(false);
                }}
              >
                ✏️ Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      
      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={(me) => {
            console.log("Updated user:", me);
            setIsEditProfileOpen(false);
          }}
          currentData={me}
          type={type}
        />
      )}

      
      <div className="flex items-center gap-2 w-full h-11 px-4 rounded-xl bg-gray-700/60">
        <img src={search_icon} alt="search" className="w-5 h-5 opacity-70" />
        <input
          type="text"
          placeholder="Search users & groups..."
          className="w-full bg-transparent outline-none text-sm placeholder-gray-300 text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-gray-300 hover:text-red-400"
          >
            ✕
          </button>
        )}
      </div>

      
      <div className="overflow-y-auto flex-1 pr-1 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {searchTerm && filteredUsers.length === 0 && filteredGroups.length === 0 && (
          <div className="text-center text-gray-400 py-6 text-sm">
            No results for "{searchTerm}"
          </div>
        )}

       
        {filteredUsers.map((user) => (
          <div
            onClick={() =>{ handleUserSelect(user),
                          onRight();
                          }}
            key={user._id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-gray-700/70 ${
              selectedUser._id === user._id ? "bg-gray-700/90" : ""
            }`}
          >
            <img
              src={user.picture}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium">{user.nickname}</span>
              <span className="text-xs text-gray-400">User</span>
            </div>
           
           </div>
        ))}

       
        {filteredGroups.map((group) => (
          
          <div
          
            onClick={() => {handleUserSelect(group),onRight()}}
            key={group._id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-gray-700/70 ${
              selectedUser._id === group._id ? "bg-gray-700/90" : ""
            }`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: getColorFromName(group.nickname) }}
            >
              {group.picture ? (
                <img
                  src={group.picture}
                  alt="group"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                group.nickname?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium">{group.nickname}</span>
              <span className="text-xs text-gray-400">
                {group.members?.length} members
              </span>
            </div>
            
          </div>
        ))}
      </div>

      


    </div>
  );
}

export default LeftSideBar;
