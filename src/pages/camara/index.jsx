import React, { useState, useEffect, useContext } from "react";
import Card from "@/components/ui/Card";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import { UserContext } from "../context/userContext";
import { socket } from "../../services/socket";

const Camara = () => {
  const userCtx = useContext(UserContext);
  const { user, verifyingToken } = userCtx;

  const [loading, setLoading] = useState(true);

  const [evento, setEvento] = useState({
    entrada: 0,
    salida: 0,
    aforoActual: 0,
    idCamara: "",
  });

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

  // -------------------------
  //   VERIFICAR LOGIN
  // -------------------------
  useEffect(() => {
    verifyingToken();
  }, []);

  // -------------------------
  //   SOCKET.IO LISTENER
  // -------------------------
  useEffect(() => {
    // escuchar evento desde backend
    socket.on("actualizacionAforo", (data) => {
      //console.log("Evento en tiempo real:", data);
      setEvento(data);
    });

    // cleanup (evita duplicar eventos)
    return () => {
      socket.off("actualizacionAforo");
    };
  }, []);

  return (
    <div>
      <ToastContainer />

      <div className="grid xl:grid-cols-1 grid-cols-1">
        <Card title="Monitor de Cámara">
          <div className="p-4 bg-white rounded-2xl shadow-lg">


            <div className="text-lg">
              <b>Entradas:</b> {evento.entrada || 0}
            </div>

            <div className="text-lg">
              <b>Salidas:</b> {evento.salida || 0}
            </div>

            <div className="text-lg">
              <b>Aforo Actual:</b> {(evento.entrada) - (evento.salida)}
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default Camara;

