import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";

const CategoriasEditar = () => {
  const [nombre, setNombre] = useState();

  const id = localStorage.getItem("EditCategoria");
  const getCategoria = async () => {
    try {
      const res = await clienteAxios.get("/admin/categoria/obtener/" + id);
      setNombre(res.data[0].nombre);
    } catch (error) {
      console.log(error);
      mostrarMensaje(error.code);
    }
  };

  useEffect(() => {
    getCategoria();
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
      mostrarMensaje("Debes escribir el nombre de la categoría");
    } else {
      const editCategoria = async () => {
        try {
          const res = await clienteAxios.put("/admin/categoria/set", {
            id,
            nombre,
          });
          console.log(res);
          navigate("/categorias");
          
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.code);
        }
      };
      editCategoria();
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
        <Card title="Editar Categorías">
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

export default CategoriasEditar;
