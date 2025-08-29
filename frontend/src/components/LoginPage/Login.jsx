import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import bgImage from '../../chat-app-assests/bgImage.svg';

function Login() {
  const { user, loginWithRedirect,isAuthenticated, logout,getAccessTokenSilently} = useAuth0();
  
  console.log("user:", isAuthenticated);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-lg text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-6 text-white">Welcome to Quick Chat</h1>
        <button
          onClick={() => loginWithRedirect({
            authorizationParams: {
              redirect_uri: window.location.origin + "/profile"
            }
          })}
          className="w-full py-3 text-white bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition"
        >
          Sign in with Auth0
        </button>
      </div>
    </div>
  );
}

export default Login;
