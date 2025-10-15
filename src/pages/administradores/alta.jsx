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

const AdministradoresAlta = () => {
  const [isDark] = useDarkMode();
  const [nombres, setNombres] = useState();
  const [apellidos, setApellidos] = useState();
  const [correo, setCorreo] = useState();
  const [password, setPassword] = useState();
  const [telefono, setTelefono] = useState();
  const [empresa_id, setEmpresa] = useState();

  const [allempresas, setAllEmpresas] = useState([]);

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
    }else if(password == "" || password == undefined) {
      mostrarMensaje("Debes escribir una contraseña");    
    }else if(empresa_id == "" || empresa_id == undefined) {
      mostrarMensaje("Debes seleccionar una empresa");
    } else {
      const createAdmin = async (dataForm) => {
        try {
          const res = await clienteAxios.post("/admin/admin/crear", dataForm);
          console.log(res);
          navigate("/administradores");
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.response.data.msg);
        }
      };
      createAdmin({
        nombres,
        apellidos,
        correo,
        telefono,
        password,
        tipoAdmin: 1,
        isSuperAdmin: 2,
        empresa_id: empresa_id.value,
      });
    }
  };

  //getEmpresas
  const getEmpresas = async () => {
    try {
      const res = await clienteAxios.get("/admin/empresa/empresas");
      console.log(res.data);
      setAllEmpresas(res.data);
    } catch (error) {
      console.log(error);
      mostrarMensaje(error.code);
    }
  };

  useEffect(() => {
    getEmpresas();
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
        <Card title="Alta de Administradores">
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

              {/*telefono*/}
              <Textinput
                onChange={(e) => setTelefono(e.target.value)}
                label="Teléfono *"
                placeholder="Teléfono"
                id="telefono"
                type="tel"
              />

              {/*Password*/}
              <Textinput
                onChange={(e) => setPassword(e.target.value)}
                label="Contraseña *"
                placeholder="Contraseña"
                id="passw"
                type="password"
              />

              {/*Empresa id*/}
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

export default AdministradoresAlta;
