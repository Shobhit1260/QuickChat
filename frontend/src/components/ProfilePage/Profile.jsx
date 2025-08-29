import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setMe } from "../../Redux/meSlice";

function Profile(){
  const { user, isAuthenticated, isLoading, logout, getAccessTokenSilently } = useAuth0();
  const me = useSelector((state) => state?.me?.value);
  const userSelected = useSelector((state) => state?.userSelected?.value);
  const dispatch = useDispatch();

  useEffect(() => {
      const sendtokentoBackend = async () => {
      const token = await getAccessTokenSilently();
  
      localStorage.setItem("token", token);
      const res = await fetch('http://localhost:8000/v1/storeuser', {
        method: "POST",
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user),
        credentials: "include"
      })
      const data = await res.json();
      dispatch(setMe(data.user));
    }
    if (isAuthenticated) {
      sendtokentoBackend();
    }
    
  }, [isAuthenticated]);



  if (isLoading) {
    return (
      <div className="text-white text-xl sm:text-2xl animate-pulse text-center mt-20">
        Loading the profile...
      </div>
    );
  }

  return (

    isAuthenticated && (
      <div className="
        w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 
        min-h-[430px] sm:min-h-[560px] md:min-h-[600px] 
        backdrop-blur bg-white/10 
        rounded-2xl py-6 px-3 sm:p-8 mx-auto mt-10 
        shadow-xl flex flex-col justify-start items-center gap-4 sm:gap-6 animate-fade-in
      ">
       
        <div className="relative group mb-2">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400 to-blue-500 blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
          <img
            src={user?.picture}
            className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
            alt={user?.name}
          />
        </div>

        
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-cyan-200 font-bold tracking-wide text-center px-2 break-all">
          Welcome, {user?.name}
        </h2>

       
        <Link
          to="/chat"
          className="w-full sm:w-auto mt-4 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-medium rounded-xl shadow hover:scale-105 transform transition duration-300 text-center"
        >
          🚀 Enter Chat Room
        </Link>

       
        <button
          onClick={() => logout()}
          className="w-full sm:w-auto mt-4 px-4 py-2 sm:px-5 sm:py-2 bg-red-600 hover:bg-red-400 text-white rounded-lg shadow transition duration-300 text-center"
        >
          Logout
        </button>
      </div>
    )
  );
};

export default Profile;
