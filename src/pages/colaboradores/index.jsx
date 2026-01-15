import React, { useState, useEffect, useContext } from "react";
import Card from "@/components/ui/Card";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";
import { Chart } from "react-google-charts";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../../configs/axios";
import { UserContext } from "../context/userContext";

const ColaboradorQR = () => {
  const userCtx = useContext(UserContext);
  const { user, verifyingToken } = userCtx;

  const [loading, setLoading] = useState(true);
  const [collaborator, setCollaborator] = useState(null);
  const navigate = useNavigate();

  // Get the first collaborator from the array
  const getFirstCollaborator = (collabData) => {
    if (Array.isArray(collabData) && collabData.length > 0) {
      return collabData[0];
    }
    return collabData; // in case it's not an array
  };

  // Normalize text by removing accents and converting to uppercase
  const normalize = (text) =>
    String(text || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

  // Generate QR code value based on collaborator data
  const generateQRValue = (collabData) => {
    // Get the first collaborator if it's an array
    const collab = getFirstCollaborator(collabData);
    
    if (!collab) {
      return '';
    }
    
    const collabId = collab.id || '';
    if (!collabId) {
      return '';
    }
    
    // Normalize names and get first two letters
    const firstName = normalize(collab.nombres);
    const lastName = normalize(collab.apellidos);
    const firstNameCode = firstName.length >= 2 ? firstName.substring(0, 2) : 'XX';
    const lastNameCode = lastName.length >= 2 ? lastName.substring(0, 2) : 'XX';
    
    return `${collabId}${firstNameCode}${lastNameCode}-1-Z`;
  };

  // Get QR code value, returns null if user data isn't ready
  const qrValue = user ? generateQRValue(user) : null;

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
      //console.log("User data from context:", userCtx.user);
      setLoading(false);
    });


  }, []);

  return (
    <div>
      <ToastContainer />
      <div className="grid xl:grid-cols-1 grid-cols-1">
        <Card title="Código QR">
          <div className="p-4 bg-white rounded-2xl shadow-lg flex flex-col items-center">
            {loading ? (
              <p>Cargando información del colaborador...</p>
            ) : user && user.length > 0 ? (
              qrValue ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">
                    {user.nombre} {user.apellido}
                  </h3>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg mb-4 flex justify-center">
                    <QRCode 
                      value={qrValue}
                      size={200}
                      level="H"
                      className="mx-auto"
                    />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md text-sm font-mono break-all">
                    {qrValue}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p>No se pudo generar el código QR. Faltan datos del colaborador.</p>
                  <pre className="text-xs text-gray-500 mt-2">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )
            ) : (
              <p>No se encontró información del colaborador.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ColaboradorQR;
