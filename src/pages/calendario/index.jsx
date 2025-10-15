import React, { useState, useEffect, useContext } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";
import { UserContext } from "../context/userContext";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import interactionPlugin from "@fullcalendar/interaction";

import "./styles.css";

const Calendario = () => {
  const userCtx = useContext(UserContext);
  const { user, authStatus, verifyingToken } = userCtx;

  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(false);
  
  //info modal
  const [nombreTour, setnombreTour] = useState();
  const [fechaIda, setfechaIda] = useState();
  const [fechaReg, setfechaReg] = useState();
  const [statusViaje, setstatusViaje] = useState();
  const [nombreGuia, setnombreGuia] = useState();
  const [lugaresDisp, setlugaresDisp] = useState();


  const [eventos, setEventos] = useState([]);

  // a custom render function
  function renderEventContent(eventInfo) {
    return (
      <>
        <b>{eventInfo.event.extendedProps.hora} </b>
        <i>- {eventInfo.event.title}</i>
      </>
    );
  }

  function handleDateClick(info) {
    setnombreTour("Tour: "+info.event.title);
    setfechaIda("Salida: "+info.event.extendedProps.fechaIda);
    setfechaReg("Regreso: "+info.event.extendedProps.fechaReg);
    setstatusViaje("Status: "+info.event.extendedProps.statusViaje);
    setnombreGuia("Guía: "+info.event.extendedProps.nombreGuia);
    setlugaresDisp("Lugares disponibles: "+info.event.extendedProps.lugaresDisp);
   
    setActiveModal(true);
  }

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

  //getEventos
  const getEventos = async (tipoUsuario, idempresa) => {
    //console.log("TipoUsuario:"+tipoUsuario);
    //tipoUsuario == 1 SuperAdmin
    //tipoUsuario == 2 Administrador

    if (parseInt(tipoUsuario) == 1) {
      try {
        const res = await clienteAxios.get("/admin/viaje-tour/calendario");
        console.log(res.data);

        let array = [];
        for (let i = 0; i < res.data.length; i++) {
          //console.log(res.data[i]["fecha_ida"].substr(11,5));
          array.push({
            title: res.data[i]["nombre"],
            date:
              res.data[i]["fecha_ida"].substr(0, 10) +
              " " +
              res.data[i]["fecha_ida"].substr(11, 8),
            extendedProps: {
              hora: res.data[i]["fecha_ida"].substr(11, 5),
              fechaIda:res.data[i]["fecha_ida"].substr(0,10)+" "+res.data[i]["fecha_ida"].substr(11, 8),
              fechaReg:res.data[i]["fecha_regreso"].substr(0,10)+" "+res.data[i]["fecha_regreso"].substr(11, 8),
              statusViaje:res.data[i]["status_viaje"],
              nombreGuia:res.data[i]["nombres"]+" "+res.data[i]["apellidos"],
              lugaresDisp:res.data[i]["lugares_disp"]
            },
          });
        }
        setEventos(array);
      } catch (error) {
        console.log(error);
        mostrarMensaje(error.code);
      }
    } else {
      try {
        const res = await clienteAxios.get(`/admin/viaje-tour/calendariobyempresa/${idempresa}`);
        console.log(res.data);

        let array = [];
        for (let i = 0; i < res.data.length; i++) {
          //console.log(res.data[i]["fecha_ida"].substr(11,5));
          array.push({
            title: res.data[i]["nombre"],
            date:
              res.data[i]["fecha_ida"].substr(0, 10) +
              " " +
              res.data[i]["fecha_ida"].substr(11, 8),
            extendedProps: {
              hora: res.data[i]["fecha_ida"].substr(11, 5),
              fechaIda:res.data[i]["fecha_ida"].substr(0,10)+" "+res.data[i]["fecha_ida"].substr(11, 8),
              fechaReg:res.data[i]["fecha_regreso"].substr(0,10)+" "+res.data[i]["fecha_regreso"].substr(11, 8),
              statusViaje:res.data[i]["status_viaje"],
              nombreGuia:res.data[i]["nombres"]+" "+res.data[i]["apellidos"],
              lugaresDisp:res.data[i]["lugares_disp"]
            },
          });
        }
        setEventos(array);
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
    if (authStatus === false) {
      //navigate("/");
    }
    if (user && user[0].isSuperAdmin == 1) {
      getEventos(1, user[0].empresa_id);
    }
    if (user && user[0].isAdmin == 1) {
      getEventos(2, user[0].empresa_id);
    }
  }, [authStatus]);

  return (
    <div>
      <ToastContainer />
      <Card title="Calendario">
        <FullCalendar
          locale={esLocale}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          events={eventos}
          eventContent={renderEventContent}
          eventClick={handleDateClick}
        />
      </Card>
      <Modal
        activeModal={activeModal}
        onClose={() => setActiveModal(false)}
        title="Información"
        footer={
          <Button
            text="Close"
            btnClass="btn-primary"
            onClick={() => setActiveModal(false)}
          />
        }
      >
        
        <h4 className="font-medium mb-3 text-slate-900 ">{nombreTour}</h4>
        <h6 className="font-medium text-lg mb-3 text-slate-900 ">{fechaIda}</h6>
        <h6 className="font-medium text-lg mb-3 text-slate-900 ">{fechaReg}</h6>
        <h6 className="font-medium text-lg mb-3 text-slate-900 ">{statusViaje}</h6>
        <h6 className="font-medium text-lg mb-3 text-slate-900 ">{nombreGuia}</h6>
        <h6 className="font-medium text-lg mb-3 text-slate-900 ">{lugaresDisp}</h6>
        
      </Modal>
    </div>
  );
};

export default Calendario;
