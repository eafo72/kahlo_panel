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

const AdministradoresEditar = () => {
  const [isDark] = useDarkMode();
  const [nombres, setNombres] = useState();
  const [apellidos, setApellidos] = useState();
  const [correo, setCorreo] = useState();
  const [password, setPassword] = useState();
  const [telefono, setTelefono] = useState();
  const [empresa_id, setEmpresa] = useState();

  const [allempresas, setAllEmpresas] = useState([]);

 

  const id = localStorage.getItem("EditAdministrador");

  const getAdmin = async () => {
    try {
      const res = await clienteAxios.get("/admin/admin/obtener/" + id);
      setNombres(res.data[0].nombres);
      setApellidos(res.data[0].apellidos);
      setCorreo(res.data[0].correo);
      setTelefono(res.data[0].telefono);
     
      setEmpresa({
        label: res.data[0].empresa,
        value: res.data[0].empresa_id,
      });


    } catch (error) {
      console.log(error);
      mostrarMensaje(error.code);
    }
  };

  //getempresas
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
    getAdmin();
    getEmpresas();
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
    }else if(empresa_id == "" || empresa_id == undefined) {
      mostrarMensaje("Debes seleccionar una empresa");
    } else {
      const editAdmin = async () => {
        try {
          const res = await clienteAxios.put("/admin/admin/set", {
            id,
            nombres,
            apellidos,
            correo,
            password,
            tipoAdmin:1,
            isSuperAdmin:2,
            telefono,
            empresa_id: empresa_id.value,
          });
          console.log(res);
          navigate("/administradores");
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.response.data.msg);
        }
      };
      editAdmin();
    }
  };

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
        <Card title="Editar Administradores">
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

              {/*Password*/}
              <Textinput
                onChange={(e) => setPassword(e.target.value)}
                label="Contraseña"
                placeholder="Contraseña"
                id="passw"
                type="password"
              />

              {/*Empresa id*/}
              <Select
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

export default AdministradoresEditar;
