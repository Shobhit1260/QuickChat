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

function LeftSideBar({ leftSideBarData }) {
  const dispatch = useDispatch();
  const { logout } = useAuth0();

  const selectedUser = useSelector((state) => state?.userSelected?.value);
  const me = useSelector((state) => state?.me?.value);
  const token = localStorage.getItem("token");

  const [menu, setMenu] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [memberSelected, setMemberSelected] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

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
        group.members.includes(me?._id) &&
        group.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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

    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (memberSelected.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsCreatingGroup(true);

    try {
      const res = await fetch(`${BASE}/v1/creategroup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname: groupName.trim(),
          membersId: memberSelected,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to create group");
      } else {
        setShowUsers(false);
        setGroupName("");
        setMemberSelected([]);
        setMenu(false);
        toast.success(data.message || "Group created successfully");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

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
    <div className="flex flex-col gap-4 w-full sm:w-[320px] lg:w-[400px] h-full px-4 py-4 bg-gradient-to-b from-gray-900/90 to-gray-800/90 text-white rounded-l-2xl backdrop-blur-lg">
   
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
                  setShowUsers(true);
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
            onClick={() => handleUserSelect(user)}
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
            onClick={() => handleUserSelect(group)}
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

      
      {showUsers && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-bold">Create Group</h2>
              <button
                onClick={() => setShowUsers(false)}
                className="text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <form className="p-6 flex flex-col gap-6" onSubmit={createGroup}>
              <div>
                <label className="text-sm font-medium">Group Name *</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCreatingGroup}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Select Members * ({memberSelected.length})
                </label>
                <div className="mt-2 max-h-56 overflow-y-auto border rounded-lg p-2">
                  {leftSideBarData.users?.map((user) => (
                    <label
                      key={user._id}
                      className="flex justify-between items-center px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={user.picture}
                          alt={user.nickname}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm">{user.nickname}</span>
                      </div>
                      <input
                        type="checkbox"
                        id={user._id}
                        checked={memberSelected.includes(user._id)}
                        onChange={changeHandler}
                        className="accent-blue-600"
                        disabled={isCreatingGroup}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  onClick={() => setShowUsers(false)}
                  disabled={isCreatingGroup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isCreatingGroup || !groupName.trim() || !memberSelected.length}
                >
                  {isCreatingGroup ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeftSideBar;
