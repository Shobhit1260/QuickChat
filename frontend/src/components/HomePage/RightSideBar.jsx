import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector, useDispatch } from "react-redux";
import { deleteMe } from "../../Redux/meSlice";

function RightSideBar() {
  const { logout, user } = useAuth0();
  const userSelected = useSelector((state) => state?.userSelected?.value);
  const isChatOpen = useSelector((state) => state?.chat?.isOpen);
  const me = useSelector((state) => state?.me?.value); 
  const dispatch = useDispatch();

  if (isChatOpen) return null; 
  if (!userSelected && !me) return null; 
  console.log("me",me); 
  const isGroup = Array.isArray(userSelected?.members);

  return (
    <div className="p-4 w-72 h-full border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col justify-between">
      
      
      {userSelected && (
        <div className="flex flex-col items-center border-b border-gray-300 pb-4 mb-4">
      
          {!isGroup && userSelected.picture && (
            <img
              src={userSelected.picture}
              alt={userSelected.nickname}
              className="w-20 h-20 rounded-full mb-4 shadow-md"
            />
          )}

        
          <h2 className="text-lg font-semibold text-center text-white mb-1">
            {isGroup ? userSelected.nickname : userSelected.nickname }
          </h2>

         
          {!isGroup && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {userSelected.email}
            </p>
          )}

          
          {isGroup && (
            <div className="mt-3 w-full">
              <p className="text-sm font-medium mb-1">👥 Members:</p>
              <ul className="text-sm list-disc pl-4 space-y-1 max-h-32 overflow-y-auto">
                {userSelected.members.map((m, idx) => (
                  <li key={idx}>
                    {m?.name || m?.nickname || "Unknown"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    
      {me && (
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-bold text-green-400 text-2xl">
            My Profile
          </h3>
          <img
            src={me?.picture || user?.picture}
            alt={me?.nickname || user?.nickname}
            className="w-28 h-28 rounded-full mb-2 shadow-md text-white"
          />
          <h3 className="font-semibold text-white text-xxl">
            {me?.nickname || user?.nickname}
          </h3>
          <p className="text-gray-600 dark:text-gray-400  text-xxl">
            {me?.email || user?.email}
          </p>

          <button
            onClick={() => {
              logout({ returnTo: window.location.origin });
              dispatch(deleteMe());
              localStorage.removeItem("token");
            }}
            className="mt-3 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default RightSideBar;
