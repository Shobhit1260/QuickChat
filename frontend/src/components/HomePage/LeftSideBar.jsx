import React, { useState, useEffect } from 'react'
import favicon from '../../chat-app-assests/favicon.svg'
import Menu from '../../chat-app-assests/menu_icon.png';
import search_icon from '../../chat-app-assests/search_icon.png';
import { setSelectedUser, clearSelectedUser } from '../../Redux/UserSlice.js'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import BASE from  '../../api.js'

function LeftSideBar({ leftSideBarData}) {
  const dispatch = useDispatch();
  const { logout } = useAuth0();

  const selectedUser = useSelector((state) => state?.userSelected?.value);
  const me = useSelector((state) => state?.me?.value);
  const token = localStorage.getItem("token");
  
  const [menu, setMenu] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [groupName, setGroupName] = useState("");
  const [memberSelected, setMemberSelected] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menu && !event.target.closest('.menu-container')) {
        setMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menu]);

  // Filter users and groups based on search
  const filteredUsers = leftSideBarData.users?.filter(user =>
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredGroups = leftSideBarData.groups?.filter(group =>
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
  }

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
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nickname: groupName.trim(),
          membersId: memberSelected
        })
      });

      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.message || "Failed to create group");
      } else {
        // Reset form
        setShowUsers(false);
        setGroupName("");
        setMemberSelected([]);
        setMenu(false);
        
        toast.success(data.message || "Group created successfully");
        
        // // Trigger data refresh in parent component
        // if (onDataUpdate) {
        //   onDataUpdate();
        // }
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsCreatingGroup(false);
    }
  }

  const handleLogout = () => {
    try {
      // Clear local storage
      localStorage.removeItem("token");
      
      // Clear Redux state
      dispatch(clearSelectedUser());
      
      // Auth0 logout
      logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  }

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
    setMenu(false); // Close menu when selecting user
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-4 justify-start items-center w-[500px] h-[100%] px-4 py-4 backdrop-bg bg-white/20 rounded-l-xl">
      {/* Header */}
      <div className='flex justify-between items-center p-2 w-full'>
        <div className="flex gap-2 items-center">
          <img src={favicon} className="w-8 aspect-[1/1] rounded-full object-cover" alt="logo" />
          <p className='text-xl font-semibold'>Quick Chat</p>
        </div>
        
        <div className="w-5 aspect-[1/1] rounded-full relative menu-container">
          <img 
            src={Menu} 
            alt="menu" 
            onClick={() => setMenu(!menu)}
            className="cursor-pointer hover:opacity-70 transition-opacity"
          />
          
          {menu && (
            <div className='z-40 absolute top-6 right-0 p-4 rounded-lg backdrop-blur bg-white shadow-lg flex flex-col gap-2 w-max h-min'>
              <button 
                className='font-serif text-sm text-gray-600 hover:text-gray-800 cursor-pointer text-left transition-colors'
                onClick={handleLogout}
              >
                Logout
              </button>
              <button 
                className='font-serif text-sm text-gray-600 hover:text-gray-800 cursor-pointer text-left transition-colors'
                onClick={() => {
                  setShowUsers(true);
                  setMenu(false);
                }}
              >
                Create Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className='w-full flex justify-start items-center gap-2 h-12 rounded-xl backdrop-blur bg-white/50 px-4 py-2 text-white text-lg'>
        <div className='w-5 aspect-[1/1]'>
          <img src={search_icon} alt="search" className='object-cover' />
        </div>
        <input 
          type="text" 
          placeholder="Search users and groups..." 
          className='outline-none w-full h-[100%] bg-transparent placeholder-gray-400 text-gray-800'
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button 
            onClick={clearSearch}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            ✕
          </button>
        )}
      </div>

      {/* Users and Groups List */}
      <div className='overflow-y-auto mx-4 my-4 w-full flex flex-col gap-2'>
        {/* Show message if no results */}
        {searchTerm && filteredUsers.length === 0 && filteredGroups.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No users or groups found for "{searchTerm}"
          </div>
        )}

        {/* Users List */}
        {filteredUsers.map((user) => (
          <div
            onClick={() => handleUserSelect(user)}
            key={user._id}
            className={`w-full px-4 py-2 flex gap-3 justify-start items-center rounded-xl cursor-pointer transition-all hover:bg-white/20 ${
              selectedUser._id === user._id ? 'backdrop-blur bg-white/30' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img src={user.picture} alt="profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{user.nickname}</div>
              <div className="text-xs text-gray-500 truncate">User</div>
            </div>
          </div>
        ))}

        {/* Groups List */}
        {filteredGroups.map((group) => (
          <div
            onClick={() => handleUserSelect(group)}
            key={group._id}
            className={`w-full px-4 py-2 flex gap-3 justify-start items-center rounded-xl cursor-pointer transition-all hover:bg-white/20 ${
              selectedUser._id === group._id ? 'backdrop-blur bg-white/30' : ''
            }`}
          >
            <div 
              className="w-10 h-10 rounded-full flex justify-center items-center text-white font-semibold text-sm flex-shrink-0"
              style={{ backgroundColor: getColorFromName(group.nickname || 'Group') }}
            >
              {group.picture ? (
                <img src={group.picture} alt="group" className="w-full h-full object-cover rounded-full" />
              ) : (
                group.nickname?.charAt(0).toUpperCase() || 'G'
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{group.nickname}</div>
              <div className="text-xs text-gray-500 truncate">
                {group.members?.length || 0} members
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Modal */}
      {showUsers && (
        <div className="z-40 fixed inset-0 p-4 bg-black/50 flex justify-center items-center">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-black">Create New Group</h1>
              <button 
                onClick={() => setShowUsers(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
                disabled={isCreatingGroup}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form className='flex flex-col gap-6 w-full' onSubmit={createGroup}>
                {/* Group Name Input */}
                <div className='flex flex-col gap-2'>
                  <label htmlFor="groupName" className="text-black font-medium text-lg">
                    Group Name *
                  </label>
                  <input
                    id="groupName"
                    type="text"
                    className="text-black border border-gray-300 rounded-md p-3 outline-none w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    name="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    maxLength={50}
                    disabled={isCreatingGroup}
                  />
                </div>

                {/* Members Selection */}
                <div className='flex flex-col gap-4'>
                  <label className="text-black font-medium text-lg">
                    Select Members * ({memberSelected.length} selected)
                  </label>
                  
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {leftSideBarData.users?.map((user) => (
                      <div
                        key={user._id}
                        className="flex justify-between items-center p-3 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={user.picture}
                              alt={user.nickname}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-black font-medium">{user.nickname}</span>
                        </div>

                        <input
                          type="checkbox"
                          id={user._id}
                          onChange={changeHandler}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isCreatingGroup}
                          checked={memberSelected.includes(user._id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
                  <button 
                    type="button"
                    onClick={() => setShowUsers(false)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    disabled={isCreatingGroup}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={isCreatingGroup || !groupName.trim() || memberSelected.length === 0}
                  >
                    {isCreatingGroup ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Creating...
                      </span>
                    ) : (
                      'Create Group'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeftSideBar;