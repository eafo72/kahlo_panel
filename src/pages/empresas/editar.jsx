import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";

const EmpresasEditar = () => {
  const [nombre, setNombre] = useState();
  const [telefono, setTelefono] = useState();
  const [correo, setCorreo] = useState();
  const [ubicacion, setUbicacion] = useState();
  const [descripcion, setDescripcion] = useState();
  const [image, setImage] = useState();
  const [logoOld, setLogoOld] = useState();
  const [paypal, setPaypal] = useState();
  const [tarjeta, setTarjeta] = useState();

  const id = localStorage.getItem("EditEmpresa");
  const getEmpresa = async () => {
    try {
      const res = await clienteAxios.get("/admin/empresa/obtener/" + id);
      setNombre(res.data[0].nombre);
      setTelefono(res.data[0].telefono);
      setCorreo(res.data[0].correo);
      setUbicacion(res.data[0].ubicacion);
      setDescripcion(res.data[0].descripcion);
      setLogoOld(res.data[0].logo);
      setPaypal(res.data[0].paypal);
      setTarjeta(res.data[0].tarjeta);
    } catch (error) {
      console.log(error);
      mostrarMensaje(error.code);
    }
  };

  useEffect(() => {
    getEmpresa();
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
      const editEmpresa = async () => {
        try {
          const res = await clienteAxios({
            method: "put",
            url: "/admin/empresa/set",
            data: {
              id,
              nombre,
              telefono,
              correo,
              ubicacion,
              descripcion,
              image,
              paypal,
              tarjeta
            },
            headers: { "Content-Type": "multipart/form-data" },
          });


          console.log(res);
          navigate("/empresas");
          
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.code);
        }
      };
      editEmpresa();
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
        <Card title="Editar Empresas">
          <form onSubmit={(e) => sendData(e)}>
            <div className="space-y-4">
              {/*Nombre*/}
              <Textinput
                onChange={(e) => setNombre(e.target.value)}
                label="Nombre *"
                placeholder="Nombre"
                id="nombre"
                type="text"
                defaultValue={nombre}
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

              {/*Correo*/}
              <Textinput
                onChange={(e) => setCorreo(e.target.value)}
                label="Correo *"
                placeholder="Correo"
                id="correo"
                type="email"
                defaultValue={correo}
              />

              {/*Ubicacion*/}
              <Textinput
                onChange={(e) => setUbicacion(e.target.value)}
                label="Ubicacion *"
                placeholder="Ubicacion"
                id="ubicacion"
                type="text"
                defaultValue={ubicacion}
              />

              {/*Descripcion*/}
              <Textinput
                onChange={(e) => setDescripcion(e.target.value)}
                label="Descripción *"
                placeholder="Descripción"
                id="descripcion"
                type="text"
                defaultValue={descripcion}
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
                defaultValue={paypal}
              />

              {/*tarjeta*/}
              <Textinput
                onChange={(e) => setTarjeta(e.target.value)}
                label="No.de Tarjeta"
                placeholder="No.de Tarjeta"
                id="tarjeta"
                type="text"
                defaultValue={tarjeta}
              />

              <div className=" space-y-4">
                <p>* Campos requeridos</p>
                <Button text="Guardar" type="submit" className="btn-dark" />
              </div>
            </div>
          </form>
        </Card>
        <Card title="Documentos Actuales">
          <p >Logo:</p>
          <img src={logoOld} className="w-full h-full" />
        </Card>  
      </div>
    </>
  );
};

export default EmpresasEditar;
