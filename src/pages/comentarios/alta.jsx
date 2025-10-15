import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "react-select";
import Button from "@/components/ui/Button";
import useDarkMode from "@/hooks/useDarkMode";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";

const ComentariosAlta = () => {
  const [isDark] = useDarkMode();
  const [comentario, setComentario] = useState();
  const [estrellas, setEstrellas] = useState();
  const [viajeTourId, setVTID] = useState();
  const [cliente_id, setCliente] = useState();

  const [allclientes, setAllClientes] = useState([]);
  const [allviajes, setAllViajes] = useState([]);

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
    if(comentario == "" || comentario == undefined) {
      mostrarMensaje("Debes escribir un comentario");
    }else if(estrellas <= 0 || estrellas == undefined) {
      mostrarMensaje("Debes poner una calificación");
    }else if(viajeTourId <= 0 || viajeTourId == undefined) {
      mostrarMensaje("Debes seleccionar un id de viaje tour");
    }else if(cliente_id <= 0 || cliente_id == undefined) {
      mostrarMensaje("Debes seleccionar un cliente");    
    } else {
      const createComentario = async (dataForm) => {
        try {
          const res = await clienteAxios.post(
            "/cliente/comentario/crear",
            dataForm
          );
          console.log(res);
          navigate("/comentarios");
          
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.code);
        }
      };
      createComentario({ comentario, estrellas, viajeTourId: viajeTourId.value, cliente_id: cliente_id.value });
    }
  };

    //getClientes
    const getClientes = async () => {
      try {
        const res = await clienteAxios.get("/usuario/clientes");
        console.log(res.data)
        setAllClientes(res.data);
      } catch (error) {
        console.log(error);
        mostrarMensaje(error.code);
      }
    };
  
    //getViaje-Tour
    const getViajes = async () => {
      try {
        const res = await clienteAxios.get("/admin/viaje-tour/viaje-Tours");
        console.log(res.data)
        setAllViajes(res.data);
      } catch (error) {
        console.log(error);
        mostrarMensaje(error.code);
      }
    };

    useEffect(() => {
      getClientes();
      getViajes();
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
        <Card title="Alta de Comentarios">
          <form onSubmit={(e) => sendData(e)}>
            <div className="space-y-4">
              {/*Comentario*/}
              <Textinput
                onChange={(e) => setComentario(e.target.value)}
                label="Comentario *"
                placeholder="comentario"
                id="comentario"
                type="text"
              />

              {/*Estrellas*/}
              <Textinput
                onChange={(e) => setEstrellas(e.target.value)}
                label="Estrellas *"
                placeholder="Estrellas"
                id="estrellas"
                type="number"
                min="1"
                max="5"
              />

              {/*viajeTourId*/}
              <Select
                styles={customStyles}
                label="Viaje Tour *"
                placeholder="Seleccione un viaje"
                id="viajeTourId"
                options={allviajes.map((item) => ({
                  label: item.fecha_ida.substr(0, 10)+' -- '+item.fecha_regreso.substr(0, 10)+' Tour '+item.tour_id,
                  value: item.id,
                }))}
                value={viajeTourId}
                onChange={setVTID}
                isSearchable={true}
              ></Select>


              {/*cliente_id*/}
              <Select
                styles={customStyles}
                label="Cliente *"
                placeholder="Seleccione un cliente"
                id="cliente_id"
                options={allclientes.map((item) => ({
                  label: item.nombres+' '+item.apellidos,
                  value: item.id,
                }))}
                value={cliente_id}
                onChange={setCliente}
                isSearchable={true}
              ></Select>

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

export default ComentariosAlta;
