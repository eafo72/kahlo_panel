import React, { useState, useEffect, useContext } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "react-select";
import Button from "@/components/ui/Button";
import useDarkMode from "@/hooks/useDarkMode";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { compose, withProps } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";
import { UserContext } from "../context/userContext";

const ToursAltaRuta = () => {
  
  const MyMapComponent = compose(
    withProps({
      googleMapURL:
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyBHRMZzLxhg-mndWI1HkA5Uoos3fud9TZA&v=3.exp&libraries=geometry,drawing,places",
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: `400px` }} />,
      mapElement: <div style={{ height: `100%` }} />,
    }),
    withScriptjs,
    withGoogleMap
  )((props) => (
    <GoogleMap
      onClick={(ev) => {
        console.log("latitide = ", ev.latLng.lat());
        console.log("longitude = ", ev.latLng.lng());
        setCoordenadas(ev.latLng.lat()+","+ev.latLng.lng());
        toast.info("Coordenadas capturadas.", {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "dark",
        });
      }}
      defaultZoom={5}
      defaultCenter={{ lat: 19.3909832, lng: -99.3084213 }}
    ></GoogleMap>
  ));

  const [loading, setLoading] = useState(true);
  const [isDark] = useDarkMode();

  const [escala, setEscala] = useState();
  const [coordenadas, setCoordenadas] = useState();
  const [tipo, setTipo] = useState();

  const tiposMarkers = [
    { value: "inicio", label: "inicio" },
    { value: "fin", label: "fin" },
    { value: "escala", label: "escala" },
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

  useEffect(() => {
    verifyingToken().then(() => {
      setLoading(false);
    });
    if (authStatus === false) {
      //navigate("/");
    }
  }, [authStatus]);

  const sendData = (event) => {
    event.preventDefault();

    const tour_id = localStorage.getItem("RutaTour");

    //validamos campos
    if (escala == "" || escala == undefined) {
      mostrarMensaje("Debes escribir el nombre de la escala");
    } else if (tipo == "" || tipo == undefined) {
      mostrarMensaje("Debes seleccionar un tipo");
    } else if (coordenadas == "" || coordenadas == undefined) {
      mostrarMensaje("Debes escribir las coordenadas");
    } else {
      const altaRuta = async () => {
        try {
          const res = await clienteAxios({
            method: "post",
            url: "/admin/rutas-tour/crear",
            data: {
              escala,
              coordenadas,
              tour_id,
              tipo: tipo.value,
            },
          });
          console.log(res);
          navigate("/tours/rutas");
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.response.data.msg);
        }
      };
      altaRuta();
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
          <Card title="Alta de Ruta">
            <form onSubmit={(e) => sendData(e)}>
              <div className="space-y-4">
                {/*Escala*/}
                <Textinput
                  onChange={(e) => setEscala(e.target.value)}
                  label="Escala *"
                  placeholder="Escala"
                  id="escala"
                  type="text"
                  defaultValue={escala}
                />

                {/*Tipo*/}
                <Select
                  styles={customStyles}
                  label="Tipo *"
                  placeholder="Seleccione un tipo"
                  id="tipo"
                  options={tiposMarkers}
                  value={tipo}
                  onChange={setTipo}
                  isSearchable={true}
                ></Select>

                {/*Coordenadas*/}
                <Textinput
                  onChange={(e) => setCoordenadas(e.target.value)}
                  label="Coordenadas *"
                  placeholder="Coordenadas"
                  id="coordenadas"
                  type="text"
                  defaultValue={coordenadas}
                />

                <div className=" space-y-4">
                  <p>* Campos requeridos</p>
                  <Button text="Guardar" type="submit" className="btn-dark" />
                </div>
              </div>
            </form>
          </Card>
          <Card title="Mapa">
            <p style={{ paddingBottom: "20px" }}>
              Para obtener las coordenadas da click en el punto deseado del mapa
            </p>
            <MyMapComponent isMarkerShown={false} />
          </Card>
        </div>
      )}
    </>
  );
};

export default ToursAltaRuta;
