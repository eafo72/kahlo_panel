import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";

const AdministradoresBorrar = () => {
  const id = localStorage.getItem("DeleteAdministrador");

  const navigate = useNavigate();

  const deleteAdministrador = async () => {
    try {
      const res = await clienteAxios.put("/admin/admin/delete", { id });
      console.log(res);
      navigate("/administradores");
      
    } catch (error) {
      console.log(error);
      toast.error(error.code, {
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
  };

  const regresar = () => {
    navigate("/administradores");
  };

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
        <Card title="Borrar Administradores">
          <div className="space-y-4">
            <div className=" space-y-4 text-center">
              <p>¿Seguro que desea borrar el administrador: {id}?</p>
              <Button
                text="Borrar"
                onClick={() => deleteAdministrador()}
                className="btn-danger m-5"
              />
              <Button
                text="Regresar"
                onClick={() => regresar()}
                className="btn-dark m-5"
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default AdministradoresBorrar;
