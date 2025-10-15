import React, { useState, useEffect, useContext } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "react-select";
import Button from "@/components/ui/Button";
import DatePicker, { DateObject } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import DateIcon from "react-multi-date-picker/components/icon";
import "react-multi-date-picker/styles/layouts/mobile.css";
import useDarkMode from "@/hooks/useDarkMode";

import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";
import { UserContext } from "../../pages/context/userContext";

const ToursAlta = () => {
  const [loading, setLoading] = useState(true);
  const [isDark] = useDarkMode();
  const [nombre, setNombre] = useState();
  const [titulo, setTitulo] = useState();
  const [image, setImage] = useState();
  const [precio_pp, setPrecio] = useState();
  const [duracion, setDuracion] = useState();
  const [descripcion_corta, setDescripcionCorta] = useState();
  const [descripcion, setDescripcion] = useState();
  const [conocer_mas, setConocermas] = useState();
  const [de_que_va, setDeQueVa] = useState();
  const [recomendaciones, setRecomendaciones] = useState();
  const [punto_encuentro, setPuntoEncuentro] = useState();
  const [max_pasajeros, setMaxPasajeros] = useState();
  const [min_pasajeros, setMinPasajeros] = useState();
  const [empresa_id, setEmpresa] = useState();
  const [categoria_id, setCategoria] = useState();
  const [estado, setEstado] = useState();
  const [ciudad, setCiudad] = useState();
  const [guias, setGuias] = useState();
  const [fechas_no_disponibles, setFechasNoDisponibles] = useState(
    new DateObject()
  );

  const [allempresas, setAllEmpresas] = useState([]);
  const [allcategorias, setAllCategorias] = useState([]);
  const [allguias, setAllGuias] = useState([]);
  const allstates = [
    { value: "Aguascalientes", label: "Aguascalientes" },
    { value: "Baja California", label: "Baja California" },
    { value: "Baja California Sur", label: "Baja California Sur" },
    { value: "Campeche", label: "Campeche" },
    { value: "Chiapas", label: "Chiapas" },
    { value: "Chihuahua", label: "Chihuahua" },
    { value: "Coahuila", label: "Coahuila" },
    { value: "Colima", label: "Colima" },
    { value: "CDMX", label: "CDMX" },
    { value: "Durango", label: "Durango" },
    { value: "México", label: "México" },
    { value: "Guanajuato", label: "Guanajuato" },
    { value: "Guerrero", label: "Guerrero" },
    { value: "Hidalgo", label: "Hidalgo" },
    { value: "Jalisco", label: "Jalisco" },
    { value: "Michoacán", label: "Michoacán" },
    { value: "Morelos", label: "Morelos" },
    { value: "Nayarit", label: "Nayarit" },
    { value: "Nuevo León", label: "Nuevo León" },
    { value: "Oaxaca", label: "Oaxaca" },
    { value: "Puebla", label: "Puebla" },
    { value: "Querétaro", label: "Querétaro" },
    { value: "Quintana Roo", label: "Quintana Roo" },
    { value: "San Luis Potosí", label: "San Luis Potosí" },
    { value: "Sinaloa", label: "Sinaloa" },
    { value: "Sonora", label: "Sonora" },
    { value: "Tabasco", label: "Tabasco" },
    { value: "Tamaulipas", label: "Tamaulipas" },
    { value: "Tlaxcala", label: "Tlaxcala" },
    { value: "Veracruz", label: "Veracruz" },
    { value: "Yucatán", label: "Yucatán" },
    { value: "Zacatecas", label: "Zacatecas" },
  ];

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

  const sendData = (event) => {
    event.preventDefault();

    //validamos campos
    if (nombre == "" || nombre == undefined) {
      mostrarMensaje("Debes escribir un nombre");
    } else if (estado == "" || estado == undefined) {
      mostrarMensaje("Debes seleccionar un estado");
    } else if (ciudad == "" || ciudad == undefined) {
      mostrarMensaje("Debes seleccionar una ciudad");
    } else if (titulo == "" || titulo == undefined) {
      mostrarMensaje("Debes escribir un título");
    } else if (image == "" || image == undefined) {
      mostrarMensaje("Debes escribir seleccionar un thumbnail");
    } else if (precio_pp == "" || precio_pp == undefined || precio_pp <= 0) {
      mostrarMensaje("Debes escribir un precio por persona");
    } else if (duracion == "" || duracion == undefined || duracion <= 0) {
      mostrarMensaje("Debes escribir la duración del Tour");
    } else if (descripcion_corta == "" || descripcion_corta == undefined) {
      mostrarMensaje("Debes escribir una descripción corta");
    } else if (descripcion == "" || descripcion == undefined) {
      mostrarMensaje("Debes escribir una descripción");
    } else if (conocer_mas == "" || conocer_mas == undefined) {
      mostrarMensaje("Debes escribir algo en conocer más");
    } else if (de_que_va == "" || de_que_va == undefined) {
      mostrarMensaje("Debes escribir algo en de que va");
    } else if (recomendaciones == "" || recomendaciones == undefined) {
      mostrarMensaje("Debes escribir las recomendaciones");
    } else if (punto_encuentro == "" || punto_encuentro == undefined) {
      mostrarMensaje("Debes escribir algo en punto de encuentro");
    } else if (max_pasajeros <= 0 || max_pasajeros == undefined) {
      mostrarMensaje("Debes escribir el número máximo de pasajeros");
    } else if (min_pasajeros <= 0 || min_pasajeros == undefined) {
      mostrarMensaje("Debes escribir el número mínimo de pasajeros");
    } else if (empresa_id == "" || empresa_id == undefined) {
      mostrarMensaje("Debes seleccionar una empresa");
    } else if (categoria_id == "" || categoria_id == undefined) {
      mostrarMensaje("Debes seleccionar una categoría");
    } else if (guias == "" || guias == undefined) {
      mostrarMensaje("Debes seleccionar al menos un guía");
    } else {
      const createTour = async () => {
        let listaGuias = [];
        guias.forEach((item) => {
          listaGuias.push(item);
        });

        let listaFechasNoDisponibles = [];
        if (fechas_no_disponibles.length > 0) {
          fechas_no_disponibles.forEach((fecha) => {
            listaFechasNoDisponibles.push(
              fecha.day + "-" + fecha.month.number + "-" + fecha.year
            );
          });
        }

        if (user && user[0].isSuperAdmin == 1) {
          const datos = {
            nombre,
            titulo,
            image,
            precio_pp,
            duracion,
            descripcion_corta,
            descripcion,
            conocer_mas,
            de_que_va,
            recomendaciones,
            punto_encuentro,
            max_pasajeros,
            min_pasajeros,
            empresa_id: empresa_id.value,
            categoria_id: categoria_id.value,
            estado: estado.value,
            ciudad: ciudad,
            guias: listaGuias,
            fechas_no_disponibles: listaFechasNoDisponibles,
          };
          //console.log(datos);
          try {
            const res = await clienteAxios({
              method: "post",
              url: "/admin/tour/crear",
              data: datos,
              headers: { "Content-Type": "multipart/form-data" },
            });

            console.log(res);
            navigate("/tours");
          } catch (error) {
            console.log(error);
            mostrarMensaje(error.code);
          }
        } else {
          const datos = {
            nombre,
            titulo,
            image,
            precio_pp,
            duracion,
            descripcion_corta,
            descripcion,
            conocer_mas,
            de_que_va,
            recomendaciones,
            punto_encuentro,
            max_pasajeros,
            min_pasajeros,
            empresa_id,
            categoria_id: categoria_id.value,
            estado: estado.value,
            ciudad: ciudad,
            guias: listaGuias,
            fechas_no_disponibles: listaFechasNoDisponibles,
          };
          //console.log(datos);
          try {
            const res = await clienteAxios({
              method: "post",
              url: "/admin/tour/crear",
              data: datos,
              headers: { "Content-Type": "multipart/form-data" },
            });

            console.log(res);
            navigate("/tours");
          } catch (error) {
            console.log(error);
            mostrarMensaje(error.code);
          }
        }
      };
      createTour();
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

  //getCategorias
  const getCategorias = async () => {
    try {
      const res = await clienteAxios.get("/admin/categoria/catregorias");
      console.log(res.data);
      setAllCategorias(res.data);
    } catch (error) {
      console.log(error);
      mostrarMensaje(error.code);
    }
  };

  //getGuias
  const getGuias = async () => {
    if (user && user[0].isSuperAdmin == 1) {
      try {
        const res = await clienteAxios.get("/admin/guia/guias");
        console.log(res.data);
        setAllGuias(res.data);
      } catch (error) {
        console.log(error);
        mostrarMensaje(error.code);
      }
    } else {
      try {
        const res = await clienteAxios.get(
          `/admin/guia/obtenerByEmpresa/${user[0].empresa_id}`
        );
        console.log(res.data);
        setAllGuias(res.data);
      } catch (error) {
        console.log(error);
        mostrarMensaje(error.code);
      }
    }
  };

  useEffect(() => {
    verifyingToken().then(() => {
      setLoading(false);
    });
    console.log(user);
    if (authStatus === false) {
      //navigate("/");
    }
    if (user && user[0].isSuperAdmin == 1) {
      getEmpresas();
    }
    if (user && user[0].isAdmin == 1) {
      setEmpresa(user[0].empresa_id);
    }
    getCategorias();
    getGuias();
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
          <Card title="Alta de Visitas">
            <form onSubmit={(e) => sendData(e)}>
              <div className="space-y-4">
                {/*Nombre*/}
                <Textinput
                  onChange={(e) => setNombre(e.target.value)}
                  label="Nombre *"
                  placeholder="Nombre"
                  id="nombre"
                  type="text"
                />

                {/*estado*/}
                <Select
                  styles={customStyles}
                  label="Estado *"
                  placeholder="Seleccione un estado"
                  id="estado"
                  options={allstates}
                  value={estado}
                  onChange={setEstado}
                  isSearchable={true}
                ></Select>

                {/*ciudad*/}
                <Textinput
                  onChange={(e) => setCiudad(e.target.value)}
                  label="Ciudad *"
                  placeholder="Ciudad"
                  id="ciudad"
                  type="text"
                />


                {/*Titulo*/}
                <Textinput
                  onChange={(e) => setTitulo(e.target.value)}
                  label="Título *"
                  placeholder="Título"
                  id="titulo"
                  type="text"
                />

                {/*thumb*/}
                <Textinput
                  onChange={(e) => setImage(e.target.files[0])}
                  label="Thumbnail *"
                  placeholder="Thumbnail"
                  id="image"
                  type="file"
                />

                {/*precio*/}
                <Textinput
                  onChange={(e) => setPrecio(e.target.value)}
                  label="Precio *"
                  placeholder="Precio"
                  id="precio_pp"
                  type="number"
                  step="any"
                />

                {/*duracion*/}
                <Textinput
                  onChange={(e) => setDuracion(e.target.value)}
                  label="Duración en minutos *"
                  placeholder="Duración en minutos"
                  id="duracion"
                  type="number"
                />

                {/*Descripcion corta*/}
                <Textarea
                  onChange={(e) => setDescripcionCorta(e.target.value)}
                  label="Descripción corta *"
                  placeholder="Descripción corta"
                  id="descripcion_corta"
                  type="text"
                />

                {/*Descripcion*/}
                <Textarea
                  onChange={(e) => setDescripcion(e.target.value)}
                  label="Descripción *"
                  placeholder="Descripción"
                  id="descripcion"
                  type="text"
                />

                {/*Conocer mas*/}
                <Textarea
                  onChange={(e) => setConocermas(e.target.value)}
                  label="Conocer más *"
                  placeholder="Conocer más"
                  id="conocer_mas"
                  type="text"
                />

                {/*De que va*/}
                <Textarea
                  onChange={(e) => setDeQueVa(e.target.value)}
                  label="De que va *"
                  placeholder="De que va"
                  id="de_que_va"
                  type="text"
                />

                {/*recomendaciones*/}
                <Textarea
                  onChange={(e) => setRecomendaciones(e.target.value)}
                  label="Recomendaciones *"
                  placeholder="Recomendaciones"
                  id="recomendaciones"
                  type="text"
                />

                {/*Punto encuentro*/}
                <Textinput
                  onChange={(e) => setPuntoEncuentro(e.target.value)}
                  label="Punto de encuentro *"
                  placeholder="Punto de encuentro"
                  id="punto_encuentro"
                  type="text"
                />

                {/*max_pasajeros*/}
                <Textinput
                  onChange={(e) => setMaxPasajeros(e.target.value)}
                  label="Número máximo de pasajeros *"
                  placeholder="Número máximo de pasajeros"
                  type="number"
                  defaultValue={max_pasajeros}
                />

                {/*min_pasajeros*/}
                <Textinput
                  onChange={(e) => setMinPasajeros(e.target.value)}
                  label="Número mínimo de pasajeros *"
                  placeholder="Número mínimo de pasajeros"
                  type="number"
                  defaultValue={min_pasajeros}
                />

                {/*Fechas no disponibles*/}
                <label className="block capitalize form-label  ">
                  Fechas no disponibles{" "}
                </label>

                <DatePicker
                  onChange={setFechasNoDisponibles}
                  className="rmdp-mobile"
                  render={<DateIcon />}
                  mobileLabels={{ OK: "Accept", CANCEL: "Close" }}
                  multiple
                  plugins={[<DatePanel />]}
                />

                {/*Empresa id*/}
                {user && user[0].isSuperAdmin == 1 ? (
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
                ) : (
                  <></>
                )}

                {/*Categoria id*/}
                <Select
                  //onChange={(e) => setCategoria(e.target.value)}
                  styles={customStyles}
                  label="Categoría *"
                  placeholder="Seleccione una categoría"
                  id="categoria_id"
                  options={allcategorias.map((item) => ({
                    label: item.nombre,
                    value: item.id,
                  }))}
                  value={categoria_id}
                  onChange={setCategoria}
                  isSearchable={true}
                ></Select>

                {/*guias*/}
                <Select
                  //onChange={(e) => setGuias(e.target.value)}
                  styles={customStyles}
                  label="Guías *"
                  placeholder="Seleccione los guías"
                  id="guias"
                  options={allguias.map((item) => ({
                    label: item.nombres + " " + item.apellidos,
                    value: item.id,
                  }))}
                  value={guias}
                  onChange={setGuias}
                  isMulti
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
      )}
    </>
  );
};

export default ToursAlta;
