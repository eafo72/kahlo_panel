import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../pages/context/userContext";

const Logout = () => {
  
  const navigate = useNavigate();
  const userCtx = useContext(UserContext);
  const { SignOut } = userCtx;


  const handleLogout = () => {
    SignOut();
    navigate("/");
  };

  return (
    <div className="mt-6">
      <button onClick={(e) => handleLogout()} className="btn btn-success hover:bg-opacity-80 text-slate-900 btn-sm w-full block">
        Logout
      </button>
    </div>
  );
};

export default Logout;
