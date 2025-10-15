import React, { useState, useEffect, useContext } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "react-select";
import Button from "@/components/ui/Button";
import useDarkMode from "@/hooks/useDarkMode";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";
import { UserContext } from "../../pages/context/userContext";

const GuiasAlta = () => {
  const [loading, setLoading] = useState(true);
  const [isDark] = useDarkMode();
  const [nombres, setNombres] = useState();
  const [apellidos, setApellidos] = useState();
  const [correo, setCorreo] = useState();
  const [foto, setFoto] = useState();
  const [identificacion, setIdentificacion] = useState();
  const [empresa_id, setEmpresa] = useState();

  const [allempresas, setAllEmpresas] = useState([]);

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

  const userCtx = useContext(UserContext);
  const { user, authStatus, verifyingToken } = userCtx;

  const sendData = (event) => {
    event.preventDefault();

    

    //validamos campos
    if(nombres == "" || nombres == undefined) {
      mostrarMensaje("Debes escribir al menos un nombre");
    }else if(apellidos == "" || apellidos == undefined) {
      mostrarMensaje("Debes escribir al menos un apellido");
    }else if(correo == "" || correo == undefined) {
      mostrarMensaje("Debes escribir un correo");
    }else if(foto == "" || foto == undefined) {
      mostrarMensaje("Debes seleccionar una foto");
    }else if(identificacion == "" || identificacion == undefined) {
      mostrarMensaje("Debes seleccionar una foto de tu identificación");  
    }else if(empresa_id == "" || empresa_id == undefined) {
      mostrarMensaje("Debes seleccionar una empresa");
    } else {
      const createGuia = async (dataForm) => {
        try {
          const res = await clienteAxios({
            method: "post",
            url: "/admin/guia/crear",
            data: dataForm,
            headers: { "Content-Type": "multipart/form-data" },
          });


          console.log(res);
          navigate("/guias");
          
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.response.data.msg);
        }
      };
      if(user && user[0].isSuperAdmin == 1){
        createGuia({
          nombres,
          apellidos,
          correo,
          foto,
          identificacion,
          empresa_id: empresa_id.value,
        });
      }else{
        createGuia({
          nombres,
          apellidos,
          correo,
          foto,
          identificacion,
          empresa_id
        });
      }  
    }
  };

  //getEmpresas
  const getEmpresas = async () => {
    try {
      const res = await clienteAxios.get("/admin/empresa/empresas");
      console.log(res.data)
      setAllEmpresas(res.data);
    } catch (error) {
      console.log(error);
      mostrarMensaje(error.code);
    }
  };

  useEffect(() => {
    verifyingToken().then(() => {
      setLoading(false);
    });
    console.log(user);
    if(authStatus === false) {
      //navigate("/");
    }
    if(user && user[0].isSuperAdmin == 1){
      getEmpresas();
    }
    if(user && user[0].isAdmin == 1){
      setEmpresa(user[0].empresa_id);
    }  
  }, [authStatus]);

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
      {loading ? (
        <h4>Cargando...</h4>
      ) : (
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
        <Card title="Alta de Guias">
          <form onSubmit={(e) => sendData(e)}>
            <div className="space-y-4">
              {/*Nombres*/}
              <Textinput
                onChange={(e) => setNombres(e.target.value)}
                label="Nombres *"
                placeholder="Nombres"
                id="nombres"
                type="text"
              />

              {/*Apellidos*/}
              <Textinput
                onChange={(e) => setApellidos(e.target.value)}
                label="Apellidos *"
                placeholder="Apellidos"
                id="apellidos"
                type="text"
              />

              {/*Correo*/}
              <Textinput
                onChange={(e) => setCorreo(e.target.value)}
                label="Correo *"
                placeholder="Correo"
                id="correo"
                type="email"
              />

              {/*Foto*/}
              <Textinput
                onChange={(e) => setFoto(e.target.files[0])}
                label="Foto *"
                placeholder="Foto"
                id="foto"
                type="file"
              />

              {/*Identificacion*/}
              <Textinput
                onChange={(e) => setIdentificacion(e.target.files[0])}
                label="Identificación *"
                placeholder="Identificación"
                id="identificacion"
                type="file"
              />

              {/*Empresa id*/}
              {user && user[0].isSuperAdmin == 1 ?
              
              <Select
                //onChange={(e) => setEmpresa(e.target.value)}
                styles={customStyles}
                label="Empresa *"
                placeholder="Seleccione una empresa"
                id="empresa_id"
                options={allempresas.map((item) => ({
                  label: item.nombre,
                  value: item.id,
                }))}
                value={empresa_id}
                onChange={setEmpresa}
                isSearchable={true}
              ></Select>
              :
              <></>
              }

              <div className=" space-y-4">
                <p>* Campos requeridos</p>
                <Button text="Guardar" type="submit" className="btn-dark" />
              </div>
            </div>
          </form>
        </Card>
      </div>
      )}
    </>
  );
};

export default GuiasAlta;
