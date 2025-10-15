import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";

const EmpresasAlta = () => {
  const [nombre, setNombre] = useState();
  const [telefono, setTelefono] = useState();
  const [correo, setCorreo] = useState();
  const [ubicacion, setUbicacion] = useState();
  const [descripcion, setDescripcion] = useState();
  const [image, setImage] = useState();
  const [paypal, setPaypal] = useState();
  const [tarjeta, setTarjeta] = useState();

  

  const navigate = useNavigate();

  const mostrarMensaje = (mensaje) =>{
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

  const sendData = (event) => {
    event.preventDefault();

    //validamos campos
    if(nombre == "" || nombre == undefined) {
      mostrarMensaje("Debes escribir un nombre de empresa");
    }else if(telefono == "" || telefono == undefined) {
      mostrarMensaje("Debes escribir un teléfono");
    }else if(correo == "" || correo == undefined) {
      mostrarMensaje("Debes escribir un correo"); 
    }else if(ubicacion == "" || ubicacion == undefined) {
      mostrarMensaje("Debes escribir una ubicación"); 
    }else if(descripcion == "" || descripcion == undefined) {
      mostrarMensaje("Debes escribir una descripción");   
    } else {
      const createEmpresa = async (dataForm) => {
        try {
          const res = await clienteAxios({
            method: "post",
            url: "/admin/empresa/crear",
            data: dataForm,
            headers: { "Content-Type": "multipart/form-data" },
          });


          console.log(res);
          navigate("/empresas");
          
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.code);
        }
      };
      createEmpresa({
        nombre,
        telefono,
        correo,
        ubicacion,
        descripcion,
        image,
        paypal,
        tarjeta,
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
        <Card title="Alta de Empresas">
          <form onSubmit={(e) => sendData(e)}>
            <div className="space-y-4">
              {/*Nombre*/}
              <Textinput
                onChange={(e) => setNombre(e.target.value)}
                label="Nombre *"
                placeholder="Nombre"
                id="nombre"
                type="text"
              />

              {/*telefono*/}
              <Textinput
                onChange={(e) => setTelefono(e.target.value)}
                label="Teléfono *"
                placeholder="Teléfono"
                id="telefono"
                type="tel"
              />

              {/*Correo*/}
              <Textinput
                onChange={(e) => setCorreo(e.target.value)}
                label="Correo *"
                placeholder="Correo"
                id="correo"
                type="email"
              />

              {/*Ubicacion*/}
              <Textinput
                onChange={(e) => setUbicacion(e.target.value)}
                label="Ubicacion *"
                placeholder="Ubicacion"
                id="ubicacion"
                type="text"
              />

              {/*Descripcion*/}
              <Textinput
                onChange={(e) => setDescripcion(e.target.value)}
                label="Descripción *"
                placeholder="Descripción"
                id="descripcion"
                type="text"
              />

              {/*Logo*/}
              <Textinput
                onChange={(e) => setImage(e.target.files[0])}
                label="Logo"
                placeholder="Logo"
                id="image"
                type="file"
              />

              {/*Paypal*/}
              <Textinput
                onChange={(e) => setPaypal(e.target.value)}
                label="Paypal"
                placeholder="Paypal"
                id="paypal"
                type="text"
              />

              {/*tarjeta*/}
              <Textinput
                onChange={(e) => setTarjeta(e.target.value)}
                label="No.de Tarjeta"
                placeholder="No.de Tarjeta"
                id="tarjeta"
                type="text"
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

export default EmpresasAlta;
