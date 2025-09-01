import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { deleteMe, setMe } from "../../Redux/meSlice";
import BASE from '../../api.js';
console.log("API BASE URL:", BASE);

function Profile() {
  const { user, isAuthenticated, isLoading, logout, getAccessTokenSilently } = useAuth0();
  const me = useSelector((state) => state?.me?.value);
  const dispatch = useDispatch();
  console.log("Auth0 me:", me);
  useEffect(() => {
    const sendTokenToBackend = async () => {
      const token = await getAccessTokenSilently();
      localStorage.setItem("token", token);
      
      const res = await fetch(`${BASE}/v1/storeuser`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(user),
        credentials: "include",
      });

      const data = await res.json();
      dispatch(setMe(data.user));
    };

    if (isAuthenticated) {
      sendTokenToBackend();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="text-white text-lg sm:text-xl animate-pulse text-center mt-20">
        Loading your profile...
      </div>
    );
  }

  return (
    isAuthenticated && (
      <div className="
        w-11/12 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 
        min-h-[420px] sm:min-h-[500px] 
        backdrop-blur bg-white/10 border border-white/20
        rounded-2xl py-6 px-4 sm:p-8 mx-auto 
        shadow-2xl flex flex-col items-center gap-5 animate-fade-in
      ">
        
       
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400 to-blue-500 blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
          <img
            src={me?.picture}
            alt={me?.name}
            className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 
            rounded-full object-cover border-4 border-white shadow-lg 
            transition-transform duration-300 group-hover:scale-105"
          />
        </div>

       
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-200 text-center px-2 break-words">
          Welcome, {me?.nickname}
        </h2>

        
        <p className="text-gray-300 text-sm sm:text-base break-words text-center">
          {me?.email}
        </p>

        
        <Link
          to="/chat"
          className="w-full sm:w-auto mt-4 px-5 py-2 sm:px-6 sm:py-3 
          bg-gradient-to-r from-green-400 to-blue-500 
          text-white font-semibold rounded-xl shadow-lg 
          hover:scale-105 transform transition duration-300 text-center"
        >
          🚀 Enter Chat Room
        </Link>

        <button
          onClick={() => {
             logout({
               logoutParams: {
               returnTo: window.location.origin, 
              },
            });
            localStorage.removeItem("token");
          }}
          className="w-full sm:w-auto mt-4 px-5 py-2 sm:px-6 sm:py-3 
          bg-red-600 hover:bg-red-500 
          text-white rounded-lg shadow transition duration-300 text-center"
        >
          Logout
        </button>
      </div>
    )
  );
}

export default Profile;
