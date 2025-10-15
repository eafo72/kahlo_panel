import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";

const UsuariosEditar = () => {
  const [nombres, setNombres] = useState();
  const [apellidos, setApellidos] = useState();
  const [correo, setCorreo] = useState();
  const [telefono, setTelefono] = useState();
  const [telefono_emergencia, setTelefonoEmergencia] = useState();
  const [password, setPassword] = useState();

  const id = localStorage.getItem("EditUser");
  const getUser = async () => {
    try {
      const res = await clienteAxios.get("/usuario/obtener/" + id);
      setNombres(res.data[0].nombres);
      setApellidos(res.data[0].apellidos);
      setCorreo(res.data[0].correo);
      setTelefono(res.data[0].telefono);
      setTelefonoEmergencia(res.data[0].telefono_emergencia);
    } catch (error) {
      console.log(error);
      mostrarMensaje(error.code);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

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
  };

  const sendData = (event) => {
    event.preventDefault();

    //validamos campos
    if(nombres == "" || nombres == undefined) {
      mostrarMensaje("Debes escribir al menos un nombre");
    }else if(apellidos == "" || apellidos == undefined) {
      mostrarMensaje("Debes escribir al menos un apellido");
    }else if(correo == "" || correo == undefined) {
      mostrarMensaje("Debes escribir un correo");
    }else if(telefono == "" || telefono == undefined) {
      mostrarMensaje("Debes escribir un teléfono");  
    }else if(telefono_emergencia == "" || telefono_emergencia == undefined) {
      mostrarMensaje("Debes escribir un teléfono de emergencia");    
    } else {
      const editUser = async () => {
        try {
          const res = await clienteAxios.put("/usuario/set", {
            id,
            nombres,
            apellidos,
            correo,
            telefono,
            telefono_emergencia,
            password
          });
          console.log(res);
          navigate("/usuarios");
          
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.response.data.msg);
        }
      };
      editUser();
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
        <Card title="Editar Usuarios">
          <form onSubmit={(e) => sendData(e)}>
            <div className="space-y-4">
              {/*Nombres*/}
              <Textinput
                onChange={(e) => setNombres(e.target.value)}
                label="Nombres *"
                placeholder="Nombres"
                id="nombres"
                type="text"
                defaultValue={nombres}
              />

              {/*Apellidos*/}
              <Textinput
                onChange={(e) => setApellidos(e.target.value)}
                label="Apellidos *"
                placeholder="Apellidos"
                id="apellidos"
                type="text"
                defaultValue={apellidos}
              />

              

              {/*telefono*/}
              <Textinput
                onChange={(e) => setTelefono(e.target.value)}
                label="Teléfono *"
                placeholder="Teléfono"
                id="telefono"
                type="tel"
                defaultValue={telefono}
              />

               {/*telefono emergencia*/}
               <Textinput
                onChange={(e) => setTelefonoEmergencia(e.target.value)}
                label="Teléfono de emergencia*"
                placeholder="Teléfono de emergencia"
                id="telefono_emergencia"
                type="tel"
                defaultValue={telefono_emergencia}
              />

              {/*Password*/}
              <Textinput
                onChange={(e) => setPassword(e.target.value)}
                label="Contraseña"
                placeholder="Contraseña"
                id="passw"
                type="password"
              />

              <div className=" space-y-4">
                <p>* Campos requeridos</p>
                <Button text="Guardar" type="submit" className="btn-dark" />
              </div>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default UsuariosEditar;
