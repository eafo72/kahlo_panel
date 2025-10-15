import React, { useState, useEffect, useContext } from "react";
import Card from "@/components/ui/Card";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { Chart } from "react-google-charts";

import { useNavigate } from "react-router-dom";

import clienteAxios from "../../configs/axios";
import { UserContext } from "../context/userContext";

const Dashboard = () => {
  const userCtx = useContext(UserContext);
  const { user, verifyingToken } = userCtx;

  const [loading, setLoading] = useState(true);



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





  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }

    verifyingToken().then(() => {
      setLoading(false);
    });


  }, []);

  return (
    <div>
      <ToastContainer />
      <div className="grid xl:grid-cols-1 grid-cols-1">
        <Card title="Dashboard Museo Casa Kahlo">
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            
            <iframe
              title="Dashboard Kahlo"
              className="w-full h-[700px] rounded-lg"
              src="https://lookerstudio.google.com/embed/reporting/81fd6e9b-24d5-47c8-a93b-4ab18694e6b4/page/mRNaF"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>

        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
