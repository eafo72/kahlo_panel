import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";

const FotosToursAlta = () => {
  const [image, setImage] = useState();
  const [fotos, setFotos] = useState([]);

  const [activeModal, setActiveModal] = useState(false);

  const id = localStorage.getItem("FotosTour");

  const navigate = useNavigate();

  const getFotos = async () => {
    try {
      const res = await clienteAxios.get(
        "/admin/fotos-tour/obtenerbytour/" + id
      );
      console.log(res.data);
      setFotos(res.data);
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

  useEffect(() => {
    getFotos();
  }, []);

  const goFoto = (idFoto) => {
    localStorage.setItem("BorrarFotosTour",idFoto);
    navigate("/tours/borrar_foto");
  }

  const sendData = (event) => {
    event.preventDefault();

    //validamos campos
    if (image == "" || image == undefined) {
      setActiveModal(true);
    } else {
      const createTour = async (dataForm) => {
        try {
          const res = await clienteAxios({
            method: "post",
            url: "/admin/fotos-tour/crear",
            data: dataForm,
            headers: { "Content-Type": "multipart/form-data" },
          });

          console.log(res);
          toast.success("Foto guardada", {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
            theme: "dark",
          });
          document.getElementById("image").value = null;
          getFotos();



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
      createTour({ id, image });
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
           
        <Card title="Alta de Fotos">
          <form onSubmit={(e) => sendData(e)}>
            <div className="space-y-4">
              {/*thumb*/}
              <Textinput
                onChange={(e) => setImage(e.target.files[0])}
                label="Foto *"
                placeholder="Foto"
                id="image"
                type="file"
              />

              <div className=" space-y-4">
                <p>* Campos requeridos</p>
                <Button text="Guardar" type="submit" className="btn-dark" />
              </div>
              <div>
                <Modal
                  activeModal={activeModal}
                  onClose={() => setActiveModal(false)}
                  title="Aviso"
                  footer={
                    <Button
                      text="Close"
                      btnClass="btn-primary"
                      onClick={() => setActiveModal(false)}
                    />
                  }
                >
                  <h4 className="font-medium text-lg mb-3 text-slate-900 ">
                    <Icon
                      icon="heroicons-outline:bell"
                      className="animate-tada text-danger-500"
                    />
                    ¡Alerta!
                  </h4>
                  <div className="text-base text-slate-600 dark:text-slate-300">
                    Debes llenar todos los campos
                  </div>
                </Modal>
              </div>
            </div>
          </form>
        </Card>
        <Card title="Fotos Actuales">
            <div className="grid grid-cols-4 gap-5">
                {fotos.map((item, i) => {
                    return <div key={item.id}><button onClick={() => goFoto(item.id)} ><img  alt={item.titulo} src={item.url} className="w-full h-full" /></button></div>;
                })}
           </div>
        </Card> 
      </div>
    </>
  );
};

export default FotosToursAlta;
