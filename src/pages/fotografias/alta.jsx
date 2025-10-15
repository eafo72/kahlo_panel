import React, { useState, useEffect, useContext } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "react-select";
import Button from "@/components/ui/Button";
import useDarkMode from "@/hooks/useDarkMode";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";

import clienteAxios from "../../configs/axios";

const FotografiasAlta = () => {
  const [isDark] = useDarkMode();

  const userCtx = useContext(UserContext);
  const { user, verifyingToken } = userCtx;


  const [userData, setUserData] = useState("");

  const navigate = useNavigate();

  const mostrarMensaje = (mensaje) => {
    toast.error(mensaje, {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
      theme: "dark",
    });
  }
  const mostrarMensajeSuccess   = (mensaje) => {
    toast.success(mensaje, {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
      theme: "dark",
    });
  }

  const sendData = (event) => {
    event.preventDefault();

    const createFotografia = async (dataForm) => {
      try {
        const res = await clienteAxios.post("/photos/start", dataForm);
        //console.log(res);
        if(!res.error) {
          mostrarMensajeSuccess("Fotografía creada con éxito, id: " + res.data.id);
          navigate("/fotografias/alta");
        }

      } catch (error) {
        console.log(error);
        mostrarMensaje(error.code);
      }
    };


    createFotografia({ id_usuario: userData.id, nombre: userData.nombres + " " + userData.apellidos, correo: userData.correo, telefono: userData.telefono });

  };



  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }

    verifyingToken();
    console.log(user);  

    if (user) {
      setUserData(Array.isArray(user) ? user[0] : user);
    }


  }, []);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: isDark
        ? "rgb(15 23 42 / var(--tw-bg-opacity))"
        : "transparent",
    }),
    option: (base, state) => {
      return {
        ...base,
        background: isDark ? "rgb(15 23 42 / var(--tw-bg-opacity))" : "",
        color: state.isFocused ? (isDark ? "white" : "black") : "grey",
      };
    },
  };

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
        <Card title="Alta de Fotografía">
          <form onSubmit={(e) => sendData(e)}>
            <div className="space-y-4">



              <div className=" space-y-4">
                <Button text="Escanear código QR" type="submit" className="btn-dark" />
              </div>

            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default FotografiasAlta;
