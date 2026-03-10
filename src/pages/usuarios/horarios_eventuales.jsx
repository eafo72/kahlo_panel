import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import clienteAxios from "@/configs/axios";
import Swal from 'sweetalert2';

const HorariosEventuales = () => {
  const id = localStorage.getItem("HorariosUser");
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);

  // Función helper para aplicar estilos a SweetAlert2
  const applySweetAlertStyles = () => {
    // Agregar estilos CSS para forzar la visibilidad de los botones
    const style = document.createElement('style');
    style.textContent = `
        .swal2-popup .swal2-actions {
            display: flex !important;
            justify-content: center !important;
            margin-top: 1em !important;
        }
        .swal2-popup .swal2-confirm:not([style*="display: none"]):not(.swal2-hidden) {
            background-color: #ef4444 !important;
            color: white !important;
            border: none !important;
            padding: 0.6em 1.5em !important;
            font-size: 1em !important;
            font-weight: 500 !important;
            border-radius: 0.25em !important;
            margin: 0 0.5em !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: inline-block !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }
        .swal2-popup .swal2-cancel:not([style*="display: none"]):not(.swal2-hidden) {
            background-color: #6b7280 !important;
            color: white !important;
            border: none !important;
            padding: 0.6em 1.5em !important;
            font-size: 1em !important;
            font-weight: 500 !important;
            border-radius: 0.25em !important;
            margin: 0 0.5em !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: inline-block !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }
        .swal2-popup .swal2-confirm:not([style*="display: none"]):not(.swal2-hidden):hover {
            background-color: #dc2626 !important;
            opacity: 0.9 !important;
        }
        .swal2-popup .swal2-cancel:not([style*="display: none"]):not(.swal2-hidden):hover {
            background-color: #4b5563 !important;
            opacity: 0.9 !important;
        }
        .swal2-popup .swal2-confirm[style*="display: none"],
        .swal2-popup .swal2-cancel[style*="display: none"],
        .swal2-popup .swal2-confirm.swal2-hidden,
        .swal2-popup .swal2-cancel.swal2-hidden {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
    `;
    document.head.appendChild(style);
  };

  const [formData, setFormData] = useState({
    fecha_especifica: '',
    hora_entrada: '',
    hora_salida: ''
  });

  const getHorariosEventuales = async () => {
    try {
      const res = await clienteAxios.get(`/venta/horarios-usuario-eventual/${id}`);
      console.log(res.data);
      setHorarios(res.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Error obteniendo los horarios eventuales del usuario");
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    try {
      const res = await clienteAxios.get(`/usuario/obtener/${id}`);
      console.log(res.data[0]);
      setUserData(res.data[0]);
    } catch (error) {
      console.log(error);
      toast.error("Error obteniendo los datos del usuario");
    }
  };

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSend = {
        id_usuario: parseInt(id),
        fecha_especifica: formData.fecha_especifica,
        hora_entrada: formData.hora_entrada,
        hora_salida: formData.hora_salida
      };

      const res = await clienteAxios.post('/venta/horarios-usuario-eventual-crear', dataToSend);

      toast.success("Horario eventual creado exitosamente");
      setShowForm(false);
      setFormData({
        fecha_especifica: '',
        hora_entrada: '',
        hora_salida: ''
      });
      getHorariosEventuales(); // Refresh the list
      
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error creando el horario eventual");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (horarioId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas eliminar este horario eventual?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      didOpen: () => {
        applySweetAlertStyles();
      }
    });

    if (result.isConfirmed) {
      try {
        await clienteAxios.delete(`/venta/horarios-eventuales-eliminar/${horarioId}`);
        toast.success("Horario eventual eliminado exitosamente");
        getHorariosEventuales(); // Refresh the list
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Error eliminando el horario eventual");
      }
    }
  };

  useEffect(() => {
    if (id) {
      getHorariosEventuales();
      getUserData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando horarios eventuales...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-1 grid-cols-1 gap-5">
        <Card title={`Horarios Eventuales - ${userData?.nombres} ${userData?.apellidos}`}>
          <div className="mb-6">
            <Button 
              text="Agregar Horario Eventual" 
              className="btn-dark"
              onClick={() => setShowForm(!showForm)}
            />
          </div>

          {showForm && (
            <Card title="Nuevo Horario Eventual" className="mb-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Específica *
                    </label>
                    <Textinput
                      type="date"
                      value={formData.fecha_especifica}
                      onChange={(e) => handleInputChange('fecha_especifica', e.target.value)}
                      placeholder="Fecha específica"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Entrada *
                    </label>
                    <Textinput
                      type="time"
                      value={formData.hora_entrada}
                      onChange={(e) => handleInputChange('hora_entrada', e.target.value)}
                      placeholder="Hora de entrada"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Salida *
                    </label>
                    <Textinput
                      type="time"
                      value={formData.hora_salida}
                      onChange={(e) => handleInputChange('hora_salida', e.target.value)}
                      placeholder="Hora de salida"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button 
                    text="Guardar Horario" 
                    type="submit" 
                    className="btn-dark"
                    disabled={submitting}
                  />
                  <Button 
                    text="Cancelar" 
                    className="btn-light"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        fecha_especifica: '',
                        hora_entrada: '',
                        hora_salida: ''
                      });
                    }}
                  />
                </div>
              </form>
            </Card>
          )}

          <div className="space-y-4">
            {horarios.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay horarios eventuales registrados</p>
              </div>
            ) : (
              horarios.map((horario, index) => (
                <div key={horario.id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <div>
                        <span className="text-sm text-gray-500">Fecha:</span>
                        <p className="font-medium">{horario.fecha_formateada}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Entrada:</span>
                        <p className="font-medium">{horario.hora_entrada}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Salida:</span>
                        <p className="font-medium">{horario.hora_salida}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button 
                        text="Eliminar" 
                        className="btn-danger btn-sm"
                        onClick={() => handleDelete(horario.id)}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            <Button 
              text="Volver a Usuarios" 
              className="btn-light"
              onClick={() => navigate('/usuarios')}
            />
          </div>
        </Card>
      </div>
    </>
  );
};

export default HorariosEventuales;
