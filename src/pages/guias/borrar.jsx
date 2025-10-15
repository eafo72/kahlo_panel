import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";

const GuiasBorrar = () => {
  const id = localStorage.getItem("DeleteGuia");

  const navigate = useNavigate();

  const deleteGuia = async () => {
    try {
      const res = await clienteAxios.put("/admin/guia/delete", { id });
      console.log(res);
      navigate("/guias");
      
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
    navigate("/guias");
  };

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
        <Card title="Borrar Guias">
          <div className="space-y-4">
            <div className=" space-y-4 text-center">
              <p>¿Seguro que desea borrar el guía: {id}?</p>
              <Button
                text="Borrar"
                onClick={() => deleteGuia()}
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

export default GuiasBorrar;
