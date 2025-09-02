import React from "react";

function CreateGroupModal({
  isOpen,
  onClose,
  groupName,
  setGroupName,
  memberSelected,
  setMemberSelected,
  changeHandler,
  isCreatingGroup,
  leftSideBarData,
  createGroup,
}) {
  if (!isOpen) return null; 

  
  
  console.log("leftSideBarData in CreateGroupModal:", leftSideBarData);

  return (
    <div className="my-8 md:my-0 fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl h-screen sm:h-auto sm:rounded-xl bg-white text-black shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Create Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            ✕
          </button>
        </div>

       
        <form
          className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto"
          onSubmit={createGroup}
        >
         
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
              onClick={onClose}
              disabled={isCreatingGroup}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              disabled={
                isCreatingGroup || !groupName.trim() || !memberSelected.length
              }
            >
              {isCreatingGroup ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroupModal;
