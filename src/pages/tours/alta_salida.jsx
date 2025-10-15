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
import { UserContext } from "../context/userContext";

const ToursAltaSalida = () => {
  const [loading, setLoading] = useState(true);
  const [isDark] = useDarkMode();
  const [dia, setDia] = useState();
  
  const [hora_salida, setSalida] = useState();
  const [hora_regreso, setRegreso] = useState();

  const diasSemana = [
    { value: 'Lunes', label: 'Lunes' },
    { value: 'Martes', label: 'Martes' },
    { value: 'Miercoles', label: 'Miercoles' },
    { value: 'Jueves', label: 'Jueves' },
    { value: 'Viernes', label: 'Viernes' },
    { value: 'Sabado', label: 'Sabado' },
    { value: 'Domingo', label: 'Domingo' },
  ];

  const [duracion, setDuracion] = useState();

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

  //info tour
  const tour_id = localStorage.getItem("SalidasTour");

  const getTour = async () => {
    try {
      const res = await clienteAxios.get("/admin/tour/obtener/" + tour_id);
      setDuracion(res.data.tour[0].duracion);
    } catch (error) {
      console.log(error);
      mostrarMensaje(error.code);
    }
  };


  useEffect(() => {
    verifyingToken().then(() => {
      setLoading(false);
    });
    if(authStatus === false) {
      //navigate("/auth/login");
    }
    getTour();
  }, [authStatus]);


  const sendData = (event) => {
    event.preventDefault();


    //validamos campos
    if(dia == "" || dia == undefined) {
      mostrarMensaje("Debes seleccionar un día");
    }else if(hora_salida == "" || hora_salida == undefined) {
      mostrarMensaje("Debes seleccionar la hora de salida");
    }else if(hora_regreso == "" || hora_regreso == undefined) {
      mostrarMensaje("Debes seleccionar la hora de regreso");
    } else {
      const altaSalida = async () => {
        try {
          const res = await clienteAxios({
            method: "post",
            url: "/admin/fecha-tour/crear",
            data: {
              dia:dia.value,
              hora_salida,
              hora_regreso,
              tour_id
            },
          });
          console.log(res);
          navigate("/tours/salidas");
        } catch (error) {
          console.log(error);
          mostrarMensaje(error.response.data.msg);
        }
      };
      altaSalida();
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
        <Card title="Alta Salida">
          <form onSubmit={(e) => sendData(e)}>
            <div className="space-y-4">
              
              {/*Dia*/}
              <Select
                styles={customStyles}
                label="Día *"
                placeholder="Seleccione una día"
                id="dia"
                options={diasSemana}
                value={dia}
                onChange={setDia}
                isSearchable={true}
              ></Select>


              {/*Salida*/}
              <Textinput
                onChange={(e) => {
                  setSalida(e.target.value);
                  // La duración ahora está en minutos
                  const horaSalida = e.target.value;
                  const comboHoraSalida = horaSalida.split(":");
                  let horaRegreso = "";
                  const salidaMinutos = parseInt(comboHoraSalida[0]) * 60 + parseInt(comboHoraSalida[1]);
                  const regresoMinutos = salidaMinutos + parseInt(duracion);
                  // Ajustar si pasa de 24 horas
                  const regresoHoras = Math.floor((regresoMinutos % 1440) / 60); // 1440 minutos en 24 horas
                  const regresoMins = regresoMinutos % 60;
                  horaRegreso = ("0" + regresoHoras).slice(-2) + ":" + ("0" + regresoMins).slice(-2);
                  setRegreso(horaRegreso);
                }}
                label="Hora de Salida *"
                placeholder="Hora de Salida"
                id="salida"
                type="time"
                defaultValue={hora_salida}
              />

              {/*Regreso*/}
              <Textinput
                //onChange={(e) => setRegreso(e.target.value)}
                label="Hora de Regreso"
                placeholder="Hora de Regreso"
                id="regreso"
                type="time"
                defaultValue={hora_regreso}
                disabled={true}
              />

              

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

export default ToursAltaSalida;
