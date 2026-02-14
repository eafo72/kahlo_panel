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

const GuiasEditar = () => {
  const [loading, setLoading] = useState(true);
  const [isDark] = useDarkMode();
  const [nombres, setNombres] = useState();
  const [apellidos, setApellidos] = useState();
  const [correo, setCorreo] = useState();
  const [password, setPassword] = useState();
  const [foto, setFoto] = useState();
  const [cargo, setCargo] = useState();
  const [area, setArea] = useState();
  const [nss, setNss] = useState();

  const [fotoOld, setFotoOld] = useState();
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

  const userCtx = useContext(UserContext);
  const { user, authStatus, verifyingToken } = userCtx;

  const id = localStorage.getItem("EditGuia");

  //getguia
  const getGuia = async () => {
    try {
      const res = await clienteAxios.get("/admin/guia/obtener/" + id);
      setNombres(res.data[0].nombres);
      setApellidos(res.data[0].apellidos);
      setCorreo(res.data[0].correo);
      setFotoOld(res.data[0].foto);
      setCargo(res.data[0].cargo);
      setArea(res.data[0].area);
      setNss(res.data[0].nss);

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
    verifyingToken().then(() => {
      setLoading(false);
    });
    if (authStatus === false) {
      //navigate("/");
    }
    getGuia();
    if (user && user[0].isSuperAdmin == 1) {
      getEmpresas();
    }
  }, [authStatus]);




  const sendData = (event) => {
    event.preventDefault();

    //validamos campos
    if (nombres == "" || nombres == undefined) {
      mostrarMensaje("Debes escribir al menos un nombre");
    } else if (apellidos == "" || apellidos == undefined) {
      mostrarMensaje("Debes escribir al menos un apellido");
    } else if (correo == "" || correo == undefined) {
      mostrarMensaje("Debes escribir un correo");
    } else if (cargo == "" || cargo == undefined) {
      mostrarMensaje("Debes escribir el cargo");
    } else if (area == "" || area == undefined) {
      mostrarMensaje("Debes escribir el área");
    } else if (nss == "" || nss == undefined) {
      mostrarMensaje("Debes escribir el NSS");
    } else if (empresa_id == "" || empresa_id == undefined) {
      mostrarMensaje("Debes seleccionar una empresa");
    } else {
      const editGuia = async () => {
        try {
          const res = await clienteAxios({
            method: "put",
            url: "/admin/guia/set",
            data: {
              id,
              nombres,
              apellidos,
              correo,
              password,
              foto,
              empresa_id: empresa_id.value,
              cargo,
              area,
              nss
            },
            headers: { "Content-Type": "multipart/form-data" },
          });


          console.log(res);
          navigate("/guias");
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.response.data.msg);
        }
      };
      editGuia();
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
      {loading ? (
        <h4>Cargando...</h4>
      ) : (
        <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
          <Card title="Editar Colaboradores">
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

                {/*Correo*/}
                <Textinput
                  onChange={(e) => setCorreo(e.target.value)}
                  label="Correo *"
                  placeholder="Correo"
                  id="correo"
                  type="email"
                  defaultValue={correo}
                />

                {/*Cargo*/}
                <Textinput
                  onChange={(e) => setCargo(e.target.value)}
                  label="Cargo *"
                  placeholder="Cargo"
                  id="cargo"
                  type="text"
                  defaultValue={cargo}
                />

                {/*Área*/}
                <Textinput
                  onChange={(e) => setArea(e.target.value)}
                  label="Área *"
                  placeholder="Área"
                  id="area"
                  type="text"
                  defaultValue={area}
                />

                {/*NSS*/}
                <Textinput
                  onChange={(e) => setNss(e.target.value)}
                  label="NSS *"
                  placeholder="NSS"
                  id="nss"
                  type="text"
                  defaultValue={nss}
                />

                {/*Foto*/}
                <Textinput
                  onChange={(e) => setFoto(e.target.files[0])}
                  label="Foto "
                  placeholder="Foto"
                  id="foto"
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

                {/*Password*/}
                <Textinput
                  onChange={(e) => setPassword(e.target.value)}
                  label="Contraseña"
                  placeholder="Contraseña"
                  id="passw"
                  type="password"
                />


                <div className=" space-y-4">
                  <p>* Campos requeridos</p>
                  <Button text="Guardar" type="submit" className="btn-dark" />
                </div>
              </div>
            </form>
          </Card>

          <Card title="Documentos Actuales">
            <p >Foto:</p>
            <img src={fotoOld} className="w-full h-full" />
          </Card>
        </div>
      )}
    </>
  );
};

export default GuiasEditar;
