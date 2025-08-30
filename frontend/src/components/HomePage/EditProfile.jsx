import React, { useState } from "react";
import BASE from "../../api.js";

const EditProfileModal = ({ isOpen, onClose, onSave, currentData, type }) => {
 
  const [nickname, setnickname] = useState(currentData?.nickname || "");
  const [profilePhoto, setProfilePhoto] = useState(null);

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("nickname", nickname);

    if (profilePhoto) {
      formData.append("picture", profilePhoto);
    }

    if (type === "group") {
      formData.append("groupId", currentData._id); 
    }

    const endpoint =
      type === "user" ? `${BASE}/v1/updateuser` : `${BASE}/v1/updategroup`;

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      setLoading(false);
      console.log("Response data:", data); 
      if (res.ok) {
        console.log("Update successful:", data);
        onSave?.(type === "user" ? data.user : data.group);
        onClose();
      } else {
        alert(data.message || "Something went wrong!");
      }
    } catch (error) {
      setLoading(false);
      console.error("Update failed:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
         
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          ></div>

          
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-11/12 max-w-md shadow-xl animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {type === "user" ? "Edit Profile" : "Edit Group"}
            </h2>

            
            <div className="flex flex-col items-center mb-4">
              <img
                src={
                  profilePhoto
                    ? URL.createObjectURL(profilePhoto)
                    : currentData.picture || "https://via.placeholder.com/100"
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mb-2 border border-gray-300 dark:border-gray-700"
              />
              <input
                type="file"
                name="picture"
                accept="image/*"
                onChange={(e) => setProfilePhoto(e.target.files[0])}
                className="w-full text-sm text-gray-600 dark:text-gray-300"
              />
            </div>

       
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {type === "user" ? "Username" : "Group Name"}
              </label>
              <input
                type="text"
                name="nickname"
                value={nickname}
                onChange={(e) => setnickname(e.target.value)}
                className="w-full border p-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfileModal;
