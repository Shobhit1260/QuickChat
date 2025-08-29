import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from 'react-redux';

function RightSideBar() {
  const { logout } = useAuth0();
  const userSelected = useSelector((state) => state?.userSelected?.value);

  if (!userSelected) return null; 

  
  if (userSelected?.members?.length > 0) {
    console.log("members:", userSelected.members);
  } else {
    console.log("userSelected:", userSelected);
  }

 
  return (
    <div className="p-4">
      
      {
        userSelected?.members?.length > 0 ? (
          <div>
            <p className="font-medium">Group Members:</p>
            <ul className="list-disc pl-4">
              {userSelected.members.map((member, idx) => (
                <li key={idx}>{member.nickname}</li>
              ))}
            </ul>
          </div>
        ) : (
          null
        )
      }
    </div>
  );
}

export default RightSideBar;
