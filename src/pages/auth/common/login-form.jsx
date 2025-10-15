import React, { useState, useEffect, useContext } from "react";
import Textinput from "@/components/ui/Textinput";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { UserContext } from "../../context/userContext";


const LoginForm = () => {

  const userCtx = useContext(UserContext);
  const { loginUser, verifyingToken } = userCtx;
  const navigate = useNavigate();

  const [email, setEmail] = useState();
  const [password, setPassw] = useState();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }

    verifyingToken();
  }, []);

  const onSubmit = () => {

    if (!email) {
      toast.error("Debes escribir tu email", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
      });
    } else if (!password) {
      toast.error("Debes escribir tu password", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
      });
    } else {
      toast.info("Espere un momento...", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
      });

      loginUser({ email, password });
    }


  };

 const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
     <form onSubmit={handleFormSubmit} className="space-y-4">
      <Textinput
        onChange={(e) => setEmail(e.target.value)}
        label="Email"
        placeholder="Escribe tu email"
        id="email"
        type="email"
      />
      <Textinput
        onChange={(e) => setPassw(e.target.value)}
        label="Password"
        type="password"
        id="password"
        placeholder="Escribe tu password"
      />

      <button type="submit" className="btn btn-dark block w-full text-center">Sign in</button>
    </form>
  );
};

export default LoginForm;
